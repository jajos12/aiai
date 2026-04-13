import type { ModuleData } from '@/core/types';

export const diffusionModule: ModuleData = {
  id: 'diffusion',
  tierId: 4,
  clusterId: 'frontiers',
  title: 'Diffusion Models',
  description:
    'Learn how AI dreams by un-making and re-making noise. The engine behind Midjourney and Stable Diffusion.',
  tags: ['diffusion', 'generative-ai', 'image-generation', 'deep-learning'],
  prerequisites: ['cnn-foundations', 'backpropagation'],
  difficulty: 'advanced',
  estimatedMinutes: 90,
  steps: [
    {
      id: 'denoising-mechanics',
      title: 'The Denoising Step: Predicted Noise',
      visualizationProps: {
        mode: 'denoising-simulator',
        interactive: true,
      },
      content: {
        text: 'The model doesn\'t actually predict the "clean image" directly. Instead, it predicts the tiny amount of NOISE added at step $t$. By subtracting this noise, we move one tiny step closer to the clean image.',
        goDeeper: {
          math: String.raw`\epsilon_\theta(x_t, t) \approx \epsilon, \quad x_{t-1} = f(x_t, \epsilon_\theta)`,
          explanation: String.raw`SCORE CONNECTION

For Gaussian noise, optimal denoising direction aligns with ∇_x log p_t(x)—the score. ε-parameterization is equivalent to learning score scaled by noise std.

VARIANCE SCHEDULES

β_t or ᾱ_t control signal-to-noise; DDPM vs DDIM differ in discretization of reverse SDE/ODE.

STABILITY

Predicting noise (vs. x_0 directly) has better curvature for neural nets at high noise levels.`,
        },
      },
    },
    {
      id: 'u-net-skip-connections',
      title: 'U-Net: The Workhorse',
      visualizationProps: {
        mode: 'u-net-flow',
      },
      content: {
        text: 'The U-Net architecture is perfect for diffusion because it uses "Skip Connections" to pass high-resolution texture information directly from the encoder to the decoder.',
        goDeeper: {
          explanation: String.raw`MULTI-SCALE FEATURES

Bottleneck captures global semantics; skips inject high-frequency spatial detail needed for crisp edges after many denoise iterations.

TIME EMBEDDING

t is encoded (sinusoidal or MLP) and injected via AdaGN/concat into blocks—same U-Net handles all noise levels.

PARAMETER SHARING

Single ε_θ(x,t) evaluated hundreds of times per sample—efficient inference matters.`,
        },
      },
    },
    {
      id: 'classifier-free-guidance',
      title: 'Classifier-Free Guidance (CFG)',
      visualizationProps: {
        mode: 'cfg-viz',
        interactive: true,
      },
      content: {
        text: 'CFG is the magic that makes models follow your prompt precisely. We mix the prompt-conditioned noise prediction with an unconditioned one, pushing the generation away from "random" and toward your specific intent.',
        goDeeper: {
          math: String.raw`\tilde\epsilon = \epsilon_\theta(x_t,\emptyset) + w\bigl(\epsilon_\theta(x_t,c) - \epsilon_\theta(x_t,\emptyset)\bigr)`,
          explanation: String.raw`CONDITIONAL SCORE TILT

w>1 amplifies the vector from uncond toward cond—sharpens p(x|c) approximately.

TRAINING TRICK

Models trained with random dropout of conditioning (set c←∅) enable single network for both branches.

ARTIFACTS

Very large w yields oversaturated colors / mode collapse in detail—typical w∈[1.5,10] by model.`,
        },
      },
    },
    {
      id: 'the-noise-gradient',
      title: 'The Noise Gradient',
      visualizationProps: {
        mode: 'diffusion-overview',
      },
      content: {
        text: 'Diffusion works in two directions: Forward (adding noise) and Reverse (removing noise). It is like watching a painting dissolve into static, and then learning to run the movie backwards.',
        goDeeper: {
          explanation: String.raw`FORWARD SDE

dx = f(x,t)dt + g(t)dW adds noise; reverse learns drift to undo it (Anderson 1982; Song & Ermon score matching).

DISCRETE MARKOV CHAIN

DDPM uses Gaussian transitions q(x_t|x_{t-1}); reverse p_θ learned parametrically.

UNIFIED VIEW

VP-SDE, VE-SDE families interpolate noise schedules; samplers are numerical integrators.`,
        },
      },
    },
    {
      id: 'forward-diffusion',
      title: 'Forward: Adding Chaos',
      visualizationProps: {
        mode: 'forward-noise-viz',
        interactive: true,
      },
      content: {
        text: 'We take a clear image and slowly add Gaussian noise over T steps (e.g., 1000). By the end, the image is pure un-identifiable static.',
        goDeeper: {
          math: String.raw`q(x_t|x_0)=\mathcal{N}\bigl(\sqrt{\bar\alpha_t}x_0,\,(1-\bar\alpha_t)I\bigr)`,
          explanation: String.raw`CLOSED-FORM ANY t

Reparameterize x_t = √ᾱ_t x_0 + √(1−ᾱ_t) ε in one shot—no need to simulate 1000 steps during training.

SIGNAL-TO-NOISE RATIO

ᾱ_t → 0 as t grows; schedule design trades perceptual quality vs. training difficulty.

CONTINUOUS LIMIT

As Δt→0, approaches variance-preserving SDE (VP-SDE).`,
        },
      },
    },
    {
      id: 'the-epsilon-task',
      title: 'The Task: Predict the Noise',
      visualizationProps: {
        mode: 'predict-noise-viz',
      },
      content: {
        text: 'During training, we give the model a noisy image and ask it: "How much noise did we just add?". If the model can predict the noise ($\epsilon$), we can subtract it to get a cleaner image.',
        goDeeper: {
          math: String.raw`L_{\mathrm{simple}} = \mathbb{E}_{t,x_0,\epsilon}\bigl[\|\epsilon - \epsilon_\theta(x_t,t)\|^2\bigr]`,
          explanation: String.raw`ELBO SURROGATE

Full variational bound has extra KL terms; Ho et al. simplified to MSE on noise for stability.

ALTERNATIVE PARAMS

v-prediction, x0-prediction reweight noise vs signal targets—some schedulers prefer them.

CLASSIFIER GUIDANCE (OLD)

Separate classifier score ∇_x log p(c|x_t) added to diffusion score; CFG replaced need for separate classifier.`,
        },
      },
    },
    {
      id: 'reverse-diffusion',
      title: 'Reverse: Sculpting Static',
      visualizationProps: {
        mode: 'reverse-denoise-viz',
      },
      content: {
        text: 'To generate a NEW image, we start with a block of random noise and ask the model to remove a tiny bit of noise. We repeat this 50-100 times until a clear image emerges from the void.',
        goDeeper: {
          explanation: String.raw`SAMPLER DIVERSITY

DDIM deterministic path, DDPM stochastic, DPM-Solver fewer steps—different discretizations of reverse process.

CONSISTENCY MODELS

Distill multi-step denoise into one or few steps—separate research line trading quality for latency.

ODE VS SDE

Deterministic probability flow ODE enables exact likelihood via Hutchinson trace estimators (Song et al.).`,
        },
      },
    },
    {
      id: 'unet-architecture',
      title: 'The U-Net Backbone',
      visualizationProps: {
        mode: 'unet-viz',
      },
      content: {
        text: 'The "Brain" inside most diffusion models is a U-Net. It takes the image down into small, abstract representations (Encoder) and then reconstructs it back up (Decoder), using "Skip Connections" to preserve fine detail.',
        goDeeper: {
          explanation: String.raw`ATTENTION IN MIDDLE

Transformer blocks at bottleneck (e.g., SD) mix global context while conv preserves locality in encoder/decoder.

GROUP NORM + SILU

Common activation/norm pairing for stable training at high resolution.

CONTROLNET / ADAPTER

Side networks inject conditioning without retraining full U-Net—same ε_θ backbone.`,
        },
      },
    },
    {
      id: 'conditioning',
      title: 'Conditioning: Guiding the Dream',
      visualizationProps: {
        mode: 'conditioning-viz',
      },
      content: {
        text: 'How do we tell it to make a "Cat" vs a "Dog"? We provide "Conditioning"—a vector representing our text prompt. The model uses Cross-Attention to let the text guide the denoising process.',
        goDeeper: {
          explanation: String.raw`CLIP / T5 EMBEDDINGS

Text encoder frozen or finetuned produces sequence of context vectors; cross-attn layers let spatial features query language keys/values.

NULL CONDITIONING

Empty string embedding used for CFG uncond branch.

OTHER MODS

Control maps (depth, pose), inpainting masks, IP-Adapter image features—all enter as extra tokens or channels.`,
        },
      },
    },
    {
      id: 'guidance-scale-effects',
      title: 'CFG: Saturation and Detail',
      visualizationProps: {
        mode: 'cfg-viz',
        interactive: true,
      },
      content: {
        text: 'Sometimes the model ignores the prompt. "Classifier-Free Guidance" (CFG) is a knob we turn to force the model to follow the prompt more strictly, often making results more vibrant and surreal.',
        goDeeper: {
          explanation: String.raw`PERCEPTUAL TRADEOFF

Low w: diverse, natural lighting, loose prompt adherence. High w: prompt-locked but HDR-like contrast, extra texture "crispies."

SCHEDULED GUIDANCE

Some samplers anneal w over t to fix late-stage artifacts.

VIDEO EXTENSION

Same CFG idea on spatiotemporal U-Nets; temporal consistency adds extra constraints beyond image CFG.`,
        },
      },
    },
    {
      id: 'latent-diffusion',
      title: 'Latent Diffusion (SDXL)',
      visualizationProps: {
        mode: 'latent-viz',
      },
      content: {
        text: 'Working with big pixels is slow. "Latent Diffusion" (Stable Diffusion) does all the math in a smaller, compressed mathematically space (Latents) and only turns it back into pixels at the very end.',
        goDeeper: {
          math: String.raw`z = E(x), \quad x \approx D(z), \quad z_t \text{ diffused in latent}`,
          explanation: String.raw`VAE AUTOENCODER

E,D trained with perceptual + GAN loss to preserve semantics while downsampling ~8× spatially.

SPEEDUP

Attention cost scales with tokens; 64² vs 512² is ~64× fewer tokens per layer in 2-D.

DOWNSIDE

Compression artifacts bound fidelity; refiners / SDXL high-res fixers add pixel-stage passes.`,
        },
      },
    },
    {
      id: 'beyond-images',
      title: 'Beyond Images: Audio & Video',
      visualizationProps: {
        mode: 'multimodal-viz',
      },
      content: {
        text: 'Diffusion isn\'t just for art! The same math is being used to generate speech (Suno), music, and even realistic video (Sora). If it exists as a signal, we can diffuse it.',
        goDeeper: {
          explanation: String.raw`3D TENSOR NOISE

Video adds time axis; causal or factorized attention models temporal coherence.

AUDIO SPECTROGRAMS

Diffuse mel bins then vocoder, or wave-domain diffusion with specialized backbones.

JOINT MODELS

Unified transformers over tokenized multimodal streams blur lines between modalities—same ELBO scaffolding.`,
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with noise levels and guidance scales to see how images form.',
    parameters: [
      { id: 'steps', label: 'Denoising Steps', type: 'slider', min: 1, max: 100, step: 1, default: 50 },
      { id: 'cfg', label: 'Guidance Scale (CFG)', type: 'slider', min: 1, max: 20, step: 0.5, default: 7.5 },
    ],
    tryThis: [
      'Set CFG to 1. Notice how the "dream" becomes more random and less focused.',
      'Set Denoising Steps to 5. Notice the grainy, unfinished look—the "uncanny valley" of diffusion.',
    ],
  },
  challenges: [],
};

export default diffusionModule;
