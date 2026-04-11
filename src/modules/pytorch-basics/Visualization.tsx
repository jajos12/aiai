'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Line, Float, RoundedBox, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface PyTorchVizProps {
  mode?: string;
  stage?: number;
}

/**
 * 3D Training Loop Component
 */
function TrainingTrack() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Torus args={[4, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#334155" />
      </Torus>
      
      {/* Loop Stages */}
      <group position={[4, 0, 0]}>
        <RoundedBox args={[1.5, 0.8, 0.5]} radius={0.1}>
          <meshStandardMaterial color="#3b82f6" />
        </RoundedBox>
        <Text position={[0, 0, 0.3]} fontSize={0.2} color="white">FORWARD</Text>
      </group>

      <group position={[0, 0, 4]}>
        <RoundedBox args={[1.5, 0.8, 0.5]} radius={0.1}>
          <meshStandardMaterial color="#f97316" />
        </RoundedBox>
        <Text position={[0, 0, 0.3]} fontSize={0.2} color="white">LOSS</Text>
      </group>

      <group position={[-4, 0, 0]}>
        <RoundedBox args={[1.5, 0.8, 0.5]} radius={0.1}>
          <meshStandardMaterial color="#ec4899" />
        </RoundedBox>
        <Text position={[0, 0, 0.3]} fontSize={0.2} color="white">BACKWARD</Text>
      </group>

      <group position={[0, 0, -4]}>
        <RoundedBox args={[1.5, 0.8, 0.5]} radius={0.1}>
          <meshStandardMaterial color="#10b981" />
        </RoundedBox>
        <Text position={[0, 0, 0.3]} fontSize={0.2} color="white">STEP</Text>
      </group>

      {/* Moving Car/Particle */}
      <Float speed={10} rotationIntensity={0} floatIntensity={0}>
         <Sphere args={[0.2, 16, 16]} position={[4, 0.5, 0]}>
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
         </Sphere>
      </Float>
    </group>
  );
}

function InfoCard({ title, bullets }: { title: string; bullets: string[] }) {
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

export default function PyTorchVisualization({ mode = 'tensor-viz', stage = 1 }: PyTorchVizProps) {
  const cardModeMap: Record<string, { title: string; bullets: string[] }> = {
    'module-lifecycle': {
      title: 'Model Structure Lifecycle',
      bullets: [
        'Declare layers in __init__ and data flow in forward.',
        'Keep helper logic outside forward for clarity.',
        'Use smaller submodules for maintainability.',
      ],
    },
    'batch-viz': {
      title: 'DataLoader Workflow',
      bullets: [
        'Dataset defines sample access; DataLoader handles batching/shuffling.',
        'Validate one batch shape and dtype before long runs.',
        'Tune batch size and workers based on hardware.',
      ],
    },
    'checkpoint-debug': {
      title: 'Checkpointing and Debugging',
      bullets: [
        'Save model + optimizer state + epoch + best metric.',
        'Add NaN/Inf checks on loss and gradients.',
        'Track train/val metrics per epoch for diagnosis.',
      ],
    },
    'project-stage': {
      title: `Project Stage ${stage}`,
      bullets:
        stage === 1
          ? [
              'Verify autograd on a toy objective.',
              'Compare gradient direction with expectations.',
              'Assert finite gradients before updates.',
            ]
          : stage === 2
            ? [
                'Implement train/eval loop with mode switching.',
                'Track metrics and save best checkpoint.',
                'Add reproducibility seed setup.',
              ]
            : [
                'Train a small MLP end-to-end.',
                'Report best epoch and final validation metric.',
                'Resume from checkpoint to verify workflow.',
              ],
    },
    summary: {
      title: 'Capstone Completion',
      bullets: [
        'You can now build reliable PyTorch training scripts.',
        'Next tiers build on this workflow discipline.',
        'Keep shape/device/logging checks in every project.',
      ],
    },
  };

  if (cardModeMap[mode]) {
    const card = cardModeMap[mode];
    return (
      <div className="w-full h-full bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-center">
        <InfoCard title={card.title} bullets={card.bullets} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Stage3D cameraPosition={[6, 5, 10]}>
        <group>
          {mode === 'loop-viz' && <TrainingTrack />}
          
          {mode === 'computation-graph' && (
            <group>
               <RoundedBox position={[-3, 2, 0]} args={[1.5, 1, 0.5]} radius={0.1}>
                 <meshStandardMaterial color="#facc15" opacity={0.3} transparent />
               </RoundedBox>
               <Text position={[-3, 2, 0.3]} fontSize={0.2} color="white">W (PARAM)</Text>
               
               <RoundedBox position={[-3, -2, 0]} args={[1.5, 1, 0.5]} radius={0.1}>
                 <meshStandardMaterial color="#334155" />
               </RoundedBox>
               <Text position={[-3, -2, 0.3]} fontSize={0.2} color="white">INPUT X</Text>
               
               <Sphere position={[0, 0, 0]} args={[0.5, 32, 32]}>
                 <meshStandardMaterial color="#3b82f6" />
               </Sphere>
               <Text position={[0, 0.7, 0]} fontSize={0.25} color="white">MATMUL</Text>
               
               <Line points={[[-2.2, 1.6, 0], [-0.5, 0.4, 0]]} color="#475569" lineWidth={2} />
               <Line points={[[-2.2, -1.6, 0], [-0.5, -0.4, 0]]} color="#475569" lineWidth={2} />
               
               <Line points={[[0.5, 0, 0], [2.5, 0, 0]]} color="#475569" lineWidth={2} />
               <RoundedBox position={[4, 0, 0]} args={[2, 1.5, 0.5]} radius={0.1}>
                  <meshStandardMaterial color="#ec4899" opacity={0.3} transparent />
               </RoundedBox>
               <Text position={[4, 0, 0.3]} fontSize={0.3} color="white" fontWeight="bold">LOSS</Text>

               {/* Gradient flow animation */}
               <Float speed={5} rotationIntensity={0} floatIntensity={0}>
                  <Sphere args={[0.1, 16, 16]} position={[3, 0.2, 0.1]}>
                    <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1} />
                  </Sphere>
               </Float>
               <Text position={[3, -0.5, 0.1]} fontSize={0.15} color="#ec4899">AUTOGRAD FLOW</Text>
            </group>
          )}

          {mode === 'tensor-viz' && (
             <group>
                {/* 3D Tensor Grid */}
                {Array.from({length: 27}).map((_, i) => (
                   <mesh key={i} position={[(i % 3 - 1) * 1.1, (Math.floor(i / 3) % 3 - 1) * 1.1, (Math.floor(i / 9) - 1) * 1.1]}>
                      <Box args={[0.8, 0.8, 0.8]}>
                         <meshStandardMaterial color="#ec4899" opacity={0.6} transparent metalness={0.8} roughness={0.2} />
                      </Box>
                   </mesh>
                ))}
                <Text position={[0, 3, 0]} fontSize={0.4} color="white" fontWeight="bold">3D TENSOR [3, 3, 3]</Text>
             </group>
          )}

          <Text position={[0, -5, 0]} fontSize={0.3} color="#475569">
              PYTORCH 3D: {mode.toUpperCase()}
          </Text>
        </group>
      </Stage3D>
    </div>
  );
}
