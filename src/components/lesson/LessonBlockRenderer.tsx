'use client';

import { useMemo, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { LessonBlock, LessonGraphSpec, LessonStudioState } from '@/core/types';
import dynamic from 'next/dynamic';

const GraphLivePreview = dynamic(() => import('@/components/lesson/GraphLivePreview'), { ssr: false });

interface LessonBlockRendererProps {
  studio: LessonStudioState;
  /** When false, interactive sliders on graph are disabled (static learner view) */
  interactive?: boolean;
}

export function LessonBlockRenderer({ studio, interactive = true }: LessonBlockRendererProps) {
  const blocks = studio.blocks ?? [];
  const graphSpec = studio.graphSpec;

  const defaults = useMemo(() => {
    const m: Record<string, number> = {};
    for (const v of graphSpec?.variables ?? []) {
      m[v.id] = v.default;
    }
    return m;
  }, [graphSpec?.variables]);

  const [vars, setVars] = useState<Record<string, number>>(defaults);

  if (!blocks.length && !(graphSpec?.expression ?? '').trim()) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Structured lesson
      </p>
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          block={block}
          graphSpec={graphSpec}
          variableValues={vars}
          onVariableChange={(id, v) => setVars((prev) => ({ ...prev, [id]: v }))}
          readOnlyGraph={!interactive}
        />
      ))}
      {!blocks.some((b) => b.type === 'graph') && graphSpec?.expression?.trim() && (
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Graph
          </p>
          <GraphLivePreview
            graphSpec={graphSpec}
            valueById={vars}
            onVariableChange={interactive ? (id, v) => setVars((p) => ({ ...p, [id]: v })) : undefined}
            readOnlySliders={!interactive}
            compact={!interactive}
          />
        </div>
      )}
    </div>
  );
}

function BlockItem({
  block,
  graphSpec,
  variableValues,
  onVariableChange,
  readOnlyGraph,
}: {
  block: LessonBlock;
  graphSpec?: LessonGraphSpec;
  variableValues: Record<string, number>;
  onVariableChange: (id: string, v: number) => void;
  readOnlyGraph: boolean;
}) {
  if (block.type === 'concept') {
    return (
      <section className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {block.title ? (
          <h4 className="mb-2 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {block.title}
          </h4>
        ) : null}
        <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {block.body}
        </div>
      </section>
    );
  }
  if (block.type === 'math') {
    let html = '';
    try {
      html = katex.renderToString(block.latex, { displayMode: true, throwOnError: false, trust: true });
    } catch {
      html = '';
    }
    return (
      <div className="overflow-x-auto rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <pre className="text-sm">{block.latex}</pre>}
      </div>
    );
  }
  if (block.type === 'explanation') {
    return (
      <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
        {block.body}
      </div>
    );
  }
  if (block.type === 'callout') {
    const border =
      block.tone === 'warning' ? 'rgba(234, 179, 8, 0.6)' : block.tone === 'tip' ? 'rgba(34, 197, 94, 0.55)' : 'var(--accent)';
    return (
      <div className="rounded-r-lg border-l-4 py-2 pl-4 text-sm" style={{ borderLeftColor: border, color: 'var(--text-primary)' }}>
        {block.body}
      </div>
    );
  }
  if (block.type === 'graph' && graphSpec?.expression?.trim()) {
    return (
      <div className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {block.caption ? (
          <p className="mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {block.caption}
          </p>
        ) : null}
        <GraphLivePreview
          graphSpec={graphSpec}
          valueById={variableValues}
          onVariableChange={readOnlyGraph ? undefined : onVariableChange}
          readOnlySliders={readOnlyGraph}
          compact={readOnlyGraph}
        />
      </div>
    );
  }
  if (block.type === 'interactive') {
    const spec = graphSpec?.variables?.find((v) => v.id === block.boundVariableId);
    const val = variableValues[block.boundVariableId] ?? spec?.default ?? 0;
    return (
      <div className="flex flex-col gap-2 rounded-xl p-3 sm:flex-row sm:items-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {block.label}
        </span>
        {spec && !readOnlyGraph ? (
          <input
            type="range"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={val}
            onChange={(e) => onVariableChange(block.boundVariableId, Number(e.target.value))}
            className="max-w-xs flex-1"
          />
        ) : (
          <span className="text-sm tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {val}
          </span>
        )}
      </div>
    );
  }
  return null;
}
