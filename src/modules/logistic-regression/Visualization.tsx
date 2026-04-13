'use client';

import React, { useState, useMemo } from 'react';
import { Text, Line } from '@react-three/drei';
import Stage3D from '@/components/shared/Stage3D';
import { type ClassPoint } from './WhyNotLinearStory';
import { WhyNotLinearManimPlayer } from './WhyNotLinearManimPlayer';
import { SigmoidManimPlayer } from './SigmoidManimPlayer';
import { LogLossManimPlayer } from './LogLossManimPlayer';
import { DecisionBoundaryManimPlayer } from './DecisionBoundaryManimPlayer';
import { ROCManimPlayer } from './ROCManimPlayer';
import { SoftmaxManimPlayer } from './SoftmaxManimPlayer';

interface Point {
  x: number;
  y: number;
  z: number;
  class: number;
}

type LogisticVizProps = {
  mode?: string;
  points?: ClassPoint[];
  /** When `playground`, keep the legacy 3D sandbox instead of the Manim sigmoid video. */
  presentation?: string;
};

/** Interactive 3D + sliders: playground, challenges, and steps that still share this canvas. */
function LogisticSandbox3D() {
  const [w1, setW1] = useState(1);
  const [b, setB] = useState(0);

  const points: Point[] = useMemo(
    () => [
      { x: -3, y: 0, z: -1, class: 0 },
      { x: -1, y: 0, z: 1, class: 0 },
      { x: 1, y: 0, z: -1, class: 1 },
      { x: 3, y: 0, z: 1, class: 1 },
      { x: 4, y: 0, z: 0, class: 1 },
    ],
    [],
  );

  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <Stage3D cameraPosition={[8, 8, 12]}>
        <group>
          <gridHelper args={[20, 20, 0x475569, 0x1e293b]} />

          <group>
            {Array.from({ length: 40 }).map((_, i) => {
              const x = (i / 40) * 10 - 5;
              const prob = sigmoid(w1 * x + b);
              return (
                <mesh key={i} position={[x, prob * 4, 0]}>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
                </mesh>
              );
            })}
          </group>

          <mesh position={[-b / w1, 2, 0]}>
            <boxGeometry args={[0.1, 4, 4]} />
            <meshStandardMaterial color="#ec4899" opacity={0.3} transparent />
          </mesh>
          <Text position={[-b / w1, 4.5, 0]} fontSize={0.2} color="#ec4899">
            DECISION BOUNDARY
          </Text>

          {points.map((p, i) => (
            <group key={i}>
              <mesh position={[p.x, p.class === 1 ? 4 : 0, p.z]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color={p.class === 1 ? '#ef4444' : '#3b82f6'} />
              </mesh>

              <Line
                points={[
                  [p.x, p.class === 1 ? 4 : 0, p.z],
                  [p.x, sigmoid(w1 * p.x + b) * 4, p.z],
                ]}
                color="#fbbf24"
                lineWidth={1}
                opacity={0.4}
                transparent
              />
            </group>
          ))}

          <Text position={[0, -2, 0]} fontSize={0.3} color="#475569">
            Logistic Regression: Mapping linear scores to probabilities [0, 1].
          </Text>
        </group>
      </Stage3D>

      <div className="flex justify-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-slate-400">Weight (w): {w1.toFixed(2)}</label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={w1}
            onChange={(e) => setW1(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-slate-400">Bias (b): {b.toFixed(2)}</label>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={b}
            onChange={(e) => setB(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
      </div>
    </div>
  );
}

export default function LogisticRegressionVisualization({
  mode,
  points: pointsProp,
  presentation,
}: LogisticVizProps) {
  const useSandbox3D = presentation === 'playground' || mode === 'challenge';

  if (mode === 'why-not-linear' || mode === 'why-not-linear-manim') {
    return <WhyNotLinearManimPlayer points={pointsProp} />;
  }

  if (mode === 'sigmoid-manim' || mode === 'sigmoid-story') {
    return <SigmoidManimPlayer />;
  }

  if (mode === 'log-loss-manim') {
    return <LogLossManimPlayer />;
  }

  if (mode === 'decision-boundary-manim') {
    return <DecisionBoundaryManimPlayer />;
  }

  if (mode === 'roc-auc-manim') {
    return <ROCManimPlayer />;
  }

  if (mode === 'softmax-manim') {
    return <SoftmaxManimPlayer />;
  }

  if (mode === 'none') {
    return null;
  }

  if (useSandbox3D) {
    return <LogisticSandbox3D />;
  }

  return <SigmoidManimPlayer />;
}
