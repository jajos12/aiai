'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ConceptTreePanel } from '@/components/lesson/ConceptTreePanel';
import { buildModuleConceptTree, conceptNodeId } from '@/core/moduleConceptTree';
import { useModuleData } from '@/hooks/useModuleData';
import { useProgress } from '@/hooks/useProgress';
import type { ConceptTreeNode } from '@/lib/ai/schemas';
import type { LessonMapInsights } from '@/lib/db/lessonMap';

function applyInsightsToTree(
  tree: ConceptTreeNode[],
  insights: LessonMapInsights,
): ConceptTreeNode[] {
  return tree.map((node) => {
    const ins = insights[node.id];
    const enrichedChildren = applyInsightsToTree(node.children ?? [], insights);

    if (!ins) return { ...node, children: enrichedChildren };

    const aiConceptChildren: ConceptTreeNode[] =
      ins.concepts.length > 0
        ? ins.concepts.map((concept) => ({
            id: conceptNodeId(node.id, concept),
            title: concept,
            summary: `Key concept in "${node.title}". Click for details.`,
            prerequisites: [],
            children: [],
            kind: 'concept' as const,
            detail: ins.insight || node.detail || '',
            insight: `Part of: ${node.title}`,
          }))
        : enrichedChildren;

    return {
      ...node,
      insight: ins.insight || node.insight,
      summary: ins.summary || node.summary,
      children: ins.concepts.length > 0 ? aiConceptChildren : enrichedChildren,
    };
  });
}

export default function GuidedConceptTreePage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const { moduleData, isLoading: moduleLoading } = useModuleData(moduleId);
  const { getModuleProgress, setExpandedConceptNodes, stats } = useProgress();
  const moduleProgress = getModuleProgress(tierId, moduleId);

  const [aiInsights, setAiInsights] = useState<LessonMapInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCached, setAiCached] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    let cancelled = false;
    setAiLoading(true);
    setAiError(null);
    fetch(`/api/ai/lesson-map?moduleId=${encodeURIComponent(moduleId)}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((data: { insights: LessonMapInsights; cached: boolean }) => {
        if (!cancelled) {
          setAiInsights(data.insights);
          setAiCached(data.cached);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setAiError(err.message);
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });
    return () => { cancelled = true; };
  }, [moduleId]);

  const staticTree = useMemo(
    () => (moduleData ? buildModuleConceptTree(moduleData) : []),
    [moduleData],
  );

  const conceptTree = useMemo(() => {
    if (!aiInsights) return staticTree;
    return applyInsightsToTree(staticTree, aiInsights);
  }, [staticTree, aiInsights]);

  const conceptTrends = useMemo(() => {
    const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const byConcept = new Map<string, number[]>();
    const moduleQuizEvents = stats.activityLog.filter(
      (event) => event.type === 'quiz' && event.moduleId === moduleId && event.concept,
    );
    for (const event of moduleQuizEvents) {
      const concept = event.concept!;
      const prev = byConcept.get(concept) ?? [50];
      const last = prev[prev.length - 1] ?? 50;
      const next =
        typeof event.isCorrect === 'boolean'
          ? Math.max(0, Math.min(100, last + (event.isCorrect ? 6 : -8)))
          : last;
      byConcept.set(concept, [...prev.slice(-7), next]);
    }
    const result: Record<string, string> = {};
    for (const [concept, points] of byConcept.entries()) {
      result[concept] = points
        .map((value) => bars[Math.max(0, Math.min(7, Math.round((value / 100) * 7)))])
        .join('');
    }
    return result;
  }, [stats.activityLog, moduleId]);

  const { conceptConfidenceForTree, conceptTrendsForTree } = useMemo(() => {
    const conf = { ...moduleProgress.conceptConfidence };
    const trends = { ...conceptTrends };
    if (!moduleData) return { conceptConfidenceForTree: conf, conceptTrendsForTree: trends };
    for (const step of moduleData.steps ?? []) {
      for (const c of step.concepts ?? []) {
        const nid = conceptNodeId(step.id, c);
        if (typeof conf[c] === 'number' && conf[nid] === undefined) conf[nid] = conf[c];
        if (trends[c] && trends[nid] === undefined) trends[nid] = trends[c];
        if (typeof conf[c] === 'number' && conf[step.id] === undefined) conf[step.id] = conf[c];
        if (trends[c] && trends[step.id] === undefined) trends[step.id] = trends[c];
      }
    }
    return { conceptConfidenceForTree: conf, conceptTrendsForTree: trends };
  }, [moduleData, moduleProgress.conceptConfidence, conceptTrends]);

  const stepIndexById = useMemo(() => {
    const map = new Map<string, number>();
    (moduleData?.steps ?? []).forEach((step, index) => map.set(step.id, index));
    return map;
  }, [moduleData]);

  const jumpableStepIds = useMemo(
    () => new Set((moduleData?.steps ?? []).map((s) => s.id)),
    [moduleData],
  );

  function handleRegenerate() {
    if (!moduleId) return;
    setAiLoading(true);
    setAiError(null);
    setAiInsights(null);
    fetch(`/api/ai/lesson-map?moduleId=${encodeURIComponent(moduleId)}`, { method: 'DELETE', credentials: 'include' })
      .then(() =>
        fetch(`/api/ai/lesson-map?moduleId=${encodeURIComponent(moduleId)}`, { credentials: 'include' }),
      )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((data: { insights: LessonMapInsights; cached: boolean }) => {
        setAiInsights(data.insights);
        setAiCached(data.cached);
      })
      .catch((err: Error) => setAiError(err.message))
      .finally(() => setAiLoading(false));
  }

  return (
    <div style={{ minHeight: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => router.push(`/tier/${tierId}/${moduleId}/guided`)}>
          ← Back to guided
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {aiLoading && (
            <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid var(--accent)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              {aiInsights ? 'Refreshing AI map…' : 'Generating AI lesson map…'}
            </span>
          )}

          {!aiLoading && aiInsights && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--accent)',
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.35)',
              }}
            >
              ✨ AI-enhanced{aiCached ? ' (cached)' : ''}
            </span>
          )}

          {!aiLoading && aiError && (
            <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>
              ⚠️ AI unavailable — showing static map
            </span>
          )}

          <button
            className="btn btn--ghost btn--sm"
            onClick={handleRegenerate}
            disabled={aiLoading}
            title="Regenerate AI lesson map"
          >
            ↺ Regenerate
          </button>
        </div>
      </div>

      {moduleLoading && <div style={{ color: 'var(--text-muted)' }}>Loading module…</div>}
      {!moduleLoading && !moduleData && (
        <div style={{ color: 'var(--warning)' }}>Module not found.</div>
      )}
      {moduleData && (
        <ConceptTreePanel
          nodes={conceptTree}
          completedNodeIds={new Set(moduleProgress.stepsCompleted)}
          expandedNodeIds={moduleProgress.expandedConceptNodes}
          conceptConfidence={conceptConfidenceForTree}
          conceptTrends={conceptTrendsForTree}
          onExpandedChange={(ids) => setExpandedConceptNodes(tierId, moduleId, ids)}
          jumpableStepIds={jumpableStepIds}
          onJumpToLesson={(stepId) => {
            if (stepIndexById.has(stepId)) {
              router.push(`/tier/${tierId}/${moduleId}/guided?step=${encodeURIComponent(stepId)}`);
            }
          }}
        />
      )}
    </div>
  );
}
