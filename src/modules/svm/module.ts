import type { ModuleData } from '@/core/types';

const svmModule: ModuleData = {
  id: 'svm',
  tierId: 1,
  clusterId: 'classical-ml',
  title: 'Support Vector Machines (SVM)',
  description:
    'Master the geometry of classification. Learn how to find the "Maximum Margin" and use the "Kernel Trick" to solve non-linear problems.',
  tags: ['ml-fundamentals', 'svm', 'margins', 'kernel-trick', 'optimization'],
  prerequisites: ['linear-algebra-basics', 'optimization'],
  difficulty: 'intermediate',
  estimatedMinutes: 65,
  steps: [
    {
      id: 'maximum-margin',
      title: 'The Maximum Margin Classifier',
      visualizationProps: {
        mode: 'margin-viz',
        dataset: 'linearly-separable',
        showMargin: true,
      },
      content: {
        text: 'While many lines can separate two classes, SVM looks for the one that is the "farthest" from both. This is the line that maximizes the margin—the distance between the boundary and the closest points (Support Vectors).',
        goDeeper: {
          math: String.raw`w^\top x - b = 0, \quad \text{margin width } = \frac{2}{\|w\|}`,
          explanation: String.raw`GEOMETRY

Separating hyperplane normal w defines signed distances to the plane. Scaling (w,b) does not change the plane, so fix ‖w‖ indirectly by maximizing margin 2/‖w‖ subject to y_i(w^⊤ x_i − b) ≥ 1 for all i. Those on the equality are support vectors.

QUADRATIC PROGRAM

Primal SVM minimizes ½‖w‖² (monotone in margin) under linear inequality constraints—convex QP with unique optimum for separable data.

GENERALIZATION INTUITION

Large margins compress the version space of consistent classifiers; VC-style bounds suggest better test error when the training set is separated with slack.`,
        },
      },
      interactionHint: 'Drag the separator line. Notice how the margin (the shaded gutter) changes. Your goal is to make it as wide as possible.',
    },
    {
      id: 'support-vectors',
      title: 'The Support Vectors',
      visualizationProps: {
        mode: 'margin-viz',
        dataset: 'linearly-separable',
        highlightVectors: true,
      },
      content: {
        text: 'Not all data points matter equally. The "Support Vectors" are the points that lie exactly on the edge of the margin. If you move any other point, the boundary stays the same. If you move a support vector, the boundary must move.',
        goDeeper: {
          explanation: String.raw`KKT COMPLEMENTARITY

In the dual solution, Lagrange multipliers α_i > 0 only for constraints that are tight—points on or inside the margin gutter. Interior points have α_i = 0 and do not appear in w = Σ α_i y_i x_i.

SPARSITY

Prediction score is Σ α_i y_i x_i^⊤ x + b; only support vectors contribute. That yields fast evaluation when SV count ≪ n.

ROBUSTNESS TO OUTLIERS FAR FROM BOUNDARY

Moving a non-SV point within its half-space does not flip the optimizer as long as it does not cross the margin.`,
        },
      },
      interactionHint: 'Click on different points. Only those on the "gutter" lines are true support vectors.',
    },
    {
      id: 'kernel-trick',
      title: 'The Kernel Trick',
      visualizationProps: {
        mode: 'kernel-3d-viz',
        dataset: 'circles',
      },
      content: {
        text: 'What if data isn\'t linearly separable? In 2D, you can\'t draw a straight line to separate concentric circles. But if we "lift" the points into 3D (e.g., $z = x^2 + y^2$), a flat plane can slice through them perfectly.',
        goDeeper: {
          math: String.raw`K(x,x') = \phi(x)^\top \phi(x')`,
          explanation: String.raw`FEATURE MAP

Dual SVM depends on inner products x_i^⊤ x_j. Replacing them with K(x_i,x_j) is equivalent to lifting φ(x) if K is a valid positive semi-definite kernel (Mercer).

RBF KERNEL

Gaussian RBF K(x,x') = exp(−γ‖x−x'‖²) implicitly uses an infinite-dimensional φ; decision boundaries can be highly non-linear in original space.

COMPUTATIONAL WIN

Never materialize φ(x) ∈ ℝ^∞—work only with n×n Gram matrix G_ij = K(x_i,x_j).`,
        },
      },
      interactionHint: 'Toggle the "Lift to 3D" button to see the 2D circles become linearly separable in 3D.',
    },
    {
      id: 'soft-margin',
      title: 'C-Parameter: Handling Noise',
      visualizationProps: {
        mode: 'margin-viz',
        dataset: 'noisy',
        cValue: 1.0,
      },
      content: {
        text: 'Real-world data is messy. If we demand a "Hard Margin" (zero errors), even one outlier can ruin the model. SVM uses a penalty parameter "C" to allow some points to cross the margin in exchange for a wider, more general boundary.',
        goDeeper: {
          math: String.raw`\min_{w,b,\xi} \tfrac{1}{2}\|w\|^2 + C\sum_i \xi_i \quad \text{s.t. } y_i(w^\top x_i - b) \ge 1 - \xi_i,\ \xi_i \ge 0`,
          explanation: String.raw`SLACK VARIABLES

ξ_i measures hinge violation of the margin constraint. Large C penalizes slacks heavily → narrow margin, low training error. Small C tolerates more misclassification margin-side for smoother boundaries.

HINGE LOSS LINK

Primal soft-margin SVM is closely related to minimizing ‖w‖² plus Σ max(0, 1 − y_i f(x_i)) with appropriate scaling.

BIAS–VARIANCE

C is a classical bias–variance knob analogous to regularization strength in other linear classifiers.`,
        },
      },
      interactionHint: 'Adjust the C-Parameter slider and watch the boundary ignore or obsess over outliers.',
    },
    {
      id: 'primal-vs-dual',
      title: 'Primal vs Dual Form',
      visualizationProps: {
        mode: 'dual-viz',
      },
      content: {
        text: 'The math for SVM can be written in two ways. The "Primal" form is intuitive (finding the line), but the "Dual" form is where the magic happens—it reveals that the weights are just a weighted sum of the Support Vectors.',
        goDeeper: {
          math: String.raw`w = \sum_i \alpha_i y_i x_i, \quad 0 \le \alpha_i \le C,\ \sum_i \alpha_i y_i = 0`,
          explanation: String.raw`LAGRANGE DUALITY

Maximize Σ α_i − ½ Σ_{ij} α_i α_j y_i y_j x_i^⊤ x_j subject to box constraints and Σ α_i y_i = 0. Kernel substitution is trivial in dual—only dot products appear.

SMO AND LIBSVM

Efficient solvers (Sequential Minimal Optimization) exploit low-rank structure and sparsity of α.

PRIMAL WHEN d ≪ n

If feature dimension after explicit φ is moderate, primal methods can win; for kernels, dual stays standard.`,
        },
      },
    },
    {
      id: 'rbf-gamma',
      title: 'The RBF Kernel & Gamma',
      visualizationProps: {
        mode: 'gamma-viz',
        interactive: true,
      },
      content: {
        text: 'The RBF (Radial Basis Function) is the most popular kernel. It has a hidden param: Gamma. It controls how "far" the influence of a single point reaches.',
        goDeeper: {
          math: String.raw`K_\gamma(x,y) = \exp(-\gamma \|x-y\|^2)`,
          explanation: String.raw`LENGTH SCALE

Large γ → narrow Gaussians → boundary follows local points (high capacity, overfit risk). Small γ → wide Gaussians → smoother boundary (underfit risk).

FOURIER FEATURE VIEW

RBF RKHS contains functions with bandwidth tied to γ; spectral bias affects which frequencies the classifier learns first.

NYSTRÖM / RANDOM FEATURES

Approximate infinite φ with finite-dimensional random Fourier features for scalable kernel SVM on large n.`,
        },
      },
      interactionHint: 'Tweak the Gamma slider to see the boundary "shrinkwrap" around individual points.',
    },
    {
      id: 'sv-math',
      title: 'What makes a Support Vector?',
      visualizationProps: {
        mode: 'margin-viz',
        highlightVectors: true,
      },
      content: {
        text: 'Mathematically, a Support Vector is any point where its Lagrange multiplier $\\alpha_i$ is greater than zero. These points are literally "supporting" the decision wall.',
        goDeeper: {
          explanation: String.raw`COMPLEMENTARITY CONDITIONS

At optimum, α_i(y_i f(x_i) − 1 + ξ_i) = 0. If point is strictly inside its margin half-space with ξ_i = 0, then α_i = 0.

DECISION FUNCTION

b is recovered from any SV with 0 < α_i < C using y_i f(x_i) = 1.

SV COUNT AS CAPACITY PROXY

More SVs often indicate a more complex boundary and higher risk of overfitting for fixed γ.`,
        },
      },
    },
    {
      id: 'multiclass-svm',
      title: 'Multi-class: One-vs-Rest',
      visualizationProps: {
        mode: 'multiclass-viz',
      },
      content: {
        text: 'SVM is naturally a binary (yes/no) classifier. To handle 3 or more classes, we use the "One-vs-Rest" strategy: we train one SVM for "Class A vs Everything Else", one for "Class B vs Everything Else", and so on.',
        goDeeper: {
          explanation: String.raw`SCORE FUSION

Each binary classifier outputs signed distance f_k(x); predict argmax_k f_k(x). Calibration across margins is imperfect—Platt scaling or pairwise coupling (OvO) mitigates.

COMPLEXITY

Train K SVMs for K classes; inference is O(K · #SV_total) in naive form.

STRUCTURED EXTENSIONS

Crammer–Singer multiclass SVM solves a single joint QP with vector margins—fewer heuristics than OvR.`,
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with SVM boundaries. Change datasets, adjust the margin width (C), and test different kernels.',
    parameters: [
      { id: 'dataset', label: 'Dataset', type: 'select', options: ['separable', 'noisy', 'moons', 'circles'], default: 'separable' },
      { id: 'c', label: 'C (Penalty)', type: 'slider', min: 0.1, max: 10, step: 0.1, default: 1.0 },
      { id: 'kernel', label: 'Kernel', type: 'select', options: ['linear', 'polynomial', 'rbf'], default: 'linear' },
    ],
    tryThis: [
      'Use the RBF kernel on the Moons dataset. See how the boundary "wraps" around the points.',
      'On the Noisy dataset, lower C to 0.1. Does the boundary become more stable?',
    ],
  },
  challenges: [
    {
      id: 'maximize-margin',
      title: 'The Margin Optimizer',
      description: 'Adjust the boundary to achieve a margin width of at least 1.5 units on this dataset.',
      props: {
        mode: 'margin-viz',
        dataset: 'challenge-sep',
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 1.5, metric: 'marginWidth' },
      hints: [
        'The margin is the distance between the two parallel "gutter" lines.',
        'Rotate and translate the line until it is perfectly centered between the two closest groups of points.',
      ],
    },
  ],
};

export default svmModule;
