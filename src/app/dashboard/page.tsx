'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { TierCard } from '@/components/dashboard/TierCard';
import { StreakCounter } from '@/components/dashboard/StreakCounter';
import { ActivityCalendar } from '@/components/dashboard/ActivityCalendar';
import { getTierSummaries } from '@/core/curriculum';
import { recommendNextModule } from '@/core/personalization';
import { MODULE_META } from '@/core/registry';
import { useProgress } from '@/hooks/useProgress';

type StoredUser = {
  name?: string;
  email?: string;
};

type StatCard = {
  label: string;
  value: string;
  hint: string;
  icon: string;
};

function toTitle(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getLastNDates(days: number): Set<string> {
  const dates = new Set<string>();
  const now = new Date();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.add(d.toISOString().split('T')[0]);
  }
  return dates;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <h2
        style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default function PersonalizedDashboardPage() {
  const router = useRouter();
  const { progress, isLoaded, stats } = useProgress();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { user?: { name?: string; email?: string } };
        if (cancelled) return;
        if (data.user) {
          setUser({ name: data.user.name, email: data.user.email });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const tiers = getTierSummaries(isLoaded ? progress : undefined);
  const nextRecommendation = isLoaded ? recommendNextModule(progress) : null;
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? 'Learner';
  const greeting = useMemo(() => getTimeGreeting(), []);

  const weakConcept = isLoaded ? progress.learnerProfile.weakConcepts[0] : null;
  const strongConcept = isLoaded ? progress.learnerProfile.strongConcepts[0] : null;
  const preferredPace = isLoaded ? progress.learnerProfile.preferredPace : 'normal';
  const paceHint =
    preferredPace === 'slow'
      ? 'Take your time and focus on understanding each step.'
      : preferredPace === 'fast'
        ? 'You move quickly, so we prioritize concise explanations.'
        : 'Balanced learning mode is active for you.';
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = isLoaded
    ? progress.activityLog.filter((entry) => entry.date === today).length
    : 0;
  const dailyGoal = preferredPace === 'slow' ? 2 : preferredPace === 'fast' ? 5 : 3;
  const dailyGoalProgress = Math.min(100, Math.round((todayActivities / dailyGoal) * 100));
  const inProgressModule = isLoaded
    ? MODULE_META.find((meta) => {
        const status = progress.tiers[meta.tierId]?.modules[meta.id]?.status;
        return status === 'in-progress';
      })
    : null;
  const recentDateSet = useMemo(() => getLastNDates(7), []);
  const weeklyActivities = isLoaded
    ? progress.activityLog.filter((entry) => recentDateSet.has(entry.date))
    : [];
  const weeklySteps = weeklyActivities.filter((entry) => entry.type === 'step').length;
  const weeklyQuizzes = weeklyActivities.filter((entry) => entry.type === 'quiz').length;
  const weeklyCorrectRate = (() => {
    const quizEntries = weeklyActivities.filter(
      (entry) => entry.type === 'quiz' && typeof entry.isCorrect === 'boolean',
    );
    if (quizEntries.length === 0) return null;
    const correct = quizEntries.filter((entry) => entry.isCorrect).length;
    return Math.round((correct / quizEntries.length) * 100);
  })();
  const recentConcepts = isLoaded
    ? Array.from(
        new Set(
          [...progress.learnerProfile.weakConcepts, ...progress.learnerProfile.strongConcepts]
            .filter(Boolean)
            .slice(0, 4),
        ),
      )
    : [];
  const modulesCompleted = isLoaded ? stats.modulesCompleted : 0;
  const currentStreak = isLoaded ? stats.streak.current : 0;
  const kpiCards: StatCard[] = [
    { label: 'Current streak', value: `${currentStreak} days`, hint: 'Keep your momentum alive', icon: '🔥' },
    { label: 'Modules completed', value: String(modulesCompleted), hint: 'Your long-term progress', icon: '✅' },
    { label: 'Today actions', value: `${todayActivities}/${dailyGoal}`, hint: 'Daily goal tracker', icon: '🎯' },
    {
      label: 'Weekly accuracy',
      value: typeof weeklyCorrectRate === 'number' ? `${weeklyCorrectRate}%` : 'N/A',
      hint: 'Quiz correctness last 7 days',
      icon: '📈',
    },
  ];

  return (
    <div
      className="bg-mesh"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 1.5rem',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            {greeting}, {firstName}
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: '600px',
            }}
          >
            Your AI Playground is tuned to your progress, pace, and recent activity.
          </p>
        </div>

        <SectionTitle
          title="Snapshot"
          subtitle="At-a-glance metrics from your recent learning activity."
        />
        <div
          className="animate-fade-in"
          style={{
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {kpiCards.map((card) => (
            <div
              key={card.label}
              style={{
                padding: '0.95rem 1rem',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ fontSize: '1rem', lineHeight: 1, marginBottom: '0.35rem' }}>{card.icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {card.label}
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '0.15rem', fontSize: '1.1rem' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{card.hint}</div>
            </div>
          ))}
        </div>

        <SectionTitle
          title="Personal Plan"
          subtitle="Your adaptive pace, concept focus, and the best immediate next step."
        />
        <div
          className="animate-fade-in"
          style={{
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1fr)',
            gap: '1rem',
          }}
        >
          <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Your pace
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
              {toTitle(preferredPace)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{paceHint}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.8rem' }}>
              Focus concept
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
              {weakConcept ? toTitle(weakConcept) : 'No weak concepts right now'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {weakConcept ? 'We will surface more practice for this area.' : 'Keep momentum with your next module.'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.8rem' }}>
              Strongest concept
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
              {strongConcept ? toTitle(strongConcept) : 'Still building your profile'}
            </div>
          </div>
          <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Daily goal
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
              {todayActivities}/{dailyGoal} learning actions
            </div>
            <div
              style={{
                marginTop: '0.5rem',
                height: '8px',
                borderRadius: '999px',
                background: 'var(--bg-hover)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${dailyGoalProgress}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  transition: 'width var(--transition-normal)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {todayActivities >= dailyGoal ? 'Goal achieved. Great consistency today.' : 'Keep going to hit your daily target.'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Resume learning
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
              {inProgressModule ? inProgressModule.title : 'No module in progress'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {inProgressModule
                ? 'Pick up where you left off with one click.'
                : 'Start the next recommended module to build momentum.'}
            </div>
            <button
              className="btn btn--primary btn--sm"
              style={{ marginTop: '0.6rem' }}
              onClick={() => {
                if (inProgressModule) {
                  router.push(`/tier/${inProgressModule.tierId}/${inProgressModule.id}`);
                  return;
                }
                if (nextRecommendation) {
                  router.push(`/tier/${nextRecommendation.tierId}/${nextRecommendation.moduleId}`);
                }
              }}
              disabled={!inProgressModule && !nextRecommendation}
            >
              {inProgressModule ? 'Resume' : 'Start next'}
            </button>
          </div>
        </div>

        <SectionTitle
          title="Weekly Review"
          subtitle="Performance trend and concepts you have been strengthening."
        />
        <div
          className="animate-fade-in"
          style={{
            marginBottom: '1.25rem',
            padding: '1rem 1.25rem',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Weekly insights
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
              {weeklyActivities.length} learning actions in last 7 days
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {weeklySteps} steps completed, {weeklyQuizzes} quizzes attempted
              {typeof weeklyCorrectRate === 'number' ? `, ${weeklyCorrectRate}% correct` : ''}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Recently studied concepts
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
              {recentConcepts.length > 0 ? (
                recentConcepts.map((concept) => (
                  <span
                    key={concept}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent)',
                      background: 'var(--accent-soft)',
                    }}
                  >
                    {toTitle(concept)}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Complete a few quizzes and challenges to build concept insights.
                </span>
              )}
            </div>
          </div>
        </div>

        {nextRecommendation && (
          <>
            <SectionTitle title="Recommended Next Lesson" />
          <div
            className="animate-fade-in"
            style={{
              marginBottom: '1.25rem',
              padding: '1rem 1.25rem',
              border: '1px solid var(--accent-soft)',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.2rem' }}>
                Personalized next lesson for {firstName}
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {nextRecommendation.title}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {nextRecommendation.reason}
              </div>
            </div>
            <button
              className="btn btn--primary btn--sm"
              onClick={() =>
                router.push(
                  `/tier/${nextRecommendation.tierId}/${nextRecommendation.moduleId}`,
                )
              }
            >
              Open
            </button>
          </div>
          </>
        )}

        <SectionTitle title="Consistency" subtitle="Streak and activity density over time." />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
          }}
          className="animate-fade-in"
        >
          <StreakCounter />
          <ActivityCalendar />
        </div>

        <SectionTitle title="Learning Path" subtitle="Choose a tier and continue building your AI foundations." />

        <div
          className="stagger-children responsive-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1rem',
          }}
        >
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <TierCard
                {...tier}
                onClick={() => router.push(`/tier/${tier.id}`)}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
