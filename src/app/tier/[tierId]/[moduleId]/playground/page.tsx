'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getModule } from '@/core/registry';
import { useProgress } from '@/hooks/useProgress';
import type { Module } from '@/core/types';

// Graph presets available in the playground
const GRAPH_PRESETS = [
  { id: 'single', label: '(3x+2)⁴', description: 'Single chain' },
  { id: 'double', label: 'sin(eˣ²)', description: 'Two levels deep' },
  { id: 'mini-net', label: 'L=(wx−y)²', description: 'Mini neural net' },
  { id: 'multipath', label: 'x²+sin(x)', description: 'Fan-out paths' },
  { id: 'deep', label: 'Deep chain', description: '10 operations' },
];

export default function PlaygroundPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;
  const { updateModule } = useProgress();

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [paramValues, setParamValues] = useState<Record<string, number | boolean | string>>({});
  const [selectedGraph, setSelectedGraph] = useState('single');

  useEffect(() => {
    setLoading(true);
    getModule(moduleId).then(mod => {
      setModuleData(mod);
      if (!mod) { setLoading(false); return; }
      const defaults: Record<string, number | boolean | string> = {};
      mod.playground.parameters.forEach(p => {
        if (p.default !== undefined) defaults[p.id] = p.default as number | boolean | string;
      });
      setParamValues(defaults);
      setLoading(false);
    });
  }, [moduleId]);

  useEffect(() => {
    if (!loading) {
      updateModule(tierId, moduleId, mod => ({ ...mod, playgroundVisited: true }));
    }
  }, [loading, tierId, moduleId, updateModule]);

  const setParam = useCallback((id: string, value: number | boolean | string) => {
    setParamValues(prev => ({ ...prev, [id]: value }));
  }, []);

  if (loading || !moduleData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        Loading playground…
      </div>
    );
  }

  const isChainRule = moduleId === 'chain-rule';
  const vizProps = isChainRule
    ? { ...paramValues, component: 'ComputationGraph', graphId: selectedGraph, showForward: true, showBackward: true, showEdgeDerivatives: paramValues.showEdgeDerivatives ?? true, showGradientValues: paramValues.showGradientValues ?? true, showPaths: paramValues.showPaths ?? false, animateForward: paramValues.animateForward ?? true, animateBackward: paramValues.animateBackward ?? true, interactive: true }
    : { ...paramValues, interactive: true };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => router.push(`/tier/${tierId}/${moduleId}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}>
            ← {moduleData.title}
          </button>
          <span style={{ color: 'var(--border-default)' }}>/</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>🧪 Playground</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.4, textAlign: 'right', fontStyle: 'italic' }}>
          {moduleData.playground.description}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Visualization canvas */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', position: 'relative' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {moduleData.Visualization ? (
              <moduleData.Visualization {...vizProps as any} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '1rem' }}>
                <div style={{ fontSize: '4rem' }}>🧪</div>
                <p>Visualization coming soon — {moduleData.id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ width: '290px', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>

          {/* Chain-rule: graph preset picker */}
          {isChainRule && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Graph Preset</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {GRAPH_PRESETS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGraph(g.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 7, border: `1px solid ${selectedGraph === g.id ? 'rgba(99,102,241,0.6)' : 'var(--border-subtle)'}`, background: selectedGraph === g.id ? 'rgba(99,102,241,0.12)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: selectedGraph === g.id ? '#a5b4fc' : 'var(--text-primary)', fontWeight: selectedGraph === g.id ? 700 : 400 }}>{g.label}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{g.description}</div>
                    </div>
                    {selectedGraph === g.id && <span style={{ color: '#6366f1', fontSize: '0.8rem' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parameters */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Parameters</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {moduleData.playground.parameters.map(param => (
                <div key={param.id} style={{ padding: '0.625rem 0.75rem', borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: param.type === 'slider' || param.type === 'stepper' ? '0.4rem' : 0 }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{param.label}</span>

                    {/* Toggle */}
                    {param.type === 'toggle' && (
                      <button
                        onClick={() => setParam(param.id, !paramValues[param.id])}
                        style={{ width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative', background: paramValues[param.id] ? 'var(--accent)' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: paramValues[param.id] ? 18 : 2, transition: 'left 0.2s' }} />
                      </button>
                    )}

                    {/* Slider value */}
                    {param.type === 'slider' && (
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>
                        {Number(paramValues[param.id] ?? param.default).toFixed(2)}
                      </span>
                    )}
                    {/* Stepper value */}
                    {param.type === 'stepper' && (
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>
                        {String(paramValues[param.id] ?? param.default)}
                      </span>
                    )}
                  </div>

                  {/* Slider */}
                  {param.type === 'slider' && (
                    <input type="range" min={param.min ?? 0} max={param.max ?? 1} step={param.step ?? 0.01} value={Number(paramValues[param.id] ?? param.default)}
                      onChange={e => setParam(param.id, parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent)' }} />
                  )}

                  {/* Stepper */}
                  {param.type === 'stepper' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setParam(param.id, Math.max(param.min ?? 1, Number(paramValues[param.id] ?? param.default) - (param.step ?? 1)))}
                        style={{ flex: 1, padding: '0.25rem', border: '1px solid var(--border-subtle)', borderRadius: 5, background: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.825rem' }}>−</button>
                      <button onClick={() => setParam(param.id, Math.min(param.max ?? 100, Number(paramValues[param.id] ?? param.default) + (param.step ?? 1)))}
                        style={{ flex: 1, padding: '0.25rem', border: '1px solid var(--border-subtle)', borderRadius: 5, background: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.825rem' }}>+</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Try This */}
          {moduleData.playground.tryThis && moduleData.playground.tryThis.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>💡 Try This</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {moduleData.playground.tryThis.map((item, i) => (
                  <div key={i} style={{ padding: '0.5rem 0.75rem', borderRadius: 7, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderLeft: '3px solid rgba(99,102,241,0.5)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
