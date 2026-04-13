'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, RoundedBox, Box, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import Stage3D from '@/components/shared/Stage3D';
import FeatureScalingThreeD from './FeatureScalingThreeD';

interface Point {
  x: number;
  y: number;
  z: number;
}

interface LinearRegressionProps {
  mode?: string;
  showResiduals?: boolean;
  showSquares?: boolean;
  showMSE?: boolean;
  showRSquared?: boolean;
  points?: Array<{ x: number; y: number }>;
  line?: { m: number; b: number };
  onLineChange?: (line: { m: number; b: number }) => void;
}

export default function LinearRegressionVisualization({
  mode = 'playground',
  showResiduals = true,
  showSquares = true,
  showMSE = true,
  showRSquared = false,
  points: inputPoints,
  line,
  onLineChange,
}: LinearRegressionProps) {
  const [m, setM] = useState(line?.m ?? 1);
  const [b, setB] = useState(line?.b ?? 0);

  useEffect(() => {
    if (line) {
      setM(line.m);
      setB(line.b);
    }
  }, [line?.m, line?.b]);

  useEffect(() => {
    onLineChange?.({ m, b });
  }, [m, b, onLineChange]);

  const points: Point[] = useMemo(() => [
    ...(inputPoints?.length
      ? inputPoints.map((p) => ({ x: p.x, y: p.y, z: 0 }))
      : [
          { x: 1, y: 2, z: 0 },
          { x: 2, y: 3.5, z: 0 },
          { x: 3, y: 4.5, z: 0 },
          { x: 4, y: 6, z: 0 },
        ]),
  ], [inputPoints]);

  const residualRows = useMemo(
    () =>
      points.map((p, i) => {
        const yHat = m * p.x + b;
        const residual = p.y - yHat;
        return {
          idx: i + 1,
          x: p.x,
          y: p.y,
          yHat,
          residual,
          absResidual: Math.abs(residual),
          squaredResidual: residual * residual,
        };
      }),
    [points, m, b],
  );

  const mse =
    residualRows.length > 0
      ? residualRows.reduce((sum, row) => sum + row.squaredResidual, 0) / residualRows.length
      : 0;
  const mae =
    residualRows.length > 0
      ? residualRows.reduce((sum, row) => sum + row.absResidual, 0) / residualRows.length
      : 0;

  const yMean = useMemo(
    () => (points.length ? points.reduce((s, p) => s + p.y, 0) / points.length : 0),
    [points],
  );
  const ssTot = useMemo(
    () => points.reduce((s, p) => s + (p.y - yMean) ** 2, 0),
    [points, yMean],
  );
  const ssRes = useMemo(
    () => residualRows.reduce((s, row) => s + row.squaredResidual, 0),
    [residualRows],
  );
  const rSquared = useMemo(() => {
    if (ssTot < 1e-12) return null;
    return 1 - ssRes / ssTot;
  }, [ssTot, ssRes]);

  const showR2Panel = mode === 'residuals-comparison' && showRSquared;

  const gdPoints = useMemo(
    () => [
      { x: 1, y: 2.2 },
      { x: 2, y: 3.9 },
      { x: 3, y: 5.8 },
      { x: 4, y: 8.1 },
    ],
    [],
  );
  const [gdM, setGdM] = useState(0.2);
  const [gdB, setGdB] = useState(0);
  const [gdLr, setGdLr] = useState(0.05);
  const [gdHistory, setGdHistory] = useState<Array<{ m: number; b: number }>>([{ m: 0.2, b: 0 }]);

  function gdLoss(mVal: number, bVal: number) {
    const n = gdPoints.length;
    return (
      gdPoints.reduce((sum, p) => {
        const err = p.y - (mVal * p.x + bVal);
        return sum + err * err;
      }, 0) / n
    );
  }

  function gdGradients(mVal: number, bVal: number) {
    const n = gdPoints.length;
    const residualSum = gdPoints.reduce((sum, p) => sum + (p.y - (mVal * p.x + bVal)), 0);
    const residualXSum = gdPoints.reduce((sum, p) => sum + p.x * (p.y - (mVal * p.x + bVal)), 0);
    return {
      dM: (-2 / n) * residualXSum,
      dB: (-2 / n) * residualSum,
    };
  }

  function gdStep() {
    const { dM, dB } = gdGradients(gdM, gdB);
    const nextM = gdM - gdLr * dM;
    const nextB = gdB - gdLr * dB;
    setGdM(nextM);
    setGdB(nextB);
    setGdHistory((prev) => [...prev.slice(-29), { m: nextM, b: nextB }]);
  }

  function gdReset() {
    setGdM(0.2);
    setGdB(0);
    setGdHistory([{ m: 0.2, b: 0 }]);
  }

  if (mode === 'gradient-descent') {
    return (
      <div className="absolute inset-0 h-full min-h-[100%] w-full bg-[#070a10]">
        <iframe
          title="Gradient descent walkthrough"
          src="/gradient-descent-sd/index.html?embed=1"
          className="block h-full w-full border-0"
          allow="autoplay"
        />
      </div>
    );
  }

  if (mode === 'matrix-animation') {
    return (
      <div className="absolute inset-0 h-full min-h-[100%] w-full bg-[#070a10]">
        <iframe
          title="Linear regression matrix form walkthrough"
          src="/linear-regression-matrix-sd/index.html?embed=1"
          className="block h-full w-full border-0"
          allow="autoplay"
        />
      </div>
    );
  }

  if (mode === 'scaling-three') {
    return (
      <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-950">
        <FeatureScalingThreeD />
      </div>
    );
  }

  if (mode === 'gradient-descent-interactive') {
    const { dM, dB } = gdGradients(gdM, gdB);
    const currentLoss = gdLoss(gdM, gdB);
    const mapRange = { mMin: -0.5, mMax: 3, bMin: -1, bMax: 4 };
    const svgW = 420;
    const svgH = 260;
    const mapX = (mVal: number) => ((mVal - mapRange.mMin) / (mapRange.mMax - mapRange.mMin)) * svgW;
    const mapY = (bVal: number) => svgH - ((bVal - mapRange.bMin) / (mapRange.bMax - mapRange.bMin)) * svgH;
    const pathD = gdHistory
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${mapX(p.m).toFixed(1)} ${mapY(p.b).toFixed(1)}`)
      .join(' ');
    const lrProfile =
      gdLr < 0.02
        ? { label: 'Too Small (slow progress)', color: 'text-amber-300' }
        : gdLr > 0.12
          ? { label: 'Too Large (risk of overshoot)', color: 'text-rose-300' }
          : { label: 'Balanced (usually stable)', color: 'text-emerald-300' };

    return (
      <div className="flex h-full w-full flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex shrink-0 items-center justify-between text-xs">
          <div className="text-slate-300">
            <span className="text-slate-400">Current MSE:</span>{' '}
            <span className="font-bold text-cyan-300">{currentLoss.toFixed(5)}</span>
          </div>
          <div className="text-slate-300">
            <span className="text-slate-400">Gradient:</span>{' '}
            <span className="font-mono text-amber-300">
              dM={dM.toFixed(3)}, dB={dB.toFixed(3)}
            </span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_230px]">
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-2">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="h-[min(280px,40vh)] w-full">
              {[0.35, 0.5, 0.68, 0.82].map((r) => (
                <ellipse
                  key={r}
                  cx={mapX(1.95)}
                  cy={mapY(0.2)}
                  rx={(svgW * r) / 2.4}
                  ry={(svgH * r) / 3}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.2"
                />
              ))}
              <text x="12" y="20" fill="#94a3b8" fontSize="11">
                Loss contour map J(m, b)
              </text>
              <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.2" />
              <circle cx={mapX(gdM)} cy={mapY(gdB)} r="6" fill="#22d3ee" />
              <line
                x1={mapX(gdM)}
                y1={mapY(gdB)}
                x2={mapX(gdM - 0.2 * dM)}
                y2={mapY(gdB - 0.2 * dB)}
                stroke="#f87171"
                strokeWidth="2"
              />
              <text x={mapX(gdM) + 8} y={mapY(gdB) - 8} fill="#e2e8f0" fontSize="10">
                current (m,b)
              </text>
            </svg>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-200">
            <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-300">Controls</p>
            <div className="mt-3 space-y-2">
              <p>
                m: <code>{gdM.toFixed(3)}</code>
              </p>
              <p>
                b: <code>{gdB.toFixed(3)}</code>
              </p>
              <label className="block text-slate-400">Learning rate: {gdLr.toFixed(3)}</label>
              <input
                type="range"
                min="0.005"
                max="0.2"
                step="0.005"
                value={gdLr}
                onChange={(e) => setGdLr(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className={`text-[11px] ${lrProfile.color}`}>{lrProfile.label}</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={gdStep}
                  className="rounded-md bg-cyan-700 px-3 py-1.5 font-semibold text-white"
                >
                  Step Once
                </button>
                <button type="button" onClick={gdReset} className="rounded-md bg-slate-700 px-3 py-1.5 text-white">
                  Reset
                </button>
              </div>
            </div>
            <p className="mt-3 text-slate-400">
              Orange path: past steps. Cyan: current (m, b). Red arrow: gradient direction (step opposite to
              minimize loss).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        showR2Panel
          ? 'absolute inset-0 flex h-full min-h-0 w-full flex-col gap-2'
          : 'relative flex h-full w-full flex-col gap-4'
      }
    >
      <div className={showR2Panel ? 'relative min-h-0 flex-1' : 'relative'}>
      <Stage3D
        cameraPosition={[10, 8, 15]}
        containerClassName={showR2Panel ? 'h-full min-h-[280px] rounded-xl' : undefined}
      >
        <group>
          {/* 3D Grid & Axes */}
          <gridHelper args={[20, 20, 0x475569, 0x1e293b]} />
          <axesHelper args={[10]} />

          {/* Data Points */}
          {points.map((p, i) => {
            const yHat = m * p.x + b;
            const residual = p.y - yHat;
            const residualMidY = (p.y + yHat) / 2;
            return (
             <group key={i}>
                <mesh position={[p.x, p.y, p.z]}>
                   <sphereGeometry args={[0.15, 32, 32]} />
                   <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
                </mesh>
                
                {/* Residuals */}
                {showResiduals && (
                   <Line 
                      points={[[p.x, p.y, p.z], [p.x, yHat, p.z]]}
                      color="#f87171" 
                      lineWidth={2} 
                      dashed 
                   />
                )}

                {/* Squared Error Volume */}
                {showSquares && (
                   <mesh position={[p.x, residualMidY, p.z]}>
                      <boxGeometry args={[0.15, Math.max(Math.abs(residual), 0.01), 0.15]} />
                      <meshStandardMaterial color="#ef4444" opacity={0.2} transparent />
                   </mesh>
                )}

                {mode === 'residuals' && showResiduals && (
                  <Text position={[p.x + 0.22, residualMidY, p.z]} fontSize={0.12} color="#fca5a5">
                    {`e${i + 1}=${residual.toFixed(2)}`}
                  </Text>
                )}
             </group>
          );
          })}

          {/* Regression line */}
          <Line
            points={[
              [0, m * 0 + b, 0],
              [6, m * 6 + b, 0],
            ]}
            color="#6366f1"
            lineWidth={3}
          />

          {showR2Panel && (
            <Line
              points={[
                [0, yMean, 0],
                [6, yMean, 0],
              ]}
              color="#fb923c"
              lineWidth={2}
              dashed
            />
          )}

          <Text position={[0, -1.4, 0]} fontSize={0.22} color="#475569">
            {showR2Panel
              ? 'Purple: your line · Orange dashed: mean baseline · Compare MSE and R² as you drag sliders.'
              : 'Linear Regression: Minimizing the sum of squared residuals.'}
          </Text>
        </group>
      </Stage3D>

      {showR2Panel && (
        <div className="pointer-events-none absolute top-3 right-3 z-10 min-w-[210px] rounded-lg border border-slate-600 bg-slate-900/95 px-4 py-3 text-slate-100 shadow-2xl">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-300">Fit vs mean baseline</span>
          </div>
          <div className="mt-1 text-xl font-bold leading-none text-amber-300">
            MAE: <code>{mae.toFixed(4)}</code>
          </div>
          <div className="mt-1 text-xl font-bold leading-none text-cyan-300">
            MSE: <code>{mse.toFixed(4)}</code>
          </div>
          <div className="mt-1 text-xl font-bold leading-none text-emerald-300">
            R²:{' '}
            <code>{rSquared === null ? '—' : rSquared.toFixed(4)}</code>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            R² = 1 − SS<sub>res</sub> / SS<sub>tot</sub> for these points (undefined if all y are identical).
          </p>
        </div>
      )}
      </div>

      {mode === 'residuals' && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none bg-slate-900/95 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 shadow-2xl min-w-[190px]">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-300">Live Error</span>
          </div>
          <div className="mt-1 text-xl font-bold text-amber-300 leading-none">
            MAE: <code>{mae.toFixed(4)}</code>
          </div>
          <div className="text-slate-400 mt-2 text-xs">Mean absolute residual (updates as line moves)</div>
        </div>
      )}

      {showMSE && (mode === 'interactive' || mode === 'squared-error') && !showR2Panel && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none bg-slate-900/95 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 shadow-2xl min-w-[190px]">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-300">Live Loss</span>
          </div>
          <div className="mt-1 text-xl font-bold text-cyan-300 leading-none">
            MSE: <code>{mse.toFixed(4)}</code>
          </div>
          <div className="text-slate-400 mt-2 text-xs">Mean squared error (updates as line moves)</div>
        </div>
      )}
      
      <div
        className={`flex justify-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 ${showR2Panel ? 'shrink-0' : ''}`}
      >
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Slope (m): {m.toFixed(2)}</label>
            <input type="range" min="-2" max="2" step="0.1" value={m} onChange={(e) => setM(parseFloat(e.target.value))} className="w-32" />
         </div>
         <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Intercept (b): {b.toFixed(2)}</label>
            <input type="range" min="-5" max="5" step="0.1" value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="w-32" />
         </div>
      </div>

      {showMSE &&
        mode !== 'residuals' &&
        mode !== 'interactive' &&
        mode !== 'squared-error' &&
        !showR2Panel && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
          MSE: <code>{mse.toFixed(4)}</code>
        </div>
      )}
    </div>
  );
}
