'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment, ContactShadows } from '@react-three/drei';

interface Stage3DProps {
  children: React.ReactNode;
  controls?: boolean;
  cameraPosition?: [number, number, number];
  environment?: 'city' | 'apartment' | 'lobby' | 'night' | 'studio' | 'sunset' | 'warehouse';
  /** Merges with the outer wrapper; use e.g. `h-full min-h-[280px]` for flex layouts. */
  containerClassName?: string;
}

function cn(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function Stage3D({
  children,
  controls = true,
  cameraPosition = [5, 5, 5],
  environment = 'city',
  containerClassName,
}: Stage3DProps) {
  return (
    <div
      className={cn(
        'group relative w-full h-[500px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl',
        containerClassName,
      )}
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Suspense fallback={null}>
            <Environment preset={environment} />
        </Suspense>

        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />

        {/* Content */}
        <Suspense fallback={null}>
          {children}
        </Suspense>

        {controls && <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />}
      </Canvas>

      {/* Interactive Hint */}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-full text-[10px] text-slate-400 font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        DRAG TO EXPLORE 3D
      </div>
    </div>
  );
}
