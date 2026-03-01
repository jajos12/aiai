'use client';

import { useState, useCallback } from 'react';
import { LossLandscape3D as Visualization } from './Visualization';
import type { Challenge } from '@/core/types';

interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}

export function ChallengeCanvas({
  challenge,
  onComplete,
}: ChallengeCanvasProps) {
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastLoss, setLastLoss] = useState(999);
  const [lastStep, setLastStep] = useState(0);
  
  const threshold = typeof challenge.completionCriteria.target === 'number'
    ? challenge.completionCriteria.target
    : 0.5;

  const handleLossChange = useCallback((loss: number, step: number) => {
    setLastLoss(loss);
    setLastStep(step);
    if (!won && loss <= threshold && step > 5) {
      setWon(true);
      setShowSuccess(true);
      onComplete();
    }
  }, [won, threshold, onComplete]);

  const vizProps = {
    ...(challenge.props ?? {}),
    onLossChange: handleLossChange,
    interactive: true,
  };

  const progressColor = won
    ? '#34d399'
    : lastLoss < threshold * 3
      ? '#fbbf24'
      : 'var(--text-muted)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Visualization {...vizProps} />
      </div>

      {/* Step/Loss indicator */}
      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '14rem',
          background: 'rgba(15, 17, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '6px 10px',
          fontFamily: 'monospace',
          fontSize: '11px',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>loss: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {lastLoss < 999 ? lastLoss.toFixed(4) : '—'}
          </span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>step: </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{lastStep}</span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>target: </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>≤ {threshold}</span>
        </div>
      </div>

      {/* Success overlay */}
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
            zIndex: 30,
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
              Loss: {lastLoss.toFixed(4)} at step {lastStep} (target: ≤ {threshold})
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Click to dismiss
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
