'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   EigenTransform — Showcase Eigenvalue/Eigenvector Visualization
   ═══════════════════════════════════════════════════════════════════ */

// ── Types ──
type Vec2 = { x: number; y: number };
type Mat2 = { a: number; b: number; c: number; d: number };

export interface EigenTransformProps {
  mode?: 'explore' | 'animate' | 'preset' | 'eigenvectors-only' | 'dot-cloud' |
         'characteristic' | 'power-iteration' | 'decomposition' | 'symmetric' | 'pca';
  matrix?: Mat2;
  showDotCloud?: boolean;
  showEigenspaceLines?: boolean;
  showScalingIndicators?: boolean;
  showCharacteristicEq?: boolean;
  showDeterminantArea?: boolean;
  showUnitCircle?: boolean;
  showAnimation?: boolean;
  showMatrixControls?: boolean;
  showPresets?: boolean;
  showPowerIteration?: boolean;
  showTraceDetRelation?: boolean;
  showDecomposition?: boolean;
  showTransformedGrid?: boolean;
  showBasisVectors?: boolean;
  interactive?: boolean;
  animationSpeed?: number;
  highlightEigenDots?: boolean;
  symmetricOnly?: boolean;
  onMatrixChange?: (m: Mat2) => void;
}

// ── Math Helpers ──
function matMul(m: Mat2, v: Vec2): Vec2 {
  return { x: m.a * v.x + m.b * v.y, y: m.c * v.x + m.d * v.y };
}
function det(m: Mat2): number { return m.a * m.d - m.b * m.c; }
function trace(m: Mat2): number { return m.a + m.d; }
function mag(v: Vec2): number { return Math.sqrt(v.x * v.x + v.y * v.y); }
function normalize(v: Vec2): Vec2 {
  const l = mag(v);
  return l > 1e-10 ? { x: v.x / l, y: v.y / l } : { x: 1, y: 0 };
}

function eigenvalues(m: Mat2): { real: number[]; complex: boolean; imagPart?: number } {
  const tr = trace(m);
  const d = det(m);
  const disc = tr * tr - 4 * d;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    return { real: [(tr + s) / 2, (tr - s) / 2], complex: false };
  }
  return { real: [tr / 2], complex: true, imagPart: Math.sqrt(-disc) / 2 };
}

function eigenvector(m: Mat2, lambda: number): Vec2 {
  const a = m.a - lambda;
  const b = m.b;
  if (Math.abs(b) > 1e-10) {
    return normalize({ x: -b, y: a });
  }
  const c = m.c;
  if (Math.abs(c) > 1e-10) {
    return normalize({ x: m.d - lambda, y: -c });
  }
  // Diagonal-ish matrix
  if (Math.abs(a) < 1e-10) return { x: 1, y: 0 };
  return { x: 0, y: 1 };
}

// ── Constants ──
const CANVAS_SIZE = 500;
const GRID_RANGE = 6;
const SCALE = CANVAS_SIZE / (GRID_RANGE * 2);
const CENTER = CANVAS_SIZE / 2;

function toSvg(x: number, y: number): [number, number] {
  return [CENTER + x * SCALE, CENTER - y * SCALE];
}

// ── Memoized SVG Defs ──
const MemoDefs = memo(function EigenDefs() {
  return (
    <defs>
      <marker id="eig-arrow-gold" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
      </marker>
      <marker id="eig-arrow-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#fb923c" />
      </marker>
      <marker id="eig-arrow-accent" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
      </marker>
      <marker id="eig-arrow-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
      </marker>
      <marker id="eig-arrow-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
      </marker>
      <marker id="eig-arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#34d399" />
      </marker>
      <filter id="eig-glow-gold" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feFlood floodColor="#fbbf24" floodOpacity="0.6" />
        <feComposite in2="blur" operator="in" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="eig-glow-orange" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feFlood floodColor="#fb923c" floodOpacity="0.6" />
        <feComposite in2="blur" operator="in" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="eig-glow-green" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood floodColor="#34d399" floodOpacity="0.5" />
        <feComposite in2="blur" operator="in" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
});

// ── Dynamic Grid ──
const DynGrid = memo(function DynGrid({ vb }: { vb: { x: number; y: number; w: number; h: number } }) {
  const lines: React.ReactElement[] = [];
  const pxPerUnit = CANVAS_SIZE / (GRID_RANGE * 2);
  const unitSpan = vb.w / pxPerUnit;
  let step = 1;
  if (unitSpan > 30) step = 5;
  else if (unitSpan > 15) step = 2;

  const left = Math.floor(((vb.x - CENTER) / SCALE) / step) * step;
  const right = Math.ceil(((vb.x + vb.w - CENTER) / SCALE) / step) * step;
  const top = Math.floor(((CENTER - vb.y - vb.h) / SCALE) / step) * step;
  const bottom = Math.ceil(((CENTER - vb.y) / SCALE) / step) * step;

  for (let x = left; x <= right; x += step) {
    const sx = CENTER + x * SCALE;
    const isAxis = x === 0;
    lines.push(
      <line key={`gv${x}`} x1={sx} y1={vb.y} x2={sx} y2={vb.y + vb.h}
        stroke={isAxis ? 'var(--viz-axis)' : 'var(--viz-grid-major)'}
        strokeWidth={isAxis ? 1.5 : 0.5} opacity={isAxis ? 0.7 : 0.3} />,
    );
  }
  for (let y = top; y <= bottom; y += step) {
    const sy = CENTER - y * SCALE;
    const isAxis = y === 0;
    lines.push(
      <line key={`gh${y}`} x1={vb.x} y1={sy} x2={vb.x + vb.w} y2={sy}
        stroke={isAxis ? 'var(--viz-axis)' : 'var(--viz-grid-major)'}
        strokeWidth={isAxis ? 1.5 : 0.5} opacity={isAxis ? 0.7 : 0.3} />,
    );
  }
  return <g>{lines}</g>;
});

// ── Transformed Grid (warped grid lines) ──
const TransformedGrid = memo(function TransformedGrid({ matrix, vb }: { matrix: Mat2; vb: { x: number; y: number; w: number; h: number } }) {
  const lines: React.ReactElement[] = [];
  const range = 8;
  const steps = 40; // polyline resolution

  // Vertical grid lines (x = const)
  for (let x = -range; x <= range; x++) {
    const pts: string[] = [];
    for (let s = 0; s <= steps; s++) {
      const y = -range + (2 * range * s) / steps;
      const tp = { x: matrix.a * x + matrix.b * y, y: matrix.c * x + matrix.d * y };
      const [sx, sy] = [CENTER + tp.x * SCALE, CENTER - tp.y * SCALE];
      pts.push(`${sx},${sy}`);
    }
    const isAxis = x === 0;
    lines.push(
      <polyline key={`tgv-${x}`} points={pts.join(' ')} fill="none"
        stroke={isAxis ? 'var(--accent)' : 'var(--accent)'}
        strokeWidth={isAxis ? 1.2 : 0.6}
        opacity={isAxis ? 0.5 : 0.18} />,
    );
  }

  // Horizontal grid lines (y = const)
  for (let y = -range; y <= range; y++) {
    const pts: string[] = [];
    for (let s = 0; s <= steps; s++) {
      const x = -range + (2 * range * s) / steps;
      const tp = { x: matrix.a * x + matrix.b * y, y: matrix.c * x + matrix.d * y };
      const [sx, sy] = [CENTER + tp.x * SCALE, CENTER - tp.y * SCALE];
      pts.push(`${sx},${sy}`);
    }
    const isAxis = y === 0;
    lines.push(
      <polyline key={`tgh-${y}`} points={pts.join(' ')} fill="none"
        stroke={isAxis ? 'var(--accent)' : 'var(--accent)'}
        strokeWidth={isAxis ? 1.2 : 0.6}
        opacity={isAxis ? 0.5 : 0.18} />,
    );
  }

  return <g>{lines}</g>;
});

// ── Arrow component ──
function Arrow({ from, to, color, width = 2.5, dashed = false, opacity = 1, markerId }: {
  from: Vec2; to: Vec2; color: string; width?: number; dashed?: boolean; opacity?: number; markerId?: string;
}) {
  const [x1, y1] = toSvg(from.x, from.y);
  const [x2, y2] = toSvg(to.x, to.y);
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  if (len < 1) return null;
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={width} opacity={opacity}
      strokeDasharray={dashed ? '6,4' : undefined}
      markerEnd={markerId ? `url(#${markerId})` : undefined}
      strokeLinecap="round" />
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export function EigenTransform(props: EigenTransformProps) {
  const {
    mode = 'explore',
    matrix: initialMatrix,
    showDotCloud = false,
    showEigenspaceLines = false,
    showScalingIndicators = false,
    showCharacteristicEq = false,
    showDeterminantArea = false,
    showUnitCircle = false,
    showAnimation = false,
    showMatrixControls = false,
    showPresets = false,
    showPowerIteration = false,
    showTraceDetRelation = false,
    showDecomposition = false,
    showTransformedGrid = false,
    showBasisVectors = false,
    interactive = false,
    highlightEigenDots = false,
    symmetricOnly = false,
  } = props;

  // ── State ──
  const defaultMat = (): Mat2 => {
    switch (mode) {
      case 'symmetric': return { a: 3, b: 1, c: 1, d: 2 };
      case 'pca': return { a: 3, b: 1.5, c: 1.5, d: 2 };
      case 'power-iteration': return { a: 3, b: 1, c: 0, d: 1.5 };
      case 'decomposition': return { a: 2, b: 1, c: 0, d: 3 };
      case 'characteristic': return { a: 2, b: 1, c: 1, d: 3 };
      default: return { a: 2, b: 1, c: 0, d: 3 };
    }
  };

  const [mat, setMat] = useState<Mat2>(initialMatrix ?? defaultMat());
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Animation state
  const [animT, setAnimT] = useState(0); // 0 = identity, 1 = fully transformed
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number>(0);

  // Power iteration state
  const [powerVec, setPowerVec] = useState<Vec2>({ x: 0.7, y: 0.7 });
  const [powerTrail, setPowerTrail] = useState<Vec2[]>([{ x: 0.7, y: 0.7 }]);
  const [powerIter, setPowerIter] = useState(0);

  // Decomposition stage: 0 = original, 1 = P⁻¹ applied, 2 = D applied, 3 = P applied (= full transform)
  const [decompStage, setDecompStage] = useState(0);

  // ── ViewBox ──
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: CANVAS_SIZE, h: CANVAS_SIZE });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, vbx: 0, vby: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const fx = (e.clientX - rect.left) / rect.width;
      const fy = (e.clientY - rect.top) / rect.height;
      setViewBox(prev => {
        const zf = e.deltaY > 0 ? 1.08 : 0.93;
        const nw = Math.max(100, Math.min(prev.w * zf, 10000));
        const nh = Math.max(100, Math.min(prev.h * zf, 10000));
        return { x: prev.x + (prev.w - nw) * fx, y: prev.y + (prev.h - nh) * fy, w: nw, h: nh };
      });
    };
    svg.addEventListener('wheel', handler, { passive: false });
    return () => svg.removeEventListener('wheel', handler);
  }, []);

  const resetView = useCallback(() => {
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const aspect = rect.width / rect.height;
      const h = CANVAS_SIZE;
      const w = CANVAS_SIZE * aspect;
      setViewBox({ x: (CANVAS_SIZE - w) / 2, y: 0, w, h });
    } else {
      setViewBox({ x: 0, y: 0, w: CANVAS_SIZE, h: CANVAS_SIZE });
    }
  }, []);

  useEffect(() => { resetView(); }, [resetView]);

  // Reset on mode change
  useEffect(() => {
    setMat(initialMatrix ?? defaultMat());
    setAnimT(0);
    setIsAnimating(false);
    setPowerVec({ x: 0.7, y: 0.7 });
    setPowerTrail([{ x: 0.7, y: 0.7 }]);
    setPowerIter(0);
    setDecompStage(0);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pan handlers
  const handleBgPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    if (target.tagName === 'circle' || target.closest('[data-drag-handle]')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, vbx: viewBox.x, vby: viewBox.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [viewBox.x, viewBox.y]);

  const handleBgPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPanning.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - panStart.current.x) * scaleX;
    const dy = (e.clientY - panStart.current.y) * scaleY;
    setViewBox(prev => ({ ...prev, x: panStart.current.vbx - dx, y: panStart.current.vby - dy }));
  }, [viewBox.w, viewBox.h]);

  const handleBgPointerUp = useCallback(() => { isPanning.current = false; }, []);

  // ── Matrix update helper ──
  const updateMat = useCallback((next: Mat2) => {
    if (symmetricOnly) {
      // Force symmetric: average off-diagonals
      const avg = (next.b + next.c) / 2;
      next = { ...next, b: avg, c: avg };
    }
    setMat(next);
    props.onMatrixChange?.(next);
  }, [symmetricOnly, props]);

  // ── Computed values ──
  const eig = useMemo(() => eigenvalues(mat), [mat]);
  const eigVecs = useMemo(() => {
    if (eig.complex) return [];
    return eig.real.map(lambda => ({
      lambda,
      vec: eigenvector(mat, lambda),
    }));
  }, [mat, eig]);

  const d = det(mat);
  const tr = trace(mat);

  // ── Animation ──
  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    setAnimT(0);
    setIsAnimating(true);
    const start = performance.now();
    const duration = 2000;
    const tick = (now: number) => {
      const elapsed = now - start;
      const raw = Math.min(elapsed / duration, 1);
      // Cubic ease-in-out
      const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      setAnimT(t);
      if (raw < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [isAnimating]);

  const resetAnimation = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    setAnimT(0);
    setIsAnimating(false);
  }, []);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  // ── Power Iteration ──
  const doPowerStep = useCallback(() => {
    const next = matMul(mat, powerVec);
    const normed = normalize(next);
    setPowerVec(normed);
    setPowerTrail(prev => [...prev, normed]);
    setPowerIter(prev => prev + 1);
  }, [mat, powerVec]);

  const resetPower = useCallback(() => {
    const rv = normalize({ x: Math.random() - 0.5, y: Math.random() - 0.5 });
    setPowerVec(rv);
    setPowerTrail([rv]);
    setPowerIter(0);
  }, []);

  // ── Decomposition Step ──
  const nextDecompStage = useCallback(() => {
    setDecompStage(prev => (prev + 1) % 4);
  }, []);

  // ── Generate dot cloud positions ──
  const dotCloudRange = 5;
  const dots = useMemo(() => {
    const pts: { orig: Vec2; hue: number }[] = [];
    for (let ix = -dotCloudRange; ix <= dotCloudRange; ix++) {
      for (let iy = -dotCloudRange; iy <= dotCloudRange; iy++) {
        if (ix === 0 && iy === 0) continue;
        const angle = Math.atan2(iy, ix);
        const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
        pts.push({ orig: { x: ix, y: iy }, hue });
      }
    }
    return pts;
  }, []);

  // ── PCA data points ──
  const pcaPoints = useMemo(() => {
    const pts: Vec2[] = [];
    // Deterministic "random" scatter
    for (let i = 0; i < 60; i++) {
      const t = i * 2.399; // golden angle
      const r1 = Math.sin(t * 7.13) * 2;
      const r2 = Math.cos(t * 3.97) * 1.2;
      pts.push({ x: r1, y: r2 });
    }
    // Apply a rotation + scaling to make them elliptical
    return pts.map(p => ({
      x: p.x * 1.5 + p.y * 0.8,
      y: p.x * 0.3 + p.y * 1.2,
    }));
  }, []);

  // ── Info panel ──
  const infoItems = useMemo(() => {
    const items: { label: string; value: string; color?: string }[] = [];

    items.push({
      label: 'A',
      value: `[${mat.a.toFixed(1)}, ${mat.b.toFixed(1)}; ${mat.c.toFixed(1)}, ${mat.d.toFixed(1)}]`,
      color: 'var(--accent)',
    });

    if (!eig.complex) {
      items.push({ label: 'λ₁', value: eig.real[0].toFixed(3), color: '#fbbf24' });
      if (eig.real.length > 1) {
        items.push({ label: 'λ₂', value: eig.real[1].toFixed(3), color: '#fb923c' });
      }
    } else {
      const re = eig.real[0];
      const im = eig.imagPart ?? 0;
      items.push({ label: 'λ', value: `${re.toFixed(2)} ± ${im.toFixed(2)}i`, color: '#a78bfa' });
    }

    if (showTraceDetRelation || mode === 'characteristic') {
      items.push({ label: 'tr(A)', value: tr.toFixed(3), color: '#34d399' });
      items.push({ label: 'det(A)', value: d.toFixed(3), color: d >= 0 ? '#34d399' : '#f87171' });
    }

    if (showDeterminantArea) {
      items.push({ label: '|det|', value: Math.abs(d).toFixed(3), color: d >= 0 ? '#34d399' : '#f87171' });
    }

    return items;
  }, [mat, eig, d, tr, showTraceDetRelation, showDeterminantArea, mode]);

  // ── Check if point is on eigenspace ──
  const isOnEigenspace = useCallback((p: Vec2): boolean => {
    if (eig.complex) return false;
    for (const { vec } of eigVecs) {
      // Cross product = |sin(angle)| * |p| * |v|.  For integer grid points
      // to truly lie on the eigenvector line, the ratio cross/mag must be ≈ 0.
      const cross = Math.abs(p.x * vec.y - p.y * vec.x);
      const m = mag(p);
      if (m > 0.1 && cross / m < 0.02) return true;
    }
    return false;
  }, [eig.complex, eigVecs]);

  // ── Interpolate matrix (for animation) ──
  const interpMat = (t: number): Mat2 => ({
    a: 1 + (mat.a - 1) * t,
    b: mat.b * t,
    c: mat.c * t,
    d: 1 + (mat.d - 1) * t,
  });

  // ── Decomposition matrices ──
  const decompMats = useMemo(() => {
    if (eig.complex || eigVecs.length < 2) return null;
    const v1 = eigVecs[0].vec;
    const v2 = eigVecs[1].vec;
    const P: Mat2 = { a: v1.x, b: v2.x, c: v1.y, d: v2.y };
    const detP = det(P);
    if (Math.abs(detP) < 1e-10) return null;
    const Pinv: Mat2 = { a: P.d / detP, b: -P.b / detP, c: -P.c / detP, d: P.a / detP };
    const D: Mat2 = { a: eigVecs[0].lambda, b: 0, c: 0, d: eigVecs[1].lambda };
    return { P, Pinv, D };
  }, [eig.complex, eigVecs]);

  // ── Render ──
  function renderContent() {
    const elements: React.ReactElement[] = [];
    const origin: Vec2 = { x: 0, y: 0 };

    const useT = (showAnimation || mode === 'animate' || mode === 'decomposition') ? animT : 1;
    const currentMat = (showAnimation || mode === 'animate') ? interpMat(useT) : mat;

    // ── Transformed Grid ──
    if (showTransformedGrid) {
      elements.push(<TransformedGrid key="tgrid" matrix={currentMat} vb={viewBox} />);
    }

    // ── Basis Vectors ──
    if (showBasisVectors) {
      // Original basis (ghosted)
      elements.push(
        <Arrow key="orig-e1" from={origin} to={{ x: 1, y: 0 }} color="#f87171" width={1.5} dashed opacity={0.25} markerId="eig-arrow-red" />,
        <Arrow key="orig-e2" from={origin} to={{ x: 0, y: 1 }} color="#60a5fa" width={1.5} dashed opacity={0.25} markerId="eig-arrow-blue" />,
      );
      // Transformed basis
      const te1 = matMul(currentMat, { x: 1, y: 0 });
      const te2 = matMul(currentMat, { x: 0, y: 1 });
      elements.push(
        <Arrow key="trans-e1" from={origin} to={te1} color="#f87171" width={2.5} markerId="eig-arrow-red" />,
        <Arrow key="trans-e2" from={origin} to={te2} color="#60a5fa" width={2.5} markerId="eig-arrow-blue" />,
      );
      // Labels
      const [e1x, e1y] = toSvg(te1.x, te1.y);
      const [e2x, e2y] = toSvg(te2.x, te2.y);
      elements.push(
        <text key="e1-label" x={e1x + 8} y={e1y - 8} fontSize="10" fontWeight="700"
          fill="#f87171" fontFamily="monospace" style={{ userSelect: 'none' }}>
          Ae₁
        </text>,
        <text key="e2-label" x={e2x + 8} y={e2y - 8} fontSize="10" fontWeight="700"
          fill="#60a5fa" fontFamily="monospace" style={{ userSelect: 'none' }}>
          Ae₂
        </text>,
      );
    }

    // ── Dot Cloud ──
    if (showDotCloud || mode === 'dot-cloud' || mode === 'animate' || mode === 'pca') {
      const pointsToRender = mode === 'pca' ? pcaPoints.map((p, i) => ({
        orig: p,
        hue: (i / pcaPoints.length) * 360,
      })) : dots;

      pointsToRender.forEach((dot, i) => {
        const transformed = matMul(currentMat, dot.orig);
        const pos = mode === 'animate' || showAnimation
          ? transformed // animation handles interpolation via interpMat
          : matMul(mat, dot.orig);
        const [sx, sy] = toSvg(pos.x, pos.y);

        const onEigen = highlightEigenDots && isOnEigenspace(dot.orig);
        const radius = onEigen ? 5 : 3;
        const filter = onEigen ? 'url(#eig-glow-gold)' : undefined;

        elements.push(
          <circle key={`dot-${i}`}
            cx={sx} cy={sy} r={radius}
            fill={`hsl(${dot.hue}, 70%, 60%)`}
            opacity={0.85}
            filter={filter}
          >
            {onEigen && (
              <animate attributeName="r" values={`${radius};${radius + 2};${radius}`}
                dur="1.5s" repeatCount="indefinite" />
            )}
          </circle>,
        );

        // Ghost original position during animation
        if ((showAnimation || mode === 'animate') && useT > 0.01 && useT < 0.99) {
          const [ox, oy] = toSvg(dot.orig.x, dot.orig.y);
          elements.push(
            <circle key={`dot-ghost-${i}`}
              cx={ox} cy={oy} r={2}
              fill={`hsl(${dot.hue}, 40%, 50%)`}
              opacity={0.15}
            />,
          );
        }
      });
    }

    // ── Unit Circle ──
    if (showUnitCircle || mode === 'symmetric') {
      const [cx, cy] = toSvg(0, 0);
      const r = SCALE;
      elements.push(
        <circle key="unit-circle" cx={cx} cy={cy} r={r}
          fill="none" stroke="var(--viz-grid-major)" strokeWidth={1}
          strokeDasharray="4,3" opacity={0.4} />,
      );

      // Transformed ellipse
      const pts: string[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        const p = { x: Math.cos(theta), y: Math.sin(theta) };
        const tp = matMul(currentMat, p);
        const [px, py] = toSvg(tp.x, tp.y);
        pts.push(`${px},${py}`);
      }
      elements.push(
        <polyline key="transformed-circle" points={pts.join(' ')}
          fill="rgba(99, 102, 241, 0.06)" stroke="var(--accent)" strokeWidth={1.5}
          opacity={0.6} />,
      );
    }

    // ── Determinant Area ──
    if (showDeterminantArea) {
      const e1 = matMul(currentMat, { x: 1, y: 0 });
      const e2 = matMul(currentMat, { x: 0, y: 1 });
      const [ox, oy] = toSvg(0, 0);
      const [ax, ay] = toSvg(e1.x, e1.y);
      const [bx, by] = toSvg(e2.x, e2.y);
      const [cx, cy] = toSvg(e1.x + e2.x, e1.y + e2.y);
      const fillColor = d >= 0 ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)';
      const strokeColor = d >= 0 ? '#34d399' : '#f87171';
      elements.push(
        <path key="det-area"
          d={`M ${ox} ${oy} L ${ax} ${ay} L ${cx} ${cy} L ${bx} ${by} Z`}
          fill={fillColor} stroke={strokeColor} strokeWidth={1.5} opacity={0.8} />,
      );
    }

    // ── Eigenspace Lines (glowing) ──
    if ((showEigenspaceLines || mode === 'eigenvectors-only' || mode === 'explore' ||
         mode === 'animate' || mode === 'symmetric' || mode === 'decomposition' ||
         mode === 'dot-cloud') && !eig.complex) {
      const fadeIn = (mode === 'animate' || showAnimation) ? Math.max(0, (useT - 0.3) / 0.7) : 1;

      eigVecs.forEach(({ vec, lambda }, i) => {
        const ext = 8;
        const tip = { x: vec.x * ext, y: vec.y * ext };
        const neg = { x: -vec.x * ext, y: -vec.y * ext };
        const [x1, y1] = toSvg(neg.x, neg.y);
        const [x2, y2] = toSvg(tip.x, tip.y);
        const color = i === 0 ? '#fbbf24' : '#fb923c';
        const filterId = i === 0 ? 'eig-glow-gold' : 'eig-glow-orange';

        // Glowing line
        elements.push(
          <line key={`eigline-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth={2} strokeDasharray="8,5"
            opacity={0.5 * fadeIn}
            filter={`url(#${filterId})`}
          />,
        );

        // Eigenvector arrow
        const arrowTip = { x: vec.x * 3, y: vec.y * 3 };
        elements.push(
          <Arrow key={`eig-arrow-${i}`} from={origin} to={arrowTip}
            color={color} width={2.5}
            markerId={i === 0 ? 'eig-arrow-gold' : 'eig-arrow-orange'}
            opacity={fadeIn} />,
        );

        // Scaling indicator: show where eigenvector lands after transform
        if (showScalingIndicators || mode === 'eigenvectors-only') {
          const scaledTip = { x: vec.x * lambda * 3, y: vec.y * lambda * 3 };
          elements.push(
            <Arrow key={`eig-scaled-${i}`} from={origin} to={scaledTip}
              color={color} width={1.5} dashed opacity={0.5 * fadeIn}
              markerId={i === 0 ? 'eig-arrow-gold' : 'eig-arrow-orange'} />,
          );
          // λ label
          const [lx, ly] = toSvg(arrowTip.x, arrowTip.y);
          elements.push(
            <text key={`eiglabel-${i}`} x={lx + 12} y={ly - 10}
              fontSize="11" fontWeight="700" fill={color}
              fontFamily="monospace" style={{ userSelect: 'none' }}
              opacity={fadeIn}>
              λ{i + 1} = {lambda.toFixed(2)}
            </text>,
          );
        }
      });
    }

    // ── Complex eigenvalues spiral indicator ──
    if (eig.complex && (showEigenspaceLines || mode === 'animate')) {
      const [cx, cy] = toSvg(0, 0);
      elements.push(
        <g key="complex-spiral">
          <circle cx={cx} cy={cy} r={SCALE * 1.5}
            fill="none" stroke="#a78bfa" strokeWidth={1.5}
            strokeDasharray="6,4" opacity={0.4}>
            <animateTransform attributeName="transform"
              type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`}
              dur="4s" repeatCount="indefinite" />
          </circle>
          <text x={cx + SCALE * 1.7} y={cy - 8}
            fontSize="10" fontWeight="600" fill="#a78bfa"
            fontFamily="monospace" style={{ userSelect: 'none' }}>
            complex λ → rotation
          </text>
        </g>,
      );
    }

    // ── Power Iteration Trail ──
    if (showPowerIteration || mode === 'power-iteration') {
      const trailLen = powerTrail.length;
      powerTrail.forEach((v, i) => {
        const tip = { x: v.x * 3, y: v.y * 3 };
        const [sx, sy] = toSvg(tip.x, tip.y);
        const progress = trailLen > 1 ? i / (trailLen - 1) : 1;
        const color = `hsl(${40 + progress * 5}, ${50 + progress * 30}%, ${40 + progress * 20}%)`;
        const r = 3 + progress * 4;

        elements.push(
          <circle key={`ptrail-${i}`} cx={sx} cy={sy} r={r}
            fill={color} opacity={0.3 + progress * 0.7}
            filter={i === trailLen - 1 ? 'url(#eig-glow-gold)' : undefined} />,
        );
        // Arrow for current vector
        if (i === trailLen - 1) {
          elements.push(
            <Arrow key="pcurrent" from={origin} to={tip}
              color="#fbbf24" width={3} markerId="eig-arrow-gold" />,
          );
        }
      });

      // Show dominant eigenvector for reference
      if (!eig.complex && eigVecs.length > 0) {
        const dom = eigVecs[0]; // largest |λ|
        const tipRef = { x: dom.vec.x * 3, y: dom.vec.y * 3 };
        elements.push(
          <Arrow key="dominant-ref" from={origin} to={tipRef}
            color="#34d399" width={1.5} dashed opacity={0.4}
            markerId="eig-arrow-green" />,
        );
        const [rx, ry] = toSvg(tipRef.x, tipRef.y);
        elements.push(
          <text key="dominant-label" x={rx + 10} y={ry + 14}
            fontSize="9" fontWeight="600" fill="#34d399"
            fontFamily="monospace" style={{ userSelect: 'none' }} opacity={0.6}>
            dominant eigenvector
          </text>,
        );
      }
    }

    // ── Decomposition Visualization ──
    if (showDecomposition || mode === 'decomposition') {
      if (decompMats && !eig.complex) {
        // Show which stage we're at with colored basis arrows
        const stageColors = ['#60a5fa', '#a78bfa', '#fbbf24', '#34d399'];
        const stageLabels = ['Original', 'P⁻¹ (align to eigenbasis)', 'D (scale)', 'P (rotate back)'];

        // Calculate stage matrix
        let stageMat: Mat2 = { a: 1, b: 0, c: 0, d: 1 };
        if (decompStage >= 1) {
          stageMat = decompMats.Pinv;
        }
        if (decompStage >= 2) {
          const prev = stageMat;
          stageMat = {
            a: decompMats.D.a * prev.a + decompMats.D.b * prev.c,
            b: decompMats.D.a * prev.b + decompMats.D.b * prev.d,
            c: decompMats.D.c * prev.a + decompMats.D.d * prev.c,
            d: decompMats.D.c * prev.b + decompMats.D.d * prev.d,
          };
        }
        if (decompStage >= 3) {
          const prev = stageMat;
          stageMat = {
            a: decompMats.P.a * prev.a + decompMats.P.b * prev.c,
            b: decompMats.P.a * prev.b + decompMats.P.b * prev.d,
            c: decompMats.P.c * prev.a + decompMats.P.d * prev.c,
            d: decompMats.P.c * prev.b + decompMats.P.d * prev.d,
          };
        }

        // Draw transformed basis for current stage
        const se1 = matMul(stageMat, { x: 1, y: 0 });
        const se2 = matMul(stageMat, { x: 0, y: 1 });
        elements.push(
          <Arrow key="decomp-e1" from={origin} to={{ x: se1.x * 2, y: se1.y * 2 }}
            color="#f87171" width={3} markerId="eig-arrow-red" />,
          <Arrow key="decomp-e2" from={origin} to={{ x: se2.x * 2, y: se2.y * 2 }}
            color="#60a5fa" width={3} markerId="eig-arrow-blue" />,
        );

        // Stage label
        const [cx, cy] = toSvg(0, -5);
        elements.push(
          <text key="decomp-label" x={cx} y={cy}
            fontSize="12" fontWeight="700" fill={stageColors[decompStage]}
            fontFamily="monospace" textAnchor="middle"
            style={{ userSelect: 'none' }}>
            {stageLabels[decompStage]}
          </text>,
        );

        // Show key matrices
        const [dx, dy] = toSvg(0, -5.8);
        const dLabels = [
          `I`,
          `P⁻¹ = [${decompMats.Pinv.a.toFixed(1)}, ${decompMats.Pinv.b.toFixed(1)}; ${decompMats.Pinv.c.toFixed(1)}, ${decompMats.Pinv.d.toFixed(1)}]`,
          `D = [${decompMats.D.a.toFixed(1)}, 0; 0, ${decompMats.D.d.toFixed(1)}]`,
          `P = [${decompMats.P.a.toFixed(1)}, ${decompMats.P.b.toFixed(1)}; ${decompMats.P.c.toFixed(1)}, ${decompMats.P.d.toFixed(1)}]`,
        ];
        elements.push(
          <text key="decomp-mat-label" x={dx} y={dy}
            fontSize="9" fontWeight="500" fill="var(--viz-annotation)"
            fontFamily="monospace" textAnchor="middle"
            style={{ userSelect: 'none' }}>
            {dLabels[decompStage]}
          </text>,
        );

        // Draw dots transformed by current decomposition stage
        dots.slice(0, 80).forEach((dot, i) => {
          const transformed = matMul(stageMat, dot.orig);
          const [sx, sy] = toSvg(transformed.x, transformed.y);
          elements.push(
            <circle key={`decomp-dot-${i}`}
              cx={sx} cy={sy} r={2.5}
              fill={`hsl(${dot.hue}, 60%, 55%)`}
              opacity={0.6} />,
          );
        });
      }
    }

    return elements;
  }

  // ── Preset buttons ──
  const presets: { label: string; mat: Mat2 }[] = [
    { label: 'Scale', mat: { a: 2, b: 0, c: 0, d: 0.5 } },
    { label: 'Shear', mat: { a: 1, b: 1, c: 0, d: 1 } },
    { label: 'Rotate 45°', mat: { a: Math.cos(Math.PI / 4), b: -Math.sin(Math.PI / 4), c: Math.sin(Math.PI / 4), d: Math.cos(Math.PI / 4) } },
    { label: 'Reflect', mat: { a: 1, b: 0, c: 0, d: -1 } },
    { label: 'Symmetric', mat: { a: 3, b: 1, c: 1, d: 2 } },
    { label: 'Projection', mat: { a: 1, b: 0, c: 0, d: 0 } },
  ];

  // ── Button style helper ──
  const btnStyle: React.CSSProperties = {
    padding: '4px 10px',
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: 'monospace',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        style={{
          width: '100%', height: '100%',
          background: 'var(--viz-bg-gradient)',
          borderRadius: 'var(--radius-md)',
          touchAction: 'none',
          cursor: isPanning.current ? 'grabbing' : 'default',
          userSelect: 'none',
        }}
        onPointerDown={handleBgPointerDown}
        onPointerMove={handleBgPointerMove}
        onPointerUp={handleBgPointerUp}
        onPointerCancel={handleBgPointerUp}
      >
        <MemoDefs />
        <DynGrid vb={viewBox} />
        {renderContent()}
      </svg>

      {/* ── Zoom controls ── */}
      <div style={{
        position: 'absolute', bottom: '0.75rem', right: '0.75rem',
        display: 'flex', alignItems: 'center', gap: '2px',
        background: 'var(--viz-panel-bg)', backdropFilter: 'blur(8px)',
        borderRadius: '8px', border: '1px solid var(--viz-panel-border)',
        padding: '3px', zIndex: 5,
      }}>
        <button onClick={() => setViewBox(prev => {
          const nw = Math.min(prev.w * 1.15, 10000);
          const nh = Math.min(prev.h * 1.15, 10000);
          return { x: prev.x + (prev.w - nw) / 2, y: prev.y + (prev.h - nh) / 2, w: nw, h: nh };
        })} title="Zoom out" style={{
          width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', borderRadius: '4px',
          color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer',
        }}>−</button>
        <button onClick={resetView} title="Reset view" style={{
          height: '26px', padding: '0 5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', borderRadius: '4px',
          color: 'var(--viz-annotation)', fontSize: '9px', fontFamily: 'monospace', fontWeight: 600,
          cursor: 'pointer', minWidth: '36px',
        }}>{Math.round((CANVAS_SIZE / viewBox.w) * 100)}%</button>
        <button onClick={() => setViewBox(prev => {
          const nw = Math.max(prev.w * 0.87, 100);
          const nh = Math.max(prev.h * 0.87, 100);
          return { x: prev.x + (prev.w - nw) / 2, y: prev.y + (prev.h - nh) / 2, w: nw, h: nh };
        })} title="Zoom in" style={{
          width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', borderRadius: '4px',
          color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer',
        }}>+</button>
      </div>

      {/* ── Info panel ── */}
      {infoItems.length > 0 && (
        <div style={{
          position: 'absolute', top: '0.5rem', left: '0.5rem',
          background: 'var(--viz-panel-bg)', backdropFilter: 'blur(8px)',
          borderRadius: '8px', border: '1px solid var(--viz-panel-border)',
          padding: '6px 10px', fontFamily: 'monospace', fontSize: '11px',
          lineHeight: '20px', pointerEvents: 'none',
        }}>
          {infoItems.map((item, i) => (
            <div key={i}>
              <span style={{ color: 'var(--viz-label)' }}>{item.label}: </span>
              <span style={{ color: item.color ?? '#e0e0e0', fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Characteristic Equation Overlay ── */}
      {(showCharacteristicEq || mode === 'characteristic') && (
        <div style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          background: 'var(--viz-panel-bg)', backdropFilter: 'blur(8px)',
          borderRadius: '8px', border: '1px solid var(--viz-panel-border)',
          padding: '8px 12px', fontFamily: 'monospace', fontSize: '11px',
          lineHeight: '22px', maxWidth: '240px',
        }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Characteristic Equation
          </div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            λ² − {tr.toFixed(1)}λ + {d.toFixed(1)} = 0
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            disc = {(tr * tr - 4 * d).toFixed(2)} → {eig.complex ? '❌ complex' : '✅ real'}
          </div>
          {showTraceDetRelation && !eig.complex && (
            <div style={{ marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
              <div style={{ color: '#34d399' }}>tr(A) = λ₁+λ₂ = {eig.real[0].toFixed(2)}+{(eig.real[1] ?? 0).toFixed(2)} = {tr.toFixed(2)}</div>
              <div style={{ color: d >= 0 ? '#34d399' : '#f87171' }}>det(A) = λ₁·λ₂ = {eig.real[0].toFixed(2)}×{(eig.real[1] ?? 0).toFixed(2)} = {d.toFixed(2)}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Matrix Controls ── */}
      {(showMatrixControls || interactive || mode === 'explore') && (
        <div style={{
          position: 'absolute', bottom: '0.75rem', left: '0.5rem',
          background: 'var(--viz-panel-bg)', backdropFilter: 'blur(8px)',
          borderRadius: '8px', border: '1px solid var(--viz-panel-border)',
          padding: '8px 10px', zIndex: 5,
        }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Matrix A
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
            {(['a', 'b', 'c', 'd'] as const).map(key => (
              <input key={key}
                type="number" step="0.1"
                value={mat[key].toFixed(1)}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) updateMat({ ...mat, [key]: v });
                }}
                style={{
                  width: '52px', padding: '3px 5px', fontSize: '12px', fontWeight: 700,
                  fontFamily: 'monospace', textAlign: 'center',
                  background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                  borderRadius: '4px', color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Preset Buttons ── */}
      {(showPresets || mode === 'preset' || mode === 'explore') && (
        <div style={{
          position: 'absolute', top: '0.5rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '4px',
          background: 'var(--viz-panel-bg)', backdropFilter: 'blur(8px)',
          borderRadius: '8px', border: '1px solid var(--viz-panel-border)',
          padding: '4px 6px', zIndex: 5,
        }}>
          {presets.map(p => (
            <button key={p.label} onClick={() => updateMat(p.mat)} style={btnStyle}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Animation Controls ── */}
      {(showAnimation || mode === 'animate') && (
        <div style={{
          position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--viz-panel-bg)', backdropFilter: 'blur(8px)',
          borderRadius: '8px', border: '1px solid var(--viz-panel-border)',
          padding: '6px 14px', zIndex: 5,
        }}>
          <button onClick={startAnimation}
            disabled={isAnimating}
            style={{ ...btnStyle, background: isAnimating ? 'var(--bg-base)' : 'var(--accent)', color: isAnimating ? 'var(--text-muted)' : '#fff', border: 'none' }}>
            {isAnimating ? '⏳ Animating...' : '▶ Play'}
          </button>
          <button onClick={resetAnimation} style={btnStyle}>
            ↺ Reset
          </button>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: '30px' }}>
            {(animT * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* ── Power Iteration Controls ── */}
      {(showPowerIteration || mode === 'power-iteration') && (
        <div style={{
          position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--viz-panel-bg)', backdropFilter: 'blur(8px)',
          borderRadius: '8px', border: '1px solid var(--viz-panel-border)',
          padding: '6px 14px', zIndex: 5,
        }}>
          <button onClick={doPowerStep} style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', border: 'none' }}>
            Iterate (v → Av)
          </button>
          <button onClick={resetPower} style={btnStyle}>
            ↺ Random
          </button>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: 700 }}>
            n = {powerIter}
          </span>
        </div>
      )}

      {/* ── Decomposition Controls ── */}
      {(showDecomposition || mode === 'decomposition') && (
        <div style={{
          position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--viz-panel-bg)', backdropFilter: 'blur(8px)',
          borderRadius: '8px', border: '1px solid var(--viz-panel-border)',
          padding: '6px 14px', zIndex: 5,
        }}>
          <button onClick={nextDecompStage}
            style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', border: 'none' }}>
            Next Stage →
          </button>
          <button onClick={() => setDecompStage(0)} style={btnStyle}>
            ↺ Reset
          </button>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            Stage {decompStage}/3
          </span>
        </div>
      )}
    </div>
  );
}
