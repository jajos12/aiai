# Content Specification — Tier 0 Reference Modules

> Gold standard for all future content. Every module must follow this structure.
> These replace the shallow 4-step reference module in the implementation plan.
> See `docs/content_template.md` for the standardized design process.
>
> **Module order**: Vectors → Vector Spaces & Independence → Matrix Operations → ...

---

## Module 1: Vectors (`content/tier0/vectors/`)

**Config**: `id: "vectors"` · Tier 0 · Cluster: `linear-algebra` · Prereqs: none · ~30 min · Viz: `VectorTransform`

### Phase 1: Guided Steps (15 steps)

#### Step 1 — What is a Vector?

- **Viz**: Static arrow from origin to (3, 2) on a grid
- **Content**: "A vector is just an arrow. It has a direction and a length. This one says 'go 3 right, 2 up.' That's it."
- **Go Deeper**: `\vec{v} = \begin{bmatrix} x \\ y \end{bmatrix} \in \mathbb{R}^2` — An ordered pair of real numbers. Represents both a point in space and a displacement from the origin. Vectors are the fundamental objects of linear algebra.
- **Ref**: 3Blue1Brown — "Essence of Linear Algebra" Ch.1

#### Step 2 — Components & Coordinates

- **Viz**: Same arrow with dashed lines dropped from tip to x-axis and y-axis (component breakdown)
- **Content**: "The horizontal part (3) is the **x-component**, vertical part (2) is the **y-component**. Together, they fully describe the vector."
- **Go Deeper**: Component notation: `v_x = 3, v_y = 2`. In physics these are projections onto coordinate axes. Generalizes to ℝⁿ — a vector in ℝ¹⁰ has 10 components.
- **Quiz**: "The vector (5, 0) points in which direction?" → **Straight right** / Straight up / Diagonally / Straight down

#### Step 3 — Drag to Explore

- **Viz**: Draggable vector with live coordinate readout updating as you drag
- **Content**: "Drag the tip. Watch the coordinates change in real time. The arrow IS the coordinates — there's no hidden information."
- **Go Deeper**: Magnitude formula: `\|\vec{v}\| = \sqrt{v_x^2 + v_y^2}`. Extends to n dimensions: `\|\vec{v}\| = \sqrt{\sum v_i^2}`.
- **Author's Note**: "This is the moment it clicks — vectors aren't abstract math, they're just arrows you can grab and move."

#### Step 4 — Magnitude (Length)

- **Viz**: Draggable vector showing live magnitude calculation. Pythagorean right triangle overlay drawn from tip to axes.
- **Content**: "How long is this arrow? Draw a right triangle underneath it. Pythagoras gives us: length = √(x² + y²). Drag and watch it update."
- **Go Deeper**: L2 norm: `\|\vec{v}\|_2 = \sqrt{\sum_{i=1}^{n} v_i^2}`. Distinguished from L1 norm (Manhattan distance) and L∞ norm which appear in later modules.
- **Quiz**: "What's the magnitude of (3, 4)?" → **5** / 7 / √7 / 12

#### Step 5 — Direction & Angle

- **Viz**: Vector with animated angle arc from positive x-axis, readout in degrees + radians
- **Content**: "Direction = the angle the arrow makes with the horizontal. Every vector has both a magnitude AND a direction."
- **Go Deeper**: `\theta = \text{atan2}(v_y, v_x)`. Why atan2 not atan: handles all four quadrants correctly. Relationship to unit circle. Radians vs. degrees.

#### Step 6 — Unit Vectors

- **Viz**: Show original vector alongside its unit vector (same direction, length = 1). Toggle between them.
- **Content**: "A **unit vector** keeps the direction but scales to length 1. It answers 'which way?' without 'how far?' Think of it as the 'pure direction.'"
- **Go Deeper**: `\hat{v} = \frac{\vec{v}}{\|\vec{v}\|}`. Standard basis: `\hat{i} = (1,0), \hat{j} = (0,1)`. Every vector = `v_x \hat{i} + v_y \hat{j}`. Unit vectors are critical for normalization in ML.
- **Quiz**: "What's the magnitude of ANY unit vector?" → **1** / 0 / Depends on direction / √2

#### Step 7 — Adding Vectors

- **Viz**: Two draggable vectors (a=blue, b=green) with animated tip-to-tail placement showing sum (purple)
- **Content**: "Place the tail of **b** at the tip of **a**. The sum goes from the start of **a** to the end of **b**. Drag either and watch the sum move."
- **Go Deeper**: `\vec{a} + \vec{b} = \begin{bmatrix} a_x + b_x \\ a_y + b_y \end{bmatrix}`. Commutative: `a+b = b+a`. Parallelogram law: sum is the diagonal.
- **Quiz**: "If a = (2, 1) and b = (1, 3), what is a + b?" → **(3, 4)** / (2, 3) / (1, 2) / (3, 3)

#### Step 8 — Subtracting Vectors

- **Viz**: Show a, b, and a−b as the vector from tip of b to tip of a, with dashed construction lines
- **Content**: "Subtraction = 'how do I get from **b** to **a**?' The result points from the tip of **b** to the tip of **a**."
- **Go Deeper**: `\vec{a} - \vec{b} = \vec{a} + (-\vec{b})`. Geometrically: the other diagonal of the parallelogram. Distance between two points: `\|\vec{a} - \vec{b}\|`.

#### Step 9 — Scalar Multiplication

- **Viz**: Vector with scalar slider (−3 to 3), showing stretching/shrinking/flipping in real time
- **Content**: "Multiply by 2 → twice as long. By 0.5 → half. By −1 → flips direction. Drag the slider and experiment."
- **Go Deeper**: `c\vec{v} = \begin{bmatrix} cv_x \\ cv_y \end{bmatrix}`. c > 1 stretches, 0 < c < 1 shrinks, c < 0 reverses direction, c = 0 gives zero vector. Preserves direction (or reverses it).
- **Quiz**: "What happens when you multiply a vector by −1?" → It doubles in length / **It flips direction** / It becomes zero / Nothing changes

#### Step 10 — Linear Combinations (Preview)

- **Viz**: Two basis-like vectors (v₁, v₂) with two scalar sliders (c₁, c₂). Result = c₁v₁ + c₂v₂ shown with parallelogram construction. Color-coded contributions.
- **Content**: "Any point in 2D can be reached by combining two non-parallel vectors with the right scalars. These scalars are the 'recipe.' We'll explore this much deeper in the next module."
- **Go Deeper**: `c_1 \vec{v}_1 + c_2 \vec{v}_2` — a **linear combination**. The set of all reachable points is the **span**. This concept is so important it gets its own module next.
- **Quiz**: "Can you reach every point in 2D with just one vector?" → Yes, with the right scalar / **No, only points on its line** / Only if it's a unit vector

#### Step 11 — The Dot Product

- **Viz**: Two draggable vectors showing live dot product value, angle between them, and projection ghost line
- **Content**: "The dot product measures how much two vectors 'agree' in direction. Same direction = large positive. Perpendicular = zero. Opposite = negative."
- **Go Deeper**: Algebraic: `\vec{a} \cdot \vec{b} = a_x b_x + a_y b_y`. Geometric: `\vec{a} \cdot \vec{b} = \|\vec{a}\| \|\vec{b}\| \cos\theta`. These two forms being equal is a powerful theorem.
- **Quiz**: "(1, 0) · (0, 1) = ?" → 1 / **0** / −1 / undefined

#### Step 12 — Perpendicularity

- **Viz**: Two vectors with live dot product readout, highlight glow + right-angle square shown when dot product ≈ 0
- **Content**: "When the dot product equals zero, the vectors are **perpendicular** (at 90°). Drag **b** until you see the square appear."
- **Go Deeper**: `\vec{a} \perp \vec{b} \iff \vec{a} \cdot \vec{b} = 0`. Extends to orthogonality in higher dimensions. Orthogonal bases are extremely useful — they make computations clean.

#### Step 13 — Projection

- **Viz**: Show projection of a onto b as a colored shadow with dashed construction lines. Scalar projection readout.
- **Content**: "How much of **a** goes in the direction of **b**? That's the projection — the shadow one vector casts onto another."
- **Go Deeper**: Scalar projection: `\text{comp}_{\vec{b}} \vec{a} = \frac{\vec{a} \cdot \vec{b}}{\|\vec{b}\|}`. Vector projection: `\text{proj}_{\vec{b}} \vec{a} = \frac{\vec{a} \cdot \vec{b}}{\vec{b} \cdot \vec{b}} \vec{b}`. Used everywhere: least squares, Gram-Schmidt, PCA.

#### Step 14 — The Standard Basis

- **Viz**: Show î = (1,0) and ĵ = (0,1) as distinguished vectors. Any vector expressed as `v_x î + v_y ĵ` with animated decomposition.
- **Content**: "î and ĵ are the standard basis vectors — every 2D vector is just a combination of these two. They're why we can use coordinates at all."
- **Go Deeper**: `\vec{v} = v_x \hat{i} + v_y \hat{j}`. The next module ('Vector Spaces') formalizes what a basis is, why you need exactly 2 for 2D, and what happens when you change basis.
- **Quiz**: "Every 2D vector can be written as c₁î + c₂ĵ. True or false?" → **True** / False

#### Step 15 — Why Vectors Matter for AI

- **Viz**: Three side-by-side mini-visualizations: (1) word embeddings as 2D points (king, queen, man, woman), (2) an image as a pixel vector, (3) RGB color as a 3D vector
- **Content**: "In AI, everything becomes vectors. Words, images, sounds — all represented as lists of numbers in high-dimensional space. The operations you just learned? They're the language of machine learning."
- **Go Deeper**: Word2Vec: `king - man + woman ≈ queen`. Image = vector in ℝ^(width×height×3). Feature vectors in ML. Embeddings map real-world objects to vectors where distance = similarity.
- **Author's Note**: "This is the bridge. Everything from here on is about doing clever things with vectors and matrices."

### Phase 2: Playground

Full `VectorTransform` visualization with all parameters:

| Parameter         | Control | Range   | Default |
| ----------------- | ------- | ------- | ------- |
| Vector count      | Stepper | 1–4     | 2       |
| Show grid         | Toggle  | —       | on      |
| Show coordinates  | Toggle  | —       | on      |
| Show magnitude    | Toggle  | —       | off     |
| Show angle        | Toggle  | —       | off     |
| Show dot product  | Toggle  | —       | off     |
| Show projection   | Toggle  | —       | off     |
| Show unit vectors | Toggle  | —       | off     |
| Scalar multiplier | Slider  | −3 to 3 | 1       |

**Try This:**

1. "Make two perpendicular vectors. What's their dot product?"
2. "Can you find two vectors whose sum is the zero vector?"
3. "Set the scalar to −0.5. What happens to the vector?"
4. "Try to make vector a's projection onto b equal zero. What angle is needed?"

### Phase 3: Challenges (4)

| #   | Title                | Goal                                                  | Completion                        |
| --- | -------------------- | ----------------------------------------------------- | --------------------------------- | ----- | ------- |
| 1   | **Reach the Target** | Drag a and b so their sum lands on red target         | `dist(sum, target) < 0.3`         |
| 2   | **Scalar Sniper**    | Find the scalar that maps blue vector to green target | `dist(scaled, target) < 0.1`      |
| 3   | **Right Angle**      | Drag b to be perpendicular to a                       | `                                 | a · b | < 0.05` |
| 4   | **Basis Builder**    | Express target as linear combination of custom basis  | `dist(c₁v₁ + c₂v₂, target) < 0.2` |

---

## Module 1.5: Vector Spaces & Independence (`content/tier0/vector-spaces/`)

**Config**: `id: "vector-spaces"` · Tier 0 · Cluster: `linear-algebra` · Prereqs: `["vectors"]` · ~30 min · Viz: `VectorSpaceExplorer`

> This module bridges the gap between "hands-on vector operations" and "abstract matrix thinking."
> Without it, learners have intuition but lack the vocabulary and concepts needed for eigenvectors, PCA, and neural net theory.

### Phase 1: Guided Steps (12 steps)

#### Step 1 — Combining Vectors

- **Viz**: Two vectors (a, b) with two scalar sliders. Show `c₁a + c₂b` as a colored result. Sweep sliders to paint all reachable points.
- **Content**: "Remember linear combinations from the Vectors module? c₁a + c₂b = a new vector. Let's explore what happens when you try ALL possible scalars."
- **Go Deeper**: A **linear combination** of vectors `{v₁, ..., vₖ}` with scalars `{c₁, ..., cₖ}` is `\sum c_i v_i`. This construct is the foundation of everything that follows.

#### Step 2 — The Span

- **Viz**: Same two vectors. As sliders sweep, a translucent region fills in showing all reachable points. For non-parallel vectors: fills entire plane. For parallel: fills only a line.
- **Content**: "The **span** of a set of vectors = all points you can reach using linear combinations. Two non-parallel vectors span the entire 2D plane. Parallel vectors? Only a line."
- **Go Deeper**: `\text{span}(\{v_1, v_2\}) = \{c_1 v_1 + c_2 v_2 \mid c_1, c_2 \in \mathbb{R}\}`. In ℝ²: 1 vector spans a line, 2 non-parallel vectors span the plane, 0 vectors span {0}.
- **Quiz**: "Two parallel vectors span…?" → The whole plane / **Just a line** / Just a point / Nothing

#### Step 3 — Linear Independence

- **Viz**: Three scenarios animated: (1) two non-parallel vectors — independent ✅, (2) two parallel vectors — dependent ❌, (3) three vectors in 2D — always dependent ❌. Each shows why visually.
- **Content**: "Vectors are **linearly independent** when none of them is 'redundant' — you can't build any one of them from the others. If you can, they're **dependent**."
- **Go Deeper**: Formal: `\{v_1, ..., v_k\}` are linearly independent iff `c_1 v_1 + ... + c_k v_k = 0` implies all `c_i = 0`. Intuition: each vector adds a genuinely new direction. In ℝⁿ, at most n vectors can be independent.
- **Quiz**: "Are (1, 0) and (2, 0) linearly independent?" → Yes / **No, one is a scalar multiple of the other**

#### Step 4 — Testing for Independence (Interactive)

- **Viz**: User drags vectors. Live indicator shows "Independent ✅" or "Dependent ❌" with the dependency equation shown when dependent (e.g., "v₃ = 2v₁ − v₂").
- **Content**: "Drag the vectors around. Can you make them dependent? Independent? Notice what happens geometrically — dependent vectors are always 'flat' (collinear or coplanar)."
- **Go Deeper**: Algebraic test: form a matrix with the vectors as columns, row-reduce. If every column has a pivot → independent. The rank of the matrix = number of independent vectors.

#### Step 5 — What is a Vector Space?

- **Viz**: Show ℝ² as the full plane. Highlight the rules: (1) add any two vectors → stays in the space, (2) scale any vector → stays in the space, (3) zero vector is always included. Show violations: the positive quadrant ISN'T a vector space (scaling by −1 leaves it).
- **Content**: "A **vector space** is a set of vectors where addition and scaling always keep you inside the set. The full 2D plane is one. The positive quadrant is NOT — try multiplying by −1."
- **Go Deeper**: Axioms: closure under addition and scalar multiplication, existence of zero vector, additive inverses, associativity, commutativity, distributivity. ℝⁿ is the prototypical vector space. But function spaces, polynomial spaces, etc. also qualify.
- **Quiz**: "Is the set of all 2D vectors with x ≥ 0 a vector space?" → Yes / **No, it's not closed under scalar multiplication**

#### Step 6 — Subspaces

- **Viz**: In ℝ², show three examples: (1) a line through the origin — YES subspace, (2) a line NOT through origin — NOT subspace, (3) the origin alone — YES subspace. Click each to test the rules.
- **Content**: "A **subspace** is a vector space that lives inside a bigger one. In 2D, the subspaces are: the origin (0D), any line through the origin (1D), and the whole plane itself (2D)."
- **Go Deeper**: Subspace test: S ⊆ V is a subspace iff (1) 0 ∈ S, (2) closed under addition, (3) closed under scalar multiplication. Equivalently: closed under linear combinations. The column space and null space of a matrix are subspaces.

#### Step 7 — Basis: The Minimal Spanning Set

- **Viz**: In ℝ², show: (1) {î, ĵ} spans everything ✅ and is independent ✅ = BASIS. (2) {î} spans only x-axis = not enough. (3) {î, ĵ, (1,1)} spans everything but is dependent = too many. Highlight the Goldilocks: exactly 2.
- **Content**: "A **basis** is the Goldilocks set: enough vectors to reach everything (spans), but no redundancy (independent). For 2D, you need exactly 2 basis vectors. Not 1. Not 3. Two."
- **Go Deeper**: Basis = linearly independent spanning set. Every basis for a given vector space has the same number of elements — this number is the **dimension**. `dim(\mathbb{R}^n) = n`.
- **Quiz**: "How many vectors are in a basis for ℝ³?" → 2 / **3** / 4 / Depends

#### Step 8 — Dimension

- **Viz**: Show examples: a point (0D), a line (1D), a plane (2D), a cube wireframe (3D). Each with its basis highlighted.
- **Content**: "**Dimension** = the number of vectors in any basis. A line is 1D (one basis vector), a plane is 2D (two), space is 3D (three). In ML, we routinely work in 768D or 1024D."
- **Go Deeper**: `dim(V)` = |any basis of V|. Well-defined because all bases have equal cardinality. The 768-dimensional space of BERT embeddings. Why high dimensions are counterintuitive (curse of dimensionality, next tier).

#### Step 9 — Change of Basis

- **Viz**: A vector expressed in standard basis vs. a rotated basis. Show the same arrow having different coordinates in each system. Animate the transition.
- **Content**: "The same vector can have different coordinates depending on which basis you use. The vector doesn't change — your description of it does."
- **Go Deeper**: If B = {b₁, b₂}, the coordinate vector `[v]_B` satisfies `v = [v]_{B,1} b_1 + [v]_{B,2} b_2`. Change of basis matrix: `P = [b_1 | b_2]`, then `[v]_B = P^{-1} v`. This concept is critical for understanding eigenvectors and PCA.

#### Step 10 — Null Space (Preview)

- **Viz**: A 2×2 matrix with det = 0. Show all vectors that get mapped to zero — they form a line. Color-code the null space.
- **Content**: "Some transformations crush certain vectors to zero. The set of all vectors that get mapped to the zero vector is the **null space**. It tells you what information the transformation destroys."
- **Go Deeper**: `\text{null}(A) = \{\vec{x} \mid A\vec{x} = \vec{0}\}`. Always a subspace. nullity = dim(null(A)). Rank-nullity theorem: rank + nullity = n. Connects to invertibility: null(A) = {0} iff A is invertible.

#### Step 11 — Rank

- **Viz**: Show three 2×2 matrices: rank 2 (grid stays 2D), rank 1 (grid collapses to a line), rank 0 (everything goes to origin). Animate the collapse.
- **Content**: "The **rank** of a matrix = the dimension of its column space = how many 'useful directions' the transformation preserves. Full rank means nothing is lost."
- **Go Deeper**: `\text{rank}(A) = dim(\text{col}(A))`. Full rank: rank = min(m, n). Rank-deficient: some dimensions are destroyed. Underdetermined systems (rank < m) have infinitely many solutions.
- **Quiz**: "A 3×3 matrix with rank 2 maps 3D space onto a…?" → Point / Line / **Plane** / Cube

#### Step 12 — Why This Matters for AI

- **Viz**: Three panels: (1) PCA = finding the best low-rank basis for data, (2) neural net hidden layer = mapping to a learned subspace, (3) embedding dimension = the "true" dimensionality of data.
- **Content**: "Every ML model makes decisions about vector spaces. PCA finds the best basis for your data. Neural nets learn subspaces. Understanding these concepts lets you see what models are really doing."
- **Go Deeper**: PCA = eigendecomposition of covariance matrix → basis of max variance. Autoencoders learn a subspace (bottleneck = dimension). Rank of weight matrix = model capacity. Low-rank approximation = compression.
- **Author's Note**: "This module is the 'unlock' for everything in ML theory. Without span, independence, and basis, eigenvectors and PCA are just formulas. With them, they're obvious."

### Phase 2: Playground

Full `VectorSpaceExplorer` visualization:

| Parameter                    | Control   | Range   | Default  |
| ---------------------------- | --------- | ------- | -------- |
| Vector count                 | Stepper   | 1–4     | 2        |
| Show span region             | Toggle    | —       | on       |
| Show independence status     | Toggle    | —       | on       |
| Show coordinates in basis B  | Toggle    | —       | off      |
| Custom basis B₁              | Draggable | —       | (1, 0)   |
| Custom basis B₂              | Draggable | —       | (0, 1)   |
| Test matrix (for null space) | 4 sliders | −3 to 3 | Identity |
| Show null space              | Toggle    | —       | off      |
| Show column space            | Toggle    | —       | off      |

**Try This:**

1. "Make 3 vectors in 2D. Can they ever be independent?"
2. "Drag both basis vectors onto the x-axis. What happens to the span?"
3. "Set the matrix to have det = 0. What's the null space?"
4. "Change the basis to (1,1) and (1,−1). What are the coordinates of (3, 1) in this basis?"

### Phase 3: Challenges (3)

| #   | Title                   | Goal                                                    | Completion    |
| --- | ----------------------- | ------------------------------------------------------- | ------------- |
| 1   | **Independence Check**  | Classify 5 sets of vectors as independent or dependent  | 5/5 correct   |
| 2   | **Basis Hunt**          | Find a basis for the column space of a given 3×3 matrix | Correct basis |
| 3   | **Dimension Detective** | Determine the rank and nullity of 3 different matrices  | 3/3 correct   |

---

## Module 2: Matrix Operations (`content/tier0/matrices/`)

**Config**: `id: "matrices"` · Tier 0 · Cluster: `linear-algebra` · Prereqs: `["vectors", "vector-spaces"]` · ~30 min · Viz: `MatrixTransform`

### Phase 1: Guided Steps (13 steps)

#### Step 1 — What is a Matrix?

- **Viz**: A 2×2 and a 3×3 grid of numbers, labeled rows & columns, color-coded elements
- **Content**: "A matrix is a grid of numbers organized in rows and columns. Think spreadsheet. The position of each number matters."
- **Go Deeper**: `A \in \mathbb{R}^{m \times n}` — m rows, n columns. Element notation: `a_{ij}` = row i, column j. Special: zero matrix, identity matrix.
- **Quiz**: "A 3×2 matrix has how many elements?" → **6** / 5 / 9 / 32

#### Step 2 — Matrices as Transformations (The Key Insight)

- **Viz**: Show unit square defined by î and ĵ. A 2×2 matrix deforms the square. Editable matrix entries → live deformation.
- **Content**: "A matrix DOES something to space. The columns tell you where î and ĵ land after the transformation. This is the single most important idea in linear algebra."
- **Go Deeper**: `T(\vec{v}) = A\vec{v}`. Column picture: columns of A are images of basis vectors. 3B1Brown Ch.3 — "Linear transformations and matrices."
- **Author's Note**: "Once you see matrices as transformations instead of grids of numbers, everything in ML starts making sense."

#### Step 3 — Rotation

- **Viz**: Rotation angle slider (0°–360°), grid lines and unit square rotate, matrix values update live
- **Content**: "Rotation spins everything around the origin. Watch the matrix values change as you adjust the angle — they follow sine and cosine."
- **Go Deeper**: `R(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}`. Preserves lengths (orthogonal matrix). det(R) = 1 always.
- **Quiz**: "A 90° rotation sends (1, 0) to…?" → (1, 1) / **(0, 1)** / (−1, 0) / (0, −1)

#### Step 4 — Scaling

- **Viz**: Independent x-scale and y-scale sliders, grid stretches/compresses along axes
- **Content**: "Scaling stretches or squishes space along the axes. Uniform = same in both directions. Non-uniform = different amounts."
- **Go Deeper**: `S = \begin{bmatrix} s_x & 0 \\ 0 & s_y \end{bmatrix}`. Diagonal matrix. Negative values = reflection + scale. `s_x = s_y` = uniform scaling.

#### Step 5 — Shearing

- **Viz**: Shear slider, unit square becomes parallelogram, grid lines tilt
- **Content**: "Shearing slides one axis relative to the other — like pushing a deck of cards sideways. The shape changes but the area doesn't."
- **Go Deeper**: `\text{Shear}_x = \begin{bmatrix} 1 & k \\ 0 & 1 \end{bmatrix}`. Always has det = 1 (preserves area). Used in image warping and perspective transforms.

#### Step 6 — Reflection

- **Viz**: Toggle buttons: reflect across x-axis, y-axis, y=x, origin. Grid flips accordingly.
- **Content**: "Reflection flips space across a line — like a mirror. Notice how the grid lines mirror and the orientation reverses."
- **Go Deeper**: x-axis: `\begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}`. y=x: `\begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}`. Arbitrary line through origin at angle θ: `\begin{bmatrix} \cos 2\theta & \sin 2\theta \\ \sin 2\theta & -\cos 2\theta \end{bmatrix}`. det = −1 for reflections.

#### Step 7 — Matrix-Vector Multiplication

- **Viz**: Show step-by-step dot product calculation: matrix row × vector column, animated element-by-element
- **Content**: "Multiplying a matrix by a vector = applying the transformation. Each output row is a dot product of a matrix row with the input."
- **Go Deeper**: Row picture: `(A\vec{v})_i = \vec{a}_i \cdot \vec{v}`. Column picture: `A\vec{v} = v_1 \vec{c}_1 + v_2 \vec{c}_2`. Both give the same result. Column picture is geometrically more intuitive.
- **Quiz**: "`[[1,2],[3,4]] × [1,0]` = ?" → **(1, 3)** / (1, 2) / (3, 4) / (3, 7)

#### Step 8 — Matrix-Matrix Multiplication

- **Viz**: Two transformations applied sequentially. Show: apply B to grid, then A. Result = AB.
- **Content**: "Multiplying two matrices = composing two transformations. Apply B first, then A. **Order matters** — AB ≠ BA in general."
- **Go Deeper**: `(AB)_{ij} = \sum_k a_{ik} b_{kj}`. Not commutative. Associative: (AB)C = A(BC). Inner dimensions must match: (m×k)(k×n) = (m×n).
- **Quiz**: "If A is 2×3 and B is 3×4, what size is AB?" → **(2×4)** / 3×3 / 2×3 / Can't multiply

#### Step 9 — The Identity Matrix

- **Viz**: Show identity as "do nothing" — grid stays perfectly unchanged. Compare AI = A visually.
- **Content**: "The identity matrix is the 'do nothing' transformation. Multiply anything by it and nothing changes — like multiplying a number by 1."
- **Go Deeper**: `I = \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}`. `AI = IA = A` for any compatible A. Diagonal of 1s, zeros elsewhere. n×n identity for n-dimensional space.

#### Step 10 — The Determinant (Visual)

- **Viz**: Editable 2×2 matrix with unit square showing transformed area. Area value = |det|. Sign indicates orientation flip.
- **Content**: "The determinant tells you how much a transformation changes area. det = 2 means area doubles. Negative = the orientation flips (like looking in a mirror)."
- **Go Deeper**: `\det \begin{bmatrix} a & b \\ c & d \end{bmatrix} = ad - bc`. Geometric: signed area of parallelogram spanned by column vectors. det = 0 → collapses to lower dimension (not invertible).
- **Quiz**: "If det(A) = 2, a unit square becomes area…?" → 1 / **2** / 4 / 0

#### Step 11 — Inverse Matrices

- **Viz**: Show transform A applied, then A⁻¹ applied → returns to original. Animated undo.
- **Content**: "The inverse 'undoes' a transformation. Apply A then A⁻¹ = back to the start. But not every matrix has one — you can't undo a collapse."
- **Go Deeper**: `A^{-1} = \frac{1}{\det(A)} \begin{bmatrix} d & -b \\ -c & a \end{bmatrix}` for 2×2. Exists iff det(A) ≠ 0. `AA^{-1} = A^{-1}A = I`. Solving `Ax = b` → `x = A^{-1}b`.
- **Quiz**: "Can a matrix with determinant 0 be inverted?" → Yes / **No** / Only if it's square / Depends

#### Step 12 — Transpose

- **Viz**: Animated row↔column swap, elements sliding across the diagonal
- **Content**: "Transpose = swap rows and columns. The first row becomes the first column. Like reflecting the matrix across its diagonal."
- **Go Deeper**: `(A^T)_{ij} = A_{ji}`. Properties: `(AB)^T = B^T A^T` (note reversal). Symmetric: `A = A^T`. Symmetric matrices have real eigenvalues (important later).

#### Step 13 — Why Matrices Matter for AI

- **Viz**: Three panels: (1) neural net layer as matrix multiply, (2) image pixels as a matrix, (3) attention mechanism as matrix multiply
- **Content**: "Neural networks are literally chains of matrix multiplications. Every layer = multiply inputs by a weight matrix + add bias. This is why GPUs — which are fast at matrix math — power AI."
- **Go Deeper**: Forward pass: `\vec{h} = f(W\vec{x} + \vec{b})`. Convolutions are matrix ops. Attention: `\text{softmax}(QK^T / \sqrt{d})V`. Training = finding the right matrices.
- **Author's Note**: "If you understand matrix multiplication and transformations, you understand what a neural network does at its core. Everything else is details."

### Phase 2: Playground

Full `MatrixTransform` visualization:

| Parameter          | Control | Range   | Default |
| ------------------ | ------- | ------- | ------- |
| Matrix entry a     | Slider  | −3 to 3 | 1       |
| Matrix entry b     | Slider  | −3 to 3 | 0       |
| Matrix entry c     | Slider  | −3 to 3 | 0       |
| Matrix entry d     | Slider  | −3 to 3 | 1       |
| Show grid lines    | Toggle  | —       | on      |
| Show basis vectors | Toggle  | —       | on      |
| Show unit square   | Toggle  | —       | on      |
| Show determinant   | Toggle  | —       | off     |
| Animate transform  | Toggle  | —       | on      |
| Preset: Rotation   | Button  | —       | —       |
| Preset: Shear      | Button  | —       | —       |
| Preset: Reflection | Button  | —       | —       |

**Try This:**

1. "Make the determinant equal zero. What happens to the grid?"
2. "Find a matrix that rotates 45° AND scales by 2×."
3. "Make a matrix that's its own inverse (A² = I)."
4. "What matrix reflects across the line y = x?"

### Phase 3: Challenges (3)

| #   | Title                  | Goal                                     | Completion                                   |
| --- | ---------------------- | ---------------------------------------- | -------------------------------------------- |
| 1   | **Shape Transformer**  | Set matrix to match target parallelogram | All 4 corners within 0.2                     |
| 2   | **Rotation Lock**      | Set matrix for exactly 60° rotation      | `dist(result, target) < 0.1` per test vector |
| 3   | **Undo the Transform** | Given matrix A, find its inverse A⁻¹     | `\|AA^{-1} - I\| < 0.1`                      |
