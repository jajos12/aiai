'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Html, Line, Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

// ── Types ──
interface Vec2 { x: number; y: number }
interface Mat2 { a: number; b: number; c: number; d: number }

interface EigenvalueTransformProps {
  mode?: string;
  matrix?: Mat2;
  showEigenvectors?: boolean;
  showEigenvalues?: boolean;
  showUnitCircle?: boolean;
  showTransformedCircle?: boolean;
  onMatrixChange?: (m: Mat2) => void;
}

const EPS = 1e-6;

// ── Math Helpers ──
function matMul(m: Mat2, v: Vec2): Vec2 {
  return { x: m.a * v.x + m.b * v.y, y: m.c * v.x + m.d * v.y };
}

function isFiniteVec3(v: [number, number, number]): boolean {
  return Number.isFinite(v[0]) && Number.isFinite(v[1]) && Number.isFinite(v[2]);
}

function normalizeVec2(x: number, y: number): Vec2 | null {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const mag = Math.hypot(x, y);
  if (!Number.isFinite(mag) || mag < EPS) return null;
  return { x: x / mag, y: y / mag };
}

// ── Components ──

function Vector3D({
  from = [0, 0, 0],
  to,
  color = '#6366f1',
  width = 2,
  label,
  dashed = false,
  opacity = 1
}: {
  from?: [number, number, number];
  to: [number, number, number];
  color?: string;
  width?: number;
  label?: string;
  dashed?: boolean;
  opacity?: number;
}) {
  if (!isFiniteVec3(from) || !isFiniteVec3(to)) return null;

  const startV = new THREE.Vector3(...from);
  const endV = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(endV, startV);
  const length = dir.length();
  if (!Number.isFinite(length) || length < EPS) return null;

  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={width} dashed={dashed} transparent opacity={opacity} />
      {length > 0.01 && (
        <mesh position={to} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
          <coneGeometry args={[0.06 * width, 0.2 * width, 8]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
      )}
      {label && (
        <Html position={to} center distanceFactor={15}>
          <div className="px-1.5 py-0.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded text-[9px] font-bold text-white whitespace-nowrap pointer-events-none shadow-xl">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export function EigenvalueTransform(props: EigenvalueTransformProps) {
  const {
    mode = 'default',
    matrix: initialMatrix,
    showEigenvectors = true,
  } = props;

  const [mat, setMat] = useState<Mat2>(initialMatrix || { a: 2, b: 1, c: 1, d: 2 });

  useEffect(() => {
    if (initialMatrix) setMat(initialMatrix);
  }, [initialMatrix]);

  // Simple numeric eigenvalue solver for 2x2
  const eigenvalues = useMemo(() => {
    const trace = mat.a + mat.d;
    const determinant = mat.a * mat.d - mat.b * mat.c;
    const delta = Math.sqrt(trace * trace / 4 - determinant);
    if (isNaN(delta)) return [];
    return [trace / 2 + delta, trace / 2 - delta];
  }, [mat]);

  const eigenvectors = useMemo(() => {
    return eigenvalues.map((lambda): Vec2 => {
      // (A - λI)v = 0
      // [a-λ  b ] [x] = [0]
      // [c    d-λ] [y] = [0]
      if (Math.abs(mat.b) > EPS) {
          const candidate = normalizeVec2(1, (lambda - mat.a) / mat.b);
          if (candidate) return candidate;
      } else if (Math.abs(mat.c) > EPS) {
          const candidate = normalizeVec2((lambda - mat.d) / mat.c, 1);
          if (candidate) return candidate;
      }

      // Diagonal or numerically degenerate fallback.
      if (Math.abs(lambda - mat.a) <= Math.abs(lambda - mat.d)) return { x: 1, y: 0 };
      return { x: 0, y: 1 };
    });
  }, [mat, eigenvalues]);

  const [interactiveVec, setInteractiveVec] = useState<Vec2>({ x: 1, y: 0.5 });
  const transformedInteractive = matMul(mat, interactiveVec);

  return (
    <div className="w-full h-full relative group">
      <Stage3D cameraPosition={[3, 3, 6]}>
        <gridHelper args={[10, 10, 0x444444, 0x222222]} rotation={[Math.PI / 2, 0, 0]} />
        
        {/* Unit Circle */}
        <Line 
            points={Array.from({length: 64}, (_, i) => {
                const t = (i / 63) * Math.PI * 2;
                return [Math.cos(t), Math.sin(t), 0];
            })} 
            color="#475569" 
            lineWidth={1} 
            opacity={0.3} 
            transparent 
        />

        {/* Transformed Circle */}
        <Line 
            points={Array.from({length: 64}, (_, i) => {
                const t = (i / 63) * Math.PI * 2;
                const v = matMul(mat, { x: Math.cos(t), y: Math.sin(t) });
                return [v.x, v.y, 0];
            })} 
            color="#6366f1" 
            lineWidth={2} 
            opacity={0.5} 
            transparent 
        />

        {/* Eigenvectors */}
        {showEigenvectors && eigenvectors.map((v, i) => (
            <group key={i}>
                <Vector3D 
                    to={[v.x * eigenvalues[i], v.y * eigenvalues[i], 0]} 
                    color="#fb923c" 
                    width={3} 
                    label={`v${i+1} (λ=${eigenvalues[i].toFixed(1)})`} 
                />
            </group>
        ))}

        {/* Interactive Vector */}
        <Vector3D to={[interactiveVec.x, interactiveVec.y, 0]} color="#94a3b8" width={2} label="x" opacity={0.6} dashed />
        <Vector3D to={[transformedInteractive.x, transformedInteractive.y, 0]} color="#6366f1" width={3} label="Ax" />

      </Stage3D>

      <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Eigen-Analysis</div>
              <div className="space-y-2">
                  {eigenvalues.map((λ, i) => (
                      <div key={i} className="flex flex-col gap-0.5">
                          <div className="flex justify-between gap-4">
                              <span className="text-[10px] text-slate-400">λ{i+1}</span>
                              <span className="text-[10px] font-mono text-amber-400">{λ.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                              <span className="text-[9px] text-slate-500 italic">v{i+1}</span>
                              <span className="text-[9px] font-mono text-slate-500">[{eigenvectors[i]?.x.toFixed(1)}, {eigenvectors[i]?.y.toFixed(1)}]</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}

export default EigenvalueTransform;
