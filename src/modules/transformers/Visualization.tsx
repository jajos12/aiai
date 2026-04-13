'use client';

import React from 'react';
import { RoundedBox, Text, Line, Float, Sphere } from '@react-three/drei';
import Stage3D from '@/components/shared/Stage3D';
import { TransformerManimPlayer } from './TransformerManimPlayer';

interface TransformerVizProps {
  presentation?: string;
  mode?: string;
  intensity?: number;
  manimSrc?: string;
  manimFallback?: string;
  [key: string]: unknown;
}

/**
 * 3D Representation of a Word/Token Embedding
 */
function TokenNode({ position, label, color = '#6366f1' }: { position: [number, number, number]; label: string; color?: string }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[0.2, 16, 16]} position={position}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        <Text position={[0, 0.4, 0]} fontSize={0.2} color="white">{label}</Text>
      </Sphere>
    </Float>
  );
}

/**
 * 3D Block Layer
 */
function BlockLayer({ position, label, color = '#1e293b' }: { position: [number, number, number]; label: string; color?: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[4, 0.5, 2]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} transparent opacity={0.6} />
      </RoundedBox>
      <Text position={[0, 0, 1.1]} fontSize={0.25} color="white" fontWeight="bold">
        {label}
      </Text>
    </group>
  );
}

export default function TransformerVisualization({
  presentation,
  mode = 'block-overview',
  intensity = 1,
  manimSrc,
  manimFallback,
}: TransformerVizProps) {
  const src =
    typeof manimSrc === 'string' && manimSrc.trim().length > 0 ? manimSrc.trim() : undefined;

  if (presentation === 'guided' && src) {
    return (
      <div className="relative h-full min-h-[480px] w-full flex-1">
        <TransformerManimPlayer videoSrc={src} manimFallback={manimFallback} />
      </div>
    );
  }

  return (
    <Stage3D cameraPosition={[6, 4, 8]}>
      <group>
        {mode === 'block-overview' && (
          <group>
            {/* Bottom → top matches Pre-LN: two sublayers, each LN → op → residual */}
            <BlockLayer position={[0, 2.2, 0]} label="Sublayer 2: LN → FFN → +" color="#a78bfa" />
            <BlockLayer position={[0, 0, 0]} label="Sublayer 1: LN → MHA → +" color="#6366f1" />
            <Text position={[0, -2.1, 0]} fontSize={0.22} color="#94a3b8">
              x in → ... → x out
            </Text>
            <Line points={[[0, -3.2, 0], [0, 3.6, 0]]} color="#475569" lineWidth={2} dashed dashScale={1} />
          </group>
        )}

        {mode === 'position-viz' && (
           <group>
             {Array.from({length: 10}).map((_, i) => (
                <TokenNode 
                    key={i} 
                    position={[(i-4.5)*1.2, Math.sin(i * intensity * 0.5) * 1.5, 0]} 
                    label={`Token ${i}`}
                />
             ))}
             <Line 
                points={Array.from({length: 50}).map((_, i) => [(i/5 - 5)*1.2, Math.sin(i/5 * intensity * 0.5) * 1.5, 0])} 
                color="#6366f1" 
                lineWidth={2}
             />
           </group>
        )}

        {mode === 'embedding-viz' && (
            <group>
                <Sphere args={[3, 32, 32]}>
                    <meshStandardMaterial color="#1e293b" wireframe transparent opacity={0.1} />
                </Sphere>
                <TokenNode position={[1, 1.5, 0.5]} label="KING" color="#f59e0b" />
                <TokenNode position={[1.2, -1.2, 1]} label="QUEEN" color="#f59e0b" />
                <TokenNode position={[-2, 0.5, -1]} label="APPLE" />
                <TokenNode position={[-1.8, -0.5, -1.5]} label="ORANGE" />
                
                {/* Semantic Vector */}
                <Line points={[[1, 1.5, 0.5], [1.2, -1.2, 1]]} color="#f59e0b" lineWidth={1} dashed />
            </group>
        )}

        {mode === 'residual-viz' && (
            <group>
                <BlockLayer position={[0, 0, 0]} label="COMPLEX LAYER" />
                {/* Skip Highway */}
                <Line 
                    points={[
                        [0, -2.5, 0],
                        [-2.5, -1.5, 0],
                        [-2.5, 1.5, 0],
                        [0, 2.5, 0]
                    ]}
                    color="#f59e0b"
                    lineWidth={3}
                />
                <Text position={[-3, 0, 0]} rotation={[0, 0, Math.PI/2]} fontSize={0.3} color="#f59e0b">RESIDUAL HIGHWAY</Text>
            </group>
        )}

        {/* Generic Label */}
        <Text
            position={[0, -5, 0]}
            fontSize={0.3}
            color="#475569"
        >
            TRANSFORMER 3D: {mode.replace('-viz', '').toUpperCase()}
        </Text>
      </group>
    </Stage3D>
  );
}
