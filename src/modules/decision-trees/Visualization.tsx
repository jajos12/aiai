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

export default function DecisionTreeVisualization({ mode = 'partition' }: { mode?: string }) {
  const [splitX, setSplitX] = useState(5);
  const [splitY, setSplitY] = useState(5);

  const points: Point[] = useMemo(() => {
    const pts: Point[] = [];
    for (let i = 0; i < 50; i++) {
       const x = Math.random() * 10;
       const y = Math.random() * 10;
       const z = Math.random() * 10;
       const cls = x > 5 && y > 5 ? 1 : 0;
       pts.push({ x, y, z, cls });
    }
    return pts;
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Stage3D cameraPosition={[12, 12, 12]}>
        <group>
          {/* 3D Grid & Axes */}
          <gridHelper args={[20, 20, 0x475569, 0x1e293b]} />
          
          {/* Partition Planes */}
          <mesh position={[splitX, 5, 5]}>
             <boxGeometry args={[0.05, 10, 10]} />
             <meshStandardMaterial color="#f59e0b" opacity={0.3} transparent />
          </mesh>
          <mesh position={[5, splitY, 5]} rotation={[0, 0, Math.PI / 2]}>
             <boxGeometry args={[0.05, 10, 10]} />
             <meshStandardMaterial color="#60a5fa" opacity={0.3} transparent />
          </mesh>

          {/* Data Points */}
          {points.map((p, i) => (
             <mesh key={i} position={[p.x, p.y, p.z]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color={p.cls === 1 ? "#ef4444" : "#3b82f6"} />
             </mesh>
          ))}

          {/* 3D Tree Structure Legend */}
          <group position={[12, 5, 0]}>
             <Sphere args={[0.4, 16, 16]} position={[0, 2, 0]}><meshStandardMaterial color="white" /></Sphere>
             <Line points={[[0, 2, 0], [-1, 0, 0]]} color="white" lineWidth={1} />
             <Line points={[[0, 2, 0], [1, 0, 0]]} color="white" lineWidth={1} />
             <Sphere args={[0.3, 16, 16]} position={[-1, 0, 0]}><meshStandardMaterial color="#f59e0b" /></Sphere>
             <Sphere args={[0.3, 16, 16]} position={[1, 0, 0]}><meshStandardMaterial color="#60a5fa" /></Sphere>
             <Text position={[0, 3, 0]} fontSize={0.3} color="white">ROOT SPLIT</Text>
          </group>

          <Text position={[5, -2, 5]} fontSize={0.4} color="#475569">
            Decision Trees: Hierarchical axes-aligned space partitioning.
          </Text>
        </group>
      </Stage3D>

      <div className="flex gap-4 justify-center bg-slate-900 p-4 rounded-xl border border-slate-800">
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Split X: {splitX.toFixed(1)}</label>
            <input type="range" min="0" max="10" step="0.1" value={splitX} onChange={(e) => setSplitX(parseFloat(e.target.value))} className="w-32" />
         </div>
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Split Y: {splitY.toFixed(1)}</label>
            <input type="range" min="0" max="10" step="0.1" value={splitY} onChange={(e) => setSplitY(parseFloat(e.target.value))} className="w-32" />
         </div>
      </div>
    </div>
  );
}
