'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Box, Line, Sphere, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

export default function RLAgentsVisualization({ gridSize = 4 }: { gridSize?: number }) {
  const [agentPos, setAgentPos] = useState<[number, number]>([0, 0]);
  const goalPos: [number, number] = [3, 3];

  const moveAgent = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    setAgentPos(prev => {
       const [x, y] = prev;
       if (dir === 'UP' && y < gridSize - 1) return [x, y + 1];
       if (dir === 'DOWN' && y > 0) return [x, y - 1];
       if (dir === 'LEFT' && x > 0) return [x - 1, y];
       if (dir === 'RIGHT' && x < gridSize - 1) return [x + 1, y];
       return prev;
    });
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Stage3D cameraPosition={[8, 8, 8]}>
        <group position={[-gridSize/2, 0, -gridSize/2]}>
          <gridHelper args={[gridSize, gridSize, 0x475569, 0x1e293b]} position={[gridSize/2, 0, gridSize/2]} />
          
          {/* Grid Cells */}
          {Array.from({ length: gridSize }).map((_, x) => 
            Array.from({ length: gridSize }).map((_, z) => (
              <mesh key={`${x}-${z}`} position={[x + 0.5, 0.1, z + 0.5]}>
                 <boxGeometry args={[0.9, 0.1, 0.9]} />
                 <meshStandardMaterial color={ (x === goalPos[0] && z === goalPos[1]) ? "#10b981" : "#1e293b"} />
              </mesh>
            ))
          )}

          {/* Goal */}
          <Float speed={4}>
             <mesh position={[goalPos[0] + 0.5, 1, goalPos[1] + 0.5]}>
                <octahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2} />
                <Text position={[0, 0.6, 0]} fontSize={0.2} color="white">GOAL</Text>
             </mesh>
          </Float>

          {/* Agent */}
          <mesh position={[agentPos[0] + 0.5, 0.5, agentPos[1] + 0.5]}>
             <sphereGeometry args={[0.3, 16, 16]} />
             <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
             <Text position={[0, 0.5, 0]} fontSize={0.15} color="white">AGENT</Text>
          </mesh>

          <Text position={[gridSize/2, -1, gridSize/2]} fontSize={0.3} color="#475569">
            RL: Agent learning optimal policy in GridWorld.
          </Text>
        </group>
      </Stage3D>

      <div className="flex gap-4 justify-center bg-slate-900 p-4 rounded-xl border border-slate-800">
         <button onClick={() => moveAgent('UP')} className="px-4 py-2 bg-slate-700 rounded text-white font-bold">W</button>
         <button onClick={() => moveAgent('LEFT')} className="px-4 py-2 bg-slate-700 rounded text-white font-bold">A</button>
         <button onClick={() => moveAgent('DOWN')} className="px-4 py-2 bg-slate-700 rounded text-white font-bold">S</button>
         <button onClick={() => moveAgent('RIGHT')} className="px-4 py-2 bg-slate-700 rounded text-white font-bold">D</button>
      </div>
    </div>
  );
}
