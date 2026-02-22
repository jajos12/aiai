'use client';

export function StreakCounter() {
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
        <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🔥</span>
        <span
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            marginTop: '0.25rem',
          }}
        >
          0
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
        <StatRow label="Longest streak" value="0 days" />
        <StatRow label="Modules completed" value="0" />
        <StatRow label="Time learning" value="0h 0m" />
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
