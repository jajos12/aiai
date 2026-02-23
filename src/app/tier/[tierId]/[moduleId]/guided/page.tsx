'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getModule } from '@/content/registry';
import { useLesson } from '@/hooks/useLesson';
import { useProgress } from '@/hooks/useProgress';
import { StepViewer } from '@/components/lesson/StepViewer';
import { LessonSidebar } from '@/components/lesson/LessonSidebar';
import { ModuleHubSkeleton } from '@/components/ui/Skeleton';
import { StreakPopup, CompletionPopup } from '@/components/ui/CelebrationPopup';
import type { Module } from '@/types/curriculum';

export default function GuidedPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const { completeStep, answerQuiz, getModuleProgress, completeModule, stats, streakJustEarned, dismissStreakPopup } = useProgress();

  // Load module data
  useEffect(() => {
    setLoading(true);
    getModule(moduleId).then((mod) => {
      setModuleData(mod);
      setLoading(false);
    });
  }, [moduleId]);

  const moduleProgress = getModuleProgress(tierId, moduleId);

  const handleCompleteStep = useCallback(
    (stepId: string) => {
      completeStep(tierId, moduleId, stepId);
    },
    [tierId, moduleId, completeStep],
  );

  const handleAnswerQuiz = useCallback(
    (stepId: string, answerIndex: number) => {
      answerQuiz(tierId, moduleId, stepId, answerIndex);
    },
    [tierId, moduleId, answerQuiz],
  );

  const lesson = useLesson({
    steps: moduleData?.steps ?? [],
    tierId,
    moduleId,
    initialStepIndex: 0,
    initialCompletedSteps: moduleProgress.stepsCompleted,
    onCompleteStep: handleCompleteStep,
    onAnswerQuiz: handleAnswerQuiz,
  });

  if (loading) {
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

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
            >
              {Math.round(lesson.progressFraction * 100)}%
            </span>
            <div
              style={{
                width: '120px',
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
          </div>
        </div>

        {/* Step viewer */}
        <div
          style={{
            flex: 1,
            padding: '1.5rem',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <StepViewer
            key={`step-${lesson.currentStepIndex}`}
            step={lesson.currentStep}
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
          />
        </div>
      </div>

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
