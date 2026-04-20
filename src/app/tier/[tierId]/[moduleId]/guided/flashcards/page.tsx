'use client';

import { useParams, useRouter } from 'next/navigation';
import { FlashcardDeck } from '@/components/lesson/FlashcardDeck';
import { useProgress } from '@/hooks/useProgress';
import { useStudyKit } from '@/hooks/useStudyKit';

export default function GuidedFlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const { progress } = useProgress();
  const { studyKit, isLoading, error } = useStudyKit(moduleId, tierId, progress);

  return (
    <div style={{ minHeight: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)', padding: '1.25rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => router.push(`/tier/${tierId}/${moduleId}/guided`)}>
          ← Back to guided
        </button>
        <h2 style={{ marginTop: '0.75rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>AI Flashcards</h2>
        {isLoading && <div style={{ color: 'var(--text-muted)' }}>Generating flashcards...</div>}
        {error && <div style={{ color: 'var(--warning)' }}>{error}</div>}
        <FlashcardDeck cards={studyKit?.flashcards ?? []} />
      </div>
    </div>
  );
}
