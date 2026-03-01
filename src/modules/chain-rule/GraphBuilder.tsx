'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

type OpType = 'input' | 'sin' | 'exp' | 'square' | 'linear' | 'add' | 'mul' | 'output';

interface BNode {
  id: string;
  x: number; // SVG px
  y: number;
  op: OpType;
  label: string;
}

interface BEdge {
  from: string;
  to: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Op definitions
// ─────────────────────────────────────────────────────────────────────────

const OPS: { op: OpType; label: string; color: string; hint: string }[] = [
  { op: 'input', label: 'x', color: '#6366f1', hint: 'Input variable (x)' },
  { op: 'square', label: 'x²', color: '#fb923c', hint: 'Square: u²' },
  { op: 'sin', label: 'sin', color: '#f43f5e', hint: 'Sine: sin(u)' },
  { op: 'exp', label: 'eˣ', color: '#0ea5e9', hint: 'Exponential: eˣ' },
  { op: 'linear', label: '3u+1', color: '#8b5cf6', hint: 'Linear: 3u+1' },
  { op: 'add', label: '+', color: '#22d3ee', hint: 'Add two inputs' },
  { op: 'mul', label: '×', color: '#10b981', hint: 'Multiply two inputs' },
  { op: 'output', label: 'out', color: '#34d399', hint: 'Final output node' },
];

const OP_COLORS: Record<string, string> = Object.fromEntries(OPS.map(o => [o.op, o.color]));

// ─────────────────────────────────────────────────────────────────────────
// Forward / Backward eval
// ─────────────────────────────────────────────────────────────────────────

function evalNode(op: OpType, inputs: number[]): number {
  const u = inputs[0] ?? 0;
  const v = inputs[1] ?? 0;
  switch (op) {
    case 'input': return u;
    case 'output': return u;
    case 'square': return u * u;
    case 'sin': return Math.sin(u);
    case 'exp': return Math.exp(Math.min(u, 6));
    case 'linear': return 3 * u + 1;
    case 'add': return u + v;
    case 'mul': return u * v;
    default: return u;
  }
}

function localGrad(op: OpType, inputs: number[], outGrad: number, idx: number): number {
  const u = inputs[0] ?? 0;
  const v = inputs[1] ?? 0;
  switch (op) {
    case 'square': return outGrad * 2 * u;
    case 'sin': return outGrad * Math.cos(u);
    case 'exp': return outGrad * Math.exp(Math.min(u, 6));
    case 'linear': return outGrad * 3;
    case 'add': return outGrad;
    case 'mul': return outGrad * (idx === 0 ? v : u);
    case 'output': return outGrad;
    default: return outGrad;
  }
}

function localDerivStr(op: OpType): string {
  switch (op) {
    case 'square': return '2u';
    case 'sin': return 'cos(u)';
    case 'exp': return 'eᵘ';
    case 'linear': return '3';
    case 'add': return '1';
    case 'mul': return 'v, u';
    case 'output': return '1';
    default: return '—';
  }
}

function topoSort(nodes: BNode[], edges: BEdge[]): BNode[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  for (const n of nodes) { inDegree[n.id] = 0; adj[n.id] = []; }
  for (const e of edges) { adj[e.from].push(e.to); inDegree[e.to]++; }
  const queue = nodes.filter(n => inDegree[n.id] === 0);
  const result: BNode[] = [];
  while (queue.length > 0) {
    const n = queue.shift()!;
    result.push(n);
    for (const next of adj[n.id]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(nodes.find(nd => nd.id === next)!);
    }
  }
  return result;
}

function runForward(nodes: BNode[], edges: BEdge[], xVal: number): Record<string, number> {
  const vals: Record<string, number> = {};
  const sorted = topoSort(nodes, edges);
  for (const n of sorted) {
    if (n.op === 'input') { vals[n.id] = xVal; continue; }
    const inputIds = edges.filter(e => e.to === n.id).map(e => e.from);
    const inputVals = inputIds.map(id => vals[id] ?? 0);
    vals[n.id] = evalNode(n.op, inputVals);
  }
  return vals;
}

function runBackward(nodes: BNode[], edges: BEdge[], fwdVals: Record<string, number>): Record<string, number> {
  const sorted = topoSort(nodes, edges);
  const grads: Record<string, number> = {};
  const outNode = sorted[sorted.length - 1];
  if (!outNode) return grads;
  grads[outNode.id] = 1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const n = sorted[i];
    const outGrad = grads[n.id] ?? 0;
    const inputIds = edges.filter(e => e.to === n.id).map(e => e.from);
    const inputVals = inputIds.map(id => fwdVals[id] ?? 0);
    for (let j = 0; j < inputIds.length; j++) {
      const g = localGrad(n.op, inputVals, outGrad, j);
      grads[inputIds[j]] = (grads[inputIds[j]] ?? 0) + g;
    }
  }
  return grads;
}

// ─────────────────────────────────────────────────────────────────────────
// GraphBuilder component
// ─────────────────────────────────────────────────────────────────────────

const W = 720, H = 280;
const R = 26; // node radius
let _nodeCounter = 0;

export function GraphBuilder() {
  const [nodes, setNodes] = useState<BNode[]>([
    { id: 'n0', x: 80, y: H / 2, op: 'input', label: 'x' },
  ]);
  const [edges, setEdges] = useState<BEdge[]>([]);
  const [selectedOp, setSelectedOp] = useState<OpType>('square');
  const [connecting, setConnecting] = useState<string | null>(null); // src node id
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [x, setX] = useState(1.0);
  const [showPass, setShowPass] = useState<'none' | 'forward' | 'backward'>('none');
  const svgRef = useRef<SVGSVGElement>(null);

  const fwdVals = useMemo(() => runForward(nodes, edges, x), [nodes, edges, x]);
  const bwdVals = useMemo(() => runBackward(nodes, edges, fwdVals), [nodes, edges, fwdVals]);

  // Add a node at a position (right of last node by default)
  const addNode = useCallback(() => {
    _nodeCounter++;
    const lastX = nodes.length > 0 ? Math.max(...nodes.map(n => n.x)) : 80;
    const newNode: BNode = {
      id: `n${_nodeCounter}`,
      x: Math.min(lastX + 110, W - 60),
      y: H / 2 + (Math.random() - 0.5) * 80,
      op: selectedOp,
      label: OPS.find(o => o.op === selectedOp)?.label ?? selectedOp,
    };
    setNodes(prev => [...prev, newNode]);
    setShowPass('none');
  }, [nodes, selectedOp]);

  // SVG click: place node or connect
  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    // Check if clicked near any node
    const hit = nodes.find(n => Math.hypot(n.x - px, n.y - py) < R + 6);
    if (hit) {
      if (connecting) {
        if (connecting !== hit.id) {
          setEdges(prev => {
            // prevent duplicate edges
            if (prev.some(e => e.from === connecting && e.to === hit.id)) return prev;
            return [...prev, { from: connecting, to: hit.id }];
          });
        }
        setConnecting(null);
      } else {
        setConnecting(hit.id);
      }
    } else {
      setConnecting(null);
    }
  }, [nodes, connecting]);

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (connecting === id) setConnecting(null);
    setShowPass('none');
  };

  const deleteEdge = (from: string, to: string) => {
    setEdges(prev => prev.filter(e => !(e.from === from && e.to === to)));
    setShowPass('none');
  };

  const reset = () => {
    _nodeCounter = 0;
    setNodes([{ id: 'n0', x: 80, y: H / 2, op: 'input', label: 'x' }]);
    setEdges([]);
    setConnecting(null);
    setShowPass('none');
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0e27', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8, padding: 12, fontSize: '0.8rem' }}>
      {/* ─── Toolbar ─── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '0.7rem', marginRight: 2 }}>Add node:</span>
        {OPS.map(o => (
          <button
            key={o.op}
            onClick={() => setSelectedOp(o.op)}
            title={o.hint}
            style={{
              padding: '3px 9px',
              borderRadius: 6,
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              cursor: 'pointer',
              background: selectedOp === o.op ? o.color + '44' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedOp === o.op ? o.color : 'rgba(255,255,255,0.1)'}`,
              color: selectedOp === o.op ? o.color : '#94a3b8',
              transition: 'all 0.15s',
            }}
          >
            {o.label}
          </button>
        ))}
        <button
          onClick={addNode}
          style={{ padding: '3px 12px', borderRadius: 6, fontSize: '0.72rem', background: '#6366f133', border: '1px solid #6366f155', color: '#a5b4fc', cursor: 'pointer' }}
        >
          + Add
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowPass('forward')} style={runBtn('#6366f1')}>▶ Forward</button>
        <button onClick={() => setShowPass('backward')} style={runBtn('#fb923c')}>◀ Backward</button>
        <button onClick={reset} style={runBtn('#334155')}>↺ Reset</button>
      </div>

      {/* ─── Instructions ─── */}
      <div style={{ fontSize: '0.68rem', color: '#475569', lineHeight: 1.4 }}>
        {connecting
          ? <span style={{ color: '#fbbf24' }}>⚡ Now click a target node to draw an edge from <strong style={{ color: '#fbbf24' }}>{nodes.find(n => n.id === connecting)?.label}</strong>. Click empty space to cancel.</span>
          : '① Pick an op type → click + Add → ② Click a node to start an edge → click another node to connect. Right-click a node to delete it.'}
      </div>

      {/* ─── SVG Canvas ─── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ flex: 1, width: '100%', minHeight: 0, cursor: connecting ? 'crosshair' : 'default', background: '#0f172a', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}
        onClick={handleSvgClick}
      >
        {/* Edges */}
        {edges.map(e => {
          const src = nodes.find(n => n.id === e.from);
          const tgt = nodes.find(n => n.id === e.to);
          if (!src || !tgt) return null;
          const edgeKey = `${e.from}|${e.to}`;
          const isHov = hoveredEdge === edgeKey;
          const grad = bwdVals[e.from];
          const fwdVal = fwdVals[e.from];
          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2;
          return (
            <g key={edgeKey}>
              {/* Hit area */}
              <line x1={src.x + R} y1={src.y} x2={tgt.x - R} y2={tgt.y}
                stroke="transparent" strokeWidth={16}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredEdge(edgeKey)}
                onMouseLeave={() => setHoveredEdge(null)}
                onClick={ev => { ev.stopPropagation(); deleteEdge(e.from, e.to); }}
              />
              {/* Line */}
              <line x1={src.x + R} y1={src.y} x2={tgt.x - R} y2={tgt.y}
                stroke={
                  showPass === 'backward' ? '#fb923c'
                  : showPass === 'forward' ? '#4f7aff'
                  : isHov ? '#f87171' : '#334155'
                }
                strokeWidth={isHov ? 3 : 2}
                markerEnd="url(#arrow)"
                onMouseEnter={() => setHoveredEdge(edgeKey)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              {/* Forward value */}
              {showPass === 'forward' && fwdVal !== undefined && (
                <text x={midX} y={midY - 8} fill="#818cf8" fontSize={9} textAnchor="middle" fontFamily="monospace">
                  {fwdVal.toFixed(3)}
                </text>
              )}
              {/* Backward grad */}
              {showPass === 'backward' && grad !== undefined && (
                <text x={midX} y={midY + 14} fill="#fb923c" fontSize={9} textAnchor="middle" fontFamily="monospace">
                  ∂={grad.toFixed(3)}
                </text>
              )}
              {/* Edge local deriv on hover */}
              {isHov && (
                <text x={midX} y={midY - 8} fill="#fbbf24" fontSize={9} textAnchor="middle" fontFamily="monospace">
                  ✕ delete
                </text>
              )}
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#334155" />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map(n => {
          const color = OP_COLORS[n.op] ?? '#6366f1';
          const isConnSrc = connecting === n.id;
          const fwdVal = fwdVals[n.id];
          const bwdVal = bwdVals[n.id];
          return (
            <g key={n.id} style={{ cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); if (!connecting) setConnecting(n.id); else { if (connecting !== n.id) { setEdges(prev => prev.some(ee => ee.from === connecting && ee.to === n.id) ? prev : [...prev, { from: connecting, to: n.id }]); } setConnecting(null); } }}
              onContextMenu={e => { e.preventDefault(); deleteNode(n.id); }}
            >
              {/* Selection ring */}
              {isConnSrc && <circle cx={n.x} cy={n.y} r={R + 7} fill="none" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5,3" />}
              {/* Glow */}
              {(showPass !== 'none') && <circle cx={n.x} cy={n.y} r={R + 6} fill={color + '22'} />}
              {/* Circle */}
              <circle cx={n.x} cy={n.y} r={R}
                fill={color + '25'}
                stroke={isConnSrc ? '#fbbf24' : color}
                strokeWidth={isConnSrc ? 2.5 : 2}
              />
              {/* Label */}
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill={color} fontSize={11} fontWeight={700} fontFamily="monospace">{n.label}</text>
              {/* Forward value */}
              {showPass === 'forward' && fwdVal !== undefined && (
                <text x={n.x} y={n.y + R + 14} textAnchor="middle" fill="#818cf8" fontSize={9} fontFamily="monospace">
                  {fwdVal.toFixed(3)}
                </text>
              )}
              {/* Backward grad */}
              {showPass === 'backward' && bwdVal !== undefined && (
                <text x={n.x} y={n.y - R - 6} textAnchor="middle" fill="#fb923c" fontSize={9} fontFamily="monospace" fontWeight={700}>
                  ∂={bwdVal.toFixed(3)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* ─── Bottom controls ─── */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={{ fontSize: '0.7rem', color: '#64748b' }}>x = {x.toFixed(2)}</label>
          <input type="range" min={-2} max={2} step={0.05} value={x}
            onChange={e => { setX(Number(e.target.value)); setShowPass('none'); }}
            style={{ width: '100%', accentColor: '#6366f1' }} />
        </div>
        {showPass !== 'none' && (() => {
          const inputNode = nodes.find(n => n.op === 'input');
          const grad = inputNode ? bwdVals[inputNode.id] : undefined;
          return grad !== undefined ? (
            <div style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 8, padding: '4px 12px', fontFamily: 'monospace', fontSize: '0.82rem' }}>
              ∂out/∂x = <span style={{ color: '#fb923c', fontWeight: 700 }}>{grad.toFixed(4)}</span>
            </div>
          ) : null;
        })()}
        <div style={{ fontSize: '0.68rem', color: '#475569' }}>
          {nodes.length} nodes · {edges.length} edges · Right-click node to delete
        </div>
      </div>
    </div>
  );
}

function runBtn(color: string): React.CSSProperties {
  return {
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: '0.72rem',
    background: color + '33',
    border: `1px solid ${color}55`,
    color: '#e2e8f0',
    cursor: 'pointer',
    fontFamily: 'monospace',
  };
}
