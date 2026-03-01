import type { Module } from './types';

/**
 * Module Registry
 * Maps module IDs to dynamic imports of their respective modules.
 * This decoupled registry doesn't know about specific visualization components,
 * it just provides the module data which contains its own visualizer.
 */

const moduleRegistry: Record<string, () => Promise<any>> = {
  optimization: () => import('@/modules/optimization'),
  eigenvalues: () => import('@/modules/eigenvalues'),
  matrices: () => import('@/modules/matrices'),
  vectors: () => import('@/modules/vectors'),
  'vector-spaces': () => import('@/modules/vector-spaces'),
  'chain-rule': () => import('@/modules/chain-rule'),
};

export async function getModule(moduleId: string): Promise<Module | null> {
  const loader = moduleRegistry[moduleId];
  if (!loader) return null;
  const mod = await loader();
  // If the module has moduleData export (new structure), merge it.
  // Otherwise, it might be the module object itself.
  if ((mod as any).moduleData) {
    return {
      ...(mod as any).moduleData,
      Visualization: mod.Visualization,
      ChallengeCanvas: mod.ChallengeCanvas,
    };
  }
  return mod;
}

export function getModuleIds(): string[] {
  return Object.keys(moduleRegistry);
}

// Meta metadata (static, for landing page)
export interface ModuleMeta {
  id: string;
  tierId: number;
  clusterId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  prerequisites: string[];
  difficulty: Module['difficulty'];
}

// This will be used for the dashboard to list modules without loading full bundles
// ORDER MATTERS: reflects pedagogical sequence (prerequisites first)
export const MODULE_META: ModuleMeta[] = [
  {
    id: 'vectors',
    tierId: 0,
    clusterId: 'linear-algebra',
    title: 'Vectors',
    description: 'Arrows, magnitudes, dot products — the fundamental objects of linear algebra.',
    estimatedMinutes: 30,
    prerequisites: [],
    difficulty: 'beginner',
  },
  {
    id: 'vector-spaces',
    tierId: 0,
    clusterId: 'linear-algebra',
    title: 'Vector Spaces',
    description: 'Span, linear independence, basis, dimension.',
    estimatedMinutes: 30,
    prerequisites: ['vectors'],
    difficulty: 'beginner',
  },
  {
    id: 'matrices',
    tierId: 0,
    clusterId: 'linear-algebra',
    title: 'Matrices',
    description: 'The operators that transform space — rotations, scalings, reflections.',
    estimatedMinutes: 35,
    prerequisites: ['vectors'],
    difficulty: 'beginner',
  },
  {
    id: 'eigenvalues',
    tierId: 0,
    clusterId: 'linear-algebra',
    title: 'Eigenvalues & Eigenvectors',
    description: 'The special directions that survive a transformation — the key to PCA and PageRank.',
    estimatedMinutes: 45,
    prerequisites: ['vectors', 'vector-spaces', 'matrices'],
    difficulty: 'intermediate',
  },
  {
    id: 'optimization',
    tierId: 0,
    clusterId: 'optimization',
    title: 'Optimization & Gradient Descent',
    description:
      'From derivatives to Adam — build deep intuition for the algorithm that trains every neural network.',
    estimatedMinutes: 60,
    prerequisites: ['vectors', 'matrices'],
    difficulty: 'intermediate',
  },
  {
    id: 'chain-rule',
    tierId: 0,
    clusterId: 'calculus',
    title: 'The Chain Rule',
    description:
      'The engine behind backpropagation — learn how gradients flow through computation graphs.',
    estimatedMinutes: 50,
    prerequisites: ['optimization'],
    difficulty: 'intermediate',
  },
];
