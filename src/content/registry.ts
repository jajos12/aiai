import type { Module } from '@/types/curriculum';

// Content registry — maps module IDs to their data
// Each module's data is lazy-loaded from content directories

const moduleRegistry: Record<string, () => Promise<Module>> = {
  vectors: () => import('@/content/tier0/vectors/module').then((m) => m.default),
  matrices: () => import('@/content/tier0/matrices/module').then((m) => m.default),
  // Future modules:
  // 'vector-spaces': () => import('@/content/tier0/vector-spaces/module').then(m => m.default),
};

export async function getModule(moduleId: string): Promise<Module | null> {
  const loader = moduleRegistry[moduleId];
  if (!loader) return null;
  return loader();
}

export function getModuleIds(): string[] {
  return Object.keys(moduleRegistry);
}

// Static metadata for the module list page (no need to load full module data)
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

export const MODULE_META: ModuleMeta[] = [
  {
    id: 'vectors',
    tierId: 0,
    clusterId: 'linear-algebra',
    title: 'Vectors',
    description:
      'Arrows, magnitudes, dot products — the fundamental objects of linear algebra and the language of machine learning.',
    estimatedMinutes: 30,
    prerequisites: [],
    difficulty: 'beginner',
  },
  {
    id: 'vector-spaces',
    tierId: 0,
    clusterId: 'linear-algebra',
    title: 'Vector Spaces & Independence',
    description:
      'Span, linear independence, basis, dimension — the abstract structure that unlocks eigenvectors and PCA.',
    estimatedMinutes: 30,
    prerequisites: ['vectors'],
    difficulty: 'beginner',
  },
  {
    id: 'matrices',
    tierId: 0,
    clusterId: 'linear-algebra',
    title: 'Matrix Operations',
    description:
      'Matrices as transformations, rotation, scaling, determinants, inverses — the engine of neural networks.',
    estimatedMinutes: 30,
    prerequisites: ['vectors', 'vector-spaces'],
    difficulty: 'beginner',
  },
];
