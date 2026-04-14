'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ProgressState, ModuleProgress, TierProgress, ActivityEntry } from '@/types/progress';
import { updateSkillFromChallenge, updateSkillFromQuiz } from '@/core/personalization';

const STORAGE_KEY = 'ai-playground-progress';
const SCHEMA_VERSION = 5;
const SAVE_DEBOUNCE_MS = 500;

function createDefaultProgress(): ProgressState {
  return {
    version: SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    streak: { current: 0, longest: 0, lastActiveDate: '' },
    tiers: {
      0: { unlocked: true, modules: {} },
      1: { unlocked: true, modules: {} },
      2: { unlocked: true, modules: {} },
      3: { unlocked: true, modules: {} },
      4: { unlocked: true, modules: {} },
      5: { unlocked: true, modules: {} },
    },
    badges: [],
    activityLog: [],
    settings: {
      theme: 'dark',
      goDeeper: 'collapsed',
      animationSpeed: 'normal',
      sidebarCollapsed: false,
    },
    learnerProfile: {
      skillByConcept: {},
      weakConcepts: [],
      strongConcepts: [],
      preferredPace: 'normal',
    },
  };
}

function createDefaultModuleProgress(): ModuleProgress {
  return {
    status: 'available',
    stepsCompleted: [],
    quizAnswers: {},
    expandedConceptNodes: [],
    conceptConfidence: {},
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
      // Merge old snapshots with new defaults when schema changes.
      const defaults = createDefaultProgress();
      const mergedTiers = Object.fromEntries(
        Object.entries(parsed.tiers ?? {}).map(([tierId, tier]) => [
          tierId,
          {
            unlocked: tier.unlocked,
            modules: Object.fromEntries(
              Object.entries(tier.modules ?? {}).map(([moduleId, moduleProgress]) => [
                moduleId,
                { ...createDefaultModuleProgress(), ...moduleProgress },
              ]),
            ),
          },
        ]),
      );
      return {
        ...defaults,
        ...parsed,
        tiers: { ...defaults.tiers, ...mergedTiers },
        learnerProfile: {
          ...defaults.learnerProfile,
          ...parsed.learnerProfile,
        },
        version: SCHEMA_VERSION,
      };
    }
    return parsed;
  } catch {
    return createDefaultProgress();
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(createDefaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);
  const [streakJustEarned, setStreakJustEarned] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load from localStorage on mount
  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      setProgress(loadProgress());
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
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

  // ── Streak helpers ──

  /** Get today's date string YYYY-MM-DD */
  const todayStr = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  /** Compute the date string for yesterday */
  const yesterdayStr = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  /** Update streak based on last active date */
  const withStreakUpdate = useCallback(
    (state: ProgressState): ProgressState => {
      const today = todayStr();
      const { lastActiveDate, current, longest } = state.streak;

      if (lastActiveDate === today) return state; // Already counted today

      const yesterday = yesterdayStr();
      const isConsecutive = lastActiveDate === yesterday;
      const newCurrent = isConsecutive ? current + 1 : 1;

      return {
        ...state,
        streak: {
          current: newCurrent,
          longest: Math.max(longest, newCurrent),
          lastActiveDate: today,
        },
      };
    },
    [todayStr, yesterdayStr],
  );

  /** Log an activity event and update streak */
  const logActivity = useCallback(
    (entry: Omit<ActivityEntry, 'date' | 'timestamp'>) => {
      update((prev) => {
        const now = new Date();
        const event: ActivityEntry = {
          ...entry,
          date: now.toISOString().split('T')[0],
          timestamp: now.toISOString(),
        };
        // Keep last 500 events to avoid unbounded growth
        const log = [...prev.activityLog, event].slice(-500);
        const updated = withStreakUpdate({ ...prev, activityLog: log });
        // Fire streak popup if streak was updated (first activity of day)
        if (updated.streak.lastActiveDate !== prev.streak.lastActiveDate) {
          setStreakJustEarned(true);
        }
        return updated;
      });
    },
    [update, withStreakUpdate],
  );

  const dismissStreakPopup = useCallback(() => setStreakJustEarned(false), []);

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
        const tier: TierProgress = prev.tiers[tierId] ?? { unlocked: true, modules: {} };
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
      logActivity({ type: 'step', moduleId, stepId });
    },
    [updateModule, logActivity],
  );

  const answerQuiz = useCallback(
    (
      tierId: number,
      moduleId: string,
      stepId: string,
      answerIndex: number,
      meta?: { isCorrect?: boolean; concept?: string },
    ) => {
      update((prev) => {
        const tier: TierProgress = prev.tiers[tierId] ?? { unlocked: true, modules: {} };
        const mod = tier.modules[moduleId] ?? createDefaultModuleProgress();
        const conceptKey = meta?.concept;
        const nextProfile =
          typeof meta?.isCorrect === 'boolean'
            ? updateSkillFromQuiz(
                prev.learnerProfile,
                conceptKey ?? moduleId,
                meta.isCorrect,
              )
            : prev.learnerProfile;
        const currentConfidence = conceptKey ? mod.conceptConfidence[conceptKey] ?? 50 : null;
        const nextConfidence =
          conceptKey && typeof meta?.isCorrect === 'boolean'
            ? Math.max(0, Math.min(100, currentConfidence! + (meta.isCorrect ? 6 : -8)))
            : null;

        return {
          ...prev,
          learnerProfile: nextProfile,
          tiers: {
            ...prev.tiers,
            [tierId]: {
              ...tier,
              modules: {
                ...tier.modules,
                [moduleId]: {
                  ...mod,
                  quizAnswers: { ...mod.quizAnswers, [stepId]: answerIndex },
                  conceptConfidence:
                    conceptKey && nextConfidence !== null
                      ? { ...mod.conceptConfidence, [conceptKey]: nextConfidence }
                      : mod.conceptConfidence,
                },
              },
            },
          },
        };
      });
      logActivity({
        type: 'quiz',
        moduleId,
        stepId,
        concept: meta?.concept,
        isCorrect: meta?.isCorrect,
      });
    },
    [update, logActivity],
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
    (tierId: number, moduleId: string, challengeId: string, meta?: { concept?: string }) => {
      update((prev) => {
        const tier: TierProgress = prev.tiers[tierId] ?? { unlocked: true, modules: {} };
        const mod = tier.modules[moduleId] ?? createDefaultModuleProgress();
        const nextChallenges = mod.challengesCompleted.includes(challengeId)
          ? mod.challengesCompleted
          : [...mod.challengesCompleted, challengeId];

        return {
          ...prev,
          learnerProfile: updateSkillFromChallenge(
            prev.learnerProfile,
            meta?.concept ?? moduleId,
          ),
          tiers: {
            ...prev.tiers,
            [tierId]: {
              ...tier,
              modules: {
                ...tier.modules,
                [moduleId]: {
                  ...mod,
                  challengesCompleted: nextChallenges,
                },
              },
            },
          },
        };
      });
      logActivity({ type: 'challenge', moduleId, challengeId });
    },
    [update, logActivity],
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

  const setExpandedConceptNodes = useCallback(
    (tierId: number, moduleId: string, nodeIds: string[]) => {
      updateModule(tierId, moduleId, (mod) => ({
        ...mod,
        expandedConceptNodes: nodeIds,
      }));
    },
    [updateModule],
  );

  // ── Computed stats ──

  const stats = useMemo(() => {
    let totalSteps = 0;
    let totalChallenges = 0;
    let modulesCompleted = 0;

    for (const tier of Object.values(progress.tiers)) {
      for (const mod of Object.values(tier.modules)) {
        totalSteps += mod.stepsCompleted.length;
        totalChallenges += mod.challengesCompleted.length;
        if (mod.status === 'completed') modulesCompleted++;
      }
    }

    return {
      totalSteps,
      totalChallenges,
      modulesCompleted,
      totalActivities: progress.activityLog.length,
      streak: progress.streak,
      activityLog: progress.activityLog,
    };
  }, [progress]);

  return {
    progress,
    isLoaded,
    stats,
    streakJustEarned,
    dismissStreakPopup,
    getModuleProgress,
    updateModule,
    completeStep,
    answerQuiz,
    completeModule,
    completeChallenge,
    setExpandedConceptNodes,
    setLastAccessedStep,
    logActivity,
    update,
  };
}
