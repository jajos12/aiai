import { ModuleData } from '../../core/types';

export const moduleData: ModuleData = {
  id: 'ml-engineering-practices',
  tierId: 0.5,
  clusterId: 'engineering',
  title: 'ML Engineering Practices',
  description:
    'Learn reproducibility, debugging, configuration, and experiment hygiene for reliable AI development.',
  tags: ['MLOps', 'Debugging', 'Reproducibility', 'Engineering'],
  prerequisites: ['pytorch-training-workflows'],
  difficulty: 'intermediate',
  estimatedMinutes: 80,
  steps: [
    {
      id: 'project-structure',
      title: 'Project Structure and Environment Discipline',
      visualizationProps: { mode: 'project-scaffold' },
      content: {
        text: 'Reliable ML starts with clean project structure and deterministic environments. Separate source code, configs, data artifacts, and checkpoints from day one. Use a virtual environment and pinned dependencies to avoid “works on my machine” problems. Document setup in a clear README so another learner can run your code without guessing. This is the baseline for reproducible experimentation.',
        goDeeper: {
          explanation:
            'Minimal structure: `src/`, `configs/`, `scripts/`, `artifacts/`, `data/`, and `tests/`. Dependency locking and setup instructions are part of engineering quality, not optional paperwork.',
        },
      },
      quiz: {
        question: 'Why pin dependency versions in ML projects?',
        options: [
          'To make installation random',
          'To guarantee deterministic environments across runs and machines',
          'To avoid all bugs forever',
          'To remove the need for tests',
        ],
        correctIndex: 1,
        explanation: 'Pinned versions reduce drift and improve reproducibility.',
      },
    },
    {
      id: 'config-driven-training',
      title: 'Configuration-Driven Workflows',
      visualizationProps: { mode: 'config-flow' },
      content: {
        text: 'Avoid hardcoding hyperparameters directly in training scripts. Instead, keep settings in configuration files and load them at runtime. This makes experiments comparable and easier to reproduce. It also allows clean parameter sweeps without editing code repeatedly. Config-driven workflows are standard in real ML teams.',
        goDeeper: {
          explanation:
            'Store config snapshots with each experiment artifact. Include seed, dataset version, model params, optimizer settings, and evaluation thresholds. Treat config as part of the experiment identity.',
        },
      },
      quiz: {
        question: 'What is the biggest benefit of config-driven training scripts?',
        options: [
          'They remove the need for datasets',
          'They make experiments easier to compare and reproduce',
          'They guarantee higher model accuracy',
          'They replace all logging',
        ],
        correctIndex: 1,
        explanation: 'Config-driven workflows improve repeatability and experiment tracking.',
      },
    },
    {
      id: 'logging-and-metrics',
      title: 'Logging, Metrics, and Experiment Tracking',
      visualizationProps: { mode: 'metrics-timeline' },
      content: {
        text: 'A training run without logs is almost impossible to debug. Track at least loss, validation metric, learning rate, and epoch timing. Persist both console logs and machine-readable summaries so you can compare runs later. Consistent metric naming is important for dashboards and scripts. Good observability turns random experiments into engineering workflows.',
        goDeeper: {
          explanation:
            'Include metadata headers in logs: run ID, git SHA (if available), config hash, and hardware context. This makes result interpretation and backtracking much easier.',
        },
      },
      quiz: {
        question: 'Which metric practice is most useful for comparing runs?',
        options: [
          'Changing metric names each script',
          'Logging only final epoch',
          'Consistent metric keys with per-epoch values',
          'Disabling validation metrics',
        ],
        correctIndex: 2,
        explanation: 'Consistent keys and timeline values enable reliable comparisons.',
      },
    },
    {
      id: 'debugging-patterns',
      title: 'Debugging Patterns for ML Pipelines',
      visualizationProps: { mode: 'debug-funnel' },
      content: {
        text: 'Most ML failures are pipeline issues: shape mismatches, dtype drift, bad splits, exploding gradients, or silent NaNs. Build a debugging funnel: verify data, then model inputs, then loss behavior, then gradients, then optimizer updates. Add assertions and early sanity checks in each stage. This systematic order prevents random trial-and-error debugging. Good debugging patterns dramatically reduce iteration time.',
        goDeeper: {
          explanation:
            'A practical checklist: print one batch shape and dtype, check min/max values, verify loss decreases on a tiny subset, and inspect gradient norms. Fail fast on invalid states.',
        },
      },
      quiz: {
        question: 'What is the best first step when training diverges unexpectedly?',
        options: [
          'Increase model size immediately',
          'Check data/shape/dtype assumptions on a small batch',
          'Disable all logs',
          'Change five things at once',
        ],
        correctIndex: 1,
        explanation: 'Start with input correctness; many training failures begin in data contracts.',
      },
    },
    {
      id: 'testing-automation',
      title: 'Testing and Lightweight Automation',
      visualizationProps: { mode: 'qa-loop' },
      content: {
        text: 'Add small tests for data transforms, shape contracts, and key utility functions. You do not need huge test suites to get value; a few smoke tests catch many regressions. Automate linting and one basic training sanity test in CI or local scripts. This keeps your workflow stable while features evolve. Lightweight quality gates pay off quickly.',
      },
      quiz: {
        question: 'Which test gives high value early in ML projects?',
        options: [
          'A full benchmark suite only',
          'Smoke test that runs one tiny train/eval cycle successfully',
          'No tests until production',
          'Only visual UI tests',
        ],
        correctIndex: 1,
        explanation: 'A tiny end-to-end smoke test catches many pipeline regressions cheaply.',
      },
    },
    {
      id: 'capstone',
      title: 'Capstone: Reproducible Experiment Package',
      visualizationProps: { mode: 'capstone' },
      content: {
        text: 'Capstone: package a reproducible experiment with config file, deterministic seed, logging, checkpointing, and resume support. Include clear run instructions and expected outputs. Verify that another person can run and reproduce your metrics within tolerance. This is the point where your workflow becomes team-ready. You now have practical engineering discipline beyond model theory.',
      },
    },
  ],
  playground: {
    description: 'Practice reproducibility, debugging checklists, and config-based experiment workflows.',
    parameters: [],
    tryThis: [
      'Create a run config and load it into a training script.',
      'Add shape/dtype assertions before forward pass.',
      'Save a checkpoint and resume from it in a second run.',
      'Run a tiny smoke test for one epoch and validate metrics.',
    ],
  },
  challenges: [
    {
      id: 'checkpoint-repro-scaffold',
      title: 'Checkpoint 1: Reproducible Scaffold',
      description: 'Set up deterministic environment + project scaffold + run instructions.',
      props: { stage: 1 },
      completionCriteria: { type: 'custom', target: 'scaffold-ready', metric: 'reproducibility' },
      hints: [
        'Pin dependencies and document setup commands.',
        'Store seed and config in one place.',
        'Separate artifacts from source code.',
      ],
    },
    {
      id: 'checkpoint-debug-lab',
      title: 'Checkpoint 2: Debug and Fix Scenario',
      description: 'Diagnose a failing training script and restore stable metric behavior.',
      props: { stage: 2 },
      completionCriteria: { type: 'custom', target: 'bug-fixed', metric: 'debug_quality' },
      hints: [
        'Validate data contract before model internals.',
        'Inspect one batch and gradient norms.',
        'Change one variable at a time during debugging.',
      ],
    },
    {
      id: 'capstone-experiment-package',
      title: 'Capstone: Experiment Package',
      description: 'Deliver reproducible run package with config, logs, checkpoint, and clear report.',
      props: { stage: 3 },
      completionCriteria: { type: 'custom', target: 'package-complete', metric: 'engineering_readiness' },
      hints: [
        'Include run command and expected output.',
        'Attach best checkpoint details and metric table.',
        'Verify resume flow from saved checkpoint.',
      ],
    },
  ],
};
