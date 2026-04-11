'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Text, Line, Float, RoundedBox, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface DiffusionVizProps {
  mode?: string;
  intensity?: number;
}

/**
 * 3D Noisy Point Cloud for Denoising Simulator
 */
function NoiseCloud({ progress }: { progress: number }) {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random sphere distribution initially
      const r = 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const pointRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (pointRef.current) {
        // Subtle drift
        pointRef.current.rotation.y += delta * 0.1;
    }
  });

  // Calculate morphing based on progress
  // (In a real app we'd lerp towards a target shape)
  
  return (
    <Points ref={pointRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        vertexColors={false}
        color={new THREE.Color().setHSL(0.6, 0.8, 0.5 + progress * 0.3)}
        size={0.05 + (1 - progress) * 0.1}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function DiffusionVisualization({ mode = 'denoising-simulator', intensity = 1 }: DiffusionVizProps) {
  const [step, setStep] = useState(0);
  const progress = step / 20;

  return (
    <Stage3D cameraPosition={[4, 3, 6]}>
      <group>
        {mode === 'denoising-simulator' && (
           <group>
             <NoiseCloud progress={progress} />
             <Text position={[0, -3, 0]} fontSize={0.25} color="white">
                {progress === 1 ? 'RECONSTRUCTION READY' : `DENOISING STEP: ${step}/20`}
             </Text>
             {/* Simple interactive trigger for the demo */}
             <Text 
                position={[0, -3.5, 0]} 
                fontSize={0.15} 
                color="#6366f1" 
                onClick={() => setStep(s => (s + 1) % 21)}
             >
                CLICK TO STEP
             </Text>
           </group>
        )}

        {mode === 'u-net-flow' && (
          <group>
            <Line points={[[-3, 2, 0], [0, -1, 0], [3, 2, 0]]} color="#475569" lineWidth={3} />
            <RoundedBox position={[-2, 1, 0]} args={[1, 1, 1]} radius={0.1}><meshStandardMaterial color="#6366f1" opacity={0.8} transparent/></RoundedBox>
            <RoundedBox position={[2, 1, 0]} args={[1, 1, 1]} radius={0.1}><meshStandardMaterial color="#6366f1" opacity={0.8} transparent/></RoundedBox>
            <RoundedBox position={[0, -1, 0]} args={[1, 1, 1]} radius={0.1}><meshStandardMaterial color="#a78bfa" /></RoundedBox>
            
            {/* 3D Skip Connections */}
            <Line points={[[-2, 1, 0], [2, 1, 0]]} color="#f59e0b" lineWidth={2} dashed />
            <Text position={[0, 1.5, 0]} fontSize={0.2} color="#f59e0b">SKIP CONNECTION (SPATIAL INFO)</Text>
          </group>
        )}

        {mode === 'cfg-viz' && (
            <group>
                <Line points={[[0, 0, 0], [1, 2, 0]]} color="#64748b" lineWidth={2} />
                <Text position={[1, 2.3, 0]} fontSize={0.2} color="#64748b">UNCONDITIONED</Text>
                
                <Line points={[[0, 0, 0], [2, 1, 1]]} color="#6366f1" lineWidth={2} />
                <Text position={[2, 1.3, 1]} fontSize={0.2} color="#6366f1">CONDITIONED</Text>
                
                {/* CFG Result */}
                <Line 
                    points={[[0, 0, 0], [2 * intensity * 1.5, 1 * intensity * 1.5, 1 * intensity * 1.5]]} 
                    color="#f59e0b" 
                    lineWidth={4} 
                />
                <Text position={[3 * intensity, 1.5 * intensity, 1.5 * intensity]} fontSize={0.3} color="#f59e0b" fontWeight="bold">CFG GUIDANCE</Text>
            </group>
        )}

        <Text position={[0, -4.5, 0]} fontSize={0.3} color="#475569">
            DIFFUSION 3D: {mode.replace('-viz', '').toUpperCase()}
        </Text>
      </group>
    </Stage3D>
  );
}
