import type { ModuleData } from '@/core/types';

const optimizationModule: ModuleData = {
  id: 'optimization',
  tierId: 0,
  clusterId: 'optimization',
  title: 'Optimization & Gradient Descent',
  description:
    'From slopes to Adam — build a deep understanding of calculus and gradient descent from first principles. Every formula earns its visual.',
  tags: ['gradient-descent', 'calculus', 'derivatives', 'loss-function', 'adam', 'SGD'],
  prerequisites: ['vectors', 'matrices'],
  difficulty: 'intermediate',
  estimatedMinutes: 60,

  steps: [
    // ─────────────────────────────────────────────────────────────
    // Step 1: Loss function as terrain
    // ─────────────────────────────────────────────────────────────
    {
      id: 'what-is-loss',
      title: 'What Is a Loss Function?',
      visualizationProps: {
        component: 'LossLandscape3D',
        landscape: 'bowl',
        showHeatmap: true,
        showContours: true,
        interactive: true,
      },
      content: {
        text: "A loss function is a terrain. Every point on it represents a model with different weights — its height tells you how wrong that model is. Low = good. High = bad. Orbit this bowl-shaped surface: the minimum at the center is the perfect model. Training's only job is to find the bottom.",
        goDeeper: {
          math: 'L(\\theta) = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - f_\\theta(x_i))^2',
          explanation: "L(θ) maps model parameters θ to a scalar measuring prediction error. For MSE loss, it's the average squared difference between predictions and targets. The surface you see is L plotted over 2D parameter space (θ₁, θ₂).",
        },
      },
      interactionHint: 'Orbit the terrain — drag to rotate, scroll to zoom. The lowest point on the surface is the model minimum.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 2: Slopes & rates of change (1D warm-up)
    // ─────────────────────────────────────────────────────────────
    {
      id: 'slopes-and-rates',
      title: 'Slopes & Rates of Change',
      visualizationProps: {
        component: 'SlopeExplorer',
        showRiseRun: true,
        showSlopeNumber: true,
        curve: 'parabola',
      },
      content: {
        text: "Before we tackle 3D surfaces, let's build intuition for slope in 1D. Drag the point along this curve. Watch the rise/run triangle update — slope = rise ÷ run. A steep hill has a large slope number. A flat section has slope near 0. At the very bottom of a curve, slope = 0 exactly. That's our target.",
        goDeeper: {
          math: 'slope = \\frac{\\Delta y}{\\Delta x} = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}',
          explanation: "Slope measures how much f changes per unit change in x. A positive slope means the function is increasing; negative means decreasing. At a minimum, the curve is flat — slope is precisely 0. This is the key insight gradient descent exploits.",
        },
      },
      quiz: {
        question: 'At the lowest point of a U-shaped curve, what is the slope?',
        options: ['A large positive number', 'A large negative number', 'Exactly 0', 'Undefined'],
        correctIndex: 2,
        explanation: "At any minimum (or maximum), the curve is momentarily flat. The tangent line is horizontal, so slope = 0. This is why finding where ∇L = 0 is equivalent to finding the minimum.",
      },
      interactionHint: 'Drag the orange point along the curve — watch the slope number and rise/run triangle.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 3: The derivative — limit definition
    // ─────────────────────────────────────────────────────────────
    {
      id: 'derivative-limit',
      title: 'The Derivative: From Chord to Tangent',
      visualizationProps: {
        component: 'DerivativeExplorer',
        curve: 'bumpy',
        showTangent: true,
        showSecant: true,
        showHSlider: true,
        showDerivativeValue: true,
      },
      content: {
        text: "The derivative is the slope at a single point — but a point has no width, so how do we compute it? We shrink a chord between two points until the gap h → 0. Drag the h slider toward zero and watch the chord become the tangent line. The slope that remains is f'(x), the derivative.",
        goDeeper: {
          math: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
          explanation: "This is the formal definition. We measure the slope between x and x+h, then let h shrink to zero. In practice, neural networks use automatic differentiation (autograd) to compute this exactly and efficiently for millions of parameters simultaneously.",
        },
      },
      interactionHint: 'Drag the blue point to move along the curve. Drag the h slider toward 0 to see the secant become a tangent.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 4: 1D gradient descent — local compass
    // ─────────────────────────────────────────────────────────────
    {
      id: 'descent-1d',
      title: '1D Descent: The Derivative as a Compass',
      visualizationProps: {
        component: 'DerivativeExplorer',
        curve: 'bumpy',
        showTangent: true,
        showDerivativeValue: true,
        showDescentAnimation: true,
        show1DDescentControls: true,
      },
      content: {
        text: "You don't need to see the whole curve to walk downhill — you only need to know the slope where you stand. If f'(x) > 0, you're on an uphill slope, so step left. If f'(x) < 0, step right. This is exactly one dimension of gradient descent. Press ▶ to animate it.",
        goDeeper: {
          math: 'x_{t+1} = x_t - \\eta \\cdot f\'(x_t)',
          explanation: "η (eta) is the learning rate — how big each step is. Too small: slow convergence. Too large: overshoot the minimum and diverge. This 1D rule is the exact template for the n-dimensional case: negate the derivative, scale by η, step.",
        },
      },
      interactionHint: 'Click any point on the curve to start there, then press ▶ Play. Try the LR slider to see how step size changes.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 5: Partial derivatives — slicing the 3D surface
    // ─────────────────────────────────────────────────────────────
    {
      id: 'partial-derivatives',
      title: 'Partial Derivatives: Slicing the Surface',
      visualizationProps: {
        component: 'PartialDerivativeSlicer',
        landscape: 'bowl',
        showSliceToggle: true,
        showPartialValue: true,
        interactive: true,
      },
      content: {
        text: "A loss surface lives in 3D. To differentiate it, we slice. Toggle between θ₁ and θ₂ axes — the surface is cut along that direction, revealing a 2D curve. The slope of that curve at the current point is the partial derivative in that direction. Partial ∂ just means: take a normal 1D derivative, hold the other variables constant.",
        goDeeper: {
          math: '\\frac{\\partial L}{\\partial \\theta_1} \\bigg|_{\\theta_2 = c} = \\text{slope of slice in } \\theta_1 \\text{ direction}',
          explanation: "∂L/∂θ₁ is literally the slope of L if we walk only in the θ₁ direction, with θ₂ frozen. Every parameter has its own partial derivative. Put them all together and you get the gradient vector.",
        },
      },
      interactionHint: 'Toggle the axis buttons to switch between θ₁ and θ₂ slices. Drag the point along the slice to see the partial derivative change.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 6: The gradient vector
    // ─────────────────────────────────────────────────────────────
    {
      id: 'gradient-vector',
      title: 'The Gradient: Assembling the Vector',
      visualizationProps: {
        component: 'LossLandscape3D',
        landscape: 'bowl',
        showGradientField: true,
        showHeatmap: true,
        showContours: true,
        showLiveGradientPanel: true,
        interactive: true,
      },
      content: {
        text: "Stack all the partial derivatives into a single vector and you get the gradient ∇L. Watch the sidebar: as you drag the ball, both partial derivatives are computed live and assembled into the gradient vector. The red arrows show the gradient field — they always point in the direction of steepest ascent. Gradient descent goes exactly opposite.",
        goDeeper: {
          math: '\\nabla L = \\begin{bmatrix} \\frac{\\partial L}{\\partial \\theta_1} \\\\ \\frac{\\partial L}{\\partial \\theta_2} \\end{bmatrix}',
          explanation: "The gradient is a vector, one component per parameter. Its direction is steepest ascent. Its magnitude is how steep. For a neural network with 1 billion parameters, ∇L is a 1-billion-dimensional vector — but computed in a single backward pass through the network.",
        },
      },
      quiz: {
        question: 'If ∇L = [2, −3] at the current position, in which direction does gradient descent step?',
        options: ['[2, −3]', '[−2, 3]', '[3, 2]', '[0, 0]'],
        correctIndex: 1,
        explanation: "GD moves in direction −∇L = [−2, 3]. We negate the gradient to go downhill instead of uphill. Each component tells us how to adjust the corresponding parameter.",
      },
      interactionHint: 'Drag the gradient ball anywhere on the surface — the sidebar updates ∂L/∂θ₁, ∂L/∂θ₂, and |∇L| live. The cursor turns to a grab hand over the ball.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 7: The tangent plane
    // ─────────────────────────────────────────────────────────────
    {
      id: 'tangent-plane',
      title: 'The Tangent Plane: Why GD Works',
      visualizationProps: {
        component: 'LossLandscape3D',
        landscape: 'bowl',
        showTangentPlane: true,
        showHeatmap: true,
        interactive: true,
      },
      content: {
        text: "At any point on the surface, the gradient defines a flat plane that just kisses the surface — the tangent plane. Gradient descent uses this plane as its map: \"locally, the surface looks flat. I'll step downhill on this flat surface.\" This is why it needs small steps — the plane is only accurate close to the current point.",
        goDeeper: {
          math: 'L(\\theta + \\Delta\\theta) \\approx L(\\theta) + \\nabla L \\cdot \\Delta\\theta',
          explanation: "This is the first-order Taylor approximation. The dot product ∇L · Δθ tells us how much L changes if we move by Δθ. To decrease L, we need ∇L · Δθ < 0, which is exactly what −η∇L achieves. The approximation breaks down if Δθ is too large — hence the need for controlled learning rates.",
        },
      },
      interactionHint: 'Drag the ball around the surface to see how the gradient arrows (red) and live gradient panel update with position. Orbit to view from different angles.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 8: One concrete step — the arithmetic
    // ─────────────────────────────────────────────────────────────
    {
      id: 'one-concrete-step',
      title: 'One Step, Made Concrete',
      visualizationProps: {
        component: 'LossLandscape3D',
        landscape: 'bowl',
        showStepCalculator: true,
        showHeatmap: true,
        interactive: true,
      },
      content: {
        text: "Here's the update rule done as actual arithmetic, not algebra. The Step Calculator on the right shows you: current parameters → gradient → learning rate → new parameters. Each number is real. Click \"Next Step\" to advance one step at a time and watch the ball move accordingly.",
        goDeeper: {
          math: '\\theta_{t+1} = \\theta_t - \\eta \\nabla L(\\theta_t)',
          explanation: "This is the complete gradient descent algorithm — one line of math, repeated thousands of times. In a real neural network, θ might be 175 billion numbers (GPT-4), the gradient is computed by backpropagation, and η is tuned by a scheduler. But the update rule is identical.",
        },
      },
      interactionHint: 'Drag the ball to set a starting position, then click "Next Step →" in the Step Calculator to advance one step at a time and watch the ball move.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 9: Learning rate — the Goldilocks problem
    // ─────────────────────────────────────────────────────────────
    {
      id: 'learning-rate',
      title: 'Learning Rate: The Goldilocks Problem',
      visualizationProps: {
        component: 'LossLandscape3D',
        landscape: 'bowl',
        optimizer: 'sgd',
        showAnimation: true,
        showLossCurve: true,
        showLRSlider: true,
        showLRPulse: true,
        showHeatmap: true,
        interactive: true,
      },
      content: {
        text: "Now that you know what happens at each step, watch how η changes the behavior. Small η: the ball crawls to the minimum safely. Large η: the step overshoots and the ball explodes. Try η = 2.0 and watch. The loss curve on the right shows your progress — or divergence. There's no formula for the right η — it's the most important hyperparameter you tune.",
        goDeeper: {
          explanation: "The optimal LR depends on the loss landscape's curvature. Steep regions need small steps; flat regions can handle larger steps. This mismatch is exactly the problem that adaptive optimizers (RMSProp, Adam) were invented to solve — they tune the effective LR per-parameter automatically.",
        },
      },
      interactionHint: '▶ Play, then drag the LR slider while it runs. Try η = 0.001 (slow crawl) and η = 2.0 (watch it explode). Drag the ball to reset position.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 10: Momentum — remembering the past
    // ─────────────────────────────────────────────────────────────
    {
      id: 'momentum',
      title: 'Momentum: Remembering the Past',
      visualizationProps: {
        component: 'LossLandscape3D',
        landscape: 'ravine',
        optimizers: ['sgd', 'momentum'],
        showAnimation: true,
        showLossCurve: true,
        showMomentumSlider: true,
        showMathPanel: true,
        showHeatmap: true,
        interactive: true,
      },
      content: {
        text: "On the Ravine landscape, SGD oscillates wildly across the narrow valley — making little real progress. Momentum fixes this by letting the optimizer accumulate a velocity vector, like a ball rolling downhill. Past gradients are remembered and averaged. Watch SGD vs Momentum side-by-side — same landscape, same LR, wildly different behavior.",
        goDeeper: {
          math: 'v_{t+1} = \\beta v_t + \\nabla L \\\\ \\theta_{t+1} = \\theta_t - \\eta v_{t+1}',
          explanation: "β is the momentum coefficient (typically 0.9). The velocity v accumulates gradient history — large β means the past is remembered longer. This dampens oscillations across the valley while accelerating along the consistent downhill direction. Most modern optimizers include momentum.",
        },
      },
      interactionHint: 'Press ▶ Play and watch both optimizers simultaneously. Toggle the momentum β slider to see how memory length changes the path.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 11: Adaptive optimizers — RMSProp & Adam
    // ─────────────────────────────────────────────────────────────
    {
      id: 'adaptive-optimizers',
      title: 'Adaptive Optimizers: RMSProp & Adam',
      visualizationProps: {
        component: 'LossLandscape3D',
        landscape: 'rosenbrock',
        optimizers: ['sgd', 'momentum', 'rmsprop', 'adam'],
        showAnimation: true,
        showLossCurve: true,
        showMathPanel: true,
        showOptimizerSelector: true,
        showHeatmap: true,
        showRaceMode: true,
        interactive: true,
      },
      content: {
        text: "SGD uses one learning rate for all parameters. But what if some dimensions are steep and others are flat? RMSProp maintains a running average of squared gradients — dividing the LR by this average gives steep dimensions a smaller step. Adam combines RMSProp and Momentum, adding bias correction on top. Watch all four race on the Rosenbrock banana.",
        goDeeper: {
          math: '\\text{RMSProp: } v \\leftarrow \\beta v + (1-\\beta)(\\nabla L)^2 \\quad \\theta \\leftarrow \\theta - \\frac{\\eta}{\\sqrt{v + \\epsilon}} \\nabla L\n\\n\\text{Adam: } m \\leftarrow \\beta_1 m + (1-\\beta_1)\\nabla L \\quad v \\leftarrow \\beta_2 v + (1-\\beta_2)(\\nabla L)^2 \\quad \\theta \\leftarrow \\theta - \\frac{\\eta}{\\sqrt{\\hat{v}} + \\epsilon}\\hat{m}',
          explanation: "The key insight: dividing by √v normalizes the gradient by its recent size. If a parameter was consistently receiving large gradients (steep), its effective LR is reduced. If gradients were small (flat), the effective LR is increased. This adapts to the local curvature automatically.",
        },
      },
      interactionHint: 'Press ▶ to start the race. Click each optimizer legend item to toggle it. The Math Panel shows the live update rule for the selected optimizer.',
    },

    // ─────────────────────────────────────────────────────────────
    // Step 12: Full sandbox
    // ─────────────────────────────────────────────────────────────
    {
      id: 'full-picture',
      title: 'The Full Picture',
      visualizationProps: {
        component: 'LossLandscape3D',
        landscape: 'rosenbrock',
        optimizers: ['sgd', 'momentum', 'rmsprop', 'adam'],
        showAnimation: true,
        showLossCurve: true,
        showHeatmap: true,
        showContours: true,
        showGradientField: true,
        showMathPanel: true,
        showLRSlider: true,
        showMomentumSlider: true,
        showOptimizerSelector: true,
        showLandscapeSelector: true,
        showRaceMode: true,
        showSaddleMarkers: true,
        showLRPulse: true,
        interactive: true,
      },
      content: {
        text: "Everything unlocked. 7 landscapes, 4 optimizers, every slider. Real neural network loss surfaces are billions-dimensional — but the calculus is identical: the derivative is a slope, the gradient assembles those slopes into a vector, and the update rule steps in the opposite direction. Every training trick you'll ever read about solves one specific problem with the landscape.",
        goDeeper: {
          explanation: "Famous training tricks, decoded: Warmup prevents early overshoot when gradients are large. Cosine decay reduces LR for fine-tuning near the end. Gradient clipping prevents explosion on steep terrain. Weight decay (L2 regularization) adds a bowl bowl to the landscape, pulling parameters toward zero. Dropout changes the landscape every batch. You now understand WHY these tricks exist.",
        },
        authorNote: "Master this module and you understand 90% of what happens when someone says 'we trained a model'. The rest is scale — more parameters, more data, same fundamental algorithm.",
      },
      interactionHint: 'Your sandbox — try every landscape, every optimizer, every combination. Break things and understand why they break.',
    },
  ],

  playground: {
    description:
      'Full 3D optimization playground — race optimizers across 7 landscape presets, tune learning rates and momentum, watch convergence in real time.',
    parameters: [
      { id: 'showHeatmap', label: 'Gradient heatmap (terrain color)', type: 'toggle', default: true },
      { id: 'showContours', label: 'Floor contour lines', type: 'toggle', default: true },
      { id: 'showGradientField', label: 'Gradient arrow field', type: 'toggle', default: false },
      { id: 'showSaddleMarkers', label: 'Critical point markers', type: 'toggle', default: false },
      { id: 'showLossCurve', label: 'Loss vs. step chart', type: 'toggle', default: true },
      { id: 'showLRPulse', label: 'LR step-size pulse', type: 'toggle', default: true },
      { id: 'showMathPanel', label: 'Live update rule panel', type: 'toggle', default: true },
      { id: 'showAnimation', label: 'Play/Pause/Step controls', type: 'toggle', default: true },
      { id: 'showLRSlider', label: 'Learning rate slider', type: 'toggle', default: true },
      { id: 'showMomentumSlider', label: 'Momentum β slider', type: 'toggle', default: true },
      { id: 'showOptimizerSelector', label: 'Optimizer selector', type: 'toggle', default: true },
      { id: 'showLandscapeSelector', label: 'Landscape selector', type: 'toggle', default: true },
      { id: 'showRaceMode', label: 'Multi-optimizer race', type: 'toggle', default: true },
    ],
    tryThis: [
      'Race all 4 optimizers on the Rosenbrock banana — who wins?',
      'Set LR = 2.0 on the Bowl with SGD — watch it explode!',
      'Try SGD on the Ravine — it oscillates. Now switch to Momentum.',
      'Find a saddle point on the Saddle landscape and watch what happens.',
      'Compare RMSProp vs SGD on the Plateau — why does SGD get stuck?',
    ],
  },

  challenges: [
    {
      id: 'tangent-hunter',
      title: 'Tangent Hunter',
      description: 'Drag the point on the curve until the slope magnitude |f\'(x)| is less than 0.05 — you\'ve found the minimum.',
      component: 'DerivativeExplorer',
      props: {
        curve: 'parabola',
        showTangent: true,
        showDerivativeValue: true,
        challengeMode: true,
      },
      completionCriteria: { type: 'threshold', target: 0.05, metric: 'derivative_magnitude' },
      hints: [
        "The minimum of a curve is where the tangent line is horizontal.",
        "Try moving toward where the slope changes sign (from positive to negative or vice versa).",
      ],
    },
    {
      id: 'gradient-stopper',
      title: 'Gradient Stopper',
      description: 'Drag the ball on the 3D surface to a position where the gradient magnitude |∇L| is less than 0.1.',
      component: 'LossLandscape3D',
      props: {
        landscape: 'bowl',
        showGradientField: true,
        showLiveGradientPanel: true,
        interactive: true,
        challengeMode: true,
      },
      completionCriteria: { type: 'threshold', target: 0.1, metric: 'gradient_magnitude' },
      hints: [
        "The gradient arrows get shorter near the minimum.",
        "Look for the region where the heatmap is darkest blue — that means the gradient is smallest.",
      ],
    },
    {
      id: 'reach-valley-floor',
      title: 'Reach the Valley Floor',
      description: 'Tune the learning rate and optimizer to converge to loss < 0.5 within 50 steps on the Rosenbrock landscape.',
      component: 'LossLandscape3D',
      props: {
        landscape: 'rosenbrock',
        showAnimation: true,
        showLossCurve: true,
        showLRSlider: true,
        showMomentumSlider: true,
        showOptimizerSelector: true,
        showHeatmap: true,
        showMathPanel: true,
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 0.5, metric: 'final_loss' },
      hints: [
        "Adam usually works best on Rosenbrock.",
        "The Rosenbrock banana requires navigating a narrow curved valley — SGD struggles here.",
      ],
    },
    {
      id: 'tame-the-ravine',
      title: 'Tame the Ravine',
      description: 'Converge on the Ravine landscape to loss < 1.0 within 100 steps — but you must use Momentum, not SGD.',
      component: 'LossLandscape3D',
      props: {
        landscape: 'ravine',
        optimizer: 'momentum',
        showAnimation: true,
        showLossCurve: true,
        showMomentumSlider: true,
        showLRSlider: true,
        showHeatmap: true,
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 1.0, metric: 'final_loss' },
      hints: [
        "Higher momentum β (0.9-0.95) helps smooth out the oscillations across the ravine.",
        "Try a smaller learning rate combined with high momentum.",
      ],
    },
  ],
};

export default optimizationModule;