'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Line, Float, RoundedBox, Box } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface BackpropVisualizationProps {
  mode?: string;
  values?: { x: number; w: number; b: number; target: number };
}

/**
 * 3D Node Component for Backprop
 */
function ComputeNode({ position, label, value, color = "#6366f1", isOp = false }: { position: [number, number, number], label: string, value: string, color?: string, isOp?: boolean }) {
  return (
    <group position={position}>
      {isOp ? (
        <Sphere args={[0.4, 32, 32]}>
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.2} />
        </Sphere>
      ) : (
        <RoundedBox args={[1.2, 0.8, 0.5]} radius={0.1}>
          <meshStandardMaterial color={color} opacity={0.8} transparent />
        </RoundedBox>
      )}
      <Text position={[0, 0.7, 0]} fontSize={0.2} color="white" fontWeight="bold">{label}</Text>
      <Text position={[0, 0, 0.3]} fontSize={0.25} color="white">{value}</Text>
    </group>
  );
}

export default function BackpropVisualization({ mode = 'forward', values: initialValues = { x: 2, w: 3, b: -4, target: 5 } }: BackpropVisualizationProps) {
  const [w, setW] = useState(initialValues.w);
  const [b, setB] = useState(initialValues.b);
  const x = initialValues.x;
  const target = initialValues.target;

  // Forward Pass
  const multOut = w * x;
  const addOut = multOut + b;
  const reluOut = Math.max(0, addOut);
  const loss = 0.5 * Math.pow(reluOut - target, 2);

  // Backward Pass
  const dL_dRelu = reluOut - target;
  const dRelu_dAdd = addOut > 0 ? 1 : 0;
  const dL_dAdd = dL_dRelu * dRelu_dAdd;
  const dL_dB = dL_dAdd;
  const dL_dW = dL_dAdd * x;

  const showGradients = mode === 'backward' || mode === 'update' || mode === 'local-gradients';

  return (
    <div className="w-full flex flex-col gap-4">
      <Stage3D cameraPosition={[6, 3, 10]}>
        <group>
          {/* Inputs */}
          <ComputeNode position={[-4, 2, 0]} label="w" value={w.toFixed(2)} color="#1e40af" />
          <ComputeNode position={[-4, -2, 0]} label="x" value={x.toFixed(2)} color="#065f46" />
          <ComputeNode position={[-2, 3.5, 0]} label="b" value={b.toFixed(2)} color="#1e40af" />

          {/* Operations */}
          <ComputeNode position={[-2, 0, 0]} label="MULT" value={multOut.toFixed(2)} isOp />
          <ComputeNode position={[0.5, 1, 0]} label="ADD" value={addOut.toFixed(2)} isOp />
          <ComputeNode position={[3, 1, 0]} label="ReLU" value={reluOut.toFixed(2)} color="#581c87" />
          <ComputeNode position={[5.5, 1, 0]} label="LOSS" value={loss.toFixed(3)} color="#9a3412" />

          {/* Connections */}
          <Line points={[[-3.4, 2, 0], [-2, 0.4, 0]]} color="#475569" lineWidth={2} />
          <Line points={[[-3.4, -2, 0], [-2, -0.4, 0]]} color="#475569" lineWidth={2} />
          <Line points={[[-1.6, 0.4, 0], [0.1, 1, 0]]} color="#475569" lineWidth={2} />
          <Line points={[[-1.4, 3.5, 0], [0.5, 1.4, 0]]} color="#475569" lineWidth={2} />
          <Line points={[[0.9, 1, 0], [2.4, 1, 0]]} color="#475569" lineWidth={2} />
          <Line points={[[3.6, 1, 0], [4.9, 1, 0]]} color="#475569" lineWidth={2} />

          {/* Gradients */}
          {showGradients && (
            <group>
               <Line points={[[4.9, 0.8, 0], [3.6, 0.8, 0]]} color="#fb7185" lineWidth={2} dashed />
               <Text position={[4.25, 0.5, 0]} fontSize={0.15} color="#fb7185">dL: {dL_dRelu.toFixed(2)}</Text>
               
               <Line points={[[2.4, 0.8, 0], [0.9, 0.8, 0]]} color="#fb7185" lineWidth={2} dashed />
               <Text position={[1.65, 0.5, 0]} fontSize={0.15} color="#fb7185">dL: {dL_dAdd.toFixed(2)}</Text>
               
               <Line points={[[-2, 0.2, 0], [-3.4, 1.8, 0]]} color="#fb7185" lineWidth={2} dashed />
               <Text position={[-2.7, 0.8, 0]} fontSize={0.15} color="#fb7185">dL: {dL_dW.toFixed(2)}</Text>
               
               <Line points={[[0.5, 0.8, 0], [-1.4, 3.3, 0]]} color="#fb7185" lineWidth={2} dashed />
               <Text position={[-0.45, 2.2, 0]} fontSize={0.15} color="#fb7185">dL: {dL_dB.toFixed(2)}</Text>
            </group>
          )}

          <Text position={[0, -5, 0]} fontSize={0.3} color="#475569">
              BACKPROP 3D: {mode.toUpperCase()}
          </Text>
        </group>
      </Stage3D>

      {mode === 'update' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-black tracking-widest">Training Stats</span>
                <span className="text-sm font-bold text-orange-400">Loss: {loss.toFixed(4)}</span>
            </div>
            <button 
                onClick={() => {
                    setW(w - 0.1 * dL_dW);
                    setB(b - 0.1 * dL_dB);
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-all"
            >
                GRADIENT STEP
            </button>
        </div>
      )}
    </div>
  );
}
