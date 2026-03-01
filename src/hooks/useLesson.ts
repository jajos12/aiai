'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Step } from '@/core/types';

interface UseLessonOptions {
  steps: Step[];
  tierId: number;
  moduleId: string;
  initialStepIndex?: number;
  initialCompletedSteps?: string[];
  onCompleteStep?: (stepId: string) => void;
  onAnswerQuiz?: (stepId: string, answerIndex: number) => void;
}

interface UseLessonReturn {
  /** Currently active step */
  currentStep: Step;
  /** Index of the current step (0-based) */
  currentStepIndex: number;
  /** Set of completed step IDs */
  completedSteps: Set<string>;
  /** Navigate to next step */
  goNext: () => void;
  /** Navigate to previous step */
  goBack: () => void;
  /** Jump to a specific step index */
  goToStep: (index: number) => void;
  /** Mark current step as complete */
  completeCurrentStep: () => void;
  /** Record a quiz answer for current step */
  submitQuizAnswer: (answerIndex: number) => void;
  /** Quiz answers map: stepId → selected answer index */
  quizAnswers: Record<string, number>;
  /** Whether navigation can go forward */
  canGoNext: boolean;
  /** Whether navigation can go back */
  canGoBack: boolean;
  /** Whether we're on the last step */
  isLastStep: boolean;
  /** Whether we're on the first step */
  isFirstStep: boolean;
  /** Total step count */
  totalSteps: number;
  /** Fraction of steps completed (0 to 1) */
  progressFraction: number;
}

export function useLesson({
  steps,
  tierId,
  moduleId,
  initialStepIndex = 0,
  initialCompletedSteps = [],
  onCompleteStep,
  onAnswerQuiz,
}: UseLessonOptions): UseLessonReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set(initialCompletedSteps));
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // Sync completedSteps when persisted data loads (async from localStorage)
  const completedKey = JSON.stringify(initialCompletedSteps.slice().sort());
  useEffect(() => {
    if (initialCompletedSteps.length > 0) {
      setCompletedSteps((prev) => {
        const merged = new Set(prev);
        for (const id of initialCompletedSteps) merged.add(id);
        return merged.size !== prev.size ? merged : prev;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedKey]);

  // Sentinel step used when steps array is empty (during initial load)
  const EMPTY_STEP: Step = {
    id: '__loading__',
    title: 'Loading...',
    visualizationProps: {},
    content: { text: '' },
  };

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex] ?? steps[0] ?? EMPTY_STEP;
  const hasSteps = totalSteps > 0;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const canGoBack = hasSteps && !isFirstStep;
  const canGoNext = hasSteps && !isLastStep;
  const progressFraction = totalSteps > 0 ? completedSteps.size / totalSteps : 0;

  const goNext = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((i) => i + 1);
    }
  }, [currentStepIndex, totalSteps]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStepIndex(index);
      }
    },
    [totalSteps],
  );

  const completeCurrentStep = useCallback(() => {
    const stepId = currentStep.id;
    setCompletedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
    onCompleteStep?.(stepId);
  }, [currentStep.id, onCompleteStep]);

  const submitQuizAnswer = useCallback(
    (answerIndex: number) => {
      const stepId = currentStep.id;
      setQuizAnswers((prev) => ({ ...prev, [stepId]: answerIndex }));
      onAnswerQuiz?.(stepId, answerIndex);
    },
    [currentStep.id, onAnswerQuiz],
  );

  // Keyboard navigation (← →)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when focus is in input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (canGoNext) goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (canGoBack) goBack();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoNext, canGoBack, goNext, goBack]);

  return {
    currentStep,
    currentStepIndex,
    completedSteps,
    goNext,
    goBack,
    goToStep,
    completeCurrentStep,
    submitQuizAnswer,
    quizAnswers,
    canGoNext,
    canGoBack,
    isLastStep,
    isFirstStep,
    totalSteps,
    progressFraction,
  };
}
