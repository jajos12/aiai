'use client';

import React, { useMemo } from 'react';

/** Same 2-D toy points as the Manim scene / module (domain 0–10). */
const DEMO_POINTS: { x: number; y: number; g: number }[] = [
  { x: 2, y: 7, g: 0 },
  { x: 3, y: 8, g: 0 },
  { x: 2, y: 9, g: 0 },
  { x: 8, y: 2, g: 1 },
  { x: 9, y: 3, g: 1 },
  { x: 8, y: 1, g: 1 },
  { x: 7, y: 8, g: 2 },
  { x: 8, y: 9, g: 2 },
  { x: 9, y: 8, g: 2 },
];

const G_COLORS = ['#f87171', '#34d399', '#60a5fa'];

function toSvg(p: { x: number; y: number }, pad: number, plot: number) {
  return {
    px: pad + (p.x / 10) * plot,
    py: pad + (1 - p.y / 10) * plot,
  };
}

/**
 * Shown when `public/k-means-manim/KMeansLesson.mp4` is missing or fails to load.
 */
export function KMeansFallback() {
  const { circles, centroids } = useMemo(() => {
    const pad = 24;
    const plot = 200;
    const circles = DEMO_POINTS.map((p, i) => {
      const { px, py } = toSvg(p, pad, plot);
      return { key: i, px, py, fill: G_COLORS[p.g] };
    });
    const cents = [
      { x: 2.5, y: 8 },
      { x: 8.5, y: 2 },
      { x: 8, y: 8.5 },
    ];
    const centroids = cents.map((c, j) => {
      const { px, py } = toSvg(c, pad, plot);
      return { key: j, px, py, fill: G_COLORS[j] };
    });
    return { circles, centroids };
  }, []);

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto bg-[#070a10] px-4 py-4">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/k-means-manim/KMeansLesson.mp4
        </code>{' '}
        to play the Manim lesson.
      </p>
      <svg
        viewBox="0 0 248 248"
        className="h-auto w-full max-w-xs shrink-0"
        aria-hidden
      >
        <rect width="248" height="248" fill="#0c1220" rx="8" />
        <text x="124" y="18" fill="#94a3b8" fontSize="11" textAnchor="middle">
          Preview: three natural groups (same data as the video)
        </text>
        <rect x="24" y="28" width="200" height="200" fill="#070a10" stroke="#1e293b" rx="4" />
        {circles.map((c) => (
          <circle key={c.key} cx={c.px} cy={c.py} r={5} fill={c.fill} opacity={0.9} />
        ))}
        {centroids.map((c) => (
          <polygon
            key={c.key}
            points={`${c.px},${c.py - 8} ${c.px + 6},${c.py + 5} ${c.px - 6},${c.py + 5}`}
            fill={c.fill}
            stroke="#f8fafc"
            strokeWidth={1}
          />
        ))}
      </svg>
      <p className="max-w-xl text-center text-xs leading-relaxed text-slate-400">
        The video walks through unlabeled data, centroid initialization, assignment (Voronoi regions),
        the mean update, inertia and the elbow idea, silhouette intuition, k-means++, and why the
        algorithm always converges (but not always to the global optimum).
      </p>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render from <code className="text-slate-400">manim/</code>:{' '}
        <code className="text-slate-400">manim -qh k_means_lesson.py KMeansLesson</code>
      </p>
    </div>
  );
}
