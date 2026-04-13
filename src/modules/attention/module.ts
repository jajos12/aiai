import type { ModuleData } from '@/core/types';

const attentionModule: ModuleData = {
  id: 'attention',
  tierId: 3,
  clusterId: 'advanced-architectures',
  title: 'Attention Mechanism',
  description:
    'From soft dictionary lookup to scaled dot-product attention, multi-head blocks, causal masking, and cross-attention—detailed notes on geometry, training dynamics, complexity, and how modern Transformers use each piece.',
  tags: ['attention', 'transformers', 'nlp', 'deep-learning'],
  prerequisites: ['perceptrons', 'dot-product'],
  difficulty: 'advanced',
  estimatedMinutes: 120,
  steps: [
    {
      id: 'the-database-analogy',
      title: 'The Database Analogy',
      visualizationProps: {
        manimSrc: '/attention-manim/AttentionDatabaseAnalogyLesson.mp4',
        manimFallback: 'database-analogy',
      },
      content: {
        text:
          'Picture a dictionary: key → value. A classical lookup returns one entry when the key matches exactly, or fails otherwise. Attention relaxes every part of that story: the query is compared to all keys in parallel; each comparison produces a score; scores become nonnegative weights that sum to 1; the return value is a weighted mixture of all values. Nothing is discrete anymore—so the whole module can sit inside a neural network and learn with gradient descent.',
        goDeeper: {
          math: String.raw`\text{output} = \sum_{i=1}^{n} \alpha_i\, V_i \qquad \sum_i \alpha_i = 1,\ \ \alpha_i \ge 0`,
          explanation: `INTUITION

A hash table returns one value or nothing. Attention returns a convex combination of all values: each key “bids” for relevance, the bids become nonnegative weights that sum to 1, and the output is the weighted average. You can read that as “many partial matches at once” instead of one exact match. If the query sits halfway between two keys in embedding space, you naturally get a blend of two values—something no hard lookup can express.

WHY SOFTNESS MATTERS FOR LEARNING

If retrieval were hard (argmax only), small parameter changes would rarely flip which key wins, so gradients would be zero almost everywhere (subgradient methods exist, but they are brittle at scale). Softmax-smoothed weights change smoothly when queries and keys move, so backpropagation can adjust the projections that produce Q, K, and V. The entire pipeline—score, softmax, mix—is differentiable almost everywhere, which is why billion-parameter language models can be trained end-to-end from next-token loss alone.

THREE ROLES

Query = what you are looking for right now (the current need or question). Key = how each memory slot advertises what it “contains.” Value = what you actually read out if that slot wins. In real networks Q, K, V are not three separate databases; they are three linear projections of the same underlying token (or image patch) vectors. The analogy names the semantics of those projections after training has shaped them.

FROM ANALOGY TO MATH

Scores are typically dot products (later: scaled dot products) between query vectors and key vectors. Those raw scores feed softmax to get α. Then you mix value vectors. The visualization with orthogonal one-hot keys is the idealized case: one key lines up with the query and steals all mass; in high dimensions learned keys overlap partially, so α is genuinely distributed.

COMPOSITION ACROSS LAYERS

One attention layer performs one soft read. Stacking layers lets later queries depend on earlier mixtures: the model can implement multi-hop reasoning (“find the subject, then find what refers to it”) without an explicit loop in the code—only in depth. Residual connections carry raw token identity forward while attention injects context.

LIMIT OF THE ANALOGY

Real Transformers add layer normalization, residuals, feedforward MLPs, multiple heads, causal or padding masks, rotary or relative position encodings, and sometimes sparse or linear attention approximations. Treat the database story as the minimal control flow: compare → normalize scores to weights → mix values. Every other idea in this module refines one of those three lines.

CONNECTION TO INFORMATION RETRIEVAL

Retrieval-augmented generation (RAG) uses a hard retriever first, then often feeds chunks into Transformer cross-attention. The “soft” attention inside the model is a second, differentiable retrieval over whatever vectors the encoder produced—same mechanism, different content.`,
        },
      },
      interactionHint:
        'Watch the Manim clip: exact match vs scoring every key, softmax weights, then a blended output.',
    },
    {
      id: 'query-key-dot-product',
      title: 'Query-Key Dot Product',
      visualizationProps: {
        manimSrc: '/attention-manim/AttentionQueryKeyDotProductLesson.mp4',
        manimFallback: 'query-key-dot-product',
      },
      content: {
        text:
          'The compatibility score between a query vector q and a key vector k is very often their dot product q · k. Geometrically that is the length of q times the length of k times the cosine of the angle between them: so both magnitude and direction matter. In Transformers, q and k are learned linear functions of the hidden state, so the model learns which directions in ℝ^{d_k} should “attract” each other when two tokens should interact. The Manim clip rotates q in the same 2-D key layout as the playground; use Playground afterward to drag q yourself.',
        goDeeper: {
          math: String.raw`\mathrm{score}(q,k) = q \cdot k = \|q\|\,\|k\|\,\cos\theta \qquad q,k \in \mathbb{R}^{d_k}`,
          explanation: `GEOMETRY

In ℝ^{d_k} the dot product measures how much two vectors point in the same direction, scaled by how long they are. Same direction → positive score; orthogonal → zero; opposite → negative. Keys therefore “compete” on a continuum: there is no binary match/mismatch until softmax later sharpens the distribution.

RELATION TO COSINE SIMILARITY

Cosine similarity is (q·k)/(||q|| ||k||): it removes the product of norms. Pure dot-product attention is sensitive to vector scale—larger-magnitude Q or K rows inflate logits and change softmax temperature. That is one reason models use layer normalization before attention and the 1/√d_k scaling factor on logits (covered later). Without those, training can accidentally push norms so that attention is always nearly one-hot or nearly uniform.

WHY DOT PRODUCT AND NOT ONLY L2 DISTANCE

Expanding squared Euclidean distance gives ||q−k||² = ||q||² + ||k||² − 2 q·k. For a fixed query q, the term ||q||² is constant over keys; ||k||² sometimes appears as a separate component or is absorbed depending on parameterization. What remains as the competitive part across keys is often linear in k, which is exactly what QK^T computes efficiently as one big matrix multiply.

BATCHED FORM

For sequence length n, stack rows q_i and k_j into matrices Q and K. Then all n² scores for one head are QK^T in a single GEMM—this is why attention is fast on GPUs despite Θ(n²) entries: it is one very regular multiply-add pattern.

ALTERNATIVE SCORE FUNCTIONS

Additive attention (Bahdanau-style) used a small MLP on [q;k]. Some models use learned dot products with low-rank or kernel approximations. Relative position biases add a term that depends on (i−j). The 2-D demo is vanilla dot product; the design space is larger, but scaled dot-product remains the default in large LMs.

PREREQUISITE PAYOFF

You already studied dot products as projection: q·k is how much of k lies along q when both are unit length. Attention is that idea at sequence scale—every token asks, “which other token vectors align with my query direction?”

$$
S = QK^\\top \\in \\mathbb{R}^{n \\times n}
$$

Each row i lists scores from query position i to every key position j.`,
        },
      },
      interactionHint:
        'Video: watch q rotate and the four q·k scores update. Playground: drag the query to reproduce the same dot-product rules.',
    },
    {
      id: 'softmax-weights',
      title: 'Softmax: Turning Scores into Probabilities',
      visualizationProps: {
        manimSrc: '/attention-manim/AttentionSoftmaxWeightsLesson.mp4',
        manimFallback: 'softmax-weights',
        mode: 'softmax',
        draggableQuery: true,
        query: [1, 0],
        keys: [[1, 0], [0.7, 0.7], [0, 1], [-1, 0]],
        showScores: true,
        showSoftmax: true,
      },
      content: {
        text:
          'Raw scores s_i can be any real numbers—positive, negative, large, or small. Softmax maps (s_1,…,s_n) to a probability vector (α_1,…,α_n): each α_i > 0, Σ_i α_i = 1, and larger logits win disproportionately because α_i ∝ e^{s_i}. The Manim clip (~1 minute) walks through the formula step by step: exponentials and the partition sum Z, a bar chart with Σα ≈ 1, the fact that adding the same constant to every logit leaves α unchanged (so only differences matter), the subtract-max trick for stable code, how temperature T flattens or sharpens the distribution, and a short bridge to training via log-probabilities before closing on y = Σ_i α_i V_i. After the video, the Learning Note below covers invariance, entropy, Jacobians, and numerics in more depth.',
        goDeeper: {
          math: String.raw`\alpha_i = \frac{e^{s_i}}{\sum_j e^{s_j}} \qquad s_i = \frac{q \cdot k_i}{\sqrt{d_k}}\ \ (\text{typical})`,
          explanation: `DEFINITION AND INVARIANCE

Softmax is invariant to adding the same constant to every logit: softmax(s) = softmax(s + c·1). Only differences s_i − s_j matter. That matches attention as relative competition: rescaling all scores together does not change α.

WHY THE EXPONENTIAL

Exponentiation maps ℝ to ℝ_{>0}, so every unnormalized weight is positive before normalization. It also amplifies gaps: if s_1 − s_2 = 3, the ratio e^{s_1}/e^{s_2} = e^3 ≈ 20; if the gap is 10, the ratio explodes. The model can therefore sharpen or flatten the distribution by learning how separated logits are—often indirectly via norms and scaling.

ENTROPY AND “FOCUS”

Let H(α) = −Σ_i α_i log α_i. When logits are small and similar, α ≈ uniform and H is high—the model averages many values. When one logit dominates, α ≈ one-hot and H ≈ 0—the model focuses. Training does not explicitly optimize entropy; it falls out of the loss. Some analysis work studies how entropy evolves across layers and heads.

JACOBIAN AND COUPLED GRADIENTS

Softmax outputs are coupled: ∂α_i/∂s_j is nonzero for every j. Backprop through softmax redistributes error to all logits. If α is nearly one-hot, gradients w.r.t. non-argmax logits are tiny—those keys receive little immediate update unless regularization or noise helps.

NUMERICAL STABILITY

Implementations compute s_i' = s_i − max_j s_j before exp. That does not change α (invariance under constant shift) but prevents overflow when some s_i are large. Float16 training sometimes uses extra care on softmax ranges.

TEMPERATURE ANALOGY

Dividing logits by a temperature T before softmax flattens (T>1) or sharpens (T<1) the distribution. The √d_k scale in attention acts like a fixed structural choice of temperature tied to dimension; some work adds a learned per-head temperature.

BRIDGE TO VALUES

The α_i you compute here are exactly the coefficients in y = Σ_i α_i V_i. Softmax is the gate that turns “how similar is my query to each key?” into “how much of each value do I read?”

WHAT THE ANIMATION ADDS

Seeing e^{s_i} grow on a bar chart makes the “winner-take-more” effect visceral: a logit gap of a few nats becomes a large mass ratio after exp. The temperature segment shows the same logits under s/T—high T spreads mass (higher entropy read), low T concentrates it (near one-hot). Connect that mental picture to attention heads: some heads stay diffuse (broad context), others sharpen onto a few positions after training shapes Q and K.`,
        },
      },
      interactionHint:
        'Video: play / pause / scrub the softmax lesson (~1 min). If the MP4 is missing, a static summary and render command appear.',
    },
    {
      id: 'weighted-sum-values',
      title: 'The Weighted Sum of Values',
      visualizationProps: {
        mode: 'values',
        draggableQuery: true,
        query: [1, 0],
        keys: [[1, 0], [-1, 0]],
        values: [[1, 1], [2, -1]],
        showSoftmax: true,
        showOutput: true,
      },
      content: {
        text:
          'After softmax you have weights α_1,…,α_m for m memory positions. The attention output is y = Σ_i α_i V_i: each value vector is scaled by how much the model attended there, then summed. If α puts all mass on one index j, then y = V_j exactly—that is the “hard” lookup limit inside a soft mechanism. Usually α is spread, so y is a new vector lying in the convex hull of the values: a smooth blend that can represent mixed context (e.g. blending two entities when the query is ambiguous).',
        goDeeper: {
          math: String.raw`y = \sum_{i=1}^{n} \alpha_i\, V_i \in \mathbb{R}^{d_v} \qquad Y = \mathrm{softmax}(S)\,V \ \ (rows)`,
          explanation: `LINEARITY IN V, NONLINEARITY OVERALL

Fix α. Then y is linear in each V_i and in the stacked matrix V. But α = softmax(f(Q,K)) is a nonlinear function of hidden states, so the map from token embeddings to y is nonlinear when the full layer is unrolled. That routing nonlinearity is different from an MLP, which mixes within each position only; attention mixes across positions.

MATRIX VIEW

Stack value vectors as rows V ∈ ℝ^{n×d_v}. For one query row α ∈ ℝ^{1×n}, y = αV. For all queries at once, Y = softmax(S)V where softmax is row-wise and S = QK^T/√d_k. One matmul after softmax is the value projection step—extremely friendly to tensor cores.

DIFFERENTIABLE MEMORY READ

Interpret rows V_i as memory. α is a soft address: a distribution over rows. Because α is smooth in Q and K, small parameter changes slightly shift the read; gradients tell Q,K how to move mass toward value-rich positions. Discrete k-NN retrieval would not backprop cleanly through the neighbor index.

GRADIENTS TO VALUES

∂L/∂V_i contains a term α_i ∂L/∂y. Positions attended strongly receive larger updates. Queries and keys receive credit for steering mass to helpful values—useful for interpretability sketches, though in deep networks credit is distributed.

HEADS AND OUTPUT PROJECTION

Per head, d_v is often d_model/h. Concatenated heads pass through W^O to return to d_model. The weighted sum is the inner core; projection is how heads recombine into one residual stream.

EXTREME AND DEGENERATE CASES

One-hot α recovers exact V_j. Uniform α yields the arithmetic mean of all values (sometimes seen early in training or under bad initialization). Nearly uniform α wastes capacity; nearly one-hot α can overfit positional shortcuts if the task allows.

RELATION TO MIXTURE-OF-EXPERTS

MoE layers also route tokens to experts via gating softmaxes. Attention routes information between positions; MoE routes compute between experts. The softmax gating pattern rhymes even though the semantics differ.`,
        },
      },
    },
    {
      id: 'self-attention',
      title: 'Self-Attention: Context is Everything',
      visualizationProps: {
        mode: 'self-attention',
      },
      content: {
        text:
          'Self-attention means Q, K, and V all come from the same sequence of hidden vectors—typically XW_Q, XW_K, XW_V for the same matrix X of token embeddings (plus position information, depending on architecture). Each position i issues a query that attends over all positions j; the output at i is a mixture of other tokens’ values, weighted by how relevant those keys appear to that query. After stacking layers, “bank” can disambiguate to “financial institution” or “river edge” because representations absorb evidence from neighbors; that is contextualized embedding in action.',
        goDeeper: {
          math: String.raw`\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`,
          explanation: `SHAPES (SINGLE SEQUENCE)

Let batch size B=1 for clarity. Hidden states X ∈ ℝ^{n×d_model}. Learned weights W_Q, W_K, W_V ∈ ℝ^{d_model×d_k} (per head dimensions may differ in some variants). Then Q = XW_Q, K = XW_K, V = XW_V, each in ℝ^{n×d_k} (assuming d_k for all three for simplicity). Scores S = QK^T/√d_k ∈ ℝ^{n×n}. Row i is: how position i scores every position j. Softmax is along the key dimension (columns), producing α ∈ ℝ^{n×n}. Output Y = αV ∈ ℝ^{n×d_k}.

WHY “SELF”

Queries and keys arise from the same sequence. Cross-attention (later) decouples: Q from decoder, K and V from encoder or another modality. Self-attention builds contextualized representations within one token array; cross-attention aligns two arrays.

RECEPTIVE FIELD AND DEPTH

One full-rank self-attention layer connects every pair of positions in one hop. Stacking L layers can mix information along paths of length L; with residuals, raw token information can also propagate trivially. Very deep models can implement sophisticated multi-hop patterns without recurrence in time.

POSITION INFORMATION

Plain attention is permutation-equivariant: if you permute input rows the same way on Q,K,V, outputs permute the same way—no notion of “left vs right” unless you inject positions. Practice uses absolute embeddings, relative biases, rotary embeddings (RoPE), or ALiBi so that order matters.

COMPLEXITY AND MEMORY

Dense attention costs Θ(n²) in time and memory for storing S or α for backprop. For n in the tens of thousands this dominates training. Mitigations: FlashAttention-style IO-aware kernels, checkpointing, sparse patterns (local windows), linear attention kernels, or recurrence (RNN/SSM hybrids).

PRE-NORM RESIDUAL STANDARD

A common block is x ← x + Attention(LayerNorm(x)); x ← x + FFN(LayerNorm(x)). Normalizing before attention keeps dot products in a stable range; residuals preserve gradient paths and let attention act as a learned correction.

MULTI-HEAD WRAP-IN

The formula in the box is one head. Real layers run h heads in parallel, concatenate, and apply W^O. The next lesson details head splitting.

$$
Y = \\mathrm{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right) V
$$

Row i of Y is the new contextualized vector at token i before head concat and output projection.`,
        },
      },
    },
    {
      id: 'multi-head-attention',
      title: 'Multi-Head Attention: Parallel Reasoning',
      visualizationProps: {
        mode: 'multihead-viz',
      },
      content: {
        text:
          'A single attention head computes one n×n pattern of “who looks at whom.” Multiple heads use separate learned projections into smaller subspaces—each head has its own W_i^Q, W_i^K, W_i^V—so the same tokens participate in several independent softmax mixtures in parallel. Empirically, heads specialize (syntax, rare word copying, delimiter matching, long-range agreement, etc.), though not every head is human-interpretable. Concatenating head outputs and applying one more matrix W^O fuses those views back into the model’s main width d_model.',
        goDeeper: {
          math: String.raw`\begin{aligned}
\mathrm{head}_i &= \mathrm{Attention}(QW_i^Q,\,KW_i^K,\,VW_i^V) \\
\mathrm{MultiHead}(Q,K,V) &= \mathrm{Concat}(\mathrm{head}_1,\ldots,\mathrm{head}_h)\,W^O
\end{aligned}`,
          explanation: `PARAMETERIZATION

Often all heads are packed: W_Q ∈ ℝ^{d_model×(h·d_k)} reshaped into h matrices of size d_model×d_k. The same for K and V. That layout keeps GEMMs large and efficient. Each head_i uses its slice of the projected Q,K,V.

WHY MULTIPLE HEADS

One softmax must allocate a single probability simplex across positions. Multiple heads let the model allocate different simplexes for different sub-tasks: one head might attend locally (punctuation, morphology), another might bridge long gaps (coreference, discourse). Forcing all patterns through one head would require a more entangled representation in one softmax.

OUTPUT PROJECTION W^O

Concatenation yields dimension h·d_v (often h·d_k with d_v = d_k). W^O ∈ ℝ^{(h·d_v)×d_model} mixes head outputs linearly so channels interact before the next sublayer. Without W^O, heads could not easily combine complementary features.

HEAD COUNT VS WIDTH

Increasing h while holding d_model fixed shrinks per-head dimension d_k = d_model/h (typical choice). Very many thin heads emphasize diversity of routing; fewer wide heads emphasize capacity per softmax. Vision Transformers sometimes use different head counts than text models; there is no single optimum.

INTERPRETABILITY

Probing studies sometimes label heads “BOS-to-verb” or “duplicate token.” Others resist clean descriptions. Use such labels as heuristics, not guarantees.

EFFICIENCY VARIANTS

Multi-query attention (MQA) shares one K,V across all heads—only Q differs—cutting KV cache size for autoregressive decoding. Grouped-query attention (GQA) shares K,V within groups. Training dynamics differ slightly; deployment memory often improves a lot.

COMPUTE FOOTPRINT

Cost scales about linearly in h if d_k and d_v scale inversely with h to preserve width. Total attention FLOPs still scale with n² times number of layers times heads.

STACKING WITH FFN

Standard Transformer block: MultiHeadAttention → residual → LayerNorm → position-wise FFN (often d_ff = 4·d_model) → residual → LayerNorm. Attention mixes positions; FFN mixes channels at each position. Both are needed.`,
        },
      },
    },
    {
      id: 'scaling-factor-depth',
      title: 'The Scaling Factor: Why $\\sqrt{d_k}$?',
      visualizationProps: {
        mode: 'scaling-viz',
        interactive: true,
      },
      content: {
        text:
          'Each score is a sum of d_k products q^{(ℓ)} k^{(ℓ)}. If components are roughly zero-mean with unit variance and weak dependence, the sum has variance about d_k and typical magnitude about √d_k. Logits of that scale feed softmax; if they are too large, e^{s_i} blows up, one α_i → 1, and gradients ∂α/∂s become tiny for non-winners. Dividing by √d_k re-centers typical logit spread to O(1) as width changes, which stabilizes training when you scale d_model and head dimension.',
        goDeeper: {
          math: String.raw`\mathrm{scores} = \frac{QK^\top}{\sqrt{d_k}} \qquad \mathrm{Var}\!\left(\sum_{\ell=1}^{d_k} q_\ell k_\ell\right) \approx d_k\ (\text{i.i.d. unit-variance case})`,
          explanation: `VARIANCE HEURISTIC

Let q_ℓ, k_ℓ be independent, zero mean, unit variance, uncorrelated across ℓ. Then E[q·k]=0 and Var(q·k)=d_k. Typical |q·k| grows like √d_k. Scaling logits by 1/√d_k yields per-score standard deviation O(1) at initialization-style statistics. That keeps softmax off saturation when you double embedding width.

NOT A UNIQUE CHOICE

Some implementations use a learned scale per head, or RMSNorm on Q and K instead of explicit division. The original Transformer uses the fixed √d_k because it is simple and matches the random-walk variance of dot products.

SOFTMAX SATURATION PICTURE

When max_i s_i − min_i s_i ≫ 1 after exponentials, numerically α is one-hot. Backprop through saturated softmax sends gradient almost entirely through the winning logit. Other keys learn slowly; the model may lock into brittle patterns. Scaling fights this at initialization and early training; optimization still matters.

INTERACTION WITH LAYER NORM

Pre-norm keeps ||x|| roughly stable across layers, which indirectly bounds typical ||q||, ||k||. Together with √d_k scaling, training stacks dozens of blocks without attention collapsing instantly.

RELATION TO KERNEL PERSPECTIVE

Dot-product attention can be viewed as an exponential kernel on Q and K rows. The scale factor is part of the kernel bandwidth: too narrow → peaky kernel; too wide → flat kernel.

WHAT IF YOU OMIT THE SCALE

Small models might still train with tuned learning rate and luck. Large models often become unstable or require much smaller LR. Ablation papers usually treat 1/√d_k as non-optional for serious training.

LEARNED TEMPERATURE

A scalar τ per head on scores is equivalent to replacing √d_k with τ√d_k in effect. Some sparse or low-rank attention variants learn such temperatures explicitly.`,
        },
      },
    },
    {
      id: 'masked-attention',
      title: 'Masked Attention: No Peeking!',
      visualizationProps: {
        mode: 'masking-viz',
      },
      content: {
        text:
          'Language models generate left-to-right: token t must not depend on tokens t+1,…,n, or the network could cheat by copying the answer from the future. Causal (autoregressive) attention enforces this by zeroing attention mass from position i to every position j > i. In logits, you add −∞ (or a large negative constant) to forbidden entries before softmax so e^{−∞}=0. The attention matrix becomes lower triangular. Training still processes the whole sequence in parallel because each position has a fixed known mask—unlike an RNN unrolling one step at a time on the forward pass.',
        goDeeper: {
          math: String.raw`\tilde{s}_{ij} = \begin{cases} \dfrac{q_i\cdot k_j}{\sqrt{d_k}} & j \le i \\ -\infty & j > i \end{cases} \qquad \alpha_{ij} = \mathrm{softmax}_j(\tilde{s}_{ij})`,
          explanation: `WHY CAUSALITY

At inference you only know tokens 1…t when predicting t+1. Any function of the full sequence would not be implementable online unless it ignores forbidden positions. The mask bakes that constraint into the architecture so the same forward pass used at training matches the generative process.

TRAINING PARALLELISM

Teacher forcing shows the model the true prefix. For each position t, the target is the next token; the mask ensures logits at t never attend to positions > t. All positions’ losses can be computed in one batched forward/backward pass—massive speedup versus RNN BPTT for long sequences.

ENCODER VS DECODER STYLE

BERT-style encoders use full bidirectional self-attention on the input (no causal mask) because there is no autoregressive generation of those tokens inside the encoder. GPT-style decoders are causal throughout. T5-style encoder-decoder uses unmasked encoder self-attention, causal decoder self-attention, and cross-attention between them.

PADDING MASKS

Real batches pad sequences to a common length. Padding tokens should not be attended to; another mask sets logits to −∞ for pad keys. Combine causal and padding masks by taking the logical AND of allowed positions.

IMPLEMENTATION

Attention kernels often take an additive mask tensor broadcast over heads and batches. In float16, −1e4 or similar stands in for −∞. FlashAttention fuses masking with softmax to reduce memory traffic.

INFORMATION FLOW

After L causal layers, position i indirectly influences positions j>i through deeper layers only via earlier positions—no direct leak. The mask is the structural proof.

RELATION TO GRAPH VIEW

Causal attention is attention on a directed acyclic graph (chain). Bidirectional attention is a complete graph. Some sparse models use other graphs (local windows, dilated patterns).

WITHOUT THE MASK

A decoder could minimize training loss by peeking at future tokens—distribution shift at inference would break the model. The mask defines the correct conditional independence structure.`,
        },
      },
    },
    {
      id: 'cross-attention',
      title: 'Cross-Attention: The Bridge',
      visualizationProps: {
        mode: 'cross-attention-viz',
      },
      content: {
        text:
          'Cross-attention connects two representations: queries come from one sequence (often the decoder state at the current output step), while keys and values come from another (often encoder outputs over the source sentence, or image patch embeddings). The output shape follows the query side—each query row attends over all key/value positions. Machine translation uses this to let each generated English token query the entire French source; vision-language models let text tokens query image grid features. The mechanism is identical to self-attention algebra; only the source of Q versus KV changes.',
        goDeeper: {
          math: String.raw`Q = X_{\mathrm{dec}} W^Q,\ K = X_{\mathrm{enc}} W^K,\ V = X_{\mathrm{enc}} W^V \qquad Y=\mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`,
          explanation: `SHAPES AND INDEXING

If encoder length is n_enc and decoder length is n_dec, then Q ∈ ℝ^{n_dec×d_k}, K,V ∈ ℝ^{n_enc×d_k}, scores S ∈ ℝ^{n_dec×n_enc}. Row t of Y is what decoder time step t pulled from the encoder memory. Causal masks apply to decoder self-attention, not to cross-attention over encoder keys (encoder sequence is fully known when decoding begins).

ENCODER–DECODER TRANSLATION

The encoder runs once: bidirectional context over the source. The autoregressive decoder, at each layer, first does causal self-attention (“what have I generated so far?”), then cross-attention (“what in the source supports the next token?”), then FFN. Alignment patterns in α_{t,·} sometimes resemble soft word alignments—an emergent property, not an explicit loss.

MULTIMODAL INSTANTIATIONS

In some CLIP-style or Flamingo-style stacks, image tokens provide K,V and text provides Q (or the arrangement is flipped depending on direction of conditioning). The same softmax-weighted sum fuses modalities into a single hidden stream for the next layers.

SHARED DIMENSIONS

d_k and d_model must align across encoder and decoder stacks so projections match. Architectures sometimes share layer norms or tie embeddings across languages; cross-attention always needs compatible widths for QK^T.

COMPLEXITY

Per layer, Θ(n_dec · n_enc · d) for the attention matmuls. Long documents and long outputs stress memory; chunking, sparse cross-attention, or compressing the encoder into fewer memory tokens are active research and product areas.

BEYOND TRANSLATION

Summarization: encoder reads document; decoder writes summary with cross-attention into document memory. Speech-to-text: audio encoder frames as memory, text decoder queries them. Code assistants: retrieved snippets or repo context as K,V.

GRADIENT FLOW

Decoder queries learn to match encoder keys that predict the next token well. Encoder keys/values receive gradients from every decoder position that attends to them—dense supervision of the source representation when training end-to-end.

WITH ONLY SELF-ATTENTION

Decoder-only LMs (GPT) omit explicit cross-attention; “source” is concatenated into one long context and everything is self-attention (with appropriate masking or segment embeddings). Encoder-decoder models factorize the problem when input and output vocabularies or lengths differ structurally.`,
        },
      },
    },
  ],
  playground: {
    description:
      'Use sliders to move the 2-D query vector; watch dot products, softmax weights, and the value blend update in real time—same pipeline as inside a Transformer head, in miniature.',
    parameters: [
      { id: 'qX', label: 'Query X', type: 'slider', min: -1, max: 1, step: 0.1, default: 1 },
      { id: 'qY', label: 'Query Y', type: 'slider', min: -1, max: 1, step: 0.1, default: 0 },
    ],
    tryThis: [
      'Align the query with one key direction and watch one softmax mass approach 1.0.',
      'Place the query between two keys to get a deliberate mixture of two values.',
      'Compare raw dot scores versus softmax: small score differences become large probability ratios after exp.',
    ],
  },
  challenges: [
    {
      id: 'focus-attention',
      title: 'Retrieve the Value',
      description: 'Adjust the Query vector to output a value close to [2, -1] (Value 2).',
      props: {
        mode: 'values',
        draggableQuery: true,
        query: [0, 1],
        keys: [[1, 0], [-1, 0]],
        values: [[1, 1], [2, -1]],
        showSoftmax: true,
        showOutput: true,
      },
      completionCriteria: { type: 'threshold', target: 0.1, metric: 'distance_to_target' },
      hints: [
        'You want to give maximum weight to Key 2.',
        'Which direction should your Query point to maximize its dot product with Key 2?',
      ],
    },
  ],
};

export default attentionModule;
