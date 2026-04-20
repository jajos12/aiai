'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { LessonBlock, LessonGraphSpec, LessonStudioState, LessonTimeline, Quiz, Step } from '@/core/types';
import DragDropList from '../shared/DragDropList';
import GraphLivePreview from '@/components/lesson/GraphLivePreview';
import MathEditor from '../shared/MathEditor';
import { LessonBlockRenderer } from '@/components/lesson/LessonBlockRenderer';

interface LessonStudioPanelProps {
  step: Step;
  moduleTitle: string;
  onStudioChange: (studio: LessonStudioState | undefined) => void;
  onApplyQuiz?: (quiz: Quiz) => void;
}

type StudioTab = 'blocks' | 'graph' | 'timeline' | 'ai' | 'voice' | 'preview';

export default function LessonStudioPanel({ step, moduleTitle, onStudioChange, onApplyQuiz }: LessonStudioPanelProps) {
  const [tab, setTab] = useState<StudioTab>('blocks');
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [courseTopic, setCourseTopic] = useState('');

  const studio: LessonStudioState = step.content.studio ?? {};

  const patch = (partial: Partial<LessonStudioState>) => {
    const next: LessonStudioState = { ...studio, ...partial };
    const hasBlocks = (next.blocks?.length ?? 0) > 0;
    const hasGraph = Boolean(next.graphSpec?.expression?.trim());
    const hasTimeline = (next.timeline?.keyframes?.length ?? 0) > 0;
    const hasVoice = Boolean(next.voiceNoteUrl?.trim() || next.videoTranscript?.trim());
    const hasNotes = Boolean(next.visualScriptNotes?.trim());
    const hasIntel = Boolean(next.intelligence?.estimatedConfusion?.length || next.intelligence?.improvementIdeas?.length);
    const empty = !hasBlocks && !hasGraph && !hasTimeline && !hasVoice && !hasNotes && !hasIntel;
    onStudioChange(empty ? undefined : next);
  };

  const blocks = studio.blocks ?? [];

  const runAi = async (action: string, extra?: Record<string, unknown>) => {
    setAiBusy(action);
    setAiMessage(null);
    try {
      const bodyPayload: Record<string, unknown> = {
        action,
        moduleTitle,
        stepTitle: step.title,
      };
      if (action !== 'course_outline') {
        bodyPayload.step = step;
      }
      if (typeof extra?.text === 'string' && extra.text.trim()) {
        bodyPayload.text = extra.text.trim();
      }
      if (extra?.audience && typeof extra.audience === 'string') {
        bodyPayload.audience = extra.audience;
      }
      const res = await fetch('/api/admin/ai/lesson-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyPayload),
      });
      const data = (await res.json()) as {
        error?: string;
        text?: string;
        blocks?: LessonBlock[];
        quiz?: Quiz;
        intelligence?: LessonStudioState['intelligence'];
      };
      if (!res.ok) throw new Error(data.error || res.statusText);
      if (action === 'generate_blocks_outline' && data.blocks) {
        patch({ blocks: data.blocks });
        setAiMessage('Blocks inserted. Review and edit on the Blocks tab.');
      } else if (action === 'intelligence_scan' && data.intelligence) {
        patch({ intelligence: data.intelligence });
        setAiMessage('Intelligence hints saved to this step.');
      } else if (action === 'generate_quiz' && data.quiz) {
        setAiMessage('Quiz generated. Click “Apply quiz to step” to attach it.');
        (window as unknown as { __lastGeneratedQuiz?: Quiz }).__lastGeneratedQuiz = data.quiz;
      } else if (data.text) {
        setAiMessage(data.text.slice(0, 4000));
      }
    } catch (e) {
      setAiMessage(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setAiBusy(null);
    }
  };

  const graphSpec: LessonGraphSpec = {
    expression: studio.graphSpec?.expression?.trim() ? studio.graphSpec.expression : '0.15*x*x',
    variables: studio.graphSpec?.variables?.length ? studio.graphSpec.variables : [{ id: 'a', label: 'Curve a', min: -1, max: 1, step: 0.05, default: 0.15 }],
    xMin: studio.graphSpec?.xMin,
    xMax: studio.graphSpec?.xMax,
    yMin: studio.graphSpec?.yMin,
    yMax: studio.graphSpec?.yMax,
  };

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {(['blocks', 'graph', 'timeline', 'ai', 'voice', 'preview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="shrink-0 rounded-md px-3 py-2 text-sm font-medium capitalize"
            style={{
              background: tab === t ? 'var(--accent)' : 'var(--bg-hover)',
              color: tab === t ? 'white' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'blocks' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['concept', () => ({ id: uuidv4(), type: 'concept' as const, title: 'Concept', body: '' })],
                ['math', () => ({ id: uuidv4(), type: 'math' as const, latex: 'x^2 + 1' })],
                ['explanation', () => ({ id: uuidv4(), type: 'explanation' as const, body: '' })],
                ['callout', () => ({ id: uuidv4(), type: 'callout' as const, body: '', tone: 'tip' as const })],
                ['graph', () => ({ id: uuidv4(), type: 'graph' as const, caption: 'Live graph' })],
                ['interactive', () => ({ id: uuidv4(), type: 'interactive' as const, label: 'Parameter', boundVariableId: 'a' })],
              ] as const
            ).map(([label, factory]) => (
              <button
                key={label}
                type="button"
                onClick={() => patch({ blocks: [...blocks, factory() as LessonBlock] })}
                className="rounded-lg px-2 py-1 text-xs font-medium"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                + {label}
              </button>
            ))}
          </div>
          <DragDropList
            items={blocks}
            onReorder={(next) => patch({ blocks: next })}
            keyExtractor={(b) => b.id}
            renderItem={(b) => (
              <div className="flex w-full gap-2">
                <div className="min-w-0 flex-1">
                  <BlockEditor
                    block={b}
                    onChange={(nb) => patch({ blocks: blocks.map((x) => (x.id === b.id ? nb : x)) })}
                  />
                </div>
                <button
                  type="button"
                  className="shrink-0 text-sm text-red-500 hover:underline"
                  onClick={() => patch({ blocks: blocks.filter((x) => x.id !== b.id) })}
                >
                  Remove
                </button>
              </div>
            )}
          />
        </div>
      )}

      {tab === 'graph' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            y = f(x) — use x and optional parameters (define sliders on the right)
          </label>
          <input
            value={graphSpec.expression}
            onChange={(e) => patch({ graphSpec: { ...graphSpec, expression: e.target.value } })}
            className="w-full rounded-lg p-2 font-mono text-sm"
            style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
            onClick={() =>
              patch({
                graphSpec: {
                  ...graphSpec,
                  variables: [...(graphSpec.variables ?? []), { id: `p${(graphSpec.variables?.length ?? 0) + 1}`, label: 'Param', min: -2, max: 2, step: 0.1, default: 0 }],
                },
              })
            }
          >
            + Parameter slider
          </button>
          {(graphSpec.variables ?? []).map((v, idx) => (
            <div key={v.id} className="grid grid-cols-2 gap-2 rounded-lg p-2 sm:grid-cols-6" style={{ background: 'var(--bg-hover)' }}>
              <input
                value={v.id}
                onChange={(e) => {
                  const nv = [...(graphSpec.variables ?? [])];
                  nv[idx] = { ...v, id: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') };
                  patch({ graphSpec: { ...graphSpec, variables: nv } });
                }}
                className="rounded p-1 text-xs"
                placeholder="id"
              />
              <input
                value={v.label}
                onChange={(e) => {
                  const nv = [...(graphSpec.variables ?? [])];
                  nv[idx] = { ...v, label: e.target.value };
                  patch({ graphSpec: { ...graphSpec, variables: nv } });
                }}
                className="rounded p-1 text-xs"
                placeholder="label"
              />
              <input type="number" value={v.min} onChange={(e) => { const nv = [...(graphSpec.variables ?? [])]; nv[idx] = { ...v, min: Number(e.target.value) }; patch({ graphSpec: { ...graphSpec, variables: nv } }); }} className="rounded p-1 text-xs" />
              <input type="number" value={v.max} onChange={(e) => { const nv = [...(graphSpec.variables ?? [])]; nv[idx] = { ...v, max: Number(e.target.value) }; patch({ graphSpec: { ...graphSpec, variables: nv } }); }} className="rounded p-1 text-xs" />
              <input type="number" value={v.default} onChange={(e) => { const nv = [...(graphSpec.variables ?? [])]; nv[idx] = { ...v, default: Number(e.target.value) }; patch({ graphSpec: { ...graphSpec, variables: nv } }); }} className="rounded p-1 text-xs" />
              <button type="button" className="text-xs text-red-500" onClick={() => patch({ graphSpec: { ...graphSpec, variables: (graphSpec.variables ?? []).filter((_, i) => i !== idx) } })}>Remove</button>
            </div>
          ))}
          <GraphLivePreview graphSpec={graphSpec} />
        </div>
      )}

      {tab === 'timeline' && (
        <TimelineSection
          timeline={studio.timeline ?? { keyframes: [] }}
          onChange={(tl) => patch({ timeline: tl })}
        />
      )}

      {tab === 'ai' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Uses your configured Groq / Hugging Face keys (same as tutor). Output is draft — always review.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ['generate_explanation', 'Generate explanation'],
              ['simplify', 'Simplify'],
              ['intuitive', 'More intuitive'],
              ['analogy', 'Add analogy'],
              ['generate_blocks_outline', 'Block outline'],
              ['intelligence_scan', 'Confusion scan'],
              ['generate_quiz', 'Draft quiz'],
            ].map(([action, label]) => (
              <button
                key={action}
                type="button"
                disabled={!!aiBusy}
                onClick={() => void runAi(action)}
                className="rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {label}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Explain like I&apos;m…
            </label>
            <div className="flex flex-wrap gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  disabled={!!aiBusy}
                  onClick={() => void runAi('rewrite_audience', { audience: a })}
                  className="rounded-lg px-3 py-1 text-sm capitalize disabled:opacity-50"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              One-click course outline (topic)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={courseTopic}
                onChange={(e) => setCourseTopic(e.target.value)}
                placeholder="e.g. Linear Algebra for AI"
                className="min-w-0 flex-1 rounded-lg p-2 text-sm"
                style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                disabled={!!aiBusy || !courseTopic.trim()}
                onClick={() => void runAi('course_outline', { text: courseTopic.trim() })}
                className="rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Generate outline
              </button>
            </div>
          </div>
          <button
            type="button"
            disabled={!!aiBusy || !onApplyQuiz}
            onClick={() => {
              const q = (window as unknown as { __lastGeneratedQuiz?: Quiz }).__lastGeneratedQuiz;
              if (!q || !onApplyQuiz) return;
              onApplyQuiz(q);
              setAiMessage('Quiz attached to this step.');
            }}
            className="text-sm underline disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: 'var(--accent)' }}
          >
            Apply last generated quiz to this step
          </button>
          {aiBusy && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Running {aiBusy}…</p>}
          {aiMessage && (
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg p-3 text-xs" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
              {aiMessage}
            </pre>
          )}
        </div>
      )}

      {tab === 'voice' && (
        <div className="space-y-3">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Voice / podcast URL</label>
          <input
            value={studio.voiceNoteUrl ?? ''}
            onChange={(e) => patch({ voiceNoteUrl: e.target.value })}
            placeholder="https://…"
            className="w-full rounded-lg p-2 text-sm"
            style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Captions / transcript</label>
          <textarea
            value={studio.videoTranscript ?? ''}
            onChange={(e) => patch({ videoTranscript: e.target.value })}
            rows={5}
            className="w-full rounded-lg p-2 text-sm"
            style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Visual / motion design notes (no code execution)</label>
          <textarea
            value={studio.visualScriptNotes ?? ''}
            onChange={(e) => patch({ visualScriptNotes: e.target.value })}
            rows={4}
            placeholder="Describe motion beats, camera, or sync with narration — for production reference only."
            className="w-full rounded-lg p-2 text-sm"
            style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
        </div>
      )}

      {tab === 'preview' && (
        <div className="rounded-xl p-4" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
          <p className="mb-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Student simulation (structured layer + graph)</p>
          {studio.intelligence && (
            <div className="mb-4 rounded-lg p-3 text-xs" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
              <p className="mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>AI intelligence snapshot</p>
              {studio.intelligence.estimatedConfusion?.length ? (
                <ul className="mb-2 list-disc pl-4">
                  {studio.intelligence.estimatedConfusion.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              ) : null}
              {studio.intelligence.improvementIdeas?.length ? (
                <ul className="list-disc pl-4">
                  {studio.intelligence.improvementIdeas.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
          <LessonBlockRenderer studio={{ ...studio, graphSpec }} interactive />
        </div>
      )}
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: LessonBlock; onChange: (b: LessonBlock) => void }) {
  if (block.type === 'concept') {
    return (
      <div className="space-y-2">
        <input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Title" className="w-full rounded p-2 text-sm" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
        <textarea value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} rows={3} className="w-full rounded p-2 text-sm" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
      </div>
    );
  }
  if (block.type === 'math') {
    return <MathEditor value={block.latex} onChange={(latex) => onChange({ ...block, latex })} minHeight="100px" />;
  }
  if (block.type === 'explanation' || block.type === 'callout') {
    return (
      <div className="space-y-2">
        {block.type === 'callout' && (
          <select value={block.tone ?? 'info'} onChange={(e) => onChange({ ...block, tone: e.target.value as 'info' | 'warning' | 'tip' })} className="rounded p-1 text-sm">
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="tip">tip</option>
          </select>
        )}
        <textarea value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} rows={3} className="w-full rounded p-2 text-sm" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
      </div>
    );
  }
  if (block.type === 'graph') {
    return <input value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption" className="w-full rounded p-2 text-sm" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />;
  }
  if (block.type === 'interactive') {
    return (
      <div className="flex gap-2">
        <input value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} className="flex-1 rounded p-2 text-sm" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
        <input value={block.boundVariableId} onChange={(e) => onChange({ ...block, boundVariableId: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })} placeholder="var id" className="w-24 rounded p-2 text-sm" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
      </div>
    );
  }
  return null;
}

function TimelineSection({
  timeline,
  onChange,
}: {
  timeline: LessonTimeline;
  onChange: (t: LessonTimeline) => void;
}) {
  const kf = timeline.keyframes ?? [];
  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Timeline segments describe beats for motion or UI reveals (design metadata). Playback wiring can hook into these ranges later.
      </p>
      <button
        type="button"
        onClick={() =>
          onChange({
            keyframes: [
              ...kf,
              { id: uuidv4(), tStart: kf.length ? kf[kf.length - 1].tEnd : 0, tEnd: kf.length ? kf[kf.length - 1].tEnd + 5 : 5, label: `Segment ${kf.length + 1}` },
            ],
          })
        }
        className="rounded-lg px-3 py-1.5 text-sm"
        style={{ background: 'var(--accent)', color: 'white' }}
      >
        + Keyframe range
      </button>
      {kf.map((k, i) => (
        <div key={k.id} className="grid grid-cols-2 gap-2 rounded-lg p-2 sm:grid-cols-5" style={{ background: 'var(--bg-hover)' }}>
          <input value={k.label} onChange={(e) => { const nk = [...kf]; nk[i] = { ...k, label: e.target.value }; onChange({ keyframes: nk }); }} className="rounded p-1 text-xs" />
          <input type="number" value={k.tStart} onChange={(e) => { const nk = [...kf]; nk[i] = { ...k, tStart: Number(e.target.value) }; onChange({ keyframes: nk }); }} className="rounded p-1 text-xs" />
          <input type="number" value={k.tEnd} onChange={(e) => { const nk = [...kf]; nk[i] = { ...k, tEnd: Number(e.target.value) }; onChange({ keyframes: nk }); }} className="rounded p-1 text-xs" />
          <input value={k.caption ?? ''} onChange={(e) => { const nk = [...kf]; nk[i] = { ...k, caption: e.target.value }; onChange({ keyframes: nk }); }} placeholder="caption" className="rounded p-1 text-xs" />
          <button type="button" className="text-xs text-red-500" onClick={() => onChange({ keyframes: kf.filter((_, j) => j !== i) })}>Remove</button>
        </div>
      ))}
    </div>
  );
}
