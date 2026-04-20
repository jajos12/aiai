'use client';

import { useParams, useRouter } from 'next/navigation';
import { AdaptiveQuizPanel } from '@/components/lesson/AdaptiveQuizPanel';
import { useProgress } from '@/hooks/useProgress';
import { useStudyKit } from '@/hooks/useStudyKit';

export default function GuidedQuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const { progress, answerQuiz } = useProgress();
  const { studyKit, isLoading, error } = useStudyKit(moduleId, tierId, progress);

  return (
    <div style={{ minHeight: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)', padding: '1.25rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => router.push(`/tier/${tierId}/${moduleId}/guided`)}>
          ← Back to guided
        </button>
        <h2 style={{ marginTop: '0.75rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>AI Adaptive Quizzes</h2>
        {isLoading && <div style={{ color: 'var(--text-muted)' }}>Generating quizzes...</div>}
        {error && <div style={{ color: 'var(--warning)' }}>{error}</div>}
        <AdaptiveQuizPanel
          items={studyKit?.quizzes ?? []}
          onAnswer={(item, selected, isCorrect) => {
            answerQuiz(tierId, moduleId, `ai-${item.id}`, selected, {
              isCorrect,
              concept: item.concepts[0] ?? moduleId,
            });
          }}
        />
      </div>
    </div>
  );
}
