import type { ConceptTreeNode } from '@/lib/ai/schemas';
import type { ModuleData, Step } from '@/core/types';

const SEP = '\x1f';

function truncateText(text: string | undefined, max: number): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Stable id for a concept leaf under a step (avoids `|` in titles breaking splits). */
export function conceptNodeId(stepId: string, concept: string): string {
  return `${stepId}${SEP}${concept}`;
}

export function parseConceptNodeId(id: string): { stepId: string; concept: string } | null {
  const i = id.indexOf(SEP);
  if (i === -1) return null;
  return { stepId: id.slice(0, i), concept: id.slice(i + SEP.length) };
}

function conceptDetail(step: Step, concept: string): string {
  const core = (step.content.text || '').trim();
  const deeper = step.content.goDeeper?.explanation?.trim();
  const parts = [
    `Concept: ${concept}`,
    '',
    `Subtopic: ${step.title}`,
    '',
    core,
  ];
  if (deeper) {
    parts.push('', 'Go deeper:', deeper);
  }
  if (step.content.authorNote?.trim()) {
    parts.push('', 'Note:', step.content.authorNote.trim());
  }
  return parts.join('\n');
}

function extractConceptsFromStep(step: Step): string[] {
  if (step.concepts && step.concepts.length > 0) {
    return step.concepts.filter(Boolean);
  }
  
  const text = (step.content.text || '') + ' ' + (step.content.goDeeper?.explanation ?? '') + ' ' + (step.content.authorNote ?? '');
  const keywords = [
    'vector', 'vectors', 'scalar', 'scalars', 'magnitude', 'dot product', 'cross product', 'projection', 'projections',
    'basis', 'bases', 'linear combination', 'span', 'dimension', 'dimensions', 'matrix', 'matrices',
    'determinant', 'eigenvalue', 'eigenvalues', 'eigenvector', 'eigenvectors', 'transpose', 'inverse',
    'gradient', 'gradients', 'derivative', 'derivatives', 'partial derivative', 'chain rule',
    'neural network', 'neural networks', 'layer', 'layers', 'weight', 'weights', 'bias', 'biases', 
    'activation', 'activations', 'relu', 'sigmoid', 'tanh',
    'loss', 'losses', 'optimizer', 'optimizers', 'gradient descent', 'learning rate',
    'convolution', 'convolutions', 'filter', 'filters', 'kernel', 'kernels', 'pooling', 'stride',
    'attention', 'query', 'key', 'keys', 'value', 'values', 'transformer', 'transformers', 'embedding', 'embeddings',
    'probability', 'probabilities', 'distribution', 'distributions', 'bayes', 'likelihood', 'prior', 'priors', 'posterior',
    'entropy', 'cross-entropy', 'kl-divergence',
    'classification', 'classifications', 'regression', 'regressions', 'clustering', 'k-means',
    'accuracy', 'accuracies', 'precision', 'recalls', 'f1-score', 'roc', 'auc',
    'overfitting', 'underfitting', 'regularization', 'dropout', 'batch norm',
    'perceptron', 'perceptrons', 'mlp', 'mlps', 'cnn', 'cnns', 'rnn', 'rnns', 'lstm', 'gru',
    'optimization', 'optimizer', 'sgd', 'adam', 'momentum',
    'norm', 'norms', 'distance', 'distances', 'cosine', 'similarity',
    'forward', 'backward', 'backpropagation', 'weights', 'bias',
    'softmax', 'logit', 'logits', 'sigmoid',
    'kernel', 'support vector', 'margin', 'hyperplane',
    'decision tree', 'trees', 'random forest', 'ensemble',
    'reinforcement learning', 'reward', 'policy', 'agent', 'q-learning',
    'vae', 'variational', 'autoencoder', 'encoder', 'decoder',
    'gan', 'generator', 'discriminator', 'latent',
    'diffusion', 'denoising',
    'token', 'tokens', 'tokenize', 'vocabulary',
  ];
  
  const lowerText = text.toLowerCase();
  const concepts: string[] = [];
  
  for (const kw of keywords) {
    if (lowerText.includes(kw)) {
      const formatted = kw.split(' ').map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ');
      if (!concepts.includes(formatted)) {
        concepts.push(formatted);
      }
    }
  }
  
  console.log('extractConceptsFromStep:', step.id, 'found:', concepts.length, concepts);
  return concepts.slice(0, 8);
}

/**
 * Topic → subtopics (steps) → concepts (tags).
 * Matches how learners move broad → narrow → connected ideas.
 */
export function buildModuleConceptTree(module: ModuleData): ConceptTreeNode[] {
  console.log('Building tree for module:', module.id, 'steps:', module.steps?.length);
  
  const children: ConceptTreeNode[] = (module.steps ?? []).map((step) => {
    const tags = extractConceptsFromStep(step);
    console.log('Step:', step.id, 'tags:', tags);
    
    const go = step.content.goDeeper?.explanation?.trim();
    const author = step.content.authorNote?.trim();
    const insight = go || author || undefined;

    const conceptChildren: ConceptTreeNode[] =
      tags.length > 0
        ? tags.map((concept) => ({
            id: conceptNodeId(step.id, concept),
            title: concept,
            summary: `Idea inside "${step.title}". Open for full notes.`,
            prerequisites: [],
            children: [],
            kind: 'concept' as const,
            detail: conceptDetail(step, concept),
            insight: `Nested under "${step.title}" in "${module.title}".`,
          }))
        : [];

    return {
      id: step.id,
      title: step.title,
      summary: truncateText(step.content.text, 160),
      prerequisites: [],
      children: conceptChildren,
      kind: 'subtopic',
      detail: (step.content.text || '').trim(),
      insight,
    };
  });

  console.log('Children count:', children.length, 'with concepts:', children.filter(c => c.children.length > 0).length);

  const prereq =
    module.prerequisites.length > 0
      ? `Prerequisites to review first:\n${module.prerequisites.map((p) => `• ${p}`).join('\n')}`
      : '';

  const rootDetail = [(module.description || '').trim(), prereq].filter(Boolean).join('\n\n');

  return [
    {
      id: module.id,
      title: module.title,
      summary: module.description || '',
      prerequisites: [...module.prerequisites],
      children,
      kind: 'topic',
      detail: rootDetail || module.description || '',
      insight: `${children.length} subtopics — expand branches to reach specific concepts.`,
    },
  ];
}

/**
 * Maps a quiz / confidence key (usually `step.concepts[0]` or `clusterId`) to step ids for expanding the tree.
 */
export function stepIdsForConcept(module: ModuleData, concept: string): string[] {
  const steps = module.steps ?? [];
  const fromTags = steps
    .filter((s) => (s.concepts ?? []).includes(concept))
    .map((s) => s.id);
  if (fromTags.length > 0) return fromTags;
  if (concept === module.clusterId) return steps.map((s) => s.id);
  return [];
}
