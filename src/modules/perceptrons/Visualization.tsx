'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface InputNode {
  value: number;
  weight: number;
}

interface PerceptronVisualizationProps {
  mode?: string;
  inputs?: InputNode[];
  bias?: number;
  activation?: string;
  draggableWeights?: boolean;
  showCalculation?: boolean;
  showGraph?: boolean;
  onParamsChange?: (params: { weights: number[]; bias: number }) => void;
}

export default function PerceptronVisualization(props: PerceptronVisualizationProps) {
  const {
    mode = 'interactive',
    inputs: initialInputs = [{ value: 1, weight: 0.5 }, { value: -1, weight: -0.5 }],
    bias: initialBias = 0.5,
    activation = 'step',
    draggableWeights = false,
    showCalculation = false,
    showGraph = false,
    onParamsChange,
  } = props;

  const [inputs, setInputs] = useState<InputNode[]>(initialInputs);
  const [bias, setBias] = useState(initialBias);

  useEffect(() => { 
    if (props.inputs) {
      const frame = requestAnimationFrame(() => setInputs(props.inputs!));
      return () => cancelAnimationFrame(frame);
    }
  }, [props.inputs]);
  
  useEffect(() => { 
    if (props.bias !== undefined) {
      const frame = requestAnimationFrame(() => setBias(props.bias!));
      return () => cancelAnimationFrame(frame);
    }
  }, [props.bias]);

  const updateWeight = (index: number, newWeight: number) => {
    const newInputs = [...inputs];
    newInputs[index].weight = newWeight;
    setInputs(newInputs);
    if (onParamsChange) onParamsChange({ weights: newInputs.map(i => i.weight), bias });
  };

  const updateBias = (newBias: number) => {
    setBias(newBias);
    if (onParamsChange) onParamsChange({ weights: inputs.map(i => i.weight), bias: newBias });
  };

  const sum = inputs.reduce((acc, curr) => acc + curr.value * curr.weight, 0) + bias;
  
  let output = 0;
  if (activation === 'step') output = sum > 0 ? 1 : 0;
  else if (activation === 'sigmoid') output = 1 / (1 + Math.exp(-sum));
  else if (activation === 'relu') output = Math.max(0, sum);

  return (
    <div className="w-full h-full max-w-[600px] mx-auto bg-slate-900 rounded-xl p-6 relative flex flex-col items-center justify-center border border-slate-800">
      
      <div className="flex w-full items-center justify-between mt-8 mb-12 relative px-4 text-white">
        
        {/* Lines connecting inputs to neuron */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)', height: '150px' }}>
          {inputs.map((inp, i) => {
            const startY = i === 0 ? 30 : 120;
            return (
              <line key={`line-${i}`} x1="80" y1={startY} x2="calc(50% - 40px)" y2="75" stroke={inp.weight >= 0 ? '#34d399' : '#f87171'} strokeWidth={Math.max(1, Math.abs(inp.weight) * 3)} opacity={0.6} />
            );
          })}
          {/* Bias line */}
          <line x1="50%" y1="140" x2="50%" y2="95" stroke="#fbbf24" strokeWidth={Math.max(1, Math.abs(bias) * 3)} opacity={0.6} strokeDasharray="4,4" />
          
          {/* Output line */}
          <line x1="calc(50% + 40px)" y1="75" x2="calc(100% - 50px)" y2="75" stroke="var(--accent)" strokeWidth={3} />
        </svg>

        {/* Inputs */}
        <div className="flex flex-col gap-8 z-10 w-24">
          {inputs.map((inp, i) => (
            <div key={`in-${i}`} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-mono font-bold">
                {inp.value}
              </div>
              <span className="text-xs text-slate-400">x{i+1}</span>
              {draggableWeights && (
                <input 
                  type="range" min="-2" max="2" step="0.1" 
                  value={inp.weight} onChange={(e) => updateWeight(i, parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              )}
              <span className={`text-xs font-mono font-bold ${inp.weight >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                w{i+1}: {inp.weight.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Neuron */}
        <div className="flex flex-col items-center z-10 relative">
          <div className="w-24 h-24 rounded-full bg-indigo-900 border-4 border-indigo-500 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <span className="text-sm text-indigo-200">Σ</span>
            <span className="font-mono font-bold text-lg">{sum.toFixed(2)}</span>
          </div>
          <div className="absolute -bottom-16 flex flex-col items-center">
            {draggableWeights && (
              <input 
                type="range" min="-3" max="3" step="0.1" 
                value={bias} onChange={(e) => updateBias(parseFloat(e.target.value))}
                className="w-20 accent-amber-500"
              />
            )}
            <span className="text-xs font-mono font-bold text-amber-400 mt-1">
              bias: {bias.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col items-center z-10 w-24">
          <div className={`w-16 h-16 rounded-lg ${output > 0 ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-800 border-slate-600'} border-2 flex flex-col items-center justify-center shadow-lg transition-colors duration-300`}>
            <span className="text-xs opacity-70 mb-1">{activation}</span>
            <span className="font-mono font-bold text-xl">{output.toFixed(activation === 'step' ? 0 : 2)}</span>
          </div>
          <span className="text-xs text-slate-400 mt-2">Output (y)</span>
        </div>

      </div>

      {showCalculation && (
        <div className="mt-8 bg-slate-800 px-4 py-3 rounded text-sm font-mono text-slate-300 flex items-center justify-center w-full max-w-sm border border-slate-700">
          y = f( {inputs.map((inp, i) => `(${inp.value} × ${inp.weight.toFixed(1)})`).join(' + ')} + ({bias.toFixed(1)}) )
        </div>
      )}

    </div>
  );
}
