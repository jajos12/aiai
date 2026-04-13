'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { voronoi as buildVoronoi } from '@visx/voronoi';

export type XY = { x: number; y: number };

const COLORS = ['#f87171', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#f472b6', '#2dd4bf', '#fb923c'];

const VIEW = 520;
const PAD = 56;
const PLOT = VIEW - PAD * 2;

function clamp01(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function dataToPx(p: XY) {
  const px = PAD + (p.x / 10) * PLOT;
  const py = PAD + (1 - p.y / 10) * PLOT;
  return { px, py };
}

function pxToData(px: number, py: number): XY {
  const x = ((px - PAD) / PLOT) * 10;
  const y = ((VIEW - PAD - py) / PLOT) * 10;
  return {
    x: clamp01(x, 0, 10),
    y: clamp01(y, 0, 10),
  };
}

function assignLabels(points: XY[], centroids: XY[]): number[] {
  return points.map((p) => {
    let best = 0;
    let bestD = Infinity;
    centroids.forEach((c, j) => {
      const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    });
    return best;
  });
}

function clusterMeans(points: XY[], labels: number[], k: number): XY[] {
  const sums = Array.from({ length: k }, () => ({ sx: 0, sy: 0, n: 0 }));
  points.forEach((p, i) => {
    const j = labels[i];
    if (j >= 0 && j < k) {
      sums[j].sx += p.x;
      sums[j].sy += p.y;
      sums[j].n += 1;
    }
  });
  return sums.map((s, j) =>
    s.n > 0
      ? { x: s.sx / s.n, y: s.sy / s.n }
      : { x: 5, y: 5 + j * 0.05 },
  );
}

function makePlaygroundPoints(): XY[] {
  const blobs = [
    { cx: 2.5, cy: 2.5 },
    { cx: 7.5, cy: 7.5 },
    { cx: 2.5, cy: 7.5 },
  ];
  const pts: XY[] = [];
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (const b of blobs) {
    for (let i = 0; i < 12; i++) {
      const u = rnd() * 2 - 1;
      const v = rnd() * 2 - 1;
      pts.push({
        x: clamp01(b.cx + u * 1.15, 0.4, 9.6),
        y: clamp01(b.cy + v * 1.15, 0.4, 9.6),
      });
    }
  }
  return pts;
}

let centroidRng = 7;
function nextCentroidUnit() {
  centroidRng = (centroidRng * 1103515245 + 12345) >>> 0;
  return centroidRng / 4294967296;
}

function randomCentroids(k: number): XY[] {
  return Array.from({ length: k }, () => ({
    x: 1 + nextCentroidUnit() * 8,
    y: 1 + nextCentroidUnit() * 8,
  }));
}

function randomCentroid(): XY {
  return { x: 1 + nextCentroidUnit() * 8, y: 1 + nextCentroidUnit() * 8 };
}

function starPath(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (-Math.PI / 2 + (i * Math.PI) / 5) * 2;
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${pts.join(' ')} Z`;
}

export interface KMeansInteractive2DProps {
  presentation?: string;
  mode?: string;
  k?: number;
  points?: XY[];
  centroids?: XY[];
  draggableCentroids?: boolean;
  showAssignments?: boolean;
  showVoronoi?: boolean;
  showUpdateAnimation?: boolean;
  onCentroidsChange?: (centroids: XY[]) => void;
}

export default function KMeansInteractive2D({
  presentation,
  k: kProp = 3,
  points: pointsProp,
  centroids: centroidsProp,
  draggableCentroids = true,
  showAssignments = true,
  showVoronoi = false,
  showUpdateAnimation = false,
  onCentroidsChange,
}: KMeansInteractive2DProps) {
  const isPlayground = presentation === 'playground';
  const playgroundPoints = useMemo(() => makePlaygroundPoints(), []);
  const points = useMemo(() => {
    if (pointsProp && pointsProp.length > 0) return pointsProp;
    return playgroundPoints;
  }, [pointsProp, playgroundPoints]);

  const k = Math.max(2, Math.min(COLORS.length, Math.round(Number(kProp) || 3)));

  const [centroids, setCentroids] = useState<XY[]>(() => {
    if (centroidsProp && centroidsProp.length > 0) {
      return centroidsProp.slice(0, k).map((c) => ({ ...c }));
    }
    return randomCentroids(k);
  });

  const centroidsPropKey = useMemo(
    () => (centroidsProp ? JSON.stringify(centroidsProp) : ''),
    [centroidsProp],
  );

  /** Keep centroid count in sync with K before paint (playground slider) and reset from challenge props. */
  useLayoutEffect(() => {
    if (isPlayground) {
      setCentroids((prev) => {
        if (prev.length === k) return prev;
        if (prev.length > k) return prev.slice(0, k).map((c) => ({ ...c }));
        const next = prev.map((c) => ({ ...c }));
        while (next.length < k) next.push(randomCentroid());
        return next;
      });
      return;
    }
    if (centroidsProp && centroidsProp.length > 0) {
      const next = centroidsProp.slice(0, k);
      while (next.length < k) {
        next.push({ x: 5 + next.length * 0.1, y: 5 });
      }
      setCentroids(next.map((c) => ({ ...c })));
    }
  }, [isPlayground, k, centroidsPropKey]);

  const labels = useMemo(() => assignLabels(points, centroids), [points, centroids]);

  useEffect(() => {
    onCentroidsChange?.(centroids.map((c) => ({ ...c })));
  }, [centroids, onCentroidsChange]);

  const dragging = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const plotClipId = useId().replace(/:/g, '');

  const onSvgPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const i = dragging.current;
      const svg = e.currentTarget;
      if (i === null || !draggableCentroids) return;
      const rect = svg.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * VIEW;
      const sy = ((e.clientY - rect.top) / rect.height) * VIEW;
      const next = pxToData(sx, sy);
      setCentroids((prev) => {
        const copy = prev.map((c) => ({ ...c }));
        if (copy[i]) copy[i] = next;
        return copy;
      });
    },
    [draggableCentroids],
  );

  const onSvgPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging.current === null) return;
    dragging.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* not capturing */
    }
  }, []);

  const onCentroidPointerDown = useCallback(
    (idx: number) => (e: React.PointerEvent) => {
      if (!draggableCentroids || !svgRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      dragging.current = idx;
      svgRef.current.setPointerCapture(e.pointerId);
    },
    [draggableCentroids],
  );

  const voronoiPaths = useMemo(() => {
    if (!showVoronoi || centroids.length < 2) return [];
    const sites = centroids.map((c) => {
      const { px, py } = dataToPx(c);
      return { x: px, y: py };
    });
    type VoronoiSite = { x: number; y: number };
    const layout = buildVoronoi({
      width: VIEW,
      height: VIEW,
      x: (d: VoronoiSite) => d.x,
      y: (d: VoronoiSite) => d.y,
    });
    const polys = layout.polygons(sites);
    return polys
      .map((poly, idx) => {
        if (!poly || poly.length < 2) return null;
        const d = poly.map((pt) => `${pt[0].toFixed(2)},${pt[1].toFixed(2)}`).join(' L');
        return { d: `M ${d} Z`, idx };
      })
      .filter(Boolean) as { d: string; idx: number }[];
  }, [showVoronoi, centroids]);

  const runLloydStep = useCallback(() => {
    setCentroids((prev) => {
      const labs = assignLabels(points, prev);
      return clusterMeans(points, labs, prev.length);
    });
  }, [points]);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-[#070a10]">
      <svg
        ref={svgRef}
        role="img"
        aria-label="K-means interactive plot"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="h-full w-full touch-none select-none"
        onPointerMove={onSvgPointerMove}
        onPointerUp={onSvgPointerUp}
        onPointerCancel={onSvgPointerUp}
      >
        <rect width={VIEW} height={VIEW} fill="#070a10" />
        <defs>
          <clipPath id={plotClipId}>
            <rect x={PAD} y={PAD} width={PLOT} height={PLOT} rx={6} />
          </clipPath>
        </defs>
        {/* Plot frame */}
        <rect
          x={PAD}
          y={PAD}
          width={PLOT}
          height={PLOT}
          fill="#0c1220"
          stroke="#1e293b"
          strokeWidth={1.5}
          rx={6}
        />
        {[0, 2, 4, 6, 8, 10].map((t) => {
          const x = PAD + (t / 10) * PLOT;
          const y = PAD + (1 - t / 10) * PLOT;
          return (
            <g key={`tick-${t}`}>
              <line x1={x} y1={VIEW - PAD} x2={x} y2={VIEW - PAD + 5} stroke="#475569" strokeWidth={1} />
              <text x={x} y={VIEW - PAD + 18} fill="#64748b" fontSize={11} textAnchor="middle">
                {t}
              </text>
              <line x1={PAD - 5} y1={y} x2={PAD} y2={y} stroke="#475569" strokeWidth={1} />
              <text x={PAD - 10} y={y + 4} fill="#64748b" fontSize={11} textAnchor="end">
                {t}
              </text>
            </g>
          );
        })}

        <g clipPath={`url(#${plotClipId})`}>
          {voronoiPaths.map(({ d, idx }) => (
            <path
              key={`v-${idx}`}
              d={d}
              fill={COLORS[idx % COLORS.length]}
              fillOpacity={0.1}
              stroke={COLORS[idx % COLORS.length]}
              strokeOpacity={0.35}
              strokeWidth={1}
            />
          ))}

          {points.map((p, i) => {
            const { px, py } = dataToPx(p);
            const c = showAssignments ? COLORS[labels[i] % COLORS.length] : '#94a3b8';
            return <circle key={`p-${i}`} cx={px} cy={py} r={5} fill={c} opacity={0.92} />;
          })}

          {centroids.map((c, j) => {
            const { px, py } = dataToPx(c);
            return (
              <path
                key={`c-${j}`}
                d={starPath(px, py, 14)}
                fill={COLORS[j % COLORS.length]}
                stroke="#f8fafc"
                strokeWidth={1.2}
                style={{
                  cursor: draggableCentroids ? 'grab' : 'default',
                  touchAction: 'none',
                }}
                onPointerDown={onCentroidPointerDown(j)}
              />
            );
          })}
        </g>
      </svg>

      {showUpdateAnimation && (
        <div className="pointer-events-auto absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
          <button
            type="button"
            className="rounded-lg border border-slate-600 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-sm hover:bg-slate-800"
            onClick={runLloydStep}
          >
            Run one Lloyd step (assign → update means)
          </button>
        </div>
      )}

      {isPlayground && (
        <p className="pointer-events-none absolute left-3 top-2 max-w-[min(280px,90%)] text-[10px] leading-snug text-slate-500">
          Playground: drag stars to reassign points; lower K merges clusters visually.
        </p>
      )}
    </div>
  );
}
