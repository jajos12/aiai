'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Line, Float, RoundedBox, Box, Wireframe } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface OptimizersVisualizationProps {
  mode?: string;
  surface?: string;
  optimizers?: string[];
}

const surfaces: Record<string, (x: number, y: number) => number> = {
  bowl: (x, y) => (x * x + y * y) * 0.1,
  ravine: (x, y) => (x * x * 0.05 + y * y) * 0.2,
  saddle: (x, y) => (x * x - y * y) * 0.1,
  'local-minima': (x, y) => (Math.sin(x) + Math.cos(y)) * 1.5 + (x * x + y * y) * 0.05,
};

function LossSurface({ type }: { type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const func = surfaces[type] || surfaces.bowl;

  const geometry = useMemo(() => {
    const size = 20;
    const segs = 40;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, func(x, y));
    }
    geo.computeVertexNormals();
    return geo;
  }, [type]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
      <Wireframe stroke="#475569" thickness={0.01} />
    </mesh>
  );
}

function OptimizerBall({ id, type, color }: { id: string, type: string, color: string }) {
  const ballRef = useRef<THREE.Mesh>(null);
  const [pos, setPos] = useState<[number, number, number]>([-4, -4, 0]);
  const func = surfaces[type] || surfaces.bowl;

  useFrame((state, delta) => {
    // Very simplified physics for viz
    const h = 0.01;
    const gx = (func(pos[0] + h, pos[1]) - func(pos[0] - h, pos[1])) / (2 * h);
    const gy = (func(pos[0], pos[1] + h) - func(pos[0], pos[1] - h)) / (2 * h);
    
    let nx = pos[0] - gx * delta * 5;
    let ny = pos[1] - gy * delta * 5;
    
    // Bounds check
    if (nx > 10) nx = -10; if (nx < -10) nx = 10;
    if (ny > 10) ny = -10; if (ny < -10) ny = 10;

    setPos([nx, ny, func(nx, ny) + 0.3]);
  });

  return (
    <mesh ref={ballRef} position={[pos[0], pos[2], -pos[1]]}>
      <Sphere args={[0.2, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      <Text position={[0, 0.4, 0]} fontSize={0.2} color="white">{id.toUpperCase()}</Text>
    </mesh>
  );
}

export default function OptimizersVisualization({ surface = 'bowl' }: OptimizersVisualizationProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <Stage3D cameraPosition={[10, 10, 15]}>
        <group>
          <LossSurface type={surface} />
          <OptimizerBall id="sgd" type={surface} color="#ef4444" />
          <OptimizerBall id="adam" type={surface} color="#10b981" />
          
          <Text position={[0, -5, 0]} fontSize={0.3} color="#475569">
              OPTIMIZER LANDSCAPE: {surface.toUpperCase()}
          </Text>
        </group>
      </Stage3D>
    </div>
  );
}
