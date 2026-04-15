import type { ProgressState } from '@/types/progress';
import { MODULE_META } from './registry';
import type { StudyKit } from '@/lib/ai/schemas';

const DEFAULT_CONCEPT_SKILL = 50;
const MIN_SKILL = 0;
const MAX_SKILL = 100;

export interface NextModuleRecommendation {
  moduleId: string;
  tierId: number;
  title: string;
  reason: string;
}

function clampSkill(value: number): number {
  return Math.max(MIN_SKILL, Math.min(MAX_SKILL, Math.round(value)));
}

function conceptForModule(moduleId: string): string {
  const meta = MODULE_META.find((moduleMeta) => moduleMeta.id === moduleId);
  return meta?.clusterId ?? 'general';
}

function tierModuleStatus(progress: ProgressState, tierId: number, moduleId: string) {
  return progress.tiers[tierId]?.modules[moduleId]?.status ?? 'available';
}

export function updateSkillFromQuiz(
  profile: ProgressState['learnerProfile'],
  concept: string,
  isCorrect: boolean,
): ProgressState['learnerProfile'] {
  const previous = profile.skillByConcept[concept] ?? DEFAULT_CONCEPT_SKILL;
  const delta = isCorrect ? 4 : -6;
  const nextScore = clampSkill(previous + delta);
  const nextSkills = { ...profile.skillByConcept, [concept]: nextScore };

  const weakConcepts = Object.keys(nextSkills).filter((key) => nextSkills[key] < 45);
  const strongConcepts = Object.keys(nextSkills).filter((key) => nextSkills[key] > 75);

  return {
    ...profile,
    skillByConcept: nextSkills,
    weakConcepts,
    strongConcepts,
  };
}

export function updateSkillFromChallenge(
  profile: ProgressState['learnerProfile'],
  concept: string,
): ProgressState['learnerProfile'] {
  const previous = profile.skillByConcept[concept] ?? DEFAULT_CONCEPT_SKILL;
  const nextScore = clampSkill(previous + 8);
  const nextSkills = { ...profile.skillByConcept, [concept]: nextScore };

  const weakConcepts = Object.keys(nextSkills).filter((key) => nextSkills[key] < 45);
  const strongConcepts = Object.keys(nextSkills).filter((key) => nextSkills[key] > 75);

  return {
    ...profile,
    skillByConcept: nextSkills,
    weakConcepts,
    strongConcepts,
  };
}

export function recommendNextModule(progress: ProgressState): NextModuleRecommendation | null {
  const modules = MODULE_META;
  const weakConcepts = new Set(progress.learnerProfile.weakConcepts);

  for (const moduleMeta of modules) {
    const status = tierModuleStatus(progress, moduleMeta.tierId, moduleMeta.id);
    if (status === 'in-progress') {
      return {
        moduleId: moduleMeta.id,
        tierId: moduleMeta.tierId,
        title: moduleMeta.title,
        reason: 'Continue where you left off',
      };
    }
  }

  const available = modules.filter((moduleMeta) => {
    const status = tierModuleStatus(progress, moduleMeta.tierId, moduleMeta.id);
    if (status === 'completed') return false;

    return moduleMeta.prerequisites.every((prerequisiteId) => {
      const prerequisiteMeta = modules.find((m) => m.id === prerequisiteId);
      if (!prerequisiteMeta) return false;
      const prerequisiteStatus = tierModuleStatus(
        progress,
        prerequisiteMeta.tierId,
        prerequisiteId,
      );
      return prerequisiteStatus === 'completed';
    });
  });

  if (available.length === 0) return null;

  const ranked = [...available].sort((a, b) => {
    const aWeakBoost = weakConcepts.has(a.clusterId) ? -1 : 0;
    const bWeakBoost = weakConcepts.has(b.clusterId) ? -1 : 0;
    if (aWeakBoost !== bWeakBoost) return aWeakBoost - bWeakBoost;
    if (a.tierId !== b.tierId) return a.tierId - b.tierId;
    return modules.findIndex((m) => m.id === a.id) - modules.findIndex((m) => m.id === b.id);
  });

  const selected = ranked[0];

  const concept = conceptForModule(selected.id);
  const conceptSkill = progress.learnerProfile.skillByConcept[concept] ?? DEFAULT_CONCEPT_SKILL;
  const isWeakFocus = weakConcepts.has(concept);
  const reason = isWeakFocus
    ? `Targeted practice for ${concept.replace(/-/g, ' ')}`
    : conceptSkill < 45
      ? `Build confidence in ${concept.replace(/-/g, ' ')}`
      : 'Recommended next step';

  return {
    moduleId: selected.id,
    tierId: selected.tierId,
    title: selected.title,
    reason,
  };
}

export function recommendNextConceptNode(
  progress: ProgressState,
  studyKit: StudyKit | null,
): string | null {
  if (!studyKit) return null;
  const weakSet = new Set(progress.learnerProfile.weakConcepts);
  const quizConcept = studyKit.quizzes.find((quiz) => quiz.concepts.some((concept) => weakSet.has(concept)));
  if (quizConcept) return quizConcept.concepts[0] ?? null;
  return studyKit.analysis.keyConcepts[0] ?? null;
}
