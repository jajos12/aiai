'use client';

/**
 * Static ROC sketch when the Manim MP4 is missing.
 */
export function ROCFallback() {
  const w = 320;
  const h = 300;
  const p = 40;
  const x1 = p;
  const y1 = h - p;
  const x2 = w - p;
  const y2 = p;

  const toX = (t: number) => p + t * (w - 2 * p);
  const toY = (t: number) => h - p - t * (h - 2 * p);

  const diag = `M ${toX(0)} ${toY(0)} L ${toX(1)} ${toY(1)}`;
  const rocPts = [0, 0.15, 0.3, 0.5, 0.72, 1].map((f, i) => {
    const tpr = [0, 0.45, 0.62, 0.78, 0.92, 1][i];
    return `${toX(f)},${toY(tpr)}`;
  });
  const rocPath = `M ${rocPts.join(' L ')}`;

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col items-center justify-center bg-[#070a10] p-4">
      <p className="mb-3 max-w-md text-center text-sm text-slate-400">
        Video not found — static ROC preview: blue curve above the diagonal (better than random).
      </p>
      <svg width={w} height={h} className="rounded-lg border border-slate-700/80 bg-slate-950">
        <text x={w / 2} y={h - 8} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 11 }}>
          FPR
        </text>
        <text x={12} y={h / 2} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 11 }} transform={`rotate(-90 12 ${h / 2})`}>
          TPR
        </text>
        <path d={diag} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="6 4" />
        <path d={rocPath} fill="none" stroke="#3b82f6" strokeWidth={3} />
      </svg>
    </div>
  );
}
