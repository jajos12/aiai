'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Box, Sphere, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

// ── Constants ──

interface Position {
  x: number;
  y: number;
  z: number;
}

const GRID_SIZE = 5;

// ── Components ──

function GridCell({ x, z, active, isProxy, isGoal }: { x: number; z: number; active: boolean; isProxy: boolean; isGoal: boolean }) {
  const color = isGoal ? '#10b981' : isProxy ? '#f59e0b' : '#334155';
  const opacity = active ? 0.8 : 0.3;
  
  return (
    <group position={[x - GRID_SIZE/2 + 0.5, 0, z - GRID_SIZE/2 + 0.5]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={color} opacity={opacity} transparent />
      </mesh>
      {isGoal && (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
           <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2} />
           </mesh>
        </Float>
      )}
      {isProxy && (
        <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
           <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
           </mesh>
        </Float>
      )}
    </group>
  );
}

function AlignmentAgent({ position }: { position: { x: number; z: number } }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
        // Smooth interpolation
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position.x - GRID_SIZE/2 + 0.5, 0.1);
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position.z - GRID_SIZE/2 + 0.5, 0.1);
        meshRef.current.rotation.y += delta;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.5, 0]}>
      <RoundedBox args={[0.6, 0.6, 0.6]} radius={0.1}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.35]}>
         <sphereGeometry args={[0.05, 8, 8]} />
         <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

export default function AlignmentVisualization({ mode = 'reward-hacking' }: { mode?: string }) {
  const [agentPos, setAgentPos] = useState({ x: 0, z: 0 });
  const [reward, setReward] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const proxyPos = { x: 1, z: 1 };
  const goalPos = { x: 4, z: 4 };

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
        setAgentPos(pos => {
            // Objective: Hack the reward!
            // The agent "prefers" the proxy if it's closer or easier to get
            const dx = proxyPos.x - pos.x;
            const dz = proxyPos.z - pos.z;
            
            let next = { ...pos };
            if (Math.abs(dx) > 0) next.x += Math.sign(dx);
            else if (Math.abs(dz) > 0) next.z += Math.sign(dz);
            
            if (next.x === proxyPos.x && next.z === proxyPos.z) {
                setReward(r => r + 10);
            } else {
                setReward(r => r - 1);
            }
            return next;
        });
    }, 800);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full h-full relative group">
      <Stage3D cameraPosition={[6, 8, 10]}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <group position={[0, -1, 0]}>
            {/* Grid */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const z = Math.floor(i / GRID_SIZE);
                return (
                    <GridCell 
                        key={i} 
                        x={x} 
                        z={z} 
                        active={agentPos.x === x && agentPos.z === z}
                        isProxy={x === proxyPos.x && z === proxyPos.z}
                        isGoal={x === goalPos.x && z === goalPos.z}
                    />
                );
            })}
            
            <AlignmentAgent position={agentPos} />
            
            {/* Floor */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.05, 0]}>
                <planeGeometry args={[GRID_SIZE + 1, GRID_SIZE + 1]} />
                <meshStandardMaterial color="#0f172a" />
            </mesh>
        </group>

        {/* Floating Reward Status */}
        <Float speed={5}>
            <Text 
                position={[0, 4, 0]} 
                fontSize={0.5} 
                color="white" 
                fontWeight="bold"
            >
                REWARD: {reward}
            </Text>
        </Float>
      </Stage3D>

      {/* Control Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center gap-6">
        <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alignment Status</span>
            <span className={`text-xs font-mono font-bold ${reward > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {reward > 50 ? '⚠️ REWARD HACKING DETECTED' : 'ALIGNMENT NOMINAL'}
            </span>
        </div>
        <button 
            onClick={() => { setIsPlaying(!isPlaying); if(!isPlaying && reward > 100) setReward(0); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${isPlaying ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
        >
            {isPlaying ? 'PAUSE AGENT' : reward > 0 ? 'RESET & START' : 'START AGENT'}
        </button>
      </div>

      {/* Goal Legends */}
      <div className="absolute top-6 right-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] text-slate-400 font-bold">TRUE OBJECTIVE</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="w-3 h-3 bg-amber-500 rounded-sm shadow-[0_0_10px_#f59e0b]" />
              <span className="text-[10px] text-slate-400 font-bold">PROXY REWARD</span>
          </div>
      </div>
    </div>
  );
}
