'use client';

import { useState, useEffect } from 'react';
import type { Challenge } from '@/core/types';
import Visualization from './Visualization';

interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}

export function ChallengeCanvas({ challenge, onComplete }: ChallengeCanvasProps) {
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const threshold =
    typeof challenge.completionCriteria.target === 'number'
      ? challenge.completionCriteria.target
      : 0.9;

  useEffect(() => {
    const interval = setInterval(() => {
      const scoreElement = document.querySelector('.edge-score-val');
      if (scoreElement && scoreElement.textContent) {
        const val = parseFloat(scoreElement.textContent);
        if (val >= threshold && !won) {
          requestAnimationFrame(() => {
            setWon(true);
            setShowSuccess(true);
            onComplete();
          });
        }
      }
    }, 300);
    return () => clearInterval(interval);
  }, [threshold, won, onComplete]);

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
          pointerEvents: 'none',
        }}
      >
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Goal: </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            Edge Score &gt; {threshold}
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
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👁️</div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#34d399',
                margin: '0 0 0.5rem 0',
              }}
            >
              Vision Unlocked!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              You&apos;ve manually discovered a Sobel-like filter. Your kernel is now expert at detecting structural boundaries in raw data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
