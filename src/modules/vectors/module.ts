import type { ModuleData } from '@/core/types';

const vectorsModule: ModuleData = {
  id: 'vectors',
  tierId: 0,
  clusterId: 'linear-algebra',
  title: 'Vectors',
  description:
    'Arrows, magnitudes, dot products, and projections — developed in depth as both geometry and computation, the common language of linear algebra and ML.',
  tags: ['vectors', 'linear-algebra', 'fundamentals'],
  prerequisites: [],
  difficulty: 'beginner',
  estimatedMinutes: 45,
  steps: [
    {
      id: 'what-is-a-vector',
      title: 'What is a Vector?',
      visualizationProps: {
        manimSrc: '/tier0-manim/Lesson01_WhatIsVector.mp4',
        manimTitle: 'Lesson 01 · What Is a Vector',
        mode: 'static',
        vectors: [{ x: 3, y: 2, color: 'var(--accent)' }],
      },
      content: {
        text: "A vector is an arrow that encodes movement through space. It answers two questions at once: how far, and in which direction? For example, (3, 2) means “move 3 units along the horizontal axis and 2 along the vertical” — usually drawn from the origin, but the same displacement could start anywhere; what matters is the step, not the label of the starting point. That is why physicists distinguish a displacement vector from a position vector: numerically they look alike, but conceptually one is a change and the other is a location relative to an agreed origin. Unlike a scalar (a single number), a vector is inherently multi-dimensional: each component is one independent knob you can turn. Keep this mental model: almost everything in ML that is not a plain scalar is, at bottom, a long list of numbers treated as a vector — a row of pixels, a bag-of-words count, a gradient, or an embedding.",
        goDeeper: {
          math: '\\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix} \\in \\mathbb{R}^2',
          explanation:
            'Formally, a vector in ℝ² is an element of a vector space: you will later require closure under addition and scalar multiplication. For now, focus on three equivalences you should be able to switch between fluently: (1) column or tuple (x, y), (2) arrow from the origin to the point (x, y), (3) instruction “go x along î and y along j-hat.” Order matters — (3, 2) ≠ (2, 3). The zero vector (0, 0) is special: it has no direction in the usual sense and is the additive identity. In ML, “feature vectors” are often row vectors in code but column vectors on paper; transpose conventions are worth noticing early so matrix multiplication later feels natural.',
          references: [
            { title: 'Essence of Linear Algebra, Ch.1', author: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' },
          ],
        },
      },
    },
    {
      id: 'components-coordinates',
      title: 'Components & Coordinates',
      visualizationProps: {
        manimSrc: '/tier0-manim/Lesson03_CoordinatesBasis.mp4',
        manimTitle: 'Lesson 03 · Coordinates and Basis',
        mode: 'components',
        vectors: [{ x: 3, y: 2 }],
        showComponentLines: true,
      },
      content: {
        text: 'Every vector in a chosen coordinate system splits into components along the axes. The x-component is how far you move parallel to the x-axis; the y-component is how far parallel to the y-axis. So (3, 2) is "3 horizontally, then 2 vertically" — the same diagonal you get by laying those axis-aligned moves tip-to-tail. This is how machines store a vector: an ordered list of numbers, one per axis. Trusting that picture, addition is "add each slot," scaling is "multiply every slot," and later ideas (dot products, matrices, gradients) are built from those slot-wise rules. In higher dimensions you cannot draw, but the slot picture still holds.',
        goDeeper: {
          explanation:
            'Each component is the signed coordinate after projecting orthogonally onto that axis (projection is formalized when you study bases). In physics, splitting velocity into horizontal and vertical parts is the same idea. In ML, one component might be one pixel channel, one word count, or one log-transformed feature — the vector is the full state of those features together. Rotating axes or choosing a new orthonormal basis changes the numbers, not the underlying arrow; PCA later exploits that freedom. For now, read v = (v_x, v_y) as the recipe in the standard basis.',
        },
      },
      quiz: {
        question: 'The vector (5, 0) points in which direction?',
        options: ['Straight right', 'Straight up', 'Diagonally', 'Straight down'],
        correctIndex: 0,
        explanation:
          'The y-component is 0 so there is no vertical displacement — only horizontal. The vector points straight right along the x-axis.',
      },
    },
    {
      id: 'drag-to-explore',
      title: 'Drag to Explore',
      visualizationProps: {
        mode: 'interactive',
        draggable: true,
        showCoordinates: true,
      },
      content: {
        text: "Drag the arrow tip: the coordinate readout, length, and angle all respond together. That coupling is the point — there is no separate “geometry layer” and “number layer.” The pair (v_x, v_y) is the vector; the arrow is one faithful picture of it. Before each drag, try to predict: will the magnitude grow or shrink? Will the angle move toward 0°, 90°, or something else? Checking against the live values builds the reflex that ℝ² is small enough to visualize but rich enough to be representative of much higher dimensions, where you cannot draw but the same formulas still run.",
        goDeeper: {
          math: '\\|\\vec{v}\\| = \\sqrt{v_x^2 + v_y^2}',
          explanation:
            'Continuity matters: small changes in components produce small changes in length and angle (away from the origin), which is why optimization can use gradients — locally, the vector field is smooth. The Euclidean norm ‖·‖₂ is rotation-invariant: rotating both axes together does not change lengths. Other norms (L₁, L∞) change geometry of “balls” and sparsity patterns; L₂ is the Pythagorean default. In ML, weight decay often penalizes ‖w‖₂², pulling weights toward smaller magnitudes; understanding norms clarifies what such penalties actually do geometrically.',
        },
        authorNote:
          'If one interaction should stick: the numbers are not annotations on the picture — they are the vector. Everything later (matrices, layers, gradients) is elaboration on that idea.',
      },
      interactionHint: 'Drag the arrow tip to explore',
    },
    {
      id: 'magnitude',
      title: 'Magnitude (Length)',
      visualizationProps: {
        mode: 'magnitude',
        draggable: true,
        showMagnitude: true,
        showPythagorean: true,
      },
      content: {
        text: 'Magnitude is the length of the arrow — how big the displacement is, without naming a direction. Geometrically, drop perpendiculars from the tip to both axes: you get a right triangle whose legs are |v_x| and |v_y| (with signs from placement) and whose hypotenuse is ‖v‖. Pythagoras gives ‖v‖ = √(v_x² + v_y²). Internalize (3, 4) ↦ 5 as a quick sanity check; if your computed length is off, trace whether you squared, summed, and rooted in the right order. Magnitude scales linearly when you scale the vector: ‖c v‖ = |c| ‖v‖ — the absolute value on c matters because reversing direction does not change length. In applications, magnitude often maps to speed, force magnitude, signal energy, or the “size” of an activation vector.',
        goDeeper: {
          math: '\\|\\vec{v}\\|_2 = \\sqrt{\\sum_{i=1}^{n} v_i^2}',
          explanation:
            'The L₂ norm is the default “ordinary length” and is induced by the dot product: ‖v‖₂ = √(v·v). Other norms trade off sensitivity to outliers and sparsity: L₁ encourages many exact zeros in solutions (lasso), L∞ measures worst-coordinate deviation. In high dimensions, random vectors’ lengths concentrate (norms grow like √n while typical coordinates stay O(1)) — a fact that shapes how we normalize embeddings and initialize neural nets. For now, Euclidean length is the ruler you should reach for unless a problem explicitly asks otherwise.',
        },
      },
      quiz: {
        question: "What's the magnitude of (3, 4)?",
        options: ['5', '7', '√7', '12'],
        correctIndex: 0,
        explanation: '√(3² + 4²) = √(9 + 16) = √25 = 5. This is the classic 3-4-5 Pythagorean triple.',
      },
      interactionHint: 'Drag to see the magnitude update',
    },
    {
      id: 'direction-angle',
      title: 'Direction & Angle',
      visualizationProps: {
        mode: 'angle',
        draggable: true,
        showAngle: true,
        showArc: true,
      },
      content: {
        text: 'Direction is “which way,” independent of how long the arrow is. In 2D we often encode direction by the angle θ measured counterclockwise from the positive x-axis. Two vectors of the same length but different θ are different vectors; two vectors of different lengths but the same θ point the same way (one is a positive scalar multiple of the other). Pairing magnitude r = ‖v‖ with direction θ gives polar form: v_x = r cos θ and v_y = r sin θ — the bridge between “length and angle” and “x and y.” Gradients in optimization are vectors too: their direction is the direction of steepest ascent of a loss surface (in the local linear approximation), and their magnitude relates to how steep the slope is.',
        goDeeper: {
          math: '\\theta = \\text{atan2}(v_y, v_x)',
          explanation:
            'Always prefer atan2(y, x) over atan(y/x): the latter loses quadrant information when x < 0 and blows up at x = 0. The zero vector has magnitude zero and no well-defined direction — a subtle edge case in code. Radians are the natural unit for calculus: derivatives of sin and cos are simplest in radians, which is why neural-network libraries assume radians in trig ops. When you normalize a nonzero vector to unit length, you strip magnitude and keep direction; many similarity measures deliberately compare directions only (cosine similarity) so that document length or image brightness does not dominate.',
        },
      },
      quiz: {
        question: 'If two vectors have the same magnitude but different angles, which statement is true?',
        options: ['They are the same vector', 'They have the same direction', 'They are different vectors', 'They must be perpendicular'],
        correctIndex: 2,
        explanation: 'A vector is defined by both magnitude and direction, so changing the angle changes the vector even if length stays the same.',
      },
    },
    {
      id: 'unit-vectors',
      title: 'Unit Vectors',
      visualizationProps: {
        mode: 'unit',
        showUnitVector: true,
        showOriginal: true,
      },
      content: {
        text: "A unit vector is direction with the length knob locked at 1. Given any nonzero v, dividing by ‖v‖ yields a vector pointing the same way with norm exactly 1. The zero vector has no direction and cannot be normalized — guard against division by zero in code. Unit vectors isolate bearing: wind direction, the normal to a decision boundary, or which way a gradient step moves before you choose a step size.",
        goDeeper: {
          math: '\\hat{v} = \\frac{\\vec{v}}{\\|\\vec{v}\\|}',
          explanation:
            'The map v ↦ v/‖v‖ multiplies by the scalar 1/‖v‖; it preserves the line through v and fixes the L₂ norm at 1. The standard basis vectors î and ĵ are already unit vectors, and v = v_x î + v_y ĵ expands v in fixed directions with coordinates as coefficients. Batch and layer normalization keep activations in a stable numeric range — the same geometric instinct at network width. For nonzero a and b, cosine similarity (a·b)/(‖a‖‖b‖) is the dot product of a/‖a‖ with b/‖b‖, so comparing normalized embeddings is comparing directions only.',
        },
      },
      quiz: {
        question: "What's the magnitude of ANY unit vector?",
        options: ['1', '0', 'Depends on direction', '√2'],
        correctIndex: 0,
        explanation: 'By definition, a unit vector has magnitude 1, regardless of its direction.',
      },
    },
    {
      id: 'adding-vectors',
      title: 'Adding Vectors',
      visualizationProps: {
        manimSrc: '/tier0-manim/Lesson02_VectorArithmetic.mp4',
        manimTitle: 'Lesson 02 · Vector Arithmetic',
        mode: 'addition',
        vectors: [
          { x: 2, y: 1, color: '#60a5fa', label: 'a' },
          { x: 1, y: 3, color: '#34d399', label: 'b' },
        ],
        showSum: true,
        draggable: true,
      },
      content: {
        text: 'Vector addition is “do one displacement, then the other.” Put the tail of b on the tip of a; the arrow from the start of a to the end of b is a + b. That tip-to-tail picture is the same as adding coordinates slot by slot: (a_x + b_x, a_y + b_y). If you instead draw a and b from the same origin, they span a parallelogram and a + b is the diagonal through that origin — two drawings, one operation. The visualization should feel like composition of moves: net force, net velocity, or stacking two feature deltas before you apply the next layer.',
        goDeeper: {
          math: '\\vec{a} + \\vec{b} = \\begin{bmatrix} a_x + b_x \\\\ a_y + b_y \\end{bmatrix}',
          explanation:
            'Vector addition is commutative and associative, with the zero vector as identity — the axioms you will see for abstract vector spaces. The parallelogram law is not a separate definition; it follows from the same rule as tip-to-tail when you translate b so its tail meets a’s tip. In ℝ^n, “add each component” scales cleanly to thousands of dimensions: residual connections in transformers literally add a learned update vector to an embedding vector. Seeing addition as both geometry and per-slot arithmetic prevents matrices from feeling arbitrary later.',
        },
      },
      quiz: {
        question: 'If a = (2, 1) and b = (1, 3), what is a + b?',
        options: ['(3, 4)', '(2, 3)', '(1, 2)', '(3, 3)'],
        correctIndex: 0,
        explanation: 'Add component-wise: (2+1, 1+3) = (3, 4).',
      },
      interactionHint: 'Drag either vector to see the sum update',
    },
    {
      id: 'subtracting-vectors',
      title: 'Subtracting Vectors',
      visualizationProps: {
        mode: 'subtraction',
        draggable: true,
        showDifference: true,
      },
      content: {
        text: "Subtraction is addition’s partner: a − b is the vector you must add to b to land on a. Draw a and b from the same origin; the arrow from b’s tip to a’s tip is a − b. That is why the residual (target minus prediction) in regression is a vector (or slot-wise difference) in feature space: it is the gap from prediction to truth. Components subtract just like they add: (a_x − b_x, a_y − b_y). Order matters — a − b and b − a are negatives of each other.",
        goDeeper: {
          math: '\\vec{a} - \\vec{b} = \\vec{a} + (-\\vec{b})',
          explanation:
            'Because −b is b reflected through the origin, a − b lies along the other diagonal of the parallelogram built from a and b (the one not used for a + b). The norm ‖a − b‖ is Euclidean distance between the points a and b when both are position vectors from the origin. k-NN, clustering losses, and contrastive learning all lean on such distances; gradient descent on squared error is deeply tied to L₂ distance in weight or activation space.',
        },
      },
      quiz: {
        question: 'What does the vector a - b represent geometrically?',
        options: ['The midpoint of a and b', 'The vector from tip of b to tip of a', 'The sum of their magnitudes', 'A vector always perpendicular to b'],
        correctIndex: 1,
        explanation: 'a - b is the displacement needed to move from b to a, so it points from b tip to a tip.',
      },
    },
    {
      id: 'scalar-multiplication',
      title: 'Scalar Multiplication',
      visualizationProps: {
        mode: 'scalar',
        draggable: false,
        showScalarSlider: true,
        scalarRange: [-3, 3],
      },
      content: {
        text: 'Multiply a vector by a scalar c and every component scales by the same factor: the arrow stays on the same line through the origin, but its length is scaled by |c| and its orientation flips if c < 0. So scalars are “how much” knobs on a fixed direction (until c = 0, which kills the vector entirely). This is the operation behind learning rates (step size along a gradient), blending weights in attention, and any “α times this vector plus β times that one” recipe.',
        goDeeper: {
          math: 'c\\vec{v} = \\begin{bmatrix} cv_x \\\\ cv_y \\end{bmatrix}',
          explanation:
            'Uniform scaling per component is what makes scalar multiplication commute with many geometric notions: ‖c v‖ = |c| ‖v‖, and if v ≠ 0 the direction is unchanged for c > 0. The distributive law c(v + w) = c v + c w is the algebraic reason linear maps play nicely with both operations. In ML, a linear layer is matrix–vector multiplication — rows dotted with the input — but the scalar “gain” on a channel or feature is still this same idea at smaller scale.',
        },
      },
      quiz: {
        question: 'What happens when you multiply a vector by −1?',
        options: ['It doubles in length', 'It flips direction', 'It becomes zero', 'Nothing changes'],
        correctIndex: 1,
        explanation: 'Multiplying by −1 reverses the direction while keeping the same magnitude.',
      },
      interactionHint: 'Use the slider to change the scalar',
    },
    {
      id: 'linear-combinations-preview',
      title: 'Linear Combinations (Preview)',
      visualizationProps: {
        mode: 'linear-combination',
        showSliders: true,
        showParallelogram: true,
      },
      content: {
        text: "A linear combination is one pass of the vector toolkit: scale each chosen vector, then add. In the plane, two vectors that are not parallel point in genuinely different directions, so varying the two scalars sweeps the whole ℝ² — you can hit any target (as in the Basis Builder challenge). If the two vectors line up, you only ever get points on a single line through the origin: one degree of freedom, not two. That distinction is the seed of independence, span, rank, and dimension.",
        goDeeper: {
          math: 'c_1 \\vec{v}_1 + c_2 \\vec{v}_2',
          explanation:
            'The set {c₁v₁ + c₂v₂ : c₁, c₂ ∈ ℝ} is the span of {v₁, v₂}. Span is a subspace: closed under addition and scalar multiplication by construction. When v₁ and v₂ are linearly independent in ℝ², they form a basis and the pair (c₁, c₂) is unique for each target. When they are dependent, infinitely many coefficient pairs can describe the same point (or none, if you leave their line). Neural nets compose linear maps and nonlinearities; each linear piece is still “linear combinations of columns” — so this recipe is the atomic unit of representational geometry.',
        },
      },
      quiz: {
        question: 'Can you reach every point in 2D with just one vector?',
        options: ['Yes, with the right scalar', 'No, only points on its line', 'Only if it\'s a unit vector'],
        correctIndex: 1,
        explanation: 'One vector can only be stretched or flipped — all results lie on a single line through the origin.',
      },
    },
    {
      id: 'dot-product',
      title: 'The Dot Product',
      visualizationProps: {
        mode: 'dot-product',
        draggable: true,
        showDotProduct: true,
        showAngle: true,
      },
      content: {
        text: "The dot product packs two vectors into one number that answers: how much do these arrows line up, weighted by how long they are? Same-direction vectors get a large positive value; orthogonal ones score zero; opposing ones go negative. Algebraically it is “multiply matching components, then add” — the natural pairing when each coordinate measures the same kind of quantity. That pattern is exactly what a single linear neuron does before its activation: weights dotted with inputs, plus bias.",
        goDeeper: {
          math: '\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y = \\|\\vec{a}\\| \\|\\vec{b}\\| \\cos\\theta',
          explanation:
            'The identity a·b = ‖a‖‖b‖cos θ is why the dot product detects angles: cos θ is the factor by which one vector’s length is “visible” along the other. Bilinearity (linear in each argument when the other is fixed) makes derivatives of quadratic losses simple — many convex optimization proofs hinge on expanding ‖x − y‖² via dot products. In attention mechanisms, query–key dot products score how much one position should attend to another; softmax then turns those scores into weights.',
        },
      },
      quiz: {
        question: '(1, 0) · (0, 1) = ?',
        options: ['1', '0', '−1', 'undefined'],
        correctIndex: 1,
        explanation: '1×0 + 0×1 = 0. These vectors are perpendicular, so their dot product is zero.',
      },
    },
    {
      id: 'perpendicularity',
      title: 'Perpendicularity',
      visualizationProps: {
        mode: 'perpendicular',
        draggable: true,
        showDotProduct: true,
        showRightAngle: true,
      },
      content: {
        text: 'Perpendicular means “no component along the other direction.” Geometrically the angle is 90°; algebraically a·b = 0 (for the Euclidean dot product). Neither statement cares which vector is longer — scaling one perpendicular vector does not suddenly create overlap. Drag until the readout hits zero: you are hunting for a right angle. Orthogonality is the linear-algebra version of “uncorrelated axes”: movement along one does not advance you along the other.',
        goDeeper: {
          math: '\\vec{a} \\cdot \\vec{b} = 0 \\;\\Leftrightarrow\\; \\vec{a} \\perp \\vec{b} \\quad (\\vec{a},\\vec{b} \\neq \\vec{0})',
          explanation:
            'In ℝ^n the same test applies: zero dot product means the vectors are orthogonal (modulo the degenerate case where one is zero). Orthonormal bases make coordinates easy: projections onto basis directions do not interfere. Gram–Schmidt and QR factorization systematically manufacture orthogonality for stable solvers. PCA finds orthogonal directions of maximal variance — perpendicularity is not a quirk of 2D drawings but a workhorse for high-dimensional data.',
        },
      },
      quiz: {
        question: 'Which dot product value indicates perpendicular vectors?',
        options: ['1', '-1', '0', 'It depends on magnitude only'],
        correctIndex: 2,
        explanation: 'Perpendicular vectors always have zero directional overlap, so their dot product is 0.',
      },
      interactionHint: 'Drag b to make the dot product zero',
    },
    {
      id: 'projection',
      title: 'Projection',
      visualizationProps: {
        mode: 'projection',
        draggable: true,
        showProjection: true,
      },
      content: {
        text: "Projection answers: if I could only describe vector a along the line through b, what vector would I keep? Geometrically it is the shadow of a onto that line (with light rays perpendicular to the line — orthogonal projection). What remains, a minus its projection, is perpendicular to b. That decomposition is unique and shows up whenever you isolate one factor: regression coefficients, PCA loadings, or splitting a force into parallel and normal components.",
        goDeeper: {
          math: '\\text{proj}_{\\vec{b}} \\vec{a} = \\frac{\\vec{a} \\cdot \\vec{b}}{\\vec{b} \\cdot \\vec{b}} \\vec{b}',
          explanation:
            'The factor (a·b)/(b·b) is the scalar that best scales b to approximate a in the least-squares sense along that line — the normal equations for one unknown are hiding here. If b is a unit vector, the formula collapses to (a·b) b. Repeating projection onto an orthonormal basis recovers coordinates. In ML, attention can be read as soft, learned projections; PCA is rigid projection onto variance-ranked orthogonal directions.',
        },
      },
      quiz: {
        question: 'What does projecting a onto b measure?',
        options: ['The total length of a only', 'How much of a lies along the direction of b', 'Whether a and b are equal', 'The area between the vectors'],
        correctIndex: 1,
        explanation: 'Projection isolates the component of a that points in the direction of b.',
      },
    },
    {
      id: 'standard-basis',
      title: 'The Standard Basis',
      visualizationProps: {
        mode: 'basis',
        showBasisVectors: true,
        showDecomposition: true,
      },
      content: {
        text: "The standard basis î = (1, 0) and ĵ = (0, 1) are the agreed-on rulers for the plane: î is one step in x, ĵ one step in y. Every (v_x, v_y) is the recipe v_x î + v_y ĵ — coordinates are the coefficients in that expansion. Other bases (rotated axes, PCA axes, Fourier modes) assign different numbers to the same geometric vector; much of linear algebra is knowing when to change the recipe.",
        goDeeper: {
          math: '\\vec{v} = v_x \\hat{i} + v_y \\hat{j}',
          explanation:
            'A basis is a linearly independent spanning set: each vector has a unique coordinate tuple in that basis. The standard basis is orthonormal, so lengths and dot products look simple in those coordinates. Eigenbases diagonalize linear maps; PCA picks an orthonormal basis ordered by variance. The mantra “change basis, not vector” links raw arrays in code to geometry that stays the same.',
        },
      },
      quiz: {
        question: 'Every 2D vector can be written as c₁î + c₂ĵ. True or false?',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Yes — î and ĵ form a basis for ℝ², so every vector has a unique decomposition as a linear combination of them.',
      },
    },
    {
      id: 'why-vectors-matter',
      title: 'Why Vectors Matter for AI',
      visualizationProps: {
        mode: 'ai-applications',
      },
      content: {
        text: "Most of what neural networks consume and produce is vectors (or stacks of them). A patch of pixels is a vector of intensities; a user session is a feature vector; hidden states flowing through layers are vectors evolving under learned linear maps and nonlinearities. The primitives you practiced — add, scale, dot, project, expand in a basis — are the instructions executed billions of times in training and inference. Recognizing that continuity makes papers and stack traces easier to read.",
        goDeeper: {
          explanation:
            'Embedding spaces are shaped so useful similarity is geometric: nearby vectors mean related inputs; vector arithmetic can capture analogies (e.g. king − man + woman ≈ queen in classic word2vec). Retrieval and recommenders index vectors for fast nearest-neighbor search; clustering and PCA reshape vectors for analysis. Solid vector intuition is one of the highest-leverage foundations for ML engineering.',
        },
        authorNote:
          'Treat this module as vocabulary, not trivia: matrices, gradients, and attention are elaborations on vectors.',
      },
    },
  ],
  playground: {
    description: 'Full VectorTransform playground with all parameters exposed.',
    parameters: [
      { id: 'vectorCount', label: 'Vector count', type: 'stepper', min: 1, max: 4, step: 1, default: 2 },
      { id: 'showGrid', label: 'Show grid', type: 'toggle', default: true },
      { id: 'showCoordinates', label: 'Show coordinates', type: 'toggle', default: true },
      { id: 'showMagnitude', label: 'Show magnitude', type: 'toggle', default: false },
      { id: 'showAngle', label: 'Show angle', type: 'toggle', default: false },
      { id: 'showDotProduct', label: 'Show dot product', type: 'toggle', default: false },
      { id: 'showProjection', label: 'Show projection', type: 'toggle', default: false },
      { id: 'showUnitVectors', label: 'Show unit vectors', type: 'toggle', default: false },
      { id: 'scalarMultiplier', label: 'Scalar multiplier', type: 'slider', min: -3, max: 3, step: 0.1, default: 1 },
    ],
    tryThis: [
      'Make two perpendicular vectors. What\'s their dot product?',
      'Can you find two vectors whose sum is the zero vector?',
      'Set the scalar to −0.5. What happens to the vector?',
      'Try to make vector a\'s projection onto b equal zero. What angle is needed?',
    ],
  },
  challenges: [
    {
      id: 'reach-the-target',
      title: 'Reach the Target',
      description: 'Drag vectors a and b so their sum lands on the red target.',
      props: { mode: 'addition', draggable: true, showSum: true, showTarget: true, target: { x: 4, y: 3 } },
      completionCriteria: { type: 'threshold', target: 0.3, metric: 'distance_sum_to_target' },
      hints: [
        'Think of it as a tip-to-tail path.',
        'The sum of two vectors is the diagonal of their parallelogram.',
      ],
    },
    {
      id: 'scalar-sniper',
      title: 'Scalar Sniper',
      description: 'Find the scalar that maps the blue vector to the green target.',
      props: { mode: 'scalar', draggable: false, showScalarSlider: true, showTarget: true, target: { x: 3, y: 3 } },
      completionCriteria: { type: 'threshold', target: 0.1, metric: 'distance_scaled_to_target' },
      hints: [
        'Divide the target length by the original length.',
        'If the target points the opposite way, the scalar is negative.',
      ],
    },
    {
      id: 'right-angle',
      title: 'Right Angle',
      description: 'Drag b to be perpendicular to a.',
      props: { mode: 'perpendicular', draggable: true, showDotProduct: true },
      completionCriteria: { type: 'threshold', target: 0.05, metric: 'abs_dot_product' },
      hints: [
        'Perpendicular means the dot product is zero.',
        'Try rotating b 90° from a.',
      ],
    },
    {
      id: 'basis-builder',
      title: 'Basis Builder',
      description: 'Express the target as a linear combination of the custom basis vectors.',
      props: { mode: 'linear-combination', showSliders: true, showTarget: true, target: { x: 5, y: 2 } },
      completionCriteria: { type: 'threshold', target: 0.2, metric: 'distance_combination_to_target' },
      hints: [
        'Adjust the scalar sliders for each basis vector.',
        'The two basis vectors must not be parallel.',
      ],
    },
  ],
};

export default vectorsModule;
