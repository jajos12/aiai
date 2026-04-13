'use client';

import React, { useState } from 'react';
import { Text, Float, Box, Line } from '@react-three/drei';
import Stage3D from '@/components/shared/Stage3D';

interface NumPyVizProps {
  mode?: string;
  stage?: number;
}

function BroadcastGrid({ shape, color, label }: { shape: [number, number, number], color: string, label: string }) {
  return (
    <group>
      {Array.from({ length: shape[0] * shape[1] * shape[2] }).map((_, i) => {
        const x = i % shape[0];
        const y = Math.floor(i / shape[0]) % shape[1];
        const z = Math.floor(i / (shape[0] * shape[1]));
        return (
          <mesh key={i} position={[x * 1.1, y * 1.1, z * 1.1]}>
            <Box args={[1, 1, 1]}>
              <meshStandardMaterial color={color} opacity={0.6} transparent />
            </Box>
          </mesh>
        );
      })}
      <Text position={[shape[0]/2, shape[1] + 1, shape[2]/2]} fontSize={0.3} color="white">{label} ({shape.join('x')})</Text>
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

export default function NumPyVisualization({ mode = 'array-structure', stage = 1 }: NumPyVizProps) {
  const [bShape, setBShape] = useState<[number, number, number]>([3, 1, 1]);

  const cardModeMap: Record<string, { title: string; bullets: string[] }> = {
    'speed-comparison': {
      title: 'Vectorization vs Loops',
      bullets: [
        'Prefer whole-array operations over Python item loops.',
        'Benchmark before/after changes to verify real speedups.',
        'Keep output equivalence checks while optimizing.',
      ],
    },
    'slicing-viz': {
      title: 'Indexing and Masking',
      bullets: [
        'Use boolean masks for row filtering.',
        'Remember slices often return views while fancy indexing returns copies.',
        'Print resulting shapes after every major slice.',
      ],
    },
    'axis-viz': {
      title: 'Axis Semantics',
      bullets: [
        'Axis 0 often means samples, axis 1 features.',
        'Reduction over axis changes output shape.',
        'Add shape assertions around transforms.',
      ],
    },
    'dtype-stability': {
      title: 'Numerical Stability',
      bullets: [
        'Use explicit dtype casts at boundaries.',
        'Add epsilon guards for division/log operations.',
        'Monitor NaN/Inf counts after transformations.',
      ],
    },
    'dot-product': {
      title: 'Linear Algebra Ops',
      bullets: [
        'Use @/matmul for matrix multiplication semantics.',
        'Check rank and shape before matrix ops.',
        'Document expected input/output shape contracts.',
      ],
    },
    'project-stage': {
      title: `Project Stage ${stage}`,
      bullets:
        stage === 1
          ? [
              'Vectorize cleaning with boolean masks.',
              'Compare speed and output equivalence with baseline.',
              'Log rejected rows and reasons.',
            ]
          : stage === 2
            ? [
                'Build deterministic X and y outputs.',
                'Enforce dtype consistency for training handoff.',
                'Add schema assertions and summary stats.',
              ]
            : [
                'Implement mini NumPy training loop.',
                'Track loss curve and stability metrics.',
                'Verify reproducible behavior with fixed seed.',
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
      <Stage3D cameraPosition={[10, 8, 15]}>
        <group>
          {mode === 'broadcasting-viz' && (
            <group position={[-5, -2, 0]}>
               {/* Base Array A (3x3x3) */}
               <BroadcastGrid shape={[3, 3, 3]} color="#3b82f6" label="ARRAY A" />
               
               <Text position={[4, 1.5, 1.5]} fontSize={1} color="#475569">+</Text>
               
               {/* Broadcast Array B */}
               <group position={[6, 0, 0]}>
                  <BroadcastGrid shape={bShape} color="#facc15" label="ARRAY B" />
                  
                  {/* Virtual Stretch effect */}
                  {bShape[1] === 1 && (
                     <Line points={[[0, 1.1, 0], [bShape[0] * 1.1, 3.3, 0]]} color="#facc15" opacity={0.3} transparent dashed />
                  )}
               </group>
               
               <Text position={[0, -2, 0]} fontSize={0.25} color="#475569">
                 Broadcasting: Smaller dimensions are &quot;stretched&quot; to match.
               </Text>
            </group>
          )}

          {mode === 'array-structure' && (
             <group>
                <group position={[-5, 0, 0]}>
                   {Array.from({length: 10}).map((_, i) => (
                      <mesh key={i} position={[i * 1.1, 0, 0]}>
                         <Box args={[1, 0.5, 0.5]}>
                            <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
                         </Box>
                         <Text position={[0, -0.6, 0]} fontSize={0.15} color="#64748b">0x{i*8}</Text>
                      </mesh>
                   ))}
                   <Text position={[5, 1, 0]} fontSize={0.3} color="white" fontWeight="bold">CONTIGUOUS MEMORY (STRIDED POINTERS)</Text>

                   <Float speed={5} rotationIntensity={0} floatIntensity={0}>
                      <mesh position={[Math.floor(Date.now()/500 % 10) * 1.1, 0.5, 0]}>
                         <coneGeometry args={[0.2, 0.4, 32]} />
                         <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1} />
                      </mesh>
                   </Float>
                </group>
                <Text position={[0, -4, 0]} fontSize={0.25} color="#475569" maxWidth={8}>
                  Numpy arrays are data buffers + metadata. Strides tell the engine how many bytes to skip to reach the next element in any dimension.
                </Text>
             </group>
          )}

          <Text position={[0, -6, 0]} fontSize={0.3} color="#475569">
              NUMPY 3D: {mode.toUpperCase()}
          </Text>
        </group>
      </Stage3D>
      
      {mode === 'broadcasting-viz' && (
        <div className="flex gap-4 justify-center bg-slate-900 p-4 rounded-xl border border-slate-800">
           <button onClick={() => setBShape([3, 1, 1])} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${bShape[1] === 1 && bShape[2] === 1 ? 'bg-blue-600' : 'bg-slate-800'}`}>1D Vector (3,)</button>
           <button onClick={() => setBShape([3, 3, 1])} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${bShape[1] === 3 && bShape[2] === 1? 'bg-blue-600' : 'bg-slate-800'}`}>2D Matrix (3, 3)</button>
           <button onClick={() => setBShape([1, 1, 1])} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${bShape[0] === 1 ? 'bg-blue-600' : 'bg-slate-800'}`}>Scalar (1,)</button>
        </div>
      )}
    </div>
  );
}
