import Groq from 'groq-sdk';
import { InferenceClient } from '@huggingface/inference';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type HuggingFaceGenerateResult = {
  text: string | null;
  error?: string;
};

const DEFAULT_SYSTEM_PROMPT = `
You are an expert AI tutor.

- Explain concepts step-by-step
- Start simple, then go deeper
- Use examples when possible
- Be clear and concise
- If solving problems, show reasoning

If the user asks for JSON, return ONLY valid JSON without markdown.
`.trim();

const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'llama3-8b-8192',
];

const HF_FALLBACK_MODELS = [
  'Qwen/Qwen2.5-1.5B-Instruct',
  'HuggingFaceTB/SmolLM2-1.7B-Instruct',
  'Qwen/Qwen2.5-0.5B-Instruct',
];

function groqApiKey(): string {
  return process.env.GROQ_API_KEY?.trim() || '';
}

function hfAccessToken(): string {
  return (
    process.env.HF_TOKEN?.trim() ||
    process.env.HUGGINGFACE_API_KEY?.trim() ||
    ''
  );
}

function hfModelCandidates(): string[] {
  const configured = process.env.HUGGINGFACE_MODEL?.trim();
  if (configured) return [configured, ...HF_FALLBACK_MODELS.filter((m) => m !== configured)];
  return [...HF_FALLBACK_MODELS];
}

function hfProviderArgs(): { provider: 'hf-inference' } | Record<string, never> {
  const v = process.env.HUGGINGFACE_INFERENCE_PROVIDER?.trim().toLowerCase();
  if (v === 'auto') return {};
  return { provider: 'hf-inference' };
}

function requestTimeoutMs(): number {
  const raw = process.env.HUGGINGFACE_REQUEST_TIMEOUT_MS?.trim();
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n >= 5000) return Math.floor(n);
  return 60_000;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms),
    ),
  ]);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isModelLoading(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /loading|warmup|503|unavailable/i.test(msg);
}

async function chatWithGroq(messages: ChatMessage[]): Promise<HuggingFaceGenerateResult> {
  const key = groqApiKey();
  if (!key) return { text: null, error: 'GROQ_API_KEY not set' };

  const client = new Groq({ apiKey: key });

  for (const model of GROQ_MODELS) {
    try {
      const completion = await withTimeout(
        client.chat.completions.create({
          model,
          messages,
          max_tokens: 1024,
          temperature: 0.4,
        }),
        requestTimeoutMs(),
      );
      const text = completion.choices?.[0]?.message?.content?.trim() || null;
      if (text) return { text };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isModelLoading(error)) {
        await sleep(3000);
        continue;
      }
      if (msg.includes('401') || msg.includes('invalid_api_key')) {
        return { text: null, error: `Groq auth failed: ${msg}` };
      }
    }
  }

  return { text: null, error: 'All Groq models failed' };
}

async function chatWithHF(messages: ChatMessage[]): Promise<HuggingFaceGenerateResult> {
  const token = hfAccessToken();
  if (!token) return { text: null, error: 'HF_TOKEN not set' };

  const client = new InferenceClient(token);
  const models = hfModelCandidates();
  const timeoutMs = requestTimeoutMs();

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const completion = await withTimeout(
          client.chatCompletion({
            model,
            ...hfProviderArgs(),
            messages,
            max_tokens: 1024,
            temperature: 0.4,
          }),
          timeoutMs,
        );
        const raw = completion.choices?.[0]?.message?.content;
        const text = typeof raw === 'string' ? raw.trim() : null;
        if (text) return { text };
      } catch (error) {
        if (isModelLoading(error) && attempt < 1) {
          await sleep(4000);
          continue;
        }
        break;
      }
    }
  }

  return { text: null, error: 'All HF models failed' };
}

export async function chatWithMessages(
  messages: ChatMessage[],
): Promise<HuggingFaceGenerateResult> {
  if (groqApiKey()) {
    const result = await chatWithGroq(messages);
    if (result.text) return result;
    console.warn('[ai] Groq failed, falling back to HF:', result.error);
  }

  if (hfAccessToken()) {
    return chatWithHF(messages);
  }

  return {
    text: null,
    error: 'No AI provider configured. Set GROQ_API_KEY (recommended, free at console.groq.com) or HF_TOKEN.',
  };
}

export async function* streamChatWithMessages(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const groqKey = groqApiKey();

  if (groqKey) {
    const client = new Groq({ apiKey: groqKey });
    for (const model of GROQ_MODELS) {
      try {
        const stream = await client.chat.completions.create({
          model,
          messages,
          max_tokens: 1024,
          temperature: 0.4,
          stream: true,
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
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('401') || msg.includes('invalid_api_key')) break;
        if (isModelLoading(error)) { await sleep(3000); continue; }
        break;
      }
    }
  }

  const hfToken = hfAccessToken();
  if (!hfToken) {
    throw new Error('No AI provider configured. Set GROQ_API_KEY or HF_TOKEN.');
  }

  const client = new InferenceClient(hfToken);
  const models = hfModelCandidates();

  for (const model of models) {
    try {
      const stream = client.chatCompletionStream({
        model,
        ...hfProviderArgs(),
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
    } catch (error) {
      if (isModelLoading(error)) { await sleep(4000); continue; }
      break;
    }
  }

  throw new Error('All AI providers failed to stream a response.');
}

export async function generateWithHuggingFace(
  prompt: string,
): Promise<HuggingFaceGenerateResult> {
  return chatWithMessages([
    { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);
}

export function getModelName(): string {
  if (groqApiKey()) return `groq:${GROQ_MODELS[0]}`;
  const primary = process.env.HUGGINGFACE_MODEL?.trim() || HF_FALLBACK_MODELS[0];
  return `huggingface:${primary}`;
}
