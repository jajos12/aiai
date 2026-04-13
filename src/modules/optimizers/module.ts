import type { ModuleData } from '@/core/types';

const optimizersModule: ModuleData = {
  id: 'optimizers',
  tierId: 2,
  clusterId: 'neural-networks',
  title: 'Optimizers: Navigating the Loss Landscape',
  description:
    'Peek under the hood of how AI actually learns. Compare SGD, Momentum, and Adam as they race to find the lowest point in a complex 3D landscape.',
  tags: ['deep-learning', 'optimizers', 'sgd', 'momentum', 'adam', 'loss-landscape'],
  prerequisites: ['backpropagation', 'optimization'],
  difficulty: 'intermediate',
  estimatedMinutes: 60,
  steps: [
    {
      id: 'loss-landscapes',
      title: 'The Loss Landscape',
      visualizationProps: {
        mode: 'landscape-viz',
        surface: 'bowl',
        showPath: true,
      },
      content: {
        text: 'Imagine a high-dimensional mountain range where the "height" is the error (loss). Learning is the act of finding the lowest valley. The steeper the terrain, the faster we move—but the riskier it becomes.',
        goDeeper: {
          explanation: String.raw`HIGH-DIMENSIONAL GEOMETRY

Loss L(θ) for θ ∈ ℝ^p with p≈10⁹ is impossible to visualize; 2-D slices can mislead. Empirically many minima are connected by flat valleys (mode connectivity).

NOISY GRADIENTS

Minibatch SGD injects noise whose covariance structure can help escape sharp minima—implicit regularization effect.

HessIAN SPECTRUM

Condition number κ = λ_max/λ_min of ∇²L controls GD speed; optimizers precondition to reduce effective κ.`,
        },
      },
      interactionHint: 'Click anywhere on the landscape to drop a "worker" and watch it slide down the gradient toward the minimum.',
    },
    {
      id: 'momentum-physics',
      title: 'Inertia: Momentum',
      visualizationProps: {
        mode: 'comparison-viz',
        surface: 'ravine',
        optimizers: ['sgd', 'momentum'],
      },
      content: {
        text: 'Vanilla SGD (Stochastic Gradient Descent) is like a ball with no mass—it stops the moment the gradient hits 0. Momentum adds "physical inertia." It helps the optimizer blast through small plateaus and stay steady in narrow ravines.',
        goDeeper: {
          math: String.raw`v_t = \beta v_{t-1} + (1-\beta) g_t, \quad \theta_t = \theta_{t-1} - \alpha v_t`,
          explanation: String.raw`EMA OF GRADIENTS

β≈0.9 keeps history ~10 steps; reduces variance in stochastic gradients.

CONVEX QUADRATIC ANALYSIS

Momentum root convergence rate improves when spectrum of Hessian is spread—aligns update along low-curvature directions faster.

NESTEROV

Lookahead gradient at θ − αv damps oscillations across narrow valleys.`,
        },
      },
      interactionHint: 'Watch how Momentum (blue) avoids the jittery oscillations of vanilla SGD (red) in the narrow ravine.',
    },
    {
      id: 'adaptive-rates-adam',
      title: 'Adaptivity: Adam',
      visualizationProps: {
        mode: 'comparison-viz',
        surface: 'saddle',
        optimizers: ['momentum', 'adam'],
      },
      content: {
        text: 'Different weights might need different learning rates. Adam (Adaptive Moment Estimation) keeps track of both the average gradient (momentum) AND the average squared gradient (to measure volatility). It automatically scales the step size for each individual weight.',
        goDeeper: {
          math: String.raw`m_t=\beta_1 m_{t-1}+(1-\beta_1)g_t,\quad v_t=\beta_2 v_{t-1}+(1-\beta_2)g_t^2`,
          explanation: String.raw`BIAS CORRECTION

\hat m_t = m_t/(1-\beta_1^t), \hat v_t = v_t/(1-\beta_2^t) fixes zero initialization.

ADAPTIVE PRECONDITIONER

Effective step ∝ g_t / (√\hat v_t + ε) resembles diagonal AdaGrad with decay.

TRANSFORMER DEFAULT

AdamW decouples weight decay from adaptive step—standard in NLP/CV pretraining.`,
        },
      },
      interactionHint: 'Observe how Adam handles the "Saddle Point" (a flat plateau that looks like a horse saddle)—it speeds up much faster than Momentum.',
    },
    {
      id: 'batch-sizes',
      title: 'Batch vs Mini-Batch vs SGD',
      visualizationProps: {
        mode: 'path-comparison-viz',
      },
      content: {
        text: 'Should we calculate the gradient for the WHOLE dataset at once? That is "Batch Gradient Descent". Or one point at a time? That is "Stochastic" (SGD). Most people use "Mini-Batch"—a sweet spot in the middle.',
        goDeeper: {
          explanation: String.raw`NOISE SCALING

Gradient variance ∝ 1/B for batch size B; larger B smoother updates, more memory, better vectorization.

CRITICAL BATCH SIZE

Beyond a point, linear speedup stops due to memory bandwidth; mixed precision and gradient accumulation simulate large B.

GENERALIZATION LORE

Small B often finds flatter minima (debated); learning rate may need scaling with B (linear scaling rule) when increasing batch.`,
        },
      },
    },
    {
      id: 'rmsprop-adagrad',
      title: 'The Ancestors: AdaGrad & RMSprop',
      visualizationProps: {
        mode: 'comparison-viz',
        surface: 'ravine',
        optimizers: ['adagrad', 'rmsprop'],
      },
      content: {
        text: 'Before Adam, we had AdaGrad (which slowed down every weight) and RMSprop (which fixed AdaGrad by using a moving average). Understanding these explains exactly WHY Adam works so well.',
        goDeeper: {
          explanation: String.raw`ADAGRAD ACCUMULATOR

G_t = Σ g_τ² grows monotonically → learning rate → 0 eventually—good for sparse convex problems, bad for deep nets long-run.

RMSPROP EMA

v_t = β v_{t-1} + (1-β)g_t² forgets ancient past, keeps steps alive.

ADAM = MOMENTUM + RMS

Combine first and second moment tracking with bias fix.`,
        },
      },
    },
    {
      id: 'lr-warmup',
      title: 'The Warmup Phase',
      visualizationProps: {
        mode: 'warmup-viz',
      },
      content: {
        text: 'At the very start of training, the model is totally random and gradients can be massive. We often start with an extremely tiny learning rate and "warm up" to our target over the first few thousand steps.',
        goDeeper: {
          explanation: String.raw`ATTENTION LOGIT SCALE

Early layers with large gradients can push softmax near one-hot, killing gradient flow through attention; warmup stabilizes.

LINEAR RAMP

α_t = α_max · min(1, t/T_warm) is common; cosine thereafter.

LARGE BATCH

Warmup pairs with linear LR scaling when B jumps—avoid shock to dynamics.`,
        },
      },
    },
    {
      id: 'nesterov-momentum',
      title: 'Nesterov: Looking Ahead',
      visualizationProps: {
        mode: 'nesterov-viz',
      },
      content: {
        text: 'Standard Momentum calculates the gradient at the current spot and THEN adding speed. Nesterov Momentum is "smarter"—it jumps ahead and calculates the gradient where we are MOVING to.',
        goDeeper: {
          explanation: String.raw`UPDATE EQUIVALENT FORM

Some implementations use g_t = ∇L(θ_{t-1} − α v_{t-1}) with standard momentum recursion—same lookahead idea.

CONVEX RATE IMPROVEMENT

For smooth convex functions, NAG achieves O(1/t²) in certain setups vs O(1/t) for GD.

PRACTICE

Less common than Adam in Transformers; still used in some CV CNN schedules.`,
        },
      },
    },
    {
      id: 'local-minima-depth',
      title: 'Local Minima: Fact or Fiction?',
      visualizationProps: {
        mode: 'landscape-viz',
        surface: 'local-minima',
        interactive: true,
      },
      content: {
        text: 'People used to fear "getting stuck" in a shallow local minimum. In millions of dimensions, this is actually rare—there is usually at least one direction that continues to slope down.',
        goDeeper: {
          explanation: String.raw`SADDLES DOMINATE

Random initialization in high-D rarely lands near strict local minima; plateaus with small negative curvature directions (saddles) slow progress more than minima.

FLAT VS SHARP MINIMA

Flat basins correlate (empirically) with better generalization; SAM optimizer explicitly seeks flat regions.

ADAM AT SADDLES

Second moment estimate adds noise helping escape; still no free lunch on ill-conditioned surfaces.`,
        },
      },
    },
  ],
  playground: {
    description: 'Race different optimizers! Choose a landscape, set hyperparameters, and see who reaches the global minimum first.',
    parameters: [
      { id: 'surface', label: 'Landscape', type: 'select', options: ['bowl', 'ravine', 'saddle', 'local-minima'], default: 'bowl' },
      { id: 'lr', label: 'Learning Rate', type: 'slider', min: 0.001, max: 0.5, step: 0.001, default: 0.1 },
      { id: 'beta', label: 'Momentum (Beta)', type: 'slider', min: 0.5, max: 0.99, step: 0.01, default: 0.9 },
    ],
    tryThis: [
      'Set a very high learning rate on the "Local Minima" surface. Does the optimizer jump out of the trap?',
      'Compare Adam vs SGD on the "Saddle" surface. Notice the difference in "acceleration".',
    ],
  },
  challenges: [
    {
      id: 'escape-saddle',
      title: 'The Saddle Point Escape',
      description: 'Find a combination of Optimizer and Learning Rate that reaches the center (loss < 0.05) in under 100 steps on the "Saddle" surface.',
      props: {
        mode: 'landscape-viz',
        surface: 'saddle',
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 0.05, metric: 'minLoss' },
      hints: [
        'Vanilla SGD often gets stuck or moves incredibly slowly on flat saddle points.',
        'Try using Adam or Momentum with a slightly higher learning rate.',
      ],
    },
  ],
};

export default optimizersModule;
