'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getModule } from '@/content/registry';
import { useProgress } from '@/hooks/useProgress';
import { VectorTransform } from '@/components/visualizations/VectorTransform';
import { MatrixTransform } from '@/components/visualizations/MatrixTransform';
import type { Module } from '@/types/curriculum';

export default function PlaygroundPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;
  const { updateModule } = useProgress();

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic parameter values — keyed by param.id
  const [paramValues, setParamValues] = useState<Record<string, number | boolean>>({});

  useEffect(() => {
    setLoading(true);
    getModule(moduleId).then((mod) => {
      setModuleData(mod);
      if (!mod) { setLoading(false); return; }
      // Initialize param values from defaults
      const defaults: Record<string, number | boolean> = {};
      mod.playground.parameters.forEach((p) => {
        if (typeof p.default === 'number' || typeof p.default === 'boolean') {
          defaults[p.id] = p.default;
        }
      });
      setParamValues(defaults);
      setLoading(false);
    });
  }, [moduleId]);

  // Mark playground as visited
  useEffect(() => {
    if (!loading) {
      updateModule(tierId, moduleId, (mod) => ({
        ...mod,
        playgroundVisited: true,
      }));
    }
  }, [loading, tierId, moduleId, updateModule]);

  const setParam = useCallback((id: string, value: number | boolean) => {
    setParamValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  if (loading || !moduleData) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-base)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-heading)',
        }}
      >
        Loading playground...
      </div>
    );
  }

  const basePath = `/tier/${tierId}/${moduleId}`;

  // Build VectorTransform props from paramValues
  const vizProps: Record<string, unknown> = {
    mode: 'interactive',
    draggable: true,
    showGrid: paramValues.showGrid ?? true,
    showCoordinates: paramValues.showCoordinates ?? true,
    showMagnitude: paramValues.showMagnitude ?? false,
    showAngle: paramValues.showAngle ?? false,
    showDotProduct: paramValues.showDotProduct ?? false,
    showProjection: paramValues.showProjection ?? false,
    showUnitVector: paramValues.showUnitVectors ?? false,
    scalarMultiplier: (paramValues.scalarMultiplier as number) ?? 1,
    vectors: [
      { x: 3, y: 2, color: '#6366f1', label: 'a' },
      ...(Number(paramValues.vectorCount ?? 2) >= 2
        ? [{ x: -1, y: 3, color: '#34d399', label: 'b' }]
        : []),
      ...(Number(paramValues.vectorCount ?? 2) >= 3
        ? [{ x: -2, y: -1, color: '#fb923c', label: 'c' }]
        : []),
      ...(Number(paramValues.vectorCount ?? 2) >= 4
        ? [{ x: 1, y: -2, color: '#f87171', label: 'd' }]
        : []),
    ],
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-base)',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => router.push(basePath)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              padding: '0.25rem 0',
            }}
          >
            ← {moduleData.title}
          </button>
          <span style={{ color: 'var(--border-default)' }}>/</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>
            🧪 Playground
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
        }}
      >
        {/* Canvas — full-height VectorTransform */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '1rem',
          }}
        >
          <div style={{ width: '100%', maxWidth: '600px', aspectRatio: '1', position: 'relative' }}>
            {moduleData.visualizationComponent === 'VectorTransform' ? (
              <VectorTransform {...vizProps} />
            ) : moduleData.visualizationComponent === 'MatrixTransform' ? (
              <MatrixTransform
                mode="custom"
                interactive
                showGrid={paramValues.showGrid as boolean ?? true}
                showTransformedGrid={paramValues.showTransformedGrid as boolean ?? true}
                showBasisVectors={paramValues.showBasisVectors as boolean ?? true}
                showTransformedBasis={paramValues.showTransformedBasis as boolean ?? true}
                showDeterminant={paramValues.showDeterminant as boolean ?? false}
                showEigenvectors={paramValues.showEigenvectors as boolean ?? false}
                showUnitCircle={paramValues.showUnitCircle as boolean ?? false}
                showTransformedCircle={paramValues.showTransformedCircle as boolean ?? false}
                showInverse={paramValues.showInverse as boolean ?? false}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧪</div>
                <p>Visualization coming soon — {moduleData.visualizationComponent}</p>
              </div>
            )}
          </div>
        </div>

        {/* Control panel (right sidebar) */}
        <div
          style={{
            width: '280px',
            background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-subtle)',
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Parameters
          </h3>

          {moduleData.playground.parameters.map((param) => (
            <div
              key={param.id}
              style={{
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: param.type === 'slider' || param.type === 'stepper' ? '0.375rem' : 0,
                }}
              >
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {param.label}
                </span>

                {/* Toggle */}
                {param.type === 'toggle' && (
                  <button
                    onClick={() => setParam(param.id, !paramValues[param.id])}
                    style={{
                      width: '36px',
                      height: '20px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      background: paramValues[param.id]
                        ? 'var(--accent)'
                        : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: paramValues[param.id] ? '18px' : '2px',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                )}

                {/* Stepper value */}
                {param.type === 'stepper' && (
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {String(paramValues[param.id] ?? param.default)}
                  </span>
                )}

                {/* Slider value */}
                {param.type === 'slider' && (
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {Number(paramValues[param.id] ?? param.default).toFixed(1)}
                  </span>
                )}
              </div>

              {/* Stepper buttons */}
              {param.type === 'stepper' && (
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    onClick={() =>
                      setParam(param.id, Math.max(param.min ?? 1, Number(paramValues[param.id] ?? param.default) - (param.step ?? 1)))
                    }
                    style={{
                      flex: 1,
                      padding: '0.25rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                    }}
                  >
                    −
                  </button>
                  <button
                    onClick={() =>
                      setParam(param.id, Math.min(param.max ?? 10, Number(paramValues[param.id] ?? param.default) + (param.step ?? 1)))
                    }
                    style={{
                      flex: 1,
                      padding: '0.25rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-hover)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                    }}
                  >
                    +
                  </button>
                </div>
              )}

              {/* Slider */}
              {param.type === 'slider' && (
                <input
                  type="range"
                  min={param.min ?? 0}
                  max={param.max ?? 1}
                  step={param.step ?? 0.1}
                  value={Number(paramValues[param.id] ?? param.default)}
                  onChange={(e) => setParam(param.id, parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              )}
            </div>
          ))}

          {/* Try This */}
          {moduleData.playground.tryThis && moduleData.playground.tryThis.length > 0 && (
            <>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0.5rem 0 0 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                💡 Try This
              </h3>
              {moduleData.playground.tryThis.map((item, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    paddingLeft: '0.75rem',
                    borderLeft: '2px solid var(--accent-soft)',
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
