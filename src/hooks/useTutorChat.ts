'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TutorMessage, ExplainLevel } from '@/types/tutor';
import type { LearnerProfile } from '@/types/progress';

interface UseTutorChatOptions {
  moduleId: string;
  moduleTitle: string;
  stepId: string;
  level: ExplainLevel;
  learnerProfile: LearnerProfile;
}

interface UseTutorChatReturn {
  messages: TutorMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
}

export function useTutorChat({
  moduleId,
  moduleTitle,
  stepId,
  level,
  learnerProfile,
}: UseTutorChatOptions): UseTutorChatReturn {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ai/tutor-chat?moduleId=${encodeURIComponent(moduleId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data: { messages: TutorMessage[] }) => {
        if (!cancelled) setMessages(data.messages);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (isStreaming || !trimmed) return;

      const userMsg: TutorMessage = {
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setError(null);

      const abortCtrl = new AbortController();
      abortRef.current = abortCtrl;

      const assistantPlaceholder: TutorMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantPlaceholder]);

      try {
        const res = await fetch('/api/ai/tutor-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId,
            moduleTitle,
            stepId,
            level,
            message: trimmed,
            learnerProfile: {
              weakConcepts: learnerProfile.weakConcepts,
              strongConcepts: learnerProfile.strongConcepts,
              skillByConcept: learnerProfile.skillByConcept,
              preferredPace: learnerProfile.preferredPace,
            },
          }),
          signal: abortCtrl.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
          throw new Error(err.error ?? res.statusText);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: 'assistant',
                content: accumulated,
                timestamp: new Date().toISOString(),
              };
              return next;
            });
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Something went wrong');
          setMessages((prev) => prev.slice(0, -1));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, moduleId, moduleTitle, stepId, level, learnerProfile],
  );

  const clearError = useCallback(() => setError(null), []);

  return { messages, isStreaming, error, sendMessage, clearError };
}
