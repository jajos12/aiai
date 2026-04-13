'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Line, Float, RoundedBox, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface MLPVisualizationProps {
  mode?: string;
  dataset?: string;
  hiddenNeurons?: number;
}

function NeuronLayer({ count, x, color, label }: { count: number, x: number, color: string, label: string }) {
  return (
    <group position={[x, 0, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[0, (i - (count - 1) / 2) * 1.5, 0]}>
          <Sphere args={[0.4, 32, 32]}>
             <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </Sphere>
        </group>
      ))}
      <Text position={[0, (count/2) + 1, 0]} fontSize={0.3} color="white" fontWeight="bold">{label}</Text>
    </group>
  );
}

function ConnectionTubes({ fromCount, toCount, fromX, toX }: { fromCount: number, toCount: number, fromX: number, toX: number }) {
  return (
    <group>
      {Array.from({ length: fromCount }).map((_, i) => (
        Array.from({ length: toCount }).map((_, j) => {
           const start: [number, number, number] = [fromX, (i - (fromCount - 1) / 2) * 1.5, 0];
           const end: [number, number, number] = [toX, (j - (toCount - 1) / 2) * 1.5, 0];
           return (
              <Line 
                key={`${i}-${j}`} 
                points={[start, end]} 
                color="white" 
                lineWidth={1} 
                opacity={0.1} 
                transparent 
              />
           );
        })
      ))}
    </group>
  );
}

export default function MLPVisualization({ mode = 'playground', dataset = 'xor', hiddenNeurons = 4 }: MLPVisualizationProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <Stage3D cameraPosition={[10, 5, 15]}>
        <group>
          {mode === 'network-diagram' && (
            <group position={[-5, 0, 0]}>
               <NeuronLayer count={2} x={0} color="#3b82f6" label="INPUT" />
               <ConnectionTubes fromCount={2} toCount={hiddenNeurons} fromX={0.4} toX={3.6} />
               <NeuronLayer count={hiddenNeurons} x={4} color="#a78bfa" label="HIDDEN" />
               <ConnectionTubes fromCount={hiddenNeurons} toCount={1} fromX={4.4} toX={7.6} />
               <NeuronLayer count={1} x={8} color="#f59e0b" label="OUTPUT" />
            </group>
          )}

          {mode === 'playground' && (
             <group>
                {/* 3D Decision Boundary Approximation */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                   <planeGeometry args={[10, 10, 20, 20]} />
                   <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.1} wireframe />
                </mesh>
                
                <Float speed={5}>
                   <mesh position={[0, 4, 0]} rotation={[Math.PI, 0, 0]}>
                      <coneGeometry args={[0.5, 1, 32]} />
                      <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={2} />
                   </mesh>
                </Float>
                {/* 3D Data Points */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <Float key={i} speed={2} position={[(Math.random() - 0.5) * 8, 0.5, (Math.random() - 0.5) * 8]}>
                    <Sphere args={[0.2, 16, 16]}>
                      <meshStandardMaterial color={Math.random() > 0.5 ? "#ef4444" : "#3b82f6"} />
                    </Sphere>
                  </Float>
                ))}
              </group>
            )}

            <Text position={[0, -6, 0]} fontSize={0.3} color="#475569">
              NEURAL NETWORK 3D: {mode.toUpperCase()}
            </Text>
          </group>
        </Stage3D>
      </div>
    );
}
