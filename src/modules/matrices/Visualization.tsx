'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Html, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';

// ── Types ──
interface Vec2 { x: number; y: number }
interface Mat2 { a: number; b: number; c: number; d: number }

interface MatrixTransformProps {
  mode?: string;
  matrix?: Mat2;
  showGrid?: boolean;
  showTransformedGrid?: boolean;
  showBasisVectors?: boolean;
  showTransformedBasis?: boolean;
  showDeterminant?: boolean;
  showEigenvectors?: boolean;
  showUnitCircle?: boolean;
  showTransformedCircle?: boolean;
  interactive?: boolean;
  secondMatrix?: Mat2;
  showComposition?: boolean;
  showInverse?: boolean;
  onMatrixChange?: (m: Mat2) => void;
}

// ── Math Helpers ──
function matMul(m: Mat2, v: Vec2): Vec2 {
  return { x: m.a * v.x + m.b * v.y, y: m.c * v.x + m.d * v.y };
}
function det(m: Mat2): number {
  return m.a * m.d - m.b * m.c;
}

// ── Components ──

function Grid2D({ matrix, color = '#6366f1', opacity = 0.2 }: { matrix?: Mat2; color?: string; opacity?: number }) {
  const lines = [];
  const range = 5;
  
  for (let i = -range; i <= range; i++) {
    // Vertical lines
    const startV = matrix ? matMul(matrix, { x: i, y: -range }) : { x: i, y: -range };
    const endV = matrix ? matMul(matrix, { x: i, y: range }) : { x: i, y: range };
    lines.push(<Line key={`v-${i}`} points={[[startV.x, startV.y, 0], [endV.x, endV.y, 0]]} color={color} lineWidth={1} transparent opacity={opacity} />);
    
    // Horizontal lines
    const startH = matrix ? matMul(matrix, { x: -range, y: i }) : { x: -range, y: i };
    const endH = matrix ? matMul(matrix, { x: range, y: i }) : { x: range, y: i };
    lines.push(<Line key={`h-${i}`} points={[[startH.x, startH.y, 0], [endH.x, endH.y, 0]]} color={color} lineWidth={1} transparent opacity={opacity} />);
  }
  
  return <group>{lines}</group>;
}

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
  const startV = new THREE.Vector3(...from);
  const endV = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(endV, startV);
  const length = dir.length();
  if (length < 0.01) return null;

  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={width} dashed={dashed} transparent opacity={opacity} />
      <mesh position={to} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
        <coneGeometry args={[0.06 * width, 0.2 * width, 8]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
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

export function MatrixTransform(props: MatrixTransformProps) {
  const {
    mode = 'identity',
    matrix: initialMatrix,
    showGrid = true,
    showTransformedGrid = true,
    showBasisVectors = true,
    showTransformedBasis = true,
  } = props;

  const defaultMatrix = useMemo(() => {
    switch (mode) {
      case 'scale': return { a: 2, b: 0, c: 0, d: 1.5 };
      case 'rotation': {
        const t = Math.PI / 4;
        return { a: Math.cos(t), b: -Math.sin(t), c: Math.sin(t), d: Math.cos(t) };
      }
      case 'shear': return { a: 1, b: 1, c: 0, d: 1 };
      default: return { a: 1, b: 0, c: 0, d: 1 };
    }
  }, [mode]);

  const [mat, setMat] = useState<Mat2>(initialMatrix || defaultMatrix);

  useEffect(() => {
    if (initialMatrix) setMat(initialMatrix);
  }, [initialMatrix]);

  const e1 = { x: 1, y: 0 };
  const e2 = { x: 0, y: 1 };
  const te1 = matMul(mat, e1);
  const te2 = matMul(mat, e2);

  return (
    <div className="w-full h-full relative group">
      <Stage3D cameraPosition={[4, 3, 6]}>
        {showGrid && <Grid2D color="#475569" opacity={0.15} />}
        {showTransformedGrid && <Grid2D matrix={mat} color="#6366f1" opacity={0.3} />}
        
        {showBasisVectors && (
          <>
            <Vector3D to={[1, 0, 0]} color="#f87171" opacity={0.2} dashed label="e1" />
            <Vector3D to={[0, 1, 0]} color="#60a5fa" opacity={0.2} dashed label="e2" />
          </>
        )}

        {showTransformedBasis && (
          <>
            <Vector3D to={[te1.x, te1.y, 0]} color="#f87171" width={3} label="Ae1" />
            <Vector3D to={[te2.x, te2.y, 0]} color="#60a5fa" width={3} label="Ae2" />
          </>
        )}

        {/* Determinant Area */}
        {(props.showDeterminant || mode === 'determinant') && (
            <mesh rotation={[0, 0, 0]} position={[0, 0, -0.01]}>
                <shapeGeometry args={[
                    new THREE.Shape([
                        new THREE.Vector2(0, 0),
                        new THREE.Vector2(te1.x, te1.y),
                        new THREE.Vector2(te1.x + te2.x, te1.y + te2.y),
                        new THREE.Vector2(te2.x, te2.y)
                    ])
                ]} />
                <meshStandardMaterial color={det(mat) >= 0 ? '#34d399' : '#f87171'} opacity={0.2} transparent side={THREE.DoubleSide} />
            </mesh>
        )}
      </Stage3D>

      {/* Info HUD */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Transformation Matrix
          </div>
          <div className="flex gap-4">
              <div className="flex flex-col items-center justify-center p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold">
                    <span className="text-red-400">{mat.a.toFixed(1)}</span>
                    <span className="text-blue-400">{mat.b.toFixed(1)}</span>
                    <span className="text-red-400">{mat.c.toFixed(1)}</span>
                    <span className="text-blue-400">{mat.d.toFixed(1)}</span>
                  </div>
              </div>
              <div className="flex flex-col justify-center gap-1">
                  <div className="flex justify-between gap-4">
                      <span className="text-[10px] text-slate-400">Determinant</span>
                      <span className="text-[10px] font-mono text-amber-400">{det(mat).toFixed(2)}</span>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatrixTransform;
