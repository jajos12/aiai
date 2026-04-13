import { ModuleData } from '../../core/types';

export const moduleData: ModuleData = {
  id: 'numpy-data-and-performance',
  tierId: 0.5,
  clusterId: 'engineering',
  title: 'NumPy Data and Performance',
  description:
    'Build production-grade numerical intuition: shapes, vectorization, broadcasting, and reliable data pipelines.',
  tags: ['NumPy', 'Arrays', 'Engineering'],
  prerequisites: ['python-zero-to-ai-scripting', 'vectors'],
  difficulty: 'beginner',
  estimatedMinutes: 85,
  steps: [
    {
      id: 'ndarray-basics',
      title: 'From Python Lists to ndarrays',
      visualizationProps: { mode: 'array-structure' },
      content: {
        text: "NumPy arrays are fixed-type, contiguous numeric containers designed for high-performance computation. Unlike Python lists, they store data in compact memory layouts that CPUs can process efficiently. This design is the basis for fast ML preprocessing and feature math. At this stage, focus on reading shape and dtype confidently. If you can inspect arrays correctly, you can debug most early NumPy bugs.",
        goDeeper: {
          explanation:
            'An ndarray combines raw memory with metadata (shape, strides, dtype). Shape tells dimensions, dtype tells number format, and strides explain how to move through memory. Together they control performance and correctness.',
        },
      },
      quiz: {
        question: 'Why are NumPy arrays usually faster than Python lists for numeric operations?',
        options: [
          'They are interpreted more slowly',
          'They use contiguous typed memory and optimized native kernels',
          'They automatically use GPU always',
          'They avoid all loops',
        ],
        correctIndex: 1,
        explanation: 'NumPy performance comes from contiguous typed buffers plus optimized C/Fortran operations.',
      },
    },
    {
      id: 'vectorization',
      title: 'Vectorization vs Python Loops',
      visualizationProps: { mode: 'speed-comparison' },
      content: {
        text: "Vectorization means applying one operation to whole arrays at once instead of iterating in Python. This dramatically improves speed and reduces boilerplate code. In AI workflows, vectorization is the default for normalization, scaling, and linear algebra primitives. A reliable engineering habit is: write a loop first only for clarity, then convert to vectorized form. Performance and readability both improve when done well.",
        goDeeper: {
          explanation:
            'Vectorized kernels exploit CPU-level optimization patterns such as SIMD and cache-friendly access. Even when Big-O is unchanged, constant-factor speedups are large in practice. This is why NumPy remains a core dependency in production ML.',
          math: "\\mathbf{C} = \\mathbf{A} + \\mathbf{B} \\quad \\text{vs} \\quad \\forall i, c_i = a_i + b_i",
        },
      },
      quiz: {
        question: 'What is the best first move when optimizing a slow NumPy preprocessing step?',
        options: [
          'Rewrite everything in C immediately',
          'Replace Python element loops with vectorized array operations',
          'Switch to random dtypes',
          'Increase print statements',
        ],
        correctIndex: 1,
        explanation: 'Most beginner performance wins come from vectorization before lower-level rewrites.',
      },
    },
    {
      id: 'broadcasting',
      title: 'Broadcasting and Shape Compatibility',
      visualizationProps: { mode: 'broadcasting-viz' },
      content: {
        text: "Broadcasting lets NumPy perform arithmetic on arrays with different shapes when dimensions are compatible. This is powerful, but it is also where many shape bugs originate. Read shapes from right to left and ensure each pair of dimensions is equal or one of them is 1. If this rule fails, NumPy raises a broadcast error. Learn this rule deeply because it appears everywhere in model input preparation.",
        goDeeper: {
          explanation:
            'Broadcasting avoids manual replication of smaller arrays, reducing memory usage and code complexity. Conceptually, singleton dimensions are stretched virtually, not copied eagerly in most operations.',
        },
      },
      quiz: {
        question: 'Which shape can broadcast with (32, 128)?',
        options: ['(32, 1)', '(16, 128)', '(32, 64)', '(128, 32)'],
        correctIndex: 0,
        explanation: 'Right-aligned dimensions: 32 matches 32, and 1 can expand to 128.',
      },
      interactionHint: "Change the shape of the secondary array to see if it can broadcast.",
    },
    {
      id: 'indexing',
      title: 'Indexing, Slicing, and Boolean Masks',
      visualizationProps: { mode: 'slicing-viz' },
      content: {
        text: "Most data preprocessing time is spent selecting and transforming subsets correctly. NumPy indexing supports row/column slicing, integer indexing, and boolean masks. Boolean masks are especially useful for filtering invalid rows or outliers before training. Be careful: some indexing returns views and others return copies. Knowing which one you got prevents silent mutation bugs.",
        goDeeper: {
          explanation:
            'Basic slices usually return views, while advanced/fancy indexing often returns copies. This difference affects memory and side effects. Reliable workflows explicitly call `.copy()` when mutation safety is needed.',
        },
      },
      quiz: {
        question: 'What is a common use of boolean masks in ML preprocessing?',
        options: [
          'Rendering 3D graphics',
          'Filtering rows that match quality conditions',
          'Converting arrays to tuples',
          'Changing NumPy version',
        ],
        correctIndex: 1,
        explanation: 'Masks are ideal for selecting valid samples based on conditions.',
      },
    },
    {
      id: 'reshape',
      title: 'Reshaping and Axis Semantics',
      visualizationProps: { mode: 'axis-viz' },
      content: {
        text: "Axis semantics are crucial for statistics, normalization, and batching logic. In 2D data, axis 0 usually represents samples and axis 1 features, but you must verify assumptions in each pipeline. Reshaping changes interpretation of the same data buffer when compatible. Misunderstood axes are a top source of wrong model inputs. Always print shapes before and after transforms.",
        goDeeper: {
          explanation:
            'Operations like `sum`, `mean`, and `argmax` behave differently across axes. Shape assertions near key transformations reduce subtle bugs. Engineering teams often treat shape checks as lightweight tests.',
        },
      },
      quiz: {
        question: 'If X has shape (100, 20), what does `X.mean(axis=0)` return?',
        options: ['Shape (100,)', 'Shape (20,)', 'A scalar only', 'Shape (100, 20)'],
        correctIndex: 1,
        explanation: 'Axis 0 reduces across rows (samples), leaving one mean per feature.',
      },
    },
    {
      id: 'numerical-stability',
      title: 'Dtypes and Numerical Stability',
      visualizationProps: { mode: 'dtype-stability' },
      content: {
        text: "Correct dtype choices can make the difference between stable and broken pipelines. Float32 is fast and common for ML, while float64 may be safer for some calculations. Integer division, overflow, and underflow can silently corrupt features. Add explicit casting and sanity checks at boundaries. Stable numerics are part of engineering quality, not advanced theory.",
        goDeeper: {
          explanation:
            'Use epsilon guards for division and log operations (`1e-8` style). Track dtype transitions through preprocessing so model inputs stay consistent. Mixed dtypes can trigger subtle downstream errors.',
        },
      },
      quiz: {
        question: 'Why add a tiny epsilon in divisions like `x / (std + eps)`?',
        options: [
          'To increase randomness',
          'To avoid divide-by-zero instability',
          'To speed up network calls',
          'To change array shape',
        ],
        correctIndex: 1,
        explanation: 'Epsilon prevents numerical blowups when denominators are near zero.',
      },
    },
    {
      id: 'linalg',
      title: 'Linear Algebra Operations in NumPy',
      visualizationProps: { mode: 'dot-product' },
      content: {
        text: "Matrix multiplication and dot products are the numerical core of many ML models. NumPy gives multiple APIs (`dot`, `matmul`, `@`) that behave slightly differently across dimensions. Understanding these differences avoids shape mismatch errors in model code. Keep tensor rank explicit when writing linear algebra-heavy preprocessing. Correct algebraic intent is more important than API memorization.",
        goDeeper: {
          explanation:
            'Use `@`/`matmul` for matrix multiplication semantics and `dot` carefully for rank-dependent behavior. In production, explicit shape annotations and asserts are the safest practice.',
        },
      },
      quiz: {
        question: 'Which operator is the most explicit matrix multiplication syntax in modern Python?',
        options: ['+', '@', '%', ':='],
        correctIndex: 1,
        explanation: '`@` maps directly to matrix multiplication semantics.',
      },
    },
    {
      id: 'project-stage-1',
      title: 'Project Stage 1: Vectorized Cleaning',
      visualizationProps: { mode: 'project-stage', stage: 1 },
      content: {
        text: "Checkpoint 1: convert a row-by-row Python cleaner into a vectorized NumPy pipeline. Build an array from raw data, filter invalid rows with masks, and compute normalized columns. Measure runtime before and after vectorization to see practical impact. This is your first performance-focused engineering checkpoint. Prioritize correctness first, then speed.",
      },
      interactionHint: 'Implement mask-based filtering and compare timing vs loop baseline.',
    },
    {
      id: 'project-stage-2',
      title: 'Project Stage 2: Feature Matrix Builder',
      visualizationProps: { mode: 'project-stage', stage: 2 },
      content: {
        text: "Checkpoint 2: produce a deterministic feature matrix `X` and label vector `y` from cleaned records. Enforce fixed column order and dtype consistency. Add shape assertions and summary logging (`X.shape`, `y.shape`, NaN counts). This mirrors real dataset handoff to training code. Your output should be ready for immediate PyTorch ingestion.",
      },
      interactionHint: 'Verify schema consistency across train and validation samples.',
    },
    {
      id: 'project-stage-3',
      title: 'Project Stage 3: NumPy Mini Model Pipeline',
      visualizationProps: { mode: 'project-stage', stage: 3 },
      content: {
        text: "Capstone stage: implement a small NumPy-based training pipeline (for example linear regression with gradient descent). Use vectorized forward pass, loss computation, gradient step, and metric reporting. This demonstrates that core learning mechanics can be built from numerical primitives. Once complete, PyTorch abstractions become easier to understand. You now have both intuition and implementation muscle.",
      },
      quiz: {
        question: 'What is the strongest signal that your NumPy capstone is reliable?',
        options: [
          'It uses the fewest lines possible',
          'It has fixed output shapes, stable dtypes, and repeatable metrics',
          'It avoids all assertions',
          'It works only on one sample',
        ],
        correctIndex: 1,
        explanation: 'Reliability comes from deterministic schema, stable numerics, and repeatable results.',
      },
    },
  ],
  playground: {
    description: 'Experiment with shape logic, vectorized transforms, and numerical stability checks.',
    parameters: [],
    tryThis: [
      'Create X with shape (128, 16), then compute per-feature mean and std with axis operations.',
      'Broadcast a (16,) vector over X and verify resulting shape.',
      'Filter rows where any value is NaN using boolean masks.',
      'Benchmark loop-based vs vectorized normalization for 100k rows.',
    ],
  },
  challenges: [
    {
      id: 'checkpoint-vectorized-cleaning',
      title: 'Checkpoint 1: Vectorized Cleaner',
      description: 'Convert loop-based cleaning to NumPy mask-based processing with equivalent outputs.',
      props: { stage: 1 },
      completionCriteria: { type: 'threshold', target: 0.95, metric: 'cleaning_equivalence' },
      hints: [
        'Start with baseline loop output, then match it exactly.',
        'Use boolean masks for invalid row filtering.',
        'Benchmark both versions to confirm speedup.',
      ],
    },
    {
      id: 'checkpoint-feature-matrix',
      title: 'Checkpoint 2: Feature Matrix Contract',
      description: 'Build deterministic X/y outputs with strict dtype and shape guarantees.',
      props: { stage: 2 },
      completionCriteria: { type: 'threshold', target: 1, metric: 'shape_and_dtype_contract' },
      hints: [
        'Print and assert final shapes.',
        'Ensure columns stay in fixed order.',
        'Use explicit casts for model-ready dtypes.',
      ],
    },
    {
      id: 'capstone-numpy-mini-model',
      title: 'Capstone: NumPy Mini Training Pipeline',
      description: 'Implement vectorized forward/loss/gradient updates and show decreasing loss across steps.',
      props: { stage: 3 },
      completionCriteria: { type: 'custom', target: 'loss-decreases', metric: 'training_loop_quality' },
      hints: [
        'Keep learning rate small and stable.',
        'Track loss each iteration.',
        'Validate gradients and shapes at each step.',
      ],
    },
  ],
};
