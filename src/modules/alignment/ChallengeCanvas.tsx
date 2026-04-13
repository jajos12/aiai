'use client';

import { useState } from 'react';
import type { Challenge } from '@/core/types';
import Visualization from './Visualization';

interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}

export function ChallengeCanvas({ challenge, onComplete }: ChallengeCanvasProps) {
  const [distance, setDistance] = useState(999);
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const threshold =
    typeof challenge.completionCriteria.target === 'number'
      ? challenge.completionCriteria.target
      : 3;

  // In a real implementation this would evaluate the user's reward configuration.
  const checkCompletion = () => {
      setDistance(3); // Mocking successful configuration where the agent optimally finds the goal

      if (3 <= threshold && !won) {
        setWon(true);
        setShowSuccess(true);
        onComplete();
      }
  };

  const progressColor = won
    ? '#34d399'
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
        <div className="flex justify-center mb-2">
            <button 
                onClick={checkCompletion}
                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
            >
                Evaluate Policy
            </button>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Steps taken: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {distance < 999 ? distance : '-'}
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
              Challenge Complete!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              The agent ignored the proxy and reached the true goal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
