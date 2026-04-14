'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ConceptTreePanel } from '@/components/lesson/ConceptTreePanel';
import { buildModuleConceptTree, conceptNodeId } from '@/core/moduleConceptTree';
import { useModuleData } from '@/hooks/useModuleData';
import { useProgress } from '@/hooks/useProgress';

export default function GuidedConceptTreePage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const { moduleData, isLoading: moduleLoading } = useModuleData(moduleId);
  const { getModuleProgress, setExpandedConceptNodes, stats } = useProgress();
  const moduleProgress = getModuleProgress(tierId, moduleId);

  const conceptTree = useMemo(
    () => (moduleData ? buildModuleConceptTree(moduleData) : []),
    [moduleData],
  );

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

  /** Map quiz concept keys onto step ids so confidence / trends show on lesson nodes. */
  const { conceptConfidenceForTree, conceptTrendsForTree } = useMemo(() => {
    const conf = { ...moduleProgress.conceptConfidence };
    const trends = { ...conceptTrends };
    if (!moduleData) {
      return { conceptConfidenceForTree: conf, conceptTrendsForTree: trends };
    }
    for (const step of moduleData.steps ?? []) {
      for (const c of step.concepts ?? []) {
        const nid = conceptNodeId(step.id, c);
        if (typeof conf[c] === 'number' && conf[nid] === undefined) {
          conf[nid] = conf[c];
        }
        if (trends[c] && trends[nid] === undefined) {
          trends[nid] = trends[c];
        }
        if (typeof conf[c] === 'number' && conf[step.id] === undefined) {
          conf[step.id] = conf[c];
        }
        if (trends[c] && trends[step.id] === undefined) {
          trends[step.id] = trends[c];
        }
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

  return (
    <div style={{ minHeight: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)', padding: '1.25rem' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => router.push(`/tier/${tierId}/${moduleId}/guided`)}>
          ← Back to guided
        </button>
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
