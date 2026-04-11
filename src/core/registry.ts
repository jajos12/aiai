import type { Module, ModuleBundle } from './types';

/**
 * Module Registry
 * Maps module IDs to dynamic imports of their respective modules.
 * This decoupled registry doesn't know about specific visualization components,
 * it just provides the module data which contains its own visualizer.
 */

const moduleRegistry: Record<string, () => Promise<Module | ModuleBundle>> = {
  vectors: () => import('@/modules/vectors'),
  'vector-spaces': () => import('@/modules/vector-spaces'),
  'norms-distance': () => import('@/modules/norms-distance'),
  matrices: () => import('@/modules/matrices'),
  eigenvalues: () => import('@/modules/eigenvalues'),
  'partial-derivatives': () => import('@/modules/partial-derivatives'),
  optimization: () => import('@/modules/optimization'),
  'chain-rule': () => import('@/modules/chain-rule'),
  'linear-regression': () => import('@/modules/linear-regression'),
  'logistic-regression': () => import('@/modules/logistic-regression'),
  'k-means': () => import('@/modules/k-means'),
  knn: () => import('@/modules/knn'),
  'decision-trees': () => import('@/modules/decision-trees'),
  svm: () => import('@/modules/svm'),
  backpropagation: () => import('@/modules/backpropagation'),
  activations: () => import('@/modules/activations'),
  mlps: () => import('@/modules/mlps'),
  perceptrons: () => import('@/modules/perceptrons'),
  optimizers: () => import('@/modules/optimizers'),
  'cnn-foundations': () => import('@/modules/cnn-foundations'),
  attention: () => import('@/modules/attention'),
  transformers: () => import('@/modules/transformers'),
  vit: () => import('@/modules/vit'),
  'llm-training': () => import('@/modules/llm-training'),
  'rl-agents': () => import('@/modules/rl-agents'),
  diffusion: () => import('@/modules/diffusion'),
  gans: () => import('@/modules/gans'),
  vaes: () => import('@/modules/vaes'),
  alignment: () => import('@/modules/alignment'),
  'python-zero-to-ai-scripting': () => import('@/modules/python-basics'),
  'numpy-data-and-performance': () => import('@/modules/numpy-foundations'),
  'pytorch-training-workflows': () => import('@/modules/pytorch-basics'),
  'ml-engineering-practices': () => import('@/modules/ml-engineering-practices'),
  // Backward-compatible aliases for existing links/progress snapshots
  'python-basics': () => import('@/modules/python-basics'),
  'numpy-foundations': () => import('@/modules/numpy-foundations'),
  'pytorch-basics': () => import('@/modules/pytorch-basics'),
};

function isModuleBundle(mod: Module | ModuleBundle): mod is ModuleBundle {
  return 'moduleData' in mod;
}

export async function getModule(moduleId: string): Promise<Module | null> {
  const loader = moduleRegistry[moduleId];
  if (!loader) return null;
  const mod = await loader();
  // If the module has moduleData export (new structure), merge it.
  // Otherwise, it might be the module object itself.
  if (isModuleBundle(mod)) {
    return {
      ...mod.moduleData,
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
  // Tier 0: Foundations
  { id: 'vectors', tierId: 0, clusterId: 'linear-algebra', title: 'Vectors', description: 'Arrows, magnitudes, and dot products.', estimatedMinutes: 30, prerequisites: [], difficulty: 'beginner' },
  { id: 'vector-spaces', tierId: 0, clusterId: 'linear-algebra', title: 'Vector Spaces', description: 'Basis, span, and dimensions.', estimatedMinutes: 30, prerequisites: ['vectors'], difficulty: 'beginner' },
  { id: 'norms-distance', tierId: 0, clusterId: 'linear-algebra', title: 'Norms & Distance', description: 'L1, L2, and Cosine similarity.', estimatedMinutes: 30, prerequisites: ['vectors'], difficulty: 'beginner' },
  { id: 'matrices', tierId: 0, clusterId: 'linear-algebra', title: 'Matrices', description: 'Linear transformations and spaces.', estimatedMinutes: 45, prerequisites: ['vector-spaces'], difficulty: 'beginner' },
  { id: 'eigenvalues', tierId: 0, clusterId: 'linear-algebra', title: 'Eigenvalues', description: 'Principal components of transformation.', estimatedMinutes: 45, prerequisites: ['matrices'], difficulty: 'intermediate' },
  { id: 'partial-derivatives', tierId: 0, clusterId: 'calculus', title: 'Partial Derivatives', description: 'Multivariate slopes.', estimatedMinutes: 30, prerequisites: [], difficulty: 'intermediate' },
  { id: 'optimization', tierId: 0, clusterId: 'calculus', title: 'Optimization', description: 'Minimizing loss functions.', estimatedMinutes: 40, prerequisites: ['partial-derivatives'], difficulty: 'intermediate' },
  { id: 'chain-rule', tierId: 0, clusterId: 'calculus', title: 'The Chain Rule', description: 'Gradient flow in graphs.', estimatedMinutes: 50, prerequisites: ['optimization'], difficulty: 'intermediate' },

  // Tier 0.5: Engineering (NEW)
  { id: 'python-zero-to-ai-scripting', tierId: 0.5, clusterId: 'engineering', title: 'Python Zero to AI Scripting', description: 'Absolute-beginner Python for practical AI workflows.', estimatedMinutes: 90, prerequisites: [], difficulty: 'beginner' },
  { id: 'numpy-data-and-performance', tierId: 0.5, clusterId: 'engineering', title: 'NumPy Data and Performance', description: 'Shapes, vectorization, broadcasting, and numerical workflow design.', estimatedMinutes: 85, prerequisites: ['python-zero-to-ai-scripting', 'vectors'], difficulty: 'beginner' },
  { id: 'pytorch-training-workflows', tierId: 0.5, clusterId: 'engineering', title: 'PyTorch Training Workflows', description: 'Tensors, autograd, training loops, and checkpointed experiments.', estimatedMinutes: 95, prerequisites: ['numpy-data-and-performance'], difficulty: 'intermediate' },
  { id: 'ml-engineering-practices', tierId: 0.5, clusterId: 'engineering', title: 'ML Engineering Practices', description: 'Reproducibility, debugging, configuration, and production-minded workflow habits.', estimatedMinutes: 80, prerequisites: ['pytorch-training-workflows'], difficulty: 'intermediate' },

  // Tier 1: ML Fundamentals
  { id: 'linear-regression', tierId: 1, clusterId: 'ml-fundamentals', title: 'Linear Regression', description: 'Fitting lines to data.', estimatedMinutes: 45, prerequisites: ['vectors', 'optimization'], difficulty: 'beginner' },
  { id: 'logistic-regression', tierId: 1, clusterId: 'ml-fundamentals', title: 'Logistic Regression', description: 'Probabilistic classification.', estimatedMinutes: 45, prerequisites: ['linear-regression'], difficulty: 'beginner' },
  { id: 'k-means', tierId: 1, clusterId: 'ml-fundamentals', title: 'K-Means Clustering', description: 'Unsupervised grouping.', estimatedMinutes: 35, prerequisites: ['norms-distance'], difficulty: 'beginner' },
  { id: 'knn', tierId: 1, clusterId: 'ml-fundamentals', title: 'K-Nearest Neighbors', description: 'Simplicity-based inference.', estimatedMinutes: 30, prerequisites: ['norms-distance'], difficulty: 'beginner' },
  { id: 'decision-trees', tierId: 1, clusterId: 'classical-ml', title: 'Decision Trees', description: 'Entropy and splits.', estimatedMinutes: 40, prerequisites: [], difficulty: 'intermediate' },
  { id: 'svm', tierId: 1, clusterId: 'classical-ml', title: 'SVM', description: 'Maximum margin separators.', estimatedMinutes: 50, prerequisites: ['matrices', 'optimization'], difficulty: 'intermediate' },

  // Tier 2: Deep Learning
  { id: 'perceptrons', tierId: 2, clusterId: 'neural-networks', title: 'Perceptrons', description: 'Biological neurons made digital.', estimatedMinutes: 30, prerequisites: ['linear-regression'], difficulty: 'intermediate' },
  { id: 'backpropagation', tierId: 2, clusterId: 'neural-networks', title: 'Backpropagation', description: 'The engine of AI learning.', estimatedMinutes: 60, prerequisites: ['perceptrons', 'chain-rule'], difficulty: 'intermediate' },
  { id: 'activations', tierId: 2, clusterId: 'neural-networks', title: 'Activations', description: 'Nonlinearities in flow.', estimatedMinutes: 25, prerequisites: ['backpropagation'], difficulty: 'intermediate' },
  { id: 'mlps', tierId: 2, clusterId: 'neural-networks', title: 'MLPs', description: 'Universal function learners.', estimatedMinutes: 50, prerequisites: ['backpropagation'], difficulty: 'intermediate' },
  { id: 'optimizers', tierId: 2, clusterId: 'neural-networks', title: 'Optimizers', description: 'SGD, Momentum, Adam.', estimatedMinutes: 45, prerequisites: ['backpropagation'], difficulty: 'intermediate' },
  { id: 'cnn-foundations', tierId: 2, clusterId: 'neural-networks', title: 'CNN Foundations', description: 'Vision processing layers.', estimatedMinutes: 55, prerequisites: ['mlps'], difficulty: 'intermediate' },

  // Tier 3: Advanced
  { id: 'attention', tierId: 3, clusterId: 'advanced-architectures', title: 'Attention', description: 'Focus mechanism for sequences.', estimatedMinutes: 60, prerequisites: ['mlps'], difficulty: 'advanced' },
  { id: 'transformers', tierId: 3, clusterId: 'advanced-architectures', title: 'Transformers', description: 'The modern AI backbone.', estimatedMinutes: 60, prerequisites: ['attention'], difficulty: 'advanced' },
  { id: 'vit', tierId: 3, clusterId: 'advanced-architectures', title: 'Vision Transformers', description: 'Attention-based vision.', estimatedMinutes: 60, prerequisites: ['transformers', 'cnn-foundations'], difficulty: 'advanced' },
  { id: 'llm-training', tierId: 3, clusterId: 'advanced-architectures', title: 'LLM Training', description: 'Scale, tuning, and alignment.', estimatedMinutes: 60, prerequisites: ['transformers'], difficulty: 'advanced' },

  // Tier 4: Frontiers
  { id: 'rl-agents', tierId: 4, clusterId: 'frontiers', title: 'Reinforcement Learning', description: 'Action, reward, policy.', estimatedMinutes: 75, prerequisites: ['mlps'], difficulty: 'intermediate' },
  { id: 'diffusion', tierId: 4, clusterId: 'frontiers', title: 'Diffusion Models', description: 'Generative noisy physics.', estimatedMinutes: 60, prerequisites: ['calculus', 'cnn-foundations'], difficulty: 'advanced' },
  { id: 'gans', tierId: 4, clusterId: 'frontiers', title: 'GANs', description: 'Adversarial training duel.', estimatedMinutes: 60, prerequisites: ['cnn-foundations'], difficulty: 'advanced' },
  { id: 'vaes', tierId: 4, clusterId: 'frontiers', title: 'VAEs', description: 'Latent space exploration.', estimatedMinutes: 50, prerequisites: ['mlps'], difficulty: 'advanced' },

  // Tier 5: Research
  { id: 'alignment', tierId: 5, clusterId: 'research', title: 'AI Alignment', description: 'Safety and intentionality.', estimatedMinutes: 60, prerequisites: ['llm-training'], difficulty: 'advanced' },
];
