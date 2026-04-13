import type { ModuleData } from '@/core/types';

export const transformersModule: ModuleData = {
  id: 'transformers',
  tierId: 3,
  clusterId: 'advanced-architectures',
  title: 'The Transformer Block',
  description:
    'Combine attention, feed-forward networks, and normalization into the engine that powers modern AI.',
  tags: ['transformers', 'llm', 'deep-learning', 'nlp'],
  prerequisites: ['attention', 'mlps'],
  difficulty: 'advanced',
  estimatedMinutes: 120,
  steps: [
    {
      id: 'the-transformer-sandwich',
      title: 'The Transformer Sandwich',
      visualizationProps: {
        mode: 'block-overview',
        manimSrc: '/transformers-manim/TransformerSandwichLesson.mp4',
        manimFallback: 'sandwich',
      },
      interactionHint:
        'Manim clip (above): Pre-LN order, n×d plate, green residual skips, MHA vs FFN geometry, Jacobian hint, Post-LN contrast — complements the Learning Note formulas.',
      content: {
        text: 'A Transformer is not just attention. One block (often Pre-LN) runs twice: LayerNorm → multi-head attention → residual add to get z; then LayerNorm → feed-forward MLP → residual add to get the next layer input. Stack that block L times.',
        goDeeper: {
          math: String.raw`\begin{aligned}
\mathbf{z}^{(\ell)} &= \mathbf{x}^{(\ell)} + \mathrm{MHA}\!\bigl(\mathrm{LN}(\mathbf{x}^{(\ell)})\bigr) \\
\mathbf{x}^{(\ell+1)} &= \mathbf{z}^{(\ell)} + \mathrm{FFN}\!\bigl(\mathrm{LN}(\mathbf{z}^{(\ell)})\bigr)
\end{aligned}`,
          explanation: String.raw`READING THE KEY FORMULAS (PRE-LN BLOCK)

Line 1: Start from layer input matrix x^(ℓ) ∈ ℝ^{n×d}. Apply LayerNorm along the feature axis for each of the n rows, run multi-head self-attention on the result, then add the output back to x^(ℓ) unchanged. That sum is z^(ℓ). Line 2: Normalize z^(ℓ) again, pass through the feed-forward map (same MLP on each row), add the result to z^(ℓ) to get the next layer input x^(ℓ+1). The Key formulas card is exactly this two-residual sandwich.

WHAT EACH SYMBOL IS MODELING

x^(ℓ): “what every token believes after ℓ−1 blocks.” LN(·): re-centers/scales each token vector so dot products in attention stay in a healthy numeric range. MHA(·): replaces each row with a weighted mixture of all rows (same n×d shape). FFN(·): nonlinear transform of each row separately—no mixing across positions inside FFN. The “+” copies identity forward so the network can learn small corrections F instead of full new representations.

MINI EXAMPLE (SHAPES ONLY)

Suppose n = 4 tokens, d_model = 512. Then x^(ℓ) is a 4×512 table. LN acts on each 512-vector. MHA returns another 4×512 table; after the first residual, z^(ℓ) is still 4×512. FFN maps each row ℝ^{512} → ℝ^{512} with an inner layer of size d_ff (often 2048). After the second residual, x^(ℓ+1) is again 4×512—ready for block ℓ+1.

GO DEEPER: ATTENTION + FFN AS TWO OPERATORS

$$
\mathrm{head}_i = \mathrm{softmax}\!\left(\frac{Q_i K_i^\top}{\sqrt{d_k}}\right) V_i, \qquad
\mathrm{MHA}(X) = \mathrm{Concat}(\mathrm{head}_1,\ldots,\mathrm{head}_h) W_O
$$

Here Q_i = X W_Q^{(i)} with W_Q^{(i)} ∈ ℝ^{d×d_k}; similarly K_i, V_i. The fraction divides raw dot products by √d_k so that if entries of Q,K were unit-variance, the logits have variance ≈1 before softmax—preventing everything from collapsing to one-hot or uniform. Row i of softmax(Q_i K_i^⊤ / √d_k) is a probability vector over positions; multiplying by V_i yields a convex combination of value rows—one “gather” step per head.

$$
\mathrm{FFN}(x) = W_2 \, \sigma(W_1 x + b_1) + b_2
$$

Per token x ∈ ℝ^d_model, W_1 lifts to ℝ^{d_ff}, σ is GELU/ReLU, W_2 projects back. Parameter count ~2·d_model·d_ff per layer—often larger than attention projections. Intuition: attention mixes “who”; FFN mixes “what features” at each position after who has been chosen.

POST-LN CONTRAST (ORIGINAL PAPER)

Vaswani et al. used y = LN(x + MHA(x)), z = LN(y + FFN(y)). Same pieces, different order: normalize after the residual instead of before the sublayer. Pre-LN (the card) tends to make very deep stacks easier to train; both are valid “mathematical models” of the same block with different numerical conditioning.`,
        },
        authorNote:
          'Key formulas = Pre-LN residual block. Read each “+” as carrying identity; read LN as fixing scale; read MHA as mixing rows; read FFN as per-row nonlinear map. The embedded Manim walkthrough stresses correct vertical order, explicit skips, row-mixing vs per-row FFN, and ∂h backprop through I + ∂F.',
      },
    },
    {
      id: 'positional-encoding',
      title: 'Positional Encoding: Where am I?',
      visualizationProps: {
        mode: 'position-viz',
      },
      content: {
        text: 'Attention has no concept of order. To a Transformer, "Dog bites man" and "Man bites dog" look identical. We add special "Positional Encodings" to the inputs to give the model a sense of relative position.',
        goDeeper: {
          math: String.raw`\begin{aligned}
\mathrm{PE}_{(pos, 2i)} &= \sin\!\bigl(pos / 10000^{2i/d_{\mathrm{model}}}\bigr) \\
\mathrm{PE}_{(pos, 2i+1)} &= \cos\!\bigl(pos / 10000^{2i/d_{\mathrm{model}}}\bigr)
\end{aligned}`,
          explanation: String.raw`READING THE KEY FORMULAS

pos is the integer token index (0,1,2,…). i runs over “frequency bands” 0,1,…,d_model/2−1. For each i you get one sine in dimension 2i and one cosine in dimension 2i+1. The divisor 10000^{2i/d_model} makes the wavelength grow with i: small i → rapid oscillation in pos; large i → slow oscillation. So the model receives a multi-scale code of where it sits on the number line of indices.

WHAT THIS MODEL ASSUMES

Self-attention without PE is invariant to permuting rows: it is a multiset processor. PE breaks that symmetry by adding a deterministic vector PE(pos) to (or concatenating with) the token embedding. The model sees E_word + PE(pos); inner products then depend on both content and absolute index.

MINI EXAMPLE (d_model = 4, TWO BANDS)

Take d_model = 4, so i ∈ {0,1}. For pos = 0 and pos = 1, compare PE(0) and PE(1). Dimension 0: sin(0/10000^0)=0 vs sin(1/10000^0)=sin(1). Dimension 1: cos(0)=1 vs cos(1). Dimensions 2–3 use a much longer wavelength (10000^{2/4}=100). The point: nearby positions differ more in the “fast” dimensions than in the “slow” ones—like a mixed radix clock.

GO DEEPER: WHY SIN/COS INSTEAD OF INTEGER pos

One-hot(pos) in ℝ^L needs L dimensions and does not extrapolate past L. Sinusoids map pos → ℝ^d with fixed d and smooth extrapolation. Trigonometric identities let linear layers build functions of (pos_i − pos_j) from PE(pos_i)·PE(pos_j) pairs—useful for relative distance without an explicit pairwise table.

INPUT TO THE TRANSFORMER

Standard: X_0 = Embed(tokens) + PE(pos) (or PE concatenated then projected). After that, every layer is nonlinear in X_0, so “position” is not only in PE—it is transformed—but PE supplies the initial breaking of permutation symmetry.`,
        },
        authorNote:
          'Key formulas = absolute sinusoidal coordinates for index pos. Fast frequencies encode fine position; slow frequencies encode coarse position; inner products can encode relative offsets.',
      },
    },
    {
      id: 'layer-normalization',
      title: 'Layer Normalization',
      visualizationProps: {
        mode: 'layernorm-viz',
        interactive: true,
      },
      content: {
        text: 'To keep training stable, we "normalize" the activations within each layer to have a mean of 0 and a variance of 1. This prevents values from exploding or vanishing as they traverse the deep stack.',
        goDeeper: {
          math: String.raw`\mathrm{LN}(h) = \gamma \odot \frac{h - \mu}{\sqrt{\sigma^2 + \varepsilon}} + \beta`,
          explanation: String.raw`READING THE KEY FORMULAS

h ∈ ℝ^d is one token’s hidden vector (one row). μ = (1/d)Σ h_j is the mean across features; σ² = (1/d)Σ(h_j−μ)² is the variance across features. The fraction subtracts μ and divides by standard deviation (plus ε to avoid divide-by-zero). γ and β are learned vectors in ℝ^d: the network re-scales and re-shifts after normalization. Output has learnable mean/variance per dimension, but starts from standardized inputs.

WHAT PROBLEM THIS MODEL SOLVES

Deep stacks multiply Jacobians; activations can drift in scale. Attention logits are dot products; if ‖q‖‖k‖ blows up, softmax saturates (nearly one-hot or nearly uniform) and gradients vanish or explode. LN keeps per-token features near unit scale so the next linear maps (Q,K,V projections) operate in a predictable numeric regime.

MINI EXAMPLE (d = 4)

Let h = [2, 2, 4, 4]. Then μ = 3, σ² = 1, so (h−μ)/σ = [−1, −1, 1, 1]. If γ = [1,1,1,1] and β = 0, LN(h) is that same vector. If the next layer would have doubled h to [4,4,8,8], μ becomes 6, σ becomes 2, and the normalized shape is again [−1,−1,1,1]—LN “erases” pure scale blow-ups while preserving relative pattern (then γ,β learn the right scale for the task).

GO DEEPER: BATCHNORM CONTRAST

BatchNorm uses mean/variance across batch × spatial axes for CNNs; for variable-length text, batch statistics are noisy and position-coupled. LN uses only the d features inside one token—same formula at every time step, no cross-example dependence. RMSNorm drops μ (centering) and only RMS-divides: cheaper, common in LLaMA-class models.`,
        },
        authorNote:
          'Key formula: standardize across features of one vector, then learned affine γ,β. It is a per-token scale controller, not a batch statistic.',
      },
    },
    {
      id: 'residual-connections',
      title: 'Residual (Skip) Connections',
      visualizationProps: {
        mode: 'residual-viz',
      },
      content: {
        text: 'In deep models, information can get lost. We use "Skip Connections"—we add the input of a layer directly to its output. This creates a "Highway" for gradients to flow backwards during training.',
        goDeeper: {
          math: String.raw`h_{\ell+1} = h_\ell + \mathcal{F}_\ell(h_\ell) \qquad\text{(additive residual)}`,
          explanation: String.raw`READING THE KEY FORMULA

h_ℓ is the input to sublayer ℓ; F_ℓ is the learned nonlinear transform (attention block, FFN, etc.). The output is input plus update. If F_ℓ outputs near zero, h_{ℓ+1} ≈ h_ℓ—identity is easy to represent. The model learns “residuals” Δ = F_ℓ(h_ℓ) instead of the full next representation from scratch.

GRADIENT MEANING (BACKPROP)

∂L/∂h_ℓ = ∂L/∂h_{ℓ+1} · (I + ∂F_ℓ/∂h_ℓ). The identity I routes ∂L/∂h_{ℓ+1} backward unchanged—an express lane. Even when ∂F_ℓ/∂h_ℓ is small or noisy, part of the learning signal still reaches earlier layers. That is the main training-stability story for deep ResNets and Transformers.

MINI EXAMPLE (SCALAR TOY)

Suppose h_ℓ = 1 and F_ℓ(h) = 0.01·σ(w h). Then h_{ℓ+1} = 1 + small bump. Over 100 layers, the stack can accumulate rich behavior from tiny per-layer edits without needing each layer to output the full hidden state from zero.

GO DEEPER: WHERE IT APPEARS IN THE CARD

In the Pre-LN pair, the “+” after MHA and the “+” after FFN are the two residual connections. Mathematically each is y = x + G(LN(x)) with G = MHA or FFN. Post-LN instead computes LN(x + G(x))—same F, different placement of LN; the residual “+” is still the identity carrier.`,
        },
        authorNote:
          'Key formula says: next state = old state + learned delta. The I in the Jacobian is why deep nets train at all.',
      },
    },
    {
      id: 'feed-forward-networks',
      title: 'Feed-Forward Networks (FFN)',
      visualizationProps: {
        mode: 'ffn-viz',
      },
      content: {
        text: 'After talking to other words via attention, each word passes through a shared MLP. This is where most of the "Knowledge" of the model is stored—it is the local processing unit.',
        goDeeper: {
          math: String.raw`\mathrm{FFN}(x) = W_2 \, \sigma(W_1 x + b_1) + b_2, \quad x \in \mathbb{R}^{d_{\mathrm{model}}}`,
          explanation: String.raw`READING THE KEY FORMULA

x is one token vector. W_1 ∈ ℝ^{d_model × d_ff} and W_1 x + b_1 ∈ ℝ^{d_ff} is the “expand” layer. σ is a nonlinearity (GELU in GPT, ReLU in older nets). W_2 ∈ ℝ^{d_ff × d_model} “contracts” back to model width. Biases shift decision surfaces. Same weights applied independently to every token row after attention.

PARAMETER COUNT MODEL

Roughly: d_model·d_ff (W_1) + d_ff (b_1) + d_ff·d_model (W_2) + d_model (b_2) ≈ 2 d_model d_ff + lower order. With d_ff = 4 d_model, that is ~8 d_model² scalars per layer—often larger than Q,K,V,O projections combined.

MINI EXAMPLE (d_model = 3, d_ff = 4)

Let x = [1,0,0], W_1 map to 4 hidden units, σ = ReLU. If the first hidden unit fires, W_2 can send that signal to multiple output coordinates. Across layers, composition of many such FFNs with interleaved attention builds complex token-wise maps.

GO DEEPER: SWIGLU VARIANT

Many LMs use FFN(x) = (σ(x W_1) ⊙ x W_gate) W_2 with two projections—gated linear unit (GLU) style. Still “expand → nonlinear mix → contract,” but with multiplicative gating; more parameters, strong empirical results. MoE replaces one W_1,W_2 by several experts chosen by a router—same math idea, sparse activation.`,
        },
        authorNote:
          'Key formula = two-layer MLP per token. Count parameters with 2·d_model·d_ff; that is where much of the model size lives.',
      },
    },
    {
      id: 'encoder-vs-decoder',
      title: 'Encoder vs Decoder',
      visualizationProps: {
        mode: 'enc-dec-viz',
      },
      content: {
        text: 'Some Transformers just read (BERT - Encoder), some just write (GPT - Decoder), and some do both (T5 - Encoder-Decoder).',
        goDeeper: {
          math: String.raw`\mathrm{Attn}(Q,K,V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}} + M\right) V`,
          explanation: String.raw`READING THE KEY FORMULA

QK^⊤/√d_k is the n×n matrix of scaled dot-product scores between positions (for self-attention). Adding matrix M adds a bias to every logit before softmax. M_ij = 0 means “allow attention from i to j”; M_ij = −∞ means “forbid” (softmax weight → 0).

ENCODER: M = 0 (UP TO PADDING)

Every token can attend to every token. Bidirectional context—good for “fill in the blank” (BERT). Padding masks set M_ij = −∞ when j is a pad token so mass is not wasted on meaningless positions.

DECODER: CAUSAL (AUTOREGRESSIVE) M

M_ij = −∞ when j > i (look-ahead forbidden). Then position i only aggregates positions ≤ i—what you need for p(x_t | x_{<t}). GPT stacks layers with this same masked attention pattern.

MINI EXAMPLE (n = 3)

Logits before softmax for row i=2 might be [s_{2,0}, s_{2,1}, s_{2,2}]. Causal mask zeros out j>2, so effectively only columns 0,1,2 are active (here all three). For row i=0, only column 0 is active—only past includes self.

GO DEEPER: CROSS-ATTENTION

Same formula but Q from decoder states (n_dec × d), K,V from encoder memory (n_enc × d). M is usually zero for valid encoder positions (plus padding mask). Softmax is over j ∈ {1,…,n_enc}: each decoder position builds a mixture over source tokens. That is the seq2seq “read the input while writing the output” mechanism.`,
        },
        authorNote:
          'Key formula: softmax of logits + mask, times V. Changing M switches encoder / decoder / cross-attention semantics without changing the core operator.',
      },
    },
    {
      id: 'embedding-space',
      title: 'Embedding Space',
      visualizationProps: {
        mode: 'embedding-viz',
      },
      content: {
        text: 'Words aren\'t strings to a Transformer; they are high-dimensional vectors. In this "Embedding Space", similar words (like "King" and "Queen") are mathematically close to each other.',
        goDeeper: {
          math: String.raw`x_t = E_{[\,w_t\,]} \in \mathbb{R}^{d_{\mathrm{model}}}, \quad E \in \mathbb{R}^{|\mathcal{V}| \times d_{\mathrm{model}}}`,
          explanation: String.raw`READING THE KEY FORMULA

𝒱 is the vocabulary (e.g. 50k tokens). Each row of E is a point in ℝ^{d_model}. Integer token id w_t picks row E_{[w_t]}. That row is the “meaning seed” for that symbol before any context; positional info is added separately.

WHAT IS BEING LEARNED

Training minimizes prediction loss (e.g. next-token CE). Gradients move rows of E so that co-occurring tokens in similar contexts end up with embeddings that make the attention + FFN stack predict well—implicit geometry of usage, not hand-coded semantics.

MINI EXAMPLE (TOY VOCAB, d = 2)

Suppose 𝒱 = {cat, dog, runs} and d_model = 2. After training you might see E_cat ≈ E_dog (both animals) and both far from E_runs (syntax/verb). Cosine similarity cos(u,v) = (u·v)/(‖u‖‖v‖) quantifies “closeness” independent of length.

GO DEEPER: CONTEXTUAL EMBEDDINGS

After layer L, hidden h_t^{(L)} ≠ E_{[w_t]}: the same word type in two sentences can have two different vectors. Static E is only the input code; the Transformer is a function Φ mapping token sequences → contextual representations. Analogies like king−man+woman≈queen were mostly studied on static word2vec; in LLMs, similar algebra sometimes holds in middle layers’ subspaces—not guaranteed at the final layer.`,
        },
        authorNote:
          'Key formula: token id picks a row of E. The model learns geometry from co-occurrence; attention then mixes rows across positions.',
      },
    },
    {
      id: 'tokenization',
      title: 'Tokenization: Cutting up Language',
      visualizationProps: {
        mode: 'tokens-viz',
      },
      content: {
        text: 'Models don\'t read words; they read "Tokens". Sometimes a token is a whole word, sometimes it is just a piece of a word (like "un-" or "-ing").',
        goDeeper: {
          math: String.raw`\text{string } w \;\longmapsto\; (t_1,\ldots,t_T) \in \{1,\ldots,|\mathcal{V}|\}^T`,
          explanation: String.raw`READING THE “FORMULA”

This is a discrete map from text to a sequence of vocabulary indices. T is the number of tokens (not characters or words). The Transformer’s first matrix operation is embedding lookup on each t_i.

BPE AS A COMPRESSION MODEL

Greedy merge: start with byte/char alphabet; repeatedly merge the adjacent pair that most reduces total encoded length. Result: frequent substrings become single tokens; rare words become several tokens. The Key idea is a statistical model of text, not a neural one—then the neural net runs on top.

MINI EXAMPLE

“unhappiness” might become ["un", "happ", "iness"] with a 50k vocab—three forward positions instead of one word. Arithmetic “123+456” might split into digit/symbol tokens; the model must learn math across splits.

GO DEEPER: WHY |𝒱| AND T TRADE OFF

Larger |𝒱| → shorter T but bigger embedding matrix E and output matrix W_out (each row/column is d_model parameters with tying). Self-attention cost grows as T²—so shorter tokenizations help compute but cost parameters. Production LMs tune vocab size (often 32k–256k) accordingly.`,
        },
        authorNote:
          'Key map: text → integer sequence. BPE/WordPiece are merge algorithms; the Transformer sees only indices and E rows.',
      },
    },
    {
      id: 'the-final-projection',
      title: 'The Final Head',
      visualizationProps: {
        mode: 'softmax-output-viz',
      },
      content: {
        text: 'At the very end, we take the final vector and project it back to the size of our vocabulary. A Softmax then tells us the probability of every possible next token.',
        goDeeper: {
          math: String.raw`z = h W_{\mathrm{out}} + b,\quad P_i = \frac{e^{z_i}}{\sum_j e^{z_j}}`,
          explanation: String.raw`READING THE KEY FORMULAS

h ∈ ℝ^{d_model} is the final hidden state at the position where we predict the next token (often the last context position). W_out ∈ ℝ^{d_model × |𝒱|} maps to logits z ∈ ℝ^{|𝒱|}. Index i runs over all vocabulary items. P_i is softmax(z): nonnegative, sums to 1—interpreted as the model’s categorical distribution over the next symbol.

LOGITS AS ENERGY / SCORE

Higher z_i means “more plausible token i.” Softmax is the exponential tilt that turns scores into a probability vector; it exaggerates differences (large positive z_i dominates).

MINI EXAMPLE (|𝒱| = 3)

If z = [2, 1, 0], then e^z ≈ [7.39, 2.72, 1], sum ≈ 11.1, so P ≈ [0.67, 0.24, 0.09]. The argmax is token 0; sampling would still occasionally pick others.

GO DEEPER: CROSS-ENTROPY LOSS

True next token index y*. Loss = −log P_y* = −z_y* + log Σ_j e^{z_j}. Gradients ∂L/∂z_i = P_i − 1_{i=y*}: push mass toward the correct class, down-weight others. Backprop through W_out gives ∂L/∂h = (P − one_hot(y*)) W_out^⊤—classic softmax classifier same as logistic regression at giant width |𝒱|.`,

        },
        authorNote:
          'Key formulas: linear head to logits, then softmax to probabilities. Training uses −log P(correct token).',
      },
    },
    {
      id: 'softmax-temperature',
      title: 'Softmax Temperature: Controlling Creativity',
      visualizationProps: {
        mode: 'temperature-viz',
        interactive: true,
      },
      content: {
        text: 'We can control how "creative" or "random" the model is using Temperature (T). High temperature makes the probability distribution flatter (more random), while low temperature makes it peakier (more confident).',
        goDeeper: {
          math: String.raw`P_i = \frac{e^{z_i / T}}{\sum_j e^{z_j / T}}, \quad T > 0`,
          explanation: String.raw`READING THE KEY FORMULA

Divide every logit by T before the same softmax. T = 1 is the model’s native distribution. T < 1 multiplies differences (z_i − z_j) by 1/T > 1—sharper preferences, closer to argmax. T > 1 shrinks differences—flatter P, more random sampling.

INVARIANCE NOTE

Softmax is invariant to adding a constant to all logits; only differences z_i − z_j matter. Temperature scales all pairwise differences uniformly.

MINI EXAMPLE

z = [2, 1, 0]. T = 0.5 ⇒ scaled [4,2,0] ⇒ much more peaked on token 0. T = 2 ⇒ scaled [1,0.5,0] ⇒ closer to uniform.

GO DEEPER: ENTROPY

H(P) = −Σ P_i log P_i. Increasing T increases H in typical cases (distribution spreads). T → 0+: P → one-hot on argmax (break ties arbitrarily). T → ∞: P → uniform 1/|𝒱|. In code, very large T can cause numerical overflow—implementations often clamp logits or use log-softmax tricks.`,
        },
        authorNote:
          'Key formula: logits divided by T, then softmax. It is a single knob on the Gibbs distribution at inverse temperature 1/T.',
      },
    },
    {
      id: 'weight-tying',
      title: 'Weight Tying',
      visualizationProps: {
        mode: 'weight-tying-viz',
      },
      content: {
        text: 'Modern models often use the same weights for the Input Embeddings and the Final Output Projection. This reduces the number of parameters and forces the model to learn a consistent representation of language.',
        goDeeper: {
          math: String.raw`W_{\mathrm{out}} = E^\top,\quad z = h E^\top + b`,
          explanation: String.raw`READING THE KEY FORMULA

E has shape |𝒱| × d_model (each token a row). Transpose E^⊤ has shape d_model × |𝒱|. Using W_out = E^⊤ means the logit for token i is z_i = h · E_i + b_i (dot product with the same vector used as input embedding for i, plus bias). “Predicting token i” scores how well h aligns with the embedding direction of i.

PARAMETER SAVINGS

Untied: |𝒱|·d for E plus |𝒱|·d for W_out ≈ 2|𝒱|d. Tied: |𝒱|d—half the matrices at the boundary. At |𝒱|=50257 and d=12288, savings are hundreds of millions of parameters.

WHY IT IS A SENSIBLE CONSTRAINT

If the network reads a token through E_i, using the same vector to score how likely that token is to follow h encourages consistent “type” geometry for input and output.

GO DEEPER: WHEN NOT TO TIE

If encoder and decoder vocabularies differ, or if output symbols are not the same set as input tokens (special heads), tying can hurt. Some multimodal models untie. The math is optional structure on top of the same linear head z = h W + b.`,
        },
        authorNote:
          'Key formula W_out = E^⊤: logits are dot products of h with input embedding rows. Saves |𝒱|·d parameters.',
      },
    },
    {
      id: 'scaling-laws',
      title: 'Scaling Laws: bigger is better?',
      visualizationProps: {
        mode: 'scaling-laws-viz',
      },
      content: {
        text: 'Why do we keep making models bigger? Research shows that as we increase Compute, Data, and Parameters, the model\'s loss drops predictably according to a Power Law.',
        goDeeper: {
          math: String.raw`L(N,D,C) \approx a N^{-\alpha} + b D^{-\beta} + c C^{-\gamma} + L_\infty`,
          explanation: String.raw`READING THE KEY FORMULA (EMPIRICAL FIT)

L is test loss (often cross-entropy per token). N = non-embedding parameter count, D = training tokens seen, C = compute (FLOPs). The negative powers mean: bigger N, D, or C typically lowers loss, with diminishing returns. L_∞ is an irreducible baseline (Bayes error for the task, noise floor). a,b,c,α,β,γ are fit from many training runs—this is not a theorem like Bayes’ rule, it is a phenomenological model of large-scale training.

WHAT “POWER LAW” MEANS ON LOG-LOG PLOTS

If L − L_∞ ∝ N^{−α}, then log(L − L_∞) ≈ log a − α log N—a straight line with slope −α. Practitioners extrapolate along that line to guess loss before spending full budget.

CHINCHILLA POINT

Hoffmann et al. showed many models were too big for their data: for fixed 6ND-like compute, increasing D as much as N improves loss. So the “optimal” N,D pair for a compute budget is not “max N”; data and parameters should scale together—still captured qualitatively by joint fits L(N,D).

MINI EXAMPLE (TOY NUMBERS)

Suppose halving N increases loss by 3% relative, and doubling D decreases loss by 2%. A planner trades billion-parameter cuts for more epochs or tokens until the marginal log-loss improvement per dollar matches.

GO DEEPER: LIMITS

Scaling laws break when data is exhausted, labels are wrong, or the task saturates. They describe smooth regimes—not safety or alignment, which may worsen with scale if reward models are imperfect.`,
        },
        authorNote:
          'Key formula: smooth decreasing L in N,D,C with exponents fit empirically. Use it for budgeting; do not treat it as physics.',
      },
    },
  ],
  playground: {
    description: 'Experiment with the Transformer architecture. Tweak the number of heads, layers, and embedding size.',
    parameters: [
      { id: 'layers', label: 'Layers', type: 'select', options: ['1', '2', '4', '8'], default: '2' },
      { id: 'heads', label: 'Heads', type: 'select', options: ['1', '2', '4', '8'], default: '4' },
    ],
    tryThis: [
      'Increase the number of layers. Watch how the "Receptive Field" of the model expands.',
      'Change the number of heads and see how the attention patterns become more complex.',
    ],
  },
  challenges: [],
};

export default transformersModule;
