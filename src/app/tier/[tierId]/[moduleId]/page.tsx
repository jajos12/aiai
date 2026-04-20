'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProgress } from '@/hooks/useProgress';
import { useModuleData } from '@/hooks/useModuleData';
import { ModuleHubSkeleton } from '@/components/ui/Skeleton';

export default function ModuleHubPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const { moduleData, isLoading } = useModuleData(moduleId);
  const { getModuleProgress } = useProgress();

  const progress = getModuleProgress(tierId, moduleId);

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
          <div style={{ fontSize: '2.25rem', marginBottom: '1rem', fontWeight: 700 }}>404</div>
          <p>Module &quot;{moduleId}&quot; not found.</p>
          <button
            className="btn btn--primary btn--sm"
            style={{ marginTop: '1rem' }}
            onClick={() => router.push('/')}
          >
            &larr; Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const guidedCompleted = progress.stepsCompleted.length;
  const guidedTotal = moduleData.steps.length;
  const guidedFraction = guidedTotal > 0 ? guidedCompleted / guidedTotal : 0;
  const basePath = `/tier/${tierId}/${moduleId}`;

  const phases = [
    {
      id: 'guided',
      emoji: moduleData.steps.length > 0 ? '\uD83D\uDCD6' : '\uD83D\uDCC4',
      title: 'Guided Exploration',
      description: `Walk through ${guidedTotal} interactive steps with visualizations, quizzes, and go-deeper sections.`,
      progress: guidedFraction,
      progressLabel: `${guidedCompleted}/${guidedTotal} steps`,
      recommendation: guidedFraction < 1 ? 'Recommended next' : null,
      href: `${basePath}/guided`,
    },
    {
      id: 'playground',
      emoji: '\uD83E\uDDEA',
      title: 'Free Playground',
      description: moduleData.playground.description,
      progress: progress.playgroundVisited ? 1 : 0,
      progressLabel: progress.playgroundVisited ? 'Visited' : 'Not started',
      recommendation:
        guidedFraction >= 0.5
          ? progress.playgroundVisited
            ? null
            : 'Recommended next'
          : 'Recommended after ~50% of guided exploration',
      href: `${basePath}/playground`,
    },
  ];

  return (
    <div
      className="page-wrapper bg-mesh"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          &larr; Dashboard
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.375rem',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: `var(--tier-${tierId})`,
              }}
            >
              Tier {tierId}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>&bull;</span>
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              ~{moduleData.estimatedMinutes} min
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            {moduleData.title}
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '600px',
            }}
          >
            {moduleData.description}
          </p>

          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {moduleData.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {phases.map((phase) => {
            const borderColor =
              phase.recommendation === 'Recommended next' ? 'var(--accent)' : 'var(--border-subtle)';

            return (
              <div
                key={phase.id}
                onClick={() => router.push(phase.href)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(phase.href);
                  }
                }}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface)',
                  border: `1px solid ${borderColor}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    borderColor === 'var(--border-subtle)' ? 'var(--border-default)' : borderColor;
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span style={{ fontSize: '2rem' }}>{phase.emoji}</span>

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
                      {phase.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {phase.description}
                  </p>
                  {phase.recommendation && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color:
                          phase.recommendation === 'Recommended next'
                            ? 'var(--accent)'
                            : 'var(--text-muted)',
                        marginTop: '0.5rem',
                      }}
                    >
                      {phase.recommendation}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '80px' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: phase.progress >= 1 ? 'var(--success)' : 'var(--text-muted)',
                      marginBottom: '0.375rem',
                    }}
                  >
                    {phase.progressLabel}
                  </div>
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
                        width: `${phase.progress * 100}%`,
                        borderRadius: '2px',
                        background: phase.progress >= 1 ? 'var(--success)' : 'var(--accent)',
                        transition: 'width var(--transition-base)',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {moduleData.playground.tryThis && moduleData.playground.tryThis.length > 0 && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 0.75rem 0',
              }}
            >
              Try This
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {moduleData.playground.tryThis.map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    paddingLeft: '1rem',
                    position: 'relative',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: 'var(--accent)',
                    }}
                  >
                    &rarr;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
