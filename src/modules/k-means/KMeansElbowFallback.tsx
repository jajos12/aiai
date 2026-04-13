'use client';

import React, { useMemo } from 'react';

const KS = [1, 2, 3, 4, 5, 6];
const J = [120, 55, 18, 12, 9, 7.5];

/** Fallback when `KMeansElbowLesson.mp4` is missing. */
export function KMeansElbowFallback() {
  const { pathD, dots } = useMemo(() => {
    const padL = 48;
    const padT = 36;
    const plotW = 380;
    const plotH = 160;
    const jMax = 130;
    const toX = (k: number) => padL + ((k - 1) / 5) * plotW;
    const toY = (j: number) => padT + (1 - j / jMax) * plotH;
    const pts = KS.map((k, i) => ({ x: toX(k), y: toY(J[i]) }));
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const dots = pts.map((p, i) => ({ ...p, highlight: KS[i] === 3 }));
    return { pathD, dots };
  }, []);

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto bg-[#070a10] px-4 py-4">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/k-means-manim/KMeansElbowLesson.mp4
        </code>{' '}
        for the elbow-method video.
      </p>
      <svg viewBox="0 0 480 240" className="h-auto w-full max-w-xl shrink-0" aria-hidden>
        <rect width="480" height="240" fill="#0c1220" rx="8" />
        <text x="240" y="22" fill="#94a3b8" fontSize="12" textAnchor="middle">
          J(K) vs K (toy curve — elbow near K = 3)
        </text>
        <line x1="48" y1="196" x2="428" y2="196" stroke="#334155" strokeWidth="1.5" />
        <line x1="48" y1="196" x2="48" y2="36" stroke="#334155" strokeWidth="1.5" />
        {[1, 2, 3, 4, 5, 6].map((k) => {
          const x = 48 + ((k - 1) / 5) * 380;
          return (
            <g key={k}>
              <line x1={x} y1="196" x2={x} y2="200" stroke="#475569" />
              <text x={x} y="218" fill="#64748b" fontSize="10" textAnchor="middle">
                {k}
              </text>
            </g>
          );
        })}
        {[0, 40, 80, 120].map((v) => {
          const y = 36 + (1 - v / 130) * 160;
          return (
            <g key={v}>
              <line x1="44" y1={y} x2="48" y2={y} stroke="#475569" />
              <text x="40" y={y + 4} fill="#64748b" fontSize="9" textAnchor="end">
                {v}
              </text>
            </g>
          );
        })}
        <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
        {dots.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.highlight ? 6 : 4}
            fill={p.highlight ? '#fb923c' : '#64748b'}
          />
        ))}
        <text x="240" y="232" fill="#64748b" fontSize="10" textAnchor="middle">
          K
        </text>
        <text
          x="14"
          y="120"
          fill="#64748b"
          fontSize="10"
          textAnchor="middle"
          transform="rotate(-90 14 120)"
        >
          J(K)
        </text>
      </svg>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render: <code className="text-slate-400">manim -qh k_means_elbow_method.py KMeansElbowLesson</code>
      </p>
    </div>
  );
}
