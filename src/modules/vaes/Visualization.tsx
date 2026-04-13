'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Text, Float, RoundedBox, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface VAEVizProps {
  mode?: string;
  intensity?: number;
}

/**
 * 3D Latent Point Cloud
 */
function LatentCloud({ activePos }: { activePos: [number, number, number] }) {
  const count = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  return (
    <group>
      <Points positions={positions} stride={3}>
        <PointMaterial transparent opacity={0.3} size={0.05} color="#6366f1" />
      </Points>
      <mesh position={activePos}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
        <Text position={[0, 0.4, 0]} fontSize={0.2} color="#fbbf24">Current Latent Z</Text>
      </mesh>
    </group>
  );
}

export default function VAEVisualization({ mode = 'latent-explorer' }: VAEVizProps) {
  const [z, setZ] = useState<[number, number, number]>([0, 0, 0]);

  return (
    <Stage3D cameraPosition={[5, 5, 5]}>
      <group>
        {mode === 'latent-explorer' && (
           <group>
             <LatentCloud activePos={z} />
             {/* Simple 3D Reconstruction morphing */}
             <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh position={[4, 0, 0]}>
                    <octahedronGeometry args={[1, Math.floor(Math.abs(z[0] * 2))]} />
                    <meshStandardMaterial color="#6366f1" wireframe />
                    <Text position={[0, 1.5, 0]} fontSize={0.25} color="white">RECONSTRUCTION</Text>
                </mesh>
             </Float>
             <Text 
                position={[0, -4, 0]} 
                fontSize={0.2} 
                color="#64748b"
                onClick={() => setZ([Math.sin(Date.now()/1000), Math.cos(Date.now()/1000), 0])}
             >
                CLICK TO INTERPOLATE Z
             </Text>
           </group>
        )}

        {mode === 'bottleneck-viz' && (
            <group>
                <RoundedBox position={[-3, 0, 0]} args={[1, 4, 2]} radius={0.1}><meshStandardMaterial color="#1e293b" /></RoundedBox>
                <Text position={[-3, -2.5, 0]} fontSize={0.2} color="white">ENCODER</Text>
                
                <Line points={[[-2.5, 0, 0], [-0.5, 0, 0]]} color="#475569" lineWidth={2} dashed />
                
                <Sphere position={[0, 0, 0]} args={[0.5, 16, 16]}><meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.5} /></Sphere>
                <Text position={[0, -1, 0]} fontSize={0.2} color="#a78bfa">BOTTLENECK (Z)</Text>
                
                <Line points={[[0.5, 0, 0], [2.5, 0, 0]]} color="#475569" lineWidth={2} dashed />
                
                <RoundedBox position={[3, 0, 0]} args={[1, 4, 2]} radius={0.1}><meshStandardMaterial color="#1e293b" /></RoundedBox>
                <Text position={[3, -2.5, 0]} fontSize={0.2} color="white">DECODER</Text>
            </group>
        )}

        {mode === 'reparam-viz' && (
            <group>
                <Sphere position={[-2, 1, 0]} args={[0.4, 16, 16]}><meshStandardMaterial color="#6366f1" /></Sphere>
                <Text position={[-2, 1.6, 0]} fontSize={0.2} color="white">Mean (μ)</Text>
                
                <Sphere position={[-2, -1, 0]} args={[0.4, 16, 16]}><meshStandardMaterial color="#10b981" /></Sphere>
                <Text position={[-2, -1.6, 0]} fontSize={0.2} color="white">Variance (σ)</Text>
                
                <Float speed={10} rotationIntensity={2} floatIntensity={1}>
                    <Sphere position={[0, 3, 0]} args={[0.2, 16, 16]}><meshStandardMaterial color="#f43f5e" /></Sphere>
                    <Text position={[0, 3.5, 0]} fontSize={0.2} color="#f43f5e">Noise (ε)</Text>
                </Float>
                
                <Line points={[[-1.6, 1, 0], [1.6, 0, 0]]} color="#475569" />
                <Line points={[[-1.6, -1, 0], [1.6, 0, 0]]} color="#475569" />
                <Line points={[[0, 2.8, 0], [1.8, 0.2, 0]]} color="#f43f5e" dashed />
                
                <Sphere position={[2, 0, 0]} args={[0.5, 16, 16]}><meshStandardMaterial color="#fbbf24" /></Sphere>
                <Text position={[2, -1, 0]} fontSize={0.2} color="#fbbf24">Sample Z = μ + σ * ε</Text>
            </group>
        )}

        <Text position={[0, -5, 0]} fontSize={0.3} color="#475569">
            VAE 3D: {mode.replace('-viz', '').toUpperCase()}
        </Text>
      </group>
    </Stage3D>
  );
}
