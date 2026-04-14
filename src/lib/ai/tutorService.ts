import type { Step, ModuleData } from '@/core/types';
import type { LearnerProfile } from '@/types/progress';
import type { TutorMessage, ExplainLevel, StepExplanation } from '@/types/tutor';
import type { LessonMapInsights } from '@/lib/db/lessonMap';
import { buildExplainLevelMessages, buildTutorMessages, buildLessonMapMessages } from './tutorPrompts';
import { chatWithMessages, streamChatWithMessages } from './huggingfaceClient';

function parseExplanation(raw: string): StepExplanation | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    const text = typeof obj.text === 'string' ? obj.text.trim() : null;
    if (!text) return null;
    const goDeeperRaw = obj.goDeeper;
    const explanation =
      goDeeperRaw !== null &&
      typeof goDeeperRaw === 'object' &&
      typeof (goDeeperRaw as Record<string, unknown>).explanation === 'string'
        ? ((goDeeperRaw as Record<string, unknown>).explanation as string).trim()
        : null;
    return {
      text,
      goDeeper: explanation ? { explanation } : undefined,
    };
  } catch {
    return null;
  }
}

export async function generateStepExplanation(
  step: Step,
  level: Exclude<ExplainLevel, 'standard'>,
): Promise<StepExplanation | null> {
  const messages = buildExplainLevelMessages(step, level);
  const { text, error } = await chatWithMessages(messages);
  if (!text) {
    console.error('[tutorService] explain-level error:', error);
    return null;
  }
  return parseExplanation(text);
}

export async function* streamTutorResponse(
  moduleTitle: string,
  step: Step,
  level: ExplainLevel,
  profile: LearnerProfile,
  history: TutorMessage[],
  userMessage: string,
): AsyncGenerator<string> {
  const messages = buildTutorMessages(moduleTitle, step, level, profile, history, userMessage);
  yield* streamChatWithMessages(messages);
}

type RawStepInsight = {
  stepId: string;
  insight: string;
  concepts: string[];
  summary?: string;
};

function parseLessonMapBatch(raw: string): RawStepInsight[] {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is RawStepInsight =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).stepId === 'string' &&
        typeof (item as Record<string, unknown>).insight === 'string',
    );
  } catch {
    return [];
  }
}

const BATCH_SIZE = 4;

/**
 * Generates AI-enriched per-step insights for the lesson map.
 * Processes steps in batches to stay within small model token limits.
 * Returns a map of stepId → enrichment data.
 */
export async function generateLessonMapInsights(
  module: ModuleData,
): Promise<LessonMapInsights> {
  const steps = module.steps ?? [];
  const result: LessonMapInsights = {};

  for (let i = 0; i < steps.length; i += BATCH_SIZE) {
    const batch = steps.slice(i, i + BATCH_SIZE).map((s) => ({
      id: s.id,
      title: s.title,
      text: s.content.text,
    }));

    const messages = buildLessonMapMessages(module, batch);
    const { text, error } = await chatWithMessages(messages);

    if (!text) {
      console.warn('[lessonMap] batch failed:', error);
      for (const s of batch) {
        result[s.id] = { stepId: s.id, insight: '', concepts: [] };
      }
      continue;
    }

    const parsed = parseLessonMapBatch(text);
    for (const item of parsed) {
      result[item.stepId] = {
        stepId: item.stepId,
        insight: item.insight.slice(0, 400),
        concepts: item.concepts.slice(0, 5).map((c) => String(c).slice(0, 40)),
        summary: item.summary?.slice(0, 200),
      };
    }

    for (const s of batch) {
      if (!result[s.id]) {
        result[s.id] = { stepId: s.id, insight: '', concepts: [] };
      }
    }
  }

  return result;
}
