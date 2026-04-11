import type { ModuleData } from '@/core/types';

const vectorsModule: ModuleData = {
  id: 'vectors',
  tierId: 0,
  clusterId: 'linear-algebra',
  title: 'Vectors',
  description:
    'Arrows, magnitudes, dot products — the fundamental objects of linear algebra and the language of machine learning.',
  tags: ['vectors', 'linear-algebra', 'fundamentals'],
  prerequisites: [],
  difficulty: 'beginner',
  estimatedMinutes: 30,
  steps: [
    {
      id: 'what-is-a-vector',
      title: 'What is a Vector?',
      visualizationProps: {
        mode: 'static',
        vectors: [{ x: 3, y: 2, color: 'var(--accent)' }],
      },
      content: {
        text: "A vector is an arrow that encodes movement. It tells you both how far to go and which way to go. For example, the vector (3, 2) means move 3 units to the right and 2 units up from the origin. Unlike a plain number, a vector always carries direction with magnitude. Keep this mental model in mind: vectors describe change, motion, and position shifts.",
        goDeeper: {
          math: '\\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix} \\in \\mathbb{R}^2',
          explanation:
            'A vector in 2D is an ordered pair of real numbers, so order matters: (3, 2) is not (2, 3). Geometrically, the same pair can be viewed as a point in the plane or as a displacement from one location to another. In linear algebra, vectors are the main objects we transform, compare, and combine. In machine learning, feature representations, embeddings, and gradients are all vectors.',
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
        mode: 'components',
        vectors: [{ x: 3, y: 2 }],
        showComponentLines: true,
      },
      content: {
        text: 'Every vector can be split into components along the axes. The x-component tells you horizontal movement, and the y-component tells you vertical movement. When you see (3, 2), you can read it as 3 units of x-motion plus 2 units of y-motion. This component view is powerful because it lets you compute with vectors using simple arithmetic. If you understand components, you can add, subtract, and scale vectors reliably.',
        goDeeper: {
          explanation:
            'Component notation is v = (vₓ, vᵧ), where each component is the projection onto a coordinate axis. In physics this separates motion into independent horizontal and vertical effects. The same idea extends to higher dimensions: a vector in ℝ¹⁰ has 10 components, one per axis. Most machine learning pipelines operate in high-dimensional spaces where each feature is one component of a vector.',
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
        text: "Drag the arrow tip and watch the numbers update immediately. This interaction shows that coordinates are not extra metadata; they are the exact description of the arrow. When the tip moves, the vector changes, and so do its components, angle, and length. This builds intuition that geometric movement and numeric representation are two views of the same object. Pause and predict the new coordinates before you drag, then verify visually.",
        goDeeper: {
          math: '\\|\\vec{v}\\| = \\sqrt{v_x^2 + v_y^2}',
          explanation: 'As the vector moves, its magnitude changes according to the Pythagorean formula. In n dimensions, the same idea becomes ‖v‖ = √(Σvᵢ²), which is the Euclidean norm. This norm is the default distance notion in many ML algorithms, including nearest-neighbor methods and gradient-based optimization. Interactive dragging helps learners connect formula behavior to geometry.',
        },
        authorNote:
          "This is the moment it clicks — vectors aren't abstract math, they're just arrows you can grab and move.",
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
        text: 'Magnitude means the length of a vector, independent of direction. Draw a right triangle from the vector tip to the axes, and the vector becomes the hypotenuse. That gives the formula √(x² + y²). For (3, 4), the magnitude is 5, which is a classic sanity check. In practice, magnitude often represents strength, speed, or intensity in applications.',
        goDeeper: {
          math: '\\|\\vec{v}\\|_2 = \\sqrt{\\sum_{i=1}^{n} v_i^2}',
          explanation: 'The Euclidean magnitude is the L2 norm and is the most common default in geometry and ML. Compare with L1 norm (sum of absolute values) and L∞ norm (largest absolute component), which behave differently in optimization and regularization. Choosing a norm changes how distance and similarity are measured. That choice can affect model behavior significantly.',
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
        text: 'Direction tells you where the vector points, usually measured as an angle from the positive x-axis. Two vectors can have equal length but completely different directions. Together, magnitude and direction fully characterize a vector in 2D. If magnitude answers "how much," direction answers "which way." This distinction appears everywhere from physics forces to optimization gradients.',
        goDeeper: {
          math: '\\theta = \\text{atan2}(v_y, v_x)',
          explanation: 'Use atan2 instead of atan because atan2 correctly handles signs of both components and returns the right quadrant. This prevents common angle mistakes when vectors point left or down. Angles can be expressed in degrees for intuition or radians for computation. In many ML and graphics systems, radians are the default.',
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
        text: "A unit vector captures direction only by rescaling a vector to length 1. You keep the arrow's orientation but remove its original size. This is useful when you want to compare direction fairly across vectors of different magnitudes. For example, recommendation systems often normalize embeddings before similarity comparisons. Think of a unit vector as pure direction information.",
        goDeeper: {
          math: '\\hat{v} = \\frac{\\vec{v}}{\\|\\vec{v}\\|}',
          explanation: 'Normalization divides by magnitude, producing a vector with norm 1. The standard basis vectors î and ĵ are unit vectors along coordinate axes, and any 2D vector can be written as vₓî + vᵧĵ. In machine learning, normalization helps when scale should not dominate comparison. Cosine similarity, for example, depends heavily on normalized vectors.',
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
        mode: 'addition',
        vectors: [
          { x: 2, y: 1, color: '#60a5fa', label: 'a' },
          { x: 1, y: 3, color: '#34d399', label: 'b' },
        ],
        showSum: true,
        draggable: true,
      },
      content: {
        text: 'Vector addition combines movements. Start with vector a, then follow vector b from the tip of a; the resulting displacement is a + b. This is called the tip-to-tail rule and gives a direct geometric interpretation. If you drag either vector, the sum changes continuously, revealing how both contributions combine. Addition is how we aggregate effects such as forces, velocities, and feature updates.',
        goDeeper: {
          math: '\\vec{a} + \\vec{b} = \\begin{bmatrix} a_x + b_x \\\\ a_y + b_y \\end{bmatrix}',
          explanation: 'Addition is component-wise and commutative: a + b = b + a. Geometrically, placing the vectors tail-to-tail forms a parallelogram, and the sum is the diagonal from the shared origin. This dual view (algebraic and geometric) is essential for later matrix operations. In optimization, gradient updates also behave like vector additions.',
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
        text: "Vector subtraction answers a relative-position question: what change moves you from b to a? Geometrically, a - b points from the tip of b to the tip of a. This makes subtraction the natural language of error and difference. In ML, prediction error vectors are often actual vector differences. So subtraction is not just arithmetic; it is comparison in space.",
        goDeeper: {
          math: '\\vec{a} - \\vec{b} = \\vec{a} + (-\\vec{b})',
          explanation: 'Subtracting b is the same as adding its opposite direction, -b. This creates the other diagonal of the vector parallelogram. The length ‖a - b‖ gives Euclidean distance between two points represented as vectors. Distance-based ML methods depend directly on this quantity.',
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
        text: 'Scalar multiplication scales a vector by a single number. Values greater than 1 stretch it, values between 0 and 1 shrink it, and negative values reverse direction. This operation lets you control strength without changing the underlying direction logic. Try the slider and predict the effect before looking. This same rule powers weighted combinations in models.',
        goDeeper: {
          math: 'c\\vec{v} = \\begin{bmatrix} cv_x \\\\ cv_y \\end{bmatrix}',
          explanation: 'Each component is multiplied by the same scalar c, so scaling is uniform along the vector direction. c > 1 stretches, 0 < c < 1 shrinks, c < 0 flips direction, and c = 0 collapses to the zero vector. Scalar multiplication is one half of linear combinations. Together with vector addition, it defines linear structure.',
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
        text: "A linear combination is a recipe: choose vectors, then scale and add them. With two non-parallel vectors in 2D, you can reach any point in the plane using the right coefficients. With parallel vectors, your reachable set collapses to a line. This idea transitions directly to span, basis, and dimension in the next module. Understanding the recipe view now makes abstract vector space language much easier later.",
        goDeeper: {
          math: 'c_1 \\vec{v}_1 + c_2 \\vec{v}_2',
          explanation: 'A linear combination scales each vector then adds the results. The full set of outputs from all possible coefficients is the span of those vectors. Span tells you what region of space your vectors can represent. In ML terms, it mirrors representational capacity: what outputs can be constructed from available features.',
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
        text: "The dot product measures directional alignment between two vectors. Large positive values mean they point similarly, values near zero mean they are close to perpendicular, and negative values mean they oppose each other. This gives a single number summarizing both magnitude and direction relation. Dot products are everywhere in ML, from similarity scoring to linear layers. Treat it as a core operation, not a niche formula.",
        goDeeper: {
          math: '\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y = \\|\\vec{a}\\| \\|\\vec{b}\\| \\cos\\theta',
          explanation: 'The algebraic form multiplies matching components and sums them. The geometric form uses magnitudes and the cosine of the angle, explaining why orientation matters. Equality of these forms links coordinate computation with geometric intuition. In neural networks, each neuron computes a dot product before applying nonlinearity.',
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
        text: 'Perpendicular vectors meet at a right angle and share no directional overlap. In dot-product language, that means their product is exactly zero. Dragging to make the value approach zero builds practical intuition for orthogonality. This concept appears in coordinate systems, projections, and decorrelated features. You can think of orthogonal directions as independent channels of information.',
        goDeeper: {
          explanation: 'The condition a ⊥ b if and only if a · b = 0 extends beyond 2D into any dimension. Orthogonal vectors simplify computations because interactions between dimensions vanish in dot products. Many numerical methods intentionally build orthogonal bases for stability. PCA and QR-related techniques rely on this property heavily.',
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
        text: "Projection asks: how much of vector a points along vector b? Visually, it is the shadow of a cast onto the line of b. This separates a into aligned and perpendicular parts, which is useful for interpretation and optimization. If the projection is small, a carries little information in b's direction. If large, a strongly aligns with b.",
        goDeeper: {
          math: '\\text{proj}_{\\vec{b}} \\vec{a} = \\frac{\\vec{a} \\cdot \\vec{b}}{\\vec{b} \\cdot \\vec{b}} \\vec{b}',
          explanation: 'The scalar projection gives signed length along b, while the vector projection gives the full shadow vector in b direction. Projections are central to least squares fitting, Gram-Schmidt orthogonalization, and PCA geometry. They tell you how much signal lies in a chosen direction. This makes them foundational for dimensionality reduction and regression.',
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
        text: "The standard basis vectors î = (1, 0) and ĵ = (0, 1) are the building blocks of 2D coordinates. Any vector can be reconstructed by scaling these two basis vectors and adding them. This gives a universal coordinate language for the plane. Once basis is understood, coordinates become recipes rather than mysterious labels. That perspective prepares you for basis changes in later modules.",
        goDeeper: {
          math: '\\vec{v} = v_x \\hat{i} + v_y \\hat{j}',
          explanation: "A basis is a minimal set of independent vectors that can generate the whole space through linear combinations. In ℝ², exactly two independent basis vectors are needed. Changing basis changes coordinate values but not the underlying geometric vector. This is the key bridge to eigenvectors, diagonalization, and PCA.",
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
        text: "Modern AI turns real-world objects into vectors so models can compute on them. Words become embeddings, images become long numeric arrays, and user behavior becomes feature vectors. The operations from this module - add, scale, dot, project - are exactly what models execute repeatedly. Once you see vectors as the common language, many AI systems become less mysterious. This module gives the mathematical vocabulary for the rest of your learning path.",
        goDeeper: {
          explanation: 'Embedding models map tokens, images, or events into high-dimensional vector spaces where geometry encodes meaning. Famous examples include king - man + woman ≈ queen in word embeddings. Similarity search, retrieval, recommendation, and clustering all rely on vector distances or dot products. In practice, AI engineering is often about designing, transforming, and comparing vectors well.',
        },
        authorNote:
          'This is the bridge. Everything from here on is about doing clever things with vectors and matrices.',
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
