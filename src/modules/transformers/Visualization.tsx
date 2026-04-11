'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Line, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface TransformerVizProps {
  mode?: string;
  intensity?: number;
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

export default function TransformerVisualization({ mode = 'block-overview', intensity = 1 }: TransformerVizProps) {
  return (
    <Stage3D cameraPosition={[6, 4, 8]}>
      <group>
        {mode === 'block-overview' && (
          <group>
            <BlockLayer position={[0, 2, 0]} label="FEED FORWARD (FFN)" color="#a78bfa" />
            <BlockLayer position={[0, 0, 0]} label="ADD & NORM" />
            <BlockLayer position={[0, -2, 0]} label="MULTI-HEAD ATTENTION" color="#6366f1" />
            
            {/* Connection Spine */}
            <Line points={[[0, -4, 0], [0, 4, 0]]} color="#475569" lineWidth={2} dashed dashScale={1} />
            
            {/* Animation Particles */}
            <Float speed={5} rotationIntensity={0} floatIntensity={0}>
                {Array.from({length: 3}).map((_, i) => (
                    <mesh key={i} position={[0, -4 + (Date.now()/1000 + i*2) % 8, 0.5]}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2} />
                    </mesh>
                ))}
            </Float>
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
