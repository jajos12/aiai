import type { Module } from '@/core/types';
import type { StudyKitRequest } from './schemas';

function moduleLearningNotes(moduleData: Module): string {
  const steps = Array.isArray(moduleData.steps) ? moduleData.steps : [];
  return steps
    .map((step, index) => {
      const deeper = step.content.goDeeper?.explanation
        ? `\nGo deeper: ${step.content.goDeeper.explanation}`
        : '';
      return `Step ${index + 1} - ${step.title}\nCore: ${step.content.text}${deeper}`;
    })
    .join('\n\n');
}

export function buildModuleAnalysisPrompt(moduleData: Module, request: StudyKitRequest): string {
  const tags = Array.isArray(moduleData.tags) ? moduleData.tags : [];
  const steps = Array.isArray(moduleData.steps) ? moduleData.steps : [];
  return [
    'You are an AI tutor planner.',
    `Module: ${moduleData.title} (${moduleData.id})`,
    `Tier: ${request.tierId}`,
    `Description: ${moduleData.description}`,
    `Tags: ${tags.join(', ')}`,
    `Steps: ${steps.map((s) => s.title).join(' | ')}`,
    `Learning notes context:\n${moduleLearningNotes(moduleData)}`,
    `Weak concepts: ${request.learnerProfile?.weakConcepts?.join(', ') ?? 'none'}`,
    `Strong concepts: ${request.learnerProfile?.strongConcepts?.join(', ') ?? 'none'}`,
    'Return only valid JSON (no markdown code fences).',
    'The JSON MUST include these keys: analysis, conceptTree, flashcards, quizzes.',
    'quiz answerIndex must be within option bounds.',
    'conceptTree nodes must include id,title,summary,prerequisites,children.',
  ].join('\n');
}
