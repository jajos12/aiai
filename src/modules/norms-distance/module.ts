import type { ModuleData } from '@/core/types';

const normsDistanceModule: ModuleData = {
  id: 'norms-distance',
  tierId: 0,
  clusterId: 'linear-algebra',
  title: 'Norms & Distance Metrics',
  description:
    'Measure length, distance, and similarity with L1, L2, L_inf, and cosine. These geometric choices quietly shape how machine learning behaves.',
  tags: ['norms', 'distance', 'similarity', 'embeddings'],
  prerequisites: ['vectors'],
  difficulty: 'beginner',
  estimatedMinutes: 40,
  steps: [
    {
      id: 'one-vector-many-lengths',
      title: 'One Vector, Many Lengths',
      visualizationProps: {
        manimSrc: '/tier0-manim/Lesson09_NormDotProduct.mp4',
        manimTitle: 'Lesson 09 · Norm and Dot Product',
        mode: 'norm',
        vector: { x: 3, y: 2 },
        showUnitBall: true,
        compareMetrics: true,
        interactive: true,
      },
      content: {
        text: 'Length is not a single universal thing. The same vector can have different lengths depending on the rule you choose. The L in L1, L2, and L_inf names a family of length rules called norms. L2 is the usual straight-line length, L1 adds horizontal and vertical travel, and L_inf only cares about the biggest coordinate.',
        goDeeper: {
          math: '\\|v\\|_1 = \\sum_i |v_i|, \\quad \\|v\\|_2 = \\sqrt{\\sum_i v_i^2}, \\quad \\|v\\|_\\infty = \\max_i |v_i|',
          explanation:
            'A norm is any function that behaves like a notion of size: it is nonnegative, scales linearly, and satisfies the triangle inequality. Read L1 as "ell one," L2 as "ell two," and L_inf as "ell infinity." They are different members of the same norm family, each emphasizing different geometry.',
        },
      },
      interactionHint: 'Drag the vector tip and watch all three lengths update.',
    },
    {
      id: 'unit-balls-change-shape',
      title: 'Unit Balls Change Shape',
      visualizationProps: {
        mode: 'norm',
        vector: { x: 1.7, y: 1.1 },
        showUnitBall: true,
        compareMetrics: true,
        interactive: true,
      },
      content: {
        text: 'The set of points with length 1 is called the unit ball. In L2 it is a circle. In L1 it becomes a diamond. In L_inf it becomes a square. The shape tells you what the metric thinks counts as equally far.',
        goDeeper: {
          explanation:
            'Unit balls are a fast way to build intuition for a metric. Smooth circles mean Euclidean geometry, diamonds reward axis-aligned movement, and squares treat any direction with the same maximum coordinate as equally far.',
        },
      },
      quiz: {
        question: 'Which norm has a square-shaped unit ball in 2D?',
        options: ['L1', 'L2', 'L_inf', 'Cosine'],
        correctIndex: 2,
        explanation:
          'L_inf measures distance by the largest coordinate difference, so its unit ball is a square aligned to the axes.',
      },
    },
    {
      id: 'distance-depends-on-the-metric',
      title: 'Distance Depends on the Metric',
      visualizationProps: {
        mode: 'distance',
        pointA: { x: -2.5, y: -1.2 },
        pointB: { x: 2.1, y: 1.8 },
        compareMetrics: true,
        interactive: true,
      },
      content: {
        text: 'Distance between two points is just the norm of their difference. Change the norm, and the distance changes. Straight-line distance, taxicab distance, and max-step distance can disagree even when the points stay fixed.',
        goDeeper: {
          math: 'd(x, y) = \\|x - y\\|',
          explanation:
            'A metric turns point differences into a notion of distance. This simple definition drives nearest-neighbor search, clustering, and optimization geometry.',
        },
      },
      interactionHint: 'Drag either point to compare L1, L2, and L_inf in real time.',
    },
    {
      id: 'neighborhoods-have-geometry',
      title: 'Neighborhoods Have Geometry',
      visualizationProps: {
        mode: 'distance',
        metric: 'l1',
        pointA: { x: 0, y: 0 },
        pointB: { x: 1.5, y: 0.8 },
        showNeighborhood: true,
        neighborhoodRadius: 2,
        interactive: true,
      },
      content: {
        text: 'A neighborhood means "all points within radius r." But radius r traces a different boundary in each metric. Under L1, the boundary is a diamond. Under L2, a circle. Under L_inf, a square. That geometry decides who counts as nearby.',
        goDeeper: {
          explanation:
            'Many ML algorithms are really neighborhood algorithms in disguise. The chosen metric changes which points are inside the same local region.',
        },
      },
      interactionHint: 'Move the point and see whether it stays inside the highlighted neighborhood.',
    },
    {
      id: 'nearest-neighbor-can-flip',
      title: 'Nearest Neighbor Can Flip',
      visualizationProps: {
        mode: 'nearest',
        metric: 'l2',
        preset: 'metric-flip',
        query: { x: 0.1, y: 0.1 },
        compareMetrics: true,
        showNearest: true,
        showNeighborhood: true,
        interactive: true,
      },
      content: {
        text: 'Nearest is not an absolute fact. It depends on the metric. A point that wins under L2 can lose under L1 because the geometry of the unit ball changes what "close" means.',
        goDeeper: {
          explanation:
            'This matters for k-nearest neighbors, retrieval systems, and embedding search. A metric is not just a formula; it is a modeling assumption.',
        },
      },
      quiz: {
        question: 'If you change the metric in nearest-neighbor search, what can change?',
        options: [
          'Only the scale of the distances',
          'The identity of the nearest point',
          'Nothing important',
          'Only the labels on the axes',
        ],
        correctIndex: 1,
        explanation:
          'Different metrics can rank candidate points differently, so the nearest point itself can change.',
      },
    },
    {
      id: 'cosine-is-about-angle',
      title: 'Cosine Is About Angle',
      visualizationProps: {
        mode: 'cosine',
        vector: { x: 3.2, y: 1.1 },
        otherVector: { x: 1.6, y: 2.8 },
        showProjection: true,
        interactive: true,
      },
      content: {
        text: 'Cosine similarity does not care much about raw length. It asks whether two vectors point in the same direction. Same direction means near 1, perpendicular means 0, opposite means -1.',
        goDeeper: {
          math: '\\cos(\\theta) = \\frac{a \\cdot b}{\\|a\\|_2 \\|b\\|_2}',
          explanation:
            'Cosine similarity normalizes away magnitude before comparing orientation. That is why it is so common in text embeddings and recommendation systems.',
        },
      },
      interactionHint: 'Drag either vector and watch the angle and cosine similarity change together.',
    },
    {
      id: 'same-direction-different-scale',
      title: 'Same Direction, Different Scale',
      visualizationProps: {
        mode: 'cosine',
        vector: { x: 4, y: 2 },
        otherVector: { x: 2, y: 1 },
        showProjection: false,
        interactive: true,
      },
      content: {
        text: 'These two vectors have different magnitudes but exactly the same direction, so cosine similarity is 1. This is why cosine can say two embeddings are very similar even if one has a much larger raw norm.',
        goDeeper: {
          explanation:
            'Magnitude can still matter in some models, but cosine is often the better measure when direction carries the meaning and scale is a distraction.',
        },
      },
      quiz: {
        question: 'Two vectors point in the same direction but have different lengths. Their cosine similarity is:',
        options: ['0', '1', '-1', 'It depends on the longer vector'],
        correctIndex: 1,
        explanation:
          'Cosine similarity depends on angle, not raw size. Same direction means angle 0, and cos(0) = 1.',
      },
    },
    {
      id: 'why-ml-cares',
      title: 'Why Machine Learning Cares',
      visualizationProps: {
        mode: 'nearest',
        metric: 'l2',
        preset: 'clusters',
        query: { x: 1.4, y: 1.1 },
        showNearest: true,
        showNeighborhood: true,
        interactive: true,
      },
      content: {
        text: 'Feature scaling, retrieval, clustering, embeddings, and regularization all hide metric choices inside them. The moment you choose a norm or similarity measure, you choose a geometry for your model.',
        goDeeper: {
          explanation:
            'L2 shows up in Euclidean distance and weight decay. L1 shows up in sparse regularization. Cosine shows up in embedding retrieval. Good ML often starts with choosing the right geometry.',
        },
        authorNote:
          'This module is less about memorizing formulas and more about learning to ask: what notion of closeness is this model using?',
      },
    },
  ],
  playground: {
    description:
      'Explore norms, neighborhoods, nearest neighbors, and cosine similarity with all the main controls exposed.',
    parameters: [
      { id: 'mode', label: 'Mode', type: 'select', default: 'norm', options: ['norm', 'distance', 'nearest', 'cosine'] },
      { id: 'metric', label: 'Metric', type: 'select', default: 'l2', options: ['l1', 'l2', 'linf'] },
      { id: 'preset', label: 'Point preset', type: 'select', default: 'clusters', options: ['clusters', 'metric-flip'] },
      { id: 'compareMetrics', label: 'Compare all metrics', type: 'toggle', default: false },
      { id: 'showUnitBall', label: 'Show unit ball', type: 'toggle', default: true },
      { id: 'showNeighborhood', label: 'Show neighborhood', type: 'toggle', default: true },
      { id: 'showProjection', label: 'Show cosine projection', type: 'toggle', default: true },
      { id: 'neighborhoodRadius', label: 'Neighborhood radius', type: 'slider', min: 0.5, max: 3.5, step: 0.1, default: 2 },
      { id: 'vectorX', label: 'Vector x', type: 'slider', min: -4, max: 4, step: 0.1, default: 3 },
      { id: 'vectorY', label: 'Vector y', type: 'slider', min: -4, max: 4, step: 0.1, default: 2 },
      { id: 'otherVectorX', label: 'Other vector x', type: 'slider', min: -4, max: 4, step: 0.1, default: 1.5 },
      { id: 'otherVectorY', label: 'Other vector y', type: 'slider', min: -4, max: 4, step: 0.1, default: 2.5 },
      { id: 'queryX', label: 'Query x', type: 'slider', min: -4, max: 4, step: 0.1, default: 0.2 },
      { id: 'queryY', label: 'Query y', type: 'slider', min: -4, max: 4, step: 0.1, default: 0.1 },
    ],
    tryThis: [
      'Switch from L2 to L1 in nearest mode. Does the winner change?',
      'In norm mode, drag the vector so L1 and L_inf are equal. What shape forces that?',
      'In cosine mode, scale one vector up and down. Why does cosine barely care?',
      'Turn off compare mode and focus on one metric at a time. What geometry does it reward?',
    ],
  },
  challenges: [
    {
      id: 'taxicab-four',
      title: 'Taxicab Four',
      description: 'Drag the vector until its L1 norm is exactly 4.',
      props: {
        mode: 'norm',
        metric: 'l1',
        vector: { x: 2.4, y: 1.1 },
        showUnitBall: true,
        targetNorm: 4,
      },
      completionCriteria: { type: 'threshold', target: 0.08, metric: 'abs_l1_norm_error' },
      hints: [
        'L1 norm is the sum of absolute coordinate values.',
        'Any point on the diamond with radius 4 works.',
      ],
    },
    {
      id: 'find-b2',
      title: 'Find B2',
      description: 'Move the query until B2 becomes the nearest neighbor under L2 distance.',
      props: {
        mode: 'nearest',
        metric: 'l2',
        preset: 'clusters',
        query: { x: 0, y: 0 },
        showNearest: true,
        showNeighborhood: true,
        targetId: 'b2',
      },
      completionCriteria: { type: 'threshold', target: 0, metric: 'nearest_point_matches_target' },
      hints: [
        'B2 sits in the upper-right cluster.',
        'Think about moving the query toward B2 while keeping it closer to B2 than to nearby neighbors.',
      ],
    },
    {
      id: 'right-angle-similarity',
      title: 'Right Angle Similarity',
      description: 'Drag the second vector until cosine similarity is almost zero.',
      props: {
        mode: 'cosine',
        vector: { x: 3, y: 1 },
        otherVector: { x: 2.5, y: 1.6 },
        showProjection: true,
      },
      completionCriteria: { type: 'threshold', target: 0.05, metric: 'abs_cosine_similarity' },
      hints: [
        'Cosine similarity is zero when the vectors are perpendicular.',
        'Watch the angle arc. You want it as close to 90 degrees as possible.',
      ],
    },
  ],
};

export default normsDistanceModule;
