import type { Step, ModuleData } from '@/core/types';
import type { LearnerProfile } from '@/types/progress';
import type { TutorMessage, ExplainLevel } from '@/types/tutor';
import type { ChatMessage } from './huggingfaceClient';

const LEVEL_GUIDE: Record<Exclude<ExplainLevel, 'standard'>, string> = {
  eli5: 'Use very simple analogies and everyday language. No jargon. Max 100 words for text, 120 for go-deeper.',
  expert: 'Use precise technical language, mathematical intuition, and formal definitions. Max 130 words for text, 160 for go-deeper.',
};

export function buildExplainLevelMessages(
  step: Step,
  level: Exclude<ExplainLevel, 'standard'>,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are an expert AI educator. Rewrite lesson content at the requested level. Return ONLY valid JSON, no markdown fences.',
    },
    {
      role: 'user',
      content: [
        `Rewrite this AI lesson step at the ${level.toUpperCase()} level.`,
        `Guide: ${LEVEL_GUIDE[level]}`,
        ``,
        `Step title: ${step.title}`,
        `Original text: ${step.content.text}`,
        `Original go-deeper: ${step.content.goDeeper?.explanation ?? 'none'}`,
        ``,
        `Return ONLY this JSON shape:`,
        `{"text":"<rewritten main text>","goDeeper":{"explanation":"<rewritten explanation>"}}`,
      ].join('\n'),
    },
  ];
}

export function buildTutorMessages(
  moduleTitle: string,
  step: Step,
  level: ExplainLevel,
  profile: LearnerProfile,
  history: TutorMessage[],
  userMessage: string,
): ChatMessage[] {
  const weakStr = profile.weakConcepts.slice(0, 3).join(', ') || 'none';

  const systemContent = [
    'You are a concise, encouraging AI tutor for an interactive ML learning platform.',
    `Module: ${moduleTitle}`,
    `Current step: ${step.title}`,
    `Step summary: ${step.content.text.slice(0, 250)}`,
    `Explanation level: ${level} (eli5=simple analogies, standard=clear, expert=formal/mathematical)`,
    `Learner weak concepts: ${weakStr}`,
    'Keep answers under 150 words. Match the explanation level. Be accurate.',
  ].join('\n');

  const messages: ChatMessage[] = [{ role: 'system', content: systemContent }];

  for (const msg of history.slice(-6)) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: userMessage });

  return messages;
}

/**
 * Builds messages for AI-enriching a module's lesson map.
 * Returns a prompt that asks for JSON with per-step insights + concept tags.
 * Designed to fit in small model context windows (≤ 4 steps per batch).
 */
export function buildLessonMapMessages(
  module: ModuleData,
  stepBatch: Array<{ id: string; title: string; text: string }>,
): ChatMessage[] {
  const stepsJson = JSON.stringify(stepBatch.map((s) => ({
    id: s.id,
    title: s.title,
    text: s.text.slice(0, 120),
  })));

  return [
    {
      role: 'system',
      content: 'You are an expert AI educator. Return ONLY valid JSON, no markdown, no explanation.',
    },
    {
      role: 'user',
      content: [
        `Module: "${module.title}"`,
        ``,
        `For EACH step below, write:`,
        `- insight: 1-2 sentences (max 55 words) why this concept matters in machine learning`,
        `- concepts: 2-3 short topic tag strings (capitalize first letter, keep brief)`,
        `- summary: 1 sentence (max 30 words) describing what the step teaches`,
        ``,
        `Steps: ${stepsJson}`,
        ``,
        `Return ONLY a JSON array:`,
        `[{"stepId":"...","insight":"...","concepts":["..."],"summary":"..."}]`,
      ].join('\n'),
    },
  ];
}
