'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   VectorTransform — Interactive SVG Vector Visualization
   Fluid edition: continuous drag, RAF-throttled, memoized statics,
   spring easing on derived elements, zero external dependencies.
   ═══════════════════════════════════════════════════════════════════ */

// ── Types ──
interface Vec2 {
  x: number;
  y: number;
  color?: string;
  label?: string;
}

interface VectorTransformProps {
  mode?: string;
  vectors?: Vec2[];
  draggable?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  showCoordinates?: boolean;
  showComponentLines?: boolean;
  showMagnitude?: boolean;
  showPythagorean?: boolean;
  showAngle?: boolean;
  showArc?: boolean;
  showUnitVector?: boolean;
  showOriginal?: boolean;
  showSum?: boolean;
  showDifference?: boolean;
  showScalarSlider?: boolean;
  scalarRange?: [number, number];
  showSliders?: boolean;
  showParallelogram?: boolean;
  showDotProduct?: boolean;
  showRightAngle?: boolean;
  showProjection?: boolean;
  showBasisVectors?: boolean;
  showDecomposition?: boolean;
  scalarMultiplier?: number;
  onVectorsChange?: (vectors: Vec2[]) => void;
}

// ── Math Helpers ──
function mag(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}
function angle(v: Vec2): number {
  return Math.atan2(v.y, v.x);
}
function angleBetween(a: Vec2, b: Vec2): number {
  const d = dot(a, b);
  const m = mag(a) * mag(b);
  if (m === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, d / m)));
}
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ── Constants ──
const CANVAS_SIZE = 500;
const GRID_RANGE = 6;
const SCALE = CANVAS_SIZE / (GRID_RANGE * 2);
const CENTER = CANVAS_SIZE / 2;

function toSvg(x: number, y: number): [number, number] {
  return [CENTER + x * SCALE, CENTER - y * SCALE];
}

// Clamp to grid bounds
function clamp(v: number): number {
  return Math.max(-GRID_RANGE, Math.min(GRID_RANGE, v));
}

// ── Arrow head markers (memoized — never re-renders) ──
const MemoArrowDefs = memo(function ArrowDefs() {
  return (
    <defs>
      <marker id="arrowhead-accent" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
      </marker>
      <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
      </marker>
      <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#34d399" />
      </marker>
      <marker id="arrowhead-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#fb923c" />
      </marker>
      <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
      </marker>
      <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#a78bfa" />
      </marker>
      <marker id="arrowhead-white" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="var(--viz-arrowhead)" />
      </marker>
      {/* Glow filter for drag handles */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
});

// ── Grid (memoized — never re-renders) ──
const MemoGrid = memo(function Grid() {
  const lines: React.ReactElement[] = [];
  for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
    const [x1, y1] = toSvg(i, -GRID_RANGE);
    const [x2, y2] = toSvg(i, GRID_RANGE);
    const [hx1, hy1] = toSvg(-GRID_RANGE, i);
    const [hx2, hy2] = toSvg(GRID_RANGE, i);
    const isMain = i === 0;
    lines.push(
      <line key={`v${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isMain ? 'var(--viz-grid-major)' : 'var(--viz-grid-minor)'}
        strokeWidth={isMain ? 1.5 : 0.5} />,
      <line key={`h${i}`} x1={hx1} y1={hy1} x2={hx2} y2={hy2}
        stroke={isMain ? 'var(--viz-grid-major)' : 'var(--viz-grid-minor)'}
        strokeWidth={isMain ? 1.5 : 0.5} />,
    );
    if (i !== 0 && i % 2 === 0) {
      const [lx] = toSvg(i, 0);
      const [, ly] = toSvg(0, i);
      lines.push(
        <text key={`lx${i}`} x={lx} y={CENTER + 14} textAnchor="middle" fontSize="9" fill="var(--viz-axis-label)">{i}</text>,
        <text key={`ly${i}`} x={CENTER - 12} y={ly + 3} textAnchor="middle" fontSize="9" fill="var(--viz-axis-label)">{i}</text>,
      );
    }
  }
  return <g>{lines}</g>;
});

// ── Arrow — no transition for primary tracking, soft ease for derived ──
function Arrow({
  from, to, color = 'var(--accent)', width = 2.5, dashed = false, opacity = 1,
  markerId, secondary = false,
}: {
  from: Vec2; to: Vec2; color?: string; width?: number; dashed?: boolean;
  opacity?: number; markerId?: string; secondary?: boolean;
}) {
  const [x1, y1] = toSvg(from.x, from.y);
  const [x2, y2] = toSvg(to.x, to.y);
  const arrowId = markerId ?? getArrowId(color);
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={width}
      strokeDasharray={dashed ? '6,4' : undefined}
      markerEnd={`url(#${arrowId})`}
      opacity={opacity}
      style={secondary ? { transition: 'x1 60ms, y1 60ms, x2 60ms, y2 60ms' } : undefined}
    />
  );
}

function getArrowId(color: string): string {
  if (color.includes('60a5fa') || color === '#60a5fa') return 'arrowhead-blue';
  if (color.includes('34d399') || color === '#34d399') return 'arrowhead-green';
  if (color.includes('fb923c') || color === '#fb923c') return 'arrowhead-orange';
  if (color.includes('f87171') || color === '#f87171') return 'arrowhead-red';
  if (color.includes('a78bfa') || color === '#a78bfa') return 'arrowhead-purple';
  if (color.includes('rgba(255')) return 'arrowhead-white';
  return 'arrowhead-accent';
}

// ── Coordinate label ──
function CoordLabel({ v, color = 'var(--accent)', offset = { x: 8, y: -8 } }: { v: Vec2; color?: string; offset?: Vec2 }) {
  const [sx, sy] = toSvg(v.x, v.y);
  return (
    <text
      x={sx + offset.x} y={sy + offset.y}
      fontSize="11" fontWeight="600" fontFamily="monospace"
      fill={color}
      style={{ userSelect: 'none' }}
    >
      ({v.x.toFixed(1)}, {v.y.toFixed(1)})
    </text>
  );
}

// ── Vector label ──
function VecLabel({ v, label, color = 'var(--accent)' }: { v: Vec2; label: string; color?: string }) {
  const [sx, sy] = toSvg(v.x, v.y);
  return (
    <text
      x={sx + 10} y={sy - 12}
      fontSize="13" fontWeight="700" fontFamily="var(--font-heading), sans-serif"
      fill={color} style={{ userSelect: 'none' }}
    >
      {label}
    </text>
  );
}

// ═══════════════════════════════════════════════
// DragHandle — Fluid dragging with RAF throttle
// ═══════════════════════════════════════════════
function DragHandle({
  pos, onDrag, color = 'var(--accent)', radius = 8, svgRef,
}: {
  pos: Vec2; onDrag: (v: Vec2) => void; color?: string; radius?: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const dragging = useRef(false);
  const rafId = useRef<number>(0);
  const pending = useRef<Vec2 | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // RAF loop — applies pending drag position at most once per frame
  const flushDrag = useCallback(() => {
    if (pending.current) {
      onDrag(pending.current);
      pending.current = null;
    }
    if (dragging.current) {
      rafId.current = requestAnimationFrame(flushDrag);
    }
  }, [onDrag]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    // Start RAF loop
    rafId.current = requestAnimationFrame(flushDrag);
  }, [flushDrag]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !svgRef.current) return;
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      // Scale factor: SVG viewBox vs actual rendered size
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      // Convert to math coords — continuous, no snapping
      const x = clamp((px - CENTER) / SCALE);
      const y = clamp(-(py - CENTER) / SCALE);
      // Store for RAF to pick up (coalesces fast pointer events)
      pending.current = { x, y };
    },
    [svgRef],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    cancelAnimationFrame(rafId.current);
    // Flush any remaining pending position
    if (pending.current) {
      onDrag(pending.current);
      pending.current = null;
    }
  }, [onDrag]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const [sx, sy] = toSvg(pos.x, pos.y);
  const activeRadius = isHovered || dragging.current ? radius + 2 : radius;

  return (
    <g
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* Glow ring — follows position instantly */}
      <circle cx={sx} cy={sy} r={activeRadius + 6}
        fill={color} opacity={isHovered ? 0.2 : 0.1}
        filter="url(#glow)" />
      {/* Pulse ring on hover */}
      {isHovered && (
        <circle cx={sx} cy={sy} r={activeRadius + 12}
          fill="none" stroke={color} strokeWidth={1} opacity={0.15}>
          <animate attributeName="r" from={String(activeRadius + 6)} to={String(activeRadius + 20)} dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.2" to="0" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Handle circle */}
      <circle
        cx={sx} cy={sy} r={activeRadius}
        fill={color} stroke="white" strokeWidth={2}
        style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </g>
  );
}

// ── Angle arc ──
function AngleArc({ fromAngle, toAngle, radius = 30, color = '#fbbf24' }: {
  fromAngle: number; toAngle: number; radius?: number; color?: string;
}) {
  const [cx, cy] = toSvg(0, 0);
  const start = -fromAngle;
  const end = -toAngle;
  const sweep = ((end - start + 2 * Math.PI) % (2 * Math.PI));
  const largeArc = sweep > Math.PI ? 1 : 0;
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);

  return (
    <path
      d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`}
      fill="none" stroke={color} strokeWidth={2} opacity={0.7}
    />
  );
}

// ── Right angle indicator ──
function RightAngleIndicator({ a, b, size = 12 }: { a: Vec2; b: Vec2; size?: number }) {
  const [ox, oy] = toSvg(0, 0);
  const aAngle = angle(a);
  const bAngle = angle(b);
  const dx1 = Math.cos(-aAngle) * size;
  const dy1 = Math.sin(-aAngle) * size;
  const dx2 = Math.cos(-bAngle) * size;
  const dy2 = Math.sin(-bAngle) * size;

  return (
    <g>
      <path
        d={`M ${ox + dx1} ${oy + dy1} L ${ox + dx1 + dx2} ${oy + dy1 + dy2} L ${ox + dx2} ${oy + dy2}`}
        fill="none" stroke="#34d399" strokeWidth={2}
      />
      {/* Green glow when perpendicular */}
      <circle cx={ox} cy={oy} r={18} fill="#34d399" opacity={0.08}>
        <animate attributeName="opacity" values="0.08;0.15;0.08" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// ═══════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════

export function VectorTransform(props: VectorTransformProps) {
  const {
    mode = 'static',
    vectors: initialVectors,
    draggable = false,
    showGrid = true,
    showCoordinates = false,
    showComponentLines = false,
    showMagnitude = false,
    showPythagorean = false,
    showAngle = false,
    showArc = false,
    showUnitVector = false,
    showOriginal = true,
    showSum = false,
    showDifference = false,
    showScalarSlider = false,
    scalarRange = [-3, 3],
    showSliders = false,
    showParallelogram = false,
    showDotProduct = false,
    showRightAngle = false,
    showProjection = false,
    showBasisVectors = false,
    showDecomposition = false,
  } = props;

  // ── State ──
  const defaultVecs: Vec2[] = initialVectors ?? [{ x: 3, y: 2, color: '#6366f1' }];
  const [vecs, setVecs] = useState<Vec2[]>(defaultVecs);
  const [scalar, setScalar] = useState(props.scalarMultiplier ?? 1);
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync with prop changes (mode switch resets vectors)
  useEffect(() => {
    if (initialVectors) setVecs(initialVectors);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (props.scalarMultiplier !== undefined) setScalar(props.scalarMultiplier);
  }, [props.scalarMultiplier]);

  const updateVec = useCallback((index: number, v: Vec2) => {
    setVecs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...v };
      // Notify parent of vector changes (for challenges)
      if (props.onVectorsChange) {
        props.onVectorsChange(next);
      }
      return next;
    });
  }, [props.onVectorsChange]);

  const a = vecs[0] ?? { x: 3, y: 2 };
  const b = vecs[1] ?? { x: 1, y: 3 };
  const aColor = a.color ?? '#6366f1';
  const bColor = b.color ?? '#34d399';

  // ── Derived values ──
  const magA = mag(a);
  const magB = mag(b);
  const sum: Vec2 = { x: a.x + b.x, y: a.y + b.y };
  const diff: Vec2 = { x: a.x - b.x, y: a.y - b.y };
  const scaledA: Vec2 = { x: a.x * scalar, y: a.y * scalar };
  const dotProduct = dot(a, b);
  const angleA = angle(a);
  const angleB = angle(b);
  const angleBtw = angleBetween(a, b);

  // Projection of a onto b
  const projScalar = mag(b) > 0 ? dot(a, b) / dot(b, b) : 0;
  const projVec: Vec2 = { x: b.x * projScalar, y: b.y * projScalar };

  // Unit vector
  const unitA: Vec2 = magA > 0 ? { x: a.x / magA, y: a.y / magA } : { x: 0, y: 0 };

  // Linear combination
  const linComb: Vec2 = { x: a.x * c1 + b.x * c2, y: a.y * c1 + b.y * c2 };

  // ── Info panel items based on mode ──
  const infoItems = useMemo(() => {
    const items: { label: string; value: string; color?: string }[] = [];

    if (showCoordinates || mode === 'interactive' || mode === 'components') {
      items.push({ label: 'v', value: `(${a.x.toFixed(1)}, ${a.y.toFixed(1)})`, color: aColor });
    }
    if (showMagnitude || mode === 'magnitude') {
      items.push({ label: '‖v‖', value: magA.toFixed(2), color: '#fbbf24' });
    }
    if (showAngle || mode === 'angle') {
      items.push({ label: 'θ', value: `${toDeg(angleA).toFixed(1)}°`, color: '#fbbf24' });
    }
    if (showDotProduct || mode === 'dot-product' || mode === 'perpendicular') {
      items.push({ label: 'a', value: `(${a.x.toFixed(1)}, ${a.y.toFixed(1)})`, color: aColor });
      items.push({ label: 'b', value: `(${b.x.toFixed(1)}, ${b.y.toFixed(1)})`, color: bColor });
      items.push({ label: 'a·b', value: dotProduct.toFixed(2), color: Math.abs(dotProduct) < 0.1 ? '#34d399' : '#fbbf24' });
      items.push({ label: '∠', value: `${toDeg(angleBtw).toFixed(1)}°`, color: '#fbbf24' });
    }
    if (mode === 'addition') {
      items.push({ label: 'a', value: `(${a.x.toFixed(1)}, ${a.y.toFixed(1)})`, color: aColor });
      items.push({ label: 'b', value: `(${b.x.toFixed(1)}, ${b.y.toFixed(1)})`, color: bColor });
      items.push({ label: 'a+b', value: `(${sum.x.toFixed(1)}, ${sum.y.toFixed(1)})`, color: '#fb923c' });
    }
    if (mode === 'subtraction') {
      items.push({ label: 'a−b', value: `(${diff.x.toFixed(1)}, ${diff.y.toFixed(1)})`, color: '#f87171' });
    }
    if (mode === 'scalar') {
      items.push({ label: 'v', value: `(${a.x.toFixed(1)}, ${a.y.toFixed(1)})`, color: aColor });
      items.push({ label: `${scalar.toFixed(1)}v`, value: `(${scaledA.x.toFixed(1)}, ${scaledA.y.toFixed(1)})`, color: '#fb923c' });
    }
    if (mode === 'projection') {
      items.push({ label: 'proj', value: `(${projVec.x.toFixed(2)}, ${projVec.y.toFixed(2)})`, color: '#a78bfa' });
    }
    if (mode === 'unit') {
      items.push({ label: 'v̂', value: `(${unitA.x.toFixed(2)}, ${unitA.y.toFixed(2)})`, color: '#fb923c' });
      items.push({ label: '‖v̂‖', value: '1.00', color: '#34d399' });
    }
    if (mode === 'linear-combination') {
      items.push({ label: `${c1.toFixed(1)}a + ${c2.toFixed(1)}b`, value: `(${linComb.x.toFixed(1)}, ${linComb.y.toFixed(1)})`, color: '#fb923c' });
    }

    return items;
  }, [mode, a, b, aColor, bColor, magA, angleA, dotProduct, angleBtw, sum, diff, scalar, scaledA, projVec, unitA, c1, c2, linComb, showCoordinates, showMagnitude, showAngle, showDotProduct]);

  // ── Determine if mode supports dragging ──
  const isDraggable = draggable ||
    ['interactive', 'magnitude', 'angle', 'addition', 'subtraction',
     'dot-product', 'perpendicular', 'projection'].includes(mode);

  // ── Render mode-specific elements ──
  function renderMode() {
    const elements: React.ReactElement[] = [];
    const origin: Vec2 = { x: 0, y: 0 };

    // Always draw primary vector (unless special modes)
    if (mode !== 'ai-applications') {
      elements.push(
        <Arrow key="vec-a" from={origin} to={a} color={aColor} width={2.5} />,
      );

      if (isDraggable) {
        elements.push(
          <DragHandle key="drag-a" pos={a} color={aColor}
            onDrag={(v) => updateVec(0, v)} svgRef={svgRef} />,
        );
      }
    }

    // Component lines (dashed)
    if (showComponentLines || mode === 'components') {
      const [ox, oy] = toSvg(0, 0);
      const [ax, ay] = toSvg(a.x, a.y);
      const [axX] = toSvg(a.x, 0);
      elements.push(
        <line key="comp-x" x1={ox} y1={oy} x2={axX} y2={oy}
          stroke={aColor} strokeWidth={2} strokeDasharray="4,3" opacity={0.6} />,
        <line key="comp-y" x1={axX} y1={oy} x2={ax} y2={ay}
          stroke={aColor} strokeWidth={2} strokeDasharray="4,3" opacity={0.6} />,
        <text key="comp-xl" x={(ox + axX) / 2} y={oy + 16} textAnchor="middle"
          fontSize="10" fontWeight="600" fill={aColor} opacity={0.8}>
          {a.x.toFixed(1)}
        </text>,
        <text key="comp-yl" x={axX + 12} y={(oy + ay) / 2 + 3} textAnchor="start"
          fontSize="10" fontWeight="600" fill={aColor} opacity={0.8}>
          {a.y.toFixed(1)}
        </text>,
      );
    }

    // Pythagorean triangle
    if (showPythagorean || (mode === 'magnitude' && showPythagorean !== false)) {
      const [ox, oy] = toSvg(0, 0);
      const [ax, ay] = toSvg(a.x, a.y);
      const [axX] = toSvg(a.x, 0);
      elements.push(
        <path key="pyth-tri"
          d={`M ${ox} ${oy} L ${axX} ${oy} L ${ax} ${ay} Z`}
          fill="rgba(99, 102, 241, 0.06)" stroke="rgba(99, 102, 241, 0.2)"
          strokeWidth={1} strokeDasharray="3,3" />,
      );
      elements.push(
        <text key="pyth-x" x={(ox + axX) / 2} y={oy + 16} textAnchor="middle"
          fontSize="10" fontWeight="600" fill="var(--viz-annotation)">x²</text>,
        <text key="pyth-y" x={axX + 14} y={(oy + ay) / 2} textAnchor="start"
          fontSize="10" fontWeight="600" fill="var(--viz-annotation)">y²</text>,
      );
    }

    // Magnitude display
    if (showMagnitude || mode === 'magnitude') {
      const mid = { x: a.x / 2, y: a.y / 2 };
      const [mx, my] = toSvg(mid.x, mid.y);
      elements.push(
        <text key="mag-label" x={mx - 14} y={my - 8} textAnchor="middle"
          fontSize="11" fontWeight="700" fill="#fbbf24"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          ‖v‖ = {magA.toFixed(2)}
        </text>,
      );
    }

    // Angle arc
    if ((showAngle || showArc || mode === 'angle') && magA > 0) {
      elements.push(
        <AngleArc key="angle-arc" fromAngle={0} toAngle={angleA} radius={35} />,
      );
      const labelAngle = angleA / 2;
      const [lx, ly] = toSvg(0, 0);
      elements.push(
        <text key="angle-label"
          x={lx + 48 * Math.cos(-labelAngle)} y={ly + 48 * Math.sin(-labelAngle)}
          textAnchor="middle" fontSize="10" fontWeight="600" fill="#fbbf24">
          {toDeg(angleA).toFixed(1)}°
        </text>,
      );
    }

    // Unit vector
    if (showUnitVector || mode === 'unit') {
      if (showOriginal) {
        elements.push(
          <Arrow key="orig-dim" from={origin} to={a} color={aColor} width={1.5} opacity={0.3} />,
        );
      }
      elements.push(
        <Arrow key="unit-vec" from={origin} to={unitA} color="#fb923c" width={3} secondary />,
      );
      const [cx, cy] = toSvg(0, 0);
      elements.push(
        <circle key="unit-circle" cx={cx} cy={cy} r={SCALE}
          fill="none" stroke="rgba(251, 146, 60, 0.15)" strokeWidth={1} strokeDasharray="4,3" />,
      );
    }

    // Addition
    if (mode === 'addition' || showSum) {
      // Vector b: tip-to-tail from a
      elements.push(
        <Arrow key="vec-b-tail" from={a} to={sum} color={bColor} width={2.5} />,
      );
      // Ghosted b from origin
      elements.push(
        <Arrow key="vec-b-ghost" from={origin} to={b} color={bColor} width={1.5} dashed opacity={0.3} />,
      );
      // Sum vector (derived — gets soft ease)
      elements.push(
        <Arrow key="vec-sum" from={origin} to={sum} color="#fb923c" width={3} secondary />,
      );
      elements.push(
        <VecLabel key="la" v={{ x: a.x / 2, y: a.y / 2 }} label={a.label ?? 'a'} color={aColor} />,
        <VecLabel key="lb" v={{ x: (a.x + sum.x) / 2, y: (a.y + sum.y) / 2 }} label={b.label ?? 'b'} color={bColor} />,
        <VecLabel key="ls" v={sum} label="a+b" color="#fb923c" />,
      );
      if (showParallelogram) {
        const [ox, oy] = toSvg(0, 0);
        const [ax, ay] = toSvg(a.x, a.y);
        const [bx, by] = toSvg(b.x, b.y);
        const [sx, sy] = toSvg(sum.x, sum.y);
        elements.push(
          <path key="parallelogram"
            d={`M ${ox} ${oy} L ${ax} ${ay} L ${sx} ${sy} L ${bx} ${by} Z`}
            fill="rgba(251, 146, 60, 0.06)" stroke="rgba(251, 146, 60, 0.2)"
            strokeWidth={1} strokeDasharray="4,3" />,
        );
      }
      if (isDraggable) {
        elements.push(
          <DragHandle key="drag-b" pos={b} color={bColor}
            onDrag={(v) => updateVec(1, v)} svgRef={svgRef} />,
        );
      }
    }

    // Subtraction
    if (mode === 'subtraction' || showDifference) {
      elements.push(
        <Arrow key="vec-b" from={origin} to={b} color={bColor} width={2.5} />,
        <Arrow key="vec-diff" from={b} to={a} color="#f87171" width={3} secondary />,
      );
      elements.push(
        <VecLabel key="ld" v={{ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }} label="a−b" color="#f87171" />,
      );
      if (isDraggable) {
        elements.push(
          <DragHandle key="drag-b" pos={b} color={bColor}
            onDrag={(v) => updateVec(1, v)} svgRef={svgRef} />,
        );
      }
    }

    // Scalar multiplication
    if (mode === 'scalar') {
      elements.push(
        <Arrow key="orig-ghost" from={origin} to={a} color={aColor} width={1.5} dashed opacity={0.4} />,
      );
      const clampedScaled: Vec2 = {
        x: clamp(scaledA.x),
        y: clamp(scaledA.y),
      };
      elements.push(
        <Arrow key="scaled" from={origin} to={clampedScaled} color="#fb923c" width={3} />,
      );
      elements.push(
        <CoordLabel key="scaled-label" v={clampedScaled} color="#fb923c" />,
      );
    }

    // Dot product
    if (mode === 'dot-product') {
      elements.push(
        <Arrow key="vec-b" from={origin} to={b} color={bColor} width={2.5} />,
      );
      if (isDraggable) {
        elements.push(
          <DragHandle key="drag-b" pos={b} color={bColor}
            onDrag={(v) => updateVec(1, v)} svgRef={svgRef} />,
        );
      }
      if (magA > 0 && magB > 0) {
        elements.push(
          <AngleArc key="dot-arc" fromAngle={angleB} toAngle={angleA} radius={30} />,
        );
      }
    }

    // Perpendicularity
    if (mode === 'perpendicular') {
      elements.push(
        <Arrow key="vec-b" from={origin} to={b} color={bColor} width={2.5} />,
      );
      if (isDraggable) {
        elements.push(
          <DragHandle key="drag-b" pos={b} color={bColor}
            onDrag={(v) => updateVec(1, v)} svgRef={svgRef} />,
        );
      }
      if (Math.abs(dotProduct) < 0.3 && magA > 0 && magB > 0) {
        elements.push(
          <RightAngleIndicator key="right-angle" a={a} b={b} />,
        );
      }
    }

    // Projection
    if (mode === 'projection' || showProjection) {
      elements.push(
        <Arrow key="vec-b" from={origin} to={b} color={bColor} width={2.5} />,
      );
      elements.push(
        <Arrow key="proj-vec" from={origin} to={projVec} color="#a78bfa" width={3} secondary />,
      );
      const [ax, ay] = toSvg(a.x, a.y);
      const [px, py] = toSvg(projVec.x, projVec.y);
      elements.push(
        <line key="proj-drop" x1={ax} y1={ay} x2={px} y2={py}
          stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />,
      );
      elements.push(
        <VecLabel key="proj-label" v={projVec} label="proj" color="#a78bfa" />,
      );
      if (isDraggable) {
        elements.push(
          <DragHandle key="drag-b" pos={b} color={bColor}
            onDrag={(v) => updateVec(1, v)} svgRef={svgRef} />,
        );
      }
    }

    // Standard basis
    if (mode === 'basis' || showBasisVectors) {
      const iHat: Vec2 = { x: 1, y: 0 };
      const jHat: Vec2 = { x: 0, y: 1 };
      elements.push(
        <Arrow key="i-hat" from={origin} to={iHat} color="#f87171" width={3} />,
        <Arrow key="j-hat" from={origin} to={jHat} color="#60a5fa" width={3} />,
      );
      elements.push(
        <VecLabel key="li" v={iHat} label="î" color="#f87171" />,
        <VecLabel key="lj" v={jHat} label="ĵ" color="#60a5fa" />,
      );
      if (showDecomposition) {
        const [ox, oy] = toSvg(0, 0);
        const [ax, ay] = toSvg(a.x, a.y);
        const [axX] = toSvg(a.x, 0);
        elements.push(
          <line key="decomp-x" x1={ox} y1={oy} x2={axX} y2={oy}
            stroke="#f87171" strokeWidth={2} strokeDasharray="5,3" opacity={0.5} />,
          <line key="decomp-y" x1={axX} y1={oy} x2={ax} y2={ay}
            stroke="#60a5fa" strokeWidth={2} strokeDasharray="5,3" opacity={0.5} />,
        );
        elements.push(
          <text key="decomp-xl" x={(ox + axX) / 2} y={oy + 16} textAnchor="middle"
            fontSize="10" fontWeight="600" fill="#f87171">{a.x.toFixed(1)}î</text>,
          <text key="decomp-yl" x={axX + 14} y={(oy + ay) / 2} textAnchor="start"
            fontSize="10" fontWeight="600" fill="#60a5fa">{a.y.toFixed(1)}ĵ</text>,
        );
      }
    }

    // Linear combination
    if (mode === 'linear-combination') {
      const sa: Vec2 = { x: a.x * c1, y: a.y * c1 };
      const sb: Vec2 = { x: b.x * c2, y: b.y * c2 };
      elements.push(
        <Arrow key="vec-b-ghost" from={origin} to={b} color={bColor} width={1.5} dashed opacity={0.3} />,
        <Arrow key="sa" from={origin} to={sa} color={aColor} width={2} />,
        <Arrow key="sb-tail" from={sa} to={linComb} color={bColor} width={2} />,
        <Arrow key="result" from={origin} to={linComb} color="#fb923c" width={3} secondary />,
      );
      if (showParallelogram) {
        const [ox, oy] = toSvg(0, 0);
        const [sax, say] = toSvg(sa.x, sa.y);
        const [sbx, sby] = toSvg(sb.x, sb.y);
        const [lx, ly] = toSvg(linComb.x, linComb.y);
        elements.push(
          <path key="lc-para"
            d={`M ${ox} ${oy} L ${sax} ${say} L ${lx} ${ly} L ${sbx} ${sby} Z`}
            fill="rgba(251, 146, 60, 0.05)" stroke="rgba(251, 146, 60, 0.15)"
            strokeWidth={1} strokeDasharray="4,3" />,
        );
      }
    }

    // AI applications — decorative embedding mode
    if (mode === 'ai-applications') {
      const embeddings: Vec2[] = [
        { x: 3, y: 4 }, { x: -2, y: 3 }, { x: 4, y: -1 },
        { x: -1, y: -3 }, { x: 2, y: 1 }, { x: -3, y: 2 },
      ];
      const colors = ['#60a5fa', '#34d399', '#fb923c', '#f87171', '#a78bfa', '#fbbf24'];
      const labels = ['king', 'queen', 'man', 'woman', 'cat', 'dog'];
      embeddings.forEach((v, i) => {
        elements.push(
          <Arrow key={`emb-${i}`} from={origin} to={v} color={colors[i]} width={2} />,
          <VecLabel key={`embl-${i}`} v={v} label={labels[i]} color={colors[i]} />,
        );
      });
      const [kx, ky] = toSvg(3, 4);
      const [qx, qy] = toSvg(-2, 3);
      elements.push(
        <line key="analogy" x1={kx} y1={ky} x2={qx} y2={qy}
          stroke="var(--viz-dashed)" strokeWidth={1} strokeDasharray="4,3" />,
      );
    }

    // Coordinates
    if (showCoordinates || mode === 'interactive') {
      elements.push(<CoordLabel key="coord-a" v={a} color={aColor} />);
    }

    return elements;
  }

  // ── Render ──
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--viz-bg-gradient)',
          borderRadius: 'var(--radius-md)',
          touchAction: 'none', /* Prevent browser gestures from fighting drag */
        }}
      >
        <MemoArrowDefs />
        {showGrid && <MemoGrid />}
        {renderMode()}
      </svg>

      {/* Info overlay */}
      {infoItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            background: 'var(--viz-panel-bg)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            border: '1px solid var(--viz-panel-border)',
            padding: '6px 10px',
            fontFamily: 'monospace',
            fontSize: '11px',
            lineHeight: '20px',
            pointerEvents: 'none',
          }}
        >
          {infoItems.map((item, i) => (
            <div key={i}>
              <span style={{ color: 'var(--viz-label)' }}>{item.label}: </span>
              <span style={{ color: item.color ?? '#e0e0e0', fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Scalar slider overlay */}
      {(showScalarSlider || mode === 'scalar') && (
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            background: 'var(--viz-panel-bg)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            border: '1px solid var(--viz-panel-border)',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--viz-annotation)', fontFamily: 'monospace' }}>
            c =
          </span>
          <input
            type="range"
            min={scalarRange[0]}
            max={scalarRange[1]}
            step={0.1}
            value={scalar}
            onChange={(e) => setScalar(parseFloat(e.target.value))}
            style={{ width: '160px', accentColor: '#fb923c' }}
          />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fb923c', fontFamily: 'monospace', minWidth: '32px' }}>
            {scalar.toFixed(1)}
          </span>
        </div>
      )}

      {/* Linear combination sliders */}
      {(showSliders || mode === 'linear-combination') && (
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '1.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--viz-panel-bg)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            border: '1px solid var(--viz-panel-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '11px', color: aColor, fontFamily: 'monospace' }}>c₁</span>
            <input type="range" min={-3} max={3} step={0.1} value={c1}
              onChange={(e) => setC1(parseFloat(e.target.value))}
              style={{ width: '100px', accentColor: aColor }} />
            <span style={{ fontSize: '11px', color: aColor, fontFamily: 'monospace', minWidth: '28px' }}>{c1.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '11px', color: bColor, fontFamily: 'monospace' }}>c₂</span>
            <input type="range" min={-3} max={3} step={0.1} value={c2}
              onChange={(e) => setC2(parseFloat(e.target.value))}
              style={{ width: '100px', accentColor: bColor }} />
            <span style={{ fontSize: '11px', color: bColor, fontFamily: 'monospace', minWidth: '28px' }}>{c2.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
