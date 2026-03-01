import type { ModuleData } from '@/core/types';

const matricesModule: ModuleData = {
  id: 'matrices',
  tierId: 0,
  clusterId: 'linear-algebra',
  title: 'Matrices',
  description:
    'The operators that transform space — rotations, scalings, reflections — and the algebra that governs them.',
  tags: ['matrices', 'linear-algebra', 'transformations'],
  prerequisites: ['vectors'],
  difficulty: 'beginner',
  estimatedMinutes: 35,
  steps: [
    {
      id: 'what-is-a-matrix',
      title: 'What Is a Matrix?',
      visualizationProps: {
        mode: 'identity',
        interactive: false,
      },
      content: {
        text: "A matrix is a grid of numbers that encodes a transformation of space. This 2×2 identity matrix does nothing — every point stays where it is. Watch the grid: it's perfectly aligned.",
        goDeeper: {
          math: 'I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}',
          explanation: 'The identity matrix I maps every vector to itself: Iv = v. It\'s the "do nothing" transformation, analogous to multiplying by 1.',
          references: [
            { title: 'Essence of Linear Algebra', author: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra', year: 2016 },
          ],
        },
      },
    },
    {
      id: 'matrix-as-transform',
      title: 'A Matrix Is a Transformation',
      visualizationProps: {
        mode: 'scale',
        showTransformedGrid: true,
        showUnitCircle: true,
        showTransformedCircle: true,
      },
      content: {
        text: "Every 2×2 matrix transforms the entire plane. Look at the faint grid lines — they show the original coordinate system. The solid indigo lines show where the matrix sends them. The unit circle stretches into an ellipse.",
        goDeeper: {
          math: 'T(\vec{v}) = A\vec{v} = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} ax + by \\\\ cx + dy \\end{bmatrix}',
          explanation: 'A linear transformation maps vectors via matrix-vector multiplication. The key property: T(αu + βv) = αT(u) + βT(v). Linearity means grid lines stay evenly spaced and parallel after transformation.',
        },
      },
      interactionHint: 'Notice how the grid lines remain straight — that\'s the defining property of a linear transformation.',
    },
    {
      id: 'basis-vectors',
      title: 'Where Do the Basis Vectors Go?',
      visualizationProps: {
        mode: 'custom',
        interactive: true,
        showBasisVectors: true,
        showTransformedBasis: true,
      },
      content: {
        text: "The columns of the matrix tell you where the basis vectors land. Column 1 (red) = where î goes. Column 2 (blue) = where ĵ goes. Drag the red and blue handles to define your own transformation!",
        goDeeper: {
          math: 'A = \\begin{bmatrix} | & | \\\\ A\\hat{e}_1 & A\\hat{e}_2 \\\\ | & | \\end{bmatrix}',
          explanation: 'To build any matrix, just decide where you want the standard basis vectors (î and ĵ) to end up. Those destinations become the columns. This is the single most important insight about matrices.',
        },
        authorNote: 'This is the 3Blue1Brown insight. Once you see matrices as "where do the basis vectors go?", everything clicks.',
      },
      interactionHint: 'Drag the red and blue dots to reshape the transformation!',
    },
    {
      id: 'scaling',
      title: 'Scaling',
      visualizationProps: {
        mode: 'scale',
        interactive: true,
        showTransformedCircle: true,
        showUnitCircle: true,
      },
      content: {
        text: "A diagonal matrix scales the x and y axes independently. Try dragging the red dot horizontally and the blue dot vertically to see pure scaling in action.",
        goDeeper: {
          math: 'S = \\begin{bmatrix} s_x & 0 \\\\ 0 & s_y \\end{bmatrix}',
          explanation: 'When the off-diagonal entries are zero, x and y are scaled independently. If sx = sy, it\'s a uniform scaling. If either is negative, the axis is reflected.',
        },
      },
      quiz: {
        question: 'What matrix scales x by 3 and y by 0.5?',
        options: ['[[3, 0], [0, 0.5]]', '[[0.5, 0], [0, 3]]', '[[3, 0.5], [0, 0]]', '[[1, 3], [0.5, 1]]'],
        correctIndex: 0,
        explanation: 'Diagonal entries are the scale factors: sx on top-left, sy on bottom-right.',
      },
    },
    {
      id: 'rotation',
      title: 'Rotation',
      visualizationProps: {
        mode: 'rotation',
        showUnitCircle: true,
        showTransformedCircle: true,
      },
      content: {
        text: "A rotation matrix spins the entire plane around the origin. The unit circle stays a circle (its radius doesn't change). Notice how both basis vectors rotate by the same angle θ.",
        goDeeper: {
          math: 'R(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}',
          explanation: 'Rotation preserves both lengths and angles. The determinant is always 1. The columns are orthonormal: they\'re perpendicular unit vectors. This is what makes rotation special among all transformations.',
          references: [
            { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', year: 2015 },
          ],
        },
      },
      quiz: {
        question: 'What is the determinant of any rotation matrix?',
        options: ['0', '1', '-1', 'It depends on θ'],
        correctIndex: 1,
        explanation: 'det(R) = cos²θ + sin²θ = 1 always. Rotations preserve area and orientation.',
      },
    },
    {
      id: 'shear',
      title: 'Shearing',
      visualizationProps: {
        mode: 'shear',
        interactive: true,
        showTransformedGrid: true,
      },
      content: {
        text: "A shear slides one axis along the other. The x-axis stays fixed, but each horizontal line slides by an amount proportional to its height. Think of pushing the top of a deck of cards.",
        goDeeper: {
          math: 'H = \\begin{bmatrix} 1 & k \\\\ 0 & 1 \\end{bmatrix}',
          explanation: 'Shearing preserves area (det = 1) but not angles. The non-zero off-diagonal element k controls the lean. Horizontal shear uses the top-right entry; vertical shear uses the bottom-left.',
        },
      },
    },
    {
      id: 'reflection',
      title: 'Reflection',
      visualizationProps: {
        mode: 'reflection',
        showTransformedGrid: true,
        showBasisVectors: true,
        showTransformedBasis: true,
      },
      content: {
        text: "This matrix reflects across the x-axis. Notice the blue basis vector flips downward while red stays put. The grid 'flips' — the orientation is reversed.",
        goDeeper: {
          math: 'M = \\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}',
          explanation: 'Reflections have determinant -1. The negative sign means orientation flips — clockwise becomes counterclockwise. You can reflect across any line through the origin by choosing the right matrix.',
        },
      },
      quiz: {
        question: 'What is the determinant of a reflection matrix?',
        options: ['0', '1', '-1', '2'],
        correctIndex: 2,
        explanation: 'Reflections flip orientation, so the determinant is always -1. The sign of the determinant tells you whether the transformation preserves or reverses orientation.',
      },
    },
    {
      id: 'determinant',
      title: 'The Determinant',
      visualizationProps: {
        mode: 'determinant',
        interactive: true,
        showDeterminant: true,
      },
      content: {
        text: "The determinant measures how much a matrix scales area. The green parallelogram shows the image of the unit square. Drag the basis vectors and watch the parallelogram area change — that area IS the determinant.",
        goDeeper: {
          math: '\\det(A) = ad - bc',
          explanation: 'Positive det → orientation preserved. Negative det → orientation flipped. Zero det → the matrix squishes space into a lower dimension (a line or a point). The absolute value |det| is the area scaling factor.',
          references: [
            { title: 'Essence of Linear Algebra Ch. 6', author: '3Blue1Brown', url: 'https://www.youtube.com/watch?v=Ip3X9LOh2dk', year: 2016 },
          ],
        },
        authorNote: 'The determinant is one of those things that seems random until you see the area interpretation. Then it becomes completely intuitive.',
      },
      interactionHint: 'Drag the basis vectors to make the area zero — that\'s when the matrix is singular!',
    },
    {
      id: 'matrix-multiplication',
      title: 'Matrix Multiplication = Composition',
      visualizationProps: {
        mode: 'compose',
        showComposition: true,
        secondMatrix: { a: 0, b: -1, c: 1, d: 0 },
        showTransformedGrid: true,
      },
      content: {
        text: "Multiplying two matrices gives you a single matrix that performs both transformations in sequence. The orange/purple arrows show where the composed transformation BA sends the basis vectors.",
        goDeeper: {
          math: '(BA)\\vec{v} = B(A\\vec{v})',
          explanation: 'Matrix multiplication is associative but NOT commutative: AB ≠ BA in general. Think of it as applying A first, then B. The order matters! This is why we read matrix products right-to-left.',
        },
      },
      quiz: {
        question: 'Is matrix multiplication commutative (AB = BA in general)?',
        options: ['Yes, always', 'No, order matters', 'Only for square matrices', 'Only for diagonal matrices'],
        correctIndex: 1,
        explanation: 'AB ≠ BA in general. A rotation then a shear gives a different result than a shear then a rotation.',
      },
    },
    {
      id: 'inverse',
      title: 'The Inverse Matrix',
      visualizationProps: {
        mode: 'inverse',
        interactive: true,
        showInverse: true,
      },
      content: {
        text: "The inverse matrix A⁻¹ undoes the transformation. The purple dashed arrows show where A⁻¹ sends the basis vectors — it's the reverse mapping. If you compose A with A⁻¹, you get the identity.",
        goDeeper: {
          math: 'A^{-1} = \\frac{1}{\\det(A)} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}',
          explanation: 'A matrix is invertible if and only if its determinant is non-zero. When det(A) = 0, the matrix squishes space into a lower dimension — you can\'t undo that. In ML, non-invertible matrices cause numerical instability.',
        },
        authorNote: 'Try making the determinant zero by lining up the basis vectors. The inverse display will show "singular!" — there\'s no going back.',
      },
      interactionHint: 'Try to make the matrix singular (non-invertible) by aligning the basis vectors.',
    },
  ],
  playground: {
    description: 'Full MatrixTransform playground — drag basis vectors to define any 2×2 matrix.',
    parameters: [
      { id: 'showGrid', label: 'Show original grid', type: 'toggle', default: true },
      { id: 'showTransformedGrid', label: 'Show transformed grid', type: 'toggle', default: true },
      { id: 'showBasisVectors', label: 'Show original basis', type: 'toggle', default: true },
      { id: 'showTransformedBasis', label: 'Show transformed basis', type: 'toggle', default: true },
      { id: 'showDeterminant', label: 'Show determinant', type: 'toggle', default: false },
      { id: 'showEigenvectors', label: 'Show eigenvectors', type: 'toggle', default: false },
      { id: 'showUnitCircle', label: 'Show unit circle', type: 'toggle', default: false },
      { id: 'showTransformedCircle', label: 'Show transformed circle', type: 'toggle', default: false },
      { id: 'showInverse', label: 'Show inverse', type: 'toggle', default: false },
    ],
    tryThis: [
      'Make a rotation: keep both basis vectors on the unit circle.',
      'Make the determinant zero — what happens to the grid?',
      'Find a matrix with eigenvectors along x and y axes.',
      'Create a pure reflection across the line y = x.',
    ],
  },
  challenges: [
    {
      id: 'make-rotation',
      title: 'Pure Rotation',
      description: 'Set up a 90° counter-clockwise rotation matrix.',
      props: { mode: 'custom', interactive: true },
      completionCriteria: { type: 'threshold', target: 0.15, metric: 'distance_to_rotation_90' },
      hints: [
        'Cos(90°) = 0, Sin(90°) = 1.',
        'Column 1 should be (0, 1). Column 2 should be (-1, 0).',
      ],
    },
    {
      id: 'zero-determinant',
      title: 'Collapse to a Line',
      description: 'Make the determinant exactly zero — squish 2D space into a line.',
      props: { mode: 'custom', interactive: true, showDeterminant: true },
      completionCriteria: { type: 'threshold', target: 0.05, metric: 'abs_determinant' },
      hints: [
        'det(A) = ad - bc. Make one column a scalar multiple of the other.',
        'Try making both columns point in the same direction.',
      ],
    },
    {
      id: 'double-area',
      title: 'Double the Area',
      description: 'Make a matrix with determinant exactly 2.',
      props: { mode: 'custom', interactive: true, showDeterminant: true },
      completionCriteria: { type: 'threshold', target: 0.1, metric: 'distance_det_to_2' },
      hints: [
        'det = ad - bc. The simplest: [[2,0],[0,1]].',
        'Any matrix where ad - bc = 2 works!',
      ],
    },
  ],
};

export default matricesModule;
