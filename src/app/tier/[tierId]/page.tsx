'use client';

import { useParams, useRouter } from 'next/navigation';
import { MODULE_META } from '@/content/registry';
import { useProgress } from '@/hooks/useProgress';

// Tier metadata (will be centralized later)
const TIER_INFO: Record<number, { title: string; emoji: string; description: string }> = {
  0: {
    title: 'Mathematical Foundations',
    emoji: '🟢',
    description: 'Vectors, matrices, calculus, probability — the building blocks of everything in AI.',
  },
  1: { title: 'ML Fundamentals', emoji: '🔵', description: 'Linear regression, gradient descent, classification.' },
  2: { title: 'Deep Learning Core', emoji: '🟣', description: 'Neural networks, backpropagation, CNNs.' },
  3: { title: 'Advanced Architectures', emoji: '🟡', description: 'Transformers, attention, generative models.' },
  4: { title: 'Frontiers & Applications', emoji: '🔴', description: 'Reinforcement learning, multimodal AI, emergence.' },
  5: { title: 'Research & Open Problems', emoji: '🟤', description: 'Alignment, scaling laws, open problems.' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'var(--color-success)',
  intermediate: 'var(--color-info)',
  advanced: 'var(--color-warning)',
  research: 'var(--color-error)',
};

export default function TierOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);

  const tierInfo = TIER_INFO[tierId];
  const modules = MODULE_META.filter((m) => m.tierId === tierId);
  const { getModuleProgress } = useProgress();

  if (!tierInfo) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-base)',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>Tier {tierId} not found.</p>
          <button className="btn btn--primary btn--sm" style={{ marginTop: '1rem' }} onClick={() => router.push('/')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tierColor = `var(--tier-${tierId})`;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Back nav */}
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            padding: '0.25rem 0',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          ← Dashboard
        </button>

        {/* Tier header */}
        <div
          style={{
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>{tierInfo.emoji}</span>
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: tierColor,
                }}
              >
                Tier {tierId}
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {tierInfo.title}
              </h1>
            </div>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '600px' }}>
            {tierInfo.description}
          </p>
        </div>

        {/* Module list */}
        {modules.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🚧</div>
            <p style={{ fontSize: '0.9375rem', margin: 0 }}>
              Modules for this tier are coming soon.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {modules.map((mod, i) => {
              const modProgress = getModuleProgress(tierId, mod.id);
              const stepsCompleted = modProgress.stepsCompleted.length;
              const isStarted = modProgress.status === 'in-progress' || modProgress.status === 'completed';
              const isCompleted = modProgress.status === 'completed';
              const prereqsMet = mod.prerequisites.length === 0 ||
                mod.prerequisites.every((prereq) => {
                  const p = getModuleProgress(tierId, prereq);
                  return p.status === 'completed';
                });

              return (
                <div
                  key={mod.id}
                  onClick={prereqsMet ? () => router.push(`/tier/${tierId}/${mod.id}`) : undefined}
                  role={prereqsMet ? 'button' : undefined}
                  tabIndex={prereqsMet ? 0 : undefined}
                  onKeyDown={
                    prereqsMet
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            router.push(`/tier/${tierId}/${mod.id}`);
                          }
                        }
                      : undefined
                  }
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${i * 0.06}s`,
                    padding: '1.25rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface)',
                    border: `1px solid ${isCompleted ? 'var(--success)' : 'var(--border-subtle)'}`,
                    cursor: prereqsMet ? 'pointer' : 'not-allowed',
                    opacity: prereqsMet ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    transition: 'all var(--transition-normal)',
                  }}
                  onMouseEnter={(e) => {
                    if (prereqsMet) {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isCompleted ? 'var(--success)' : 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Module number / status */}
                  <span
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: isCompleted
                        ? 'var(--success)'
                        : isStarted
                          ? 'var(--accent-soft)'
                          : 'var(--bg-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isCompleted ? '1rem' : '0.875rem',
                      fontWeight: 700,
                      color: isCompleted
                        ? 'white'
                        : isStarted
                          ? 'var(--accent)'
                          : 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? '✓' : i + 1}
                  </span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: 0,
                        }}
                      >
                        {mod.title}
                      </h3>
                      {!prereqsMet && <span style={{ fontSize: '0.75rem' }}>🔒</span>}
                    </div>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {mod.description}
                    </p>
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: DIFFICULTY_COLORS[mod.difficulty] ?? 'var(--text-muted)',
                          background: 'var(--bg-hover)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {mod.difficulty}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        ~{mod.estimatedMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* Progress / arrow */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {isStarted && !isCompleted && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--accent)',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {stepsCompleted} steps done
                      </div>
                    )}
                    {prereqsMet && (
                      <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>→</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
