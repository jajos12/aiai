'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// Curve functions
// ─────────────────────────────────────────────────────────────────────────

type CurveId = 'parabola' | 'bumpy' | 'sine';

interface CurveDef {
  f: (x: number) => number;
  df: (x: number) => number;
  domain: [number, number];
  label: string;
}

const CURVES: Record<CurveId, CurveDef> = {
  parabola: {
    f: (x) => x * x,
    df: (x) => 2 * x,
    domain: [-2.5, 2.5],
    label: 'f(x) = x²',
  },
  bumpy: {
    f: (x) => x * x + 2 * Math.sin(2.5 * x),
    df: (x) => 2 * x + 5 * Math.cos(2.5 * x),
    domain: [-2.5, 2.5],
    label: 'f(x) = x² + 2sin(2.5x)',
  },
  sine: {
    f: (x) => -Math.sin(x) + 0.1 * x * x,
    df: (x) => -Math.cos(x) + 0.2 * x,
    domain: [-3.5, 3.5],
    label: 'f(x) = -sin(x) + 0.1x²',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Shared SVG helpers
// ─────────────────────────────────────────────────────────────────────────

function buildPath(curve: CurveDef, toSVG: (x: number, y: number) => [number, number], steps = 300): string {
  const [xMin, xMax] = curve.domain;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = curve.f(x);
    const [sx, sy] = toSVG(x, y);
    pts.push(`${i === 0 ? 'M' : 'L'}${sx.toFixed(2)},${sy.toFixed(2)}`);
  }
  return pts.join(' ');
}

// ─────────────────────────────────────────────────────────────────────────
// SlopeExplorer
// ─────────────────────────────────────────────────────────────────────────

export interface SlopeExplorerProps {
  curve?: CurveId;
  showRiseRun?: boolean;
  showSlopeNumber?: boolean;
}

export function SlopeExplorer({
  curve: curveId = 'parabola',
  showRiseRun = true,
  showSlopeNumber = true,
}: SlopeExplorerProps) {
  const curve = CURVES[curveId];
  const [xMin, xMax] = curve.domain;

  // SVG layout
  const W = 600, H = 380;
  const PAD = { t: 32, r: 24, b: 40, l: 52 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  // Compute y range from curve
  const yVals = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (i / 200) * (xMax - xMin);
      pts.push(curve.f(x));
    }
    return pts;
  }, [curve, xMin, xMax]);

  const yMin = Math.min(...yVals);
  const yMax = Math.max(...yVals);
  const yPad = (yMax - yMin) * 0.15;

  const toSVG = useCallback((x: number, y: number): [number, number] => {
    const sx = PAD.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const sy = PAD.t + ((yMax + yPad - y) / (yMax - yMin + 2 * yPad)) * plotH;
    return [sx, sy];
  }, [xMin, xMax, yMin, yMax, yPad, plotW, plotH]);

  const fromSVGX = useCallback((sx: number): number => {
    return xMin + ((sx - PAD.l) / plotW) * (xMax - xMin);
  }, [xMin, xMax, plotW]);

  const [pointX, setPointX] = useState(() => (xMin + xMax) / 2);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const x = Math.max(xMin, Math.min(xMax, fromSVGX(svgX)));
    setPointX(x);
  }, [fromSVGX, xMin, xMax]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', () => { dragging.current = false; });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => { dragging.current = false; });
    };
  }, [handleMouseMove]);

  const py = curve.f(pointX);
  const slope = curve.df(pointX);
  const [px, psy] = toSVG(pointX, py);

  const riseRunDx = (xMax - xMin) * 0.25;
  const x2 = Math.min(xMax, pointX + riseRunDx);
  const riseRunY1 = py;
  const riseRunY2 = curve.f(x2);
  const [rrx1, rrsy1] = toSVG(pointX, riseRunY1);
  const [rrx2, rrsy2] = toSVG(x2, riseRunY2);
  const [, rrsyBase] = toSVG(x2, riseRunY1);

  const curvePath = useMemo(() => buildPath(curve, toSVG), [curve, toSVG]);

  // Axes
  const [ax0, ay0] = toSVG(xMin, 0);
  const [ax1] = toSVG(xMax, 0);
  const [ayS, ayE] = [toSVG(0, yMin + yPad * 0.5)[1], toSVG(0, yMax + yPad * 0.5)[1]];

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0e27', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: '#94a3b8' }}>{curve.label}</span>
        {showSlopeNumber && (
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '4px 14px', fontFamily: 'monospace', fontSize: '1rem', color: '#a5b4fc' }}>
            slope = <span style={{ color: slope > 0 ? '#f87171' : slope < 0 ? '#34d399' : '#fbbf24', fontWeight: 700 }}>{slope.toFixed(3)}</span>
          </div>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ flex: 1, width: '100%', cursor: 'ew-resize', userSelect: 'none' }}
        onMouseDown={() => { dragging.current = true; }}
      >
        {/* Axes */}
        <line x1={ax0} y1={ay0} x2={ax1} y2={ay0} stroke="#2d3748" strokeWidth={1.5} />
        <line x1={toSVG(0, 0)[0]} y1={ayE} x2={toSVG(0, 0)[0]} y2={ayS} stroke="#2d3748" strokeWidth={1.5} />

        {/* Curve */}
        <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Rise/Run triangle */}
        {showRiseRun && (
          <g opacity={0.7}>
            {/* Horizontal run */}
            <line x1={rrx1} y1={rrsy1} x2={rrx2} y2={rrsyBase} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4,3" />
            {/* Vertical rise */}
            <line x1={rrx2} y1={rrsyBase} x2={rrx2} y2={rrsy2} stroke="#34d399" strokeWidth={1.5} strokeDasharray="4,3" />
            <text x={rrx1 + (rrx2 - rrx1) / 2} y={rrsyBase + 14} fill="#fbbf24" fontSize={11} textAnchor="middle">run</text>
            <text x={rrx2 + 6} y={(rrsyBase + rrsy2) / 2} fill="#34d399" fontSize={11} textAnchor="start">rise</text>
          </g>
        )}

        {/* Draggable point */}
        <circle cx={px} cy={psy} r={9} fill="#f97316" stroke="#fff" strokeWidth={2} style={{ cursor: 'ew-resize' }} />
        <text x={px} y={psy - 16} fill="#f97316" fontSize={12} textAnchor="middle" fontFamily="monospace">
          x = {pointX.toFixed(2)}
        </text>
      </svg>

      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
        Drag the orange point along the curve to see how slope changes.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// DerivativeExplorer
// ─────────────────────────────────────────────────────────────────────────

export interface DerivativeExplorerProps {
  curve?: CurveId;
  showTangent?: boolean;
  showSecant?: boolean;
  showHSlider?: boolean;
  showDerivativeValue?: boolean;
  showDescentAnimation?: boolean;
  show1DDescentControls?: boolean;
  challengeMode?: boolean;
}

export function DerivativeExplorer({
  curve: curveId = 'bumpy',
  showTangent = true,
  showSecant = false,
  showHSlider = false,
  showDerivativeValue = true,
  showDescentAnimation = false,
  show1DDescentControls = false,
  challengeMode = false,
}: DerivativeExplorerProps) {
  const curve = CURVES[curveId];
  const [xMin, xMax] = curve.domain;

  const W = 600, H = 360;
  const PAD = { t: 28, r: 24, b: 40, l: 52 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const yVals = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 200; i++) pts.push(curve.f(xMin + (i / 200) * (xMax - xMin)));
    return pts;
  }, [curve, xMin, xMax]);
  const yMin = Math.min(...yVals);
  const yMax = Math.max(...yVals);
  const yPad = (yMax - yMin) * 0.18;

  const toSVG = useCallback((x: number, y: number): [number, number] => {
    const sx = PAD.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const sy = PAD.t + ((yMax + yPad - y) / (yMax - yMin + 2 * yPad)) * plotH;
    return [sx, sy];
  }, [xMin, xMax, yMin, yMax, yPad, plotW, plotH]);

  const fromSVGX = useCallback((sx: number) => xMin + ((sx - PAD.l) / plotW) * (xMax - xMin), [xMin, xMax, plotW]);

  const [pointX, setPointX] = useState<number>(() => 0.5);
  const [hVal, setHVal] = useState(1.0);
  const [descentX, setDescentX] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lr] = useState(0.05);
  const [descentPath, setDescentPath] = useState<number[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const x = Math.max(xMin, Math.min(xMax, fromSVGX(svgX)));
    setPointX(x);
  }, [fromSVGX, xMin, xMax]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', () => { dragging.current = false; });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => { dragging.current = false; });
    };
  }, [handleMouseMove]);

  // 1D descent animation
  const startDescent = useCallback(() => {
    setDescentX(pointX);
    setDescentPath([pointX]);
    setIsAnimating(true);
  }, [pointX]);

  useEffect(() => {
    if (!isAnimating) return;
    animRef.current = setInterval(() => {
      setDescentX(prev => {
        if (prev === null) return null;
        const g = curve.df(prev);
        const next = prev - lr * g;
        const clamped = Math.max(xMin, Math.min(xMax, next));
        setDescentPath(p => [...p, clamped]);
        if (Math.abs(g) < 0.005 || Math.abs(next - prev) < 0.001) {
          setIsAnimating(false);
        }
        return clamped;
      });
    }, 150);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [isAnimating, curve, lr, xMin, xMax]);

  const slope = curve.df(pointX);
  const derivativeValue = showSecant
    ? (curve.f(pointX + hVal) - curve.f(pointX)) / hVal
    : slope;

  const py = curve.f(pointX);
  const [px, psy] = toSVG(pointX, py);

  // Tangent line endpoints
  const tangentDx = (xMax - xMin) * 0.25;
  const [tx0, ty0] = toSVG(pointX - tangentDx, py - slope * tangentDx);
  const [tx1, ty1] = toSVG(pointX + tangentDx, py + slope * tangentDx);

  // Secant line (between pointX and pointX + hVal)
  const secantX2 = Math.min(xMax, pointX + hVal);
  const secantSlope = (curve.f(secantX2) - py) / (secantX2 - pointX);
  const [sx0, sy0] = toSVG(pointX - tangentDx * 0.5, py - secantSlope * tangentDx * 0.5);
  const [sx1, sy1] = toSVG(pointX + tangentDx * 1.5, py + secantSlope * tangentDx * 1.5);
  const [secX2, secY2] = toSVG(secantX2, curve.f(secantX2));

  const curvePath = useMemo(() => buildPath(curve, toSVG), [curve, toSVG]);
  const [ax0, ay0] = toSVG(xMin, 0);
  const [ax1] = toSVG(xMax, 0);

  // Challenge mode: check win condition
  const derivMag = Math.abs(curve.df(pointX));
  const isWin = challengeMode && derivMag < 0.05;

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0e27', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: '#94a3b8' }}>{curve.label}</span>
        {showDerivativeValue && (
          <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '4px 14px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#a5b4fc' }}>
            f&apos;(x) = <span style={{ color: Math.abs(derivativeValue) < 0.1 ? '#34d399' : derivativeValue > 0 ? '#f87171' : '#fbbf24', fontWeight: 700 }}>{derivativeValue.toFixed(4)}</span>
            {challengeMode && <span style={{ marginLeft: 10, color: isWin ? '#34d399' : '#64748b', fontSize: '0.75rem' }}>|f&apos;| = {derivMag.toFixed(4)} {isWin ? '✓ WIN' : '(need < 0.05)'}</span>}
          </div>
        )}
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ flex: 1, width: '100%', cursor: 'ew-resize', userSelect: 'none' }}
        onMouseDown={(e) => {
          if (!svgRef.current) return;
          dragging.current = true;
          const rect = svgRef.current.getBoundingClientRect();
          const svgX = ((e.clientX - rect.left) / rect.width) * W;
          setPointX(Math.max(xMin, Math.min(xMax, fromSVGX(svgX))));
        }}
      >
        {/* Axes */}
        <line x1={ax0} y1={ay0} x2={ax1} y2={ay0} stroke="#2d3748" strokeWidth={1.5} />

        {/* Curve */}
        <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Descent path */}
        {showDescentAnimation && descentPath.length > 1 && descentPath.map((x, i) => {
          if (i === 0) return null;
          const [x1, y1] = toSVG(descentPath[i - 1], curve.f(descentPath[i - 1]));
          const [x2, y2] = toSVG(x, curve.f(x));
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#34d399" strokeWidth={1.5} opacity={0.6} />;
        })}

        {/* Secant line */}
        {showSecant && hVal > 0.05 && (
          <>
            <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="6,3" />
            <circle cx={secX2} cy={secY2} r={5} fill="#fbbf24" opacity={0.8} />
          </>
        )}

        {/* Tangent line */}
        {showTangent && (
          <line x1={tx0} y1={ty0} x2={tx1} y2={ty1}
            stroke={showSecant && hVal > 0.05 ? '#4f7aff' : '#f97316'}
            strokeWidth={2} opacity={showSecant && hVal > 0.05 ? 0.5 : 1} />
        )}

        {/* Descent ball */}
        {showDescentAnimation && descentX !== null && (
          <circle cx={toSVG(descentX, curve.f(descentX))[0]} cy={toSVG(descentX, curve.f(descentX))[1]} r={7} fill="#34d399" stroke="#fff" strokeWidth={2} />
        )}

        {/* Draggable point */}
        <circle cx={px} cy={psy} r={9} fill="#f97316" stroke="#fff" strokeWidth={2} style={{ cursor: 'ew-resize' }} />
      </svg>

      {/* h slider */}
      {showHSlider && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: 40 }}>h =</span>
          <input type="range" min={0.01} max={2} step={0.01} value={hVal}
            onChange={e => setHVal(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#fbbf24' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#fbbf24', minWidth: 50 }}>{hVal.toFixed(2)}</span>
        </div>
      )}

      {/* Descent controls */}
      {show1DDescentControls && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={startDescent} style={btnStyle('#6366f1')}>▶ Run Descent</button>
          <button onClick={() => { setDescentX(null); setDescentPath([]); setIsAnimating(false); }} style={btnStyle('#334155')}>Reset</button>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Drag the point to set start position, then run.</span>
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '5px 14px',
  background: bg,
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  fontSize: '0.8rem',
  cursor: 'pointer',
  fontFamily: 'var(--font-heading)',
});

// ─────────────────────────────────────────────────────────────────────────
// PartialDerivativeSlicer
// ─────────────────────────────────────────────────────────────────────────

export interface PartialDerivativeSlicerProps {
  landscape?: 'bowl';
  showSliceToggle?: boolean;
  showPartialValue?: boolean;
  interactive?: boolean;
}

// Bowl landscape fixed
const bowlF = (x: number, y: number) => x * x + y * y;
const bowlDx = (x: number) => 2 * x;
const bowlDy = (y: number) => 2 * y;

export function PartialDerivativeSlicer({
  showPartialValue = true,
}: PartialDerivativeSlicerProps) {
  const [axis, setAxis] = useState<'x' | 'y'>('x');
  const [ballX, setBallX] = useState(1.5);
  const [ballY, setBallY] = useState(1.0);
  const [frozen, setFrozen] = useState(1.0); // the frozen axis value

  // When axis changes, update frozen value
  useEffect(() => {
    setFrozen(axis === 'x' ? ballY : ballX);
  }, [axis, ballX, ballY]);

  const W = 560, H = 320;
  const PAD = { t: 28, r: 24, b: 40, l: 52 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const xMin = -3, xMax = 3;
  const yMin = 0, yMax = 12;

  const sliceF = axis === 'x'
    ? (t: number) => bowlF(t, frozen)
    : (t: number) => bowlF(frozen, t);

  const toSVG = useCallback((x: number, y: number): [number, number] => {
    const sx = PAD.l + ((x - xMin) / (xMax - xMin)) * plotW;
    const sy = PAD.t + ((yMax - Math.min(y, yMax)) / (yMax - yMin)) * plotH;
    return [sx, sy];
  }, [plotW, plotH]);

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = xMin + (i / 200) * (xMax - xMin);
      const y = Math.min(sliceF(t), yMax * 1.2);
      const [sx, sy] = toSVG(t, y);
      pts.push(`${i === 0 ? 'M' : 'L'}${sx.toFixed(2)},${sy.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [sliceF, toSVG]);

  const activeT = axis === 'x' ? ballX : ballY;
  const partialVal = axis === 'x' ? bowlDx(ballX) : bowlDy(ballY);
  const [bpx, bpsy] = toSVG(activeT, sliceF(activeT));

  // Tangent
  const tDx = 0.8;
  const [ttx0, tty0] = toSVG(activeT - tDx, sliceF(activeT) - partialVal * tDx);
  const [ttx1, tty1] = toSVG(activeT + tDx, sliceF(activeT) + partialVal * tDx);
  const [ax0, ay0] = toSVG(xMin, 0);
  const [ax1] = toSVG(xMax, 0);

  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0e27', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Slice axis:</span>
        {(['x', 'y'] as const).map(a => (
          <button key={a} onClick={() => setAxis(a)}
            style={{ ...btnStyle(axis === a ? '#6366f1' : '#1e293b'), border: '1px solid rgba(99,102,241,0.3)' }}>
            θ<sub>{a === 'x' ? '₁' : '₂'}</sub> direction
          </button>
        ))}
        {showPartialValue && (
          <div style={{ marginLeft: 'auto', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '4px 14px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#a5b4fc' }}>
            ∂L/∂θ<sub>{axis === 'x' ? '₁' : '₂'}</sub> = <span style={{ color: '#f97316', fontWeight: 700 }}>{partialVal.toFixed(3)}</span>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div style={{ fontSize: '0.78rem', color: '#64748b', background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 10px' }}>
        Slicing surface along <strong style={{ color: '#a5b4fc' }}>θ{axis === 'x' ? '₁' : '₂'} axis</strong>. {axis === 'x' ? 'θ₂' : 'θ₁'} is frozen at <strong style={{ color: '#fbbf24' }}>{frozen.toFixed(2)}</strong>.
      </div>

      {/* Slice curve */}
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ flex: 1, width: '100%', cursor: 'ew-resize', userSelect: 'none' }}
        onMouseMove={(e) => {
          if (!svgRef.current) return;
          const rect = svgRef.current.getBoundingClientRect();
          const svgX = ((e.clientX - rect.left) / rect.width) * W;
          const t = Math.max(xMin, Math.min(xMax, xMin + ((svgX - PAD.l) / plotW) * (xMax - xMin)));
          if (axis === 'x') setBallX(t); else setBallY(t);
        }}
      >
        {/* Axes */}
        <line x1={ax0} y1={ay0} x2={ax1} y2={ay0} stroke="#2d3748" strokeWidth={1.5} />
        <text x={ax1 - 10} y={ay0 - 6} fill="#64748b" fontSize={11}>{axis === 'x' ? 'θ₁' : 'θ₂'}</text>
        <text x={PAD.l - 28} y={PAD.t + 10} fill="#64748b" fontSize={11}>L</text>

        {/* Slice curve */}
        <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Tangent */}
        <line x1={ttx0} y1={tty0} x2={ttx1} y2={tty1} stroke="#f97316" strokeWidth={2} />

        {/* Ball */}
        <circle cx={bpx} cy={bpsy} r={9} fill="#34d399" stroke="#fff" strokeWidth={2} />
        <text x={bpx} y={bpsy - 14} fill="#34d399" fontSize={11} textAnchor="middle" fontFamily="monospace">
          {activeT.toFixed(2)}
        </text>
      </svg>

      {/* Ball position sliders */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.73rem', color: '#64748b' }}>θ₁ = {ballX.toFixed(2)}</label>
          <input type="range" min={-2.8} max={2.8} step={0.05} value={ballX}
            onChange={e => setBallX(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.73rem', color: '#64748b' }}>θ₂ = {ballY.toFixed(2)}</label>
          <input type="range" min={-2.8} max={2.8} step={0.05} value={ballY}
            onChange={e => setBallY(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1' }} />
        </div>
      </div>
    </div>
  );
}
