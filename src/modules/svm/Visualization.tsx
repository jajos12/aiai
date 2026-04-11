'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Box, Line, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface Point {
  x: number;
  y: number;
  z: number;
  cls: number;
}

export default function SVMVisualization({ mode = 'margin' }: { mode?: string }) {
  const [rotation, setRotation] = useState(0);
  const [isLifted, setIsLifted] = useState(false);

  const points: Point[] = useMemo(() => {
    const pts: Point[] = [];
    // Class 0: Center cluster
    for (let i = 0; i < 20; i++) {
       const r = Math.random() * 2;
       const a = Math.random() * Math.PI * 2;
       pts.push({ x: 5 + r * Math.cos(a), y: 5 + r * Math.sin(a), z: 5, cls: 0 });
    }
    // Class 1: Outer ring
    for (let i = 0; i < 30; i++) {
       const r = 4 + Math.random() * 2;
       const a = Math.random() * Math.PI * 2;
       pts.push({ x: 5 + r * Math.cos(a), y: 5 + r * Math.sin(a), z: 5, cls: 1 });
    }
    return pts;
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Stage3D cameraPosition={[12, 12, 12]}>
        <group>
          {/* 3D Grid */}
          <gridHelper args={[20, 20, 0x475569, 0x1e293b]} />
          
          {/* Hyperplane */}
          {isLifted && (
             <mesh position={[5, 5, 8]} rotation={[0, 0, 0]}>
                <planeGeometry args={[12, 12]} />
                <meshStandardMaterial color="#10b981" opacity={0.3} transparent side={THREE.DoubleSide} />
                <Text position={[0, 0, 0.1]} fontSize={0.3} color="white">SEPARATING HYPERPLANE</Text>
             </mesh>
          )}

          {/* Points with Lift Animation */}
          {points.map((p, i) => {
             const dist = Math.sqrt((p.x - 5)**2 + (p.y - 5)**2);
             const targetZ = isLifted ? (dist * 1.5) : 5;
             return (
                <Float key={i} speed={isLifted ? 0 : 2} rotationIntensity={0}>
                   <mesh position={[p.x, p.y, targetZ]}>
                      <sphereGeometry args={[0.15, 8, 8]} />
                      <meshStandardMaterial color={p.cls === 0 ? "#ef4444" : "#3b82f6"} />
                   </mesh>
                </Float>
             );
          })}

          <Text position={[5, -2, 5]} fontSize={0.4} color="#475569">
            SVM: Finding the optimal hyperplane in higher dimensions.
          </Text>
        </group>
      </Stage3D>

      <div className="flex gap-4 justify-center bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-white">
         <button 
            onClick={() => setIsLifted(!isLifted)}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 font-bold uppercase"
         >
            {isLifted ? "Flatten to 2D" : "Lift with Kernel Trick"}
         </button>
         <span className="p-2 text-slate-400 italic">
            {isLifted ? "Now separable by a flat plane!" : "Not linearly separable in 2D."}
         </span>
      </div>
    </div>
  );
}
