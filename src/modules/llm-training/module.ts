import type { ModuleData } from '@/core/types';

export const llmTrainingModule: ModuleData = {
  id: 'llm-training',
  tierId: 3,
  clusterId: 'advanced-architectures',
  title: 'LLM Training Pipeline',
  description: 'From Pre-training on the internet to RLHF and specialized Fine-tuning.',
  tags: ['LLMs', 'RLHF', 'Fine-tuning', 'Pre-training'],
  prerequisites: ['transformers'],
  difficulty: 'advanced',
  estimatedMinutes: 90,
  steps: [
    {
      id: 'pre-training-objective',
      title: 'Pre-training: Causal Language Modeling',
      visualizationProps: {
        mode: 'clm-viz',
      },
      content: {
        text: 'Language models are first trained to predict the next token in a sequence. By doing this on trillions of words from the internet, they learn the structure of human language, facts about the world, and even reasoning abilities.',
        goDeeper: {
          math: String.raw`\mathcal{L}_{\mathrm{CLM}}(\theta) = - \sum_{t=1}^{T} \log p_\theta(x_t \mid x_{<t})`,
          explanation: String.raw`FACTORIZATION

Causal masking makes the joint over tokens a product of conditionals; minimizing negative log-likelihood is maximum likelihood estimation. There is no latent variable—just a huge autoregressive softmax chain. Gradients flow from every position that has a label (typically all non-padding tokens in the chunk).

WEIGHT TYING AND LABEL SMOOTHING

Many stacks tie input embeddings to the output projection; label smoothing or z-loss variants slightly change the target distribution for optimization stability at scale.

COMPUTE

Training cost scales with parameters × tokens seen × constants for forward/backward and hardware utilization; Chinchilla-style scaling laws relate optimal N and D for a FLOPs budget.`,
        },
      },
    },
    {
      id: 'tokenization-depth',
      title: 'Tokenization: Byte-Pair Encoding (BPE)',
      visualizationProps: {
        mode: 'tokenizer-interactive',
        interactive: true,
      },
      content: {
        text: 'Models don\'t see words. They see "tokens". Tokenization is the process of breaking text into sub-word units. BPE iteratively merges the most frequent pairs of characters into new tokens.',
        goDeeper: {
          math: String.raw`w \mapsto (t_1,\ldots,t_L) \in \mathcal{V}^L, \quad |\mathcal{V}| \in [2^{15}, 2^{17}]`,
          explanation: String.raw`MERGE ORDERS AS COMPRESSION

Starting from bytes or characters, BPE greedily merges the pair that most reduces corpus length under a count objective. The resulting vocabulary is a prefix-free codebook; encoding is deterministic given merges. Unlike words, rare strings decompose into known pieces, bounding OOV rate.

GRADIENTS STOP AT TOKENS

The tokenizer is discrete and non-differentiable; research on soft tokenization exists, but production LLMs treat segmentation as fixed preprocessing. Poor tokenization increases sequence length and hurts arithmetic or multilingual performance.

UNIGRAM / SENTENCEPIECE

Unigram LM tokenizers optimize a probabilistic segmentation; SentencePiece packages BPE/unigram with raw-string handling. All feed the same CLM loss—only the discrete alphabet changes.`,
        },
      },
    },
    {
      id: 'supervised-fine-tuning',
      title: 'SFT: Learning to Follow Instructions',
      visualizationProps: {
        mode: 'sft-viz',
      },
      content: {
        text: 'After pre-training, a model is a "completion machine". To make it an "assistant", we fine-tune it on a high-quality dataset of Instruction-Response pairs ($Q \\to A$).',
        goDeeper: {
          math: String.raw`\mathcal{L}_{\mathrm{SFT}} = - \sum_{t \in \mathrm{answer}} \log p_\theta(y_t \mid x, y_{<t})`,
          explanation: String.raw`MASKING SUPERVISION

Often prompts x are included in context but not given a next-token loss; only assistant tokens contribute to CE. That teaches conditional generation without changing the architecture—just the data layout and loss mask.

DISTRIBUTION SHIFT

SFT pulls π_pre toward a narrower support of helpful behaviors. Overfitting to small SFT sets hurts; mixing general language data or repeating multi-epoch schedules trades off alignment strength vs. capability retention.

MULTI-TURN FORMATTING

Chat templates (role tags, stop tokens) are part of the interface specification; mathematically they are extra symbols in x that shape the induced conditional.`,
        },
      },
    },
    {
      id: 'rlhf-overview',
      title: 'RLHF: Reward Modeling',
      visualizationProps: {
        mode: 'rlhf-loop-viz',
      },
      content: {
        text: 'SFT is limited by the amount of perfect data we have. Reinforcement Learning from Human Feedback (RLHF) allows the model to learn from human "preferences" (A is better than B).',
        goDeeper: {
          math: String.raw`L_{\mathrm{RM}} = -\mathbb{E}\bigl[\log \sigma(r_\psi(x,y_w) - r_\psi(x,y_l))\bigr]`,
          explanation: String.raw`BRADLEY–TERRY / PAIRWISE RANKING

A scalar reward model r_ψ scores (prompt, completion) pairs. On preferences y_w ≻ y_l, training maximizes margin in logit space—equivalent to logistic regression on score differences. The policy π_θ is then updated with PPO (or similar) to maximize 𝔼[r_ψ] − β KL(π_θ || π_ref) to avoid drifting off-distribution.

DPO SHORTCUT

Direct Preference Optimization reparameterizes the optimal KL-regularized policy so preference data induces a classification loss on logits without an explicit RM—same information geometry, different implementation.

LIMITATIONS

Reward hacking, human label noise, and Goodharting when r_ψ is imperfect motivate constraint ensembles, constitutional AI, and process supervision research.`,
        },
      },
    },
    {
      id: 'lora-efficiency',
      title: 'LoRA: Parameter-Efficient Fine-Tuning',
      visualizationProps: {
        mode: 'lo-ra-viz',
        interactive: true,
      },
      content: {
        text: 'Fine-tuning a 70B parameter model is expensive. Low-Rank Adaptation (LoRA) allows us to train only a tiny fraction of the weights (low-rank matrices) while keeping the base model frozen.',
        goDeeper: {
          math: String.raw`W' = W_0 + B A, \quad B \in \mathbb{R}^{d \times r},\; A \in \mathbb{R}^{r \times k},\; r \ll d,k`,
          explanation: String.raw`INTRINSIC DIMENSION HYPOTHESIS

Updates needed for a downstream task often lie near a low-dimensional subspace of weight space. LoRA learns that subspace per layer; at inference BA can be merged into W_0 for zero latency overhead.

WHERE TO ATTACH

Common targets are attention projections (q,v especially) and sometimes FFN layers. Rank r (4–64 typical) trades capacity vs. memory; scaling α/r controls effective step size.

FULL FINETUNE BASELINE

When data is huge and distribution shift extreme, full updates still win; LoRA shines for adapters, personalization, and rapid iteration on frozen foundations.`,
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with LLM training parameters like Temperature and LoRA rank.',
    parameters: [],
    tryThis: [
      'Adjust the temperature to see how the probability distribution shifts.',
      'Change the LoRA rank and notice the change in trainable parameter count.',
    ],
  },
  challenges: [],
};

export default llmTrainingModule;
