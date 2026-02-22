'use client';

import { useProgress } from '@/hooks/useProgress';

export function StreakCounter() {
  const { stats, isLoaded } = useProgress();

  const streakDays = isLoaded ? stats.streak.current : 0;
  const longestStreak = isLoaded ? stats.streak.longest : 0;
  const modulesCompleted = isLoaded ? stats.modulesCompleted : 0;
  const totalSteps = isLoaded ? stats.totalSteps : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '1rem',
        padding: '1.25rem',
      }}
      className="card"
    >
      {/* Streak fire */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '2.5rem',
            lineHeight: 1,
            filter: streakDays > 0 ? 'none' : 'grayscale(0.8)',
            opacity: streakDays > 0 ? 1 : 0.5,
          }}
        >
          🔥
        </span>
        <span
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: streakDays > 0 ? 'var(--accent)' : 'var(--text-muted)',
            marginTop: '0.25rem',
          }}
        >
          {streakDays}
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          day streak
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          background: 'var(--border-subtle)',
        }}
      />

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          justifyContent: 'center',
        }}
      >
        <StatRow label="Longest streak" value={`${longestStreak} day${longestStreak !== 1 ? 's' : ''}`} />
        <StatRow label="Steps completed" value={String(totalSteps)} />
        <StatRow label="Modules done" value={String(modulesCompleted)} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          minWidth: '120px',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
