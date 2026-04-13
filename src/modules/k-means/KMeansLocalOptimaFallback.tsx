'use client';

import React from 'react';

/** Fallback when `KMeansLocalOptimaLesson.mp4` is missing. */
export function KMeansLocalOptimaFallback() {
  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto bg-[#070a10] px-4 py-4">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/k-means-manim/KMeansLocalOptimaLesson.mp4
        </code>{' '}
        for the local optima / k-means++ video.
      </p>
      <svg viewBox="0 0 520 200" className="h-auto w-full max-w-2xl shrink-0" aria-hidden>
        <rect width="520" height="200" fill="#0c1220" rx="8" />
        <text x="130" y="22" fill="#94a3b8" fontSize="11" textAnchor="middle">
          Crowded seeds → poor split
        </text>
        <text x="390" y="22" fill="#94a3b8" fontSize="11" textAnchor="middle">
          Spread seeds → better split
        </text>
        <rect x="20" y="36" width="220" height="140" fill="#070a10" stroke="#334155" rx="4" />
        <rect x="280" y="36" width="220" height="140" fill="#070a10" stroke="#334155" rx="4" />
        {/* left panel: three yellow stars clustered */}
        {[
          [55, 120],
          [70, 105],
          [62, 135],
        ].map(([x, y], i) => (
          <polygon
            key={`b-${i}`}
            points={`${x},${y - 6} ${x + 5},${y + 4} ${x - 5},${y + 4}`}
            fill="#facc15"
            opacity={0.9}
          />
        ))}
        {[
          [50, 70],
          [85, 85],
          [40, 100],
          [160, 75],
          [175, 95],
          [150, 115],
          [100, 150],
          [130, 160],
          [85, 145],
        ].map(([x, y], i) => (
          <circle key={`ld-${i}`} cx={x} cy={y} r={4} fill="#64748b" opacity={0.85} />
        ))}
        {/* right panel: spread stars */}
        {[
          [320, 85],
          [410, 90],
          [360, 145],
        ].map(([x, y], i) => (
          <polygon
            key={`g-${i}`}
            points={`${x},${y - 6} ${x + 5},${y + 4} ${x - 5},${y + 4}`}
            fill="#facc15"
            opacity={0.9}
          />
        ))}
        {[
          [305, 70],
          [335, 85],
          [295, 100],
          [415, 75],
          [440, 95],
          [400, 115],
          [350, 150],
          [380, 160],
          [330, 145],
        ].map(([x, y], i) => (
          <circle key={`rd-${i}`} cx={x} cy={y} r={4} fill="#64748b" opacity={0.85} />
        ))}
        <text x="260" y="192" fill="#64748b" fontSize="10" textAnchor="middle">
          k-means++ spreads initial centers using D² weighting
        </text>
      </svg>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">manim -qh k_means_local_optima.py KMeansLocalOptimaLesson</code>
      </p>
    </div>
  );
}
