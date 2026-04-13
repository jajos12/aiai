import type { ModuleData } from '@/core/types';

const perceptronsModule: ModuleData = {
  id: 'perceptrons',
  tierId: 2,
  clusterId: 'neural-networks',
  title: 'Perceptrons & MLPs',
  description:
    'The artificial neuron, weights, biases, and activation functions — the building blocks of deep learning.',
  tags: ['perceptrons', 'neural-networks', 'deep-learning', 'activation'],
  prerequisites: ['linear-regression', 'optimization'],
  difficulty: 'intermediate',
  estimatedMinutes: 55,
  steps: [
    {
      id: 'biological-inspiration',
      title: 'The Artificial Neuron',
      visualizationProps: {
        mode: 'biological',
        inputs: [{ value: 1, weight: 0.5 }, { value: -1, weight: -0.5 }],
        bias: 0.5,
        activation: 'step',
      },
      content: {
        text: 'A perceptron takes inputs, multiplies them by weights, adds a bias, and passes the sum through an activation function.',
        goDeeper: {
          math: String.raw`a = \sum_i w_i x_i + b, \quad y = f(a)`,
          explanation: String.raw`AFFINE PRE-ACTIVATION

The dot product w^⊤x + b is an affine map ℝ^d → ℝ. Activation f introduces non-linearity (or thresholding for the classical perceptron).

GEOMETRY

Level set w^⊤x + b = 0 is a hyperplane; sign/step activation yields half-space classification.

BIOLOGICAL CARICATURE

Real neurons spike with refractory dynamics; the perceptron is a rate-coded caricature good for optimization stories.`,
        },
      },
    },
    {
      id: 'weighted-sum',
      title: 'The Weighted Sum',
      visualizationProps: {
        mode: 'interactive',
        draggableWeights: true,
        inputs: [{ value: 1, weight: 1 }, { value: 1, weight: 1 }],
        bias: -1.5,
        activation: 'step',
        showCalculation: true,
      },
      content: {
        text: 'Adjust the weights and bias. See how the sum changes. If the sum is > 0, the perceptron outputs 1. Otherwise, 0.',
        goDeeper: {
          explanation: String.raw`DOT PRODUCT AS SIMILARITY

w^⊤x measures alignment between pattern x and template w when ‖w‖ fixed; bias shifts threshold along normal direction.

LINEAR THRESHOLD UNIT

Binary output makes the model a linear classifier; decision boundary orthogonal to w.

DIFFERENTIABLE RELAXATION

Sigmoid σ(a) softens the step so gradients exist for SGD; perceptron rule historically did not need derivatives.`,
        },
      },
      quiz: {
        question: 'If inputs are [1, 1], weights are [0.5, 0.5], and bias is -1, what is the weighted sum before activation?',
        options: ['1', '0', '-0.5', '0.5'],
        correctIndex: 1,
        explanation: '(1 * 0.5) + (1 * 0.5) - 1 = 1 - 1 = 0.',
      },
      interactionHint: 'Drag the sliders to change weights and bias',
    },
    {
      id: 'activation-functions',
      title: 'Activation Functions',
      visualizationProps: {
        mode: 'activation',
        draggableWeights: true,
        inputs: [{ value: 2, weight: 1 }],
        bias: 0,
        activation: 'sigmoid',
        showGraph: true,
      },
      content: {
        text: 'A step function is too rigid for training (its derivative is 0 almost everywhere). We use smooth functions like Sigmoid or ReLU instead.',
        goDeeper: {
          math: String.raw`\sigma(a)=\frac{1}{1+e^{-a}}, \quad \mathrm{ReLU}(a)=\max(0,a)`,
          explanation: String.raw`COMPOSITION OF AFFINES IS AFFINE

Without f, stacking layers collapses to one linear map. Nonlinear f between layers enables universal approximation with width/depth.

SIGMOID SATURATION

σ' = σ(1−σ) vanishes at large |a|—deep sigmoid nets suffered vanishing gradients until ReLU era.

PROBABILISTIC READING

Sigmoid output can be interpreted as P(y=1|x) under logistic model; cross-entropy loss matches that probabilistic semantics.`,
        },
      },
    },
    {
      id: 'the-xor-problem',
      title: 'The XOR Problem (Preview)',
      visualizationProps: {
        mode: 'xor-preview',
      },
      content: {
        text: 'A single perceptron can only draw a straight line to separate data. It cannot solve problems where classes cannot be separated by a line (like XOR). This is why we need Multi-Layer Perceptrons (MLPs) — deep neural networks.',
        goDeeper: {
          explanation: String.raw`LINEAR SEPARABILITY

XOR vertices in ℝ^2 alternate labels on the hypercube; no w,b satisfy y_i(w^⊤x_i+b) > 0 for all four points.

MINSKY & PAPERT

1969 result cooled perceptron hype; multilayer nets + backprop (1986+) fixed representational limit.

FEATURE SPACE TRICK

Lift x → φ(x) (e.g., include x₁x₂) can linearize XOR—MLPs learn φ implicitly.`,
        },
      },
    },
    {
      id: 'nand-universality',
      title: 'NAND: The Universal Builder',
      visualizationProps: {
        mode: 'interactive',
        draggableWeights: true,
        inputs: [{ value: 1, weight: -2 }, { value: 1, weight: -2 }],
        bias: 3,
        activation: 'step',
      },
      content: {
        text: 'Computers are built with NAND gates. If a perceptron can act as a NAND gate, it can technically compute ANYTHING a computer can. All you need are enough perceptrons chained together.',
        goDeeper: {
          explanation: String.raw`BOOLEAN COMPLETENESS

{NAND} is functionally complete for binary logic; composing perceptron NANDs builds arbitrary Boolean circuits.

DEPTH VS SIZE

Circuit depth corresponds to network depth; width to parallel gates. Constant-depth threshold circuits (TC⁰) have rich complexity theory beyond this sketch.

NOISE AND RELIABILITY

Real gates fail; neural nets add redundancy and continuous activations—smoother than discrete logic.`,
        },
      },
    },
    {
      id: 'linear-separability',
      title: 'Linear Separability',
      visualizationProps: {
        mode: '2d-sep-viz',
      },
      content: {
        text: 'A single perceptron is a linear classifier. It can only solve a problem if you can draw a perfectly straight line between the classes. If the data is "interleaved" or circular, a single neuron is powerless.',
        goDeeper: {
          explanation: String.raw`MARGIN AND SUPPORT VECTORS

For separable data, many (w,b) work; SVM picks max margin separator—unique and well-studied generalization.

KERNELS (PREVIEW)

Implicit φ(x) can make data linearly separable in higher dimension—same limitation, richer geometry.

DEEP STACKS

Successive layers warp input space so that final layer sees linearly separable features.`,
        },
      },
    },
    {
      id: 'update-rule-math',
      title: 'The Perceptron Update Rule',
      visualizationProps: {
        mode: 'learning-viz',
        interactive: true,
      },
      content: {
        text: 'How do neurons learn? If the neuron makes a mistake, we nudge the weights in the direction that would have fixed it. If we predicted 0 but wanted 1, we add the input to the weight.',
        goDeeper: {
          math: String.raw`w \leftarrow w + \eta (y - \hat{y}) x`,
          explanation: String.raw`MISTAKE-DRIVEN UPDATES

When ŷ≠y, move w along ±x to tilt hyperplane toward misclassified point; η is step size.

NO LOSS LANDSCAPE

Not gradient descent on smooth loss—subgradient-like rule for perceptron criterion Σ max(0, −y(w^⊤x+b)).

CONVERGENCE

If data linearly separable with margin γ, perceptron converges in finite steps bounded by ‖w*‖²R²/γ² for ‖x‖≤R.`,
        },
      },
    },
    {
      id: 'convergence-theorem',
      title: 'Convergence Theorem',
      visualizationProps: {
        mode: 'convergence-sim',
      },
      content: {
        text: 'Frank Rosenblatt proved in 1958 that if a linear solution EXISTS, this simple update rule is GUARANTEED to find it in a finite number of steps.',
        goDeeper: {
          explanation: String.raw`SEPARABILITY REQUIRED

If no separating hyperplane exists, updates never stabilize—need pocket algorithm or hinge/SVM formulation.

MARGIN DEPENDENCE

Bound scales inversely with margin; tiny margin ⇒ astronomically many updates possible.

MODERN SUCCESSORS

Logistic regression + cross-entropy, linear SVMs replace perceptron for noisy data and probabilistic outputs.`,
        },
      },
    },
    {
      id: 'multiclass-neurons',
      title: 'Multiclass Perceptrons',
      visualizationProps: {
        mode: 'vector-output-viz',
      },
      content: {
        text: 'To classify digits (0-9), we use a layer of 10 neurons. Each neuron "competes" to recognize one specific digit. The one with the highest output score wins.',
        goDeeper: {
          explanation: String.raw`ONE-VS-REST OR SOFTMAX

K independent score functions f_k(x)=w_k^⊤x+b_k; argmax for hard decision. Softmax + CE gives probabilistic multiclass.

LINEAR SEPARABILITY PER CLASS

Each w_k defines a half-space favoring class k vs others in OvR—intersection regions can be messy.

BRIDGE TO DEEP NETS

Final layer of CNNs/Transformers is this same linear classifier on rich features φ(x).`,
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with a single neuron. Change its inputs, weights, bias, and observe the activation.',
    parameters: [
      { id: 'w1', label: 'Weight 1', type: 'slider', min: -2, max: 2, step: 0.1, default: 1 },
      { id: 'w2', label: 'Weight 2', type: 'slider', min: -2, max: 2, step: 0.1, default: 1 },
      { id: 'bias', label: 'Bias', type: 'slider', min: -3, max: 3, step: 0.1, default: -1.5 },
      { id: 'activation', label: 'Activation', type: 'select', options: ['step', 'sigmoid', 'relu'], default: 'step' },
    ],
    tryThis: [
      'Set weights to 1 and bias to -1.5. What inputs are needed to make the neuron fire? (This is an AND gate).',
      'Change bias to -0.5. How does the required input change? (This is an OR gate).',
    ],
  },
  challenges: [
    {
      id: 'build-and-gate',
      title: 'Build an AND Gate',
      description: 'Adjust weights and bias so the neuron fires ONLY when both inputs are 1.',
      props: {
        mode: 'interactive',
        draggableWeights: true,
        inputs: [{ value: 1, weight: 0 }, { value: 1, weight: 0 }],
        bias: 0,
        activation: 'step',
        showCalculation: true,
      },
      completionCriteria: { type: 'threshold', target: 0, metric: 'and_gate_error' },
      hints: [
        'If x1=0 and x2=0, output should be 0. (Set bias < 0).',
        'If x1=1 and x2=1, output should be 1. (Make weights large enough to overcome bias).',
      ],
    },
  ],
};

export default perceptronsModule;
