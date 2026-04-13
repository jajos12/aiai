'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Sphere, Line, Box, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

interface GANVizProps {
  mode?: string;
  intensity?: number;
}

/**
 * 3D Generator Machine
 */
function GeneratorNode({ active }: { active: boolean }) {
  return (
    <group>
      <RoundedBox args={[2, 2, 2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={active ? '#f59e0b' : '#1e293b'} metalness={0.8} roughness={0.2} emissive={active ? '#f59e0b' : '#000'} emissiveIntensity={0.5} />
      </RoundedBox>
      <Text position={[0, 1.5, 0]} fontSize={0.25} color="white">GENERATOR</Text>
    </group>
  );
}

/**
 * 3D Discriminator Machine
 */
function DiscriminatorNode({ active }: { active: boolean }) {
  return (
    <group>
      <RoundedBox args={[2, 2, 2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={active ? '#10b981' : '#1e293b'} metalness={0.8} roughness={0.2} emissive={active ? '#10b981' : '#000'} emissiveIntensity={0.5} />
      </RoundedBox>
      <Text position={[0, 1.5, 0]} fontSize={0.25} color="white">DISCRIMINATOR</Text>
    </group>
  );
}

export default function GANVisualization({ mode = 'duel-viz', intensity = 1 }: GANVizProps) {
  const [equilibrium, setEquilibrium] = useState(0.5);

  return (
    <div className="w-full flex flex-col gap-4">
      <Stage3D cameraPosition={[8, 4, 8]}>
        <group>
          {mode === 'duel-viz' && (
             <group>
               {/* Arena Setup */}
               <group position={[-4, 0, 0]}>
                 <GeneratorNode active={equilibrium < 0.6} />
               </group>
               
               <group position={[4, 0, 0]}>
                 <DiscriminatorNode active={equilibrium > 0.4} />
               </group>

               <Line points={[[-3, 0, 0], [3, 0, 0]]} color="#475569" lineWidth={2} dashed />
               
               {/* Moving samples */}
               <Float speed={5} rotationIntensity={ equilibrium * 2} floatIntensity={1}>
                  <mesh position={[(equilibrium - 0.5) * 6, Math.sin(Date.now()/500) * 0.5, 1]}>
                     <Box args={[0.5, 0.5, 0.5]}>
                        <meshStandardMaterial color="#6366f1" />
                     </Box>
                  </mesh>
               </Float>

               <Text position={[0, 4, 0]} fontSize={0.3} color="white">ADVERSARIAL DUEL</Text>
             </group>
          )}

          {mode === 'mode-collapse-viz' && (
             <group>
               {/* Grid of identical objects */}
               {Array.from({length: 16}).map((_, i) => (
                  <mesh key={i} position={[(i % 4 - 1.5) * 1.2, (Math.floor(i / 4) - 1.5) * 1.2, 0]}>
                     <Box args={[0.8, 0.8, 0.8]}>
                        <meshStandardMaterial color="#f59e0b" wireframe />
                     </Box>
                     <Text position={[0, 0, 0.1]} fontSize={0.8} color="#f59e0b">7</Text>
                  </mesh>
               ))}
               <Text position={[0, 3, 0]} fontSize={0.4} color="#f43f5e" fontWeight="bold">MODE COLLAPSE</Text>
             </group>
          )}

          {mode === 'style-transfer-viz' && (
             <group>
               <RoundedBox position={[-3, 0, 0]} args={[1, 3, 2]} radius={0.1}><meshStandardMaterial color="#1e293b" /></RoundedBox>
               <Text position={[-3, -2, 0]} fontSize={0.2} color="white">CONTENT</Text>
               
               <Line points={[[-2.5, 0, 0], [2.5, 0, 0]]} color="#475569" lineWidth={2} />
               
               <Float speed={2}>
                  <Box position={[0, 2, 0]} args={[2, 0.5, 1]}><meshStandardMaterial color="#f59e0b" opacity={0.5} transparent/></Box>
                  <Text position={[0, 2.6, 0]} fontSize={0.2} color="#f59e0b">STYLE (AdaIN)</Text>
               </Float>
               
               <mesh position={[3, 0, 0]}>
                  <Sphere args={[1.2, 32, 32]}>
                     <MeshWobbleMaterial color="#6366f1" factor={0.5} speed={2} />
                  </Sphere>
                  <Text position={[3, -2, 0]} fontSize={0.2} color="white">STYLED OUTPUT</Text>
               </mesh>
             </group>
          )}

          <Text position={[0, -5, 0]} fontSize={0.3} color="#475569">
              GAN 3D: {mode.replace('-viz', '').toUpperCase()}
          </Text>
        </group>
      </Stage3D>
      
      {mode === 'duel-viz' && (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
           <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-500 uppercase">
              <span className={equilibrium < 0.4 ? 'text-amber-400' : ''}>Generator Advantaged</span>
              <span className={equilibrium > 0.6 ? 'text-emerald-400' : ''}>Discriminator Advantaged</span>
           </div>
           <input 
              type="range" min="0" max="1" step="0.01" value={equilibrium} 
              onChange={(e) => setEquilibrium(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
           />
        </div>
      )}
    </div>
  );
}
