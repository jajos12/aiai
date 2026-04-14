'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLesson } from '@/hooks/useLesson';
import { useModuleData } from '@/hooks/useModuleData';
import { useProgress } from '@/hooks/useProgress';
import { StepViewer } from '@/components/lesson/StepViewer';
import { LessonSidebar } from '@/components/lesson/LessonSidebar';
import { ExplanationLevelToggle } from '@/components/lesson/ExplanationLevelToggle';
import { TutorChat } from '@/components/lesson/TutorChat';
import { ModuleHubSkeleton } from '@/components/ui/Skeleton';
import { StreakPopup, CompletionPopup } from '@/components/ui/CelebrationPopup';
import { stepIdsForConcept } from '@/core/moduleConceptTree';
import type { ExplainLevel, StepExplanation } from '@/types/tutor';

export default function GuidedPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusStepId = searchParams.get('step');
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const { moduleData, isLoading } = useModuleData(moduleId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [explanationLevel, setExplanationLevel] = useState<ExplainLevel>('standard');
  const [isGeneratingLevel, setIsGeneratingLevel] = useState(false);
  const [levelError, setLevelError] = useState<string | null>(null);
  const {
    completeStep,
    answerQuiz,
    getModuleProgress,
    completeModule,
    setExpandedConceptNodes,
    progress,
    stats,
    streakJustEarned,
    dismissStreakPopup,
  } = useProgress();

  const moduleProgress = getModuleProgress(tierId, moduleId);
  const hasStudyArtifacts = progress.learnerProfile.skillByConcept !== undefined;
  const reviewQueue = useMemo(() => {
    const entries = Object.entries(moduleProgress.conceptConfidence ?? {});
    return entries.sort((a, b) => a[1] - b[1]).slice(0, 3);
  }, [moduleProgress.conceptConfidence]);

  useEffect(() => {
    if (!hasStudyArtifacts || reviewQueue.length === 0) return;
    if (!moduleData) return;
    if ((moduleProgress.expandedConceptNodes ?? []).length > 0) return;
    const stepIds = reviewQueue.flatMap(([concept]) => stepIdsForConcept(moduleData, concept));
    const unique = Array.from(new Set(stepIds));
    if (unique.length === 0) return;
    setExpandedConceptNodes(tierId, moduleId, unique);
  }, [
    hasStudyArtifacts,
    reviewQueue,
    moduleProgress.expandedConceptNodes,
    setExpandedConceptNodes,
    tierId,
    moduleId,
    moduleData,
  ]);

  const handleCompleteStep = useCallback(
    (stepId: string) => {
      completeStep(tierId, moduleId, stepId);
    },
    [tierId, moduleId, completeStep],
  );

  const handleAnswerQuiz = useCallback(
    (stepId: string, answerIndex: number) => {
      const step = moduleData?.steps.find((lessonStep) => lessonStep.id === stepId);
      const isCorrect = step?.quiz ? step.quiz.correctIndex === answerIndex : undefined;
      answerQuiz(tierId, moduleId, stepId, answerIndex, {
        isCorrect,
        concept: step?.concepts?.[0] ?? moduleData?.clusterId ?? moduleId,
      });
    },
    [tierId, moduleId, answerQuiz, moduleData],
  );

  const initialStepIndex = useMemo(() => {
    const steps = moduleData?.steps ?? [];
    if (!focusStepId || steps.length === 0) return 0;
    const idx = steps.findIndex((s) => s.id === focusStepId);
    return idx >= 0 ? idx : 0;
  }, [moduleData, focusStepId]);

  const lesson = useLesson({
    steps: moduleData?.steps ?? [],
    tierId,
    moduleId,
    initialStepIndex,
    initialCompletedSteps: moduleProgress.stepsCompleted,
    onCompleteStep: handleCompleteStep,
    onAnswerQuiz: handleAnswerQuiz,
  });

  useEffect(() => {
    if (!moduleData?.steps.length || !focusStepId) return;
    const idx = moduleData.steps.findIndex((s) => s.id === focusStepId);
    if (idx >= 0 && idx !== lesson.currentStepIndex) {
      lesson.goToStep(idx);
    }
  }, [focusStepId, moduleData, lesson.currentStepIndex, lesson.goToStep]);

  const handleLevelChange = useCallback(
    async (newLevel: ExplainLevel) => {
      setExplanationLevel(newLevel);
      setLevelError(null);
      const currentStep = lesson.currentStep;
      if (newLevel === 'standard') {
        lesson.clearStepContentOverride(currentStep.id);
        return;
      }
      if (lesson.currentStepContentOverride && explanationLevel === newLevel) return;
      setIsGeneratingLevel(true);
      try {
        const res = await fetch('/api/ai/explain-level', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId, stepId: currentStep.id, level: newLevel }),
        });
        if (res.ok) {
          const data = (await res.json()) as StepExplanation;
          if (data.text) {
            lesson.overrideStepContent(currentStep.id, data);
          } else {
            setLevelError('AI returned empty content. Try again.');
          }
        } else {
          const err = await res.json().catch(() => ({})) as { error?: string };
          setLevelError(err.error ?? `AI generation failed (${res.status}). Try again.`);
        }
      } catch {
        setLevelError('Network error. Check your connection and try again.');
      } finally {
        setIsGeneratingLevel(false);
      }
    },
    [lesson, moduleId, explanationLevel],
  );

  useEffect(() => {
    if (explanationLevel === 'standard') return;
    if (lesson.currentStepContentOverride) return;
    handleLevelChange(explanationLevel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.currentStepIndex, explanationLevel]);

  if (isLoading) {
    return <ModuleHubSkeleton />;
  }

  if (!moduleData) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - var(--topnav-height))',
          background: 'var(--bg-base)',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>Module &quot;{moduleId}&quot; not found.</p>
          <button
            className="btn btn--primary btn--sm"
            style={{ marginTop: '1rem' }}
            onClick={() => router.push('/')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - var(--topnav-height))',
        background: 'var(--bg-base)',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <LessonSidebar
        steps={moduleData.steps}
        currentStepIndex={lesson.currentStepIndex}
        completedSteps={lesson.completedSteps}
        onSelectStep={lesson.goToStep}
        moduleTitle={moduleData.title}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>
            <button
              onClick={() => router.push(`/tier/${tierId}/${moduleId}`)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                padding: '0.25rem 0',
              }}
            >
              ← {moduleData.title}
            </button>
            <span style={{ color: 'var(--border-default)' }}>/</span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--accent)',
              }}
            >
              Guided
            </span>
          </div>

          {/* Right side: level toggle + progress + tutor button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ExplanationLevelToggle
              level={explanationLevel}
              onChange={handleLevelChange}
              isLoading={isGeneratingLevel}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {Math.round(lesson.progressFraction * 100)}%
            </span>
            <div
              style={{
                width: '80px',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--bg-hover)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${lesson.progressFraction * 100}%`,
                  borderRadius: '2px',
                  background: 'var(--accent)',
                  transition: 'width var(--transition-base)',
                }}
              />
            </div>
            <button
              onClick={() => setTutorOpen((v) => !v)}
              className="btn btn--ghost btn--sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: tutorOpen ? 'rgba(99,102,241,0.15)' : undefined,
                borderColor: tutorOpen ? 'var(--accent)' : undefined,
              }}
              title="AI Tutor"
            >
              🤖 Tutor
            </button>
          </div>
        </div>

        {/* Step viewer */}
        <div
          style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
          }}
        >
          <div
            style={{
              marginBottom: '0.85rem',
              padding: '0.7rem 0.8rem',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99,102,241,0.08)',
            }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.5rem' }}>
              Study tools
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => router.push(`/tier/${tierId}/${moduleId}/guided/concept-tree`)}
              >
                Open lesson map
              </button>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => router.push(`/tier/${tierId}/${moduleId}/guided/flashcards`)}
              >
                Open Flashcards
              </button>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => router.push(`/tier/${tierId}/${moduleId}/guided/quizzes`)}
              >
                Open Adaptive Quizzes
              </button>
            </div>
          </div>
          {reviewQueue.length > 0 && (
            <div
              style={{
                marginBottom: '0.75rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Review queue:
              </span>
              {reviewQueue.map(([concept, score]) => (
                <button
                  key={concept}
                  className="btn btn--ghost btn--sm"
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => {
                    const stepIds = stepIdsForConcept(moduleData, concept);
                    const nextExpanded = Array.from(
                      new Set([...(moduleProgress.expandedConceptNodes ?? []), ...stepIds]),
                    );
                    setExpandedConceptNodes(tierId, moduleId, nextExpanded);
                    router.push(`/tier/${tierId}/${moduleId}/guided/concept-tree`);
                  }}
                >
                  {concept} ({Math.round(score)}%)
                </button>
              ))}
            </div>
          )}
          <div>
            <StepViewer
              key={`step-${lesson.currentStepIndex}`}
              step={lesson.currentStep}
              Visualization={moduleData.Visualization}
              direction={lesson.navigationDirection}
              stepIndex={lesson.currentStepIndex}
              totalSteps={lesson.totalSteps}
              isCompleted={lesson.completedSteps.has(lesson.currentStep.id)}
              quizAnswer={lesson.quizAnswers[lesson.currentStep.id]}
              onComplete={lesson.completeCurrentStep}
              onNext={lesson.goNext}
              onBack={lesson.goBack}
              onQuizAnswer={lesson.submitQuizAnswer}
              canGoNext={lesson.canGoNext}
              canGoBack={lesson.canGoBack}
              isLastStep={lesson.isLastStep}
              onFinishModule={() => {
                completeModule(tierId, moduleId);
                setShowCompletion(true);
              }}
              contentOverride={lesson.currentStepContentOverride}
              isGeneratingLevel={isGeneratingLevel}
              levelError={levelError}
              onClearLevelError={() => setLevelError(null)}
            />
          </div>
        </div>
      </div>

      {/* AI Tutor chat panel */}
      <TutorChat
        open={tutorOpen}
        onClose={() => setTutorOpen(false)}
        moduleId={moduleId}
        moduleTitle={moduleData.title}
        stepId={lesson.currentStep.id}
        level={explanationLevel}
        learnerProfile={progress.learnerProfile}
      />

      {/* Streak celebration popup */}
      <StreakPopup
        streakDays={stats.streak.current}
        show={streakJustEarned}
        onClose={dismissStreakPopup}
      />

      {/* Module completion popup */}
      <CompletionPopup
        moduleName={moduleData.title}
        show={showCompletion}
        onClose={() => {
          setShowCompletion(false);
          router.push(`/tier/${tierId}/${moduleId}`);
        }}
      />
    </div>
  );
}
