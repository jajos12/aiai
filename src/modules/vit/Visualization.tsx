'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Text, Line, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface ViTVizProps {
  mode?: string;
}

const GRID_SIZE = 4; // 4x4 for 3D performance/clarity initially
const TOTAL_PATCHES = GRID_SIZE * GRID_SIZE;

/**
 * Individual 3D Patch Component
 */
function Patch({ index, mode }: { index: number; mode: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ix = index % GRID_SIZE;
  const iy = Math.floor(index / GRID_SIZE);
  
  // Target position Calculation
  const targetPos = useMemo(() => {
    if (mode === 'patch-viz' || mode === 'merging-viz') {
        const spread = 1.2;
        return [(ix - GRID_SIZE / 2 + 0.5) * spread, (iy - GRID_SIZE / 2 + 0.5) * spread, 0];
    }
    if (mode === 'projection-viz') {
        return [0, (index - TOTAL_PATCHES / 2) * 0.2, 2];
    }
    return [(ix - GRID_SIZE / 2 + 0.5) * 0.6, (iy - GRID_SIZE / 2 + 0.5) * 0.6, 0];
  }, [index, mode, ix, iy]);

  useFrame((state, delta) => {
    if (meshRef.current) {
        meshRef.current.position.lerp(new THREE.Vector3(...targetPos), delta * 4);
        
        // Rotation for effect
        if (mode === 'projection-viz') {
            meshRef.current.rotation.y += delta * 2;
        } else {
            meshRef.current.rotation.set(0, 0, 0);
        }
    }
  });

  const color = mode === 'mae-viz' && (Math.sin(index * 2.3) > 0) ? '#1e293b' : '#6366f1';

  return (
    <RoundedBox ref={meshRef} args={[0.5, 0.5, 0.05]} radius={0.02} smoothness={4}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} metalness={0.8} roughness={0.2} />
    </RoundedBox>
  );
}

export default function ViTVisualization({ mode = 'patch-viz' }: ViTVizProps) {
  return (
    <Stage3D cameraPosition={[0, 0, 8]}>
      <group>
        {/* The Patches */}
        {Array.from({ length: TOTAL_PATCHES }).map((_, i) => (
          <Patch key={i} index={i} mode={mode} />
        ))}

        {/* Global Helpers */}
        {mode === 'rf-viz' && (
           <mesh>
              <sphereGeometry args={[3, 32, 32]} />
              <meshStandardMaterial color="#6366f1" transparent opacity={0.1} wireframe />
              <Text position={[0, 4, 0]} fontSize={0.4} color="white">Global Receptive Field</Text>
           </mesh>
        )}

        {mode === 'cls-token-viz' && (
            <group>
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <mesh position={[-4, 0, 1]}>
                        <sphereGeometry args={[0.4, 32, 32]} />
                        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
                        <Text position={[0, 0.8, 0]} fontSize={0.3} color="#fbbf24">[CLS]</Text>
                    </mesh>
                </Float>
                {/* Connection lines to some patches */}
                {[0, 5, 10, 15].map(i => (
                    <Line
                        key={i}
                        points={[[-4, 0, 1], [(i%4 - 2 + 0.5)*0.6, (Math.floor(i/4) - 2 + 0.5)*0.6, 0]]}
                        color="#fbbf24"
                        lineWidth={1}
                        transparent
                        opacity={0.4}
                    />
                ))}
            </group>
        )}

        {/* Labels for specific modes */}
        <Text
            position={[0, -4, 0]}
            fontSize={0.25}
            color="#64748b"
            font="/fonts/inter-bold.woff"
        >
            {mode.replace('-viz', '').toUpperCase()} ENGINE
        </Text>
      </group>
    </Stage3D>
  );
}
