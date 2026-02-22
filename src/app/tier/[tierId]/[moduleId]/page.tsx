'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getModule } from '@/content/registry';
import { useProgress } from '@/hooks/useProgress';
import { ModuleHubSkeleton } from '@/components/ui/Skeleton';
import type { Module } from '@/types/curriculum';

export default function ModuleHubPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const { getModuleProgress } = useProgress();

  useEffect(() => {
    setLoading(true);
    getModule(moduleId).then((mod) => {
      setModuleData(mod);
      setLoading(false);
    });
  }, [moduleId]);

  const progress = getModuleProgress(tierId, moduleId);

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
          height: '100vh',
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

  const guidedCompleted = progress.stepsCompleted.length;
  const guidedTotal = moduleData.steps.length;
  const guidedFraction = guidedTotal > 0 ? guidedCompleted / guidedTotal : 0;
  const challengesCompleted = progress.challengesCompleted.length;
  const challengesTotal = moduleData.challenges.length;
  const basePath = `/tier/${tierId}/${moduleId}`;

  const phases = [
    {
      id: 'guided',
      emoji: '📖',
      title: 'Guided Exploration',
      description: `Walk through ${guidedTotal} interactive steps with visualizations, quizzes, and go-deeper sections.`,
      progress: guidedFraction,
      progressLabel: `${guidedCompleted}/${guidedTotal} steps`,
      available: true,
      href: `${basePath}/guided`,
    },
    {
      id: 'playground',
      emoji: '🧪',
      title: 'Free Playground',
      description: moduleData.playground.description,
      progress: progress.playgroundVisited ? 1 : 0,
      progressLabel: progress.playgroundVisited ? 'Visited' : 'Not started',
      available: guidedFraction >= 0.5,
      href: `${basePath}/playground`,
    },
    {
      id: 'challenge',
      emoji: '🏆',
      title: 'Challenges',
      description: `${challengesTotal} challenges to test your understanding.`,
      progress: challengesTotal > 0 ? challengesCompleted / challengesTotal : 0,
      progressLabel: `${challengesCompleted}/${challengesTotal} completed`,
      available: guidedFraction >= 0.8,
      href: `${basePath}/challenge`,
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
      {/* Header */}
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
          ← Dashboard
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
                color: 'var(--tier-0)',
              }}
            >
              Tier {tierId}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>•</span>
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

          {/* Tags */}
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

        {/* Phase cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {phases.map((phase) => (
            <div
              key={phase.id}
              onClick={phase.available ? () => router.push(phase.href) : undefined}
              role={phase.available ? 'button' : undefined}
              tabIndex={phase.available ? 0 : undefined}
              onKeyDown={
                phase.available
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(phase.href);
                      }
                    }
                  : undefined
              }
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                cursor: phase.available ? 'pointer' : 'not-allowed',
                opacity: phase.available ? 1 : 0.5,
                transition: 'all var(--transition-normal)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
              onMouseEnter={(e) => {
                if (phase.available) {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
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
                  {!phase.available && (
                    <span style={{ fontSize: '0.75rem' }}>🔒</span>
                  )}
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
              </div>

              {/* Progress indicator */}
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
          ))}
        </div>

        {/* Try This suggestions (from playground) */}
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
              💡 Try This
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
                    →
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
