import { InferenceClient } from '@huggingface/inference';

/**
 * Small instruct models that usually work on Hugging Face serverless inference (free tier with a token).
 * Avoid large models here unless you set HUGGINGFACE_MODEL — routing may send them to third-party providers
 * that do not match every task.
 */
const FALLBACK_MODELS = [
  'Qwen/Qwen2.5-1.5B-Instruct',
  'HuggingFaceTB/SmolLM2-1.7B-Instruct',
  'Qwen/Qwen2.5-0.5B-Instruct',
];

const DEFAULT_SYSTEM_PROMPT = `
You are an expert AI tutor.

- Explain concepts step-by-step
- Start simple, then go deeper
- Use examples when possible
- Be clear and concise
- If solving problems, show reasoning

If the user asks for JSON, return ONLY valid JSON without markdown.
`.trim();

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/** Prefer HF's own serverless stack. Set HUGGINGFACE_INFERENCE_PROVIDER=auto for full router. */
function chatProviderArgs(): { provider: 'hf-inference' } | Record<string, never> {
  const v = process.env.HUGGINGFACE_INFERENCE_PROVIDER?.trim().toLowerCase();
  if (v === 'auto') return {};
  return { provider: 'hf-inference' };
}

function hfAccessToken(): string {
  return (
    process.env.HF_TOKEN?.trim() ||
    process.env.HUGGINGFACE_API_KEY?.trim() ||
    ''
  );
}

function modelCandidates(): string[] {
  const configured = process.env.HUGGINGFACE_MODEL?.trim();
  if (configured) {
    return [configured, ...FALLBACK_MODELS.filter((m) => m !== configured)];
  }
  return [...FALLBACK_MODELS];
}

function assistantText(content: unknown): string | null {
  if (typeof content === 'string' && content.trim()) return content;

  if (Array.isArray(content)) {
    const parts = content
      .map((chunk) => {
        if (typeof chunk === 'object' && chunk !== null && 'text' in chunk) {
          const t = (chunk as { text?: unknown }).text;
          return typeof t === 'string' ? t : '';
        }
        return '';
      })
      .join('');
    if (parts.trim()) return parts;
  }

  return null;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLikelyModelLoading(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /loading|warmup|503|unavailable/i.test(msg);
}

function requestTimeoutMs(): number {
  const raw = process.env.HUGGINGFACE_REQUEST_TIMEOUT_MS?.trim();
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n >= 5000) return Math.floor(n);
  return 120_000;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms),
    ),
  ]);
}

export type HuggingFaceGenerateResult = {
  text: string | null;
  error?: string;
};

function noTokenError(): HuggingFaceGenerateResult {
  return {
    text: null,
    error:
      'No HF_TOKEN (or HUGGINGFACE_API_KEY) found. Add it to aiai/.env.local and restart the dev server.',
  };
}

/**
 * Core chat completion with an explicit messages array.
 * Use this when you need a custom system prompt (e.g. the AI tutor).
 */
export async function chatWithMessages(
  messages: ChatMessage[],
): Promise<HuggingFaceGenerateResult> {
  const token = hfAccessToken();
  if (!token) return noTokenError();

  const client = new InferenceClient(token);
  const models = modelCandidates();
  const timeoutMs = requestTimeoutMs();

  let lastError =
    'Every model failed or returned empty text. Try HUGGINGFACE_INFERENCE_PROVIDER=auto or a different HUGGINGFACE_MODEL.';

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const completion = await withTimeout(
          client.chatCompletion({
            model,
            ...chatProviderArgs(),
            messages,
            max_tokens: 1024,
            temperature: 0.4,
          }),
          timeoutMs,
        );

        const text = assistantText(completion.choices?.[0]?.message?.content);
        if (text) return { text };

        lastError = `Model "${model}" returned no assistant text. Try another HUGGINGFACE_MODEL.`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);

        if (isLikelyModelLoading(error) && attempt < 2) {
          await sleep(4000 * (attempt + 1));
          continue;
        }

        break;
      }
    }
  }

  return { text: null, error: lastError };
}

/**
 * Streaming chat completion with an explicit messages array.
 * Yields text delta chunks as they arrive from the model.
 * The caller is responsible for assembling the full response.
 *
 * @throws if no HF token is configured or all models fail to start streaming.
 */
export async function* streamChatWithMessages(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const token = hfAccessToken();
  if (!token) {
    throw new Error(
      'No HF_TOKEN (or HUGGINGFACE_API_KEY) found. Add it to .env.local and restart the dev server.',
    );
  }

  const client = new InferenceClient(token);
  const models = modelCandidates();

  let lastError = 'Every model failed to start streaming.';

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const stream = client.chatCompletionStream({
          model,
          ...chatProviderArgs(),
          messages,
          max_tokens: 1024,
          temperature: 0.4,
        });

        let yielded = false;
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) {
            yielded = true;
            yield delta;
          }
        }

        if (yielded) return;
        lastError = `Model "${model}" stream produced no content.`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);

        if (isLikelyModelLoading(error) && attempt < 1) {
          await sleep(4000);
          continue;
        }

        break;
      }
    }
  }

  throw new Error(lastError);
}

/**
 * Uses **chat completion only** (conversational task). Do not fall back to `textGeneration`:
 * some providers (e.g. featherless-ai) expose Mistral as conversational only, and text-generation
 * returns misleading "not supported for task text-generation" errors.
 */
export async function generateWithHuggingFace(
  prompt: string,
): Promise<HuggingFaceGenerateResult> {
  return chatWithMessages([
    { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);
}

export function getModelName(): string {
  const primary = process.env.HUGGINGFACE_MODEL?.trim() || FALLBACK_MODELS[0];
  return `huggingface:${primary}`;
}
