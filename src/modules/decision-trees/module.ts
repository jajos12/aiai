import type { ModuleData } from '@/core/types';

const decisionTreesModule: ModuleData = {
  id: 'decision-trees',
  tierId: 1,
  clusterId: 'classical-ml',
  title: 'Decision Trees & Entropy',
  description:
    'Learn how AI makes decisions by splitting data. Master Entropy, Gini Impurity, and Information Gain.',
  tags: ['ml-fundamentals', 'decision-trees', 'entropy', 'information-gain'],
  prerequisites: ['probability-basics'],
  difficulty: 'intermediate',
  estimatedMinutes: 55,
  steps: [
    {
      id: 'recursive-partitioning',
      title: 'Recursive Partitioning',
      visualizationProps: {
        mode: 'partition',
        dataset: 'simple-split',
        showTree: true,
      },
      content: {
        text: 'A Decision Tree works by asking a series of yes/no questions to partition the data into pure groups. We start with a messy mix and look for the "best split"—the one that separates the classes most cleanly.',
        goDeeper: {
          explanation: String.raw`AXIS-ALIGNED SPLITS

Each internal node applies a threshold on one feature x_j ≤ t, inducing hyper-rectangular regions. The induced partition is piecewise constant—great for tabular data, unstable for tiny rotations in feature space.

STOPPING RULES

Max depth, min samples per leaf, min impurity decrease, or max leaves cap recursion and prevent memorization.

GREEDY OPTIMALITY

Splits are chosen myopically to maximize immediate impurity drop; global optimum of tree structure is NP-hard in general—hence ensembles (Random Forests) average many greedy trees.`,
        },
      },
      interactionHint: 'Click on the data plot to suggest a horizontal or vertical split line.',
    },
    {
      id: 'understanding-entropy',
      title: 'Measuring Messiness: Entropy',
      visualizationProps: {
        mode: 'entropy-viz',
        initialP: 0.5,
      },
      content: {
        text: 'How do we mathematically define "messiness"? In Information Theory, we use Entropy. If a bag has an equal mix of red and blue balls, Entropy is at its maximum (1.0). If it has only red balls, Entropy is 0.0.',
        goDeeper: {
          math: String.raw`H(p) = -\sum_{k=1}^c p_k \log_2 p_k`,
          explanation: String.raw`SHANNON ENTROPY

For empirical class proportions p_k in a node, H measures expected bits to encode a draw. Uniform p → maximum; one-hot p → zero.

DIFFERENT BASES

Using log_2 gives bits; natural log differs by a constant factor only.

RELATION TO LIKELIHOOD

Maximum likelihood split gains connect to entropy reductions when generative model is multinomial.`,
        },
      },
      interactionHint: 'Drag the slider to change the class distribution and watch the Entropy curve react.',
    },
    {
      id: 'information-gain',
      title: 'Information Gain: The Splitting Criteria',
      visualizationProps: {
        mode: 'infogain-viz',
        splitX: 5,
      },
      content: {
        text: 'Information Gain (IG) is the reduction in entropy achieved by a split. We calculate the entropy before the split and subtract the weighted average entropy of the two new regions. The split with the highest IG is the winner.',
        goDeeper: {
          math: String.raw`\mathrm{IG}(S,A) = H(S) - \sum_{v} \frac{|S_v|}{|S|} H(S_v)`,
          explanation: String.raw`WEIGHTED CHILD IMPURITY

Each branch v gets mass |S_v|/|S|. Categorical multi-way splits sum over all children.

BIAS TOWARD MANY-VALUED FEATURES

IG favors features with many outcomes; gain ratio (Quinlan) normalizes by split information.

CART FOR CLASSIFICATION

Gini replaces H for faster computation; both are concave impurity functions minimized toward pure leaves.`,
        },
      },
      interactionHint: 'Drag the vertical split line and observe how the Information Gain changes based on how "pure" the resulting boxes become.',
    },
    {
      id: 'overfit-viz',
      title: 'Overfitting: The Deep Tree',
      visualizationProps: {
        mode: 'overfit-viz',
        maxDepth: 10,
      },
      content: {
        text: 'A tree that grows too deep starts memorizing noise. It creates tiny, jagged boxes around every single data point. This model will fail when it sees new, unseen data.',
        goDeeper: {
          explanation: String.raw`VC DIMENSION SKETCH

Deep axis-aligned trees can shatter many points in low dimensions → huge capacity. Training error → 0 is easy; gap risk explodes.

REGULARIZATION VIA PRUNING / DEPTH

Cost-complexity pruning adds λ·(number of leaves) penalty; cross-validation picks λ.

ENSEMBLE VARIANCE REDUCTION

Bagging many deep trees and averaging (Random Forest) trades individual variance for better bias–variance balance.`,
        },
      },
      interactionHint: 'Watch how the boundary becomes incredibly complex as the tree grows deeper.',
    },
    {
      id: 'gini-impurity',
      title: 'Gini vs Entropy',
      visualizationProps: {
        mode: 'gini-viz',
      },
      content: {
        text: 'While we used Entropy, many libraries (like Scikit-Learn) use "Gini Impurity" by default. It is mathematically similar but faster to calculate because it doesn\'t use logarithms.',
        goDeeper: {
          math: String.raw`G(p) = 1 - \sum_k p_k^2 = \sum_{k<k'} p_k p_{k'}`,
          explanation: String.raw`EXPECTED MISCLASSIFICATION RATE

If you label a random draw from the node by majority vote, Gini is the probability two independent draws disagree in class.

SPLITTING EQUIVALENCE

For binary classification, entropy and Gini are different curves but usually pick the same optimal split; ties can differ on multi-way splits.

COMPUTATIONAL EDGE

No logs—vectorized updates in histogram-based implementations (XGBoost/LightGBM).`,
        },
      },
    },
    {
      id: 'regression-trees',
      title: 'Trees for Numbers (Regression)',
      visualizationProps: {
        mode: 'regression-tree-viz',
      },
      content: {
        text: 'Can trees predict prices instead of classes? Yes! Instead of picking the "most common" class, a leaf node predicts the "Average" of all its points.',
        goDeeper: {
          math: String.raw`\min_{\text{splits}} \sum_{\text{leaves } \ell} \sum_{i \in \ell} (y_i - \bar{y}_\ell)^2`,
          explanation: String.raw`PIECEWISE CONSTANT SURFACES

Prediction is constant per cell; splits minimize within-leaf squared error (L2). L1 variants use medians and absolute error.

CONTINUOUS THRESHOLDS

For ordered x_j, only midpoints between sorted unique values need evaluation—O(n log n) per level with sorting reuse in clever libs.

EXTRAPOLATION

Trees cannot predict outside training range in leaves—flat extrapolation; linear models or ensembles with trend may help.`,
        },
      },
    },
    {
      id: 'pruning-intuition',
      title: 'Pruning: Cutting the Branches',
      visualizationProps: {
        mode: 'pruning-viz',
      },
      content: {
        text: 'Pruning is the process of removing branches that provide little predictive power. It turns an overly complex tree into a simpler, more robust one.',
        goDeeper: {
          explanation: String.raw`POST-PRUNING ALGORITHM

Grow large tree T_max, then for each internal node evaluate validation loss if subtree collapsed to leaf. Accept collapse if error + complexity penalty improves.

MINIMAL COST-COMPLEXITY

Breiman et al.: sequence of nested subtrees T_α indexed by penalty α; cross-validation picks α.

EARLY STOPPING

Pre-pruning via max_depth/min_samples_leaf stops growth before full fit—faster but less exhaustive search than post-prune.`,
        },
      },
    },
    {
      id: 'feature-importance',
      title: 'Feature Importance',
      visualizationProps: {
        mode: 'importance-viz',
      },
      content: {
        text: 'Trees naturally tell us which features are most important. A feature that is used at the very top of the tree to make large splits is much more significant than one dangling at the bottom.',
        goDeeper: {
          explanation: String.raw`MEAN DECREASE IMPURITY

Sum over nodes using feature j of (N_node/N_total)·Δ impurity when split. Fast but biased toward high-cardinality features.

PERMUTATION IMPORTANCE

Shuffle feature j on validation set, measure drop in score—model-agnostic, more costly.

INTERACTIONS

Trees capture interactions; importance is marginal summary—SHAP values give finer attribution.`,
        },
      },
    },
  ],
  playground: {
    description: 'Grow your own decision tree. Select split points manually or let the algorithm find the best ones.',
    parameters: [
      { id: 'dataset', label: 'Dataset Type', type: 'select', options: ['boxes', 'overlapping', 'moons'], default: 'boxes' },
      { id: 'maxDepth', label: 'Max Depth', type: 'slider', min: 1, max: 8, step: 1, default: 3 },
      { id: 'criterion', label: 'Impurity Criterion', type: 'select', options: ['entropy', 'gini'], default: 'entropy' },
    ],
    tryThis: [
      'Try splitting the "Moons" dataset with depth 2 vs depth 8. Notice the "staircase" boundaries.',
      'Can you reach 0 entropy with 3 splits on the Boxes dataset?',
    ],
  },
  challenges: [
    {
      id: 'calculate-entropy',
      title: 'The Entropy Master',
      description: 'Find a split that achieves an Information Gain of at least 0.40.',
      props: {
        mode: 'infogain-viz',
        dataset: 'challenge-dist',
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 0.4, metric: 'infogain' },
      hints: [
        'Look for the point on the X-axis where the separation between red and blue points is most distinct.',
        'Information gain is maximized when the resulting children are as "pure" as possible.',
      ],
    },
  ],
};

export default decisionTreesModule;
