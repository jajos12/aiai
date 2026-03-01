'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// Shared types & styling helpers
// ─────────────────────────────────────────────────────────────────────────

const DARK = '#0a0e27';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER = 'rgba(99,102,241,0.25)';
const ACCENT = '#6366f1';
const ORANGE = '#fb923c';
const GREEN = '#34d399';
const YELLOW = '#fbbf24';

function card(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: 14,
    ...extra,
  };
}

function tag(color: string, text: string) {
  return (
    <span style={{ background: color + '22', border: `1px solid ${color}55`, color, borderRadius: 6, padding: '2px 8px', fontSize: '0.72rem', fontFamily: 'monospace' }}>
      {text}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Primitive functions
// ─────────────────────────────────────────────────────────────────────────

interface FnDef {
  label: string;
  symbol: string;
  f: (x: number) => number;
  df: (x: number) => number;
}

const FNS: Record<string, FnDef> = {
  double: { label: '×2', symbol: 'g(x) = 2x', f: x => 2 * x, df: () => 2 },
  square: { label: 'x²', symbol: 'f(u) = u²', f: x => x * x, df: x => 2 * x },
  sinx: { label: 'sin', symbol: 'f(u) = sin(u)', f: x => Math.sin(x), df: x => Math.cos(x) },
  expx: { label: 'eˣ', symbol: 'g(x) = eˣ', f: x => Math.exp(x), df: x => Math.exp(x) },
  linear: { label: '3x+2', symbol: 'g(x) = 3x+2', f: x => 3 * x + 2, df: () => 3 },
  power4: { label: 'u⁴', symbol: 'f(u) = u⁴', f: x => Math.pow(x, 4), df: x => 4 * Math.pow(x, 3) },
  xSquaredPlus1: { label: 'x²+1', symbol: 'g(x) = x²+1', f: x => x * x + 1, df: x => 2 * x },
};

// ─────────────────────────────────────────────────────────────────────────
// FunctionMachine
// ─────────────────────────────────────────────────────────────────────────

export interface FunctionMachineProps {
  mode?: 'compose';
  fId?: string;
  gId?: string;
  showValues?: boolean;
  showChallenge?: boolean;
}

export function FunctionMachine({ fId = 'square', gId = 'double', showValues = true }: FunctionMachineProps) {
  const f = FNS[fId] ?? FNS.square;
  const g = FNS[gId] ?? FNS.double;
  const [x, setX] = useState(1.5);

  const gOut = g.f(x);
  const hOut = f.f(gOut);

  return (
    <div style={{ width: '100%', height: '100%', background: DARK, borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
        h(x) = f(g(x)) = {f.symbol.replace('u', `(${g.symbol.replace('x', 'x')})`)}
      </div>

      {/* Machine row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', maxWidth: 560 }}>
        {/* Input */}
        <div style={{ ...card({ padding: '10px 14px', textAlign: 'center', minWidth: 64 }) }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>x</div>
          <div style={{ fontFamily: 'monospace', color: YELLOW, fontSize: '1.1rem', fontWeight: 700 }}>{x.toFixed(2)}</div>
        </div>

        <Arrow />

        {/* g machine */}
        <Machine label="g" symbol={g.symbol} color={ACCENT} output={showValues ? gOut : null} />

        <Arrow />

        {/* f machine */}
        <Machine label="f" symbol={f.symbol} color={ORANGE} output={showValues ? hOut : null} />

        <Arrow />

        {/* Output */}
        <div style={{ ...card({ padding: '10px 14px', textAlign: 'center', minWidth: 64 }) }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>h(x)</div>
          <div style={{ fontFamily: 'monospace', color: GREEN, fontSize: '1.1rem', fontWeight: 700 }}>{hOut.toFixed(3)}</div>
        </div>
      </div>

      {/* Intermediate value callout */}
      {showValues && (
        <div style={{ ...card({ padding: '8px 16px', display: 'flex', gap: 24, justifyContent: 'center', fontSize: '0.82rem', fontFamily: 'monospace' }) }}>
          <span>g({x.toFixed(2)}) = <strong style={{ color: ACCENT }}>{gOut.toFixed(3)}</strong></span>
          <span>f(<strong style={{ color: ACCENT }}>{gOut.toFixed(3)}</strong>) = <strong style={{ color: GREEN }}>{hOut.toFixed(3)}</strong></span>
        </div>
      )}

      {/* Slider */}
      <div style={{ width: '100%', maxWidth: 420 }}>
        <label style={{ fontSize: '0.75rem', color: '#64748b' }}>x = {x.toFixed(2)}</label>
        <input type="range" min={-2} max={2} step={0.05} value={x}
          onChange={e => setX(Number(e.target.value))}
          style={{ width: '100%', accentColor: ACCENT }} />
      </div>
    </div>
  );
}

function Machine({ label, symbol, color, output }: { label: string; symbol: string; color: string; output: number | null }) {
  return (
    <div style={{ flex: 1, background: color + '18', border: `2px solid ${color}55`, borderRadius: 10, padding: '12px 10px', textAlign: 'center', minWidth: 100 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', color: color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>{symbol}</div>
      {output !== null && (
        <div style={{ marginTop: 6, fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color }}>→ {output.toFixed(3)}</div>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <div style={{ padding: '0 6px', color: '#334155', fontSize: '1.2rem', fontWeight: 700 }}>→</div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// RateMultiplier
// ─────────────────────────────────────────────────────────────────────────

export interface RateMultiplierProps {
  showUnits?: boolean;
  showMagnification?: boolean;
}

export function RateMultiplier({ showUnits = true }: RateMultiplierProps) {
  const [rate1, setRate1] = useState(1.6094); // miles → km
  const [rate2, setRate2] = useState(9.461e-14); // km → light-year (scaled)
  const [useCustomLabel, setUseCustomLabel] = useState(false);

  // Use a simpler version for display — conceptual magnification
  const [mag1, setMag1] = useState(3);
  const [mag2, setMag2] = useState(2);
  const combined = mag1 * mag2;

  return (
    <div style={{ width: '100%', height: '100%', background: DARK, borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
        {showUnits ? 'Input → g (first transform) → f (second transform) → output' : 'Each function magnifies its input'}
      </div>

      {/* Rate blocks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', maxWidth: 560 }}>
        <RateBlock label="Input" value={1} color="#64748b" unit="x" />
        <Arrow />
        <RateBlock label="g rate" value={mag1} color={ACCENT} unit={`dg/dx = ${mag1}`} editable onEdit={setMag1} min={0.5} max={5} step={0.25} />
        <Arrow />
        <RateBlock label="f rate" value={mag2} color={ORANGE} unit={`df/dg = ${mag2}`} editable onEdit={setMag2} min={0.5} max={5} step={0.25} />
        <Arrow />
        <RateBlock label="Total" value={combined} color={GREEN} unit={`dh/dx = ${combined}`} highlight />
      </div>

      {/* Formula derivation */}
      <div style={{ ...card({ padding: '12px 20px', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.9rem' }) }}>
        <span style={{ color: GREEN, fontWeight: 700 }}>dh/dx</span>
        {' = '}
        <span style={{ color: ORANGE }}>df/dg</span>
        {' × '}
        <span style={{ color: ACCENT }}>dg/dx</span>
        {' = '}
        <span style={{ color: ORANGE }}>{mag2}</span>
        {' × '}
        <span style={{ color: ACCENT }}>{mag1}</span>
        {' = '}
        <span style={{ color: GREEN, fontWeight: 700 }}>{combined}</span>
      </div>

      {/* Magnification bars */}
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 8 }}>Adjust magnification rates:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {([{ label: 'g magnifies by', val: mag1, set: setMag1, color: ACCENT }, { label: 'f magnifies by', val: mag2, set: setMag2, color: ORANGE }] as const).map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ minWidth: 120, fontSize: '0.75rem', color: r.color }}>{r.label}</span>
              <input type="range" min={0.5} max={5} step={0.25} value={r.val}
                onChange={e => r.set(Number(e.target.value))}
                style={{ flex: 1, accentColor: r.color }} />
              <span style={{ fontFamily: 'monospace', minWidth: 32, color: r.color }}>{r.val}×</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RateBlock({ label, value, color, unit, highlight, editable, onEdit, min, max, step }:
  { label: string; value: number; color: string; unit: string; highlight?: boolean; editable?: boolean; onEdit?: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div style={{ flex: 1, background: highlight ? color + '22' : SURFACE, border: `2px solid ${highlight ? color : color + '44'}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color }}>{value}×</div>
      <div style={{ fontSize: '0.65rem', color: color + 'aa', marginTop: 3, fontFamily: 'monospace' }}>{unit}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ChainCalculator — step-by-step derivative with live substitution
// ─────────────────────────────────────────────────────────────────────────

export interface ChainCalculatorProps {
  fId?: string;
  gId?: string;
  showStepByStep?: boolean;
  showFormula?: boolean;
  x?: number;
  challengeMode?: boolean;
}

export function ChainCalculator({
  fId = 'power4',
  gId = 'linear',
  x: initX = 1,
  challengeMode = false,
}: ChainCalculatorProps) {
  const f = FNS[fId] ?? FNS.power4;
  const g = FNS[gId] ?? FNS.linear;
  const [x, setX] = useState(initX);

  const gx = g.f(x);
  const dgdx = g.df(x);
  const fPrimeGx = f.df(gx);
  const totalDerivative = fPrimeGx * dgdx;

  const [userAnswer, setUserAnswer] = useState('');
  const isCorrect = challengeMode ? Math.abs(Number(userAnswer) - totalDerivative) < 0.05 : false;

  return (
    <div style={{ width: '100%', height: '100%', background: DARK, borderRadius: 8, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
      <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
        h(x) = {fId === 'power4' ? `(${g.symbol.replace('g(x) = ', '')})⁴` : `${fId}(${g.symbol.replace('g(x) = ', '')})`}
      </div>

      {/* Step-by-step breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { step: '1', label: 'Inner function g(x)', expr: g.symbol, value: `g(${x.toFixed(2)}) = ${gx.toFixed(4)}`, color: ACCENT },
          { step: '2', label: "Inner derivative g'(x)", expr: `g'(x) = ${dgdx.toFixed(4)} (constant or evaluated)`, value: `g'(${x.toFixed(2)}) = ${dgdx.toFixed(4)}`, color: YELLOW },
          { step: '3', label: "Outer derivative f'(u) at u=g(x)", expr: `f'(u) evaluated at u = g(x)`, value: `f'(${gx.toFixed(3)}) = ${fPrimeGx.toFixed(4)}`, color: ORANGE },
          { step: '4', label: "Chain rule: f'(g(x)) · g'(x)", expr: `${fPrimeGx.toFixed(4)} × ${dgdx.toFixed(4)}`, value: `h'(${x.toFixed(2)}) = ${totalDerivative.toFixed(4)}`, color: GREEN, final: true },
        ].map(s => (
          <div key={s.step} style={{ ...card({ display: 'flex', alignItems: 'center', gap: 12 }), borderLeftColor: s.color, borderLeftWidth: 3 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: s.color + '33', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{s.step}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.label}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: s.color, fontWeight: s.final ? 700 : 400 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* x slider */}
      <div>
        <label style={{ fontSize: '0.75rem', color: '#64748b' }}>x = {x.toFixed(2)}</label>
        <input type="range" min={-2} max={2} step={0.05} value={x}
          onChange={e => setX(Number(e.target.value))}
          style={{ width: '100%', accentColor: ACCENT }} />
      </div>

      {/* Challenge input */}
      {challengeMode && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="number"
            step="0.001"
            placeholder={`Enter h'(${x.toFixed(1)})`}
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            style={{ flex: 1, padding: '6px 10px', background: '#1e293b', border: `1px solid ${isCorrect ? GREEN : BORDER}`, borderRadius: 6, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem' }}
          />
          {userAnswer && (
            <span style={{ color: isCorrect ? GREEN : '#f87171', fontWeight: 700, fontSize: '0.85rem' }}>
              {isCorrect ? '✓ Correct!' : `Expected ≈ ${totalDerivative.toFixed(4)}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
