'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GraphBuilder } from './GraphBuilder';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  x: number;         // 0–100 percent of SVG width
  y: number;         // 0–100 percent of SVG height
  op: string;        // 'input' | 'mul' | 'add' | 'sub' | 'square' | 'sin' | 'exp' | 'output'
  label: string;
  inputIds: string[];
}

interface Graph {
  nodes: GraphNode[];
  description: string;
  xRange: [number, number];
}

// ─────────────────────────────────────────────────────────────────────────
// Graph presets
// ─────────────────────────────────────────────────────────────────────────

function buildSingleGraph(): Graph {
  return {
    description: 'h(x) = (3x + 2)⁴',
    xRange: [-2, 2],
    nodes: [
      { id: 'x', x: 8, y: 50, op: 'input', label: 'x', inputIds: [] },
      { id: 'linear', x: 35, y: 50, op: 'linear', label: '3x+2', inputIds: ['x'] },
      { id: 'power4', x: 65, y: 50, op: 'power4', label: 'u⁴', inputIds: ['linear'] },
      { id: 'out', x: 92, y: 50, op: 'output', label: 'h(x)', inputIds: ['power4'] },
    ],
  };
}

function buildDoubleGraph(): Graph {
  return {
    description: 'h(x) = sin(eˣ²)',
    xRange: [-1.5, 1.5],
    nodes: [
      { id: 'x', x: 8, y: 50, op: 'input', label: 'x', inputIds: [] },
      { id: 'sq', x: 30, y: 50, op: 'square', label: 'x²', inputIds: ['x'] },
      { id: 'ex', x: 55, y: 50, op: 'exp', label: 'eˣ', inputIds: ['sq'] },
      { id: 'sin', x: 80, y: 50, op: 'sin', label: 'sin', inputIds: ['ex'] },
      { id: 'out', x: 95, y: 50, op: 'output', label: 'h(x)', inputIds: ['sin'] },
    ],
  };
}

function buildMiniNetGraph(): Graph {
  return {
    description: 'L = (w·x − y)²',
    xRange: [-2, 2],
    nodes: [
      { id: 'w', x: 8, y: 25, op: 'param', label: 'w', inputIds: [] },
      { id: 'x', x: 8, y: 75, op: 'input', label: 'x', inputIds: [] },
      { id: 'mul', x: 32, y: 50, op: 'mul', label: 'w·x', inputIds: ['w', 'x'] },
      { id: 'y', x: 32, y: 85, op: 'input', label: 'y=1', inputIds: [] },
      { id: 'sub', x: 58, y: 60, op: 'sub', label: '−y', inputIds: ['mul', 'y'] },
      { id: 'sq', x: 80, y: 60, op: 'square', label: '(·)²', inputIds: ['sub'] },
      { id: 'out', x: 95, y: 60, op: 'output', label: 'L', inputIds: ['sq'] },
    ],
  };
}

function buildMultipathGraph(): Graph {
  return {
    description: 'z = x² + sin(x)',
    xRange: [-2, 2],
    nodes: [
      { id: 'x', x: 8, y: 50, op: 'input', label: 'x', inputIds: [] },
      { id: 'sq', x: 35, y: 25, op: 'square', label: 'x²', inputIds: ['x'] },
      { id: 'sin', x: 35, y: 75, op: 'sin', label: 'sin(x)', inputIds: ['x'] },
      { id: 'add', x: 65, y: 50, op: 'add', label: '+', inputIds: ['sq', 'sin'] },
      { id: 'out', x: 90, y: 50, op: 'output', label: 'z', inputIds: ['add'] },
    ],
  };
}

function buildDeepGraph(): Graph {
  return {
    description: 'Deep chain: 12 ops',
    xRange: [-1, 1],
    nodes: [
      { id: 'x', x: 5, y: 50, op: 'input', label: 'x', inputIds: [] },
      { id: 'sq0', x: 15, y: 50, op: 'square', label: 'x²', inputIds: ['x'] },
      { id: 'lin1', x: 25, y: 50, op: 'linear', label: '3u+1', inputIds: ['sq0'] },
      { id: 'sin1', x: 35, y: 50, op: 'sin', label: 'sin', inputIds: ['lin1'] },
      { id: 'exp1', x: 45, y: 50, op: 'exp', label: 'eˣ', inputIds: ['sin1'] },
      { id: 'sq1', x: 55, y: 50, op: 'square', label: 'u²', inputIds: ['exp1'] },
      { id: 'sin2', x: 65, y: 50, op: 'sin', label: 'sin', inputIds: ['sq1'] },
      { id: 'lin2', x: 75, y: 50, op: 'linear', label: '2u', inputIds: ['sin2'] },
      { id: 'sq2', x: 85, y: 50, op: 'square', label: 'u²', inputIds: ['lin2'] },
      { id: 'out', x: 95, y: 50, op: 'output', label: 'h(x)', inputIds: ['sq2'] },
    ],
  };
}

const PRESET_GRAPHS: Record<string, () => Graph> = {
  single: buildSingleGraph,
  double: buildDoubleGraph,
  'mini-net': buildMiniNetGraph,
  multipath: buildMultipathGraph,
  deep: buildDeepGraph,
};

// ─────────────────────────────────────────────────────────────────────────
// Forward evaluation
// ─────────────────────────────────────────────────────────────────────────

function evalNode(op: string, inputs: number[]): number {
  const u = inputs[0] ?? 0;
  const v = inputs[1] ?? 0;
  switch (op) {
    case 'input': return u;
    case 'param': return u;
    case 'output': return u;
    case 'square': return u * u;
    case 'sin': return Math.sin(u);
    case 'exp': return Math.exp(Math.min(u, 5));
    case 'linear': return 3 * u + 1;
    case 'power4': return Math.pow(u, 4);
    case 'mul': return u * v;
    case 'add': return u + v;
    case 'sub': return u - v;
    default: return u;
  }
}

function localGrad(op: string, inputs: number[], outGrad: number, inputIdx: number): number {
  const u = inputs[0] ?? 0;
  const v = inputs[1] ?? 0;
  switch (op) {
    case 'square': return outGrad * 2 * u;
    case 'sin': return outGrad * Math.cos(u);
    case 'exp': return outGrad * Math.exp(Math.min(u, 5));
    case 'linear': return outGrad * 3;
    case 'power4': return outGrad * 4 * Math.pow(u, 3);
    case 'mul': return outGrad * (inputIdx === 0 ? v : u);
    case 'add': return outGrad;
    case 'sub': return outGrad * (inputIdx === 0 ? 1 : -1);
    case 'output': return outGrad;
    default: return outGrad;
  }
}

function runForward(nodes: GraphNode[], xVal: number, wVal: number): Record<string, number> {
  const vals: Record<string, number> = {};
  // topological order (nodes are already ordered)
  for (const n of nodes) {
    if (n.op === 'input') { vals[n.id] = n.id === 'y' ? 1 : xVal; continue; }
    if (n.op === 'param') { vals[n.id] = wVal; continue; }
    const inputVals = n.inputIds.map(id => vals[id] ?? 0);
    vals[n.id] = evalNode(n.op, inputVals);
  }
  return vals;
}

function runBackward(nodes: GraphNode[], forwardVals: Record<string, number>): Record<string, number> {
  const grads: Record<string, number> = {};
  // init output gradient
  const outNode = nodes[nodes.length - 1];
  grads[outNode.id] = 1;

  // reverse topological
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    const outGrad = grads[n.id] ?? 0;
    for (let j = 0; j < n.inputIds.length; j++) {
      const inId = n.inputIds[j];
      const inputVals = n.inputIds.map(id => forwardVals[id] ?? 0);
      const g = localGrad(n.op, inputVals, outGrad, j);
      grads[inId] = (grads[inId] ?? 0) + g;
    }
  }
  return grads;
}

function localDerivLabel(op: string): string {
  switch (op) {
    case 'square': return '2u';
    case 'sin': return 'cos(u)';
    case 'exp': return 'eᵘ';
    case 'linear': return '3';
    case 'power4': return '4u³';
    case 'mul': return 'v (wrt u), u (wrt v)';
    case 'add': return '1';
    case 'sub': return '1 / -1';
    default: return '1';
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Colours
// ─────────────────────────────────────────────────────────────────────────

const OP_COLORS: Record<string, string> = {
  input: '#6366f1',
  param: '#a855f7',
  output: '#34d399',
  square: '#fb923c',
  sin: '#f43f5e',
  exp: '#0ea5e9',
  linear: '#8b5cf6',
  power4: '#f59e0b',
  mul: '#10b981',
  add: '#22d3ee',
  sub: '#f87171',
};

// ─────────────────────────────────────────────────────────────────────────
// SVG ComputationGraph
// ─────────────────────────────────────────────────────────────────────────

const W = 800, H = 320;

function svgX(pct: number) { return (pct / 100) * W; }
function svgY(pct: number) { return (pct / 100) * H; }

export interface ComputationGraphProps {
  graphId?: string;
  showForward?: boolean;
  showBackward?: boolean;
  showStoredValues?: boolean;
  showGradientValues?: boolean;
  showEdgeDerivatives?: boolean;
  showWeightGradients?: boolean;
  showAllGradients?: boolean;
  showPaths?: boolean;
  animateForward?: boolean;
  animateBackward?: boolean;
  interactive?: boolean;
  allowBuild?: boolean;
}

export function ComputationGraph({
  graphId = 'single',
  showForward = true,
  showBackward = false,
  showGradientValues = true,
  showEdgeDerivatives = false,
  animateForward = false,
  animateBackward = false,
  interactive = true,
  showPaths = false,
  allowBuild = false,
}: ComputationGraphProps) {
  // ── Build mode ──
  if (allowBuild) return <GraphBuilder />;

  const graphDef = useMemo(() => (PRESET_GRAPHS[graphId] ?? buildSingleGraph)(), [graphId]);
  const nodes = graphDef.nodes;

  const [x, setX] = useState(1.0);
  const [w, setW] = useState(0.5);
  const [forwardStep, setForwardStep] = useState<number | null>(null);
  const [backwardStep, setBackwardStep] = useState<number | null>(null);
  const [isForwardPlaying, setIsForwardPlaying] = useState(false);
  const [isBackwardPlaying, setIsBackwardPlaying] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null); // 'srcId|tgtId'
  const [showingPaths, setShowingPaths] = useState(false);

  const forwardVals = useMemo(() => runForward(nodes, x, w), [nodes, x, w]);
  const gradVals = useMemo(() => runBackward(nodes, forwardVals), [nodes, forwardVals]);

  // Animated forward
  useEffect(() => {
    if (!isForwardPlaying) return;
    if (forwardStep === null || forwardStep >= nodes.length - 1) {
      setIsForwardPlaying(false);
      return;
    }
    const t = setTimeout(() => setForwardStep(s => (s ?? 0) + 1), 600);
    return () => clearTimeout(t);
  }, [isForwardPlaying, forwardStep, nodes.length]);

  // Animated backward
  useEffect(() => {
    if (!isBackwardPlaying) return;
    if (backwardStep === null || backwardStep >= nodes.length - 1) {
      setIsBackwardPlaying(false);
      return;
    }
    const t = setTimeout(() => setBackwardStep(s => (s ?? 0) + 1), 600);
    return () => clearTimeout(t);
  }, [isBackwardPlaying, backwardStep, nodes.length]);

  const startForward = () => { setForwardStep(0); setBackwardStep(null); setIsForwardPlaying(true); };
  const startBackward = () => { setBackwardStep(0); setIsBackwardPlaying(true); };
  const resetAll = () => { setForwardStep(null); setBackwardStep(null); setIsForwardPlaying(false); setIsBackwardPlaying(false); };

  // Path colors for 'showPaths' mode — each path from x gets a distinct colour
  const pathColors = ['#34d399', '#f59e0b', '#f43f5e', '#0ea5e9'];
  // Build paths: for each node, trace back to input. Simple: just color each branch
  function getEdgePath(srcId: string, tgtId: string): number | null {
    if (!showingPaths) return null;
    // For multipath graph: path 0 goes through 'sq', path 1 goes through 'sin'
    const node = nodes.find(n => n.id === tgtId);
    if (!node) return null;
    // Walk back to find which branch from x this edge is on
    function branch(id: string, _depth = 0): number {
      if (id === 'x' || id === 'add') return -1;
      const n = nodes.find(n => n.id === id);
      if (!n || n.inputIds.length === 0) return -1;
      if (n.inputIds.includes('x')) {
        // direct child of x — this determines path index
        return nodes.filter(nd => nd.inputIds.includes('x')).indexOf(n);
      }
      return branch(n.inputIds[0], _depth + 1);
    }
    const b = branch(tgtId);
    return b >= 0 ? b : null;
  }

  // Which nodes are "lit" during animation
  const litForward = forwardStep !== null ? new Set(nodes.slice(0, forwardStep + 1).map(n => n.id)) : new Set(nodes.map(n => n.id));
  const litBackward = backwardStep !== null ? new Set(nodes.slice(nodes.length - 1 - backwardStep).map(n => n.id)) : new Set<string>();

  const nodeRadius = 26;

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0e27', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10, padding: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>{graphDef.description}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {animateForward && <Btn color="#6366f1" onClick={startForward}>▶ Forward</Btn>}
          {animateBackward && showBackward && <Btn color="#fb923c" onClick={startBackward}>◀ Backward</Btn>}
          {showPaths && (
            <Btn color={showingPaths ? '#34d399' : '#334155'} onClick={() => setShowingPaths(p => !p)}>
              {showingPaths ? '✓ Paths On' : 'Highlight Paths'}
            </Btn>
          )}
          <Btn color="#334155" onClick={resetAll}>↺ Reset</Btn>
        </div>
      </div>

      {/* SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ flex: 1, width: '100%', minHeight: 0 }}>
        {/* Edges */}
        {nodes.map(n =>
          n.inputIds.map(inId => {
            const src = nodes.find(nd => nd.id === inId);
            if (!src) return null;
            const x1 = svgX(src.x), y1 = svgY(src.y);
            const x2 = svgX(n.x), y2 = svgY(n.y);
            const isFwdActive = litForward.has(inId) && litForward.has(n.id);
            const isBwdActive = litBackward.has(inId) && litBackward.has(n.id);
            const edgeGrad = gradVals[inId];

            return (
              <g key={`${inId}-${n.id}`}>
                {/* Wide invisible hit area for hover */}
                <line
                  x1={x1 + nodeRadius} y1={y1}
                  x2={x2 - nodeRadius} y2={y2}
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredEdge(`${inId}|${n.id}`)}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
                {/* Visible edge line */}
                {(() => {
                  const edgeKey = `${inId}|${n.id}`;
                  const isHoveredEdg = hoveredEdge === edgeKey;
                  const pathIdx = getEdgePath(inId, n.id);
                  const pathColor = pathIdx !== null ? pathColors[pathIdx % pathColors.length] : null;
                  return (
                    <line
                      x1={x1 + nodeRadius} y1={y1}
                      x2={x2 - nodeRadius} y2={y2}
                      stroke={
                        pathColor ? pathColor
                        : isHoveredEdg ? '#fbbf24'
                        : isBwdActive && showBackward ? '#fb923c'
                        : isFwdActive ? '#4f7aff'
                        : '#1e293b'
                      }
                      strokeWidth={isHoveredEdg ? 3.5 : isBwdActive || isFwdActive ? 2.5 : 1.5}
                      strokeDasharray={isBwdActive ? '6,3' : 'none'}
                      onMouseEnter={() => setHoveredEdge(edgeKey)}
                      onMouseLeave={() => setHoveredEdge(null)}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                })()}
                {/* Edge hover tooltip: local derivative + value */}
                {hoveredEdge === `${inId}|${n.id}` && (
                  <foreignObject
                    x={(x1 + x2) / 2 - 60}
                    y={(y1 + y2) / 2 - 38}
                    width={130}
                    height={52}
                  >
                    <div style={{ background: '#1e2940', border: '1px solid #fbbf2466', borderRadius: 6, padding: '4px 8px', fontSize: 10, color: '#e2e8f0', fontFamily: 'monospace' }}>
                      <div style={{ color: '#fbbf24', fontWeight: 700 }}>local∂: {localDerivLabel(n.op)}</div>
                      {forwardVals[inId] !== undefined && (
                        <div style={{ color: '#6366f1' }}>value: {forwardVals[inId].toFixed(4)}</div>
                      )}
                    </div>
                  </foreignObject>
                )}
                {/* Edge label: forward value */}
                {showForward && isFwdActive && forwardVals[inId] !== undefined && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="#6366f1"
                    fontSize={10}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {forwardVals[inId].toFixed(3)}
                  </text>
                )}
                {/* Edge label: gradient */}
                {showBackward && showGradientValues && isBwdActive && edgeGrad !== undefined && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 + 16}
                    fill="#fb923c"
                    fontSize={10}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    ∂={edgeGrad.toFixed(3)}
                  </text>
                )}
                {/* Local derivative label on edge */}
                {showEdgeDerivatives && isFwdActive && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 + 16}
                    fill="#fbbf24"
                    fontSize={9}
                    textAnchor="middle"
                    fontFamily="monospace"
                    opacity={0.7}
                  >
                    {localDerivLabel(n.op)}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Nodes */}
        {nodes.map(n => {
          const cx = svgX(n.x), cy = svgY(n.y);
          const color = OP_COLORS[n.op] ?? '#6366f1';
          const isFwd = litForward.has(n.id);
          const isBwd = litBackward.has(n.id) && showBackward;
          const isHovered = hoveredNode === n.id;
          const fwdVal = forwardVals[n.id];
          const bwdVal = gradVals[n.id];

          return (
            <g key={n.id}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Glow */}
              {(isFwd || isBwd) && (
                <circle cx={cx} cy={cy} r={nodeRadius + 8} fill={isBwd ? '#fb923c22' : color + '22'} />
              )}
              {/* Circle */}
              <circle
                cx={cx} cy={cy}
                r={nodeRadius}
                fill={isFwd ? color + '33' : '#1e293b'}
                stroke={isBwd ? '#fb923c' : isFwd ? color : '#334155'}
                strokeWidth={isFwd || isBwd ? 2 : 1.5}
              />
              {/* Op label */}
              <text cx={cx} cy={cy} x={cx} y={cy + 4} textAnchor="middle" fill={isFwd ? color : '#64748b'} fontSize={11} fontWeight={700} fontFamily="monospace">
                {n.label}
              </text>

              {/* Value below node (forward) */}
              {showForward && isFwd && fwdVal !== undefined && (
                <text x={cx} y={cy + nodeRadius + 14} textAnchor="middle" fill="#6366f1" fontSize={10} fontFamily="monospace">
                  {Number.isFinite(fwdVal) ? fwdVal.toFixed(3) : '∞'}
                </text>
              )}

              {/* Gradient above node (backward) */}
              {showBackward && showGradientValues && isBwd && bwdVal !== undefined && (
                <text x={cx} y={cy - nodeRadius - 6} textAnchor="middle" fill="#fb923c" fontSize={10} fontFamily="monospace" fontWeight={700}>
                  ∂={bwdVal.toFixed(3)}
                </text>
              )}

              {/* Hover tooltip */}
              {isHovered && (
                <foreignObject x={cx + nodeRadius + 4} y={cy - 20} width={150} height={50}>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', fontSize: 10, color: '#e2e8f0', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    <div style={{ color }}>local∂: {localDerivLabel(n.op)}</div>
                    {fwdVal !== undefined && <div style={{ color: '#6366f1' }}>val: {fwdVal.toFixed(4)}</div>}
                  </div>
                </foreignObject>
              )}

              {/* Legend: forward / backward indicator */}
              {isBwd && showBackward && (
                <circle cx={cx + nodeRadius - 5} cy={cy - nodeRadius + 5} r={5} fill="#fb923c" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Controls */}
      {interactive && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: '0.72rem', color: '#64748b' }}>x = {x.toFixed(2)}</label>
            <input type="range" min={graphDef.xRange[0]} max={graphDef.xRange[1]} step={0.05} value={x}
              onChange={e => { setX(Number(e.target.value)); resetAll(); }}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
          {nodes.some(n => n.op === 'param') && (
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: '0.72rem', color: '#a855f7' }}>w = {w.toFixed(2)}</label>
              <input type="range" min={-2} max={2} step={0.05} value={w}
                onChange={e => { setW(Number(e.target.value)); resetAll(); }}
                style={{ width: '100%', accentColor: '#a855f7' }} />
            </div>
          )}
          {/* Show final gradient for x */}
          {showBackward && (
            <div style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 8, padding: '4px 12px', fontFamily: 'monospace', fontSize: '0.82rem' }}>
              ∂L/∂x = <span style={{ color: '#fb923c', fontWeight: 700 }}>{(gradVals['x'] ?? 0).toFixed(4)}</span>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, fontSize: '0.68rem', color: '#475569', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} /> Forward values
        </span>
        {showBackward && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb923c', display: 'inline-block' }} /> Gradients (backward)
          </span>
        )}
        <span>Hover nodes or edges for local derivative</span>
      </div>
    </div>
  );
}

function Btn({ children, color, onClick }: { children: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '4px 12px', background: color + '33', border: `1px solid ${color}55`, borderRadius: 6, color: '#e2e8f0', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-heading)' }}>
      {children}
    </button>
  );
}
