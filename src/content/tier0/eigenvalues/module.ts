import type { Module } from '@/types/curriculum';

const eigenvaluesModule: Module = {
  id: 'eigenvalues',
  tierId: 0,
  clusterId: 'linear-algebra',
  title: 'Eigenvalues & Eigenvectors',
  description:
    'The special directions that survive a transformation — the key to PCA, PageRank, quantum mechanics, and almost everything in modern ML.',
  tags: ['eigenvalues', 'eigenvectors', 'linear-algebra', 'PCA', 'diagonalization'],
  prerequisites: ['vectors', 'vector-spaces', 'matrices'],
  difficulty: 'intermediate',
  estimatedMinutes: 45,
  visualizationComponent: 'EigenTransform',
  steps: [
    // ── 1. What Eigenvectors Are ──
    {
      id: 'what-are-eigenvectors',
      title: 'What Eigenvectors Are',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'animate',
          matrix: { a: 2, b: 1, c: 0, d: 3 },
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showEigenspaceLines: true,
          showAnimation: true,
          showMatrixControls: true,
          showPresets: true,
          highlightEigenDots: true,
          interactive: true,
        },
      },
      content: {
        text: "Enter any matrix and press ▶ Play. Watch 200+ dots transform — the whole grid warps. But dots on the golden and orange lines only slide, they never leave their line. Those stable directions are the eigenvectors. Try different presets: Scale, Shear, Reflect. Every matrix has its own special surviving directions.",
        goDeeper: {
          math: 'A\\vec{v} = \\lambda \\vec{v}',
          explanation: 'An eigenvector v of matrix A is a nonzero vector that, when A is applied, is only scaled by a factor λ (the eigenvalue). The prefix "eigen" is German for "own" or "characteristic" — these are the matrix\'s own directions.',
          references: [
            { title: 'Essence of Linear Algebra Ch. 14', author: '3Blue1Brown', url: 'https://www.youtube.com/watch?v=PFDu9oVAE-g', year: 2016 },
          ],
        },
        authorNote: 'This is the single most important concept in applied linear algebra. Eigenvectors reveal the "natural axes" of a transformation.',
      },
      interactionHint: 'Enter a matrix, press ▶ Play, and watch: glowing dots only slide along their line, never off it.',
    },

    // ── 2. The Equation: Av = λv ──
    {
      id: 'eigenvalue-equation',
      title: 'The Equation: Av = λv',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'eigenvectors-only',
          matrix: { a: 2, b: 1, c: 0, d: 3 },
          showTransformedGrid: true,
          showBasisVectors: true,
          showEigenspaceLines: true,
          showScalingIndicators: true,
          showCharacteristicEq: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
        },
      },
      content: {
        text: "The solid arrows are the eigenvectors. The dashed arrows show where the matrix sends them — same direction, just scaled by λ. Drag the matrix entries or pick presets — eigenvalues and eigenvectors update live. The warped grid shows how everything else deforms while eigenvectors hold firm.",
        goDeeper: {
          math: 'A\\vec{v} = \\lambda \\vec{v} \\iff (A - \\lambda I)\\vec{v} = \\vec{0}',
          explanation: 'Rearranging: (A - λI)v = 0. For a nonzero v to exist, the matrix (A - λI) must be singular — its determinant must be zero. This gives us the characteristic equation.',
        },
      },
      quiz: {
        question: 'What does Av = λv mean geometrically?',
        options: [
          'The vector v doesn\'t change at all',
          'The vector v only gets scaled, not rotated',
          'The vector v gets rotated by angle λ',
          'The vector v becomes the zero vector',
        ],
        correctIndex: 1,
        explanation: 'Av = λv means the matrix A only scales v by λ — it stays on the same line through the origin. The direction is preserved (or flipped if λ < 0).',
      },
      interactionHint: 'Drag the matrix entries — see solid arrows (eigenvectors) and dashed arrows (scaled result) update live.',
    },

    // ── 3. Trace & Determinant from Eigenvalues ──
    {
      id: 'trace-det-eigenvalues',
      title: 'Trace & Determinant from Eigenvalues',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'explore',
          matrix: { a: 3, b: 1, c: 0, d: 2 },
          showTransformedGrid: true,
          showDotCloud: true,
          showEigenspaceLines: true,
          showTraceDetRelation: true,
          showCharacteristicEq: true,
          showDeterminantArea: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
          highlightEigenDots: true,
        },
      },
      content: {
        text: "Two beautiful identities: trace(A) = λ₁ + λ₂, and det(A) = λ₁ × λ₂. Drag any matrix entry and watch the equation panel — the sum and product of eigenvalues ALWAYS match. The green parallelogram shows the determinant area. Try Scale preset: det = λ₁·λ₂ = 2·0.5 = 1.",
        goDeeper: {
          math: '\\text{tr}(A) = \\lambda_1 + \\lambda_2, \\quad \\det(A) = \\lambda_1 \\cdot \\lambda_2',
          explanation: 'These aren\'t coincidences — they follow directly from the characteristic polynomial λ² - tr(A)λ + det(A) = 0. By Vieta\'s formulas, the sum of roots equals the negative of the linear coefficient (which is tr), and the product equals the constant term (det).',
        },
      },
      interactionHint: 'Drag matrix entries — verify: tr(A) always equals λ₁ + λ₂ in the info panel.',
    },

    // ── 4. The Characteristic Equation ──
    {
      id: 'characteristic-equation',
      title: 'The Characteristic Equation',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'characteristic',
          matrix: { a: 2, b: 1, c: 1, d: 3 },
          showTransformedGrid: true,
          showDotCloud: true,
          showCharacteristicEq: true,
          showTraceDetRelation: true,
          showEigenspaceLines: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
          highlightEigenDots: true,
        },
      },
      content: {
        text: "To find eigenvalues, solve det(A - λI) = 0. For 2×2 matrices: λ² - tr(A)λ + det(A) = 0. Drag entries and watch the discriminant: positive → 2 real eigenvalues (golden lines appear), zero → 1 repeated, negative → complex pair (no lines, purple spiral). Try the Rotate preset!",
        goDeeper: {
          math: '\\det(A - \\lambda I) = (a-\\lambda)(d-\\lambda) - bc = \\lambda^2 - (a+d)\\lambda + (ad-bc) = 0',
          explanation: 'The characteristic polynomial always has degree n for an n×n matrix. Its roots are the eigenvalues. For 2×2: use the quadratic formula. For larger matrices: numerical methods like the QR algorithm.',
          references: [
            { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', year: 2015 },
          ],
        },
      },
      quiz: {
        question: 'How many eigenvalues can a 2×2 matrix have?',
        options: ['Exactly 1', 'At most 2 (real), or 2 complex', 'Exactly 2', 'Up to 4'],
        correctIndex: 1,
        explanation: 'The characteristic polynomial is degree 2, so there are at most 2 roots. They can be 2 distinct real, 1 repeated real, or a complex conjugate pair.',
      },
      interactionHint: 'Drag entries to make discriminant negative — eigenvalues become complex, eigenvector lines vanish!',
    },

    // ── 5. Finding Eigenvectors ──
    {
      id: 'finding-eigenvectors',
      title: 'Finding Eigenvectors',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'eigenvectors-only',
          matrix: { a: 4, b: 2, c: 1, d: 3 },
          showTransformedGrid: true,
          showBasisVectors: true,
          showEigenspaceLines: true,
          showScalingIndicators: true,
          showCharacteristicEq: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
        },
      },
      content: {
        text: "Once you know λ, plug it into (A - λI)v = 0. The solutions form a line through the origin — the eigenspace. Enter different matrices to see eigenspaces change direction. Compare the red/blue basis vectors (Ae₁, Ae₂) with the golden/orange eigen-lines: eigenvectors are special precisely because they don't rotate.",
        goDeeper: {
          math: '(A - \\lambda I)\\vec{v} = \\vec{0} \\implies \\text{null space of } (A - \\lambda I)',
          explanation: 'The eigenspace for λ is the null space of (A - λI). For a 2×2 matrix with distinct eigenvalues, each eigenspace is 1-dimensional (a line). Finding the eigenvector means finding any nonzero vector in this null space.',
        },
      },
      interactionHint: 'Change the matrix — notice how eigenvector lines rotate to new directions while basis vectors warp.',
    },

    // ── 6. Watch the Grid Warp ──
    {
      id: 'animate-transformation',
      title: 'Watch the Grid Warp',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'animate',
          matrix: { a: 2, b: 1, c: 0, d: 3 },
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showAnimation: true,
          showEigenspaceLines: true,
          showMatrixControls: true,
          showPresets: true,
          highlightEigenDots: true,
          interactive: true,
        },
      },
      content: {
        text: "This is the showcase. Enter any matrix, press ▶ Play, and watch the grid + 200 dots transform smoothly. The grid lines warp, basis vectors stretch and rotate — but dots on eigenvector lines ONLY slide. Try every preset: Scale (diagonal stretch), Shear (one eigenvector), Rotate 45° (no survivors!), Reflect (flip).",
        goDeeper: {
          explanation: 'The animation interpolates between the identity matrix I and the target matrix A. At time t, you see (1-t)I + tA applied to every point. The eigenvectors of A emerge as the lines that remain straight throughout the entire animation — everything else warps around them.',
        },
        authorNote: 'This is the visualization that makes eigenvalues click. Watch closely: by the time the animation is 50% done, the eigenvectors are already clearly visible as the "stable lines" in the chaos.',
      },
      interactionHint: 'Enter a matrix → press ▶ Play → glowing dots never leave their line. Try all presets!',
    },

    // ── 7. Symmetric Matrices: The Best Kind ──
    {
      id: 'symmetric-matrices',
      title: 'Symmetric Matrices: The Best Kind',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'symmetric',
          matrix: { a: 3, b: 1, c: 1, d: 2 },
          showTransformedGrid: true,
          showDotCloud: true,
          showEigenspaceLines: true,
          showUnitCircle: true,
          showScalingIndicators: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
          symmetricOnly: true,
          highlightEigenDots: true,
        },
      },
      content: {
        text: "Symmetric matrices (A = Aᵀ) are special: eigenvalues are always real, eigenvectors are always perpendicular. Change the matrix entries — b and c stay locked (symmetric!), and the golden/orange lines are always at 90°. The unit circle transforms into an axis-aligned ellipse along the eigenvectors.",
        goDeeper: {
          math: 'A = A^T \\implies \\lambda_i \\in \\mathbb{R}, \\quad \\vec{v}_i \\perp \\vec{v}_j',
          explanation: 'The Spectral Theorem says every real symmetric matrix can be diagonalized by an orthogonal matrix: A = QΛQᵀ. This means you can always find perpendicular eigenvectors. Covariance matrices are symmetric → PCA always works.',
          references: [
            { title: 'Mathematics for Machine Learning', author: 'Deisenroth, Faisal, Ong', url: 'https://mml-book.github.io/', year: 2020 },
          ],
        },
        authorNote: 'If you remember only one theorem from linear algebra, make it this one. Symmetric matrices = real eigenvalues + orthogonal eigenvectors. This is why PCA works.',
      },
      quiz: {
        question: 'Eigenvectors of a symmetric matrix are always...',
        options: ['Parallel', 'Orthogonal (perpendicular)', 'Complex', 'Equal in length'],
        correctIndex: 1,
        explanation: 'The Spectral Theorem guarantees: symmetric matrix → real eigenvalues and orthogonal eigenvectors. This is the foundation of PCA.',
      },
      interactionHint: 'Change entries — eigenvectors always stay perpendicular. That\'s the Spectral Theorem in action.',
    },

    // ── 8. Complex Eigenvalues = Rotation ──
    {
      id: 'complex-eigenvalues',
      title: 'Complex Eigenvalues = Rotation',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'animate',
          matrix: { a: 0, b: -1, c: 1, d: 0 },
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showAnimation: true,
          showEigenspaceLines: true,
          showCharacteristicEq: true,
          showMatrixControls: true,
          showPresets: true,
          highlightEigenDots: true,
          interactive: true,
        },
      },
      content: {
        text: "When eigenvalues are complex (λ = a ± bi), no real eigenvector exists — the matrix rotates everything. Press ▶ Play with this rotation matrix: every dot moves in a circular arc, no line survives. The purple spiral indicates rotation. Now change the matrix to [[2,0],[0,3]] — instantly see eigenvectors appear!",
        goDeeper: {
          math: 'R(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix} \\implies \\lambda = \\cos\\theta \\pm i\\sin\\theta',
          explanation: 'A pure rotation has eigenvalues e^{±iθ}, which are complex. The discriminant of the characteristic equation is negative. No real direction is preserved — everything rotates. This is why rotations "feel" fundamentally different from scalings.',
        },
      },
      quiz: {
        question: 'A rotation matrix has...',
        options: ['Two positive real eigenvalues', 'One eigenvalue of 1', 'Complex eigenvalues', 'Zero as an eigenvalue'],
        correctIndex: 2,
        explanation: 'Rotation matrices have eigenvalues λ = cos(θ) ± i·sin(θ), which are complex (except for θ = 0 or π). No real direction survives a rotation.',
      },
      interactionHint: 'Press ▶ Play — no dots stay on a line. Then change to Scale preset to see eigenvectors reappear.',
    },

    // ── 9. Repeated Eigenvalues ──
    {
      id: 'repeated-eigenvalues',
      title: 'Repeated Eigenvalues',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'animate',
          matrix: { a: 2, b: 0, c: 0, d: 2 },
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showAnimation: true,
          showEigenspaceLines: true,
          showCharacteristicEq: true,
          showMatrixControls: true,
          showPresets: true,
          highlightEigenDots: true,
          interactive: true,
        },
      },
      content: {
        text: "When λ₁ = λ₂ (repeated), things get interesting. This is 2I — press ▶ Play: everything scales uniformly, EVERY direction is an eigenvector! Now enter [[2,1],[0,2]]: same eigenvalue λ=2 twice, but only one eigenvector direction. That's a defective matrix. Watch the animation — it shears, revealing the asymmetry.",
        goDeeper: {
          math: '\\text{Algebraic multiplicity} \\geq \\text{Geometric multiplicity}',
          explanation: 'Algebraic multiplicity = how many times λ appears as a root. Geometric multiplicity = dimension of the eigenspace. When geometric < algebraic, the matrix is "defective" — it can\'t be diagonalized. The matrix [[2,1],[0,2]] is the classic example.',
        },
      },
      quiz: {
        question: 'The matrix [[3,0],[0,3]] has...',
        options: [
          'No eigenvectors',
          'Exactly two eigenvectors',
          'Every nonzero vector is an eigenvector',
          'Only eigenvectors along the axes',
        ],
        correctIndex: 2,
        explanation: 'The matrix 3I scales everything uniformly by 3. Every direction stays on its line, so every nonzero vector is an eigenvector with eigenvalue 3.',
      },
      interactionHint: 'All dots glow — every direction is an eigenvector of 2I. Now enter [[2,1],[0,2]] and see only one line survive.',
    },

    // ── 10. Positive Definite Matrices ──
    {
      id: 'positive-definite',
      title: 'Positive Definite Matrices',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'symmetric',
          matrix: { a: 3, b: 1, c: 1, d: 2 },
          showTransformedGrid: true,
          showDotCloud: true,
          showEigenspaceLines: true,
          showUnitCircle: true,
          showDeterminantArea: true,
          showCharacteristicEq: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
          symmetricOnly: true,
          highlightEigenDots: true,
        },
      },
      content: {
        text: "A symmetric matrix is positive definite when ALL eigenvalues are positive — the transformation only stretches, never flips. The determinant parallelogram stays green. Try to make an eigenvalue negative — the area turns red (orientation flips). In ML, positive definite = 'bowl-shaped' loss surface = gradient descent works.",
        goDeeper: {
          math: 'A \\succ 0 \\iff \\lambda_i > 0 \\; \\forall i \\iff \\vec{x}^T A \\vec{x} > 0 \\; \\forall \\vec{x} \\neq 0',
          explanation: 'Positive definite matrices are the sweet spot: they\'re symmetric, have real positive eigenvalues, and detect the Hessian of strictly convex functions. In optimization, a positive definite Hessian guarantees you\'re at a local minimum.',
        },
      },
      interactionHint: 'Drag entries — try to keep both eigenvalues positive (green area). What happens when one goes negative?',
    },

    // ── 11. Diagonalization: A = PDP⁻¹ ──
    {
      id: 'diagonalization',
      title: 'Diagonalization: A = PDP⁻¹',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'decomposition',
          matrix: { a: 2, b: 1, c: 0, d: 3 },
          showDecomposition: true,
          showEigenspaceLines: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
        },
      },
      content: {
        text: "Every diagonalizable matrix = three simple steps: (1) P⁻¹ rotates to eigenbasis, (2) D scales along axes by eigenvalues, (3) P rotates back. Press 'Next Stage' to see each phase. Enter a different matrix — the decomposition updates live. This is A = PDP⁻¹, the most important factorization in ML.",
        goDeeper: {
          math: 'A = PDP^{-1}, \\quad P = [\\vec{v}_1 \\mid \\vec{v}_2], \\quad D = \\begin{bmatrix} \\lambda_1 & 0 \\\\ 0 & \\lambda_2 \\end{bmatrix}',
          explanation: 'Diagonalization separates the "what directions" (P) from "how much" (D). This makes computing Aⁿ trivial: Aⁿ = PDⁿP⁻¹, where Dⁿ just raises each diagonal to the nth power. This is how we efficiently compute matrix powers, matrix exponentials, and solve differential equations.',
          references: [
            { title: 'Essence of Linear Algebra Ch. 14', author: '3Blue1Brown', url: 'https://www.youtube.com/watch?v=PFDu9oVAE-g', year: 2016 },
          ],
        },
        authorNote: 'The 3-stage animation is the core insight: change basis → trivial scaling → change back. Once you see this, eigendecomposition stops being abstract.',
      },
      interactionHint: 'Press "Next Stage" 3 times: P⁻¹ → D → P. Change the matrix and decompose again!',
    },

    // ── 12. Power Iteration ──
    {
      id: 'power-iteration',
      title: 'Power Iteration',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'power-iteration',
          matrix: { a: 3, b: 1, c: 0, d: 1.5 },
          showPowerIteration: true,
          showTransformedGrid: true,
          showEigenspaceLines: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
        },
      },
      content: {
        text: "Power iteration: start with any random vector, multiply by A, normalize, repeat. Click 'Iterate' — watch the golden arrow swing toward the dominant eigenvector (green dashed line). Usually converges in 5-10 steps. Enter a matrix with widely separated eigenvalues (like [[10,0],[0,1]]) — it converges in 2-3 steps!",
        goDeeper: {
          math: '\\vec{v}_{k+1} = \\frac{A\\vec{v}_k}{\\|A\\vec{v}_k\\|}',
          explanation: 'Why does this work? Write v₀ = c₁v₁ + c₂v₂ in the eigenbasis. Then Aⁿv₀ = c₁λ₁ⁿv₁ + c₂λ₂ⁿv₂. If |λ₁| > |λ₂|, the λ₁ⁿ term dominates, and the vector aligns with v₁. This is literally how Google\'s PageRank was computed.',
          references: [
            { title: 'PageRank: The Algorithm that Powers Google', author: 'Larry Page & Sergey Brin', year: 1998 },
          ],
        },
        authorNote: 'Google was founded on this algorithm. The dominant eigenvector of the web\'s link matrix tells you which pages are most important.',
      },
      quiz: {
        question: 'After many iterations of v → Av/||Av||, the vector converges to...',
        options: [
          'The zero vector',
          'The smallest eigenvector',
          'The dominant eigenvector (largest |λ|)',
          'A random direction',
        ],
        correctIndex: 2,
        explanation: 'Power iteration converges to the eigenvector with the largest absolute eigenvalue, because λ₁ⁿ grows faster than all other λᵢⁿ terms.',
      },
      interactionHint: 'Click "Iterate" repeatedly. Then change the matrix — try [[10,0],[0,1]] for near-instant convergence.',
    },

    // ── 13. Eigenvectors in PCA ──
    {
      id: 'pca-connection',
      title: 'Eigenvectors in PCA',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'pca',
          matrix: { a: 3, b: 1.5, c: 1.5, d: 2 },
          showDotCloud: true,
          showTransformedGrid: true,
          showEigenspaceLines: true,
          showScalingIndicators: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
        },
      },
      content: {
        text: "PCA computes the eigenvectors of the data's covariance matrix. The golden line (first PC) points along maximum variance. The orange line (second PC) is perpendicular. Drag the matrix entries to reshape the data ellipse and watch principal components rotate to follow the longest axis. This is dimensionality reduction in action.",
        goDeeper: {
          math: '\\Sigma = \\frac{1}{n}X^TX, \\quad \\Sigma \\vec{v}_i = \\lambda_i \\vec{v}_i',
          explanation: 'The covariance matrix Σ is symmetric and positive semidefinite, so its eigenvectors are orthogonal (Spectral Theorem). The eigenvalues λᵢ tell you how much variance is captured in each direction. PCA sorts by eigenvalue magnitude: the largest eigenvalue = the most important direction.',
          references: [
            { title: 'Mathematics for Machine Learning Ch. 10', author: 'Deisenroth, Faisal, Ong', url: 'https://mml-book.github.io/', year: 2020 },
          ],
        },
        authorNote: 'When someone says "PCA reduced 1000 features to 50", they mean: find the 50 largest eigenvalues of the covariance matrix and project onto their eigenvectors.',
      },
      quiz: {
        question: 'In PCA, eigenvectors of the covariance matrix point in...',
        options: [
          'Random directions',
          'The directions of maximum variance',
          'The directions of minimum error',
          'The directions of the coordinate axes',
        ],
        correctIndex: 1,
        explanation: 'PCA eigenvectors point in the directions of maximum variance. The first principal component captures the most variance, the second captures the most remaining variance (perpendicular to the first), and so on.',
      },
      interactionHint: 'Drag matrix entries — watch the principal component lines rotate to follow the data cloud\'s longest axis.',
    },

    // ── 14. PageRank: The Billion-Dollar Eigenvector ──
    {
      id: 'pagerank',
      title: 'PageRank: The Billion-Dollar Eigenvector',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'animate',
          matrix: { a: 0.5, b: 0.5, c: 0.3, d: 0.7 },
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showAnimation: true,
          showEigenspaceLines: true,
          showScalingIndicators: true,
          showCharacteristicEq: true,
          showMatrixControls: true,
          showPresets: true,
          highlightEigenDots: true,
          interactive: true,
        },
      },
      content: {
        text: "Google's PageRank: model the web as a stochastic matrix (columns sum ≈ 1). The dominant eigenvector (λ=1) gives every page's importance. Enter [[0.5,0.5],[0.3,0.7]] and press ▶ Play — watch dots converge along the eigenvector. The golden line IS the web's importance ranking. This eigenvector built a $2 trillion company.",
        goDeeper: {
          math: '\\pi = A\\pi, \\quad \\text{where } \\pi \\text{ is the stationary distribution (eigenvector with } \\lambda = 1\\text{)}',
          explanation: 'The web transition matrix is a stochastic matrix (columns sum to 1). By the Perron-Frobenius theorem, it has a dominant eigenvalue of 1, and the corresponding eigenvector gives the steady-state probabilities. Power iteration converges to this eigenvector — that\'s how Google actually computes PageRank.',
        },
        authorNote: 'Larry Page and Sergey Brin literally used power iteration on the web\'s link matrix. The "billion-dollar eigenvector" made every other search engine obsolete overnight.',
      },
      interactionHint: 'Press ▶ Play and watch dots converge. Change the matrix to any stochastic matrix to see how rankings shift.',
    },

    // ── 15. The Full Picture ──
    {
      id: 'full-picture',
      title: 'The Full Picture',
      visualization: {
        component: 'EigenTransform',
        props: {
          mode: 'explore',
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showEigenspaceLines: true,
          showScalingIndicators: true,
          showCharacteristicEq: true,
          showTraceDetRelation: true,
          showDeterminantArea: true,
          showMatrixControls: true,
          showPresets: true,
          interactive: true,
          highlightEigenDots: true,
        },
      },
      content: {
        text: "You now have the full eigenvalue toolkit. Enter any matrix, pick presets, explore freely. Try: a symmetric matrix (perpendicular eigenvectors!), a rotation (complex eigenvalues!), a shear (one eigenvector!), the projection [[1,0],[0,0]] (λ=0 means collapse!). Every concept connects here.",
        goDeeper: {
          explanation: 'Eigenvectors and eigenvalues are the foundation of: PCA (dimensionality reduction), spectral clustering, Google PageRank, quantum mechanics, vibration analysis, stability theory, Markov chains, graph theory, and every neural network that uses a covariance matrix. Master this, and you unlock the rest of ML.',
        },
        authorNote: 'You\'ve covered the same material that takes a full university semester. The difference: you actually SAW it happen. That geometric intuition is worth more than 100 proofs.',
      },
      interactionHint: 'This is your sandbox — enter any matrix, try every preset, break things, build intuition.',
    },
  ],
  playground: {
    description: 'Full EigenTransform playground — explore any 2×2 matrix with grid warp, dot cloud, eigenspaces, decomposition, power iteration, and more. Everything is toggleable.',
    component: 'EigenTransform',
    parameters: [
      { id: 'showDotCloud', label: 'Dot cloud (225 points)', type: 'toggle', default: true },
      { id: 'showTransformedGrid', label: 'Warped grid lines', type: 'toggle', default: true },
      { id: 'showBasisVectors', label: 'Basis vectors (e₁, e₂ → Ae₁, Ae₂)', type: 'toggle', default: true },
      { id: 'showEigenspaceLines', label: 'Glowing eigenspace lines', type: 'toggle', default: true },
      { id: 'showScalingIndicators', label: 'Scaling indicators (λ labels)', type: 'toggle', default: true },
      { id: 'showCharacteristicEq', label: 'Characteristic equation panel', type: 'toggle', default: true },
      { id: 'showTraceDetRelation', label: 'Trace/Det = λ₁+λ₂, λ₁·λ₂', type: 'toggle', default: true },
      { id: 'showDeterminantArea', label: 'Determinant parallelogram', type: 'toggle', default: true },
      { id: 'showUnitCircle', label: 'Unit circle → ellipse', type: 'toggle', default: false },
      { id: 'showAnimation', label: 'Animation controls (▶ Play)', type: 'toggle', default: true },
      { id: 'showPowerIteration', label: 'Power iteration (v → Av)', type: 'toggle', default: false },
      { id: 'showDecomposition', label: 'Decomposition (P⁻¹ → D → P)', type: 'toggle', default: false },
      { id: 'showMatrixControls', label: 'Matrix entry controls', type: 'toggle', default: true },
      { id: 'showPresets', label: 'Preset buttons', type: 'toggle', default: true },
      { id: 'highlightEigenDots', label: 'Highlight dots on eigenspaces', type: 'toggle', default: true },
    ],
    tryThis: [
      'Press ▶ Play with the Rotate preset — eigenvalues go complex, no lines survive!',
      'Toggle "Unit circle" ON with the Symmetric preset — the circle becomes an axis-aligned ellipse.',
      'Set [[2,1],[0,2]] → repeated λ=2 but only ONE eigenvector. That\'s a defective matrix!',
      'Toggle "Power iteration" ON → click Iterate 10 times → watch convergence to dominant eigenvector.',
      'Toggle "Decomposition" ON → step through P⁻¹ → D → P to see eigendecomposition come alive.',
      'Try the Projection preset [[1,0],[0,0]] → one eigenvalue is 0 (collapse!).',
      'Make det(A) negative → the parallelogram turns red (orientation flip!).',
    ],
  },
  challenges: [
    {
      id: 'find-eigenvectors',
      title: 'Find the Eigenvectors',
      description: 'Set the matrix so its eigenvectors align with the directions (1, 1) and (1, -1). The golden and orange lines must point at exactly 45° and -45°.',
      component: 'EigenTransform',
      props: {
        showDotCloud: true,
        showTransformedGrid: true,
        showBasisVectors: true,
        showEigenspaceLines: true,
        showScalingIndicators: true,
        showCharacteristicEq: true,
        showMatrixControls: true,
        showPresets: true,
        showAnimation: true,
        highlightEigenDots: true,
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 0.1, metric: 'eigenvector_angle_error' },
      hints: [
        'The eigenvectors (1,1) and (1,-1) are perpendicular — so the matrix must be symmetric (b = c).',
        'Think: what matrix has eigenvalue λ₁ along (1,1) and λ₂ along (1,-1)? Try A = PDP⁻¹ where P = [[1,1],[1,-1]].',
        'Shortcut: [[a, b],[b, d]] with a=d makes eigenvectors at 45°. Try [[2,1],[1,2]].',
      ],
    },
    {
      id: 'make-rotation',
      title: 'Make It Rotate',
      description: 'Set the matrix so that both eigenvalues are complex — pure rotation, no real eigenvectors exist. The purple spiral should appear and all eigenspace lines should vanish.',
      component: 'EigenTransform',
      props: {
        mode: 'animate',
        showDotCloud: true,
        showTransformedGrid: true,
        showBasisVectors: true,
        showEigenspaceLines: true,
        showCharacteristicEq: true,
        showAnimation: true,
        showMatrixControls: true,
        showPresets: true,
        highlightEigenDots: true,
        interactive: true,
      },
      completionCriteria: { type: 'custom', target: 'complex', metric: 'eigenvalue_type' },
      hints: [
        'The discriminant tr² - 4·det must be negative. That means det > tr²/4.',
        'A rotation matrix works: try [[cos θ, -sin θ], [sin θ, cos θ]]. For 90°: [[0,-1],[1,0]].',
        'Press ▶ Play after setting a rotation — every dot moves in a circular arc!',
      ],
    },
    {
      id: 'positive-definite-challenge',
      title: 'Build Positive Definite',
      description: 'Create a symmetric matrix where BOTH eigenvalues are strictly positive. The determinant area must stay green, the unit circle must become a stretched ellipse (no flips).',
      component: 'EigenTransform',
      props: {
        mode: 'symmetric',
        showDotCloud: true,
        showTransformedGrid: true,
        showBasisVectors: true,
        showEigenspaceLines: true,
        showUnitCircle: true,
        showDeterminantArea: true,
        showCharacteristicEq: true,
        showScalingIndicators: true,
        showMatrixControls: true,
        showPresets: true,
        highlightEigenDots: true,
        interactive: true,
        symmetricOnly: true,
      },
      completionCriteria: { type: 'threshold', target: 0.1, metric: 'min_eigenvalue' },
      hints: [
        'Symmetric means b = c. Positive definite requires: trace > 0 AND det > 0.',
        'Equivalently: both diagonal entries positive and |b| < √(a·d).',
        'Try [[3,1],[1,3]] → eigenvalues are 4 and 2, both positive! The area stays green.',
      ],
    },
    {
      id: 'fast-convergence',
      title: 'Power Iteration Speedrun',
      description: 'Set a matrix where power iteration converges in ≤ 3 clicks. You need |λ₁/λ₂| > 5 — a huge gap between eigenvalues makes convergence nearly instant.',
      component: 'EigenTransform',
      props: {
        mode: 'power-iteration',
        showPowerIteration: true,
        showDotCloud: true,
        showTransformedGrid: true,
        showBasisVectors: true,
        showEigenspaceLines: true,
        showScalingIndicators: true,
        showCharacteristicEq: true,
        showMatrixControls: true,
        showPresets: true,
        highlightEigenDots: true,
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 5, metric: 'eigenvalue_ratio' },
      hints: [
        'The larger the ratio |λ₁/λ₂|, the faster convergence. You need ratio > 5.',
        'Diagonal matrices make it easy: [[10,0],[0,1]] has ratio 10:1 → converges in 2 clicks.',
        'Non-diagonal works too: [[6,1],[0,1]] has eigenvalues 6 and 1 → ratio 6:1.',
      ],
    },
  ],
};

export default eigenvaluesModule;

