import type { ModuleData } from '@/core/types';

const chainRuleModule: ModuleData = {
  id: 'chain-rule',
  tierId: 0,
  clusterId: 'calculus',
  title: 'The Chain Rule',
  description:
    'The engine behind backpropagation — learn how derivatives flow through composed functions and computation graphs.',
  tags: ['chain-rule', 'calculus', 'backpropagation', 'computation-graph', 'autograd'],
  prerequisites: ['optimization'],
  difficulty: 'intermediate',
  estimatedMinutes: 50,

  steps: [
    // ── Step 1: Function composition ──────────────────────────────────────
    {
      id: 'composition',
      title: 'Functions Inside Functions',
      visualizationProps: {
        component: 'FunctionMachine',
        mode: 'compose',
        fId: 'square',
        gId: 'double',
        showValues: true,
      },
      content: {
        text: "Two machines: first g doubles your input, then f squares the result. Feed a number in — watch it transform step by step. This is function composition: f(g(x)). Every layer of a neural network is exactly this — a function whose input is the previous layer's output.",
        goDeeper: {
          math: 'h(x) = f(g(x)) = (f \\circ g)(x)',
          explanation: "Composition means the output of one function becomes the input of another. You can chain as many functions as you like — f(g(h(k(x)))) is perfectly valid. A 10-layer neural net is 10 functions composed together.",
        },
      },
      interactionHint: 'Drag the input slider — watch the value transform inside each machine.',
    },

    // ── Step 2: Why normal rules break ────────────────────────────────────
    {
      id: 'why-chain-rule',
      title: 'Why Normal Rules Break',
      visualizationProps: {
        component: 'FunctionMachine',
        mode: 'compose',
        fId: 'square',
        gId: 'sinx',
        showValues: true,
        showChallenge: true,
      },
      content: {
        text: "What's the derivative of h(x) = sin(x)²? You can't just differentiate each piece separately — the outer function 'sees' the output of the inner one, not x directly. For simple cases you could expand and differentiate, but what about sin(e^(x²))? Or a 50-layer network? We need a better method.",
        goDeeper: {
          explanation: "The power rule says d/dx[xⁿ] = nxⁿ⁻¹. But that only works when the base is literally x. When the base is g(x) — another function — you need the chain rule. Without it, differentiating any neural network would be practically impossible.",
        },
      },
      quiz: {
        question: "Can you find the derivative of h(x) = (3x + 1)⁵ just by using the power rule directly?",
        options: ['Yes — the derivative is 5(3x+1)⁴', 'No — the inner function 3x+1 also changes', 'Yes — it\'s 5x⁴', 'No — you need to expand first'],
        correctIndex: 1,
        explanation: "The power rule gives 5(3x+1)⁴ for the outer part, but you also need to account for how 3x+1 changes with x, which contributes a factor of 3. The full answer is 15(3x+1)⁴ — the chain rule gives you that missing 3.",
      },
      interactionHint: 'Look at how the inner function output changes independently of the outer function structure.',
    },

    // ── Step 3: Rate × Rate intuition ─────────────────────────────────────
    {
      id: 'rate-times-rate',
      title: 'The Intuition: Rate × Rate',
      visualizationProps: {
        component: 'RateMultiplier',
        showUnits: true,
        showMagnification: true,
      },
      content: {
        text: "Imagine converting miles → kilometres → light-years. The overall conversion rate is miles-to-km × km-to-lightyears. The total rate is always the product. The chain rule is this same idea applied to derivatives: if g stretches by a factor of 3 and f stretches by a factor of 2, the composition h = f∘g stretches by 2 × 3 = 6.",
        goDeeper: {
          math: "\\frac{dh}{dx} = \\frac{df}{dg} \\cdot \\frac{dg}{dx}",
          explanation: "This is the chain rule. Read it as: 'the rate h changes with x equals the rate f changes with g, times the rate g changes with x.' The Leibniz notation makes this intuitive — the dg terms almost 'cancel'.",
        },
      },
      interactionHint: 'Adjust each conversion rate and watch the overall rate update as a product.',
    },

    // ── Step 4: One level deep, concrete numbers ──────────────────────────
    {
      id: 'one-level',
      title: 'One Level Deep: Concrete Numbers',
      visualizationProps: {
        component: 'ChainCalculator',
        fId: 'power4',
        gId: 'linear',
        showStepByStep: true,
        showFormula: true,
        x: 1,
      },
      content: {
        text: "Let's differentiate h(x) = (3x + 2)⁴ step by step. Outer function: f(u) = u⁴, so f'(u) = 4u³. Inner function: g(x) = 3x + 2, so g'(x) = 3. Chain rule: h'(x) = f'(g(x)) · g'(x) = 4(3x+2)³ · 3 = 12(3x+2)³. The calculator shows each term with the current x value filled in.",
        goDeeper: {
          math: "h'(x) = \\underbrace{4(3x+2)^3}_{f'(g(x))} \\cdot \\underbrace{3}_{g'(x)}",
          explanation: "Notice h'(x) = f'(g(x)) — you evaluate f' at the inner function's output, not at x. This is where beginners often make mistakes: forgetting to compose the outer derivative with the inner function.",
        },
      },
      interactionHint: 'Drag the x slider — each coloured term updates with the correct value at that x.',
    },

    // ── Step 5: Computation graph (1 hidden node) ─────────────────────────
    {
      id: 'computation-graph-1',
      title: 'Computation Graph: One Hidden Node',
      visualizationProps: {
        component: 'ComputationGraph',
        graphId: 'single',
        showForward: true,
        showBackward: false,
        interactive: true,
      },
      content: {
        text: "Instead of nested notation, think of computation as a graph. Each node performs one operation. Each edge carries a value. For h(x) = (3x + 2)⁴: two nodes — a 'linear' node and a 'power' node. The chain rule is always: multiply the local derivatives along the path from input to output.",
        goDeeper: {
          explanation: "Computation graphs are how libraries like PyTorch and TensorFlow internally represent operations. Every arithmetic operation — multiply, add, sin, exp — becomes a node. The chain rule becomes a message-passing algorithm on this graph.",
        },
      },
      interactionHint: 'Hover each node to see its local derivative formula in a tooltip. Drag the x slider to update all values.',
    },

    // ── Step 6: Two levels deep ──────────────────────────────────────────
    {
      id: 'two-levels',
      title: 'Two Levels Deep',
      visualizationProps: {
        component: 'ComputationGraph',
        graphId: 'double',
        showForward: true,
        showBackward: false,
        interactive: true,
        showEdgeDerivatives: true,
      },
      content: {
        text: "Now h(x) = sin(e^(x²)) — three nested functions. Three nodes in our graph: square → exp → sin. Each edge gets a local derivative label. The total derivative is the product of all three local derivatives along the path. Drag the x slider and watch each edge update.",
        goDeeper: {
          math: "\\frac{dh}{dx} = \\underbrace{\\cos(e^{x^2})}_{\\partial \\sin/\\partial e^{x^2}} \\cdot \\underbrace{e^{x^2}}_{\\partial e^{x^2}/\\partial x^2} \\cdot \\underbrace{2x}_{\\partial x^2/\\partial x}",
          explanation: "Three factors, one per edge in the graph. This pattern holds for arbitrarily deep compositions — the chain just gets longer. A 100-layer neural network has 100 factors multiplied together during backpropagation.",
        },
      },
      interactionHint: 'Hover any edge in the graph — a tooltip shows its local derivative formula. Drag the x slider to update all values.',
    },

    // ── Step 7: Forward pass — store everything ───────────────────────────
    {
      id: 'forward-pass',
      title: 'Forward Pass: Store Everything',
      visualizationProps: {
        component: 'ComputationGraph',
        graphId: 'single',
        showForward: true,
        showBackward: false,
        showStoredValues: true,
        animateForward: true,
        interactive: true,
      },
      content: {
        text: "During the forward pass, we compute each node's output and store it. These stored values are the u = g(x) terms we need later to evaluate f'(g(x)). Watch the computation flow left to right — each node fills with its value. The forward pass is just running the function normally, with a side-effect: saving intermediate results.",
        goDeeper: {
          explanation: "If we discard intermediate values, we'd need to recompute them during backpropagation, which is expensive. Modern frameworks store them in a 'tape' or 'autograd graph'. This memory–compute tradeoff is fundamental to efficient deep learning training.",
        },
      },
      interactionHint: "Press ▶ to animate the forward pass — watch each node 'light up' as its value is computed.",
    },

    // ── Step 8: Backward pass — gradient flows back ───────────────────────
    {
      id: 'backward-pass',
      title: 'Backward Pass: Gradients Flow Back',
      visualizationProps: {
        component: 'ComputationGraph',
        graphId: 'single',
        showForward: true,
        showBackward: true,
        animateBackward: true,
        showGradientValues: true,
        interactive: true,
      },
      content: {
        text: "After the forward pass, we run backward. We start at the output: ∂L/∂output = 1. Then we multiply each edge's local derivative as we travel right-to-left. Each node receives its incoming gradient, multiplies by its local derivative, and sends the result to its input. This is backpropagation — it's just the chain rule on a graph.",
        goDeeper: {
          math: "\\frac{\\partial L}{\\partial x} = \\frac{\\partial L}{\\partial h} \\cdot \\frac{\\partial h}{\\partial g} \\cdot \\frac{\\partial g}{\\partial x}",
          explanation: "The gradient flows backwards — hence 'backpropagation'. Each node only needs its upstream gradient and its own local derivative to compute its contribution. This local nature is what makes the algorithm scalable to millions of parameters.",
        },
      },
      interactionHint: "Press ▶ to animate the backward pass — watch gradients flow right-to-left in orange.",
    },

    // ── Step 9: Build your own computation graph ─────────────────────────
    {
      id: 'graph-builder',
      title: 'Build Your Own Computation Graph',
      visualizationProps: {
        component: 'ComputationGraph',
        allowBuild: true,
        showForward: true,
        showBackward: true,
        interactive: true,
      },
      content: {
        text: "Your turn. Pick an operation from the toolbar (sin, exp, x², +, ×), click '+ Add' to place a node, then click two nodes to connect them with an edge. Set input x, then run ▶ Forward to see values flow through your graph and ◀ Backward to see gradients. Try building h(x) = (3x+1)² or sin(eˣ²) from scratch.",
        goDeeper: {
          explanation: "The operations you see — sin, exp, square, add, multiply — are exactly the primitives that PyTorch and TensorFlow use internally. Any function, no matter how complex, is a graph of these primitives. Autograd then applies the chain rule at each node automatically — you just built your first autograd engine.",
        },
      },
      interactionHint: "Pick an op → click '+ Add' → click two nodes to draw an edge. Right-click a node to delete it. Run ▶ Forward then ◀ Backward.",
    },

    // ── Step 10: Mini neural network ─────────────────────────────────────
    {
      id: 'mini-net',
      title: 'A Mini Neural Network',
      visualizationProps: {
        component: 'ComputationGraph',
        graphId: 'mini-net',
        showForward: true,
        showBackward: true,
        showWeightGradients: true,
        animateBackward: true,
        interactive: true,
      },
      content: {
        text: "Now something real: L = (w·x - y)². Three nodes: multiply (w·x), subtract (result - y), square. Run the backward pass — the gradient flows all the way back to w. The final value ∂L/∂w = 2(wx - y)·x is exactly what gradient descent needs. Every neural network weight update comes from this same process.",
        goDeeper: {
          math: "\\frac{\\partial L}{\\partial w} = \\underbrace{2(wx - y)}_{\\partial L/\\partial \\text{output}} \\cdot \\underbrace{x}_{\\partial(wx)/\\partial w}",
          explanation: "The gradient with respect to a weight is always a product of terms from the chain rule. 'How wrong was the output' times 'how much did this weight contribute to the output'. This intuition generalises to all neural network layers.",
        },
      },
      interactionHint: 'Drag the w slider. Run backward to see how ∂L/∂w changes with w. Find the w that makes ∂L/∂w = 0.',
    },

    // ── Step 11: Multiple paths (multivariate) ────────────────────────────
    {
      id: 'multiple-paths',
      title: 'Multiple Paths: When a Variable Appears Twice',
      visualizationProps: {
        component: 'ComputationGraph',
        graphId: 'multipath',
        showForward: true,
        showBackward: true,
        showPaths: true,
        interactive: true,
      },
      content: {
        text: "What if x feeds into two different paths? z = x² + sin(x). x contributes to z via the square path AND via the sin path. The total derivative sums contributions from both paths: dz/dx = 2x + cos(x). The two highlighted paths on the graph show which local derivatives contribute to each path.",
        goDeeper: {
          math: "\\frac{\\partial z}{\\partial x} = \\sum_{\\text{paths}} \\prod_{\\text{edges on path}} \\frac{\\partial \\text{child}}{\\partial \\text{parent}}",
          explanation: "This is the multivariate chain rule. In neural networks, a weight can influence many downstream nodes (if it's in an early layer). Its gradient is the sum of contributions from all paths that go through it. This is why 'accumulating' gradients is a core operation in autograd.",
        },
      },
      interactionHint: "Click 'Highlight Paths' in the header to see the two paths x takes through the graph. Watch both gradient contributions in orange.",
    },

    // ── Step 12: Autograd ─────────────────────────────────────────────────
    {
      id: 'autograd',
      title: 'Autograd: The Chain Rule at Scale',
      visualizationProps: {
        component: 'ComputationGraph',
        graphId: 'deep',
        showForward: true,
        showBackward: true,
        showAllGradients: true,
        animateBackward: true,
        interactive: true,
      },
      content: {
        text: "This graph has 12 operations — small for a neural network, enormous to differentiate by hand. Autograd does it automatically: run the forward pass to build the graph, then walk backwards applying the chain rule at every node. No algebra, no expansion, just systematic local multiplication. GPT-4 has 1.8 trillion 'edges' per forward pass. Same algorithm.",
        goDeeper: {
          explanation: "Reverse-mode autodiff (backpropagation) is O(n) in the number of parameters — computing ALL gradients costs the same as ONE forward pass. This is why gradient-based training is feasible for models with billions of parameters. Forward-mode autodiff would be O(n²). The choice of reverse mode was one of the key insights of the 1986 backprop paper.",
        },
        authorNote: "If you understand this module, you understand the mathematical foundation of every modern neural network training algorithm. Backprop is not magic — it's the chain rule, applied systematically, on a graph.",
      },
      interactionHint: '▶ Run the backward pass — watch gradients fill every edge of the graph simultaneously.',
    },
  ],

  playground: {
    description: 'Build and differentiate your own computation graphs — chain any operations together and watch the forward and backward pass.',
    parameters: [
      { id: 'showEdgeDerivatives', label: 'Show local derivatives on edges', type: 'toggle', default: true },
      { id: 'showGradientValues', label: 'Show gradient values (backward)', type: 'toggle', default: true },
      { id: 'showStoredValues', label: 'Show stored values (forward)', type: 'toggle', default: true },
      { id: 'animateForward', label: 'Animate forward pass', type: 'toggle', default: true },
      { id: 'animateBackward', label: 'Animate backward pass', type: 'toggle', default: true },
      { id: 'showPaths', label: 'Highlight gradient paths', type: 'toggle', default: false },
    ],
    tryThis: [
      'Build f(g(h(x))) with 3 operations — verify the chain rule by hand for one x value.',
      'Create a graph where x appears in two paths (e.g. x*x + sin(x)) — check that gradients sum.',
      'Build the mini neural net L = (w·x - y)² and find w that minimizes L by following the gradient.',
    ],
  },

  challenges: [
    {
      id: 'chain-it',
      title: 'Chain It',
      description: "Use the step-by-step calculator to find h'(1) where h(x) = sin(x² + 1). Read each step, then type your final answer in the input field below. You need to be within 0.05 of the true value to pass.",
      component: 'ChainCalculator',
      props: {
        fId: 'sinx',
        gId: 'xSquaredPlus1',
        challengeMode: true,
        x: 1,
      },
      completionCriteria: { type: 'threshold', target: 0.05, metric: "Enter h'(1) within ±0.05" },
      hints: [
        "Inner: g(x) = x² + 1, g'(x) = 2x. At x=1: g(1) = 2, g'(1) = 2.",
        "Outer: f(u) = sin(u), f'(u) = cos(u). At u = 2: f'(2) = cos(2) ≈ −0.416.",
        "Chain rule: h'(1) = cos(2) × 2 ≈ −0.832. Type −0.832 in the answer box.",
      ],
    },
    {
      id: 'graph-the-gradient',
      title: 'Build the Graph',
      description: "Use the graph builder to construct h(x) = sin(eˣ). Add an 'eˣ' node, connect x → eˣ → sin → out. Set x = 0, run ▶ Forward then ◀ Backward. The gradient ∂out/∂x should show cos(1) ≈ 0.540 below the graph. Use hints if you're stuck.",
      component: 'ComputationGraph',
      props: {
        allowBuild: true,
        showForward: true,
        showBackward: true,
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 0.05, metric: 'Build h(x) = sin(eˣ) and verify ∂out/∂x ≈ 0.540 at x = 0' },
      hints: [
        "Add two nodes: 'eˣ' and 'sin'. Connect them in sequence: x → eˣ → sin → out.",
        "At x=0: e°=1, sin(1)≈0.841. Forward values should be 0, 1, 0.841.",
        "∂out/∂x = cos(e°) · e° = cos(1) · 1 ≈ 0.540. Check the orange gradient for the 'x' node.",
      ],
    },
    {
      id: 'neural-gradient',
      title: 'Neural Gradient',
      description: 'The graph shows L = (w·x − y)² with y=1. Run the backward pass to compute ∂L/∂w. Then drag the w slider to find the value of w that makes ∂L/∂w = 0 (the loss minimum). The optimal w is visible when the orange gradient label on the w node reads 0.000.',
      component: 'ComputationGraph',
      props: {
        graphId: 'mini-net',
        showForward: true,
        showBackward: true,
        showGradientValues: true,
        animateBackward: true,
        interactive: true,
      },
      completionCriteria: { type: 'threshold', target: 0.1, metric: 'Find w where ∂L/∂w ≈ 0 (optimal w = y/x = 1.0)' },
      hints: [
        '∂L/∂w = 2(wx − y)·x. Set this to 0: wx = y, so w* = y/x.',
        'With y=1 and x=1: w* = 1. Drag the w slider to 1.0 — the gradient will read 0.000.',
        'Press ◀ Backward after each w change to see the updated gradient on the w node.',
      ],
    },
  ],
};

export default chainRuleModule;
