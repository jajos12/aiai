import { ModuleData } from '../../core/types';

export const moduleData: ModuleData = {
  id: 'pytorch-training-workflows',
  tierId: 0.5,
  clusterId: 'engineering',
  title: 'PyTorch Training Workflows',
  description:
    'Learn practical PyTorch engineering: tensors, autograd, training loops, checkpointing, and reproducible experiments.',
  tags: ['PyTorch', 'Deep Learning', 'Engineering'],
  prerequisites: ['numpy-data-and-performance'],
  difficulty: 'intermediate',
  estimatedMinutes: 95,
  steps: [
    {
      id: 'tensors',
      title: 'Tensors and Devices',
      visualizationProps: { mode: 'tensor-viz' },
      content: {
        text: "PyTorch tensors are NumPy-like arrays with native support for device placement and gradient tracking. In real workflows, you must always know tensor shape, dtype, and device (`cpu`, `cuda`, or `mps`). Device mismatches are one of the most common beginner errors. Learn to move tensors and models consistently using `.to(device)`. Clean device discipline prevents a large class of runtime failures.",
        goDeeper: {
          explanation:
            'A robust pattern is: define device once, move model once, move every batch to that device in the loop. Mixed device operations fail immediately. Logging shape and device early in each script reduces debug time.',
        },
      },
      quiz: {
        question: 'What is a common PyTorch runtime bug in beginner training scripts?',
        options: [
          'Using too many comments',
          'Mixing CPU tensors with GPU model parameters',
          'Calling print()',
          'Using float32',
        ],
        correctIndex: 1,
        explanation: 'All tensors participating in operations must be on compatible devices.',
      },
    },
    {
      id: 'autograd',
      title: 'Autograd: Automatic Differentiation',
      visualizationProps: { mode: 'computation-graph' },
      content: {
        text: "Autograd builds a dynamic computation graph during forward execution and computes gradients during backward pass. This lets you train complex models without manually deriving gradients. The engineering focus is understanding when gradients should be tracked and when they should not. Use `torch.no_grad()` for evaluation and inference to save memory and avoid accidental gradient accumulation. Clear gradient boundaries are critical for stable training.",
        goDeeper: {
          explanation:
            "PyTorch stores operation history as `grad_fn` links and traverses them in reverse mode during `backward()`. Gradients accumulate in parameter `.grad` buffers unless explicitly reset. This is why `optimizer.zero_grad()` is part of every standard loop.",
          math: "\\nabla_x y = \\frac{\\partial y}{\\partial z} \\cdot \\frac{\\partial z}{\\partial x}",
        },
      },
      quiz: {
        question: 'Why do we call `optimizer.zero_grad()` before `loss.backward()`?',
        options: [
          'To randomize gradients',
          'To clear accumulated gradients from previous steps',
          'To move data to GPU',
          'To freeze all layers',
        ],
        correctIndex: 1,
        explanation: 'PyTorch accumulates gradients by default; zeroing prevents unintended carry-over.',
      },
    },
    {
      id: 'modules',
      title: 'nn.Module and Model Structure',
      visualizationProps: { mode: 'module-lifecycle' },
      content: {
        text: "PyTorch models are classes inheriting from `nn.Module`, with layers defined in `__init__` and computation in `forward`. This structure makes parameter management, serialization, and composition predictable. Good engineering practice keeps `forward` focused on data flow and moves utility logic outside the model. Clear model boundaries improve maintainability when architectures evolve. Think of `nn.Module` as your core abstraction for reusable model components.",
        goDeeper: {
          explanation:
            'Nested modules register parameters automatically, enabling optimizers and checkpointing to work transparently. Using small submodules improves readability and testability for larger projects.',
        },
      },
      quiz: {
        question: 'Where should learnable layers usually be declared in a custom PyTorch model?',
        options: ['inside training loop', 'inside __init__ of nn.Module', 'inside print statements', 'inside optimizer'],
        correctIndex: 1,
        explanation: 'Declaring layers in `__init__` ensures parameters are registered correctly.',
      },
    },
    {
      id: 'training-loop',
      title: 'The Training Loop (Train/Eval Discipline)',
      visualizationProps: { mode: 'loop-viz' },
      content: {
        text: "A reliable PyTorch loop alternates between training and evaluation phases with explicit mode switches. In train mode, run forward, compute loss, zero grads, backward, and optimizer step. In eval mode, disable gradients and compute metrics only. This separation prevents subtle behavior differences (for example dropout and batchnorm) from polluting validation results. Engineering-grade loops prioritize clarity and metric traceability.",
        goDeeper: {
          explanation:
            'Use `model.train()` for training and `model.eval()` with `torch.no_grad()` for evaluation. Track per-epoch loss and at least one task-relevant metric. Store best-checkpoint logic based on validation performance.',
        },
      },
      quiz: {
        question: 'What should you do before validation inference?',
        options: [
          'Call model.train()',
          'Call model.eval() and use torch.no_grad()',
          'Delete optimizer',
          'Increase batch size randomly',
        ],
        correctIndex: 1,
        explanation: 'Eval mode + no_grad yields correct behavior and lower memory usage.',
      },
    },
    {
      id: 'datasets',
      title: 'Datasets, DataLoaders, and Batching',
      visualizationProps: { mode: 'batch-viz' },
      content: {
        text: "The Dataset/DataLoader pattern separates data definition from loading strategy. DataLoader handles batching, shuffling, and parallel workers so your training loop stays clean. Practical engineering includes choosing batch size, worker count, and pin-memory settings based on hardware constraints. Input pipeline bottlenecks can make expensive GPUs idle. Good loader configuration is often a bigger speedup than model tweaks.",
        goDeeper: {
          explanation:
            'Use deterministic seeds and fixed data splits for reproducibility. Validate one batch shape and dtype before long training runs. Input sanity checks catch many upstream data bugs early.',
        },
      },
      quiz: {
        question: 'Why is DataLoader useful in PyTorch workflows?',
        options: [
          'It replaces the model',
          'It automates batching/shuffling/loading mechanics',
          'It removes the need for losses',
          'It guarantees perfect accuracy',
        ],
        correctIndex: 1,
        explanation: 'DataLoader handles recurring input pipeline mechanics reliably.',
      },
    },
    {
      id: 'checkpointing-and-debug',
      title: 'Checkpointing and Debugging Patterns',
      visualizationProps: { mode: 'checkpoint-debug' },
      content: {
        text: "Professional training workflows save checkpoints and include debug hooks by default. Save model/optimizer state dicts so experiments can resume and compare fairly. Add gradient norm checks, NaN guards, and metric logs to catch failures early. Most training failures are engineering issues, not model theory issues. Debuggable pipelines are what separate experiments from prototypes.",
        goDeeper: {
          explanation:
            'Minimal checkpoint payload: epoch, model_state, optimizer_state, best_metric, and config snapshot. Resume logic should restore both model and optimizer for continuity. Logging learning curves is essential for diagnosing divergence.',
        },
      },
      quiz: {
        question: 'What should a robust checkpoint usually include besides model weights?',
        options: ['Only random screenshots', 'Optimizer state and training metadata', 'Dataset deletion command', 'GPU temperature only'],
        correctIndex: 1,
        explanation: 'Optimizer state and metadata are required for correct resume behavior.',
      },
    },
    {
      id: 'project-stage-1',
      title: 'Project Stage 1: Autograd Lab',
      visualizationProps: { mode: 'project-stage', stage: 1 },
      content: {
        text: 'Checkpoint 1: implement a toy autograd exercise with a simple scalar loss and verify gradients numerically. This confirms your gradient intuition before full model training. Compare analytical and autograd gradients on a small synthetic batch. Add assertions for shape and gradient finiteness. This stage builds trust in your training mechanics.',
      },
      interactionHint: 'Log parameter values and grads each step to inspect update behavior.',
    },
    {
      id: 'project-stage-2',
      title: 'Project Stage 2: Full Train/Eval Loop',
      visualizationProps: { mode: 'project-stage', stage: 2 },
      content: {
        text: 'Checkpoint 2: build a complete train/eval loop on a toy dataset with metric tracking and early checkpoint saving. Include mode switching, no_grad validation, and periodic logging. This is the standard backbone of practical deep learning scripts. Keep function boundaries clean: `train_one_epoch`, `evaluate`, `save_checkpoint`. Reusable loops are foundational engineering assets.',
      },
      interactionHint: 'Track train and validation metrics separately each epoch.',
    },
    {
      id: 'final',
      title: 'Project Stage 3: MLP Training Capstone',
      visualizationProps: { mode: 'summary' },
      content: {
        text: 'Capstone stage: train a small MLP on a toy or tabular dataset end-to-end. Your script should include data loading, model definition, optimizer, train/eval phases, checkpointing, and final report output. Demonstrate stable loss behavior and reproducible runs with fixed seeds. This completes your practical PyTorch workflow foundation. You are now prepared for architecture-focused tiers with strong implementation discipline.',
      },
    },
  ],
  playground: {
    description: 'Experiment with tensor operations, gradient flow, loop structure, and checkpoint-safe workflows.',
    parameters: [],
    tryThis: [
      'Create two tensors on CPU, then move both to GPU/MPS and run matmul.',
      'Build a tiny autograd graph and print parameter gradients after backward.',
      'Implement one train step + one eval step with proper mode switching.',
      'Save and reload a model checkpoint with optimizer state.',
    ],
  },
  challenges: [
    {
      id: 'checkpoint-autograd',
      title: 'Checkpoint 1: Autograd Verification',
      description: 'Implement a toy gradient task and validate gradients are finite and directionally correct.',
      props: { stage: 1 },
      completionCriteria: { type: 'threshold', target: 0.99, metric: 'gradient_consistency' },
      hints: [
        'Print gradients and compare against manual expectations.',
        'Check for NaN/Inf after backward.',
        'Use tiny synthetic data first.',
      ],
    },
    {
      id: 'checkpoint-train-loop',
      title: 'Checkpoint 2: Train/Eval Workflow',
      description: 'Build a reusable loop with train/eval separation, logging, and validation metrics.',
      props: { stage: 2 },
      completionCriteria: { type: 'custom', target: 'loop-complete', metric: 'workflow_integrity' },
      hints: [
        'Keep `model.train()` and `model.eval()` explicit.',
        'Use `torch.no_grad()` for validation.',
        'Log both loss and one quality metric.',
      ],
    },
    {
      id: 'capstone-mlp-training',
      title: 'Capstone: End-to-End MLP Training',
      description: 'Train a small MLP with checkpoints and reproducible settings, then report final metrics.',
      props: { stage: 3 },
      completionCriteria: { type: 'custom', target: 'mlp-trained', metric: 'capstone_quality' },
      hints: [
        'Set seed and log config at start.',
        'Save best checkpoint by validation metric.',
        'Include a final summary with best epoch and metric.',
      ],
    },
  ],
};
