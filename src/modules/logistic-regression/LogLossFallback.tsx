'use client';

import React, { useMemo } from 'react';

const P_MIN = 0.02;
const P_MAX = 0.98;

function lossY1(p: number): number {
  const x = Math.min(P_MAX, Math.max(P_MIN, p));
  return -Math.log(x);
}

function lossY0(p: number): number {
  const q = Math.min(P_MAX, Math.max(P_MIN, 1 - p));
  return -Math.log(q);
}

/**
 * Static chart when the Manim MP4 is not in `public/logistic-logloss-manim/`.
 */
export function LogLossFallback() {
  const { path1, path0 } = useMemo(() => {
    const n = 80;
    const pts1: string[] = [];
    const pts0: string[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = P_MIN + t * (P_MAX - P_MIN);
      const x = 50 + t * 420;
      const y1 = 240 - (lossY1(p) / 5.5) * 200;
      const y0 = 240 - (lossY0(p) / 5.5) * 200;
      pts1.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y1.toFixed(1)}`);
      pts0.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y0.toFixed(1)}`);
    }
    return { path1: pts1.join(' '), path0: pts0.join(' ') };
  }, []);

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 bg-[#070a10] px-4 py-3">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/logistic-logloss-manim/CrossEntropyLossLesson.mp4
        </code>{' '}
        to play the Manim lesson.
      </p>
      <p className="max-w-lg text-center text-xs leading-relaxed text-slate-400">
        <span className="text-slate-300">Horizontal:</span> model prediction{' '}
        <span className="font-mono text-slate-300">p</span> = P(class 1).{' '}
        <span className="text-slate-300">Vertical:</span> log loss{' '}
        <span className="font-mono text-slate-300">L</span>. Orange assumes the true label is 1;
        blue assumes it is 0.
      </p>
      <svg
        viewBox="0 0 480 280"
        className="h-auto w-full max-w-lg"
        aria-label="Cross-entropy loss versus probability"
      >
        <rect width="480" height="280" fill="#0c1220" rx="8" />
        {/* Axes */}
        <line x1="50" y1="240" x2="470" y2="240" stroke="#334155" strokeWidth="1.5" />
        <line x1="50" y1="40" x2="50" y2="240" stroke="#334155" strokeWidth="1.5" />
        <text x="260" y="272" fill="#94a3b8" fontSize="12" textAnchor="middle">
          predicted p
        </text>
        <text x="18" y="145" fill="#94a3b8" fontSize="12" textAnchor="middle" transform="rotate(-90 18 145)">
          loss L
        </text>
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((tick) => {
          const x = 50 + tick * 420;
          return (
            <g key={tick}>
              <line x1={x} y1="240" x2={x} y2="244" stroke="#475569" />
              <text x={x} y="258" fill="#64748b" fontSize="10" textAnchor="middle">
                {tick}
              </text>
            </g>
          );
        })}
        {[1, 2, 3, 4, 5].map((tick) => {
          const y = 240 - (tick / 5.5) * 200;
          return (
            <g key={tick}>
              <line x1="46" y1={y} x2="50" y2={y} stroke="#475569" />
              <text x="40" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}
        <path d={path1} fill="none" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
        <path d={path0} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <text x="360" y="48" fill="#fb923c" fontSize="11" textAnchor="end">
          y = 1 → −log p
        </text>
        <text x="360" y="64" fill="#3b82f6" fontSize="11" textAnchor="end">
          y = 0 → −log(1−p)
        </text>
      </svg>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">manim -qh cross_entropy_loss.py CrossEntropyLossLesson</code>
      </p>
    </div>
  );
}
