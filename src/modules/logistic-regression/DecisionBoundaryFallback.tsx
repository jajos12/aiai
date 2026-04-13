'use client';

/**
 * Static 2D plot when the Manim MP4 is missing — same geometry as the lesson (x₁ + x₂ = 8).
 */
export function DecisionBoundaryFallback() {
  const pad = 36;
  const w = 320;
  const h = 320;
  const xMin = 0;
  const xMax = 9;
  const yMin = 0;
  const yMax = 10;

  const sx = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (w - 2 * pad);
  const sy = (y: number) => h - pad - ((y - yMin) / (yMax - yMin)) * (h - 2 * pad);

  const points: { x: number; y: number; c: 0 | 1 }[] = [
    { x: 2, y: 2, c: 0 },
    { x: 3, y: 1, c: 0 },
    { x: 1, y: 3, c: 0 },
    { x: 6, y: 5, c: 1 },
    { x: 7, y: 7, c: 1 },
    { x: 5, y: 8, c: 1 },
  ];

  const lineStart = { x: sx(0.2), y: sy(7.8) };
  const lineEnd = { x: sx(7.8), y: sy(0.2) };

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center bg-[#070a10] p-4">
      <p className="mb-3 max-w-md text-center text-sm text-slate-400">
        Video not found — static preview: decision line <code className="text-cyan-300">x₁ + x₂ = 8</code> (z = 0),
        blue = class 0, red = class 1.
      </p>
      <svg width={w} height={h} className="rounded-lg border border-slate-700/80 bg-slate-950">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#475569" strokeWidth={1} />
        <line x1={pad} y1={h - pad} x2={pad} y2={pad} stroke="#475569" strokeWidth={1} />
        <text x={w / 2} y={h - 10} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 11 }}>
          x₁
        </text>
        <text x={12} y={h / 2} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 11 }} transform={`rotate(-90 12 ${h / 2})`}>
          x₂
        </text>
        <line
          x1={lineStart.x}
          y1={lineStart.y}
          x2={lineEnd.x}
          y2={lineEnd.y}
          stroke="#facc15"
          strokeWidth={3}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={7}
            fill={p.c === 0 ? '#3b82f6' : '#ef4444'}
            stroke="#0f172a"
            strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  );
}
