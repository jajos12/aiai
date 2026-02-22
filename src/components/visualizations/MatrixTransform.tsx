'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   MatrixTransform — Interactive 2×2 Matrix Visualization
   Shows how a matrix transforms the entire 2D plane.

   Modes: identity, scale, rotation, shear, reflection, determinant,
   eigenvectors, compose, inverse, custom, image-transform,
   cnn-kernel, ai-applications
   ═══════════════════════════════════════════════════════════════════ */

// ── Types ──
interface Vec2 { x: number; y: number }
interface Mat2 { a: number; b: number; c: number; d: number } // [[a,b],[c,d]]

interface MatrixTransformProps {
  mode?: string;
  matrix?: Mat2;
  showGrid?: boolean;
  showTransformedGrid?: boolean;
  showBasisVectors?: boolean;
  showTransformedBasis?: boolean;
  showDeterminant?: boolean;
  showEigenvectors?: boolean;
  showUnitCircle?: boolean;
  showTransformedCircle?: boolean;
  interactive?: boolean;
  animateTransition?: boolean;
  secondMatrix?: Mat2;
  showComposition?: boolean;
  showInverse?: boolean;
  /** Called when matrix changes via drag */
  onMatrixChange?: (m: Mat2) => void;
}

// ── Math Helpers ──
function matMul(m: Mat2, v: Vec2): Vec2 {
  return { x: m.a * v.x + m.b * v.y, y: m.c * v.x + m.d * v.y };
}
function det(m: Mat2): number {
  return m.a * m.d - m.b * m.c;
}
function matCompose(a: Mat2, b: Mat2): Mat2 {
  return {
    a: a.a * b.a + a.b * b.c,
    b: a.a * b.b + a.b * b.d,
    c: a.c * b.a + a.d * b.c,
    d: a.c * b.b + a.d * b.d,
  };
}
function matInverse(m: Mat2): Mat2 | null {
  const d = det(m);
  if (Math.abs(d) < 1e-10) return null;
  return { a: m.d / d, b: -m.b / d, c: -m.c / d, d: m.a / d };
}
function mag(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

// Eigenvalues of 2x2 matrix: λ² - (a+d)λ + det = 0
function eigenvalues(m: Mat2): { real: number[]; complex: boolean } {
  const trace = m.a + m.d;
  const d = det(m);
  const disc = trace * trace - 4 * d;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    return { real: [(trace + s) / 2, (trace - s) / 2], complex: false };
  }
  return { real: [trace / 2], complex: true };
}

// Eigenvector for eigenvalue λ: (A - λI)v = 0
function eigenvector(m: Mat2, lambda: number): Vec2 {
  const a = m.a - lambda;
  const b = m.b;
  if (Math.abs(b) > 1e-10) {
    const v: Vec2 = { x: -b, y: a };
    const l = mag(v);
    return l > 0 ? { x: v.x / l, y: v.y / l } : { x: 1, y: 0 };
  }
  const c = m.c;
  if (Math.abs(c) > 1e-10) {
    const v: Vec2 = { x: m.d - lambda, y: -c };
    const l = mag(v);
    return l > 0 ? { x: v.x / l, y: v.y / l } : { x: 0, y: 1 };
  }
  return { x: 1, y: 0 };
}

// ── Constants ──
const CANVAS_SIZE = 500;
const GRID_RANGE = 5;
const SCALE = CANVAS_SIZE / (GRID_RANGE * 2);
const CENTER = CANVAS_SIZE / 2;

function toSvg(x: number, y: number): [number, number] {
  return [CENTER + x * SCALE, CENTER - y * SCALE];
}
function clamp(v: number): number {
  return Math.max(-GRID_RANGE, Math.min(GRID_RANGE, v));
}

// ── Memoized SVG Defs ──
const MemoDefs = memo(function MatrixDefs() {
  return (
    <defs>
      <marker id="mx-arrow-accent" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
      </marker>
      <marker id="mx-arrow-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
      </marker>
      <marker id="mx-arrow-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
      </marker>
      <marker id="mx-arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#34d399" />
      </marker>
      <marker id="mx-arrow-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#fb923c" />
      </marker>
      <marker id="mx-arrow-purple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#a78bfa" />
      </marker>
      <marker id="mx-arrow-yellow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
      </marker>
      <filter id="mx-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
});

// ── Original Grid (memoized) ──
const MemoOriginalGrid = memo(function OriginalGrid() {
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

// ── Transformed Grid ──
function TransformedGrid({ matrix }: { matrix: Mat2 }) {
  const lines: React.ReactElement[] = [];

  // Vertical lines: x = i, y varies from -GRID_RANGE to GRID_RANGE
  for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
    const points: string[] = [];
    for (let t = -GRID_RANGE; t <= GRID_RANGE; t += 0.5) {
      const transformed = matMul(matrix, { x: i, y: t });
      const [sx, sy] = toSvg(transformed.x, transformed.y);
      points.push(`${sx},${sy}`);
    }
    lines.push(
      <polyline key={`tv${i}`} points={points.join(' ')}
        fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth={0.8} />,
    );
  }

  // Horizontal lines: y = i, x varies
  for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
    const points: string[] = [];
    for (let t = -GRID_RANGE; t <= GRID_RANGE; t += 0.5) {
      const transformed = matMul(matrix, { x: t, y: i });
      const [sx, sy] = toSvg(transformed.x, transformed.y);
      points.push(`${sx},${sy}`);
    }
    lines.push(
      <polyline key={`th${i}`} points={points.join(' ')}
        fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth={0.8} />,
    );
  }

  return <g>{lines}</g>;
}

// ── Arrow ──
function Arrow({
  from, to, color, width = 2.5, dashed = false, opacity = 1, markerId,
}: {
  from: Vec2; to: Vec2; color: string; width?: number; dashed?: boolean; opacity?: number; markerId?: string;
}) {
  const [x1, y1] = toSvg(from.x, from.y);
  const [x2, y2] = toSvg(to.x, to.y);
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={width}
      strokeDasharray={dashed ? '6,4' : undefined}
      markerEnd={`url(#${markerId ?? 'mx-arrow-accent'})`}
      opacity={opacity}
    />
  );
}

// ── DragHandle (reuses same RAF pattern from VectorTransform) ──
function DragHandle({
  pos, onDrag, color = 'var(--accent)', radius = 8, svgRef, label,
}: {
  pos: Vec2; onDrag: (v: Vec2) => void; color?: string; radius?: number;
  svgRef: React.RefObject<SVGSVGElement | null>; label?: string;
}) {
  const dragging = useRef(false);
  const rafId = useRef<number>(0);
  const pending = useRef<Vec2 | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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
    rafId.current = requestAnimationFrame(flushDrag);
  }, [flushDrag]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !svgRef.current) return;
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const x = clamp((px - CENTER) / SCALE);
      const y = clamp(-(py - CENTER) / SCALE);
      pending.current = { x, y };
    },
    [svgRef],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    cancelAnimationFrame(rafId.current);
    if (pending.current) {
      onDrag(pending.current);
      pending.current = null;
    }
  }, [onDrag]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const [sx, sy] = toSvg(pos.x, pos.y);
  const activeRadius = isHovered ? radius + 2 : radius;

  return (
    <g onPointerEnter={() => setIsHovered(true)} onPointerLeave={() => setIsHovered(false)}>
      <circle cx={sx} cy={sy} r={activeRadius + 6}
        fill={color} opacity={isHovered ? 0.2 : 0.1} filter="url(#mx-glow)" />
      {isHovered && (
        <circle cx={sx} cy={sy} r={activeRadius + 12}
          fill="none" stroke={color} strokeWidth={1} opacity={0.15}>
          <animate attributeName="r" from={String(activeRadius + 6)} to={String(activeRadius + 20)} dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.2" to="0" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      <circle
        cx={sx} cy={sy} r={activeRadius}
        fill={color} stroke="white" strokeWidth={2}
        style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      {label && (
        <text x={sx + 12} y={sy - 10} fontSize="11" fontWeight="700" fill={color}
          fontFamily="var(--font-heading), sans-serif" style={{ userSelect: 'none' }}>
          {label}
        </text>
      )}
    </g>
  );
}

// ═══════════════════════════════════════════════
// Unit circle → Ellipse transform visualization
// ═══════════════════════════════════════════════
function TransformedCircle({ matrix }: { matrix: Mat2 }) {
  const points: string[] = [];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const v = { x: Math.cos(theta), y: Math.sin(theta) };
    const t = matMul(matrix, v);
    const [sx, sy] = toSvg(t.x, t.y);
    points.push(`${sx},${sy}`);
  }
  return (
    <polyline
      points={points.join(' ')}
      fill="rgba(99, 102, 241, 0.06)"
      stroke="var(--accent)"
      strokeWidth={2}
      opacity={0.6}
    />
  );
}

function UnitCircle() {
  const [cx, cy] = toSvg(0, 0);
  return (
    <circle cx={cx} cy={cy} r={SCALE}
      fill="none" stroke="var(--viz-dashed)" strokeWidth={1} strokeDasharray="4,3" />
  );
}

// ═══════════════════════════════════════════════
// Determinant area visualization
// ═══════════════════════════════════════════════
function DetArea({ matrix }: { matrix: Mat2 }) {
  const origin: Vec2 = { x: 0, y: 0 };
  const e1 = matMul(matrix, { x: 1, y: 0 });
  const e2 = matMul(matrix, { x: 0, y: 1 });
  const corner = { x: e1.x + e2.x, y: e1.y + e2.y };
  const [ox, oy] = toSvg(origin.x, origin.y);
  const [e1x, e1y] = toSvg(e1.x, e1.y);
  const [e2x, e2y] = toSvg(e2.x, e2.y);
  const [cx, cy] = toSvg(corner.x, corner.y);
  const d = det(matrix);
  const color = d >= 0 ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)';
  const strokeColor = d >= 0 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)';

  return (
    <g>
      <path
        d={`M ${ox} ${oy} L ${e1x} ${e1y} L ${cx} ${cy} L ${e2x} ${e2y} Z`}
        fill={color} stroke={strokeColor} strokeWidth={1.5}
      />
      <text
        x={(ox + cx) / 2} y={(oy + cy) / 2 + 4}
        textAnchor="middle" fontSize="12" fontWeight="700"
        fill={d >= 0 ? '#34d399' : '#f87171'}
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
      >
        det = {d.toFixed(2)}
      </text>
    </g>
  );
}

// ═══════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════
export function MatrixTransform(props: MatrixTransformProps) {
  const {
    mode = 'identity',
    matrix: initialMatrix,
    showGrid = true,
    showTransformedGrid = true,
    showBasisVectors = true,
    showTransformedBasis = true,
    showDeterminant = false,
    showEigenvectors = false,
    showUnitCircle = false,
    showTransformedCircle = false,
    interactive = false,
    secondMatrix,
    showComposition = false,
    showInverse = false,
  } = props;

  // ── Preset matrices by mode ──
  function defaultMatrix(): Mat2 {
    switch (mode) {
      case 'identity': return { a: 1, b: 0, c: 0, d: 1 };
      case 'scale': return { a: 2, b: 0, c: 0, d: 1.5 };
      case 'rotation': {
        const t = Math.PI / 4;
        return { a: Math.cos(t), b: -Math.sin(t), c: Math.sin(t), d: Math.cos(t) };
      }
      case 'shear': return { a: 1, b: 1, c: 0, d: 1 };
      case 'reflection': return { a: 1, b: 0, c: 0, d: -1 };
      case 'determinant': return { a: 2, b: 1, c: 0.5, d: 1.5 };
      case 'eigenvectors': return { a: 2, b: 1, c: 0, d: 3 };
      case 'compose': return { a: 1, b: 0, c: 0, d: 1 };
      case 'inverse': return { a: 2, b: 1, c: 1, d: 1 };
      case 'custom': return { a: 1, b: 0, c: 0, d: 1 };
      default: return { a: 1, b: 0, c: 0, d: 1 };
    }
  }

  const [mat, setMat] = useState<Mat2>(initialMatrix ?? defaultMatrix());
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Reset when mode changes
  useEffect(() => {
    setMat(initialMatrix ?? defaultMatrix());
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Basis vectors (columns of matrix)
  const e1Original: Vec2 = { x: 1, y: 0 };
  const e2Original: Vec2 = { x: 0, y: 1 };
  const e1Transformed = matMul(mat, e1Original);
  const e2Transformed = matMul(mat, e2Original);

  const origin: Vec2 = { x: 0, y: 0 };
  const d = det(mat);
  const isDraggable = interactive || ['custom', 'interactive', 'eigenvectors', 'determinant'].includes(mode);

  // Matrix entry label helper
  const matLabel = `[${mat.a.toFixed(1)}, ${mat.b.toFixed(1)}; ${mat.c.toFixed(1)}, ${mat.d.toFixed(1)}]`;

  // ── Info panel items ──
  const infoItems = useMemo(() => {
    const items: { label: string; value: string; color?: string }[] = [];

    items.push({ label: 'A', value: matLabel, color: 'var(--accent)' });

    if (showDeterminant || mode === 'determinant') {
      items.push({
        label: 'det(A)',
        value: d.toFixed(3),
        color: d >= 0 ? '#34d399' : '#f87171',
      });
    }

    if (showEigenvectors || mode === 'eigenvectors') {
      const eig = eigenvalues(mat);
      if (!eig.complex) {
        items.push({ label: 'λ₁', value: eig.real[0].toFixed(2), color: '#fbbf24' });
        if (eig.real.length > 1) {
          items.push({ label: 'λ₂', value: eig.real[1].toFixed(2), color: '#fb923c' });
        }
      } else {
        items.push({ label: 'λ', value: `${eig.real[0].toFixed(2)} ± i·...`, color: '#a78bfa' });
      }
    }

    if (mode === 'scale') {
      items.push({ label: 'sx', value: mat.a.toFixed(2), color: '#f87171' });
      items.push({ label: 'sy', value: mat.d.toFixed(2), color: '#60a5fa' });
    }

    if (mode === 'rotation') {
      const theta = Math.atan2(mat.c, mat.a);
      items.push({ label: 'θ', value: `${(theta * 180 / Math.PI).toFixed(1)}°`, color: '#fbbf24' });
    }

    if (mode === 'shear') {
      items.push({ label: 'shear', value: mat.b.toFixed(2), color: '#fb923c' });
    }

    if (showComposition || mode === 'compose') {
      if (secondMatrix) {
        const composed = matCompose(secondMatrix, mat);
        items.push({ label: 'BA', value: `[${composed.a.toFixed(1)}, ${composed.b.toFixed(1)}; ${composed.c.toFixed(1)}, ${composed.d.toFixed(1)}]`, color: '#fb923c' });
      }
    }

    if (showInverse || mode === 'inverse') {
      const inv = matInverse(mat);
      if (inv) {
        items.push({ label: 'A⁻¹', value: `[${inv.a.toFixed(2)}, ${inv.b.toFixed(2)}; ${inv.c.toFixed(2)}, ${inv.d.toFixed(2)}]`, color: '#a78bfa' });
      } else {
        items.push({ label: 'A⁻¹', value: 'singular!', color: '#f87171' });
      }
    }

    return items;
  }, [mat, matLabel, d, mode, showDeterminant, showEigenvectors, showComposition, showInverse, secondMatrix]);

  // ── Drag handlers for basis vector tips ──
  const onDragE1 = useCallback((v: Vec2) => {
    const next = { ...mat, a: v.x, c: v.y };
    setMat(next);
    props.onMatrixChange?.(next);
  }, [mat, props]);

  const onDragE2 = useCallback((v: Vec2) => {
    const next = { ...mat, b: v.x, d: v.y };
    setMat(next);
    props.onMatrixChange?.(next);
  }, [mat, props]);

  // ── Render mode-specific elements ──
  function renderMode() {
    const elements: React.ReactElement[] = [];

    // Transformed grid
    if (showTransformedGrid) {
      elements.push(<TransformedGrid key="tgrid" matrix={mat} />);
    }

    // Unit circle and transformed ellipse
    if (showUnitCircle || mode === 'rotation') {
      elements.push(<UnitCircle key="ucircle" />);
    }
    if (showTransformedCircle || mode === 'rotation' || mode === 'scale') {
      elements.push(<TransformedCircle key="tcircle" matrix={mat} />);
    }

    // Determinant area
    if (showDeterminant || mode === 'determinant') {
      elements.push(<DetArea key="det-area" matrix={mat} />);
    }

    // Original basis vectors (ghosted)
    if (showBasisVectors) {
      elements.push(
        <Arrow key="e1-orig" from={origin} to={e1Original} color="#f87171" width={1.5} dashed opacity={0.3} markerId="mx-arrow-red" />,
        <Arrow key="e2-orig" from={origin} to={e2Original} color="#60a5fa" width={1.5} dashed opacity={0.3} markerId="mx-arrow-blue" />,
      );
    }

    // Transformed basis vectors
    if (showTransformedBasis) {
      elements.push(
        <Arrow key="e1-t" from={origin} to={e1Transformed} color="#f87171" width={3} markerId="mx-arrow-red" />,
        <Arrow key="e2-t" from={origin} to={e2Transformed} color="#60a5fa" width={3} markerId="mx-arrow-blue" />,
      );

      // Labels
      const [e1x, e1y] = toSvg(e1Transformed.x, e1Transformed.y);
      const [e2x, e2y] = toSvg(e2Transformed.x, e2Transformed.y);
      elements.push(
        <text key="e1-label" x={e1x + 10} y={e1y - 10} fontSize="11" fontWeight="700"
          fill="#f87171" fontFamily="monospace" style={{ userSelect: 'none' }}>
          Ae₁ ({e1Transformed.x.toFixed(1)}, {e1Transformed.y.toFixed(1)})
        </text>,
        <text key="e2-label" x={e2x + 10} y={e2y - 10} fontSize="11" fontWeight="700"
          fill="#60a5fa" fontFamily="monospace" style={{ userSelect: 'none' }}>
          Ae₂ ({e2Transformed.x.toFixed(1)}, {e2Transformed.y.toFixed(1)})
        </text>,
      );

      // Drag handles on transformed basis tips
      if (isDraggable) {
        elements.push(
          <DragHandle key="drag-e1" pos={e1Transformed} onDrag={onDragE1}
            color="#f87171" svgRef={svgRef} label="" />,
          <DragHandle key="drag-e2" pos={e2Transformed} onDrag={onDragE2}
            color="#60a5fa" svgRef={svgRef} label="" />,
        );
      }
    }

    // Eigenvectors
    if ((showEigenvectors || mode === 'eigenvectors') && !eigenvalues(mat).complex) {
      const eig = eigenvalues(mat);
      eig.real.forEach((lambda, i) => {
        const ev = eigenvector(mat, lambda);
        const scale = 3;
        const tip = { x: ev.x * scale, y: ev.y * scale };
        const negTip = { x: -ev.x * scale, y: -ev.y * scale };
        const color = i === 0 ? '#fbbf24' : '#fb923c';
        const markerId = i === 0 ? 'mx-arrow-yellow' : 'mx-arrow-orange';

        // Draw eigenvector line through origin
        elements.push(
          <line key={`eigline-${i}`}
            x1={toSvg(negTip.x, negTip.y)[0]} y1={toSvg(negTip.x, negTip.y)[1]}
            x2={toSvg(tip.x, tip.y)[0]} y2={toSvg(tip.x, tip.y)[1]}
            stroke={color} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.4}
          />,
        );
        // Arrow along eigenvector
        elements.push(
          <Arrow key={`eig-${i}`} from={origin} to={tip} color={color} width={2.5} markerId={markerId} />,
        );
        // Transformed eigenvector (should align — λ * eigenvector)
        const transEv = { x: ev.x * lambda * scale / Math.max(Math.abs(lambda), 0.01), y: ev.y * lambda * scale / Math.max(Math.abs(lambda), 0.01) };
        elements.push(
          <Arrow key={`eig-t-${i}`} from={origin} to={transEv} color={color} width={1.5} dashed opacity={0.5} markerId={markerId} />,
        );

        const [lx, ly] = toSvg(tip.x, tip.y);
        elements.push(
          <text key={`eiglabel-${i}`} x={lx + 10} y={ly - 8} fontSize="10" fontWeight="700"
            fill={color} fontFamily="monospace" style={{ userSelect: 'none' }}>
            λ{i + 1}={lambda.toFixed(2)}
          </text>,
        );
      });
    }

    // Composition
    if ((showComposition || mode === 'compose') && secondMatrix) {
      const composed = matCompose(secondMatrix, mat);
      const compE1 = matMul(composed, e1Original);
      const compE2 = matMul(composed, e2Original);
      elements.push(
        <Arrow key="comp-e1" from={origin} to={compE1} color="#fb923c" width={2.5} markerId="mx-arrow-orange" />,
        <Arrow key="comp-e2" from={origin} to={compE2} color="#a78bfa" width={2.5} markerId="mx-arrow-purple" />,
      );
    }

    // Inverse — show A⁻¹ basis too
    if (showInverse || mode === 'inverse') {
      const inv = matInverse(mat);
      if (inv) {
        const invE1 = matMul(inv, e1Original);
        const invE2 = matMul(inv, e2Original);
        elements.push(
          <Arrow key="inv-e1" from={origin} to={invE1} color="#a78bfa" width={2} dashed markerId="mx-arrow-purple" />,
          <Arrow key="inv-e2" from={origin} to={invE2} color="#a78bfa" width={2} dashed markerId="mx-arrow-purple" />,
        );
        const [ie1x, ie1y] = toSvg(invE1.x, invE1.y);
        const [ie2x, ie2y] = toSvg(invE2.x, invE2.y);
        elements.push(
          <text key="inv-e1-l" x={ie1x + 10} y={ie1y + 14} fontSize="10" fontWeight="600"
            fill="#a78bfa" fontFamily="monospace" style={{ userSelect: 'none' }}>
            A⁻¹e₁
          </text>,
          <text key="inv-e2-l" x={ie2x + 10} y={ie2y + 14} fontSize="10" fontWeight="600"
            fill="#a78bfa" fontFamily="monospace" style={{ userSelect: 'none' }}>
            A⁻¹e₂
          </text>,
        );
      }
    }

    // AI applications — decorative
    if (mode === 'ai-applications') {
      // Show a mini "image" as a grid of colored dots, then show transformed
      const pixels = [
        { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
      ];
      const colors = ['#6366f1', '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#f87171', '#a78bfa', '#e879f9', '#f472b6'];
      pixels.forEach((p, i) => {
        const [sx, sy] = toSvg(p.x - 2, p.y - 2);
        const tp = matMul(mat, { x: p.x - 2, y: p.y - 2 });
        const [tsx, tsy] = toSvg(tp.x, tp.y);
        elements.push(
          <circle key={`px-o-${i}`} cx={sx} cy={sy} r={6} fill={colors[i]} opacity={0.3} />,
          <circle key={`px-t-${i}`} cx={tsx} cy={tsy} r={6} fill={colors[i]} opacity={0.8} />,
          <line key={`px-l-${i}`} x1={sx} y1={sy} x2={tsx} y2={tsy}
            stroke={colors[i]} strokeWidth={0.5} opacity={0.2} />,
        );
      });
    }

    return elements;
  }

  // ── Render ──
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--viz-bg-gradient)', borderRadius: 'var(--radius-md)' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03), transparent 70%)',
          borderRadius: 'var(--radius-md)',
          touchAction: 'none',
        }}
      >
        <MemoDefs />
        {showGrid && <MemoOriginalGrid />}
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

      {/* Matrix display — bottom center */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'var(--viz-panel-bg)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid var(--viz-panel-border)',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        <span style={{ color: 'var(--viz-label)' }}>A =</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#f87171', fontWeight: 600, minWidth: '36px', textAlign: 'right' }}>{mat.a.toFixed(2)}</span>
            <span style={{ color: '#60a5fa', fontWeight: 600, minWidth: '36px', textAlign: 'right' }}>{mat.b.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#f87171', fontWeight: 600, minWidth: '36px', textAlign: 'right' }}>{mat.c.toFixed(2)}</span>
            <span style={{ color: '#60a5fa', fontWeight: 600, minWidth: '36px', textAlign: 'right' }}>{mat.d.toFixed(2)}</span>
          </div>
        </div>
        {/* Bracket decoration */}
        <span style={{ color: 'var(--viz-axis-label)', fontSize: '20px', fontWeight: 100, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}></span>
      </div>
    </div>
  );
}
