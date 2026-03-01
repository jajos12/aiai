'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getModule } from '@/core/registry';
import { useProgress } from '@/hooks/useProgress';
import type { Module, Challenge } from '@/core/types';

// ─── Challenge detail view ────────────────────────────────────────────────

function ChallengeDetail({
  challenge,
  moduleData,
  tierId,
  moduleId,
  onBack,
}: {
  challenge: Challenge;
  moduleData: Module;
  tierId: number;
  moduleId: string;
  onBack: () => void;
}) {
  const [hintRevealed, setHintRevealed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { getModuleProgress, completeChallenge } = useProgress();
  const progress = getModuleProgress(tierId, moduleId);
  const isAlreadyDone = progress.challengesCompleted.includes(challenge.id);

  const handleComplete = useCallback(() => {
    setCompleted(true);
    completeChallenge(tierId, moduleId, challenge.id);
  }, [challenge.id, tierId, moduleId, completeChallenge]);

  const isDone = completed || isAlreadyDone;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', flexShrink: 0, gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            ← Challenges
          </button>
          <span style={{ color: 'var(--border-default)' }}>/</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{challenge.title}</span>
        </div>
        {isDone && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', padding: '0.25rem 0.875rem', borderRadius: '999px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
            ✓ Completed
          </span>
        )}
      </div>

      {/* Body: viz + sidebar */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Full-height visualization canvas */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {moduleData.ChallengeCanvas ? (
            <div style={{ width: '100%', height: '100%' }}>
              <moduleData.ChallengeCanvas challenge={challenge} onComplete={handleComplete} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No challenge canvas available.
            </div>
          )}

          {/* Completion banner overlay */}
          {isDone && (
            <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(52,211,153,0.95)', borderRadius: 10, padding: '0.5rem 1.5rem', color: '#064e3b', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 20px rgba(52,211,153,0.4)', zIndex: 20, whiteSpace: 'nowrap' }}>
              🏆 Challenge complete!
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ width: '300px', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>

          {/* Description */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              {challenge.title}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>
              {challenge.description}
            </p>
          </div>

          {/* Goal */}
          <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>🎯 Goal</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: 'monospace' }}>
              {challenge.completionCriteria.metric}
            </div>
          </div>

          {/* Hints revealed one at a time */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Hints</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {challenge.hints.map((hint, i) => (
                  <div key={i}>
                    {i < hintRevealed ? (
                      <div style={{ padding: '0.5rem 0.75rem', borderRadius: 6, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        <span style={{ color: '#fbbf24', fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>{hint}
                      </div>
                    ) : i === hintRevealed ? (
                      <button
                        onClick={() => setHintRevealed(h => h + 1)}
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 6, background: 'var(--bg-hover)', border: '1px dashed rgba(251,191,36,0.35)', fontSize: '0.78rem', color: '#fbbf24', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                      >
                        💡 Reveal hint {i + 1}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual complete button */}
          {!isDone && (
            <button
              onClick={handleComplete}
              style={{ marginTop: 'auto', padding: '0.65rem 1rem', borderRadius: 8, background: '#6366f1', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-heading)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              ✓ Mark as Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Challenge list view ──────────────────────────────────────────────────

const DIFFICULTY_META = [
  { icon: '🟢', label: 'Starter' },
  { icon: '🟡', label: 'Intermediate' },
  { icon: '🔴', label: 'Advanced' },
];

function ChallengeList({
  moduleData,
  tierId,
  moduleId,
  onSelect,
  onBack,
}: {
  moduleData: Module;
  tierId: number;
  moduleId: string;
  onSelect: (c: Challenge) => void;
  onBack: () => void;
}) {
  const { getModuleProgress } = useProgress();
  const progress = getModuleProgress(tierId, moduleId);
  const total = moduleData.challenges.length;
  const done = progress.challengesCompleted.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)', padding: '2rem 2rem 3rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* Back */}
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', padding: '0.25rem 0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          ← {moduleData.title}
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.375rem 0' }}>🏆 Challenges</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
            Put your knowledge to the test — {done} of {total} completed
          </p>
          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#34d399)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Challenge cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {moduleData.challenges.map((challenge, idx) => {
            const isCompleted = progress.challengesCompleted.includes(challenge.id);
            const meta = DIFFICULTY_META[Math.min(idx, DIFFICULTY_META.length - 1)];
            return (
              <div
                key={challenge.id}
                onClick={() => onSelect(challenge)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(challenge); } }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = isCompleted ? 'rgba(52,211,153,0.5)' : 'rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = isCompleted ? 'rgba(52,211,153,0.25)' : 'var(--border-subtle)'; }}
                style={{ padding: '1.125rem 1.375rem', borderRadius: 12, background: 'var(--bg-surface)', border: `1px solid ${isCompleted ? 'rgba(52,211,153,0.25)' : 'var(--border-subtle)'}`, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '1rem', transition: 'all 0.15s ease', outline: 'none' }}
              >
                {/* Status circle */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isCompleted ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)', border: `2px solid ${isCompleted ? '#34d399' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                  {isCompleted ? '✓' : meta.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{challenge.title}</h3>
                    <span style={{ fontSize: '0.7rem', color: isCompleted ? '#34d399' : 'var(--text-muted)', fontWeight: 500 }}>{isCompleted ? 'completed' : meta.label}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                    {challenge.description.length > 120 ? challenge.description.slice(0, 120) + '…' : challenge.description}
                  </p>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'rgba(99,102,241,0.8)', fontFamily: 'monospace', background: 'rgba(99,102,241,0.08)', display: 'inline-block', padding: '2px 8px', borderRadius: 4 }}>
                    🎯 {challenge.completionCriteria.metric}
                  </div>
                </div>

                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', alignSelf: 'center', flexShrink: 0 }}>→</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    setLoading(true);
    getModule(moduleId).then(mod => { setModuleData(mod); setLoading(false); });
  }, [moduleId]);

  if (loading || !moduleData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topnav-height))', background: 'var(--bg-base)', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        Loading challenges…
      </div>
    );
  }

  if (selectedChallenge) {
    return (
      <ChallengeDetail
        challenge={selectedChallenge}
        moduleData={moduleData}
        tierId={tierId}
        moduleId={moduleId}
        onBack={() => setSelectedChallenge(null)}
      />
    );
  }

  return (
    <ChallengeList
      moduleData={moduleData}
      tierId={tierId}
      moduleId={moduleId}
      onSelect={setSelectedChallenge}
      onBack={() => router.push(`/tier/${tierId}/${moduleId}`)}
    />
  );
}
