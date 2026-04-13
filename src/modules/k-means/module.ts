import type { ModuleData } from '@/core/types';

const kMeansModule: ModuleData = {
  id: 'k-means',
  tierId: 1,
  clusterId: 'ml-fundamentals',
  title: 'K-Means Clustering',
  description:
    'Unsupervised clustering with k-means: how it differs from supervised learning, and Lloyd’s algorithm from geometry to picking K.',
  tags: ['clustering', 'unsupervised', 'k-means', 'centroids'],
  prerequisites: ['norms-distance'],
  difficulty: 'beginner',
  estimatedMinutes: 50,
  steps: [
    {
      id: 'unsupervised-learning',
      title: 'Unsupervised Learning',
      visualizationProps: {},
      content: {
        text:
          'Supervised learning fits a mapping from inputs to known targets—for example spam vs not-spam, or a numeric label. Unsupervised learning only gives you inputs: the job is to uncover hidden structure (clusters, low-dimensional shape, anomalies) without a teacher. K-means is a classic unsupervised tool: you fix a number of groups K and search for compact, round-ish clouds separated in feature space. This whole module is that story—geometry, inertia, and Lloyd’s algorithm—starting from the idea that no one handed us correct cluster labels.',
        goDeeper: {
          math: String.raw`\begin{aligned}
\text{Supervised (e.g. classification/regression):}\quad & \mathcal{D} = \{(x_i,\, y_i)\}_{i=1}^{n} \\[0.4em]
\text{Unsupervised clustering (k-means setup):}\quad & \mathcal{D} = \{x_i\}_{i=1}^{n},\ \text{learn partition into } K \text{ groups}
\end{aligned}`,
          explanation: `SUPERVISED VS UNSUPERVISED — In supervised problems, each training example includes a label or response yᵢ (class, score, sequence token, etc.). The model is trained to predict y from x using a loss that compares predictions to those targets. In unsupervised problems, the dataset is just points (or vectors) xᵢ in feature space. There is no per-example “correct answer” to imitate; instead you define an objective that captures the structure you want (compact clusters, independent components, density, …) and optimize it.

HOW K-MEANS FITS UNSUPERVISED LEARNING — K-means (Lloyd’s algorithm) is one of the most widely taught unsupervised methods. You choose K, maintain K centroids μ₁,…,μ_K, and alternate: assign each xᵢ to its nearest centroid, then move each centroid to the mean of its assigned points. The usual objective is inertia (within-cluster sum of squared distances). Nothing in the data tells you the “true” cluster id; the algorithm only reduces inertia. So k-means is unsupervised partitioning driven entirely by geometry and your choice of K—not by labels.

RELATION TO THIS MODULE — The opening video uses the same nine 2-D points as the playground: three spatial blobs with no class colors baked into the problem statement. That mirrors unsupervised clustering: you and the algorithm both infer coherent groups from layout alone. Later steps formalize assignment, the update step, distance choices, picking K (elbow / silhouette), and local optima—each piece assumes unlabeled data and asks what geometry and the inertia objective imply.

DISTANCE AND SCALING — Every clustering rule encodes a notion of similarity. Standard k-means uses squared Euclidean distance in the feature space you provide. If features are on wildly different scales, one dimension can dominate ||·||₂ and distort clusters—your norms-and-distance prerequisite matters here in practice.`,
        },
      },
      quiz: {
        question:
          'Which statement best matches unsupervised clustering (as in k-means) rather than supervised classification?',
        options: [
          'The training set includes a correct class label yᵢ for every input xᵢ.',
          'The algorithm only receives inputs xᵢ and must discover groups without target labels.',
          'The model is trained to minimize prediction error against a supplied continuous target yᵢ.',
          'The loss function always compares model output to a human-annotated “gold” answer.',
        ],
        correctIndex: 1,
        explanation:
          'Unsupervised clustering works from {xᵢ} alone; k-means partitions using geometry and inertia, not supervised targets. Labels would make the problem supervised (e.g. train a classifier) or semi-supervised—not vanilla k-means on unlabeled data.',
      },
      interactionHint: 'Use the video controls to pause or replay the opening scatter segment.',
    },
    {
      id: 'initializing-centroids',
      title: 'Step 1: Initialize Centroids',
      visualizationProps: {},
      content: {
        text:
          'Pick K, then choose K starting centroids μ₁,…,μ_K in the same space as your data. The rest of the algorithm only moves them toward a good configuration.',
        goDeeper: {
          explanation: `WHAT “INITIALIZE” REALLY MEANS

You are choosing K seeds that define tentative groups before any refinement. Lloyd’s algorithm alternates: assign points to nearest centroids, then move each centroid to the mean of its points.

WHY RANDOM STARTS CAN HURT

If two seeds land inside the same true cluster while another region stays empty, the partition can collapse into a poor local minimum. The objective (inertia) still decreases each iteration, so the run “looks successful” even when the grouping is wrong.

$$
J = \\sum_{i=1}^{n} \\min_{k \\in \\{1,\\ldots,K\\}} \\| x_i - \\mu_k \\|_2^2
$$

K-MEANS++ IN ONE SENTENCE

Spread seeds: pick one centroid uniformly at random, then sample the next proportional to squared distance to the nearest existing centroid. The video revisits this idea in the advanced segment.

INTERACTIVE NOTE

Drag-based exploration lives in the playground and challenges; the guided walkthrough uses the Manim scene so the layout stays readable with no overlapping text.`,
        },
      },
      interactionHint: 'Replay the “initialization” beat in the video; drag centroids in Playground or Challenges.',
    },
    {
      id: 'assignment-step',
      title: 'Step 2: The Assignment Step',
      visualizationProps: {
        manimSrc: '/k-means-manim/KMeansAssignmentLesson.mp4',
        manimFallback: 'assignment',
      },
      content: {
        text:
          'This step is only about geometry: with centroids frozen, every data point picks its closest center. The dedicated video uses the same nine points and three centroids as the interactive lesson, then shows how Voronoi walls come from distance ties.',
        goDeeper: {
          explanation: `WHAT THE ASSIGNMENT STEP OPTIMIZES (LOCALLY)

Hold $\\{\\mu_k\\}_{k=1}^K$ fixed. For each point $x_i$ we choose a cluster index $c(i)$ that minimizes squared Euclidean distance. This is a discrete choice—there is no gradient through $c(i)$—but it is the piece that explains “hard” cluster membership in k-means.

$$
c(i) = \\arg\\min_{k \\in \\{1,\\ldots,K\\}} \\| x_i - \\mu_k \\|_2^2
$$

WHY THE SQUARE IS STANDARD HERE

For nonnegative distances, $t \\mapsto t^2$ is strictly increasing on $[0,\\infty)$, so the argmin is unchanged if you drop the square. We still write $\\|\\cdot\\|_2^2$ because the very next step (moving $\\mu_k$) is the closed-form minimizer of the **sum of squared** distances inside each cluster. The algebra lines up.

VORONOI CELLS = DECISION REGIONS

Define the region “owned” by centroid $\\mu_k$ as

$$
\\mathcal{V}_k = \\Big\\{ x \\in \\mathbb{R}^d : \\|x-\\mu_k\\|_2 \\le \\|x-\\mu_j\\|_2 \\ \\forall j \\Big\\}.
$$

In 2-D with Euclidean distance, boundaries between two centers are **perpendicular bisectors** of the segment joining them. Each nonempty $\\mathcal{V}_k$ is a convex polygon (possibly unbounded off-screen). The Step 2 video draws those bisectors through the $[0,10]^2$ plot so you can see the partition, not just the colored dots.

TIES AND NUMERICAL CORNERS

If a point is exactly equidistant to two centroids, implementations break ties with an arbitrary rule (often “smallest index $k$”). That rarely matters with real floats, but it explains why tiny jitter can slightly change assignments near walls.

COMPLEXITY AND SCALING HABITS

Naively, each of $n$ points compares $K$ distances in $d$ dimensions: **$O(nKd)$** work per assignment pass. In high $d$, **feature scaling** matters: one large-variance coordinate can dominate $\\|\\cdot\\|_2$ and warp Voronoi walls even when other features carry the semantics you care about.

RELATION TO $k$-NN CLASSIFICATION (INTUITION ONLY)

Assignment is the same “nearest prototype” idea as 1-NN if you treat centroids as prototypes—but k-means **learns** those prototypes, while supervised k-NN stores training points. The geometry (Voronoi-like partitions) rhymes; the learning setup does not.

TRY IT LIVE

Use **Playground** (Voronoi shading on) or the **challenge** canvas: dragging a centroid moves the bisectors in real time, which is the same map $x \\mapsto c(i)$ changing under your fingers.`,
        },
      },
      interactionHint: 'This step’s video is unique to assignment & Voronoi; use Playground for live boundaries.',
    },
    {
      id: 'update-step',
      title: 'Step 3: The Update Step',
      visualizationProps: {
        manimSrc: '/k-means-manim/KMeansUpdateLesson.mp4',
        manimFallback: 'update',
      },
      content: {
        text:
          'The update is the second half of Lloyd’s loop: freeze labels, then replace each centroid with the ordinary average of every point currently assigned to it. The Step 3 video uses K = 2 with the same six points and starting centers (2, 5) and (8, 5) as in the original interactive spec—watch the stars slide onto the true cluster means.',
        goDeeper: {
          explanation: `THE UPDATE AS A CONSTRAINED MINIMIZATION

Suppose assignments $c(i)$ are fixed. For each cluster $k$, define the active set

$$
C_k = \\{ i \\in \\{1,\\ldots,n\\} : c(i) = k \\}.
$$

The centroid update is

$$
\\mu_k \\leftarrow \\frac{1}{|C_k|} \\sum_{i \\in C_k} x_i \\quad \\text{(skip or reseed if } |C_k| = 0\\text{)}.
$$

This vector is the **unique minimizer** of $\\sum_{i \\in C_k} \\|x_i - \\mu\\|_2^2$ over $\\mu \\in \\mathbb{R}^d$. That is calculus on a convex quadratic: set the gradient to zero and you get the arithmetic mean.

WHY SQUARED L₂ AND THE MEAN ARE A PACKAGE DEAL

The Fréchet mean under squared Euclidean loss is the component-wise average. If you swap the loss (e.g. Manhattan / L₁), the minimizing “center” is no longer the mean—it is closer in spirit to a **medoid** (an actual data point). That is the conceptual line between k-means and k-medoids.

LLOYD’S ALTERNATING SCHEME

One **assignment** pass minimizes the inertia over $c(\\cdot)$ with $\\mu$ fixed. One **update** pass minimizes the same objective over $\\{\\mu_k\\}$ with $c$ fixed. Neither step can increase

$$
J = \\sum_{i=1}^{n} \\| x_i - \\mu_{c(i)} \\|_2^2 .
$$

So the iterate $(c, \\mu)$ lives on a finite set of partitions and $J$ is monotone non-increasing—classic global convergence of the sequence to a **stationary** point, not necessarily the global minimum of $J$ over all partitions.

EMPTY CLUSTERS IN PRACTICE

If $C_k$ becomes empty, gradients are undefined for that $\\mu_k$. Libraries typically reinitialize that centroid, merge clusters, or reduce $K$. The toy six-point, $K=2$ configuration in the video keeps both groups nonempty after the illustrated assignment.

NUMERICAL STABILITY

Centroid coordinates are averages; extreme outliers pull the mean strongly under L₂ (another reason robust variants exist). Centering and scaling features often stabilizes both assignment and updates in real pipelines.

CONNECT TO THE INTERACTIVE SANDBOX

After watching the clip, open **Playground** and press **“Run one Lloyd step”**: you will see the same pattern—assign (implicit in the coloring), then snap centroids to means—on your own geometry.`,
        },
      },
      interactionHint: 'Dedicated Step 3 video (K=2 demo); Playground “Run one Lloyd step” repeats the same move.',
    },
    {
      id: 'distance-metrics-depth',
      title: 'Measuring "Closeness"',
      visualizationProps: {
        manimSrc: '/k-means-manim/KMeansDistanceMetricsLesson.mp4',
        manimFallback: 'distance',
      },
      content: {
        text:
          '“Closeness” is not unique: Euclidean distance measures straight-line length in feature space, while Manhattan sums axis-aligned steps. The dedicated animation shows the same two points under L₂ vs L₁ paths, then the L₂ unit circle beside the L₁ diamond—different unit balls mean different notions of neighborhood. Standard k-means commits to squared L₂ because that pairs with the mean update.',
        goDeeper: {
          explanation: `THE TWO MOST COMMON CHOICES IN INTRODUCTORY CLUSTERING

$$
\\|x - \\mu\\|_2 = \\sqrt{\\sum_{j=1}^{d} (x_j - \\mu_j)^2}, \\qquad
\\|x - \\mu\\|_1 = \\sum_{j=1}^{d} |x_j - \\mu_j|.
$$

L₂ rewards moving a little in **many** directions smoothly. L₁ charges **independently per coordinate**, which encourages sparse, axis-aligned corrections and behaves more gently when a single coordinate is an outlier.

GEOMETRY: UNIT BALLS

The set $\\{ x : \\|x\\|_2 \\le 1 \\}$ is a **sphere** (a disk in 2-D). The set $\\{ x : \\|x\\|_1 \\le 1 \\}$ is a **cross-polytope** (a rotated square / “diamond” in 2-D). Assignment rules partition space into Voronoi regions; changing the norm changes the **shape** of ties and bisectors, not just numeric scores.

WHY K-MEANS DEFAULTS TO SQUARED L₂

With assignments fixed, the centroid that minimizes $\\sum_{i \\in C_k} \\|x_i - \\mu\\|_2^2$ is the **mean**. That closed form is the computational heart of Lloyd updates. If you truly want L₁ geometry, algorithms such as **k-medoids** (representatives must be data points, often with medoid swaps) align the optimization story with the metric.

COSINE AND HIGH-DIMENSIONAL TEXT

For sparse counts or embeddings, practitioners sometimes cluster on **cosine similarity** (direction, not magnitude). Geometrically that is related to normalizing vectors then using Euclidean distance on the sphere. It is a different modeling choice: you are declaring that scale is uninformative and angle matters.

FEATURE SCALING IS PART OF THE METRIC

If one feature is measured in kilometers and another in millimeters, L₂ distance is dominated by the large-scale coordinate unless you **standardize** or otherwise weight dimensions. Treat scaling as part of the distance definition—otherwise “closeness” mostly measures units.

EMBEDDINGS, KERNELS, AND LEARNED REPRESENTATIONS

Modern pipelines cluster in spaces produced by neural nets or kernel maps. You are still doing k-means **in that inner-product space**; the metric inherited from the embedding can be highly nonlinear in the original inputs. The algorithm is the same template; the geometry is whatever the representation enforces.

PRACTICAL RULE OF THUMB

Start from **scaled L₂ k-means** when blobs are roughly round in the space you care about. Reach for **L₁ / medoids** when coordinates are interpretable counts or robustness to spikes matters. Document the norm and preprocessing so results stay reproducible.`,
        },
      },
      interactionHint: 'Watch the L₂ straight path vs the L₁ taxicab path, then the circle vs diamond unit balls.',
    },
    {
      id: 'elbow-method',
      title: 'The Elbow Method',
      visualizationProps: {
        manimSrc: '/k-means-manim/KMeansElbowLesson.mp4',
        manimFallback: 'elbow',
      },
      content: {
        text:
          'Choosing K is underspecified from raw geometry alone. A common exploratory trick is to run k-means for several K, record the inertia J(K), and plot it. The curve always bends downward; the “elbow” is the region where each extra cluster stops buying a large drop in J. The dedicated clip plots a clear toy curve and marks a stylized knee near K = 3—real data rarely looks this clean.',
        goDeeper: {
          explanation: `WHAT YOU ARE ACTUALLY PLOTTING

For each candidate $K$, run k-means (ideally with multiple random seeds and keep the best inertia). Record

$$
J(K) = \\sum_{i=1}^{n} \\big\\| x_i - \\mu_{c(i)}^{(K)} \\big\\|_2^2 ,
$$

where centroids and assignments depend on $K$. This is **within-cluster sum of squares** (WCSS) for that fit.

WHY $J(K)$ MUST DECREASE WITH $K$

With more centers, each point can be assigned to a centroid at least as close as before (you could always leave old centroids in place). In practice optimizers find **strict** improvements until you saturate the data, so the curve slopes down. The question is **how fast** it falls.

THE ELBOW HEURISTIC IN WORDS

Look for $K$ where the **marginal gain**

$$
\\Delta J_K = J(K) - J(K+1)
$$

shrinks: big drops mean new clusters explain structure; tiny drops mean you are splitting noise or overfitting the fit metric. The video draws a dashed guide at a stylized knee to make that “bend” visible.

AUTOMATION IS MESSY

Real curves can be smooth with **no obvious corner**. Kneedle, second-derivative maxima, and grid-search scores are used in tools, but they are sensitive to scaling, seeds, and preprocessing. Treat any auto-$K$ as a **proposal**, not ground truth.

EXTREME CASES

At $K = n$, you can put one centroid on every point and get $J = 0$, which is useless summarization. At $K = 1$, you get the global mean and a large $J$. The elbow story lives **between** those trivial extremes.

WHAT TO COMBINE WITH THE ELBOW

Use **silhouette**, **domain constraints** (“we can operate three service tiers, not twelve”), **stability** (do clusters persist under bootstrap or feature noise?), and **downstream metrics** (does a downstream model improve?). The elbow is a **cheap first pass**, not a theorem.

REPRODUCIBILITY

Fix seeds, standardize features if needed, and record which run’s $J$ you plot. Otherwise two elbow charts on the “same” data can disagree.`,
        },
      },
      interactionHint: 'Watch the J(K) curve build, then the dashed drop and “elbow” label at K ≈ 3.',
    },
    {
      id: 'silhouette-score',
      title: 'Silhouette: Are we well separated?',
      visualizationProps: {
        manimSrc: '/k-means-manim/KMeansSilhouetteLesson.mp4',
        manimFallback: 'silhouette',
      },
      content: {
        text:
          'Silhouette is a per-point sanity check: how tight is point i to its own cluster (small average within-cluster distance) compared to how close it sits to the nearest competing cluster? The animation highlights one yellow point in a three-cluster toy layout, draws the red dashed “a(i)” ties to siblings and the blue dashed “b(i)” ties to the closest foreign group, then plugs into the formula. Values near +1 mean strong separation; near 0 you are on a fuzzy boundary; negative means the assignment looks wrong in the metric you used.',
        goDeeper: {
          explanation: `DEFINITION (EUCLIDEAN DISTANCE VERSION)

Assume each point $x_i$ has a cluster label $c(i)$ and use ordinary Euclidean distance $d(\\cdot,\\cdot)$. Define

$$
a(i) = \\frac{1}{|C_{c(i)}| - 1} \\sum_{j \\in C_{c(i)},\\, j \\neq i} d(x_i, x_j),
$$

the mean distance from $i$ to **other** points in its own cluster (if the cluster has only one point, $a(i)$ is set to 0 by convention).

For every cluster $k \\neq c(i)$, let

$$
d_{ik} = \\frac{1}{|C_k|} \\sum_{j \\in C_k} d(x_i, x_j)
$$

be the mean distance from $i$ to cluster $k$. Then

$$
b(i) = \\min_{k \\neq c(i)} d_{ik},
$$

the distance to the **nearest foreign** cluster in this average sense.

THE SILHOUETTE COEFFICIENT

$$
s(i) = \\frac{b(i) - a(i)}{\\max\\{a(i),\\, b(i)\\}} \\in [-1,\\,1].
$$

The denominator normalizes so $s(i)$ is bounded. If $a(i) \\ll b(i)$, then $s(i) \\approx +1$: $i$ is deep inside a cohesive group and far from outsiders. If $a(i) \\approx b(i)$, then $s(i) \\approx 0$: $i$ lies near a decision boundary. If $a(i) > b(i)$, then $s(i) < 0$: $i$ is **closer on average** to some other cluster than to its own—a red flag for wrong $K$, bad scaling, or non-spherical geometry.

AGGREGATES AND HONEST LIMITATIONS

The **mean silhouette** $\\frac{1}{n}\\sum_i s(i)$ is a common headline number, but it can hide bimodal behavior (many great points, a few disasters). Plot a **histogram** of $s(i)$ or average within each cluster to find weak pockets.

Silhouette assumes distances are meaningful (feature scaling!). It also favors **convex, ball-shaped** clusters in Euclidean space—elongated or intertwined manifolds can score poorly even when a human would accept the partition.

RELATION TO INERTIA AND THE ELBOW

Inertia $J$ always rewards more clusters. Silhouette can **peak** at a moderate $K$ and then fall when you over-split. It is normal for elbow and silhouette to suggest slightly different $K$; treat them as **orthogonal diagnostics**.

OTHER METRICS YOU MAY SEE

**Calinski–Harabasz** (variance ratio), **Davies–Bouldin**, and model-based scores (AIC/BIC for mixtures) answer related but not identical questions. No single score replaces domain checks.

REPRODUCIBILITY

Silhouette depends on the **final** partition from k-means, which depends on seeds and $K$. Report preprocessing, $K$, and whether you averaged over restarts when you cite a silhouette number.`,
        },
      },
      interactionHint: 'Follow yellow point i: red dashes → a(i), blue dashes → nearest other cluster for b(i), then s(i) on screen.',
    },
    {
      id: 'initialization-sensitivity',
      title: 'Local Optima & K-Means++',
      visualizationProps: {
        manimSrc: '/k-means-manim/KMeansLocalOptimaLesson.mp4',
        manimFallback: 'localoptima',
      },
      content: {
        text:
          'The assignment–update loop always lowers inertia for that run, but the objective over all possible partitions is non-convex: the same data admit many stationary points. The video contrasts crowded random seeds (three yellow centers trapped in one blob, higher J) with spread seeds (one near each natural group, lower J) on identical nine-point geometry, then sketches k-means++: pick the first center at random, then sample the next proportional to squared distance to the nearest center already chosen so new seeds land far from existing ones.',
        goDeeper: {
          explanation: `LOCAL (STATIONARY) VS GLOBAL

Lloyd’s k-means is a **descent method** on the inertia

$$
J = \\sum_{i=1}^{n} \\big\\| x_i - \\mu_{c(i)} \\big\\|_2^2
$$

for the current discrete assignment and continuous centroids. Each exact step **never increases** $J$, so the iterate converges to a **local** minimum of this alternating procedure. There is **no** cheap certificate that you found the **global** minimum over the exponentially many partitions of $n$ points into $K$ nonempty groups.

WHY SEEDS MATTER

Initialization picks a **basin of attraction**. Two seeds can both converge, yet yield **different** $(c,\\mu)$ with **different** $J$. The animation uses the **same** nine points twice: packed seeds distort Voronoi ownership; well-spread seeds recover the three intuitive blobs and a **smaller** $J$.

K-MEANS++ (ARTHUR & VASSILVITSKII, 2007)

1. Choose the first center $\\mu_1$ uniformly at random from the data (common variant).  
2. For each point $x$, let $D(x)$ be its distance to the **nearest** center already chosen.  
3. Choose the next center with probability **proportional to** $D(x)^2$ (not uniform over remaining points).  
4. Repeat until $K$ centers, then run ordinary Lloyd iterations.

Squaring $D$ heavily favors points that are **far** from existing seeds, which reduces the chance that all seeds start in one dense region. Implementations such as **scikit-learn** default to this initializer for good reason.

THEORETICAL TASTE (NO PROOFS HERE)

k-means++ gives an **expected** $O(\\log K)$-factor approximation guarantee for the **optimal** $K$-means objective in the **first** center set; Lloyd steps only improve $J$ further. That is not the same as “always global optimum,” but it sharply reduces pathological uniform-random starts.

PRACTICAL WORKFLOW

- Run **$R$ restarts** with different seeds (or different k-means++ draws).  
- Keep the run with **lowest** $J$ (and check **silhouette** or stability if decisions matter).  
- For huge $n$, **mini-batch** or approximate variants trade accuracy for time; initialization heuristics still matter.

WHEN INITIALIZATION CANNOT SAVE YOU

If clusters are **non-convex**, heavily **overlapping**, or live on a **curved manifold**, no seeding trick turns plain k-means into the right model—switch representation (embeddings), kernelized variants, mixture models, or density-based methods.

REPRODUCIBILITY

Log the random seed, library version, and whether you used k-means++ or random init so experiments can be replayed.`,
        },
      },
      interactionHint: 'Watch J drop from spread seeds vs packed seeds; then the k-means++ D² sampling idea.',
    },
    {
      id: 'convergence-math',
      title: 'Does it always stop?',
      visualizationProps: { mode: 'none' },
      content: {
        text:
          'In the usual Lloyd loop, yes: the objective (inertia J) never increases, and there are only finitely many ways to assign n points to K clusters. So the algorithm cannot wander forever—it must reach a fixed point (same assignments repeating) or, in exact arithmetic, a state where one more full assign-then-update pass changes nothing. That is different from “found the best possible clustering”: you can stop at a local minimum of J. Implementations also cap iterations and use tolerances because floating-point math and ties can make tiny changes bounce.',
        goDeeper: {
          explanation: `FINITE ASSIGNMENTS

Each point carries a label in {1,…,K}. There are at most K^n assignments (fewer if you forbid empty clusters in your convention). For a fixed assignment, the optimal centroids are the per-cluster means—unique whenever the cluster is nonempty. So the pair (assignment vector, centroid tuple) that Lloyd visits lives in a finite configuration space.

MONOTONE INERTIA

Let J be within-cluster sum of squared distances. Assignment step (centroids fixed): each point is reassigned to its nearest center, so its contribution to J cannot go up. Update step (labels fixed): each new centroid is the mean of its points, which minimizes the sum of squared distances to that centroid, so again J cannot go up.

$$
J^{(t+1)} \\le J^{(t)}
$$

after each full assign-then-update iteration.

WHY THIS FORCES TERMINATION (EXACT ARITHMETIC)

J is bounded below by 0 and never increases after a full Lloyd iteration. Only finitely many assignments exist, so the process cannot produce an infinite sequence of distinct labelings. In exact arithmetic you therefore reach an iteration where the assignment stops changing; the mean step then returns the same centroids—a fixed point of Lloyd’s map. (Rare tie-heavy cases can admit short cycles in principle; implementations add tolerances.)

CYCLING OF LENGTH > 1?

With exact arithmetic and a deterministic tie-break, the iterate is usually observed to enter a period-1 cycle (fixed point). Pathological tie structures can admit period-2 or longer behavior in principle; in practice, libraries break ties and add ε-thresholds so runs settle.

NOT GLOBAL OPTIMALITY

Stopping guarantees stationarity under Lloyd updates, not the global minimizer of J over all partitions. Poor initialization or wrong K can still yield a “converged” but useless partition.

EMPTY CLUSTERS AND TIES

If a cluster loses all points, some implementations leave the old centroid, re-seed it, or drop the cluster—behavior is library-specific. Distance ties can shuffle border points unless the implementation fixes a rule.

WHAT REAL CODE DOES

Typical stopping: max iterations, centroid movement smaller than a tolerance ε, or change in J smaller than ε. That is a practical “good enough,” not the abstract finite argument—needed because floats and noise prevent perfect equality.`,
        },
      },
      quiz: {
        question:
          'Lloyd’s k-means has converged (assignments no longer change). Which statement is correct?',
        options: [
          'J is guaranteed to be the smallest possible among all K-way partitions of the data.',
          'J cannot be improved by another single assignment step or centroid update at that clustering.',
          'The algorithm might still be improving J if we run more iterations.',
          'Convergence implies the clusters match any human-labeled “true” groups.',
        ],
        correctIndex: 1,
        explanation:
          'At a fixed point, each point is already assigned to a nearest centroid and each centroid is the mean of its cluster—so a standard Lloyd step does not lower J. That does not mean the global minimum of J or semantic “truth” was found.',
      },
    },
  ],
  playground: {
    description:
      'Experiment with K-means: drag centroid stars, change K, watch Voronoi regions, and run Lloyd steps.',
    parameters: [
      { id: 'k', label: 'Number of Clusters (K)', type: 'slider', min: 2, max: 5, step: 1, default: 3 },
    ],
    tryThis: [
      'Set K to 2 when there are clearly 3 groups. Watch how the algorithm is forced to merge two groups.',
      'Place centroids very poorly and see if it gets stuck in a local minimum.',
    ],
  },
  challenges: [
    {
      id: 'cluster-bullseye',
      title: 'Minimize the Variance',
      description: 'Drag the 3 centroids to optimal positions so the total distance from points to their centroids is below 15.0.',
      props: {
        mode: 'challenge',
        points: [
          { x: 2, y: 2 },
          { x: 2.5, y: 2.5 },
          { x: 1.5, y: 1.5 },
          { x: 8, y: 8 },
          { x: 8.5, y: 8.5 },
          { x: 7.5, y: 7.5 },
          { x: 2, y: 8 },
          { x: 2.5, y: 8.5 },
          { x: 1.5, y: 7.5 },
        ],
        centroids: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 6, y: 5 }],
        k: 3,
        draggableCentroids: true,
        showAssignments: true,
        showVoronoi: true,
      },
      completionCriteria: { type: 'threshold', target: 15, metric: 'inertia' },
      hints: [
        'Place one centroid right in the middle of each of the 3 dense groups of points.',
        'The total distance (inertia) drops drastically when a centroid snaps into the center of a dense cluster.',
      ],
    },
  ],
};

export default kMeansModule;
