'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Box, Line, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

const SURFACES = {
  bowl: (x: number, y: number) => 0.1 * (x * x + y * y),
  saddle: (x: number, y: number) => 0.1 * (x * x - y * y),
  ripples: (x: number, y: number) => 0.5 * Math.sin(x) * Math.cos(y)
};

export default function PartialDerivativesVisualization({ surfaceId = 'bowl' }: { surfaceId?: 'bowl' | 'saddle' | 'ripples' }) {
  const [point, setPoint] = useState<[number, number]>([1, 1]);
  const [showXSlice, setShowXSlice] = useState(true);
  const [showYSlice, setShowYSlice] = useState(true);

  const zFunc = SURFACES[surfaceId as keyof typeof SURFACES] || SURFACES.bowl;
  const z = zFunc(point[0], point[1]);

  // Generate Surface Mesh
  const surfaceGeometry = useMemo(() => {
    const size = 10;
    const res = 50;
    const geometry = new THREE.PlaneGeometry(size, size, res, res);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
       const x = pos.getX(i);
       const y = pos.getY(i);
       pos.setZ(i, zFunc(x, y));
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [surfaceId]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Stage3D cameraPosition={[10, 10, 10]}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {/* Surface */}
          <mesh geometry={surfaceGeometry}>
             <meshStandardMaterial color="#6366f1" opacity={0.6} transparent wireframe={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={surfaceGeometry}>
             <meshBasicMaterial color="#4338ca" wireframe opacity={0.1} transparent />
          </mesh>

          {/* Slices */}
          {showXSlice && (
             <mesh position={[point[0], 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#f59e0b" opacity={0.2} transparent side={THREE.DoubleSide} />
             </mesh>
          )}
          {showYSlice && (
             <mesh position={[0, point[1], 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#3b82f6" opacity={0.2} transparent side={THREE.DoubleSide} />
             </mesh>
          )}

          {/* Point on Surface */}
          <mesh position={[point[0], point[1], z]}>
             <sphereGeometry args={[0.2, 16, 16]} />
             <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
          </mesh>

          <gridHelper args={[20, 20, 0x475569, 0x1e293b]} rotation={[Math.PI / 2, 0, 0]} />
          
          <Text position={[0, -6, 0]} fontSize={0.5} color="#475569">
            Partial Derivatives: Slopes along independent axes.
          </Text>
        </group>
      </Stage3D>

      <div className="flex gap-4 justify-center bg-slate-900 p-4 rounded-xl border border-slate-800">
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Point X: {point[0].toFixed(1)}</label>
            <input type="range" min="-5" max="5" step="0.1" value={point[0]} onChange={(e) => setPoint([parseFloat(e.target.value), point[1]])} className="w-32" />
         </div>
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Point Y: {point[1].toFixed(1)}</label>
            <input type="range" min="-5" max="5" step="0.1" value={point[1]} onChange={(e) => setPoint([point[0], parseFloat(e.target.value)])} className="w-32" />
         </div>
         <div className="flex items-center gap-2 ml-4">
            <button onClick={() => setShowXSlice(!showXSlice)} className={`px-2 py-1 rounded text-[10px] font-bold ${showXSlice ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}>X-SLICE</button>
            <button onClick={() => setShowYSlice(!showYSlice)} className={`px-2 py-1 rounded text-[10px] font-bold ${showYSlice ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>Y-SLICE</button>
         </div>
      </div>
    </div>
  );
}
