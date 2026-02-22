'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ProgressState, ModuleProgress, TierProgress } from '@/types/progress';

const STORAGE_KEY = 'ai-playground-progress';
const SCHEMA_VERSION = 1;
const SAVE_DEBOUNCE_MS = 500;

function createDefaultProgress(): ProgressState {
  return {
    version: SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    streak: { current: 0, longest: 0, lastActiveDate: '' },
    tiers: {
      0: { unlocked: true, modules: {} },
      1: { unlocked: false, modules: {} },
      2: { unlocked: false, modules: {} },
      3: { unlocked: false, modules: {} },
      4: { unlocked: false, modules: {} },
      5: { unlocked: false, modules: {} },
    },
    badges: [],
    activityLog: [],
    settings: {
      theme: 'dark',
      goDeeper: 'collapsed',
      animationSpeed: 'normal',
      sidebarCollapsed: false,
    },
  };
}

function createDefaultModuleProgress(): ModuleProgress {
  return {
    status: 'available',
    stepsCompleted: [],
    quizAnswers: {},
    challengesCompleted: [],
    playgroundVisited: false,
    lastAccessedStep: '',
  };
}

function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return createDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    // Schema migration — for now just check version
    if (parsed.version !== SCHEMA_VERSION) {
      // Future: migrate from old schema
      return { ...createDefaultProgress(), ...parsed, version: SCHEMA_VERSION };
    }
    return parsed;
  } catch {
    return createDefaultProgress();
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(createDefaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress());
    setIsLoaded(true);
  }, []);

  // Debounced save
  const save = useCallback((nextState: ProgressState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const toSave = { ...nextState, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const update = useCallback(
    (updater: (prev: ProgressState) => ProgressState) => {
      setProgress((prev) => {
        const next = updater(prev);
        save(next);
        return next;
      });
    },
    [save],
  );

  // ── Module-level helpers ──

  const getModuleProgress = useCallback(
    (tierId: number, moduleId: string): ModuleProgress => {
      return (
        progress.tiers[tierId]?.modules[moduleId] ?? createDefaultModuleProgress()
      );
    },
    [progress],
  );

  const updateModule = useCallback(
    (tierId: number, moduleId: string, updater: (m: ModuleProgress) => ModuleProgress) => {
      update((prev) => {
        const tier: TierProgress = prev.tiers[tierId] ?? { unlocked: false, modules: {} };
        const mod = tier.modules[moduleId] ?? createDefaultModuleProgress();
        const updated = updater(mod);
        return {
          ...prev,
          tiers: {
            ...prev.tiers,
            [tierId]: {
              ...tier,
              modules: { ...tier.modules, [moduleId]: updated },
            },
          },
        };
      });
    },
    [update],
  );

  const completeStep = useCallback(
    (tierId: number, moduleId: string, stepId: string) => {
      updateModule(tierId, moduleId, (mod) => ({
        ...mod,
        status: mod.status === 'available' ? 'in-progress' : mod.status,
        stepsCompleted: mod.stepsCompleted.includes(stepId)
          ? mod.stepsCompleted
          : [...mod.stepsCompleted, stepId],
        lastAccessedStep: stepId,
      }));
    },
    [updateModule],
  );

  const answerQuiz = useCallback(
    (tierId: number, moduleId: string, stepId: string, answerIndex: number) => {
      updateModule(tierId, moduleId, (mod) => ({
        ...mod,
        quizAnswers: { ...mod.quizAnswers, [stepId]: answerIndex },
      }));
    },
    [updateModule],
  );

  const completeModule = useCallback(
    (tierId: number, moduleId: string) => {
      updateModule(tierId, moduleId, (mod) => ({
        ...mod,
        status: 'completed',
        completedAt: new Date().toISOString(),
      }));
    },
    [updateModule],
  );

  const completeChallenge = useCallback(
    (tierId: number, moduleId: string, challengeId: string) => {
      updateModule(tierId, moduleId, (mod) => ({
        ...mod,
        challengesCompleted: mod.challengesCompleted.includes(challengeId)
          ? mod.challengesCompleted
          : [...mod.challengesCompleted, challengeId],
      }));
    },
    [updateModule],
  );

  const setLastAccessedStep = useCallback(
    (tierId: number, moduleId: string, stepId: string) => {
      updateModule(tierId, moduleId, (mod) => ({
        ...mod,
        lastAccessedStep: stepId,
      }));
    },
    [updateModule],
  );

  return {
    progress,
    isLoaded,
    getModuleProgress,
    updateModule,
    completeStep,
    answerQuiz,
    completeModule,
    completeChallenge,
    setLastAccessedStep,
    update,
  };
}
