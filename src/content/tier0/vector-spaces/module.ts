import type { Module } from '@/types/curriculum';

const vectorSpacesModule: Module = {
  id: 'vector-spaces',
  tierId: 0,
  clusterId: 'linear-algebra',
  title: 'Vector Spaces & Independence',
  description:
    'Span, linear independence, basis, dimension — the abstract structure that unlocks eigenvectors and PCA.',
  tags: ['vector-spaces', 'linear-algebra', 'span', 'basis', 'independence'],
  prerequisites: ['vectors'],
  difficulty: 'beginner',
  estimatedMinutes: 30,
  visualizationComponent: 'VectorTransform',
  steps: [
    // ── 1. What Is a Vector Space? ──
    {
      id: 'what-is-a-space',
      title: 'What Is a Vector Space?',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'static',
          vectors: [
            { x: 3, y: 1, color: '#6366f1', label: 'a' },
            { x: -1, y: 2, color: '#06b6d4', label: 'b' },
          ],
        },
      },
      content: {
        text: "A vector space is a collection of vectors that you can add together and scale freely — and the result always stays in the collection. ℝ² (this 2D plane) is the simplest example: any arrow you draw here, scaled or added, stays on the plane.",
        goDeeper: {
          math: 'V \\text{ is a vector space if } \\forall\\, \\vec{u},\\vec{v} \\in V,\\; c \\in \\mathbb{R}:\\quad \\vec{u}+\\vec{v} \\in V \\;\\text{and}\\; c\\vec{u} \\in V',
          explanation:
            'Formally, a vector space must satisfy 8 axioms (closure under addition/scalar multiplication, associativity, commutativity, zero vector, additive inverse, distributive laws, scalar associativity, identity element). But the key intuition is: you can combine vectors freely and never leave the space.',
          references: [
            { title: 'Essence of Linear Algebra, Ch.2', author: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' },
            { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', year: 2015 },
          ],
        },
      },
    },

    // ── 2. Closure: The One Rule ──
    {
      id: 'closure',
      title: 'Closure: The One Rule',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'addition',
          vectors: [
            { x: 2, y: 1, color: '#6366f1', label: 'a' },
            { x: 1, y: 2, color: '#06b6d4', label: 'b' },
          ],
          draggable: true,
          showSum: true,
        },
      },
      content: {
        text: "The fundamental rule: if you add two vectors in the space, the result must also be in the space. Same with scaling. Drag these arrows anywhere — the sum always stays on the 2D plane. That's closure.",
        goDeeper: {
          explanation:
            "Closure is what separates a vector space from a random collection of vectors. The set {(1,0), (0,1)} is NOT a vector space because (1,0)+(0,1)=(1,1) isn't in the set. But all of ℝ² is, because any sum of 2D vectors is still 2D.",
        },
      },
      quiz: {
        question: 'Is the sum of two vectors in ℝ² always in ℝ²?',
        options: ['Yes, always', 'Only if they point the same way', 'Only if their magnitudes are equal', 'No, it could leave ℝ²'],
        correctIndex: 0,
        explanation:
          'Adding any two 2D vectors gives another 2D vector. This is the closure property — ℝ² is closed under addition.',
      },
      interactionHint: 'Drag both vectors freely — the sum (dashed) always stays on the plane.',
    },

    // ── 3. The Span of One Vector ──
    {
      id: 'span-one-vector',
      title: 'The Span of One Vector',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'scalar',
          vectors: [{ x: 2, y: 1, color: '#6366f1', label: 'v' }],
          draggable: true,
          showScalarSlider: true,
          scalarRange: [-3, 3],
        },
      },
      content: {
        text: "Take one vector and scale it by every possible number. The set of all results is called its span. For a single vector, the span is a line through the origin. Slide the scalar — you can reach any point on that line, but nothing off it.",
        goDeeper: {
          math: '\\text{span}(\\vec{v}) = \\{ c\\vec{v} \\mid c \\in \\mathbb{R} \\}',
          explanation:
            'The span of a single non-zero vector is a 1-dimensional subspace: a line through the origin. The span of the zero vector is just {0}.',
        },
      },
      interactionHint: 'Drag the vector to change direction. Use the slider below to scale.',
    },

    // ── 4. Span of Two Vectors ──
    {
      id: 'span-two-vectors',
      title: 'Span of Two Vectors',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'linear-combination',
          vectors: [
            { x: 2, y: 1, color: '#6366f1', label: 'v₁' },
            { x: -1, y: 2, color: '#06b6d4', label: 'v₂' },
          ],
          draggable: true,
          showSliders: true,
          showParallelogram: true,
        },
      },
      content: {
        text: "Now take two non-parallel vectors. By combining them with any scalars, you can reach every point on the plane. The span of two independent vectors in ℝ² is all of ℝ². Adjust c₁ and c₂ to hit any spot.",
        goDeeper: {
          math: '\\text{span}(\\vec{v}_1, \\vec{v}_2) = \\{ c_1\\vec{v}_1 + c_2\\vec{v}_2 \\mid c_1, c_2 \\in \\mathbb{R} \\}',
          explanation:
            'When two vectors are not parallel (linearly independent), their span is the entire plane. This is the geometric meaning of "they form a basis for ℝ²."',
        },
      },
      interactionHint: 'Drag the vectors and adjust c₁/c₂ sliders to reach any point.',
    },

    // ── 5. Linear Dependence ──
    {
      id: 'linear-dependence',
      title: 'Linear Dependence',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'linear-combination',
          vectors: [
            { x: 2, y: 1, color: '#6366f1', label: 'v₁' },
            { x: 4, y: 2, color: '#06b6d4', label: 'v₂' },
          ],
          draggable: true,
          showSliders: true,
          showParallelogram: true,
        },
      },
      content: {
        text: "Now v₂ is exactly 2× v₁ — they're parallel. No matter how you combine them, you can only reach points on one line. These vectors are linearly dependent: one is redundant.",
        goDeeper: {
          math: '\\vec{v}_2 = 2\\vec{v}_1 \\implies c_1\\vec{v}_1 + c_2\\vec{v}_2 = (c_1 + 2c_2)\\vec{v}_1',
          explanation:
            "Vectors are linearly dependent if one can be expressed as a scalar multiple (or linear combination) of the others. Dependent vectors don't add new directions — they're trapped on the same line or plane. In ML, dependent features carry no extra information.",
        },
      },
      quiz: {
        question: 'If v₂ = 3·v₁, are v₁ and v₂ linearly independent?',
        options: ['Yes — they have different magnitudes', 'Yes — they are different vectors', 'No — v₂ is a scaled copy of v₁', 'It depends on their direction'],
        correctIndex: 2,
        explanation:
          "Linear dependence means one vector is a scalar multiple of another. The magnitudes don't matter — they point in the same (or opposite) direction, so they span only a line.",
      },
    },

    // ── 6. Linear Independence ──
    {
      id: 'linear-independence',
      title: 'Linear Independence',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'linear-combination',
          vectors: [
            { x: 2, y: 0, color: '#6366f1', label: 'v₁' },
            { x: 0, y: 2, color: '#06b6d4', label: 'v₂' },
          ],
          draggable: true,
          showSliders: true,
          showParallelogram: true,
        },
      },
      content: {
        text: "These two vectors point in completely different directions — neither is a scalar multiple of the other. They're linearly independent. Together they can reach any point in ℝ². Every direction in the plane is accessible.",
        goDeeper: {
          explanation:
            'Formally: vectors are independent if the only solution to c₁v₁ + c₂v₂ = 0 is c₁ = c₂ = 0. Geometrically: no vector in the set is redundant. Independent vectors each contribute a genuinely new direction. In data science, independent features add unique information.',
        },
      },
      interactionHint: 'Drag the vectors and use c₁/c₂ sliders — both vectors are needed to reach every corner.',
    },

    // ── 7. What Is a Basis? ──
    {
      id: 'basis',
      title: 'What Is a Basis?',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'static',
          vectors: [
            { x: 1, y: 0, color: '#ef4444', label: 'ê₁' },
            { x: 0, y: 1, color: '#3b82f6', label: 'ê₂' },
          ],
          showBasisVectors: true,
          showCoordinates: true,
        },
      },
      content: {
        text: "A basis is the smallest set of independent vectors that spans the entire space. For ℝ², the standard basis is ê₁ = (1,0) and ê₂ = (0,1). Every vector is a unique combination of the basis vectors — that's what coordinates mean.",
        goDeeper: {
          math: '\\vec{v} = v_x\\hat{e}_1 + v_y\\hat{e}_2 \\;\\text{ where }\\; \\hat{e}_1 = \\begin{bmatrix}1\\\\0\\end{bmatrix},\\; \\hat{e}_2 = \\begin{bmatrix}0\\\\1\\end{bmatrix}',
          explanation:
            'A basis must be (1) linearly independent and (2) spanning. The standard basis is convenient but not special — any two independent vectors form a valid basis for ℝ². The choice of basis determines the coordinate system.',
        },
      },
      quiz: {
        question: 'How many vectors are in a basis for ℝ²?',
        options: ['1', '2', '3', 'It depends on the vectors'],
        correctIndex: 1,
        explanation:
          'ℝ² is 2-dimensional, so every basis has exactly 2 vectors. This is true regardless of which basis you choose — the number of basis vectors equals the dimension.',
      },
    },

    // ── 8. Building a Custom Basis ──
    {
      id: 'custom-basis',
      title: 'Building a Custom Basis',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'linear-combination',
          vectors: [
            { x: 1, y: 1, color: '#6366f1', label: 'b₁' },
            { x: -1, y: 1, color: '#06b6d4', label: 'b₂' },
          ],
          draggable: true,
          showSliders: true,
          showParallelogram: true,
        },
      },
      content: {
        text: "Any two non-parallel vectors form a valid basis. Here, b₁ = (1,1) and b₂ = (-1,1) are a perfectly good basis — rotated 45° from the standard one. The grid looks different, but you can still reach any point with the right combination.",
        goDeeper: {
          explanation:
            'Non-standard bases are extremely useful. In PCA, the eigenvectors of the covariance matrix form an optimal basis that aligns with the directions of maximum variance. In neural networks, learned representations are essentially learned basis vectors for the data.',
        },
        authorNote:
          "This is a key insight: coordinates are relative to your chosen basis. The same physical vector has different numbers depending on which basis you use. That's what 'change of basis' means.",
      },
      interactionHint: 'Drag the basis vectors to create your own coordinate system. Adjust c₁ and c₂ to explore.',
    },

    // ── 9. Dimension ──
    {
      id: 'dimension',
      title: 'Dimension',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'static',
          vectors: [
            { x: 3, y: 0, color: '#6366f1', label: 'ℝ¹ ➜' },
            { x: 0, y: 3, color: '#06b6d4', label: '↑ ℝ²' },
          ],
        },
      },
      content: {
        text: "The dimension of a vector space is the number of vectors in any basis. ℝ¹ is a line (1 basis vector). ℝ² is a plane (2 basis vectors). ℝ³ needs 3. In AI, word embeddings might live in ℝ³⁰⁰ — 300-dimensional space!",
        goDeeper: {
          math: '\\dim(\\mathbb{R}^n) = n',
          explanation:
            'Dimension is an intrinsic property of the space, not of any particular basis. A remarkable theorem: every basis for a given vector space has the same number of vectors. This number is the dimension.',
        },
      },
      quiz: {
        question: 'If a vector space has a basis of 5 vectors, what is its dimension?',
        options: ['It depends on the vectors', '10', '5', '25'],
        correctIndex: 2,
        explanation:
          'The dimension equals the number of basis vectors. Every basis for the same space has the same count, so 5 basis vectors means dimension 5.',
      },
    },

    // ── 10. Subspaces ──
    {
      id: 'subspaces',
      title: 'Subspaces',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'scalar',
          vectors: [{ x: 2, y: 1, color: '#f59e0b', label: 'subspace' }],
          draggable: true,
          showScalarSlider: true,
          scalarRange: [-3, 3],
        },
      },
      content: {
        text: "A subspace is a vector space living inside a bigger one. This line through the origin is a 1D subspace of ℝ². It contains the zero vector, and any combination of vectors on it stays on it. Not every line is a subspace — only those through the origin.",
        goDeeper: {
          explanation:
            'To verify a subspace: (1) contains the zero vector, (2) closed under addition, (3) closed under scalar multiplication. The null space of a matrix, the column space, and the row space are all fundamental subspaces in linear algebra.',
          references: [
            { title: 'Linear Algebra and Its Applications', author: 'Gilbert Strang', year: 2006 },
          ],
        },
      },
      interactionHint: 'Drag the vector to pick a direction. Slide the scalar — every point stays on this line.',
    },

    // ── 11. Change of Basis ──
    {
      id: 'change-of-basis',
      title: 'Change of Basis',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'linear-combination',
          vectors: [
            { x: 2, y: 1, color: '#6366f1', label: 'b₁' },
            { x: -1, y: 2, color: '#06b6d4', label: 'b₂' },
          ],
          showSliders: true,
          showParallelogram: true,
        },
      },
      content: {
        text: "The same point in space gets different coordinates depending on your basis. In standard coordinates, a point might be (3, 4). In a rotated basis, it could be (2.5, 1.1). The vector hasn't moved — only the description changed.",
        goDeeper: {
          math: '[\\vec{v}]_{\\mathcal{B}} = P^{-1}[\\vec{v}]_\\text{std}',
          explanation:
            'The change-of-basis matrix P has the new basis vectors as columns. To convert from standard coordinates to B-coordinates, multiply by P⁻¹. This is essential in PCA: you rotate your coordinate system to align with the principal components.',
        },
      },
      quiz: {
        question: 'Does changing the basis change the vector itself?',
        options: ['Yes — the vector moves', 'No — only its coordinates change', 'Yes — the vector shrinks or grows', 'Only if the basis is orthogonal'],
        correctIndex: 1,
        explanation:
          'Changing basis is like switching languages. The arrow in space stays put — only the numbers describing it change. This is fundamental to understanding representation learning in AI.',
      },
    },

    // ── 12. Vector Spaces in AI ──
    {
      id: 'ai-connection',
      title: 'Vector Spaces in AI',
      visualization: {
        component: 'VectorTransform',
        props: {
          mode: 'static',
          vectors: [
            { x: 3, y: 2, color: '#6366f1', label: 'king' },
            { x: 1, y: 3, color: '#06b6d4', label: 'queen' },
            { x: 2.5, y: -0.5, color: '#f59e0b', label: 'man' },
            { x: 0.5, y: 0.5, color: '#ef4444', label: 'woman' },
          ],
        },
      },
      content: {
        text: "In AI, everything lives in vector spaces. Words become 300D vectors where king − man + woman ≈ queen. Images are vectors in million-dimensional space. The concepts you just learned — span, basis, independence — are the reason these models work.",
        goDeeper: {
          explanation:
            'Word2Vec: words mapped to ~300D space. Similar meanings = nearby vectors. Transformers: attention operates in high-dimensional vector spaces. CNNs: learned feature spaces where similar images cluster. PCA: finds the best low-dimensional subspace to project data onto. All of deep learning is applied linear algebra in vector spaces.',
          references: [
            { title: 'Efficient Estimation of Word Representations in Vector Space', author: 'Mikolov et al.', year: 2013 },
            { title: 'Attention Is All You Need', author: 'Vaswani et al.', year: 2017 },
          ],
        },
        authorNote:
          "This module bridges pure math and applied AI. Everything from here — eigenvectors, SVD, neural network weights — builds directly on these concepts.",
      },
    },
  ],

  playground: {
    description: 'Explore vector spaces interactively — span, independence, and basis in action.',
    component: 'VectorTransform',
    parameters: [
      { id: 'vectorCount', label: 'Vector count', type: 'stepper', min: 1, max: 4, step: 1, default: 2 },
      { id: 'showGrid', label: 'Show grid', type: 'toggle', default: true },
      { id: 'showCoordinates', label: 'Show coordinates', type: 'toggle', default: true },
      { id: 'showSliders', label: 'Linear combination', type: 'toggle', default: true },
      { id: 'showBasisVectors', label: 'Show basis markers', type: 'toggle', default: false },
      { id: 'showMagnitude', label: 'Show magnitude', type: 'toggle', default: false },
      { id: 'scalarMultiplier', label: 'Scalar multiplier', type: 'slider', min: -3, max: 3, step: 0.1, default: 1 },
    ],
    tryThis: [
      'Make two parallel vectors. What happens to the span?',
      'Can you express (3, 4) as a combination of non-standard basis vectors?',
      'Create three vectors in ℝ². Are they ever independent?',
      'Find a basis where the combination coefficients are both whole numbers for a target point.',
    ],
  },

  challenges: [
    {
      id: 'span-builder',
      title: 'Span Builder',
      description: 'Express the target as a linear combination of the given basis vectors.',
      component: 'VectorTransform',
      completionCriteria: { type: 'threshold', target: 0.2, metric: 'distance_combination_to_target' },
      hints: [
        'Adjust both c₁ and c₂ sliders to combine the basis vectors.',
        'Think about what coefficients would make the combination land on the target.',
      ],
    },
    {
      id: 'independence-check',
      title: 'Independence Check',
      description: 'Drag vector b so it is NOT parallel to vector a — make them independent!',
      component: 'VectorTransform',
      completionCriteria: { type: 'threshold', target: 0.05, metric: 'abs_dot_product' },
      hints: [
        'Two vectors are dependent if they point in the same (or opposite) direction.',
        'Perpendicular vectors are always independent — try making a 90° angle.',
      ],
    },
    {
      id: 'basis-finder',
      title: 'Basis Finder',
      description: 'Drag two vectors to form a basis that makes the target coordinates whole numbers.',
      component: 'VectorTransform',
      completionCriteria: { type: 'threshold', target: 0.3, metric: 'distance_sum_to_target' },
      hints: [
        'The target can be reached by integer combinations of the right basis.',
        'Try making one basis vector point toward the target.',
      ],
    },
  ],
};

export default vectorSpacesModule;
