'use client';

import React, { useMemo } from 'react';

const POINTS: { x: number; y: number }[] = [
  { x: 2, y: 7 },
  { x: 3, y: 8 },
  { x: 2, y: 9 },
  { x: 8, y: 2 },
  { x: 9, y: 3 },
  { x: 8, y: 1 },
  { x: 7, y: 8 },
  { x: 8, y: 9 },
  { x: 9, y: 8 },
];

const CENTROIDS: { x: number; y: number }[] = [
  { x: 3, y: 4 },
  { x: 5, y: 7 },
  { x: 7, y: 3 },
];

const COLORS = ['#f87171', '#34d399', '#60a5fa'];

function assign(points: typeof POINTS, cents: typeof CENTROIDS) {
  return points.map((p) => {
    let best = 0;
    let bestD = Infinity;
    cents.forEach((c, k) => {
      const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    });
    return best;
  });
}

function toSvg(p: { x: number; y: number }, pad: number, plot: number) {
  return {
    px: pad + (p.x / 10) * plot,
    py: pad + (1 - p.y / 10) * plot,
  };
}

/** Fallback when `KMeansAssignmentLesson.mp4` is missing. */
export function KMeansAssignmentFallback() {
  const pad = 28;
  const plot = 200;
  const { circles, stars } = useMemo(() => {
    const labels = assign(POINTS, CENTROIDS);
    const circles = POINTS.map((p, i) => {
      const { px, py } = toSvg(p, pad, plot);
      return { px, py, fill: COLORS[labels[i]] };
    });
    const stars = CENTROIDS.map((c, j) => {
      const { px, py } = toSvg(c, pad, plot);
      return { px, py, fill: COLORS[j] };
    });
    return { circles, stars };
  }, []);

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto bg-[#070a10] px-4 py-4">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/k-means-manim/KMeansAssignmentLesson.mp4
        </code>{' '}
        for the Step 2 assignment video.
      </p>
      <svg viewBox="0 0 256 256" className="h-auto w-full max-w-xs shrink-0" aria-hidden>
        <rect width="256" height="256" fill="#0c1220" rx="8" />
        <text x="128" y="18" fill="#94a3b8" fontSize="10" textAnchor="middle">
          Preview: nearest-centroid colors (same centroids as the lesson)
        </text>
        <rect x="28" y="28" width="200" height="200" fill="#070a10" stroke="#1e293b" rx="4" />
        {circles.map((c, i) => (
          <circle key={i} cx={c.px} cy={c.py} r={5} fill={c.fill} opacity={0.92} />
        ))}
        {stars.map((s, j) => (
          <polygon
            key={j}
            points={`${s.px},${s.py - 7} ${s.px + 5},${s.py + 4} ${s.px - 5},${s.py + 4}`}
            fill={s.fill}
            stroke="#f8fafc"
            strokeWidth={1}
          />
        ))}
      </svg>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">manim -qh k_means_assignment_step.py KMeansAssignmentLesson</code>
      </p>
    </div>
  );
}
