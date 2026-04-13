'use client';

import React, { useMemo } from 'react';

const POINTS: { x: number; y: number }[] = [
  { x: 2, y: 7 },
  { x: 3, y: 8 },
  { x: 2, y: 9 },
  { x: 8, y: 2 },
  { x: 9, y: 3 },
  { x: 8, y: 1 },
];

const C0 = { x: 2, y: 5 };
const C1 = { x: 8, y: 5 };

const COLORS = ['#f87171', '#60a5fa'];

function assign(points: typeof POINTS, c0: typeof C0, c1: typeof C1) {
  return points.map((p) => {
    const d0 = (p.x - c0.x) ** 2 + (p.y - c0.y) ** 2;
    const d1 = (p.x - c1.x) ** 2 + (p.y - c1.y) ** 2;
    return d0 <= d1 ? 0 : 1;
  });
}

function mean(pts: typeof POINTS, mask: boolean[]) {
  let sx = 0,
    sy = 0,
    n = 0;
  pts.forEach((p, i) => {
    if (mask[i]) {
      sx += p.x;
      sy += p.y;
      n += 1;
    }
  });
  return n ? { x: sx / n, y: sy / n } : { x: 5, y: 5 };
}

function toSvg(p: { x: number; y: number }, pad: number, plot: number) {
  return {
    px: pad + (p.x / 10) * plot,
    py: pad + (1 - p.y / 10) * plot,
  };
}

/** Fallback when `KMeansUpdateLesson.mp4` is missing. */
export function KMeansUpdateFallback() {
  const pad = 28;
  const plot = 200;

  const { circles, cStart, cMean } = useMemo(() => {
    const labels = assign(POINTS, C0, C1);
    const mask0 = labels.map((l) => l === 0);
    const mask1 = labels.map((l) => l === 1);
    const m0 = mean(POINTS, mask0);
    const m1 = mean(POINTS, mask1);
    const circles = POINTS.map((p, i) => {
      const { px, py } = toSvg(p, pad, plot);
      return { px, py, fill: COLORS[labels[i]] };
    });
    return {
      circles,
      cStart: [toSvg(C0, pad, plot), toSvg(C1, pad, plot)],
      cMean: [toSvg(m0, pad, plot), toSvg(m1, pad, plot)],
    };
  }, []);

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto bg-[#070a10] px-4 py-4">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/k-means-manim/KMeansUpdateLesson.mp4
        </code>{' '}
        for the Step 3 update video.
      </p>
      <svg viewBox="0 0 268 268" className="h-auto w-full max-w-xs shrink-0" aria-hidden>
        <rect width="268" height="268" fill="#0c1220" rx="8" />
        <text x="134" y="16" fill="#94a3b8" fontSize="10" textAnchor="middle">
          Preview: K=2 — centroids move toward cluster means (dashed)
        </text>
        <rect x="28" y="24" width="200" height="200" fill="#070a10" stroke="#1e293b" rx="4" />
        {circles.map((c, i) => (
          <circle key={i} cx={c.px} cy={c.py} r={5} fill={c.fill} opacity={0.92} />
        ))}
        {[0, 1].map((j) => (
          <g key={j}>
            <line
              x1={cStart[j].px}
              y1={cStart[j].py}
              x2={cMean[j].px}
              y2={cMean[j].py}
              stroke={COLORS[j]}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.6}
            />
            <circle cx={cStart[j].px} cy={cStart[j].py} r={4} fill={COLORS[j]} opacity={0.35} />
            <polygon
              points={`${cMean[j].px},${cMean[j].py - 7} ${cMean[j].px + 5},${cMean[j].py + 4} ${cMean[j].px - 5},${cMean[j].py + 4}`}
              fill={COLORS[j]}
              stroke="#f8fafc"
              strokeWidth={1}
            />
          </g>
        ))}
      </svg>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">manim -qh k_means_update_step.py KMeansUpdateLesson</code>
      </p>
    </div>
  );
}
