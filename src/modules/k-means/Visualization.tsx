'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Box, Line, Sphere, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface Point {
  x: number;
  y: number;
  z: number;
}

export default function KMeansVisualization({ k = 3 }: { k?: number }) {
  const [centroids, setCentroids] = useState<Point[]>([
    { x: 2, y: 2, z: 2 },
    { x: 7, y: 7, z: 7 },
    { x: 2, y: 7, z: 2 },
  ]);

  const points: Point[] = useMemo(() => {
    const pts: Point[] = [];
    for (let i = 0; i < 100; i++) {
       pts.push({
          x: Math.random() * 10,
          y: Math.random() * 10,
          z: Math.random() * 10,
       });
    }
    return pts;
  }, []);

  const clusterColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const assignments = useMemo(() => {
    return points.map(p => {
       let minDist = Infinity;
       let minIdx = 0;
       centroids.forEach((c, i) => {
          const d = (p.x - c.x)**2 + (p.y - c.y)**2 + (p.z - c.z)**2;
          if (d < minDist) {
             minDist = d;
             minIdx = i;
          }
       });
       return minIdx;
    });
  }, [points, centroids]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Stage3D cameraPosition={[15, 15, 15]}>
        <group>
          {/* 3D Grid */}
          <gridHelper args={[20, 20, 0x475569, 0x1e293b]} />
          
          {/* Points */}
          {points.map((p, i) => (
             <mesh key={i} position={[p.x, p.y, p.z]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color={clusterColors[assignments[i] % clusterColors.length]} />
             </mesh>
          ))}

          {/* Centroids */}
          {centroids.map((c, i) => (
             <Float key={i} speed={2} rotationIntensity={0.5}>
                <mesh position={[c.x, c.y, c.z]}>
                   <octahedronGeometry args={[0.4, 0]} />
                   <meshStandardMaterial 
                      color={clusterColors[i % clusterColors.length]} 
                      emissive={clusterColors[i % clusterColors.length]} 
                      emissiveIntensity={2} 
                   />
                   <Text position={[0, 0.6, 0]} fontSize={0.2} color="white">CENTROID {i}</Text>
                </mesh>
             </Float>
          ))}

          {/* Assignment Beams */}
          {points.map((p, i) => (
             <Line 
                key={i} 
                points={[[p.x, p.y, p.z], [centroids[assignments[i]].x, centroids[assignments[i]].y, centroids[assignments[i]].z]]} 
                color={clusterColors[assignments[i] % clusterColors.length]} 
                lineWidth={0.5} 
                opacity={0.1} 
                transparent 
             />
          ))}

          <Text position={[5, -2, 5]} fontSize={0.4} color="#475569">
            K-Means: Partitioning N observations into K clusters.
          </Text>
        </group>
      </Stage3D>

      <div className="flex gap-4 justify-center bg-slate-900 p-4 rounded-xl border border-slate-800">
         <Text fontSize={12} color="white">Drag centroids to re-cluster (Logic implementation pending UI binding)</Text>
      </div>
    </div>
  );
}
