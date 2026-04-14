'use client';

import { useEffect, useState } from 'react';
import type { StudyKit } from '@/lib/ai/schemas';
import type { ProgressState } from '@/types/progress';

interface UseStudyKitState {
  studyKit: StudyKit | null;
  isLoading: boolean;
  error: string | null;
}

export function useStudyKit(
  moduleId: string,
  tierId: number,
  progress: ProgressState,
) {
  const [state, setState] = useState<UseStudyKitState>({
    studyKit: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const response = await fetch('/api/ai/generate-study-kit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId,
            tierId,
            mode: 'refine',
            learnerProfile: progress.learnerProfile,
          }),
        });

        if (!response.ok) throw new Error(`Study kit request failed: ${response.status}`);
        const studyKit = (await response.json()) as StudyKit;
        if (cancelled) return;
        setState({ studyKit, isLoading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({
          studyKit: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load study kit',
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [moduleId, tierId, progress.learnerProfile]);

  return state;
}
