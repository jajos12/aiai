import type { ModuleData } from '@/core/types';

export const vaesModule: ModuleData = {
  id: 'vaes',
  tierId: 4,
  clusterId: 'frontiers',
  title: 'Variational Autoencoders (VAEs)',
  description: 'Learning the underlying math of Probabilistic Latent Spaces.',
  tags: ['Generative AI', 'VAEs', 'Latent Space', 'Probability'],
  prerequisites: ['mlps', 'backpropagation'],
  difficulty: 'advanced',
  estimatedMinutes: 75,
  steps: [
    {
      id: 'the-bottleneck',
      title: 'The Latent Bottleneck',
      visualizationProps: {
        mode: 'bottleneck-viz',
      },
      content: {
        text: 'An Autoencoder tries to compress data into a smaller "Bottleneck" representation and then reconstruct it. A VAE adds a twist: instead of a single point, it learns the parameters of a PROBABILITY DISTRIBUTION.',
        goDeeper: {
          math: String.raw`q_\phi(z \mid x) = \mathcal{N}\bigl(\mu_\phi(x), \mathrm{diag}(\sigma_\phi^2(x))\bigr)`,
          explanation: String.raw`DETERMINISTIC VS STOCHASTIC LATENT

A plain autoencoder maps each input x to a single code z = f(x). A VAE maps x to a whole family of plausible codes by outputting the mean μ_φ(x) and (typically diagonal) variance σ_φ²(x) of a Gaussian in latent space. Sampling z ~ q_φ(z|x) makes the mapping stochastic: the decoder must reconstruct from noisy codes, which encourages smooth, interpolatable latents rather than brittle memorization.

ELBO OBJECTIVE (PREVIEW)

Training maximizes a lower bound on log p(x): reconstruct well (likelihood under decoder) while keeping q_φ(z|x) close to a prior p(z) (usually standard normal). That KL term is what turns “one point per input” into a proper generative model you can sample from by drawing z ~ p(z) and running the decoder.

WHY GAUSSIANS

Diagonal Gaussians keep the encoder cheap: 2d outputs per latent dimension. Richer families (normalizing flows, hierarchical priors) exist, but the Gaussian VAE is the textbook balance of tractability and expressiveness.`,
        },
      },
    },
    {
      id: 'reparameterization-trick',
      title: 'The Reparameterization Trick',
      visualizationProps: {
        mode: 'reparam-viz',
      },
      content: {
        text: 'How do we backpropagate through a random sampling process? We can\'t. The Reparameterization Trick moves the randomness into an external noise variable ($\\epsilon$), allowing gradients to flow through the mean and variance.',
        goDeeper: {
          math: String.raw`z = \mu_\phi(x) + \sigma_\phi(x) \odot \epsilon, \quad \epsilon \sim \mathcal{N}(0, I)`,
          explanation: String.raw`PATHWISE GRADIENTS

Score-function estimators for ∇_φ 𝔼_{q}[f(z)] have high variance. If z is an affine transform of fixed noise, expectations become 𝔼_ε[f(μ + σ⊙ε)], and Monte Carlo samples of ε yield low-variance gradients w.r.t. μ and σ. The randomness is “outside” the differentiated graph in ε.

DIAGONAL SCALE

Using σ as standard deviation (positive via softplus or exp) keeps sampling elementwise. Full covariance q(z|x) = 𝒩(μ, Σ) needs the Cholesky trick: z = μ + Lε with LL^⊤ = Σ.

MULTIPLE SAMPLES

In practice one ε per minibatch element suffices for unbiased gradients; more samples reduce variance at extra compute.`,
        },
      },
    },
    {
      id: 'latent-interpolation',
      title: 'Latent Space Exploration',
      visualizationProps: {
        mode: 'latent-explorer',
        interactive: true,
      },
      content: {
        text: 'The power of VAEs is that their latent spaces are structured. If you move slowly between two points in the latent space, the generated output will slowly "morph" from one object into another.',
        goDeeper: {
          math: String.raw`\mathcal{L} = \mathbb{E}_{q_\phi(z|x)}[\log p_\theta(x|z)] - \beta\, D_{\mathrm{KL}}(q_\phi(z|x)\,\|\,p(z))`,
          explanation: String.raw`KL TO A STANDARD PRIOR

The KL term penalizes codes that sit far from p(z) = 𝒩(0,I). When it dominates, latents look Gaussian and linear interpolation z(t)=(1-t)z₁ + t z₂ often yields plausible blends. When reconstruction dominates too strongly (“posterior collapse”), q(z|x) may ignore x—interpolations fail.

β-VAE

Scaling KL by β > 1 forces an even smoother, more disentangled latent geometry at some reconstruction cost. It is the same ELBO family with a different tradeoff curve.

EVALUATION CAVEAT

Log-likelihood under VAE can be estimated with importance sampling; pure reconstruction MSE is not equivalent to generative quality. Use both qualitative samples and held-out likelihood / FID-style metrics when comparing models.`,
        },
      },
    },
  ],
  playground: {
    description: 'Explore the latent space of the VAE. See how small movements change the output.',
    parameters: [],
    tryThis: [
      'Drag the crosshair in the latent space (left) to see the decoded reconstruction (right).',
    ],
  },
  challenges: [],
};

export default vaesModule;
