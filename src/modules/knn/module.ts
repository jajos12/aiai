import type { ModuleData } from '@/core/types';

const knnModule: ModuleData = {
  id: 'knn',
  tierId: 1,
  clusterId: 'ml-fundamentals',
  title: 'K-Nearest Neighbors',
  description:
    'A simple, non-parametric approach to classification and regression testing finding the closest training examples.',
  tags: ['classification', 'knn', 'lazy-learning', 'distance-metrics'],
  prerequisites: ['norms-distance'],
  difficulty: 'beginner',
  estimatedMinutes: 55,
  steps: [
    {
      id: 'the-lazy-learner',
      title: 'The Lazy Learner',
      visualizationProps: {
        mode: 'intro',
        points: [
          { x: 2, y: 7, class: 0 },
          { x: 3, y: 8, class: 0 },
          { x: 2, y: 9, class: 0 },
          { x: 8, y: 2, class: 1 },
          { x: 9, y: 3, class: 1 },
          { x: 8, y: 1, class: 1 },
        ],
        testPoint: { x: 5, y: 5 },
        k: 1,
      },
      content: {
        text: 'K-Nearest Neighbors (KNN) is called a "lazy" learner because it doesn\'t actually learn a mathematical function like y=mx+b during training. It simply memorizes the entire dataset!',
        goDeeper: {
          explanation: String.raw`INSTANCE-BASED DECISION RULE

Training stores {(x_i, y_i)}; prediction is a local vote or average over the k smallest distances d(x, x_i). No explicit parameters beyond k and metric—capacity is the whole dataset.

BAYES-OPTIMAL AS k→∞

Under mild conditions, k-NN regression/classification converges to posterior expectation/mode as n→∞ and k/n→0.

COMPUTE TRADEOFF

Training is O(1), query is O(n d) naive; spatial data structures reduce amortized cost.`,
        },
      },
      interactionHint: 'Drag the grey "test point". With K=1, it will be classified as whatever the single nearest neighbor is.',
    },
    {
      id: 'choosing-k',
      title: 'Choosing K: The Bias-Variance Tradeoff',
      visualizationProps: {
        mode: 'interactive-k',
        points: [
          { x: 2, y: 7, class: 0 },
          { x: 3, y: 8, class: 0 },
          { x: 2, y: 9, class: 0 },
          { x: 4, y: 6, class: 0 },
          { x: 8, y: 2, class: 1 },
          { x: 9, y: 3, class: 1 },
          { x: 8, y: 1, class: 1 },
          { x: 7, y: 4, class: 1 },
          { x: 3, y: 7, class: 1 },
        ],
        testPoint: { x: 3.5, y: 6.5 },
        k: 1,
      },
      content: {
        text: 'If K=1, the model is highly sensitive to noise. A single misplaced point (like the blue dot in the red group) will completely flip the prediction in that local area.',
        goDeeper: {
          explanation: String.raw`SMALL k → LOW BIAS, HIGH VARIANCE

Decision boundary follows noise; high model complexity. Large k → smoother boundary, higher bias, lower variance.

CROSS-VALIDATION

Choose k by minimizing held-out error on a grid (odd k for binary ties).

REGRESSION VARIANT

k-NN regression averages y_i of neighbors; same bias–variance story with respect to k.`,
        },
      },
      interactionHint: 'Move the slider to increase K and watch how the voting changes!',
    },
    {
      id: 'distance-metrics',
      title: 'Measuring Distance',
      visualizationProps: {
        mode: 'distance-metric',
        points: [{ x: 5, y: 5, class: 0 }],
        testPoint: { x: 8, y: 9 },
        k: 1,
        metric: 'euclidean',
      },
      content: {
        text: 'How do we define "Nearest"? Usually, we use Euclidean distance (straight line). But in some cases, Manhattan distance (moving only in grid steps) is better.',
        goDeeper: {
          math: String.raw`d_p(x,x') = \bigl(\sum_j |x_j - x'_j|^p\bigr)^{1/p}`,
          explanation: String.raw`L_p NORMS

p=2 Euclidean rotation-invariant; p=1 Manhattan robust to outliers in single coordinates; p=∞ Chebyshev.

MAHALANOBIS

(x−x')^⊤ Σ^{-1}(x−x') scales features by estimated covariance—ellipsoidal neighborhoods.

METRIC LEARNING

Learn M ≽ 0 in d_M(x,x') = √(x−x')^⊤ M (x−x') from labels—LMNN, ITML.`,
        },
      },
      interactionHint: 'Toggle between Euclidean and Manhattan to see the mathematical difference in how distance is calculated.',
    },
    {
      id: 'curse-of-dimensionality',
      title: 'The Curse of Dimensionality',
      visualizationProps: {
        mode: 'curse',
      },
      content: {
        text: 'As the number of dimensions (features) grows, the volume of space expands exponentially. In very high-dimensional space (like images with thousands of pixels), EVERYTHING is far away.',
        goDeeper: {
          explanation: String.raw`RANDOM POINTS CONCENTRATE ON SHELL

For Gaussian coordinates, norms concentrate; pairwise distances lose relative contrast—k-NN neighborhoods become meaningless without structure.

DIMENSIONALITY REDUCTION

PCA, autoencoders, or domain-specific embeddings restore metric learning before k-NN.

COVER TREE / LSH

Approximate NN in high-d with probabilistic guarantees when exact k-NN is too costly.`,
        },
      },
    },
    {
      id: 'distance-weighting',
      title: 'Distance Weighting (1/d)',
      visualizationProps: {
        mode: 'weighting-viz',
        interactive: true,
      },
      content: {
        text: 'Should a neighbor that is far away have the same vote as one that is right next to our test point? We can weight votes by the inverse of their distance.',
        goDeeper: {
          math: String.raw`\hat{y} = \frac{\sum_i w_i y_i}{\sum_i w_i}, \quad w_i = \frac{1}{d(x,x_i)^p + \varepsilon}`,
          explanation: String.raw`KERNEL WEIGHTING

Gaussian weights exp(−d²/σ²) smooth influence; p and ε tune softness.

REGRESSION STABILITY

Inverse-distance blows up at d→0; ε regularizes. Shepard interpolation uses continuous weighting surfaces.

CLASSIFICATION TIES

Weighted votes reduce ties versus uniform majority at fixed k.`,
        },
      },
    },
    {
      id: 'feature-scaling-knn',
      title: 'Scaling: The Silent Killer',
      visualizationProps: {
        mode: 'scaling-impact',
      },
      content: {
        text: 'If "Salary" is in thousands and "Age" is in double digits, the Euclidean distance will be dominated entirely by Salary. Age will be ignored!',
        goDeeper: {
          explanation: String.raw`SCALE EQUIVARIANCE FAILURE

Unless all features share units and dynamic range, L2 geometry lies. Standardize to zero mean unit variance or min-max to [0,1] per feature.

ROBUST SCALING

Median/IQR scaling resists outliers compared to z-score.

CATEGORICAL ENCODING

One-hot increases dimension and sparsity—consider learned embeddings before k-NN on mixed data.`,
        },
      },
    },
    {
      id: 'kd-trees',
      title: 'The Search: KD-Trees vs Exhaustive',
      visualizationProps: {
        mode: 'kd-tree-viz',
      },
      content: {
        text: 'Calculating the distance to EVERY point in a billion-row dataset is too slow. Instead, we use smart data structures like KD-Trees or Ball-Trees to quickly narrow down the search.',
        goDeeper: {
          explanation: String.raw`WORST CASE IN HIGH d

KD-trees degrade toward linear scan when d ≫ log n—intrinsic dimension matters more than ambient d.

BALL TREES

Better for clustered data; metric properties exploited for pruning.

APPROXIMATE NN

Annoy, FAISS, HNSW trade exactness for speed at web scale.`,
        },
      },
    },
    {
      id: 'tie-breaking',
      title: 'Ties and Odd K',
      visualizationProps: {
        mode: 'tie-viz',
      },
      content: {
        text: 'What if K=4 and the vote is 2 against 2? We have a tie! This is why, for binary classification, we almost always pick an ODD number for K (3, 5, 7...).',
        goDeeper: {
          explanation: String.raw`MULTI-CLASS TIES

Use weighted votes, lowest aggregate distance sum per class, or random tie-break with reproducible seed.

PROBABILISTIC OUTPUT

k-NN can output empirical class frequencies p̂(c) = (# of class c in neighbors)/k as a crude probability vector.`,
        },
      },
    },
    {
      id: 'imbalanced-knn',
      title: 'The Majority Bias',
      visualizationProps: {
        mode: 'imbalance-viz',
      },
      content: {
        text: 'If 90% of your data is "Class A", a large K will almost always predict "Class A" just because there are more of them nearby.',
        goDeeper: {
          explanation: String.raw`PRIOR DOMINANCE

Under class imbalance, neighborhood votes reflect base rate. Remedies: class-weighted distances, oversampling (SMOTE), undersampling majority, or choosing k per class.

COST-SENSITIVE DECISION

Weight votes by misclassification costs c(ŷ,y) in risk minimization view.

F1-AWARE k

Tune k on PR curve, not accuracy alone, when positives are rare.`,
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with KNN. Drag the test point and see how different values of K change the decision boundary.',
    parameters: [
      { id: 'k', label: 'Value of K', type: 'slider', min: 1, max: 9, step: 2, default: 3 },
      { id: 'metric', label: 'Distance Metric', type: 'select', options: ['euclidean', 'manhattan'], default: 'euclidean' },
    ],
    tryThis: [
      'Set K to 9. Notice how the predominant class tends to win the vote more easily.',
      'Always pick an odd number for K in a 2-class problem to prevent ties!',
    ],
  },
  challenges: [
    {
      id: 'noisy-boundary',
      title: 'Smooth the Boundary',
      description: 'Find a value for K that successfully classifies the test point as Red (Class 0) despite the nearby noisy Blue (Class 1) points.',
      props: {
        mode: 'challenge',
        points: [
          { x: 3, y: 7, class: 0 },
          { x: 2, y: 8, class: 0 },
          { x: 4, y: 8, class: 0 },
          { x: 2, y: 6, class: 0 },
          { x: 5, y: 6, class: 1 },
          { x: 4, y: 5, class: 1 },
          { x: 8, y: 2, class: 1 },
          { x: 9, y: 3, class: 1 },
          { x: 7, y: 1, class: 1 },
        ],
        testPoint: { x: 4.5, y: 6.5 },
        k: 1,
      },
      completionCriteria: { type: 'threshold', target: 0, metric: 'class_0_wins' },
      hints: [
        'If K=1, the nearest neighbor is clearly Blue.',
        'If you expand the circle enough by increasing K, the vote will eventually capture more of the dense Red cluster.',
      ],
    },
  ],
};

export default knnModule;
