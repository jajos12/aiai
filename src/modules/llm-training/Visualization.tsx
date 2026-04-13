'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Box, Line, Sphere, Trail, Float as DreiFloat } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

// ── Components ──

function TokenBlock({ text, position, color, index }: { text: string; position: [number, number, number]; color: string; index: number }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
      <RoundedBox args={[text.length * 0.3 + 0.5, 0.6, 0.2]} radius={0.1}>
        <meshStandardMaterial color={color} opacity={0.8} transparent />
      </RoundedBox>
      <Text position={[0, 0, 0.15]} fontSize={0.3} color="white" fontWeight="bold">
        {text}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.1} color="#94a3b8">ID: {Math.floor(Math.random() * 50000)}</Text>
    </Float>
  );
}

function LoRAMatrices({ rank = 4 }: { rank: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef}>
      {/* Frozen Base Weight W */}
      <group position={[-2, 0, 0]}>
         <RoundedBox args={[2, 2, 0.2]} radius={0.05}>
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
         </RoundedBox>
         <Text position={[0, 1.3, 0]} fontSize={0.2} color="#64748b">FROZEN BASE WEIGHT (W)</Text>
      </group>
      
      <Text position={[0, 0, 0]} fontSize={0.5} color="#475569">+</Text>
      
      {/* Trainable Matrices A & B */}
      <group position={[2, 0, 0]}>
         <group position={[0, 0.6, 0]}>
            <RoundedBox args={[2, rank * 0.2, 0.1]} radius={0.05}>
               <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} />
            </RoundedBox>
            <Text position={[0, 0.6, 0]} fontSize={0.15} color="#a5b4fc">A (d x r)</Text>
         </group>
         <group position={[0, -0.6, 0]}>
            <RoundedBox args={[rank * 0.2, 2, 0.1]} radius={0.05}>
               <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.5} />
            </RoundedBox>
            <Text position={[0, -1.3, 0]} fontSize={0.15} color="#a5b4fc">B (r x d)</Text>
         </group>
         <Text position={[0, 1.8, 0]} fontSize={0.2} color="white" fontWeight="bold">TRAINABLE LOW-RANK ADAPTERS</Text>
      </group>
    </group>
  );
}

function RLHFLoop() {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh rotation={[Math.PI/2, 0, 0]}>
         <torusGeometry args={[3, 0.02, 16, 100]} />
         <meshStandardMaterial color="#475569" />
      </mesh>
      
      <group position={[3, 0, 0]}>
         <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
         </Sphere>
         <Text position={[0, 0.6, 0]} fontSize={0.2} color="white">LLM</Text>
      </group>
      
      <group position={[-3, 0, 0]}>
         <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1} />
         </Sphere>
         <Text position={[0, 0.6, 0]} fontSize={0.2} color="white">REWARD MODEL</Text>
      </group>
      
      <DreiFloat speed={5}>
         <Text position={[0, 0, 0]} fontSize={0.4} color="white" fontWeight="bold">ALIGNMENT CYCLE</Text>
      </DreiFloat>
    </group>
  );
}

export default function LLMTrainingVisualization({ mode = 'tokenizer-interactive', intensity = 1 }: { mode?: string; intensity?: number }) {
  const [inputText, setInputText] = useState('Deep learning is powerful');
  const tokens = useMemo(() => inputText.match(/.{1,4}/g) || [], [inputText]);
  const colors = ['#6366f1', '#a855f7', '#f59e0b', '#10b981'];

  return (
    <div className="w-full h-full relative group">
      <Stage3D cameraPosition={[6, 5, 8]}>
        {mode === 'tokenizer-interactive' && (
           <group position={[-((tokens.length-1)*0.8)/2, 0, 0]}>
              {tokens.map((t, i) => (
                 <TokenBlock key={i} text={t} position={[i * 1.5, 0, 0]} color={colors[i % colors.length]} index={i} />
              ))}
              <Text position={[((tokens.length-1)*1.5)/2, 3, 0]} fontSize={0.4} color="white" fontWeight="bold">3D TOKENIZATION</Text>
           </group>
        )}

        {mode === 'lo-ra-viz' && (
           <LoRAMatrices rank={Math.max(2, Math.floor(intensity * 10))} />
        )}

        {mode === 'rlhf-loop-viz' && (
           <RLHFLoop />
        )}

        {(mode === 'sft-viz' || mode === 'clm-viz') && (
           <group>
               <Float speed={2}>
                  <RoundedBox args={[4, 1, 0.1]} radius={0.1}>
                     <meshStandardMaterial color="#1e293b" />
                  </RoundedBox>
                  <Text position={[0, 0, 0.1]} fontSize={0.2} color="#818cf8" maxWidth={3.5}>
                     {mode === 'sft-viz' ? "Instruction: Summarize this text." : "Input: The cat sat on the..."}
                  </Text>
               </Float>
               <Float speed={3} position={[0, -2, 0]}>
                  <RoundedBox args={[4, 1, 0.1]} radius={0.1}>
                     <meshStandardMaterial color="#065f46" opacity={0.6} transparent />
                  </RoundedBox>
                  <Text position={[0, 0, 0.1]} fontSize={0.2} color="#34d399" maxWidth={3.5}>
                     {mode === 'sft-viz' ? "Response: [High Fidelity Summary]" : "Output: ...mat (85%)"}
                  </Text>
               </Float>
               <Text position={[0, 2.5, 0]} fontSize={0.4} color="white" fontWeight="bold">{mode.toUpperCase()}</Text>
           </group>
        )}
      </Stage3D>

      {/* Input overlay for tokenizer */}
      {mode === 'tokenizer-interactive' && (
          <div className="absolute top-6 left-6 pointer-events-auto">
              <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none w-48"
                  placeholder="Type to tokenize..."
              />
          </div>
      )}
    </div>
  );
}
