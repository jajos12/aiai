'use client';

import React, { useMemo, useState } from 'react';

interface PythonVizProps {
  mode?: string;
  stage?: number;
}

export default function PythonVisualization({ mode = 'code-highlight' }: PythonVizProps) {
  const [listData, setListData] = useState([1, 2, 3, 4, 5]);
  const [transform, setTransform] = useState('x * 2');
  const output = useMemo(() => {
    try {
      const fn = new Function('x', `return ${transform}`);
      return listData.map(x => fn(x));
    } catch {
      return [];
    }
  }, [listData, transform]);

  const card =
    'rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl backdrop-blur-sm';

  const renderRoadmap = () => (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        {
          title: 'Stage 1',
          subtitle: 'Syntax + Types',
          img: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
          points: ['Variables', 'Control flow', 'Functions'],
        },
        {
          title: 'Stage 2',
          subtitle: 'Data Handling',
          img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80&auto=format&fit=crop',
          points: ['Lists + dicts', 'Comprehensions', 'Validation'],
        },
        {
          title: 'Stage 3',
          subtitle: 'Mini Projects',
          img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80&auto=format&fit=crop',
          points: ['Cleaner script', 'Feature builder', 'End-to-end pipeline'],
        },
      ].map((item) => (
        <div key={item.title} className={card}>
          <div className="h-28 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 mb-3 flex items-center justify-center">
            <img src={item.img} alt={item.subtitle} className="h-full w-full object-cover" />
          </div>
          <p className="text-[11px] uppercase tracking-widest text-indigo-300">{item.title}</p>
          <h4 className="text-white font-semibold mt-1">{item.subtitle}</h4>
          <ul className="text-xs text-slate-300 mt-2 space-y-1">
            {item.points.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderTypesLab = () => (
    <div className={`${card} w-full max-w-2xl`}>
      <p className="text-xs uppercase tracking-widest text-indigo-300 mb-3">Type Inspector</p>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          { value: '42', type: 'int' },
          { value: '3.14', type: 'float' },
          { value: '"hello"', type: 'str' },
          { value: 'True', type: 'bool' },
        ].map((row) => (
          <div key={row.value} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
            <p className="text-slate-200 font-mono">{row.value}</p>
            <p className="text-emerald-300 mt-1">type {'->'} {row.type}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFlowControl = () => (
    <div className={`${card} w-full max-w-3xl`}>
      <p className="text-xs uppercase tracking-widest text-indigo-300 mb-3">Execution Flow</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
          <p className="text-amber-300 font-semibold">if</p>
          <p className="text-slate-300 mt-1">Decision branch based on condition.</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
          <p className="text-cyan-300 font-semibold">for</p>
          <p className="text-slate-300 mt-1">Iterate over dataset samples.</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
          <p className="text-pink-300 font-semibold">while</p>
          <p className="text-slate-300 mt-1">Repeat until stop condition.</p>
        </div>
      </div>
    </div>
  );

  const renderFunctionPipeline = () => (
    <div className={`${card} w-full max-w-3xl`}>
      <p className="text-xs uppercase tracking-widest text-indigo-300 mb-3">Pipeline by Functions</p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {['load_data()', 'clean_data()', 'build_features()', 'validate()', 'export()'].map((step, i) => (
          <React.Fragment key={step}>
            <div className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-200 font-mono">
              {step}
            </div>
            {i < 4 && <span className="text-slate-500">→</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderDataStructures = () => (
    <div className={`${card} w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs`}>
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
        <p className="text-cyan-300 font-semibold">List</p>
        <p className="font-mono text-slate-200 mt-1">[0.3, 0.8, 0.1]</p>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
        <p className="text-amber-300 font-semibold">Dict</p>
        <p className="font-mono text-slate-200 mt-1">{'{ "age": 21, "label": 1 }'}</p>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
        <p className="text-emerald-300 font-semibold">Tuple</p>
        <p className="font-mono text-slate-200 mt-1">(feature, label)</p>
      </div>
    </div>
  );

  const renderComprehension = () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm border border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-400 ml-2 italic">interactive_python.py</span>
        </div>
        
        <div className="space-y-2">
          <p className="text-blue-400"># Input Data</p>
          <p className="text-pink-400">data = <span className="text-yellow-200">[{listData.join(', ')}]</span></p>
          
          <div className="mt-6 py-4 px-2 border-l-2 border-blue-500 bg-blue-500/5">
            <p className="text-blue-400"># The Comprehension</p>
            <div className="flex items-center gap-2 text-lg">
              <span className="text-slate-200">[</span>
              <input 
                value={transform}
                onChange={(e) => setTransform(e.target.value)}
                className="bg-slate-800 text-yellow-300 border-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 w-32 outline-none font-bold"
              />
              <span className="text-pink-400">for</span>
              <span className="text-yellow-200">x</span>
              <span className="text-pink-400">in</span>
              <span className="text-slate-200">data]</span>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <p className="text-green-400">{">>>"} Output</p>
            <p className="text-yellow-100 text-lg font-bold">
              [{output.join(', ')}]
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group"
          onClick={() => setTransform('x**2')}>
          <p className="text-xs text-slate-400 mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-widest">Preset 1</p>
          <code className="text-yellow-200 group-hover:text-white transition-colors">x**2 (Square)</code>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group"
          onClick={() => setTransform('x + 10')}>
          <p className="text-xs text-slate-400 mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-widest">Preset 2</p>
          <code className="text-yellow-200 group-hover:text-white transition-colors">x + 10 (Add)</code>
        </div>
      </div>
    </div>
  );

  const renderClassDiagram = () => (
    <div className="flex justify-center items-center h-[400px]">
      <svg width="450" height="350" viewBox="0 0 450 350">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--slate-400)" />
          </marker>
        </defs>

        {/* Base Class */}
        <rect x="150" y="20" width="150" height="80" rx="4" fill="var(--slate-800)" stroke="var(--slate-600)" />
        <text x="225" y="45" textAnchor="middle" fill="white" fontWeight="bold">nn.Module</text>
        <line x1="150" y1="55" x2="300" y2="55" stroke="var(--slate-700)" />
        <text x="160" y="72" fill="var(--slate-400)" fontSize="10">__init__()</text>
        <text x="160" y="88" fill="var(--slate-400)" fontSize="10">forward()</text>

        {/* Inherited Class */}
        <path d="M 225 140 L 225 105" stroke="var(--slate-600)" strokeWidth="2" markerEnd="url(#arrow)" />
        
        <rect x="125" y="150" width="200" height="120" rx="4" fill="var(--blue-500)" fillOpacity="0.1" stroke="var(--blue-500)" />
        <text x="225" y="175" textAnchor="middle" fill="white" fontWeight="bold">TransformerModel</text>
        <line x1="125" y1="185" x2="325" y2="185" stroke="var(--blue-500)" strokeWidth="2" />
        <text x="140" y="205" fill="var(--blue-200)" fontSize="12">def __init__(self):</text>
        <text x="155" y="225" fill="var(--blue-100)" fontSize="12">super().__init__()</text>
        <text x="140" y="250" fill="var(--blue-200)" fontSize="12">def forward(self, x):</text>

        <circle cx="340" cy="160" r="15" fill="var(--yellow-500)" opacity="0.8">
          <animate attributeName="r" values="15;18;15" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="365" y="165" fill="var(--yellow-200)" fontSize="10">Subclassing Pattern</text>
      </svg>
    </div>
  );

  const renderRuntimeDebug = () => (
    <div className={`${card} w-full max-w-3xl`}>
      <p className="text-xs uppercase tracking-widest text-indigo-300 mb-3">Debug & Runtime Safety</p>
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 font-mono text-xs text-slate-200">
        <p>try:</p>
        <p className="pl-4">value = float(raw)</p>
        <p>except ValueError:</p>
        <p className="pl-4 text-rose-300">log("invalid row")</p>
      </div>
      <p className="text-xs text-slate-400 mt-3">Always fail gracefully and keep a record of bad inputs.</p>
    </div>
  );

  const renderProjectStage = (title: string, tasks: string[]) => (
    <div className={`${card} w-full max-w-3xl`}>
      <p className="text-xs uppercase tracking-widest text-indigo-300 mb-2">{title}</p>
      <div className="space-y-2 text-xs">
        {tasks.map((task, i) => (
          <div key={task} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-slate-200">
            <span className="text-indigo-300 font-semibold mr-2">Step {i + 1}.</span>
            {task}
          </div>
        ))}
      </div>
    </div>
  );

  function renderMode() {
    switch (mode) {
      case 'python-zero':
      case 'zero-to-one-roadmap':
        return renderRoadmap();
      case 'types-lab':
      case 'variables-memory':
        return renderTypesLab();
      case 'flow-control':
      case 'control-flow':
        return renderFlowControl();
      case 'function-pipeline':
      case 'functions-pipeline':
        return renderFunctionPipeline();
      case 'data-structures':
      case 'dict-data-flow':
        return renderDataStructures();
      case 'interactive-comprehension':
        return renderComprehension();
      case 'class-diagram':
        return renderClassDiagram();
      case 'runtime-debug':
      case 'env-workflow':
        return renderRuntimeDebug();
      case 'project-stage-1':
        return renderProjectStage('Project Stage 1: Cleaner', [
          'Validate and parse raw values',
          'Drop or flag invalid entries',
          'Output clean schema summary',
        ]);
      case 'project-stage-2':
        return renderProjectStage('Project Stage 2: Features', [
          'Normalize numerical values',
          'Encode categorical fields',
          'Produce deterministic feature vectors',
        ]);
      case 'project-stage':
        return renderProjectStage('Project Checkpoint', [
          'Implement required script stage',
          'Run with sample + broken inputs',
          'Verify output schema and logs',
        ]);
      case 'capstone':
      case 'full-script':
        return renderProjectStage('Capstone: End-to-End Pipeline', [
          'Load -> clean -> transform -> validate',
          'Add CLI parameters and error handling',
          'Export model-ready output and report',
        ]);
      default:
        return (
          <div className="text-center">
            <div className="w-24 h-24 mb-6 mx-auto rounded-3xl bg-blue-500/20 flex items-center justify-center border border-blue-500 animate-pulse">
              <span className="text-4xl text-blue-400">🐍</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Python for AI</h3>
            <p className="text-slate-400 max-w-sm">
              Beginner-first interactive lab with quizzes and project checkpoints.
            </p>
          </div>
        );
    }
  }

  return (
    <div className="w-full h-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-8">
      {renderMode()}
    </div>
  );
}
