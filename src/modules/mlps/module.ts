import type { ModuleData } from '@/core/types';

const mlpsModule: ModuleData = {
  id: 'mlps',
  tierId: 2,
  clusterId: 'neural-networks',
  title: 'Multi-Layer Perceptrons & Universal Approximation',
  description:
    'How hidden layers create non-linear decision boundaries. Solve XOR, classify spirals, and understand why MLPs can approximate any continuous function.',
  tags: ['deep-learning', 'mlp', 'hidden-layers', 'universal-approximation', 'xor'],
  prerequisites: ['perceptrons', 'backpropagation', 'activations'],
  difficulty: 'intermediate',
  estimatedMinutes: 75,
  steps: [
    {
      id: 'the-xor-problem',
      title: 'The XOR Problem: Why One Layer Isn\'t Enough',
      visualizationProps: {
        mode: 'xor-problem',
        dataset: 'xor',
        hiddenNeurons: 0,
      },
      content: {
        text: 'A single perceptron draws one straight line. It can solve AND and OR gates perfectly. But XOR (where the answer is 1 only when the inputs differ) is impossible to separate with a single line. This was the crisis that nearly killed neural networks in the 1960s.',
        goDeeper: {
          explanation: String.raw`LINEAR THRESHOLD LIMIT

Binary threshold units compute half-space indicators; XOR vertices of the unit square require two half-spaces whose intersection is not a single wedge—formally, no w,b satisfy all four inequalities.

HISTORICAL IMPACT

Minsky & Papert (1969) formalized limitations; multilayer solutions existed in theory but lacked scalable training until backprop (Rumelhart et al., 1986).

FEATURE LIFT

Hidden layer φ(x) = σ(Wx) can embed XOR points into a 3-D pattern separable by a plane—composition of nonlinearities is essential.`,
        },
      },
    },
    {
      id: 'hidden-layers',
      title: 'Adding a Hidden Layer',
      visualizationProps: {
        mode: 'network-diagram',
        dataset: 'xor',
        hiddenNeurons: 2,
        showBoundaries: true,
      },
      content: {
        text: 'With just 2 hidden neurons, each neuron draws its own line. The output neuron then combines these lines. Two lines together can carve out a region that isolates the XOR pattern!',
        goDeeper: {
          math: String.raw`h = \sigma(W_1 x + b_1), \quad y = \sigma(w_2^\top h + b_2)`,
          explanation: String.raw`BOOLEAN DECOMPOSITION

XOR = (x₁ ∨ x₂) ∧ ¬(x₁ ∧ x₂); hidden units can implement conjunctions of half-spaces.

PIECEWISE LINEAR REGIONS

Each ReLU net partitions input space into convex polytopes; depth increases max number of regions exponentially in width under genericity.

MINIMAL WIDTH

For XOR in ℝ², two hidden sigmoid/ReLU units suffice with careful biases; one hidden unit cannot.`,
        },
      },
      interactionHint: 'Adjust the number of hidden neurons to see how the decision boundary evolves from a simple line to a complex shape.',
    },
    {
      id: 'non-linear-boundaries',
      title: 'Non-Linear Decision Boundaries',
      visualizationProps: {
        mode: 'playground',
        dataset: 'circles',
        hiddenNeurons: 4,
        showBoundaries: true,
        interactive: true,
      },
      content: {
        text: 'With activations between layers, the straight lines get bent and warped into curves. More neurons = more segments = smoother curves. This is how neural networks learn to classify complex, non-linear patterns like concentric circles.',
        goDeeper: {
          explanation: String.raw`COMPOSITION OF RIDGES

Each ReLU introduces kinks; stacking layers composes many “hinges” that can approximate smooth curves densely as width grows.

RKHS VIEW (INFORMAL)

Wide networks relate to Gaussian-process limits; finite nets are non-convex but highly expressive.

CURSE OF DIMENSIONALITY

In high-D, need many pieces to separate manifolds; depth helps sequential folding of data.`,
        },
      },
      interactionHint: 'Try different datasets (XOR, Circles, Spiral) and adjust the hidden neurons to see the boundary morph.',
    },
    {
      id: 'universal-approximation',
      title: 'The Universal Approximation Theorem',
      visualizationProps: {
        mode: 'approximation',
        hiddenNeurons: 4,
        targetFunction: 'sine',
        interactive: true,
      },
      content: {
        text: 'The Universal Approximation Theorem (Cybenko, 1989) states: a neural network with a single hidden layer containing enough neurons can approximate ANY continuous function to arbitrary precision.',
        goDeeper: {
          math: String.raw`f(x) \approx \sum_{j=1}^N c_j\, \sigma(w_j^\top x + b_j)`,
          explanation: String.raw`DENSITY IN C(K)

On compact K ⊂ ℝ^d, linear combinations of sigmoids (or ReLUs) are dense in C(K) under supremum norm—nonconstructive width bound.

WIDTH EFFICIENCY

Some functions need exponentially many neurons in d with one hidden layer; depth can reduce width requirements (e.g., Telgarsky-style separation).

NOT A GUARANTEE OF LEARNING

Optimization and generalization are separate; UAT only addresses representability.`,
        },
      },
      interactionHint: 'Increase the number of hidden neurons and watch the network\'s approximation of the target function (sin, step, etc.) progressively improve.',
    },
    {
      id: 'depth-vs-width',
      title: 'Depth vs Width: Why Deep is Better',
      visualizationProps: {
        mode: 'depth-comparison',
      },
      content: {
        text: 'A network with 1 hidden layer of 1000 neurons can approximate any function, but a network with 3 hidden layers of 10 neurons each often does it better and with far fewer total parameters.',
        goDeeper: {
          explanation: String.raw`COMPOSITIONAL STRUCTURE

If target is f = f_L ∘ … ∘ f_1 with simple components, depth-L mirrors that factorization; shallow nets may need width exponential in L to recompose.

HIERARCHICAL FEATURES

Vision/text models build abstractions layerwise; empirical depth improves sample efficiency on structured data.

EXPONENTIAL ADVANTAGE EXAMPLES

Families of functions exist where depth-k nets need poly size but shallow nets need exponential width.`,
        },
      },
    },
    {
      id: 'parameter-counting',
      title: 'The Burden of Intelligence: Parameters',
      visualizationProps: {
        mode: 'param-counter-viz',
      },
      content: {
        text: 'Every connection in our network is a "Weight" that must be learned. In a "Fully Connected" MLP, the number of weights explodes quickly: $(Input \\times Hidden) + (Hidden \\times Hidden) + ...$',
        goDeeper: {
          math: String.raw`P = \sum_{\ell=1}^{L} \bigl(n_{\ell-1} n_\ell + n_\ell\bigr)`,
          explanation: String.raw`BIAS TERMS

+n_ℓ per layer for per-neuron offsets; LayerNorm / skip connections add more terms in modern stacks.

FLOPs VS MEMORY

Forward pass dense matmul at layer ℓ costs ~2 n_{ℓ-1} n_ℓ multiply-adds per sample.

SPARSITY / LOW-RANK

Pruning, LoRA, and mixture-of-experts reduce effective P at inference.`,
        },
      },
    },
    {
      id: 'initialization-math',
      title: 'Initialization: Avoiding the Dead Zones',
      visualizationProps: {
        mode: 'init-viz',
      },
      content: {
        text: 'If you set all weights to zero, the network will never learn. If you set them too high, the gradients explode. We use smart methods like "He" or "Xavier" initialization to keep the signal active from the start.',
        goDeeper: {
          math: String.raw`W_{ij} \sim \mathcal{N}\!\left(0,\ \frac{2}{n_{\mathrm{in}}}\right)\ \text{(He)}, \quad \mathrm{Var} = \frac{2}{n_{\mathrm{in}}+n_{\mathrm{out}}}\ \text{(Xavier)}`,
          explanation: String.raw`VARIANCE FLOW

Forward activation variance preserved layer-to-layer if Var(W) ∝ 1/n_in (ReLU loses half the mass—He corrects factor 2).

BACKWARD SIGNAL

Similar scaling keeps ∂L/∂h variance stable—Xavier averages in/out degrees for tanh/sigmoid.

ORTHOGONAL INIT

QR init on weight matrices preserves norms exactly for deep linear stacks before nonlinearities.`,
        },
      },
    },
    {
      id: 'dropout-regularization',
      title: 'Dropout: Training for Robustness',
      visualizationProps: {
        mode: 'dropout-viz',
        interactive: true,
      },
      content: {
        text: 'To prevent the network from relying too heavily on any one "star" neuron, we randomly "turn off" neurons during training. This forces the entire network to work together and learn more generalized patterns.',
        goDeeper: {
          math: String.raw`\tilde{h} = m \odot h,\ m_i \sim \mathrm{Bernoulli}(1-p)`,
          explanation: String.raw`ENSEMBLE INTERPRETATION

Dropout averages over exponentially many thinned subnets; at test time, weights scaled by (1−p) approximate expectation.

INVERTED DROPOUT

Divide activations by (1−p) during training so inference needs no scale change.

ATTENTION DROPOUT

Stochastic depth variants drop residual blocks in very deep nets.`,
        },
      },
    },
    {
      id: 'batch-norm-intuition',
      title: 'Batch Normalization',
      visualizationProps: {
        mode: 'batch-norm-viz',
      },
      content: {
        text: 'As data flows through a deep network, its mean and variance can shift, making it hard for later layers to keep up. Batch Normalization re-centers the data between every single layer.',
        goDeeper: {
          math: String.raw`\hat{h} = \frac{h - \mu_B}{\sqrt{\sigma_B^2 + \varepsilon}}, \quad y = \gamma \hat{h} + \beta`,
          explanation: String.raw`MINI-BATCH STATISTICS

μ_B, σ_B are batch estimates during training; running averages for eval—train/serve mismatch handled by momentum updates.

GRADIENT EFFECTS

BN reparametrizes landscape to be smoother; allows larger learning rates.

LAYERNORM ALTERNATIVE

Normalize per example across features—preferred in Transformers where sequence length varies.`,
        },
      },
    },
    {
      id: 'training-lifecycle',
      title: 'The Training Lifecycle',
      visualizationProps: {
        mode: 'lifecycle-summary',
      },
      content: {
        text: 'Forward Pass -> Calculate Loss -> Backward Pass -> Update Weights. Repeat millions of times across hundreds of "Epochs" until the model achieves mastery.',
        goDeeper: {
          explanation: String.raw`EPOCHS VS STEPS

One epoch = full pass over training set; large data may never truly “finish” epochs—train by total optimizer steps.

EARLY STOPPING

Monitor validation loss; halt when it rises—prevents overfitting without knowing true data distribution.

CHECKPOINTING / MIXED PRECISION

fp16/bf16 with loss scaling reduces memory; checkpoint recomputation trades compute for activation RAM.`,
        },
      },
    },
  ],
  playground: {
    description: 'Build your own MLP. Choose a dataset, adjust hidden neurons, and watch the decision boundary form.',
    parameters: [
      { id: 'dataset', label: 'Dataset', type: 'select', options: ['xor', 'circles', 'spiral', 'moons'], default: 'xor' },
      { id: 'hiddenNeurons', label: 'Hidden Neurons', type: 'slider', min: 1, max: 16, step: 1, default: 4 },
      { id: 'activation', label: 'Activation', type: 'select', options: ['relu', 'sigmoid', 'tanh'], default: 'relu' },
    ],
    tryThis: [
      'Can you solve XOR with only 2 hidden neurons? What about with 1?',
      'Try the Spiral dataset. What happens with only 2 hidden neurons? What about 8?',
      'Switch to sigmoid activation with many neurons. Notice the boundary is always smooth curves, never sharp corners.',
    ],
  },
  challenges: [
    {
      id: 'solve-xor',
      title: 'Crack the XOR Code',
      description: 'Find the minimum number of hidden neurons needed to perfectly classify all 4 XOR data points.',
      props: {
        mode: 'playground',
        dataset: 'xor',
        hiddenNeurons: 1,
        showBoundaries: true,
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 100, metric: 'accuracy' },
      hints: [
        'One hidden neuron draws one line. Can one line separate XOR? Nope!',
        'Two lines (two hidden neurons) can create a corridor. Try 2 hidden neurons!',
      ],
    },
  ],
};

export default mlpsModule;
