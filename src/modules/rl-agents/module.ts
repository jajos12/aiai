import type { ModuleData } from '@/core/types';

const rlAgentsModule: ModuleData = {
  id: 'rl-agents',
  tierId: 4,
  clusterId: 'frontiers',
  title: 'Reinforcement Learning Agents',
  description:
    'States, actions, rewards, and Q-learning — teaching machines to learn from interaction.',
  tags: ['reinforcement-learning', 'q-learning', 'agents', 'rl'],
  prerequisites: ['perceptrons'],
  difficulty: 'intermediate',
  estimatedMinutes: 75,
  steps: [
    {
      id: 'agent-environment',
      title: 'Agent and Environment',
      visualizationProps: {
        mode: 'gridworld',
        gridSize: 4,
        agentPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        obstacles: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
        interactive: false,
      },
      content: {
        text: 'In Reinforcement Learning (RL), an Agent takes Actions in an Environment to maximize its cumulative Reward.',
        goDeeper: {
          explanation: String.raw`MDP FORMALISM

Markov Decision Process (S, A, P, R, γ): transition kernel P(s'|s,a), reward r(s,a,s'), discount γ∈[0,1). Policy π(a|s) induces trajectories; objective J(π)=𝔼[Σ γ^t r_t].

PARTIALLY OBSERVED WORLDS

POMDPs add observations o ~ Ω(s); agent may need memory (RNN) or belief state.

EXPLORATION OBLIGATION

Unlike i.i.d. supervised data, the agent chooses the data distribution it learns from.`,
        },
      },
    },
    {
      id: 'exploration-vs-exploitation',
      title: 'Exploration vs Exploitation',
      visualizationProps: {
        mode: 'q-learning',
        gridSize: 4,
        agentPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        obstacles: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
        epsilon: 0.5,
        interactive: true,
      },
      content: {
        text: 'Should the agent try a random action to discover new paths (Explore), or use what it already knows to get a reward (Exploit)? This is controlled by Epsilon (ε).',
        goDeeper: {
          explanation: String.raw`ε-GREEDY POLICY

With prob ε pick uniform random action; else argmax_a Q(s,a). Decay ε_t schedule balances early exploration vs late exploitation.

REGRET BOUNDS

Multi-armed bandit theory quantifies cost of exploration; MDPs generalize to PAC-MDP / UCB-style bonuses.

BAYESIAN / THOMPSON

Posterior sampling explores optimally in some bandit settings; harder in general MDPs.`,
        },
      },
      interactionHint: 'Change the Epsilon slider and watch the agent\'s behavior',
    },
    {
      id: 'the-bellman-equation',
      title: 'The Bellman Equation',
      visualizationProps: {
        mode: 'bellman',
        gridSize: 4,
        agentPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        obstacles: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
        learningRate: 0.1,
        discountFactor: 0.9,
        showQValues: true,
      },
      content: {
        text: 'The agent learns the value of being in a state using the Bellman Equation, which updates values backwards from the goal.',
        goDeeper: {
          math: String.raw`Q(s,a) \leftarrow (1-\alpha)Q(s,a) + \alpha\bigl(r + \gamma \max_{a'} Q(s',a')\bigr)`,
          explanation: String.raw`BOOTSTRAP TARGET

TD target r + γ max Q(s',·) uses current estimate of future—lower variance than Monte Carlo full returns, biased until Q correct.

OPTIMALITY EQUATION

Bellman optimality: Q^*(s,a) = 𝔼[r + γ max_{a'} Q^*(s',a')]; fixed point unique under contractions in finite tabular case.

OFF-POLICY NOTE

Q-learning learns optimal Q even while behaving ε-greedy—off-policy TD control.`,
        },
      },
    },
    {
      id: 'dqn-deep-q',
      title: 'DQN: Scaling to Pixels',
      visualizationProps: {
        mode: 'dqn-viz',
      },
      content: {
        text: 'Simple Q-Learning uses a table. But what if we have a billion states (like pixels in a game)? We use a Neural Network to *predict* the Q-values. This is a Deep Q-Network (DQN).',
        goDeeper: {
          explanation: String.raw`FUNCTION APPROXIMATION

Q_θ(s,a) or Q_θ(s) with a output per action; θ shared across states—generalization to unseen screens.

STABILIZERS

Experience replay breaks correlation; target network θ^- slows moving target r+γ max Q_{θ^-}(s',a').

DOUBLE DQN

Decouple selection and evaluation of max to reduce overestimation bias.`,
        },
      },
    },
    {
      id: 'policy-gradients',
      title: 'Policy Gradients',
      visualizationProps: {
        mode: 'policy-viz',
      },
      content: {
        text: 'Instead of predicting "How good is this action?" (Q-value), we directly predict "What action should I take?". We use the reward to "dial up" the probability of actions that led to a win.',
        goDeeper: {
          math: String.raw`\nabla_\theta J(\theta) = \mathbb{E}_{\tau\sim\pi_\theta}\Bigl[\sum_t \nabla_\theta \log \pi_\theta(a_t|s_t)\, G_t\Bigr]`,
          explanation: String.raw`REINFORCE ESTIMATOR

Monte Carlo returns G_t weighted by log-prob gradients—unbiased but high variance.

BASELINE SUBTRACTION

Subtract state-value b(s) (e.g., V(s)) without changing mean gradient—cuts variance.

CONTINUOUS CONTROL

Gaussian policies π_θ = 𝒩(μ_θ(s), Σ_θ(s)) give differentiable sampling (reparam trick) for robotics.`,
        },
      },
    },
    {
      id: 'actor-critic',
      title: 'Actor-Critic: Two Heads',
      visualizationProps: {
        mode: 'actor-critic-viz',
      },
      content: {
        text: 'Why not both? The "Actor" decides what to do, and the "Critic" evaluates how good that choice was. The Actor learns from the Critic\'s feedback.',
        goDeeper: {
          explanation: String.raw`ADVANTAGE ESTIMATION

A(s,a)=Q(s,a)−V(s) or GAE-λ blends TD errors—centered signal for policy update.

TD ERROR AS CRITIC TARGET

δ_t = r + γV(s') − V(s) bootstraps like value iteration inside deep nets.

A2C / A3C / SAC

Variants differ sync/async updates, entropy bonuses (max-ent RL), and off-policy critics.`,
        },
      },
    },
    {
      id: 'ppo-stability',
      title: 'PPO: The Safe Stepper',
      visualizationProps: {
        mode: 'ppo-viz',
      },
      content: {
        text: 'In RL, one "really bad" update can ruin the whole agent. PPO (Proximal Policy Optimization) ensures that the new policy doesn\'t drift too far from the old one in a single step.',
        goDeeper: {
          math: String.raw`L^{\mathrm{CLIP}} = \mathbb{E}\bigl[\min(r_t A_t,\mathrm{clip}(r_t,1-\epsilon,1+\epsilon)A_t)\bigr]`,
          explanation: String.raw`IMPORTANCE RATIO

r_t = π_new(a|s)/π_old(a|s); clip prevents huge policy jumps when advantage A_t mis-estimates.

TRUST REGION INTUITION

Related to TRPO natural gradient step constrained in KL divergence ball.

LLM FINE-TUNING

RLHF uses PPO-style updates with learned reward model replacing environment reward.`,
        },
      },
    },
    {
      id: 'reward-shaping-depth',
      title: 'Reward Foundations',
      visualizationProps: {
        mode: 'reward-viz',
      },
      content: {
        text: 'If the goal is 1 mile away, a reward at the end is too "sparse". We use "Reward Shaping" to give tiny breadcrumbs along the path to guide the agent.',
        goDeeper: {
          explanation: String.raw`POTENTIAL-BASED SHAPING

F(s,s') = γΦ(s')−Φ(s) preserves optimal policy under mild conditions (Ng et al.)—design Φ to hint progress without changing optimum.

REWARD HACKING

Misspecified shaping creates loopholes (spinning for partial credit)—ties to AI alignment.

INVERSE RL

Learn reward from demonstrations when hand-design is hard.`,
        },
      },
    },
    {
      id: 'multi-agent-rl',
      title: 'MARL: Multi-Agent RL',
      visualizationProps: {
        mode: 'marl-viz',
      },
      content: {
        text: 'In the real world, agents aren\'t alone. Multi-Agent RL study how agents cooperate or compete, leading to complex behaviors like team sports or traffic flow.',
        goDeeper: {
          explanation: String.raw`NON-STATIONARITY

From agent i’s view, others’ policies change over training—breaks MDP assumptions; needs opponent modeling or centralized training decentralized execution (CTDE).

NASH / CORRELATED EQUILIBRIA

Game-theoretic solution concepts generalize single-agent optimality.

SCALING

Self-play (AlphaStar), population-based training, and league training diversify strategies.`,
        },
      },
    },
  ],
  playground: {
    description: 'Tune the hyperparameters of a Q-learning agent navigating a Gridworld.',
    parameters: [
      { id: 'epsilon', label: 'Epsilon (Exploration)', type: 'slider', min: 0, max: 1, step: 0.05, default: 0.2 },
      { id: 'learningRate', label: 'Learning Rate (α)', type: 'slider', min: 0, max: 1, step: 0.05, default: 0.1 },
      { id: 'discountFactor', label: 'Discount Factor (γ)', type: 'slider', min: 0, max: 1, step: 0.05, default: 0.9 },
    ],
    tryThis: [
      'Set Epsilon to 0. Notice how the agent might get stuck in a bad local optimum if it hasn\'t explored enough.',
      'Set Discount Factor to 0. What happens? (It only cares about immediate rewards, ignoring the future).',
    ],
  },
  challenges: [
    {
      id: 'train-the-agent',
      title: 'Train the Agent',
      description: 'Find hyperparameters that allow the agent to reliably find the goal in fewer than 20 steps per episode.',
      props: {
        mode: 'challenge',
        gridSize: 5,
        targetSteps: 20,
        showQValues: true,
      },
      completionCriteria: { type: 'threshold', target: 20, metric: 'avg_steps_to_goal' },
      hints: [
        'A higher learning rate helps it learn fast, but might be unstable.',
        'Make sure exploration (epsilon) isn\'t too high, otherwise it will just wander around randomly even when it knows the way.',
      ],
    },
  ],
};

export default rlAgentsModule;
