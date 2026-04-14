import { createHash } from 'node:crypto';
import type { Module } from '@/core/types';
import { buildModuleAnalysisPrompt } from './prompts';
import { generateWithHuggingFace, getModelName } from './huggingfaceClient';
import { getCachedStudyKit, setCachedStudyKit } from './cache/fileCache';
import {
  StudyKitModelResponseSchema,
  type StudyKit,
  type StudyKitRequest,
} from './schemas';

function stableHash(moduleData: Module): string {
  const steps = Array.isArray(moduleData.steps) ? moduleData.steps : [];
  return createHash('sha1')
    .update(
      JSON.stringify({
        id: moduleData.id,
        title: moduleData.title,
        description: moduleData.description,
        steps: steps.map((step) => ({
          id: step.id,
          title: step.title,
          text: step.content.text,
        })),
      }),
    )
    .digest('hex');
}

function fallbackStudyKit(moduleData: Module): Omit<StudyKit, 'generatedAt' | 'cached' | 'model'> {
  const steps = Array.isArray(moduleData.steps) ? moduleData.steps : [];
  const stepConcepts = steps.map((step) => ({
    id: step.id,
    title: step.title,
    concepts: step.concepts ?? [moduleData.clusterId],
    text: step.content.text,
  }));
  const sectionSize = 4;
  const sections = stepConcepts.reduce<Array<typeof stepConcepts>>((acc, _, index) => {
    if (index % sectionSize === 0) acc.push(stepConcepts.slice(index, index + sectionSize));
    return acc;
  }, []);

  return {
    analysis: {
      summary: `This module teaches ${moduleData.title} through guided visual steps and practice.`,
      keyConcepts: Array.from(new Set(stepConcepts.flatMap((item) => item.concepts))).slice(0, 8),
      misconceptions: ['Confusing memorization with intuition', 'Skipping prerequisite concepts'],
      recommendedOrder: stepConcepts.map((item) => item.title),
    },
    conceptTree: [
      {
        id: `${moduleData.id}-learning-map`,
        title: `${moduleData.title} learning map`,
        summary: `AI-generated structure of ${moduleData.title}.`,
        prerequisites: [],
        children: sections.map((group, groupIndex) => ({
          id: `${moduleData.id}-section-${groupIndex + 1}`,
          title: `Section ${groupIndex + 1}`,
          summary: group.map((item) => item.title).join(' • '),
          prerequisites: [],
          children: group.map((step) => ({
            id: step.id,
            title: step.title,
            summary: step.text.slice(0, 140),
            prerequisites: [],
            children: [],
          })),
        })),
      },
    ],
    flashcards: stepConcepts.slice(0, 12).map((step, index) => ({
      id: `fc-${step.id}-${index}`,
      front: `Explain ${step.title} in one sentence.`,
      back: step.text.slice(0, 220),
      difficulty: index < 4 ? 'beginner' : index < 8 ? 'intermediate' : 'advanced',
      concepts: step.concepts,
    })),
    quizzes: steps
      .filter((step) => step.quiz)
      .slice(0, 10)
      .map((step, index) => ({
        id: `qz-${step.id}-${index}`,
        question: step.quiz?.question ?? `What best describes ${step.title}?`,
        options:
          step.quiz?.options ?? [
            `It focuses on ${step.concepts?.[0] ?? moduleData.clusterId}.`,
            'It is only useful after all advanced tiers.',
            'It avoids any practical examples.',
            'It is unrelated to this module.',
          ],
        answerIndex: step.quiz?.correctIndex ?? 0,
        explanation:
          step.quiz?.explanation ??
          `${step.title} directly supports understanding ${step.concepts?.[0] ?? moduleData.clusterId}.`,
        concepts: step.concepts ?? [moduleData.clusterId],
      })),
  };
}

function parseModelOutput(raw: string): Partial<StudyKit> | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    const validated = StudyKitModelResponseSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

export async function generateStudyKit(
  moduleData: Module,
  request: StudyKitRequest,
): Promise<StudyKit> {
  const model = getModelName();
  const key = `${moduleData.id}-${stableHash(moduleData)}-${request.mode ?? 'seed'}-v1`;
  const cached = await getCachedStudyKit(key);
  if (cached) return { ...cached, cached: true };

  const fallback = fallbackStudyKit(moduleData);
  const prompt = buildModuleAnalysisPrompt(moduleData, request);
  const { text: raw } = await generateWithHuggingFace(prompt);
  const parsed = raw ? parseModelOutput(raw) : null;
  const normalizedTree =
    parsed?.conceptTree && parsed.conceptTree.length > 0
      ? parsed.conceptTree.some((node) => node.children.length > 0)
        ? parsed.conceptTree
        : fallback.analysis.keyConcepts.length > 0
          ? fallback.conceptTree
          : parsed.conceptTree
      : fallback.conceptTree;

  const studyKit: StudyKit = {
    analysis: parsed?.analysis ?? fallback.analysis,
    conceptTree: normalizedTree,
    flashcards: parsed?.flashcards ?? fallback.flashcards,
    quizzes: parsed?.quizzes ?? fallback.quizzes,
    generatedAt: new Date().toISOString(),
    model,
    cached: false,
  };

  await setCachedStudyKit(key, studyKit);
  return studyKit;
}
