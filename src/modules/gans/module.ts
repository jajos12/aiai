import type { ModuleData } from '@/core/types';

export const gansModule: ModuleData = {
  id: 'gans',
  tierId: 4,
  clusterId: 'frontiers',
  title: 'Generative Adversarial Nets (GANs)',
  description: 'The creative duel between a Generator and a Discriminator.',
  tags: ['Generative AI', 'GANs', 'StyleGAN', 'Adversarial Training'],
  prerequisites: ['cnn-foundations', 'backpropagation'],
  difficulty: 'advanced',
  estimatedMinutes: 75,
  steps: [
    {
      id: 'the-duel',
      title: 'The Mini-max Game',
      visualizationProps: {
        mode: 'duel-viz',
        interactive: true,
      },
      content: {
        text: 'A GAN consists of two neural networks. The Generator tries to create fake data, while the Discriminator tries to distinguish fake data from real data. They are locked in a "duel" where each one pushes the other to improve.',
        goDeeper: {
          math: String.raw`\min_G \max_D\; V(D,G) = \mathbb{E}_{x \sim p_{\mathrm{data}}}[\log D(x)] + \mathbb{E}_{z \sim p_z}[\log(1 - D(G(z)))]`,
          explanation: String.raw`ZERO-SUM STRUCTURE

For fixed G, the optimal discriminator is a Bayes classifier on the mixture of real and fake; for fixed D, G pushes mass toward regions where D is high. The saddle point (when it exists) corresponds to p_G = p_data and D = ½ everywhere—an equilibrium where fakes are indistinguishable.

JENSEN–SHANNON LINK

Minimizing the value function relates to minimizing divergences between distributions (original GAN analysis used JS-related objectives). f-GAN and WGAN generalize this to other integral probability metrics and Earth-mover style distances, often improving training stability.

NON-CONVEXITY

Unlike convex games, deep GAN training is heuristic: alternating gradient steps on D and G with careful learning rates, regularizers, and architectures. Convergence guarantees are limited; practice relies on monitoring sample quality and mode coverage.`,
        },
      },
    },
    {
      id: 'mode-collapse',
      title: 'Mode Collapse: The Achilles Heel',
      visualizationProps: {
        mode: 'mode-collapse-viz',
      },
      content: {
        text: 'Sometimes the Generator finds one single "trick" that fools the Discriminator perfectly (e.g., always generating the same number 7). This is called Mode Collapse, and it prevents the model from learning the full diversity of the dataset.',
        goDeeper: {
          math: String.raw`p_G \approx \delta_{x^\star} \quad\text{yet}\quad D(x^\star)\approx \tfrac{1}{2}\ \text{(local exploit)}`,
          explanation: String.raw`WHAT COLLAPSE MEANS

Instead of matching the full data manifold, G may map almost all z to a thin set of samples that D cannot separate from real. Gradients then reinforce that narrow strategy; entropy of outputs collapses even while discriminator loss looks acceptable on those samples.

MITIGATIONS

Minibatch discrimination, unrolled optimization, feature matching, TTUR (different learning rates), gradient penalties (WGAN-GP), and architectural choices (StyleGAN’s style mixing, path-length regularization) all aim to spread probability mass. No single fix is universal.

EVALUATION

Inception Score and FID (Fréchet distance between feature statistics) measure diversity and fidelity jointly; inspecting per-class recall catches collapse that average metrics hide.`,
        },
      },
    },
    {
      id: 'stylegan-architecture',
      title: 'StyleGAN: Fine-grained Control',
      visualizationProps: {
        mode: 'style-transfer-viz',
      },
      content: {
        text: 'StyleGAN separates the "content" of an image from its "style". By injecting style at different resolutions, we can control high-level features (face shape) independently from low-level features (skin texture).',
        goDeeper: {
          math: String.raw`\mathrm{AdaIN}(h; \mu(w), \sigma(w)) = \sigma(w) \odot \frac{h - \mu(h)}{\sigma(h)} + \mu(w)`,
          explanation: String.raw`STYLE VECTORS AND COARSE-TO-FINE

A latent w (often mapped through an MLP from z) modulates feature maps at each resolution: AdaIN re-centers and rescales activations using per-channel statistics predicted from w. Early layers absorb pose and identity; late layers absorb texture—giving disentangled knobs without explicit labels.

TRAINING IMPLICATIONS

StyleGAN still minimizes adversarial loss on patches / images, but the inductive bias of progressive growing and style injection changes the Lipschitz landscape D sees, improving stability and sample quality.

EXTENSIONS

StyleGAN2/3 refine normalization and alias-free filters; the mathematical theme remains “modulate features with low-dimensional style codes at multiple scales.”`,
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with the GAN duel. Balance the Generator and Discriminator.',
    parameters: [],
    tryThis: [
      'Move the slider to see how the equilibrium shifts between the two networks.',
    ],
  },
  challenges: [],
};

export default gansModule;
