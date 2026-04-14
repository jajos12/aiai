import { InferenceClient } from '@huggingface/inference';

/**
 * Small instruct models that usually work on Hugging Face serverless inference (free tier with a token).
 * Avoid large models here unless you set HUGGINGFACE_MODEL — routing may send them to third-party providers
 * that do not match every task.
 */
const FALLBACK_MODELS = [
  'HuggingFaceTB/SmolLM2-360M-Instruct',
  'HuggingFaceTB/SmolLM2-1.7B-Instruct',
  'Qwen/Qwen2.5-0.5B-Instruct',
];

/** Prefer HF’s own serverless stack. Set HUGGINGFACE_INFERENCE_PROVIDER=auto for full router. */
function chatProviderArgs(): { provider: 'hf-inference' } | Record<string, never> {
  const v = process.env.HUGGINGFACE_INFERENCE_PROVIDER?.trim().toLowerCase();
  if (v === 'auto') return {};
  return { provider: 'hf-inference' };
}

const SYSTEM_PROMPT = `
You are an expert AI tutor.

- Explain concepts step-by-step
- Start simple, then go deeper
- Use examples when possible
- Be clear and concise
- If solving problems, show reasoning

If the user asks for JSON, return ONLY valid JSON without markdown.
`.trim();

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

/**
 * Uses **chat completion only** (conversational task). Do not fall back to `textGeneration`:
 * some providers (e.g. featherless-ai) expose Mistral as conversational only, and text-generation
 * returns misleading "not supported for task text-generation" errors.
 */
export async function generateWithHuggingFace(
  prompt: string,
): Promise<HuggingFaceGenerateResult> {
  const token = hfAccessToken();

  if (!token) {
    return {
      text: null,
      error:
        'No HF_TOKEN (or HUGGINGFACE_API_KEY) found. Add it to aiai/.env.local and restart the dev server.',
    };
  }

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
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            max_tokens: 2048,
            temperature: 0.3,
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

export function getModelName(): string {
  const primary = process.env.HUGGINGFACE_MODEL?.trim() || FALLBACK_MODELS[0];
  return `huggingface:${primary}`;
}
