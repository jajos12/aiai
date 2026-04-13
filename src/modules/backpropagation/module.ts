import type { ModuleData } from '@/core/types';

const backpropagationModule: ModuleData = {
  id: 'backpropagation',
  tierId: 2,
  clusterId: 'neural-networks',
  title: 'Backpropagation & Computational Graphs',
  description:
    'Peek inside the black box. Discover how neural networks learn via the chain rule, discovering how every weight contributed to the final error.',
  tags: ['deep-learning', 'backprop', 'chain-rule', 'computational-graph'],
  prerequisites: ['perceptrons', 'chain-rule', 'optimization'],
  difficulty: 'intermediate',
  estimatedMinutes: 75,
  steps: [
    {
      id: 'the-forward-pass',
      title: 'The Forward Pass',
      visualizationProps: {
        mode: 'forward',
        nodes: ['x', 'w', 'mult', 'b', 'add', 'relu', 'loss'],
        edges: [
          { from: 'x', to: 'mult' },
          { from: 'w', to: 'mult' },
          { from: 'mult', to: 'add' },
          { from: 'b', to: 'add' },
          { from: 'add', to: 'relu' },
          { from: 'relu', to: 'loss' },
        ],
        values: { x: 2, w: 3, b: -4, target: 5 },
      },
      content: {
        text: 'A Neural Network is just a massive sequence of simple math operations (multiplication, addition, activation). We can draw this as a "Computational Graph". Data flows from left to right—this is the Forward Pass.',
        goDeeper: {
          explanation: String.raw`DAG SEMANTICS

Each node is an operator with local inputs; edges are tensor dependencies. Forward evaluation is a topological sort O(|V|+|E|) for fixed architecture.

MEMORY FOR TRAINING

Frameworks cache activations needed on the backward pass—trade RAM for speed (checkpointing recomputes some forwards to save memory).

SCALAR LOSS

Supervised training ends at scalar L so reverse-mode AD yields one adjoint sweep for all parameters.`,
        },
      },
      interactionHint: 'Change the inputs (x), weights (w), or bias (b) and see how the computation ripples forward to change the Loss.',
    },
    {
      id: 'local-gradients',
      title: 'Local Gradients',
      visualizationProps: {
        mode: 'local-gradients',
        nodes: ['x', 'w', 'mult', 'b', 'add', 'relu', 'loss'],
        edges: [
          { from: 'x', to: 'mult' },
          { from: 'w', to: 'mult' },
          { from: 'mult', to: 'add' },
          { from: 'b', to: 'add' },
          { from: 'add', to: 'relu' },
          { from: 'relu', to: 'loss' },
        ],
        values: { x: 2, w: 3, b: -4, target: 5 },
      },
      content: {
        text: 'To fix the error, we need to know: "If I tweak this specific number slightly, how much will the immediate output change?" This is the partial derivative, or Local Gradient.',
        goDeeper: {
          math: String.raw`\frac{\partial (w x)}{\partial w} = x, \quad \frac{\partial (w x)}{\partial x} = w`,
          explanation: String.raw`ELEMENTARY RULES

Add node: ∂c/∂a=∂c/∂b=1. Mul node: ∂(ab)/∂a=b. ReLU: derivative 1 if a>0 else 0 (subgradient at 0).

NUMERICAL STABILITY

Analytic local Jacobians beat finite differences O(ε) error and cost.

VECTOR VERSIONS

For tensor ops, local gradient is a Jacobian; backprop implements efficient VJP without forming full matrix.`,
        },
      },
      interactionHint: 'Hover over the mathematical operations to see their local gradient formulas.',
    },
    {
      id: 'the-backward-pass',
      title: 'The Backward Pass (Chain Rule)',
      visualizationProps: {
        mode: 'backward',
        nodes: ['x', 'w', 'mult', 'b', 'add', 'relu', 'loss'],
        edges: [
          { from: 'x', to: 'mult' },
          { from: 'w', to: 'mult' },
          { from: 'mult', to: 'add' },
          { from: 'b', to: 'add' },
          { from: 'add', to: 'relu' },
          { from: 'relu', to: 'loss' },
        ],
        values: { x: 2, w: 3, b: -4, target: 5 },
      },
      content: {
        text: 'This is the magic of Deep Learning. Starting from the error at the end, we cascade backward. We multiply the incoming gradient by the local gradient to pass the error blame down the chain.',
        goDeeper: {
          math: String.raw`\frac{\partial L}{\partial w} = \frac{\partial L}{\partial z} \frac{\partial z}{\partial w}`,
          explanation: String.raw`REVERSE-MODE AD

One backward pass computes ∂L/∂θ for all parameters θ—cost proportional to forward FLOPs, independent of |θ| for typical nets.

MULTI-PATH GRAPHS

If w feeds two nodes, ∂L/∂w sums contributions from each path (multivariable chain rule).

SHARED SUBGRAPHS

Dynamic graphs (PyTorch) rebuild topology each forward; static graphs (XLA) fuse ops for speed.`,
        },
      },
      interactionHint: 'Click "Backpropagate!" to watch the gradients flow backward. Red means increase the weight, Blue means decrease.',
    },
    {
      id: 'gradient-descent',
      title: 'Gradient Descent (Weight Update)',
      visualizationProps: {
        mode: 'update',
        nodes: ['x', 'w', 'mult', 'b', 'add', 'relu', 'loss'],
        edges: [
          { from: 'x', to: 'mult' },
          { from: 'w', to: 'mult' },
          { from: 'mult', to: 'add' },
          { from: 'b', to: 'add' },
          { from: 'add', to: 'relu' },
          { from: 'relu', to: 'loss' },
        ],
        values: { x: 2, w: 3, b: -4, target: 5 },
        learningRate: 0.1,
      },
      content: {
        text: 'Once every weight knows its gradient, we update it. We subtract a tiny fraction of the gradient from the weight. This fraction is the "Learning Rate".',
        goDeeper: {
          math: String.raw`\theta \leftarrow \theta - \alpha \nabla_\theta L`,
          explanation: String.raw`DESCENT DIRECTION

For smooth convex L, gradient points uphill; negative step reduces L locally. Non-convex landscapes need schedules, restarts, noise (SGD).

STEP SIZE TRADEOFFS

Large α diverges; small α crawls. Line search, Adam, etc., adapt per-parameter or per-step.

STOCHASTIC MINIBATCHES

Replace ∇L_dataset with noisy minibatch estimate—faster and often better generalization.`,
        },
      },
      interactionHint: 'Adjust the Learning Rate slider and click "Step" to watch the weights update and the loss drop.',
    },
    {
      id: 'jacobian-math',
      title: 'Jacobians: Multi-Dimensional Gradients',
      visualizationProps: {
        mode: 'jacobian-viz',
      },
      content: {
        text: 'In real networks, we don\'t have single numbers; we have vectors and matrices. When we pass a vector through a layer, the local gradient becomes a matrix of every output\'s change relative to every input—the Jacobian.',
        goDeeper: {
          math: String.raw`J_{ij} = \frac{\partial y_i}{\partial x_j}`,
          explanation: String.raw`VECTOR-JACOBIAN PRODUCT

Backprop computes v^⊤J for cotangent v = ∂L/∂y without storing full J—crucial when y ∈ ℝ^m with m large.

LAYER EXAMPLES

Affine y = Wx + b: ∂L/∂W = (∂L/∂y) x^⊤. Elementwise σ: J is diagonal with σ'(x).

COMPOSITION

Chain rule for Jacobians is matrix multiply order-sensitive; reverse mode avoids explicit products.`,
        },
      },
    },
    {
      id: 'chain-rule-3d',
      title: 'Chain Rule in 3D',
      visualizationProps: {
        mode: '3d-graph-viz',
      },
      content: {
        text: 'Visualization often simplifies the graph. In reality, multiple paths can lead to the same weight. The gradient for that weight is the sum of gradients from all incoming paths.',
        goDeeper: {
          math: String.raw`\frac{\partial L}{\partial w} = \sum_{k \in \mathrm{paths}} \frac{\partial L}{\partial w}\Big|_{\mathrm{path }k}`,
          explanation: String.raw`FORK AND JOIN

If w fans out to branches that reconverge, multivariable calculus sums partial contributions—ResNet skip connections are canonical example.

CYCLE-FREE ASSUMPTION

Standard backprop assumes DAG; implicit layers / equilibrium models need implicit differentiation.

IMPLEMENTATION

Autograd engines register backward hooks per edge; scatter-add implements sum at join nodes.`,
        },
      },
    },
    {
      id: 'auto-diff',
      title: 'Automatic Differentiation',
      visualizationProps: {
        mode: 'auto-diff-demo',
      },
      content: {
        text: 'You don\'t have to write the math for every new model. Libraries like PyTorch and TensorFlow use "Auto-Diff" to automatically track every operation in a "Tape" and compute gradients for you.',
        goDeeper: {
          explanation: String.raw`NOT SYMBOLIC, NOT NUMERIC

Forward mode tracks ∂y/∂x for one x direction; reverse mode (backprop) tracks ∂L/∂· for one L—right for scalar loss, millions of params.

CUSTOM OPS

Define forward + backward (vjp) for new CUDA kernels; framework plugs into graph.

HIGHER ORDER

Hessian-vector products via double backward; full Hessians usually intractable.`,
        },
      },
    },
    {
      id: 'learning-schedules',
      title: 'Learning Rate Schedules',
      visualizationProps: {
        mode: 'lr-scheduler-viz',
      },
      content: {
        text: 'Why pick one learning rate? We often use "Schedules" that start fast and slow down as the model approaches the minimum to ensure perfectly fine-tuned results.',
        goDeeper: {
          explanation: String.raw`COSINE / WARMUP

Transformer training often uses linear warmup then cosine decay to stabilize attention logits early then fine-tune.

ONE-CYCLE

Super-convergence policy: increase then decrease α within one epoch sweep—empirical success in vision.

ADAPTIVE OPTIMIZERS

Adam couples schedule with per-parameter scaling; still often benefits from global decay.`,
        },
      },
    },
    {
      id: 'momentum-physics-deep',
      title: 'Physics of Momentum',
      visualizationProps: {
        mode: 'momentum-ball-viz',
      },
      content: {
        text: 'Backprop can be jittery. "Momentum" adds physical inertia. It accumulates speed in directions where the gradient is consistent and ignores noisy, bouncing directions.',
        goDeeper: {
          math: String.raw`v_t = \beta v_{t-1} + (1-\beta) g_t, \quad \theta_t = \theta_{t-1} - \alpha v_t`,
          explanation: String.raw`POLYAK / HEAVY BALL

Equivalent to exponential moving average of gradients; damps oscillations in ill-conditioned ravines.

NESTEROV VARIANT

Evaluates gradient after partial update—lookahead reduces overshoot.

CONTINUOUS TIME LIMIT

ODE interpretations connect SGD+momentum to damped Hamiltonian dynamics on loss surface.`,
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with a small computational graph. Change the target, learning rate, and inputs.',
    parameters: [
      { id: 'lr', label: 'Learning Rate', type: 'slider', min: 0.01, max: 0.5, step: 0.01, default: 0.1 },
      { id: 'target', label: 'Target Output', type: 'slider', min: -10, max: 10, step: 1, default: 5 },
      { id: 'x', label: 'Input (x)', type: 'slider', min: -5, max: 5, step: 0.5, default: 2 },
    ],
    tryThis: [
      'Set learning rate to 0.5 and watch the weights explode as they overshoot the target!',
      'Make the input (x) exactly 0. What happens to the gradient for the weight (w)?',
    ],
  },
  challenges: [
    {
      id: 'train-the-neuron',
      title: 'Manual Gradient Descent',
      description: 'Use the "Step" button to run backpropagation and drive the loss below 0.1.',
      props: {
        mode: 'challenge',
        nodes: ['x', 'w', 'mult', 'b', 'add', 'loss'],
        edges: [
          { from: 'x', to: 'mult' },
          { from: 'w', to: 'mult' },
          { from: 'mult', to: 'add' },
          { from: 'b', to: 'add' },
          { from: 'add', to: 'loss' },
        ],
        values: { x: 1.5, w: 1, b: 0, target: 8 },
        learningRate: 0.1,
      },
      completionCriteria: { type: 'threshold', target: 0.1, metric: 'loss' },
      hints: [
        'If learning rate is too low, you\'ll have to click Step many times.',
        'If it\'s too high, the loss might start increasing!',
      ],
    },
  ],
};

export default backpropagationModule;
