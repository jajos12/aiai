'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

// ── Types ──
interface Vec3 {
  x: number;
  y: number;
  z: number;
  color?: string;
  label?: string;
}

interface VectorTransformProps {
  mode?: string;
  vectors?: Vec3[];
  draggable?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  showCoordinates?: boolean;
  showComponentLines?: boolean;
  showMagnitude?: boolean;
  showPythagorean?: boolean;
  showAngle?: boolean;
  showArc?: boolean;
  showUnitVector?: boolean;
  showOriginal?: boolean;
  showSum?: boolean;
  showDifference?: boolean;
  showScalarSlider?: boolean;
  scalarRange?: [number, number];
  showSliders?: boolean;
  showParallelogram?: boolean;
  showDotProduct?: boolean;
  showRightAngle?: boolean;
  showProjection?: boolean;
  showBasisVectors?: boolean;
  showDecomposition?: boolean;
  scalarMultiplier?: number;
  onVectorsChange?: (vectors: Vec3[]) => void;
  onParamsChange?: (params: { scalar?: number; c1?: number; c2?: number }) => void;
  targetMarker?: { x: number; y: number; z?: number };
}

// ── Components ──

function Vector3D({
  from = [0, 0, 0],
  to,
  color = '#6366f1',
  width = 2,
  opacity = 1,
  dashed = false,
  label,
}: {
  from?: [number, number, number];
  to: [number, number, number];
  color?: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
  label?: string;
}) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  
  if (length < 0.01) return null;

  return (
    <group>
      <Line
        points={[from, to]}
        color={color}
        lineWidth={width}
        dashed={dashed}
        transparent
        opacity={opacity}
      />
      {/* Arrow head */}
      <mesh position={to} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
        <coneGeometry args={[0.08 * width, 0.25 * width, 8]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
      {label && (
        <Html position={to} center distanceFactor={15}>
          <div className="px-2 py-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded text-[10px] font-bold text-white whitespace-nowrap pointer-events-none shadow-xl border-l-2" style={{ borderLeftColor: color }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Grid3D() {
  return (
    <group>
      <gridHelper args={[20, 20, 0x444444, 0x222222]} rotation={[Math.PI / 2, 0, 0]} />
      <axesHelper args={[5]} />
      {/* labels for axes */}
      <Html position={[5.2, 0, 0]} center>
          <span className="text-[10px] font-bold text-red-500/50">X</span>
      </Html>
      <Html position={[0, 5.2, 0]} center>
          <span className="text-[10px] font-bold text-green-500/50">Y</span>
      </Html>
      <Html position={[0, 0, 5.2]} center>
          <span className="text-[10px] font-bold text-blue-500/50">Z</span>
      </Html>
      {/* Plane indicators */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" opacity={0.05} transparent />
      </mesh>
    </group>
  );
}

export function VectorTransform(props: VectorTransformProps) {
  const {
    mode = 'interactive',
    vectors: initialVectors,
    showGrid = true,
    showComponentLines = false,
    showSum = false,
    showDifference = false,
    scalarMultiplier = 1,
  } = props;

  // Adapt 2D vectors if passed
  const defaultVecs: Vec3[] = useMemo(() => {
    return (initialVectors || [{ x: 3, y: 2, z: 0, color: '#6366f1' }]).map(v => ({
      x: v.x,
      y: v.y,
      z: (v as any).z || 0,
      color: v.color,
      label: v.label,
    }));
  }, [initialVectors]);

  const [vecs, setVecs] = useState<Vec3[]>(defaultVecs);
  const [scalar, setScalar] = useState(scalarMultiplier);

  useEffect(() => {
    setVecs(defaultVecs);
  }, [defaultVecs]);

  useEffect(() => {
    setScalar(scalarMultiplier);
  }, [scalarMultiplier]);

  const a = vecs[0] || { x: 3, y: 2, z: 0 };
  const b = vecs[1] || { x: 1, y: 3, z: 0 };
  const sum: Vec3 = { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  const scaledA: Vec3 = { x: a.x * scalar, y: a.y * scalar, z: a.z * scalar };

  return (
    <div className="w-full h-full relative group">
      <Stage3D cameraPosition={[6, 4, 8]}>
        {showGrid && <Grid3D />}
        
        {/* Vector A */}
        <Vector3D 
          to={[a.x, a.y, a.z]} 
          color={a.color || '#6366f1'} 
          label={a.label || 'a'} 
        />

        {/* Vector B (for relevant modes) */}
        {['addition', 'subtraction', 'dot-product', 'linear-combination'].includes(mode) && (
          <Vector3D 
            to={[b.x, b.y, b.z]} 
            color={b.color || '#34d399'} 
            label={b.label || 'b'} 
          />
        )}

        {/* Sum / Difference */}
        {(mode === 'addition' || showSum) && (
          <>
            <Vector3D from={[a.x, a.y, a.z]} to={[sum.x, sum.y, sum.z]} color={b.color || '#34d399'} opacity={0.5} dashed />
            <Vector3D to={[sum.x, sum.y, sum.z]} color="#fb923c" label="a+b" width={3} />
          </>
        )}
        {(mode === 'subtraction' || showDifference) && (
          <Vector3D from={[b.x, b.y, b.z]} to={[a.x, a.y, a.z]} color="#f87171" label="a-b" width={3} />
        )}

        {/* Scalar scaling */}
        {mode === 'scalar' && (
          <Vector3D to={[scaledA.x, scaledA.y, scaledA.z]} color="#fb923c" label={`${scalar.toFixed(1)}a`} width={3} />
        )}

        {/* Projection */}
        {mode === 'projection' && (
          <Vector3D to={[a.x, a.y, a.z]} color="#a78bfa" label="proj_b(a)" />
        )}

        {/* Component Lines */}
        {(showComponentLines || mode === 'components') && (
          <group>
            <Line points={[[0, 0, 0], [a.x, 0, 0]]} color={a.color || '#6366f1'} lineWidth={1} dashed />
            <Line points={[[a.x, 0, 0], [a.x, a.y, 0]]} color={a.color || '#6366f1'} lineWidth={1} dashed />
            <Line points={[[a.x, a.y, 0], [a.x, a.y, a.z]]} color={a.color || '#6366f1'} lineWidth={1} dashed />
          </group>
        )}
      </Stage3D>

      {/* Info HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none transition-all group-hover:translate-x-1">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Vector Properties
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-6">
              <span className="text-[10px] text-slate-400 font-medium">Vector a</span>
              <span className="text-[10px] font-mono text-indigo-400">[{a.x.toFixed(1)}, {a.y.toFixed(1)}, {a.z.toFixed(1)}]</span>
            </div>
            {['addition', 'subtraction', 'dot-product'].includes(mode) && (
              <div className="flex justify-between gap-6">
                <span className="text-[10px] text-slate-400 font-medium">Vector b</span>
                <span className="text-[10px] font-mono text-emerald-400">[{b.x.toFixed(1)}, {b.y.toFixed(1)}, {b.z.toFixed(1)}]</span>
              </div>
            )}
            <div className="flex justify-between gap-6 pt-1 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">Magnitude |a|</span>
              <span className="text-[10px] font-mono text-amber-400">{Math.sqrt(a.x**2 + a.y**2 + a.z**2).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VectorTransform;
