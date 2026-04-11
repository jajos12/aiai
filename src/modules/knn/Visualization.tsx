'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Box, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface Point {
  x: number;
  y: number;
  z: number;
  cls: number;
}

export default function KNNVisualization({ k = 3 }: { k?: number }) {
  const [testPos, setTestPos] = useState<[number, number, number]>([5, 5, 5]);

  const points: Point[] = useMemo(() => {
    const pts: Point[] = [];
    for (let i = 0; i < 40; i++) {
       const x = Math.random() * 10;
       const y = Math.random() * 10;
       const z = Math.random() * 10;
       const cls = x > 5 ? 1 : 0;
       pts.push({ x, y, z, cls });
    }
    return pts;
  }, []);

  const neighbors = useMemo(() => {
    const sorted = [...points].sort((a, b) => {
       const d1 = (a.x - testPos[0])**2 + (a.y - testPos[1])**2 + (a.z - testPos[2])**2;
       const d2 = (b.x - testPos[0])**2 + (b.y - testPos[1])**2 + (b.z - testPos[2])**2;
       return d1 - d2;
    });
    return sorted.slice(0, k);
  }, [testPos, k, points]);

  const maxDist = neighbors.length > 0 ? Math.sqrt((neighbors[k-1].x - testPos[0])**2 + (neighbors[k-1].y - testPos[1])**2 + (neighbors[k-1].z - testPos[2])**2) : 0;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Stage3D cameraPosition={[15, 15, 15]}>
        <group>
          {/* 3D Grid */}
          <gridHelper args={[20, 20, 0x475569, 0x1e293b]} />
          
          {/* Search Sphere */}
          {maxDist > 0 && (
             <mesh position={testPos}>
                <sphereGeometry args={[maxDist, 32, 32]} />
                <meshStandardMaterial color="#fbbf24" opacity={0.1} transparent />
             </mesh>
          )}

          {/* Data Points */}
          {points.map((p, i) => (
             <mesh key={i} position={[p.x, p.y, p.z]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial color={p.cls === 1 ? "#ef4444" : "#3b82f6"} opacity={neighbors.includes(p) ? 1 : 0.4} transparent />
             </mesh>
          ))}

          {/* Test Point */}
          <Float speed={5}>
             <mesh position={testPos}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
                <Text position={[0, 0.5, 0]} fontSize={0.2} color="white">TEST POINT (?)</Text>
             </mesh>
          </Float>

          {/* Neighbor Connections */}
          {neighbors.map((n, i) => (
             <Line 
                key={i} 
                points={[testPos, [n.x, n.y, n.z]]} 
                color="white" 
                lineWidth={1} 
                opacity={0.6} 
                transparent 
             />
          ))}

          <Text position={[5, -2, 5]} fontSize={0.4} color="#475569">
            KNN: Classification based on K nearest neighbors in space.
          </Text>
        </group>
      </Stage3D>

      <div className="flex gap-4 justify-center bg-slate-900 p-4 rounded-xl border border-slate-800">
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">X Position: {testPos[0].toFixed(1)}</label>
            <input type="range" min="0" max="10" step="0.1" value={testPos[0]} onChange={(e) => setTestPos([parseFloat(e.target.value), testPos[1], testPos[2]])} className="w-24" />
         </div>
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Y Position: {testPos[1].toFixed(1)}</label>
            <input type="range" min="0" max="10" step="0.1" value={testPos[1]} onChange={(e) => setTestPos([testPos[0], parseFloat(e.target.value), testPos[2]])} className="w-24" />
         </div>
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Z Position: {testPos[2].toFixed(1)}</label>
            <input type="range" min="0" max="10" step="0.1" value={testPos[2]} onChange={(e) => setTestPos([testPos[0], testPos[1], parseFloat(e.target.value)])} className="w-24" />
         </div>
      </div>
    </div>
  );
}
