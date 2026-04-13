import type { ModuleData } from '@/core/types';

export const vitModule: ModuleData = {
  id: 'vit',
  tierId: 3,
  clusterId: 'advanced-architectures',
  title: 'Vision Transformers (ViT)',
  description:
    'An Image is worth 16x16 words. Discover how Transformers are taking over the world of Computer Vision.',
  tags: ['vit', 'transformers', 'computer-vision', 'deep-learning'],
  prerequisites: ['transformers', 'cnn-foundations'],
  difficulty: 'advanced',
  estimatedMinutes: 90,
  steps: [
    {
      id: 'images-as-words',
      title: 'Images as Words',
      visualizationProps: {
        mode: 'patch-viz',
      },
      content: {
        text: 'Transformers were built for text. To use them for images, we cut the image into a grid of small squares called "Patches". Each patch is treated like a "Word" in a sentence.',
        goDeeper: {
          math: String.raw`H,W \rightarrow \frac{HW}{P^2}\ \text{patches of flattened size } P^2 C`,
          explanation: String.raw`SEQUENCE LENGTH

For input H×W×C and patch P×P, the token count is n = HW/P². ViT-Base on 224² with P=16 yields 196 tokens—comparable to short sentences. Complexity is dominated by self-attention Θ(n² d), so larger P reduces tokens but loses fine detail.

FLATTEN + EMBED

Each patch is vectorized in raster order (or channel-major variants); a linear map E ∈ ℝ^{(P²C)×d} projects into model dimension d, exactly analogous to token embeddings in NLP.

POSITION IS NOT IN THE PATCH TENSOR

Raw patches carry no absolute coordinates; positional embeddings (learned or 2D sinusoidal) must be added so attention is not permutation-invariant over the grid.`,
        },
      },
    },
    {
      id: 'linear-projections',
      title: 'Linear Projections',
      visualizationProps: {
        mode: 'projection-viz',
      },
      content: {
        text: 'A patch of pixels is just a raw grid of numbers. We use a single linear layer to flatten it and project it into a high-dimensional vector space (embedding), just like a word embedding.',
        goDeeper: {
          math: String.raw`x_p = E \cdot \mathrm{vec}(\mathrm{patch}_p) + E_{\mathrm{pos},p} \in \mathbb{R}^d`,
          explanation: String.raw`CONVOLUTIONAL EQUIVALENCE

A fixed patch grid with shared linear E is equivalent to a convolution with kernel P, stride P, and d output channels—same linear map applied at every spatial location. ViT therefore can be implemented as a “Conv stem” for efficiency on GPUs.

LEARNED PROJECTION VS HANDCRAFTED

Unlike SIFT/HOG, E is end-to-end trained for the downstream objective (classification, MAE). The basis vectors are whatever minimizes loss jointly with attention layers.

BIAS AND LAYERNORM

Practical ViTs add bias terms and normalize before attention blocks; the embedding is only the first of many residual updates.`,
        },
      },
    },
    {
      id: 'patch-merging',
      title: 'Patch Merging: Hierarchical Vision',
      visualizationProps: {
        mode: 'merging-viz',
        interactive: true,
      },
      content: {
        text: 'In models like the Swin Transformer, we don\'t just keep the same number of patches. We merge neighboring patches to reduce the sequence length and increase the "receptive field".',
        goDeeper: {
          math: String.raw`n_{\ell+1} = n_\ell / 4 \quad\text{(2×2 merge)}, \qquad d_{\ell+1} = 2 d_\ell`,
          explanation: String.raw`HIERARCHY LIKE CNN PYRAMIDS

Patch merging concatenates features from 2×2 neighboring tokens and projects to a wider channel dimension, halving spatial resolution each stage. Attention windows can stay local while depth increases context—mirroring pooling + conv stacks.

COMPLEXITY WIN

Global attention on n tokens costs Θ(n²). Reducing n stage-wise makes deep global mixing feasible for megapixel-class images when combined with shifted windows (Swin).

TRADE-OFF

Aggressive merging too early can erase thin structures; architecture search balances merge depth vs. patch size.`,
        },
      },
    },
    {
      id: 'masked-image-modeling',
      title: 'Masked Image Modeling (MAE)',
      visualizationProps: {
        mode: 'mae-viz',
      },
      content: {
        text: 'How do we train ViTs without labels? We mask out 75% of the patches and ask the model to reconstruct the missing parts. This is called Masked Autoencoding.',
        goDeeper: {
          math: String.raw`\mathcal{L} = \| \hat{x}_{\bar{M}} - x_{\bar{M}} \|^2 \quad\text{on masked positions }\bar{M}`,
          explanation: String.raw`ASYMMETRIC ENCODER–DECODER

MAE often encodes only visible patches (huge FLOPs savings) and uses a lightweight decoder to predict pixel (or token) values for masked cells. High mask ratios force global reasoning instead of local copy.

RELATION TO BERT

Same ELBO-style intuition as masked language modeling: learn p(x_visible | x_masked) with a denoising score. For images, targets are continuous pixels or discrete VQ codes.

DATA EFFICIENCY

Self-supervised MAE pre-training reduces reliance on ImageNet-scale labels and improves transfer to detection/segmentation when fine-tuned.`,
        },
      },
    },
    {
      id: 'cls-token-depth',
      title: 'The CLS Token: Global Information Collector',
      visualizationProps: {
        mode: 'cls-depth-viz',
      },
      content: {
        text: 'Since an image has no inherent "start", we add a dummy token called [CLS] at the beginning. This token "attends" to every single patch, collecting the global representation of the entire image.',
        goDeeper: {
          math: String.raw`h_{\mathrm{CLS}}^{(L)} = f_{\mathrm{Attn}}^{(L)}\bigl(\ldots f_{\mathrm{Attn}}^{(1)}(h_{\mathrm{CLS}}^{(0)}, \{h_p^{(0)}\})\bigr)`,
          explanation: String.raw`READOUT WITHOUT GLOBAL POOL

Unlike CNN global average pooling, CLS participates in every layer’s attention and residual updates—its final state is a learned summary statistic of the whole grid. Classification head is typically Linear(h_{CLS}^{(L)}).

ALTERNATIVES

Global average pooling of final patch tokens, attention pooling, or multi-scale heads (DeiT distillation tokens) change which equivariant summary is optimized.

INITIALIZATION

CLS embedding is learned like any other token; positional index 0 distinguishes it from patch positions.`,
        },
      },
    },
    {
      id: 'the-cls-token',
      title: 'The CLS (Class) Token',
      visualizationProps: {
        mode: 'cls-token-viz',
      },
      content: {
        text: 'How do we get a single classification (e.g., "Dog") from a sentence of patches? We add an extra, blank token called the [CLS] token at the very beginning.',
        goDeeper: {
          explanation: String.raw`FROM BERT TO ViT

BERT’s [CLS] readout migrated to vision unchanged in spirit: a token with no local image content aggregates context via softmax attention weights. Gradients from the classifier shape which patches receive high attention on discriminative cues.

INTERPRETABILITY

Attention rollout maps visualize CLS→patch weights; they are not causal explanations but useful probes of focus.

MULTI-HEAD MIXING

Each head may attend differently; the classifier sees the concatenated/projected mix after multi-head fusion.`,
        },
      },
    },
    {
      id: 'positional-embeddings-2d',
      title: '2D Positional Embeddings',
      visualizationProps: {
        mode: 'pos-2d-viz',
      },
      content: {
        text: 'Just like in text, the transformer doesn\'t know the spatial layout of patches. We add 2D positional embeddings so the model knows that Patch A is next to Patch B and above Patch C.',
        goDeeper: {
          math: String.raw`E_{\mathrm{pos}}(i,j) = E^x_i + E^y_j \quad\text{or}\quad E_{\mathrm{pos}} \in \mathbb{R}^{(H/P)\times(W/P)\times d}`,
          explanation: String.raw`SEPARABLE VS MLP

Some models sum row and column embeddings (fewer parameters, grid structure); others flatten (i,j) through an MLP or use learned absolute indices for each cell. All break the permutation symmetry of set-of-patches.

RELATIVE BIASES

Swin adds relative position bias to attention logits B(i,j) so translation equivariance is partially restored while keeping locality.

EXTRAPOLATION

Learned absolute grids do not generalize to new resolutions; sinusoidal or interpolated positional encoding helps resize pretrained models.`,
        },
      },
    },
    {
      id: 'global-receptive-field',
      title: 'Global Receptive Field',
      visualizationProps: {
        mode: 'rf-viz',
      },
      content: {
        text: 'Unlike CNNs (which only see local neighbors in early layers), every patch in a ViT can "talk" to every other patch in the very first layer. This gives ViTs a "Global" view of the image immediately.',
        goDeeper: {
          math: String.raw`A^{(1)} \in \mathbb{R}^{n \times n}\ \text{full attention in standard ViT}`,
          explanation: String.raw`DEPTH VS RADIUS

A 3×3 conv has receptive field radius growing ~linearly in layers; ViT layer-1 couples all sites in one softmax—long-range dependencies need not wait for depth. That helps tasks with global cues (counting, symmetry).

INDUCTIVE BIAS COST

Locality is not hard-coded; the model must learn spatial smoothness from data. CNNs bake it in, needing less data for low-level structure.

HYBRIDS

ConViT, CvT, and CoAtNet mix conv stems or depthwise convs with attention to blend priors.`,
        },
      },
    },
    {
      id: 'no-inductive-bias',
      title: 'The "No Bias" Tradeoff',
      visualizationProps: {
        mode: 'bias-viz',
      },
      content: {
        text: 'CNNs have "Inductive Bias"—they are built specifically for images. ViTs have almost none. This means ViTs need MUCH more data to learn, but once they have it, they often surpass CNNs.',
        goDeeper: {
          explanation: String.raw`SAMPLE COMPLEXITY

Translation equivariance + locality in CNNs shrink the function class ViTs must search. On small datasets (CIFAR without heavy aug), ViTs underperform; on JFT-300M / IG-1B pre-training, flexibility wins.

AUGMENTATION AS SOFT PRIOR

RandAug, MixUp, CutMix supply synthetic locality and invariances that replace some conv bias.

SCALING LAWS

ViT performance improves predictably with model+data size; the crossover point where ViT beats ResNet moves left as data grows.`,
        },
      },
    },
    {
      id: 'attention-maps',
      title: 'Visualizing Attention',
      visualizationProps: {
        mode: 'heatmaps-viz',
      },
      content: {
        text: 'We can see exactly what the model is "looking" at. By plotting the attention weights, we often find the model focusing on the most semantic parts of an object, like eyes, wheels, or edges.',
        goDeeper: {
          math: String.raw`\alpha_{p \to q} = \mathrm{softmax}_q\bigl(Q_p K_q^\top / \sqrt{d_k}\bigr)`,
          explanation: String.raw`HEAD HETEROGENEITY

Different heads specialize (boundary vs. interior vs. background suppression). Averaging heads can blur interpretability; max or entropy filters highlight salient routing.

NOT GRAD-CAM

Attention weights are not gradients of class scores—they indicate information routing, not importance for output. Use with care in safety audits.

ROLLOUT

Multiplying adjacency matrices across layers approximates token influence paths for visualization.`,
        },
      },
    },
    {
      id: 'vit-variants',
      title: 'The Future: DeiT, Swin, and MAE',
      visualizationProps: {
        mode: 'variants-viz',
      },
      content: {
        text: 'The original ViT was just the beginning. Now we have "Swin Transformers" that use hierarchical windows and "MAE" (Masked Autoencoders) that learn by reconstructing missing patches.',
        goDeeper: {
          explanation: String.raw`DeiT

Knowledge distillation with a teacher CNN or larger ViT improves data efficiency; extra distillation token parallels CLS.

Swin

Shifted windows limit attention locality per block, reducing Θ(n²) to Θ(n w²) with window size w, while shifts propagate information across panes.

MAE / BEiT / iBOT

Self-supervised objectives (pixel, VQ-VAE tokens, covariance) replace pure supervised ImageNet pre-training. Unified theme: denoise or predict missing structure at patch scale.`,
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with patch sizes and attention focus in a Vision Transformer.',
    parameters: [
      { id: 'patchSize', label: 'Patch Size', type: 'select', options: ['8', '16', '32'], default: '16' },
    ],
    tryThis: [
      'Use a small patch size (8x8). Notice how the model has many more "words" to process.',
      'Check the attention maps for different layers. Compare the first layer to the last.',
    ],
  },
  challenges: [],
};

export default vitModule;
