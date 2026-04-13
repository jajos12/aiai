'use client';

import React, { useMemo } from 'react';

function softmax(z: [number, number, number]): [number, number, number] {
  const m = Math.max(z[0], z[1], z[2]);
  const e0 = Math.exp(z[0] - m);
  const e1 = Math.exp(z[1] - m);
  const e2 = Math.exp(z[2] - m);
  const s = e0 + e1 + e2;
  return [e0 / s, e1 / s, e2 / s];
}

/**
 * Static diagram when `public/logistic-softmax-manim/SoftmaxLesson.mp4` is missing.
 */
export function SoftmaxFallback() {
  const p = useMemo(() => softmax([1, 2, 0.5]), []);
  const h = (prob: number) => Math.max(8, prob * 120);

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 bg-[#070a10] px-4 py-3">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/logistic-softmax-manim/SoftmaxLesson.mp4
        </code>{' '}
        for the full Manim lesson.
      </p>
      <p className="max-w-lg text-center text-xs leading-relaxed text-slate-400">
        <span className="text-slate-300">Softmax</span> maps logits{' '}
        <span className="font-mono text-slate-300">(z₁, z₂, z₃)</span> to probabilities that sum to 1. Example logits{' '}
        <span className="font-mono text-slate-300">(1, 2, 0.5)</span> → heights below.
      </p>
      <svg viewBox="0 0 320 160" className="h-auto w-full max-w-sm" aria-label="Softmax bar example">
        <rect width="320" height="160" fill="#0c1220" rx="8" />
        {[0, 1, 2].map((i) => {
          const w = 56;
          const gap = 24;
          const x = 40 + i * (w + gap);
          const bh = h(p[i]!);
          const y = 130 - bh;
          const colors = ['#3b82f6', '#22c55e', '#fb923c'];
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={bh} fill={colors[i]} rx={4} opacity={0.9} />
              <text x={x + w / 2} y={148} fill="#94a3b8" fontSize="11" textAnchor="middle">
                {`p${i + 1} ≈ ${p[i]!.toFixed(2)}`}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render: <code className="text-slate-400">manim -qh softmax_lesson.py SoftmaxLesson</code> (from{' '}
        <code className="text-slate-400">manim/</code>)
      </p>
    </div>
  );
}
