'use client';

import React from 'react';

interface EngineeringVizProps {
  mode?: string;
}

function Card({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-xs">
      <p className="text-[11px] uppercase tracking-widest text-indigo-300">{title}</p>
      <ul className="mt-2 space-y-1 text-slate-300">
        {bullets.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>
    </div>
  );
}

export default function EngineeringVisualization({ mode = 'project-scaffold' }: EngineeringVizProps) {
  const modeMap: Record<string, { title: string; bullets: string[] }> = {
    'project-scaffold': {
      title: 'Project Scaffold',
      bullets: [
        'Use clear folders for src, configs, data, artifacts, tests.',
        'Pin dependencies and store environment setup steps.',
        'Keep reproducibility rules in README or docs.',
      ],
    },
    'config-flow': {
      title: 'Config-Driven Workflow',
      bullets: [
        'Load hyperparameters from config files.',
        'Snapshot config into each run artifact.',
        'Avoid hidden defaults spread across scripts.',
      ],
    },
    'metrics-timeline': {
      title: 'Metrics Timeline',
      bullets: [
        'Log train/val metrics each epoch.',
        'Track run metadata: seed, config ID, checkpoint path.',
        'Use consistent metric naming across experiments.',
      ],
    },
    'debug-funnel': {
      title: 'Debug Funnel',
      bullets: [
        'Data contract -> shapes -> loss -> gradients -> optimizer.',
        'Fail fast on NaN/Inf and invalid dtypes.',
        'Change one variable at a time during diagnosis.',
      ],
    },
    'qa-loop': {
      title: 'Quality Gate Loop',
      bullets: [
        'Run lint + smoke test before long experiments.',
        'Add shape and schema assertions in core transforms.',
        'Automate one tiny train/eval cycle as baseline check.',
      ],
    },
    capstone: {
      title: 'Capstone Deliverable',
      bullets: [
        'Reproducible run command with config snapshot.',
        'Best checkpoint + metric report + resume proof.',
        'Clear notes on known limitations and next steps.',
      ],
    },
  };

  const card = modeMap[mode] ?? modeMap['project-scaffold'];

  return (
    <div className="w-full h-full bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-center">
      <Card title={card.title} bullets={card.bullets} />
    </div>
  );
}
