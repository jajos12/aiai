'use client';

import React from 'react';

/** Fallback when `KMeansDistanceMetricsLesson.mp4` is missing. */
export function KMeansDistanceFallback() {
  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 overflow-y-auto bg-[#070a10] px-4 py-4">
      <p className="text-center text-sm text-slate-400">
        Add{' '}
        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-violet-200">
          public/k-means-manim/KMeansDistanceMetricsLesson.mp4
        </code>{' '}
        for the distance / closeness video.
      </p>
      <svg viewBox="0 0 480 220" className="h-auto w-full max-w-2xl shrink-0" aria-hidden>
        <rect width="480" height="220" fill="#0c1220" rx="8" />
        <text x="120" y="22" fill="#94a3b8" fontSize="11" textAnchor="middle">
          L₂ unit ball (circle)
        </text>
        <text x="360" y="22" fill="#94a3b8" fontSize="11" textAnchor="middle">
          L₁ unit ball (diamond)
        </text>
        <circle
          cx="120"
          cy="130"
          r="72"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2.5"
        />
        <polygon
          points="360,58 432,130 360,202 288,130"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2.5"
        />
        <text x="240" y="210" fill="#64748b" fontSize="10" textAnchor="middle">
          Same numeric radius 1 — different shapes → different “neighborhoods”
        </text>
      </svg>
      <p className="max-w-md text-center text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">manim -qh k_means_distance_metrics.py KMeansDistanceMetricsLesson</code>
      </p>
    </div>
  );
}
