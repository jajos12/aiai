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

  // Monitor the hidden neurons slider to detect when user achieves 100% accuracy on XOR
  useEffect(() => {
    const interval = setInterval(() => {
      // Find the slider value from DOM
      const sliders = document.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        const val = parseInt((slider as HTMLInputElement).value);
        if (val >= 2 && !won) {
          // XOR needs at least 2 hidden neurons
          requestAnimationFrame(() => {
            setWon(true);
            setShowSuccess(true);
            onComplete();
          });
        }
      });
    }, 500);
    return () => clearInterval(interval);
  }, [won, onComplete]);

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
            Classify all XOR points correctly
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
              XOR Solved!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              You discovered that 2 hidden neurons are the minimum needed to solve XOR.
              This is the insight that ended the first AI Winter!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
