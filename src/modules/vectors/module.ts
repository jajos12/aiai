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
        text: "A vector is just an arrow. It has a direction and a length. This one says 'go 3 right, 2 up.' That's it.",
        goDeeper: {
          math: '\\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix} \\in \\mathbb{R}^2',
          explanation:
            'An ordered pair of real numbers. Represents both a point in space and a displacement from the origin. Vectors are the fundamental objects of linear algebra.',
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
        text: 'The horizontal part (3) is the x-component, vertical part (2) is the y-component. Together, they fully describe the vector.',
        goDeeper: {
          explanation:
            'Component notation: vₓ = 3, vᵧ = 2. In physics these are projections onto coordinate axes. Generalizes to ℝⁿ — a vector in ℝ¹⁰ has 10 components.',
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
        text: "Drag the tip. Watch the coordinates change in real time. The arrow IS the coordinates — there's no hidden information.",
        goDeeper: {
          math: '\\|\\vec{v}\\| = \\sqrt{v_x^2 + v_y^2}',
          explanation: 'Magnitude formula. Extends to n dimensions: ‖v‖ = √(Σvᵢ²).',
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
        text: 'How long is this arrow? Draw a right triangle underneath it. Pythagoras gives us: length = √(x² + y²). Drag and watch it update.',
        goDeeper: {
          math: '\\|\\vec{v}\\|_2 = \\sqrt{\\sum_{i=1}^{n} v_i^2}',
          explanation: 'L2 norm. Distinguished from L1 norm (Manhattan distance) and L∞ norm which appear in later modules.',
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
        text: 'Direction = the angle the arrow makes with the horizontal. Every vector has both a magnitude AND a direction.',
        goDeeper: {
          math: '\\theta = \\text{atan2}(v_y, v_x)',
          explanation: 'Why atan2 not atan: handles all four quadrants correctly. Relationship to unit circle. Radians vs. degrees.',
        },
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
        text: "A unit vector keeps the direction but scales to length 1. It answers 'which way?' without 'how far?' Think of it as the 'pure direction.'",
        goDeeper: {
          math: '\\hat{v} = \\frac{\\vec{v}}{\\|\\vec{v}\\|}',
          explanation: 'Standard basis: î = (1,0), ĵ = (0,1). Every vector = vₓ î + vᵧ ĵ. Unit vectors are critical for normalization in ML.',
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
        text: 'Place the tail of b at the tip of a. The sum goes from the start of a to the end of b. Drag either and watch the sum move.',
        goDeeper: {
          math: '\\vec{a} + \\vec{b} = \\begin{bmatrix} a_x + b_x \\\\ a_y + b_y \\end{bmatrix}',
          explanation: 'Commutative: a+b = b+a. Parallelogram law: sum is the diagonal.',
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
        text: "Subtraction = 'how do I get from b to a?' The result points from the tip of b to the tip of a.",
        goDeeper: {
          math: '\\vec{a} - \\vec{b} = \\vec{a} + (-\\vec{b})',
          explanation: 'Geometrically: the other diagonal of the parallelogram. Distance between two points: ‖a − b‖.',
        },
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
        text: 'Multiply by 2 → twice as long. By 0.5 → half. By −1 → flips direction. Drag the slider and experiment.',
        goDeeper: {
          math: 'c\\vec{v} = \\begin{bmatrix} cv_x \\\\ cv_y \\end{bmatrix}',
          explanation: 'c > 1 stretches, 0 < c < 1 shrinks, c < 0 reverses direction, c = 0 gives zero vector.',
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
        text: "Any point in 2D can be reached by combining two non-parallel vectors with the right scalars. These scalars are the 'recipe.' We'll explore this much deeper in the next module.",
        goDeeper: {
          math: 'c_1 \\vec{v}_1 + c_2 \\vec{v}_2',
          explanation: 'A linear combination. The set of all reachable points is the span. This concept is so important it gets its own module next.',
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
        text: "The dot product measures how much two vectors 'agree' in direction. Same direction = large positive. Perpendicular = zero. Opposite = negative.",
        goDeeper: {
          math: '\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y = \\|\\vec{a}\\| \\|\\vec{b}\\| \\cos\\theta',
          explanation: 'Two equivalent forms: algebraic (component-wise multiply and sum) and geometric (magnitudes times cosine of angle). Both giving the same result is a powerful theorem.',
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
        text: 'When the dot product equals zero, the vectors are perpendicular (at 90°). Drag b until you see the square appear.',
        goDeeper: {
          explanation: 'a ⊥ b ⟺ a · b = 0. Extends to orthogonality in higher dimensions. Orthogonal bases are extremely useful — they make computations clean.',
        },
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
        text: "How much of a goes in the direction of b? That's the projection — the shadow one vector casts onto another.",
        goDeeper: {
          math: '\\text{proj}_{\\vec{b}} \\vec{a} = \\frac{\\vec{a} \\cdot \\vec{b}}{\\vec{b} \\cdot \\vec{b}} \\vec{b}',
          explanation: 'Used everywhere: least squares, Gram-Schmidt orthogonalization, PCA. The scalar projection gives the length; the vector projection gives the full shadow vector.',
        },
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
        text: "î and ĵ are the standard basis vectors — every 2D vector is just a combination of these two. They're why we can use coordinates at all.",
        goDeeper: {
          math: '\\vec{v} = v_x \\hat{i} + v_y \\hat{j}',
          explanation: "The next module ('Vector Spaces') formalizes what a basis is, why you need exactly 2 for 2D, and what happens when you change basis.",
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
        text: "In AI, everything becomes vectors. Words, images, sounds — all represented as lists of numbers in high-dimensional space. The operations you just learned? They're the language of machine learning.",
        goDeeper: {
          explanation: 'Word2Vec: king - man + woman ≈ queen. Images are vectors in ℝ^(width×height×3). Feature vectors in ML. Embeddings map real-world objects to vectors where distance = similarity.',
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
