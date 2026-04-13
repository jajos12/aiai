import type { ModuleData } from '@/core/types';

const activationsModule: ModuleData = {
  id: 'activations',
  tierId: 2,
  clusterId: 'neural-networks',
  title: 'Activation Functions & Vanishing Gradients',
  description:
    'Why neural networks need non-linearity. Explore Sigmoid, Tanh, ReLU and learn why deep networks used to fail—and how modern activations fixed it.',
  tags: ['deep-learning', 'relu', 'sigmoid', 'tanh', 'vanishing-gradients'],
  prerequisites: ['perceptrons', 'backpropagation'],
  difficulty: 'intermediate',
  estimatedMinutes: 65,
  steps: [
    {
      id: 'why-non-linearity',
      title: 'Why We Need Non-Linearity',
      visualizationProps: {
        mode: 'linear-stack',
        activation: 'none',
        layers: 3,
      },
      content: {
        text: 'Without activation functions, stacking layers is pointless. No matter how many linear layers you stack, the result is always a single linear function. Three layers of y=2x composed together just give y=8x. You can never learn curves, spirals, or non-linear patterns.',
        goDeeper: {
          math: String.raw`W_3 W_2 W_1 x = W_{\mathrm{eq}} x`,
          explanation: String.raw`SEMIGROUP OF AFFINE MAPS

Composition of affine maps is affine; rank and linear structure preserved—no universal approximation without nonlinear breaks.

POLYNOMIAL VIEW

If you allowed elementwise squaring without weights, you could build polynomials; learned nonlinearities generalize that idea parametrically.

IDENTITY ACTIVATION PATHS

ResNet can learn near-identity when needed, but still requires nonlinear branches to increase expressivity.`,
        },
      },
    },
    {
      id: 'sigmoid-activation',
      title: 'Sigmoid: The Classic (And Its Fatal Flaw)',
      visualizationProps: {
        mode: 'function-plot',
        activation: 'sigmoid',
        showDerivative: true,
      },
      content: {
        text: 'The Sigmoid squishes any input to (0, 1). It was the original activation function. But look at its derivative—the maximum is only 0.25! When backpropagation multiplies this through 50 layers, gradients effectively become zero.',
        goDeeper: {
          math: String.raw`\sigma(x)=\frac{1}{1+e^{-x}}, \quad \sigma'(x)=\sigma(x)(1-\sigma(x))\le \tfrac{1}{4}`,
          explanation: String.raw`PRODUCT OF DERIVATIVES

∂L/∂h_1 chains L terms each ≤1/4 → exponential decay in depth unless activations stay in linear region.

LOGISTIC OUTPUT

Sigmoid still ideal for binary probabilities at the output layer with cross-entropy—gradients rebalance via loss.

SATURATION

Large |x| drives σ'→0—pre-BN nets needed careful init to stay in active zone.`,
        },
      },
      interactionHint: 'Hover over the curve to see both the function value and its derivative at any point.',
    },
    {
      id: 'tanh-activation',
      title: 'Tanh: A Better Sigmoid',
      visualizationProps: {
        mode: 'function-plot',
        activation: 'tanh',
        showDerivative: true,
      },
      content: {
        text: 'Tanh is zero-centered (outputs range from -1 to +1), which helps with training dynamics. Its derivative peaks at 1.0 instead of 0.25. But it still saturates at the tails, so the vanishing gradient problem persists for very deep networks.',
        goDeeper: {
          math: String.raw`\tanh(x)=\frac{e^x-e^{-x}}{e^x+e^{-x}},\quad \tanh'(x)=1-\tanh^2(x)\le 1`,
          explanation: String.raw`SYMMETRY

Odd function about origin; reduces first-layer bias shift compared to sigmoid.

STILL SATURATES

|x| large ⇒ tanh'→0; deep stacks pre-ReLU still struggled.

RELATION TO SIGMOID

tanh(x) = 2σ(2x)−1—reparameterization, not new asymptotics.`,
        },
      },
    },
    {
      id: 'relu-revolution',
      title: 'ReLU: The Revolution',
      visualizationProps: {
        mode: 'function-plot',
        activation: 'relu',
        showDerivative: true,
      },
      content: {
        text: 'ReLU (Rectified Linear Unit) is embarrassingly simple: max(0, x). For positive inputs, its derivative is exactly 1. This means gradients flow backward completely undiminished, no matter how deep the network. This single insight unlocked modern deep learning.',
        goDeeper: {
          math: String.raw`\mathrm{ReLU}(x)=\max(0,x),\quad \frac{d}{dx}\mathrm{ReLU}=\mathbf{1}_{x>0}`,
          explanation: String.raw`SPARSE ACTIVATIONS

Half the region exact zero—implicit regularization and faster computation.

DYING RELU

If biases push units permanently negative, gradient = 0 forever—Leaky ReLU / proper init mitigate.

PIECEWISE LINEARITY

Network becomes continuous piecewise-linear map—smooth enough for optimization, rigid enough for speed.`,
        },
      },
    },
    {
      id: 'vanishing-gradient-sim',
      title: 'The Vanishing Gradient Simulator',
      visualizationProps: {
        mode: 'gradient-flow',
        activation: 'sigmoid',
        layers: 10,
        interactive: true,
      },
      content: {
        text: 'This is the key insight. Watch how the gradient signal decays as it propagates backward through layers. With Sigmoid, it vanishes. With ReLU, it flows cleanly. Toggle between activations to see the dramatic difference.',
        goDeeper: {
          explanation: String.raw`ILL-CONDITIONED JACOBIAN

Long products of singular values <1 shrink backward error signals; ReLU avoids systematic shrinkage on active paths.

RESIDUAL PATHS

Skip connections add identity Jacobian eigenvalues—another cure orthogonal to activation choice.

NORMALIZATION

LayerNorm/BatchNorm keep pre-activations in ranges where derivatives are healthier.`,
        },
      },
      interactionHint: 'Switch between Sigmoid, Tanh, and ReLU to see the gradient magnitude at each layer. The bar height represents how much learning signal reaches that layer.',
    },
    {
      id: 'leaky-relu-variants',
      title: 'Solving "Dying ReLU": Leaky & PReLU',
      visualizationProps: {
        mode: 'function-plot',
        activation: 'leaky-relu',
        showDerivative: true,
      },
      content: {
        text: 'If a ReLU neuron stays in the negative zone (x < 0) for too long, it "dies" (its gradient is forever 0). Leaky ReLU adds a tiny slope (0.01) to keep the neuron alive.',
        goDeeper: {
          math: String.raw`f(x)=\max(\alpha x, x),\ \alpha \ll 1`,
          explanation: String.raw`NONZERO NEGATIVE SLOPE

Preserves sparsity mostly while allowing gradient recovery.

PReLU

Learn α per channel—extra parameters, more flexibility.

ELU / SELU

Smooth negative branch for mean closer to zero with self-normalizing claims under specific init assumptions.`,
        },
      },
    },
    {
      id: 'elu-selu-math',
      title: 'Exponential Linear Units (ELU)',
      visualizationProps: {
        mode: 'function-plot',
        activation: 'elu',
        showDerivative: true,
      },
      content: {
        text: 'ELU makes the negative side smooth instead of jagged. This helps it converge faster by making the average activation closer to zero, much like zero-centered Tanh but without the vanishing gradient problems.',
        goDeeper: {
          math: String.raw`f(x)=\begin{cases}x & x>0\\ \alpha(e^x-1) & x\le 0\end{cases}`,
          explanation: String.raw`C^1 AT ZERO

Smoother optimization landscape near origin than ReLU kink.

SELU SCALING

Special α, λ chosen so layerwise statistics self-normalize under certain MLP assumptions—less used since Transformer era.

COMPUTE COST

Exp on negative side pricier than ReLU—trade accuracy per FLOP.`,
        },
      },
    },
    {
      id: 'gelu-transformers',
      title: 'GeLU: The Transformer Standard',
      visualizationProps: {
        mode: 'function-plot',
        activation: 'gelu',
      },
      content: {
        text: 'Modern AI like ChatGPT and Stable Diffusion use GeLU (Gaussian Error Linear Unit). It blends the logic of ReLU with probability, creating a smooth "curved" activation that performs better in complex attention layers.',
        goDeeper: {
          math: String.raw`\mathrm{GELU}(x) \approx x\,\Phi(x)`,
          explanation: String.raw`PROBABILISTIC GATING

Φ is Gaussian CDF—stochastically zeroes inputs in an expectation sense; smooth everywhere.

APPROXIMATIONS

0.5x(1+tanh[√(2/π)(x+0.044715x³)]) used in code for speed.

SWIGLU

Gated GLU variant in PaLM/LLaMA FFN: split h, multiply one half by GELU of other—extra parameters, strong empirical gains.`,
        },
      },
    },
    {
      id: 'activation-hub',
      title: 'The Great Comparison Hub',
      visualizationProps: {
        mode: 'hub-comparison',
      },
      content: {
        text: 'Choosing an activation is a balance of speed, stability, and expressive power. ReLU is fast. GeLU is sophisticated. Sigmoid is legacy. Softmax is for outputs.',
        goDeeper: {
          explanation: String.raw`OUTPUT VS HIDDEN

Softmax + CE for multi-class logits; sigmoid + BCE per label in multi-label tasks.

HIDDEN DEFAULTS

ReLU family for CNNs; GELU/SwiGLU for Transformers; still domain-specific exceptions.

RESEARCH FRONTIERS

Periodic, rational, and learned activations (Maxout) appear in niche architectures; most gains now from blocks and scaling, not exotic σ.`,
        },
      },
    },
  ],
  playground: {
    description: 'Compare all activation functions side-by-side. Adjust the input range and layer depth.',
    parameters: [
      { id: 'activation', label: 'Activation Function', type: 'select', options: ['sigmoid', 'tanh', 'relu', 'leaky-relu'], default: 'sigmoid' },
      { id: 'layers', label: 'Number of Layers', type: 'slider', min: 1, max: 50, step: 1, default: 10 },
    ],
    tryThis: [
      'Set layers to 50 with Sigmoid. Watch the gradient bar for Layer 1 practically disappear.',
      'Switch to ReLU with 50 layers. Notice the gradient stays strong all the way back.',
    ],
  },
  challenges: [
    {
      id: 'fix-vanishing',
      title: 'Rescue the Deep Network',
      description: 'A 20-layer network with Sigmoid activations has a vanishing gradient (Layer 1 gradient < 0.001). Change the activation function to restore the gradient above 0.5.',
      props: {
        mode: 'gradient-flow',
        activation: 'sigmoid',
        layers: 20,
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 0.5, metric: 'first_layer_gradient' },
      hints: [
        'Sigmoid\'s max derivative is 0.25. After 20 layers that\'s 0.25^20 ≈ 10^{-12}.',
        'Try ReLU! Its derivative for positive inputs is exactly 1.',
      ],
    },
  ],
};

export default activationsModule;
