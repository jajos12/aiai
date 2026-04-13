'use client';

import { useState, useEffect } from 'react';
import type { Challenge } from '@/core/types';
import Visualization from './Visualization';

interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}

export function ChallengeCanvas({ challenge, onComplete }: ChallengeCanvasProps) {
  const [loss, setLoss] = useState(999);
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const threshold =
    typeof challenge.completionCriteria.target === 'number'
      ? challenge.completionCriteria.target
      : 0.2;

  // We need to calculate loss dynamically based on the current props mapped from module parameters
  useEffect(() => {
     if (!challenge.props) return;
     const points = (challenge.props.points as {x: number, y: number, class: number}[]) || [];
     const weights = (challenge.props.weights as {w1: number, w2?: number, b: number}) || { w1: 1, w2: 1, b: -8 };
     
     const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
     let currentLoss = 0;
     for (const p of points) {
        let z = weights.w1 * p.x + weights.b;
        if (weights.w2 !== undefined) {
           z += weights.w2 * p.y;
        }
        const prob = sigmoid(z);
        const eps = 1e-15;
        currentLoss += - (p.class * Math.log(prob + eps) + (1 - p.class) * Math.log(1 - prob + eps));
     }
     if (points.length > 0) currentLoss /= points.length;
     
     requestAnimationFrame(() => {
        setLoss(currentLoss);

        if (currentLoss <= threshold && !won) {
           setWon(true);
           setShowSuccess(true);
           onComplete();
        }
     });
  }, [challenge.props, onComplete, threshold, won]);

  const progressColor = won
    ? '#34d399'
    : loss <= threshold * 2
      ? '#fbbf24'
      : 'var(--text-muted)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Visualization {...(challenge.props ?? {})} />

      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'rgba(15, 17, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '6px 10px',
          fontFamily: 'monospace',
          fontSize: '11px',
        }}
      >
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Loss: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {loss < 999 ? loss.toFixed(4) : '-'}
          </span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>target: </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            {'<= '}
            {threshold}
          </span>
        </div>
      </div>

      {showSuccess && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 17, 23, 0.7)',
            backdropFilter: 'blur(4px)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--success)',
              boxShadow: '0 0 40px rgba(52, 211, 153, 0.15)',
              maxWidth: '300px',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#34d399',
                margin: '0 0 0.5rem 0',
              }}
            >
              Classes Separated!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              You found optimal parameters. Progress saved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
