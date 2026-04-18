import { chatWithMessages, type ChatMessage } from '@/lib/ai/huggingfaceClient';
import type { LessonStudioState, Quiz, Step } from '@/core/types';

const JSON_SYSTEM = `You are an expert math and ML educator writing lesson content.
When asked for JSON only, respond with a single valid JSON object — no markdown fences, no commentary.`;

export type LessonAssistAction =
  | 'generate_explanation'
  | 'simplify'
  | 'intuitive'
  | 'analogy'
  | 'generate_blocks_outline'
  | 'rewrite_audience'
  | 'intelligence_scan'
  | 'generate_quiz'
  | 'course_outline';

export async function runLessonAssist(params: {
  action: LessonAssistAction;
  text: string;
  audience?: 'beginner' | 'intermediate' | 'advanced';
  moduleTitle?: string;
  stepTitle?: string;
}): Promise<{ text: string } | { error: string }> {
  const { action, text, audience = 'intermediate', moduleTitle, stepTitle } = params;
  const ctx = `Module: ${moduleTitle ?? '—'}\nStep: ${stepTitle ?? '—'}\nAudience: ${audience}\n\n---\n${text}`.slice(0, 12000);

  const prompts: Record<LessonAssistAction, ChatMessage[]> = {
    generate_explanation: [
      { role: 'system', content: JSON_SYSTEM },
      {
        role: 'user',
        content: `Write a clear learner-facing explanation (markdown OK, 2–6 short paragraphs).\n${ctx}`,
      },
    ],
    simplify: [
      { role: 'system', content: JSON_SYSTEM },
      { role: 'user', content: `Rewrite in simpler language. Remove jargon where possible. Keep technical accuracy.\n${ctx}` },
    ],
    intuitive: [
      { role: 'system', content: JSON_SYSTEM },
      { role: 'user', content: `Rewrite to build intuition first, then precision. Use a concrete analogy early.\n${ctx}` },
    ],
    analogy: [
      { role: 'system', content: JSON_SYSTEM },
      { role: 'user', content: `Add one strong analogy and weave it through the explanation. Keep length similar.\n${ctx}` },
    ],
    generate_blocks_outline: [
      { role: 'system', content: JSON_SYSTEM },
      {
        role: 'user',
        content: `Return JSON only: { "blocks": [ { "type":"concept"|"math"|"explanation"|"callout"|"graph", "title"?: string, "body"?: string, "latex"?: string, "tone"?: "info"|"warning"|"tip", "caption"?: string } ] }
Use 4–10 blocks in teaching order. "math" needs latex. "graph" only needs caption (graph expression edited separately).\n${ctx}`,
      },
    ],
    rewrite_audience: [
      { role: 'system', content: JSON_SYSTEM },
      {
        role: 'user',
        content: `Rewrite the lesson for a ${audience} reader. Adjust density and assumed prerequisites.\n${ctx}`,
      },
    ],
    intelligence_scan: [
      { role: 'system', content: JSON_SYSTEM },
      {
        role: 'user',
        content: `Return JSON only: { "estimatedConfusion": string[3-6], "improvementIdeas": string[3-6] }
Think like a learning engineer: where could learners stall, misread math, or lose the thread?\n${ctx}`,
      },
    ],
    generate_quiz: [
      { role: 'system', content: JSON_SYSTEM },
      {
        role: 'user',
        content: `Return JSON only: { "question": string, "options": string[4], "correctIndex": 0-3, "explanation": string }
Based strictly on the lesson below.\n${ctx}`,
      },
    ],
    course_outline: [
      { role: 'system', content: JSON_SYSTEM },
      {
        role: 'user',
        content: `Return JSON only: { "title": string, "modules": [ { "title": string, "summary": string, "keyIdeas": string[] } ] }
Topic:\n${text}\nProduce 5–8 modules suitable for an interactive AI math playground.`,
      },
    ],
  };

  const res = await chatWithMessages(prompts[action]);
  if (!res.text) return { error: res.error ?? 'AI returned empty response' };
  return { text: res.text };
}

export function parseQuizFromAi(raw: string): Quiz | null {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    const obj = JSON.parse(cleaned) as Partial<Quiz>;
    if (
      typeof obj.question === 'string' &&
      Array.isArray(obj.options) &&
      obj.options.length === 4 &&
      typeof obj.correctIndex === 'number' &&
      obj.correctIndex >= 0 &&
      obj.correctIndex <= 3 &&
      typeof obj.explanation === 'string'
    ) {
      return {
        question: obj.question,
        options: obj.options.map(String),
        correctIndex: obj.correctIndex,
        explanation: obj.explanation,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function parseIntelligenceFromAi(raw: string): LessonStudioState['intelligence'] | null {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    const obj = JSON.parse(cleaned) as {
      estimatedConfusion?: string[];
      improvementIdeas?: string[];
    };
    if (!Array.isArray(obj.estimatedConfusion) && !Array.isArray(obj.improvementIdeas)) return null;
    return {
      estimatedConfusion: Array.isArray(obj.estimatedConfusion) ? obj.estimatedConfusion.map(String) : [],
      improvementIdeas: Array.isArray(obj.improvementIdeas) ? obj.improvementIdeas.map(String) : [],
      lastGeneratedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function parseBlocksOutlineFromAi(raw: string, makeId: () => string): import('@/core/types').LessonBlock[] | null {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    const obj = JSON.parse(cleaned) as { blocks?: Array<Record<string, unknown>> };
    if (!Array.isArray(obj.blocks)) return null;
    const out: import('@/core/types').LessonBlock[] = [];
    for (const b of obj.blocks) {
      const id = makeId();
      const type = b.type as string;
      if (type === 'concept' && typeof b.body === 'string') {
        out.push({ id, type: 'concept', title: typeof b.title === 'string' ? b.title : undefined, body: b.body });
      } else if (type === 'math' && typeof b.latex === 'string') {
        out.push({ id, type: 'math', latex: b.latex });
      } else if (type === 'explanation' && typeof b.body === 'string') {
        out.push({ id, type: 'explanation', body: b.body });
      } else if (type === 'callout' && typeof b.body === 'string') {
        const tone = b.tone === 'warning' || b.tone === 'tip' || b.tone === 'info' ? b.tone : undefined;
        out.push({ id, type: 'callout', body: b.body, tone });
      } else if (type === 'graph') {
        out.push({ id, type: 'graph', caption: typeof b.caption === 'string' ? b.caption : undefined });
      }
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export function summarizeStepForAi(step: Step): string {
  const parts: string[] = [step.title];
  if (step.content.text) parts.push('Main:', step.content.text);
  if (step.content.authorNote) parts.push('Note:', step.content.authorNote);
  if (step.content.studio?.blocks?.length) {
    parts.push(
      'Blocks:',
      step.content.studio.blocks
        .map((b) => {
          if (b.type === 'math') return `[math] ${b.latex}`;
          if (b.type === 'concept') return `[concept] ${b.title ?? ''} ${b.body}`;
          if (b.type === 'explanation') return `[explain] ${b.body}`;
          if (b.type === 'callout') return `[callout] ${b.body}`;
          if (b.type === 'graph') return `[graph] ${b.caption ?? ''}`;
          return `[interactive] ${b.label}`;
        })
        .join('\n'),
    );
  }
  if (step.content.studio?.graphSpec?.expression) {
    parts.push('Graph:', step.content.studio.graphSpec.expression);
  }
  return parts.join('\n\n');
}
