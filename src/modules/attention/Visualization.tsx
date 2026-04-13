'use client';

import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Line } from '@react-three/drei';
import Stage3D from '@/components/shared/Stage3D';
import { AttentionManimPlayer } from './AttentionManimPlayer';

type AttentionVisualizationProps = {
  presentation?: string;
  mode?: string;
  manimSrc?: string;
  manimFallback?: string;
  [key: string]: unknown;
};

function VectorArrow({ vector, color, label }: { vector: [number, number, number], color: string, label: string }) {
  return (
    <group>
      <Line points={[[0, 0, 0], vector]} color={color} lineWidth={2} />
      <mesh position={vector}>
         <sphereGeometry args={[0.1, 16, 16]} />
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      <Text position={[vector[0] * 1.2, vector[1] * 1.2, vector[2] * 1.2]} fontSize={0.3} color={color}>{label}</Text>
    </group>
  );
}

/** Must live under `<Canvas>` — `useFrame` is invalid in the parent that wraps `Stage3D`. */
function InteractiveAttentionScene() {
  const [qPos, setQPos] = useState<[number, number, number]>([2, 2, 0]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    setQPos([Math.sin(t) * 3, Math.cos(t) * 3, Math.sin(t * 0.5) * 2]);
  });

  return (
    <group>
      <gridHelper args={[10, 10, 0x475569, 0x1e293b]} rotation={[Math.PI / 2, 0, 0]} />

      <VectorArrow vector={[3, 0, 0]} color="#60a5fa" label="KEY 0" />
      <VectorArrow vector={[0, 3, 0]} color="#60a5fa" label="KEY 1" />
      <VectorArrow vector={[0, 0, 3]} color="#60a5fa" label="KEY 2" />

      <VectorArrow vector={qPos} color="#fb923c" label="QUERY" />

      <Line
        points={[[0, 0, 0], [qPos[0], 0, 0]]}
        color="#fb923c"
        opacity={0.3}
        transparent
        dashed
      />
      <Line
        points={[[0, 0, 0], [0, qPos[1], 0]]}
        color="#fb923c"
        opacity={0.3}
        transparent
        dashed
      />

      <Text position={[0, -5, 0]} fontSize={0.3} color="white">
        Attention is a weighted sum: Softmax(Q \cdot K^T)V
      </Text>
    </group>
  );
}

export default function AttentionVisualization({
  presentation,
  mode = 'interactive',
  manimSrc,
  manimFallback,
}: AttentionVisualizationProps) {
  const src =
    typeof manimSrc === 'string' && manimSrc.trim().length > 0 ? manimSrc.trim() : undefined;

  if (presentation === 'guided' && src) {
    return (
      <div className="relative h-full min-h-[480px] w-full flex-1">
        <AttentionManimPlayer videoSrc={src} manimFallback={manimFallback} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Stage3D cameraPosition={[8, 8, 12]}>
        <group>
          {mode === 'interactive' && <InteractiveAttentionScene />}

          {mode === 'database' && (
             <group>
                {/* 3D Database "Vault" */}
                {Array.from({length: 5}).map((_, i) => (
                   <group key={i} position={[(i - 2) * 2.5, 0, 0]}>
                      <RoundedBox args={[2, 3, 0.5]} radius={0.1} smoothness={4}>
                         <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
                      </RoundedBox>
                      <Text position={[0, -2, 0]} fontSize={0.2} color="#60a5fa">KEY {i}</Text>
                      <Text position={[0, 0, 0.3]} fontSize={0.15} color="white">VALUE {i}</Text>
                   </group>
                ))}
                
                {/* 🔍 Search Query Beam */}
                <Float speed={5}>
                   <mesh position={[0, 4, 0]} rotation={[Math.PI, 0, 0]}>
                      <coneGeometry args={[0.5, 1, 32]} />
                      <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={2} />
                   </mesh>
                </Float>
             </group>
          )}

          <Text position={[0, -7, 0]} fontSize={0.4} color="#475569">
              ATTENTION 3D: {mode.toUpperCase()}
          </Text>
        </group>
      </Stage3D>
    </div>
  );
}
