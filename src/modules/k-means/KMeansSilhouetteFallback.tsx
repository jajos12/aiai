'use client';

import React, { useMemo } from 'react';

const POINTS: { x: number; y: number; g: number }[] = [
  { x: 2, y: 5, g: 0 },
  { x: 2.6, y: 5.4, g: 0 },
  { x: 1.7, y: 4.7, g: 0 },
  { x: 6, y: 5, g: 1 },
  { x: 6.5, y: 4.6, g: 1 },
  { x: 4, y: 1.6, g: 2 },
  { x: 4.4, y: 2, g: 2 },
];

const COLORS = ['#f87171', '#60a5fa', '#34d399'];

function toSvg(p: { x: number; y: number }, pad: number, plot: number) {
  return {
    px: pad + (p.x / 8) * plot,
    py: pad + (1 - p.y / 7) * plot,
  };
}

/** Fallback when `KMeansSilhouetteLesson.mp4` is missing. */
export function KMeansSilhouetteFallback() {
  const pad = 40;
  const plot = 200;
  const circles = useMemo(
    () =>
      POINTS.map((p, i) => {
        const { px, py } = toSvg(p, pad, plot);
        const hi = i === 0;
        return { px, py, fill: hi ? '#facc15' : COLORS[p.g], r: hi ? 7 : 5 };
      }),
    [],
  );

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto bg-[#070a10] px-4 py-4">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/k-means-manim/KMeansSilhouetteLesson.mp4
        </code>{' '}
        for the silhouette video.
      </p>
      <svg viewBox="0 0 300 280" className="h-auto w-full max-w-md shrink-0" aria-hidden>
        <rect width="300" height="280" fill="#0c1220" rx="8" />
        <text x="150" y="22" fill="#94a3b8" fontSize="11" textAnchor="middle">
          Preview: yellow = point i; red / blue / green = clusters
        </text>
        <rect x="40" y="36" width="200" height="200" fill="#070a10" stroke="#1e293b" rx="4" />
        {circles.map((c, i) => (
          <circle key={i} cx={c.px} cy={c.py} r={c.r} fill={c.fill} opacity={0.92} />
        ))}
        <text x="150" y="265" fill="#64748b" fontSize="10" textAnchor="middle">
          a(i) uses red neighbors; b(i) uses mean distance to nearest other cluster
        </text>
      </svg>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">manim -qh k_means_silhouette.py KMeansSilhouetteLesson</code>
      </p>
    </div>
  );
}
