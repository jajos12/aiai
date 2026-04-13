'use client';

import { useCallback, useState } from 'react';
import type { Challenge } from '@/core/types';
import PartialDerivativesVisualization, {
  type PartialDerivativesSceneState,
} from './Visualization';

interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}

function scoreChallenge(challenge: Challenge, state: PartialDerivativesSceneState): number {
  switch (challenge.id) {
    case 'freeze-x':
      return Math.abs(state.partialX) + Math.max(0, 0.8 - Math.abs(state.partialY));
    case 'find-stationary':
      return state.gradientMagnitude;
    case 'mixed-signs':
      return Math.max(0, 0.9 - state.partialX) + Math.max(0, state.partialY + 0.9);
    default:
      return 999;
  }
}

export function ChallengeCanvas({ challenge, onComplete }: ChallengeCanvasProps) {
  const [, setSceneState] = useState<PartialDerivativesSceneState | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const threshold =
    typeof challenge.completionCriteria.target === 'number'
      ? challenge.completionCriteria.target
      : 0.08;

  const handleStateChange = useCallback(
    (nextState: PartialDerivativesSceneState) => {
      setSceneState(nextState);
      const nextScore = scoreChallenge(challenge, nextState);
      setScore(nextScore);

      if (!completed && nextScore <= threshold) {
        setCompleted(true);
        setShowSuccess(true);
        onComplete();
      }
    },
    [challenge, completed, onComplete, threshold],
  );

  const scoreColor =
    score === null
      ? 'var(--text-muted)'
      : score <= threshold
        ? '#34d399'
        : score <= Math.max(threshold * 4, 0.2)
          ? '#fbbf24'
          : '#f87171';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <PartialDerivativesVisualization
        {...(challenge.props ?? {})}
        onStateChange={handleStateChange}
      />

      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          minWidth: 180,
          padding: '0.8rem 0.9rem',
          borderRadius: 12,
          background: 'rgba(15, 17, 23, 0.88)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          fontSize: '0.78rem',
        }}
      >
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.55rem',
          }}
        >
          Challenge Score
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>score</span>
          <span style={{ color: scoreColor, fontFamily: 'monospace', fontWeight: 700 }}>
            {score === null ? '-' : score.toFixed(3)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>threshold</span>
          <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 700 }}>
            {threshold}
          </span>
        </div>
      </div>

      {showSuccess && (
        <button
          type="button"
          onClick={() => setShowSuccess(false)}
          style={{
            position: 'absolute',
            inset: 0,
            border: 'none',
            background: 'rgba(15, 17, 23, 0.62)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              padding: '1.6rem 1.8rem',
              borderRadius: 16,
              background: 'var(--bg-surface)',
              border: '1px solid rgba(52,211,153,0.4)',
              boxShadow: '0 18px 48px rgba(0,0,0,0.35)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.4rem' }}>
              Challenge Complete
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              You are reading the surface correctly now.
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
