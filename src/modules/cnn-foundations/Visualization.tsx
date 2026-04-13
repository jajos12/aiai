'use client';

import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Line } from '@react-three/drei';
import Stage3D from '@/components/shared/Stage3D';

interface CNNVisualizationProps {
  mode?: string;
  kernelType?: string;
}

const INPUT_SIZE = 6;
const KERNEL_SIZE = 3;

/** Must be a direct descendant of <Canvas> — useFrame only works inside R3F tree. */
function SlidingWindowConvolutionScene() {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const x = Math.floor((Math.sin(time) * 0.5 + 0.5) * (INPUT_SIZE - KERNEL_SIZE + 1));
    const y = Math.floor((Math.cos(time) * 0.5 + 0.5) * (INPUT_SIZE - KERNEL_SIZE + 1));
    setCursor((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
  });

  return (
    <group>
      {/* Input Image */}
      <group position={[-5, 0, 0]}>
        {Array.from({ length: INPUT_SIZE * INPUT_SIZE }).map((_, i) => {
          const ix = i % INPUT_SIZE;
          const iy = Math.floor(i / INPUT_SIZE);
          const isActive =
            ix >= cursor.x && ix < cursor.x + KERNEL_SIZE && iy >= cursor.y && iy < cursor.y + KERNEL_SIZE;
          return (
            <mesh key={i} position={[ix * 1.1, iy * 1.1, 0]}>
              <Box args={[1, 1, 0.2]}>
                <meshStandardMaterial
                  color={isActive ? '#fbbf24' : '#334155'}
                  emissive={isActive ? '#fbbf24' : '#000'}
                  emissiveIntensity={0.5}
                />
              </Box>
            </mesh>
          );
        })}
        <Text position={[INPUT_SIZE / 2, -1, 0]} fontSize={0.3} color="white">
          INPUT IMAGE
        </Text>
      </group>

      {/* Sliding Kernel */}
      <group position={[-5 + cursor.x * 1.1, cursor.y * 1.1, 2]}>
        {Array.from({ length: KERNEL_SIZE * KERNEL_SIZE }).map((_, i) => {
          const kx = i % KERNEL_SIZE;
          const ky = Math.floor(i / KERNEL_SIZE);
          return (
            <mesh key={i} position={[kx * 1.1, ky * 1.1, 0]}>
              <Box args={[0.8, 0.8, 0.8]}>
                <meshStandardMaterial color="#ef4444" wireframe />
              </Box>
            </mesh>
          );
        })}
        <Text position={[KERNEL_SIZE / 2, KERNEL_SIZE + 0.5, 0]} fontSize={0.25} color="#ef4444">
          KERNEL
        </Text>

        <Line
          points={[[0, 0, 0], [5 + (cursor.x - INPUT_SIZE / 2) * 1.1, 2, 2]]}
          color="#fbbf24"
          opacity={0.4}
          transparent
        />
      </group>

      {/* Feature Map (Output) */}
      <group position={[3, 0, 0]}>
        {Array.from({ length: (INPUT_SIZE - KERNEL_SIZE + 1) * (INPUT_SIZE - KERNEL_SIZE + 1) }).map((_, i) => {
          const ox = i % (INPUT_SIZE - KERNEL_SIZE + 1);
          const oy = Math.floor(i / (INPUT_SIZE - KERNEL_SIZE + 1));
          const isCurrent = ox === cursor.x && oy === cursor.y;
          return (
            <mesh key={i} position={[ox * 1.1, oy * 1.1, 0]}>
              <Box args={[1, 1, 0.2]}>
                <meshStandardMaterial color={isCurrent ? '#10b981' : '#1e293b'} opacity={isCurrent ? 1 : 0.3} transparent />
              </Box>
            </mesh>
          );
        })}
        <Text position={[(INPUT_SIZE - KERNEL_SIZE + 1) / 2, -1, 0]} fontSize={0.3} color="white">
          FEATURE MAP
        </Text>
      </group>

      <Text position={[0, -5, 0]} fontSize={0.4} color="#475569">
        CNN 3D: SLIDING WINDOW CONVOLUTION
      </Text>
    </group>
  );
}

export default function CNNVisualization({ kernelType: _kernelType = 'sobel-v' }: CNNVisualizationProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Stage3D cameraPosition={[8, 8, 12]}>
        <SlidingWindowConvolutionScene />
      </Stage3D>
    </div>
  );
}
