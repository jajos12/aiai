import type { ModuleData } from '@/core/types';

const cnnFoundationsModule: ModuleData = {
  id: 'cnn-foundations',
  tierId: 2,
  clusterId: 'neural-networks',
  title: 'CNN Foundations: The Convolutional Layer',
  description:
    'Learn how AI "sees". Master Kernels, Stride, and Feature Maps using a 2D interactive sliding window.',
  tags: ['deep-learning', 'cnn', 'convolution', 'kernels', 'computer-vision'],
  prerequisites: ['mlps'],
  difficulty: 'intermediate',
  estimatedMinutes: 60,
  steps: [
    {
      id: 'what-is-convolution',
      title: 'What is a Convolution?',
      visualizationProps: {
        mode: 'conv-interactive',
        kernelType: 'identity',
        showCalculation: true,
      },
      content: {
        text: 'A convolution is a mathematical operation where a small matrix (the **Kernel**) slides over an image to extract features. Instead of looking at every pixel independently, the network looks at local patterns.',
        goDeeper: {
          math: String.raw`Y_{i,j} = \sum_{m,n} K_{m,n} X_{i+m,j+n} + b`,
          explanation: String.raw`CROSS-CORRELATION IN CODE

Most DL frameworks implement cross-correlation (no kernel flip) but call it conv; true convolution flips K—difference absorbed into learned weights.

TRANSLATION EQUIVARIANCE

If input shifts, output feature map shifts equally—shared weights enforce this structure.

LINEAR OPERATOR

Fixed K, conv is linear in X; nonlinearity comes later (ReLU, etc.).`,
        },
      },
      interactionHint: 'Hover over the input grid (left) to see the convolution window slide and calculate the feature map (right).',
    },
    {
      id: 'feature-extraction',
      title: 'Feature Extraction: Sobel & Blur',
      visualizationProps: {
        mode: 'conv-interactive',
        kernelType: 'sobel-v',
      },
      content: {
        text: 'By changing the numbers in the kernel, we can detect different things. A "Sobel" kernel detects vertical or horizontal edges. A "Blur" kernel averages nearby pixels to smooth the image.',
        goDeeper: {
          explanation: String.raw`BASIS OF FILTERS

Handcrafted kernels illustrate what conv can detect; CNNs learn K from data via ∂L/∂K backprop.

GABOR-LIKE EMERGENCE

Early layers often resemble edge detectors without explicit supervision—data-induced inductive bias.

STACKING

Later layers compose simple filters into textures and parts.`,
        },
      },
      interactionHint: 'Switch between different kernels (Edge, Sharpen, Blur) and watch how the output feature map changes.',
    },
    {
      id: 'stride-padding',
      title: 'Dimensions: Stride & Padding',
      visualizationProps: {
        mode: 'conv-params',
        stride: 2,
        padding: 1,
      },
      content: {
        text: '**Stride** is how many pixels the window jumps at each step. **Padding** adds extra zero-pixels around the border. These parameters control the size of the output feature map.',
        goDeeper: {
          math: String.raw`O = \left\lfloor \frac{I - K + 2P}{S} \right\rfloor + 1`,
          explanation: String.raw`SAME CONVOLUTION

Choose P = ⌊K/2⌋ for odd K with S=1 to preserve H×W (approximately) for stride-1 stacks.

DOWNSAMPLING

S>1 shrinks spatial dims, widening receptive field per layer depth cheaply.

DILATION

Empty skips between kernel taps—expands receptive field without more parameters.`,
        },
      },
      interactionHint: 'Adjust the Stride and Padding sliders to see how the output grid shrinks or grows.',
    },
    {
      id: 'convolution-math',
      title: 'The Math of the Slide',
      visualizationProps: {
        mode: 'conv-interactive',
        kernelSize: 3,
        stride: 1,
        padding: 0,
      },
      content: {
        text: 'Convolution is a "Weighted Sum." We multiply each pixel in the patch by its corresponding weight in the kernel, then add them all together. This one number becomes a single pixel in our output "Feature Map".',
        goDeeper: {
          math: String.raw`y_{i,j} = w^\top x_{(i,j)} + b`,
          explanation: String.raw`IM2COL VIEW

Unrolling patches into columns turns conv into matrix multiply GEMM—highly optimized on GPUs.

FLOPs COUNT

Per output pixel ≈ 2 K² C_in C_out multiply-adds for multi-channel conv.

GROUPS / DEPTHWISE

Group conv factorizes channel mixing; depthwise separable (MobileNet) splits spatial and channel mixing.`,
        },
      },
      interactionHint: 'Tweak the kernel weights (e.g., set the middle column to 1 and the others to -1) and see how it highlights vertical edges.',
    },
    {
      id: 'rgb-channels',
      title: 'Color: The Third Dimension',
      visualizationProps: {
        mode: 'rgb-viz',
      },
      content: {
        text: 'Real images aren\'t just flat grids; they have depth (Red, Green, Blue). A single filter isn\'t a 3×3 square, but a 3×3×3 cube that looks at all three colors simultaneously.',
        goDeeper: {
          explanation: String.raw`INPUT DEPTH C_in

Kernel tensor K ∈ ℝ^{K×K×C_in×C_out}; each of C_out filters mixes channels linearly at each spatial offset.

COLOR EDGES

Filters can be color-opponent (e.g., R−G) or luminance-only depending on learned weights.

HYPERSPECTRAL

Same math with C_in ≫ 3 for satellite / scientific imaging.`,
        },
      },
    },
    {
      id: 'multiple-filters',
      title: 'Depth: Multiple Filters',
      visualizationProps: {
        mode: 'filter-stack-viz',
      },
      content: {
        text: 'One filter finds edges. Another finds corners. A third finds spots. In a real CNN layer, we might use 64 or 128 different filters at once, creating a "stack" of 128 feature maps.',
        goDeeper: {
          explanation: String.raw`OUTPUT CHANNELS C_out

Each filter is one detector; stack forms new 3D tensor H×W×C_out fed to next layer.

BANK OF GABORS ANALOGY

Learned filters span subspace of local patterns; width C_out trades capacity vs compute.

1×1 CONV

Mixes channels only at each pixel—used in Network-in-Network, Inception, ResNet bottlenecks.`,
        },
      },
    },
    {
      id: 'pooling-layers',
      title: 'Pooling: Shrinking the Image',
      visualizationProps: {
        mode: 'pooling-viz',
        type: 'max',
        interactive: true,
      },
      content: {
        text: 'After convolution, we use "Pooling" to shrink the image. Max-Pooling looks at a 2×2 block and only keeps the single brightest pixel. This reduces computation and makes the model more robust.',
        goDeeper: {
          explanation: String.raw`LOCAL LIPSCHITZ CONST

Max-pool is non-smooth; small input shifts can switch argmax—some modern nets use strided conv instead for learnable downsampling.

AVG POOL

Smoother; common at network end for global summary.

INVARIANCE

Pooling trades spatial resolution for tolerance to micro translations.`,
        },
      },
    },
    {
      id: 'receptive-fields',
      title: 'The Receptive Field',
      visualizationProps: {
        mode: 'receptive-field-viz',
      },
      content: {
        text: 'In the first layer, a neuron only sees 3×3 pixels. But in the next layer, a neuron sees 3×3 pixels *of the previous feature map*—which themselves represent a larger area of the original image. As we go deeper, neurons "see" more of the world.',
        goDeeper: {
          explanation: String.raw`RECURSIVE FORMULA

RF grows with depth, kernel size, stride, dilation; effective RF often smaller than theoretical due to weight decay.

SKIP CONNECTIONS

ResNets allow shortest paths so gradients and signals mix multiple scales.

GLOBAL CONTEXT

Stack enough layers or use attention to cover full image.`,
        },
      },
    },
    {
      id: 'translation-invariance',
      title: 'Translation Invariance',
      visualizationProps: {
        mode: 'invariance-viz',
      },
      content: {
        text: 'A good AI should know a cat is a cat, whether it is in the top-left or bottom-right corner. CNNs achieve this naturally because the SAME weights (the kernel) are used across every single part of the image.',
        goDeeper: {
          explanation: String.raw`WEIGHT SHARING

Parameters tied across space → far fewer weights than fully connected vision layers; also encodes locality prior.

GROUP CONV BREAKS FULL SHARING

Per-group kernels still share within group—used in grouped ResNeXt.

DATA AUGMENTATION

Random crops/flips complement equivariance with approximate invariance at decision layer.`,
        },
      },
    },
  ],
  playground: {
    description: 'Design your own 3x3 kernel and apply it to a test image in real-time.',
    parameters: [
      { id: 'kernelType', label: 'Preset Kernel', type: 'select', options: ['custom', 'edge', 'blur', 'sharpen', 'emboss'], default: 'edge' },
      { id: 'stride', label: 'Stride', type: 'slider', min: 1, max: 3, step: 1, default: 1 },
      { id: 'padding', label: 'Padding', type: 'slider', min: 0, max: 2, step: 1, default: 0 },
    ],
    tryThis: [
      'Can you create a kernel that detects 45-degree diagonal edges?',
      'Set Stride to 2 and Padding to 1. Notice how many "zeros" are added at the edges.',
    ],
  },
  challenges: [
    {
      id: 'detect-edges',
      title: 'The Edge Detective',
      description: 'Your goal is to construct a kernel that extracts only the vertical edges of the input pattern. The output should have high values (> 1.0) only at edge transitions.',
      props: {
        mode: 'conv-interactive',
        kernelType: 'custom',
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 0.9, metric: 'edgeDetectionAccuracy' },
      hints: [
        'Try putting negative numbers on the left column and positive numbers on the right column of the 3x3 kernel.',
        'A[-1, 0, 1] pattern is a classic vertical edge detector.',
      ],
    },
  ],
};

export default cnnFoundationsModule;
