'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Html, Line, Sphere, Box, Octahedron } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

// ── Types ──
type Metric = 'l1' | 'l2' | 'linf';
type Mode = 'norm' | 'distance' | 'nearest' | 'cosine';

interface Vec3 { x: number; y: number; z: number }

interface NormDistanceVisualizationProps {
  presentation?: string;
  manimSrc?: string;
  manimTitle?: string;
  mode?: Mode;
  metric?: Metric | string;
  interactive?: boolean;
  showUnitBall?: boolean;
  neighborhoodRadius?: number;
  vector?: Vec3;
  pointA?: Vec3;
  pointB?: Vec3;
  onStateChange?: (state: any) => void;
}

// ── Math Helpers ──
function norm(v: Vec3, metric: Metric): number {
  if (metric === 'l1') return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z);
  if (metric === 'linf') return Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
  return Math.sqrt(v.x**2 + v.y**2 + v.z**2);
}

// ── Components ──

function UnitBall({ metric, color, opacity = 0.2, radius = 1 }: { metric: Metric; color: string; opacity?: number; radius?: number }) {
  if (metric === 'l2') {
    return (
      <Sphere args={[radius, 32, 32]}>
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </Sphere>
    );
  }
  if (metric === 'l1') {
    return (
      <Octahedron args={[radius]}>
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </Octahedron>
    );
  }
  // Linf is a cube
  return (
    <Box args={[radius * 2, radius * 2, radius * 2]}>
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </Box>
  );
}

function Vector3D({
  from = [0, 0, 0],
  to,
  color = '#6366f1',
  width = 2,
  label,
  opacity = 1
}: {
  from?: [number, number, number];
  to: [number, number, number];
  color?: string;
  width?: number;
  label?: string;
  opacity?: number;
}) {
  const startV = new THREE.Vector3(...from);
  const endV = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(endV, startV);
  const length = dir.length();
  if (length < 0.01) return null;

  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={width} transparent opacity={opacity} />
      <mesh position={to} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
        <coneGeometry args={[0.07 * width, 0.25 * width, 8]} />
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

export function NormsDistanceVisualization(props: NormDistanceVisualizationProps) {
  const {
    presentation,
    manimSrc,
    manimTitle,
    mode = 'norm',
    metric = 'l2',
    showUnitBall = true,
    neighborhoodRadius = 1,
  } = props;

  const selectedMetric = (metric === 'l1' || metric === 'linf') ? metric : 'l2';

  const [vector, setVector] = useState<Vec3>(props.vector || { x: 2, y: 1.5, z: 1 });
  const [pointA, setPointA] = useState<Vec3>(props.pointA || { x: -2, y: -1, z: 0 });
  const [pointB, setPointB] = useState<Vec3>(props.pointB || { x: 1, y: 2, z: 1 });

  const currentNorm = norm(vector, selectedMetric);

  if (presentation === 'guided' && typeof manimSrc === 'string' && manimSrc.trim().length > 0) {
    return (
      <div className="h-full min-h-[480px] w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
          {manimTitle ?? 'Tier 0 Manim lesson'}
        </div>
        <video
          key={manimSrc}
          className="h-[430px] w-full rounded-xl border border-slate-800 bg-black object-contain"
          controls
          preload="metadata"
          src={manimSrc}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">
      <Stage3D cameraPosition={[5, 4, 8]}>
        <gridHelper args={[20, 20, 0x444444, 0x222222]} rotation={[Math.PI / 2, 0, 0]} />
        <axesHelper args={[5]} />

        {mode === 'norm' && (
          <>
            {showUnitBall && (
              <group>
                <UnitBall metric="l1" color="#f59e0b" opacity={0.05} />
                <UnitBall metric="l2" color="#6366f1" opacity={0.05} />
                <UnitBall metric="linf" color="#34d399" opacity={0.05} />
              </group>
            )}
            <UnitBall metric={selectedMetric} color="#6366f1" opacity={0.2} radius={currentNorm} />
            <Vector3D to={[vector.x, vector.y, vector.z]} color="#6366f1" width={3} label="v" />
          </>
        )}

        {mode === 'distance' && (
          <>
            <Vector3D to={[pointA.x, pointA.y, pointA.z]} color="#f87171" label="A" />
            <Vector3D to={[pointB.x, pointB.y, pointB.z]} color="#60a5fa" label="B" />
            <Line points={[[pointA.x, pointA.y, pointA.z], [pointB.x, pointB.y, pointB.z]]} color="#fbbf24" lineWidth={2} dashed />
            <group position={[pointA.x, pointA.y, pointA.z]}>
                <UnitBall metric={selectedMetric} color="#6366f1" opacity={0.15} radius={norm({ x: pointB.x - pointA.x, y: pointB.y - pointA.y, z: pointB.z - pointA.z }, selectedMetric)} />
            </group>
          </>
        )}

        {mode === 'cosine' && (
          <>
            <Vector3D to={[vector.x, vector.y, vector.z]} color="#6366f1" label="a" />
            <Vector3D to={[pointB.x, pointB.y, pointB.z]} color="#34d399" label="b" />
          </>
        )}
      </Stage3D>

      {/* Info HUD */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Metric Explorer</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-6">
              <span className="text-[10px] text-slate-400">Metric</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase">{selectedMetric}</span>
            </div>
            {mode === 'norm' && (
              <div className="flex justify-between gap-6 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400">Length |v|</span>
                <span className="text-[10px] font-mono text-amber-400">{currentNorm.toFixed(2)}</span>
              </div>
            )}
            {mode === 'distance' && (
              <div className="flex justify-between gap-6 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400">Dist(A, B)</span>
                <span className="text-[10px] font-mono text-amber-400">
                    {norm({ x: pointB.x - pointA.x, y: pointB.y - pointA.y, z: pointB.z - pointA.z }, selectedMetric).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NormsDistanceVisualization;
