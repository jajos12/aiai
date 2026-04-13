import type { ModuleData } from '@/core/types';

const alignmentModule: ModuleData = {
  id: 'alignment',
  tierId: 5,
  clusterId: 'research',
  title: 'AI Alignment',
  description:
    'Reward hacking, specification gaming, and making sure models do what we actually want them to do.',
  tags: ['alignment', 'safety', 'rlhf', 'specification-gaming'],
  prerequisites: ['rl-agents'],
  difficulty: 'advanced',
  estimatedMinutes: 75,
  steps: [
    {
      id: 'the-alignment-problem',
      title: 'The Alignment Problem',
      visualizationProps: {
        mode: 'intro',
      },
      content: {
        text: 'AI alignment is the problem of ensuring that artificial intelligence systems pursue goals that match human intentions and values.',
        goDeeper: {
          explanation: String.raw`VALUES ARE IMPLICIT

We rarely specify a complete utility function U*(s); deployed systems optimize proxy objectives (clicks, log-loss, reward model scores).

INNER VS OUTER MISALIGNMENT

Outer: wrong objective written down. Inner: mesa-optimizers pursue emergent goals differing from training loss even if loss is “correct.”

EVALUATION CHALLENGES

Capabilities can outrun our ability to measure intent—need harder tests and red-teaming.`,
        },
      },
    },
    {
      id: 'specification-gaming',
      title: 'Specification Gaming',
      visualizationProps: {
        mode: 'gaming',
        agentPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        proxyRewardPos: { x: 1, y: 1 },
        isPlaying: false,
      },
      content: {
        text: 'Here, the agent is supposed to reach the star (True Goal). But we gave it a reward function based on "touching the green tile" (Proxy Reward). Watch what happens when we let it optimize.',
        goDeeper: {
          explanation: String.raw`GOODHART’S LAW

When a measure becomes a target, it ceases to be a good measure—agents saturate proxies while violating true goals.

EMPIRICAL EXAMPLES

Sim-to-real gaps, leaderboard hacking, reward models fooled by adversarial completions.

MITIGATION DIRECTIONS

Multi-objective rewards, human oversight loops, constrained optimization, interpretability probes.`,
          references: [
            {
              title: 'Concrete Problems in AI Safety',
              author: 'Amodei et al.',
              url: 'https://arxiv.org/abs/1606.06565',
            },
          ],
        },
      },
    },
    {
      id: 'designing-rewards',
      title: 'Designing Better Rewards',
      visualizationProps: {
        mode: 'design-reward',
        agentPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        interactive: true,
      },
      content: {
        text: 'Try to fix the reward function! If you give a reward for every step, the agent might never stop moving. If you only reward the final goal, it might never find it (sparse rewards).',
        goDeeper: {
          explanation: String.raw`SPARSE VS SHAPED TRADEOFF

Sparse terminal rewards define the true task but slow RL; shaping accelerates but risks hacking—potential-based shaping preserves optimal policies under conditions.

RLHF AS LEARNED REWARD

Instead of hand-coding R(s,a), fit R̂ from human comparisons—scales preferences but inherits judge blind spots.

PROCESS SUPERVISION

Reward correct reasoning steps, not only final answers—reduces shortcut learning in math/code tasks.`,
        },
      },
      interactionHint: 'Tweak the reward modifiers and click "Train" to see if the agent misbehaves',
    },
    {
      id: 'rlhf-loop',
      title: 'RLHF: Humans in the Loop',
      visualizationProps: {
        mode: 'rlhf-viz',
      },
      content: {
        text: 'Instead of math, we show two AI answers to a human and ask, "Which is better?". We use these human rankings to train a "Reward Model" that eventually replaces the human to train the final AI.',
        goDeeper: {
          explanation: String.raw`BRADLEY–TERRY STACK

Pairwise labels induce logistic loss on score differences; active learning selects informative pairs.

DISTRIBUTION SHIFT

Policy π_θ drifts from data that trained R̂—rejection sampling, KL penalties, and DPO-style rewrites mitigate.

LIMITATIONS

Humans disagree; annotation cost; reward model may favor verbose sycophancy.`,
        },
      },
    },
    {
      id: 'reward-models',
      title: 'The Reward Model',
      visualizationProps: {
        mode: 'reward-model-viz',
      },
      content: {
        text: 'The Reward Model is a "Judge" network. It tries to learn the fuzzy, complex nature of what humans like. However, if the Reward Model has flaws, the AI will learn to "hack" it, just like the gridworld agent.',
        goDeeper: {
          explanation: String.raw`OVERSIGHT GAPS

Adversarial prompts maximize R̂ while being useless or harmful—same optimization machinery as GANs.

ENSEMBLES & UNCERTAINTY

Variance across reward heads can flag OOD inputs for abstention.

CONSTITUTIONAL / AI FEEDBACK

Use scalable synthetic critiques to reduce pure human labeling bottleneck.`,
        },
      },
    },
    {
      id: 'constitutional-ai',
      title: 'Constitutional AI',
      visualizationProps: {
        mode: 'constitution-viz',
      },
      content: {
        text: 'At Anthropic (Claude), they use "Constitutional AI". Instead of millions of human labels, they give the AI a written constitution (rules) and ask another AI to use those rules to critique and label training data.',
        goDeeper: {
          explanation: String.raw`SCALABLE OVERSIGHT

Principles → synthetic preference pairs → SLHF / RLHF fine-tuning; humans audit constitution not every example.

SELF-CRITIQUE LOOP

Model generates, critiques, revises; training on revised outputs instills rule-following behavior.

RISKS

Constitution may be incomplete; AI judge shares base model failure modes—need external audits.`,
        },
      },
    },
    {
      id: 'mechanistic-interpretability',
      title: 'Mechanistic Interpretability',
      visualizationProps: {
        mode: 'mech-interp-viz',
      },
      content: {
        text: 'Alignment isn\'t just about output; it is about *internal* intent. We use "Microscopes" to look at individual neurons and discover "circuits" that represent concepts like honesty, deception, or math.',
        goDeeper: {
          explanation: String.raw`LINEAR REPRESENTATIONS

Sparse autoencoders and probing classifiers find directions for concepts in activation space—causal interventions test if direction truly controls behavior.

LIMITATIONS

Polysemantic neurons, rotation invariance of hidden space, and scale make exhaustive circuit catalogues hard.

SAFETY PAYOFF

If deception circuits can be detected early, monitoring systems could flag policies before deployment.`,
        },
      },
    },
    {
      id: 'the-future-alignment',
      title: 'The Future of Alignment',
      visualizationProps: {
        mode: 'alignment-future',
      },
      content: {
        text: 'As we move toward AGI, alignment becomes a life-or-death engineering problem. We need mathematical guarantees that super-intelligent systems will remain beneficial to humanity.',
        goDeeper: {
          explanation: String.raw`FORMAL VERIFICATION GAPS

Neural nets resist traditional proof; research on certified robustness, constrained policies, and interpretable architectures chips away at the problem.

SUPERALIGNMENT AGENDA

Use weaker AIs to supervise stronger ones—scalable oversight, debate, recursive reward modeling.

SOCIO-TECHNICAL LAYER

Deployment governance, monitoring, and kill switches complement algorithmic alignment.`,
        },
      },
    },
  ],
  playground: {
    description: 'Set up an environment and define a reward function. Can you trick the agent into specification gaming?',
    parameters: [
      { id: 'stepPenalty', label: 'Step Penalty', type: 'slider', min: -1, max: 0, step: 0.1, default: -0.1 },
      { id: 'goalReward', label: 'Goal Reward', type: 'slider', min: 0, max: 10, step: 1, default: 10 },
      { id: 'proxyReward', label: 'Proxy Tile Reward', type: 'slider', min: -5, max: 5, step: 1, default: 2 },
    ],
    tryThis: [
      'Set the Proxy Tile Reward higher than the Step Penalty. Does the agent ever leave the proxy tile?',
      'Set the Step Penalty to 0. Does the agent take the shortest path?',
    ],
  },
  challenges: [
    {
      id: 'fix-the-proxy',
      title: 'Fix the Proxy',
      description: 'Adjust the reward values so that the agent reaches the Goal in the minimum number of steps without getting stuck on the proxy tile.',
      props: {
        mode: 'challenge',
        agentPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        proxyRewardPos: { x: 1, y: 1 },
      },
      completionCriteria: { type: 'threshold', target: 3, metric: 'steps_to_goal' },
      hints: [
        'A small negative step penalty encourages the shortest path.',
        'Make sure the proxy reward isn\'t high enough to overcome the step penalty.',
      ],
    },
  ],
};

export default alignmentModule;
