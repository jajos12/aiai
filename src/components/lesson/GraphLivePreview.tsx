'use client';

import { useMemo, useState, useEffect } from 'react';
import { Mafs, Coordinates, Plot } from 'mafs';
import 'mafs/core.css';
import type { LessonGraphSpec } from '@/core/types';
import { tryCompileGraphY } from '@/lib/math/compileGraphExpression';

function injectParams(expr: string, vars: Record<string, number>): string {
  let out = expr;
  for (const [k, v] of Object.entries(vars)) {
    const safeKey = k.replace(/[^a-zA-Z0-9_]/g, '');
    if (!safeKey) continue;
    const re = new RegExp(`\\b${safeKey}\\b`, 'g');
    out = out.replace(re, String(v));
  }
  return out;
}

interface GraphLivePreviewProps {
  graphSpec: LessonGraphSpec;
  valueById?: Record<string, number>;
  onVariableChange?: (id: string, value: number) => void;
  readOnlySliders?: boolean;
  /** Hide injected expression line (cleaner learner view) */
  compact?: boolean;
}

export default function GraphLivePreview({
  graphSpec,
  valueById: controlled,
  onVariableChange,
  readOnlySliders,
  compact,
}: GraphLivePreviewProps) {
  const defaults = useMemo(() => {
    const m: Record<string, number> = {};
    for (const v of graphSpec.variables ?? []) {
      m[v.id] = v.default;
    }
    return m;
  }, [graphSpec.variables]);

  const [local, setLocal] = useState<Record<string, number>>(defaults);

  useEffect(() => {
    setLocal(controlled ?? defaults);
  }, [controlled, defaults]);

  const merged = controlled ?? local;

  const fn = useMemo(() => {
    const injected = injectParams(graphSpec.expression, merged);
    return tryCompileGraphY(injected);
  }, [graphSpec.expression, merged]);

  const xMin = graphSpec.xMin ?? -6;
  const xMax = graphSpec.xMax ?? 6;
  const yMin = graphSpec.yMin ?? -4;
  const yMax = graphSpec.yMax ?? 4;

  const setVal = (id: string, value: number) => {
    if (onVariableChange) onVariableChange(id, value);
    else setLocal((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-3">
      {!fn && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Could not compile expression. Use x as the horizontal variable; optional parameters (a, b, …) with sliders below.
        </p>
      )}
      {(graphSpec.variables ?? []).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {(graphSpec.variables ?? []).map((v) => (
            <label key={v.id} className="flex min-w-[140px] flex-col gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{v.label}</span>
              <input
                type="range"
                min={v.min}
                max={v.max}
                step={v.step}
                value={merged[v.id] ?? v.default}
                disabled={readOnlySliders}
                onChange={(e) => setVal(v.id, Number(e.target.value))}
                className="w-full"
              />
            </label>
          ))}
        </div>
      )}
      <div className="h-64 w-full overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
        {fn ? (
          <Mafs preserveAspectRatio="contain" viewBox={{ x: [xMin, xMax], y: [yMin, yMax] }} pan={false} zoom={false}>
            <Coordinates.Cartesian subdivisions={2} />
            <Plot.OfX y={(x) => fn(x)} />
          </Mafs>
        ) : (
          <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No graph
          </div>
        )}
      </div>
      {!compact && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Expression:{' '}
          <code className="rounded bg-black/5 px-1 dark:bg-white/10">{injectParams(graphSpec.expression, merged)}</code>
        </p>
      )}
    </div>
  );
}
