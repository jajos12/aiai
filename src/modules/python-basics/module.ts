import { ModuleData } from '../../core/types';

export const moduleData: ModuleData = {
  id: 'python-zero-to-ai-scripting',
  tierId: 0.5,
  clusterId: 'engineering',
  title: 'Python Zero to AI Scripting',
  description: 'Start from zero Python knowledge and build toward practical AI scripting with projects at every stage.',
  tags: ['Python', 'Basics', 'Engineering'],
  prerequisites: [],
  difficulty: 'beginner',
  estimatedMinutes: 75,
  steps: [
    {
      id: 'start-from-zero',
      title: 'Start from Zero: What Python Is',
      visualizationProps: { mode: 'zero-to-one-roadmap' },
      content: {
        text: "You need zero prior coding knowledge for this course. Python is a language used to give step-by-step instructions to a computer, and AI engineers use it because it is readable and has a huge ecosystem. In this module, you will move from writing your first variables to building small AI-style data scripts. Think of Python as your interface between ideas and experiments. By the end, you will be able to read and write real beginner ML code with confidence.",
        goDeeper: {
          explanation:
            "This course is structured in stages: syntax fundamentals, data manipulation, reusable code structure, and mini-project execution. Every stage includes checkpoints so you can prove understanding before moving forward. The goal is not memorization, but fluency through repeated practical use.",
        },
      },
      quiz: {
        question: 'What is the main goal of Python in AI workflows?',
        options: [
          'Only to build web pages',
          'To write clear code for data processing and model experiments',
          'To replace all math',
          'To avoid using libraries',
        ],
        correctIndex: 1,
        explanation:
          'Python is the practical language that connects data, math, and ML libraries in real projects.',
      },
    },
    {
      id: 'variables-and-types',
      title: 'Variables, Types, and Memory',
      visualizationProps: { mode: 'variables-memory' },
      content: {
        text: "A variable is a named box that stores data. Python data types like `int`, `float`, `str`, and `bool` are the foundation of every ML pipeline. If you cannot confidently track data types, debugging later code becomes painful. In this step, focus on reading values, predicting their types, and understanding reassignment. This is your first debugging skill: always know what type each variable holds.",
        goDeeper: {
          explanation:
            "Python names reference objects in memory. Reassigning a variable points the name to a new object, which is why understanding mutability matters later for lists and dictionaries. In ML code, type mismatches (for example string vs float) are one of the most common beginner bugs.",
        },
      },
      quiz: {
        question: 'Which value is a float in Python?',
        options: ['7', '"7.0"', '7.0', 'True'],
        correctIndex: 2,
        explanation: 'A float has a decimal representation such as 7.0.',
      },
      interactionHint: 'Change the sample value and observe how type output changes.',
    },
    {
      id: 'control-flow',
      title: 'Control Flow: if, for, while',
      visualizationProps: { mode: 'control-flow' },
      content: {
        text: "Control flow tells Python when to do something and how many times to repeat it. `if` statements handle decisions, and loops handle repetition. This is essential in AI for training epochs, data filtering, and condition-based logic. Start by reading simple branching examples, then track loop variables by hand. If you can trace execution line by line, you can debug most beginner scripts.",
        goDeeper: {
          explanation:
            "A strong mental model is: condition -> branch; iterable -> loop body repeated. In AI workflows, this appears in training loops (`for epoch in range(...)`), sample filtering (`if label == ...`), and stopping rules (`while loss > threshold`).",
        },
      },
      quiz: {
        question: 'Which statement is best for repeating over every element in a list?',
        options: ['if', 'for', 'while True only', 'return'],
        correctIndex: 1,
        explanation: '`for` loops are the standard way to iterate through list items.',
      },
    },
    {
      id: 'functions',
      title: 'Functions: Reusable Logic Blocks',
      visualizationProps: { mode: 'functions-pipeline' },
      content: {
        text: "Functions let you package repeated logic into one reusable block. In AI scripts, this keeps code clean: one function for loading data, one for preprocessing, one for evaluation. Learn parameters, return values, and docstring habits now to avoid spaghetti code later. A good function does one job clearly. This is where your scripts start to look like professional code.",
        goDeeper: {
          explanation:
            "Function boundaries create testable units. In ML engineering, testable units reduce hidden bugs and make experiments reproducible. Naming and explicit return values are part of engineering quality, not style preference.",
        },
      },
      quiz: {
        question: 'What is the main reason to use functions?',
        options: [
          'To make code longer',
          'To avoid variables',
          'To reuse and organize logic cleanly',
          'To run only once',
        ],
        correctIndex: 2,
        explanation: 'Functions improve reuse, readability, and maintainability.',
      },
    },
    {
      id: 'lists-and-comprehensions',
      title: 'Lists and Comprehensions for Data Work',
      visualizationProps: { mode: 'interactive-comprehension' },
      content: {
        text: "AI work often starts with transforming lists of samples, labels, or feature values. List comprehensions are a compact way to map and filter data. They are easier to read than many nested loops when used well. Practice converting simple loops into comprehensions to build fluency. This pattern appears everywhere in preprocessing scripts.",
        goDeeper: {
          explanation:
            "Comprehensions are typically faster than pure Python append loops and reduce boilerplate. Use them for concise transformations, but avoid over-complex one-liners. A good engineering rule is readability first, then micro-optimization.",
          math: "\\text{NewList} = \\{ f(x) \\mid x \\in S, P(x) \\}",
        },
      },
      quiz: {
        question: 'Which comprehension keeps only even numbers then squares them?',
        options: [
          '[x for x in data if x % 2 == 0]',
          '[x**2 for x in data if x % 2 == 0]',
          '[x**2 if x % 2 == 0 else x]',
          '[x % 2 for x in data]',
        ],
        correctIndex: 1,
        explanation: 'This form both filters (`if`) and transforms (`x**2`).',
      },
      interactionHint: "Try `x**2`, `x+10`, and `x if x % 2 == 0 else 0`.",
    },
    {
      id: 'dicts-json',
      title: 'Dictionaries and JSON-like Records',
      visualizationProps: { mode: 'dict-data-flow' },
      content: {
        text: "Most AI datasets eventually become key-value records: feature names, labels, metadata, and configuration values. Python dictionaries are the core structure for this. Learn to create, update, and safely read keys, because config and model outputs often come in dict form. This step also prepares you for JSON files used in APIs and experiment tracking. Strong dict fluency saves hours of debugging.",
        goDeeper: {
          explanation:
            "JSON maps naturally to Python dictionaries and lists, which makes Python ideal for config-driven ML systems. Defensive access patterns (`dict.get`) prevent crashes when keys are missing. This is a practical reliability habit for production pipelines.",
        },
      },
      quiz: {
        question: 'What is the safest way to read an optional key from a dict?',
        options: ['d["missing"]', 'd.get("missing", default)', 'd.missing', 'dict.read("missing")'],
        correctIndex: 1,
        explanation: '`get` allows a fallback and avoids KeyError.',
      },
    },
    {
      id: 'classes-for-ai',
      title: 'Classes for AI Code Organization',
      visualizationProps: { mode: 'class-diagram' },
      content: {
        text: "Classes group related data and behavior together. In AI frameworks, models and datasets are often represented as classes. You do not need advanced OOP theory to start; just understand constructors (`__init__`) and methods. Classes help you structure growing scripts into reusable components. This is the bridge from beginner scripts to framework-style code.",
        goDeeper: {
          explanation:
            "A class is a blueprint, and objects are instances of that blueprint. Organizing preprocessing, configuration, or model behavior in classes makes larger projects easier to extend. This directly prepares you for `nn.Module` in PyTorch.",
        },
      },
      quiz: {
        question: 'What does `__init__` usually do in a class?',
        options: [
          'Deletes the object',
          'Runs once to initialize object state',
          'Compiles Python code',
          'Runs after every method',
        ],
        correctIndex: 1,
        explanation: '`__init__` sets up initial attributes when an object is created.',
      },
    },
    {
      id: 'env-and-packages',
      title: 'Environment, Packages, and Reproducibility',
      visualizationProps: { mode: 'env-workflow' },
      content: {
        text: "Real AI projects need clean environments and dependency control. Learn what `venv` is, why `pip install` should happen in an isolated environment, and how `requirements.txt` keeps setups reproducible. This step moves you from tutorial code to engineering workflow. If environments are messy, experiments become non-reproducible. Reproducibility is a core AI engineering skill.",
        goDeeper: {
          explanation:
            "A virtual environment isolates package versions per project. Pinning dependency versions avoids 'works on my machine' failures. Team and research workflows depend on deterministic setup before any model work begins.",
        },
      },
      quiz: {
        question: 'Why use a virtual environment for AI projects?',
        options: [
          'To make Python slower',
          'To isolate dependencies per project',
          'To avoid installing packages',
          'To replace NumPy',
        ],
        correctIndex: 1,
        explanation: 'Virtual environments prevent package conflicts across projects.',
      },
    },
    {
      id: 'project-stage-1',
      title: 'Project Stage 1: Build a Data Cleaner',
      visualizationProps: { mode: 'project-stage', stage: 1 },
      content: {
        text: "Project checkpoint: write a script that takes raw numeric data, removes invalid entries, and outputs clean values with summary statistics. This stage uses variables, conditionals, loops, and functions together. You are now doing real pipeline work, not isolated syntax drills. Treat this as your first AI data preprocessing task. Build, run, and validate expected output.",
        goDeeper: {
          explanation:
            "A minimal cleaner should include input validation, conversion to numeric types, and reporting (count, min, max, mean). This mirrors the first stage in real ML pipelines where bad data silently breaks model training quality.",
        },
      },
      interactionHint: 'Implement cleaner.py and test it with mixed valid/invalid inputs.',
    },
    {
      id: 'project-stage-2',
      title: 'Project Stage 2: Feature Engineering Script',
      visualizationProps: { mode: 'project-stage', stage: 2 },
      content: {
        text: "Second checkpoint: extend your script to generate simple features such as normalized value, binary threshold flags, and derived ratios. Use list comprehensions and dictionaries to represent each sample record. This stage introduces ML-style feature construction from raw inputs. Keep functions small and test each transformation independently. You are now writing code that resembles real tabular preprocessing.",
        goDeeper: {
          explanation:
            "Feature engineering maps raw attributes into more predictive representations. Even with deep learning, good preprocessing improves stability and interpretability. Structure your output as list-of-dicts so it can easily feed NumPy or Pandas later.",
        },
      },
      interactionHint: 'Add `normalize()`, `build_features()`, and verify output schema.',
    },
    {
      id: 'final',
      title: 'Project Stage 3: Mini AI Pipeline',
      visualizationProps: { mode: 'full-script' },
      content: {
        text: "Final checkpoint: combine all stages into one mini pipeline script: load raw data, clean it, engineer features, and print a final report. Add command-line parameters for input path and threshold to make it configurable. This is a real engineering milestone: an end-to-end reproducible script. Once you complete this, you are ready for NumPy with strong Python foundations. You now have beginner-to-practical Python capability for AI work.",
        goDeeper: {
          explanation:
            "A complete pipeline script should include modular functions, clear input/output contracts, and deterministic behavior. This is the exact pattern used before model training in professional ML projects. Your next module (NumPy) will optimize these same steps using vectorized arrays.",
        },
      },
    },
  ],
  playground: {
    description: 'Experiment with Python code, data transformations, and staged mini-project ideas.',
    parameters: [],
    tryThis: [
      'Create a variable `temperature = 23.5` and print its type.',
      'Write a loop that filters out negative values from a list.',
      'Build a function `clean(values)` that drops non-numeric entries.',
      'Use a list comprehension to square only even numbers.',
      'Create a dictionary record for one sample: {"age": 21, "score": 0.83, "label": 1}.',
    ],
  },
  challenges: [
    {
      id: 'checkpoint-cleaner',
      title: 'Checkpoint 1: Data Cleaner',
      description: 'Write a script that converts mixed raw inputs into a clean numeric list and reports count/mean.',
      props: { stage: 1 },
      completionCriteria: { type: 'custom', target: 'cleaned-output', metric: 'project_checkpoint' },
      hints: [
        'Use `try/except` when converting values to float.',
        'Track invalid entries in a separate list for reporting.',
        'Create a helper function `is_valid_number` to keep logic clean.',
      ],
    },
    {
      id: 'checkpoint-features',
      title: 'Checkpoint 2: Feature Builder',
      description: 'Transform cleaned values into feature dictionaries with normalized and threshold fields.',
      props: { stage: 2 },
      completionCriteria: { type: 'custom', target: 'feature-schema', metric: 'project_checkpoint' },
      hints: [
        'Define output schema first, then fill values.',
        'Use list comprehensions for transformation and filtering.',
        'Add small tests with 3-5 known inputs and expected outputs.',
      ],
    },
    {
      id: 'checkpoint-pipeline',
      title: 'Checkpoint 3: End-to-End Pipeline',
      description: 'Combine loading, cleaning, feature generation, and summary reporting in one runnable script.',
      props: { stage: 3 },
      completionCriteria: { type: 'custom', target: 'pipeline-complete', metric: 'project_checkpoint' },
      hints: [
        'Organize code into `main()`, `load_data()`, `clean_data()`, and `build_features()`.',
        'Add CLI args for file path and threshold value.',
        'Print a final summary block that verifies pipeline outputs.',
      ],
    },
  ],
};
