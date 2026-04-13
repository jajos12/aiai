import type { ProgressState } from '@/types/progress';
import { MODULE_META, type ModuleMeta } from './registry';

export interface TierMeta {
  id: number;
  title: string;
  emoji: string;
  description: string;
  recommendedCompletionRatio: number;
}

export interface TierSummary extends TierMeta {
  modules: ModuleMeta[];
  moduleCount: number;
  completedModules: number;
  completionRatio: number;
  recommendation?: string;
}

export const TIER_META: TierMeta[] = [
  {
    id: 0,
    title: 'Mathematical Foundations',
    emoji: '🟢',
    description:
      'Vectors, matrices, calculus, probability - the building blocks of everything in AI.',
    recommendedCompletionRatio: 0,
  },
  {
    id: 0.5,
    title: 'Engineering & Tooling',
    emoji: '🛠️',
    description: 'Python, NumPy, and PyTorch — the essential tools for implementing AI research.',
    recommendedCompletionRatio: 0.5,
  },
  {
    id: 1,
    title: 'ML Fundamentals',
    emoji: '🔵',
    description:
      'Linear regression, gradient descent, classification - your first machine learning systems.',
    recommendedCompletionRatio: 0.7,
  },
  {
    id: 2,
    title: 'Deep Learning Core',
    emoji: '\uD83D\uDFE3',
    description:
      'Neural networks, backpropagation, and representation learning - the deep learning core.',
    recommendedCompletionRatio: 0.7,
  },
  {
    id: 3,
    title: 'Advanced Architectures',
    emoji: '\uD83D\uDFE1',
    description:
      'Transformers, attention, and generative systems - modern model architecture intuition.',
    recommendedCompletionRatio: 0.7,
  },
  {
    id: 4,
    title: 'Frontiers & Applications',
    emoji: '\uD83D\uDD34',
    description:
      'Reinforcement learning, multimodal systems, and real-world AI applications at the frontier.',
    recommendedCompletionRatio: 0.7,
  },
  {
    id: 5,
    title: 'Research & Open Problems',
    emoji: '\uD83D\uDFE4',
    description:
      'Alignment, scaling laws, and open research questions - where the field is still being written.',
    recommendedCompletionRatio: 0.7,
  },
];

const TIER_META_BY_ID = new Map(TIER_META.map((tier) => [tier.id, tier]));

function countCompletedModules(
  tierId: number,
  modules: ModuleMeta[],
  progress?: ProgressState,
): number {
  if (!progress) return 0;

  return modules.reduce((count, moduleMeta) => {
    const status = progress.tiers[tierId]?.modules[moduleMeta.id]?.status;
    return status === 'completed' ? count + 1 : count;
  }, 0);
}

export function getTierMeta(tierId: number): TierMeta | null {
  return TIER_META_BY_ID.get(tierId) ?? null;
}

export function getTierModuleMeta(tierId: number): ModuleMeta[] {
  return MODULE_META.filter((moduleMeta) => moduleMeta.tierId === tierId);
}

export function getTierRecommendation(tierId: number): string | undefined {
  const tier = getTierMeta(tierId);
  if (!tier) return undefined;
  if (tierId === 0) return 'Recommended start';
  if (tierId === 0.5) return 'Recommended after core Tier 0 foundations';

  const thresholdPercent = Math.round(tier.recommendedCompletionRatio * 100);
  return `Recommended after ${thresholdPercent}% of Tier ${tierId - 1}`;
}

export function getTierSummary(
  tierId: number,
  progress?: ProgressState,
): TierSummary | null {
  const tier = getTierMeta(tierId);
  if (!tier) return null;

  const modules = getTierModuleMeta(tierId);
  const completedModules = countCompletedModules(tierId, modules, progress);
  const moduleCount = modules.length;

  return {
    ...tier,
    modules,
    moduleCount,
    completedModules,
    completionRatio: moduleCount > 0 ? completedModules / moduleCount : 0,
    recommendation: getTierRecommendation(tierId),
  };
}

export function getTierSummaries(progress?: ProgressState): TierSummary[] {
  return TIER_META.map((tier) => getTierSummary(tier.id, progress)).filter(
    (tier): tier is TierSummary => tier !== null,
  );
}
