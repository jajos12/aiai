'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Float, RoundedBox, Box, Point, Points } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

// ── Constants ──

const activationFns: Record<string, { fn: (x: number) => number; dfn: (x: number) => number; label: string; color: string }> = {
  sigmoid: {
    fn: (x) => 1 / (1 + Math.exp(-x)),
    dfn: (x) => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); },
    label: 'Sigmoid',
    color: '#f59e0b',
  },
  tanh: {
    fn: (x) => Math.tanh(x),
    dfn: (x) => 1 - Math.tanh(x) ** 2,
    label: 'Tanh',
    color: '#8b5cf6',
  },
  relu: {
    fn: (x) => Math.max(0, x),
    dfn: (x) => x > 0 ? 1 : 0,
    label: 'ReLU',
    color: '#10b981',
  },
  'leaky-relu': {
    fn: (x) => x > 0 ? x : 0.01 * x,
    dfn: (x) => x > 0 ? 1 : 0.01,
    label: 'Leaky ReLU',
    color: '#06b6d4',
  },
};

interface ActivationsVisualizationProps {
  mode?: string;
  activation?: string;
  showDerivative?: boolean;
  layers?: number;
}

// ── Components ──

function FunctionCurve({ activation, showDerivative }: { activation: string; showDerivative: boolean }) {
  const act = activationFns[activation] || activationFns.sigmoid;
  const xMin = -6, xMax = 6;
  const steps = 100;

  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      pts.push([x, act.fn(x), 0]);
    }
    return pts;
  }, [activation]);

  const derivPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      pts.push([x, act.dfn(x), 0]);
    }
    return pts;
  }, [activation]);

  return (
    <group>
      <Line points={points} color={act.color} lineWidth={4} />
      {showDerivative && <Line points={derivPoints} color="#fb7185" lineWidth={2} dashed dashScale={1} />}
      
      {/* Plane Floor */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#1e293b" opacity={0.5} transparent />
      </mesh>
      <gridHelper args={[12, 12, 0x475569, 0x334155]} position={[0, 0, 0]} />
    </group>
  );
}

function GradientHighway({ activation, layers = 10 }: { activation: string; layers: number }) {
  const act = activationFns[activation] || activationFns.sigmoid;
  
  const gradients = useMemo(() => {
    const mags: number[] = [];
    let grad = 1.0;
    for (let i = 0; i < layers; i++) {
      const typicalInput = 0.5;
      grad *= act.dfn(typicalInput);
      mags.push(grad);
    }
    return mags;
  }, [activation, layers]);

  return (
    <group position={[-(layers/2) * 1.5, 0, 0]}>
      {gradients.map((mag, i) => {
        const height = Math.max(0.2, mag * 4);
        const color = new THREE.Color(act.color).lerp(new THREE.Color('#ef4444'), 1 - mag);
        return (
          <group key={i} position={[i * 1.5, height/2, 0]}>
            <RoundedBox args={[1, height, 1]} radius={0.1}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={mag * 0.5} />
            </RoundedBox>
            <Text position={[0, -1, 0]} fontSize={0.2} color="white">L{layers - i}</Text>
            {i < layers - 1 && (
                <Line points={[[0.5, 0, 0], [1, 0, 0]]} color="#475569" transparent opacity={0.3} />
            )}
          </group>
        );
      })}
      
      <Text position={[(layers*1.5)/2, 5, 0]} fontSize={0.4} color="white" fontWeight="bold">
          {act.label.toUpperCase()} GRADIENT FLOW
      </Text>
    </group>
  );
}

export default function ActivationsVisualization(props: ActivationsVisualizationProps) {
  const {
    mode = 'function-plot',
    activation = 'sigmoid',
    showDerivative = true,
    layers = 12,
  } = props;

  return (
    <div className="w-full h-full relative group">
      <Stage3D cameraPosition={[8, 5, 12]}>
        {mode === 'function-plot' && (
          <group position={[0, -1, 0]}>
            <FunctionCurve activation={activation} showDerivative={showDerivative} />
            <Text position={[0, 4, 0]} fontSize={0.5} color="white" fontWeight="bold">
                {activationFns[activation]?.label} Activation
            </Text>
          </group>
        )}

        {mode === 'gradient-flow' && (
          <GradientHighway activation={activation} layers={layers} />
        )}
      </Stage3D>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Activation Stats</div>
            <div className="space-y-1">
                <div className="flex justify-between gap-6">
                    <span className="text-[10px] text-slate-400">Function</span>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{activation}</span>
                </div>
                {mode === 'gradient-flow' && (
                    <div className="flex justify-between gap-6 pt-1 border-t border-slate-800">
                        <span className="text-[10px] text-slate-400">Final Signal</span>
                        <span className="text-[10px] font-mono text-amber-400">
                            {(activation === 'sigmoid' ? Math.pow(0.25, layers) : 1.0).toExponential(2)}
                        </span>
                    </div>
                )}
            </div>
          </div>
      </div>
    </div>
  );
}
