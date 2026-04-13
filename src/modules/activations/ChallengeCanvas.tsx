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
  const [currentActivation, setCurrentActivation] = useState(
    (challenge.props?.activation as string) || 'sigmoid'
  );

  const threshold =
    typeof challenge.completionCriteria.target === 'number'
      ? challenge.completionCriteria.target
      : 0.5;

  useEffect(() => {
    // Check gradient at Layer 1 for the current activation
    const activationDerivatives: Record<string, number> = {
      sigmoid: 0.235, // sigmoid'(0.5) ≈ 0.235
      tanh: 0.786,    // tanh'(0.5) ≈ 0.786
      relu: 1.0,
      'leaky-relu': 1.0,
    };

    const localGrad = activationDerivatives[currentActivation] || 0.235;
    const layers = (challenge.props?.layers as number) || 20;
    const firstLayerGrad = Math.pow(localGrad, layers);

    if (firstLayerGrad >= threshold && !won) {
      requestAnimationFrame(() => {
        setWon(true);
        setShowSuccess(true);
        onComplete();
      });
    }
  }, [currentActivation, challenge.props?.layers, threshold, won, onComplete]);

  // We need to intercept the activation selection from the child Visualization
  // Use a MutationObserver-style approach: poll for the active button
  useEffect(() => {
    const interval = setInterval(() => {
      const buttons = document.querySelectorAll('button.bg-white');
      buttons.forEach(btn => {
        const text = btn.textContent?.trim().toLowerCase();
        if (text === 'relu' && currentActivation !== 'relu') {
          setCurrentActivation('relu');
        } else if (text === 'tanh' && currentActivation !== 'tanh') {
          setCurrentActivation('tanh');
        } else if (text === 'sigmoid' && currentActivation !== 'sigmoid') {
          setCurrentActivation('sigmoid');
        } else if (text === 'leaky relu' && currentActivation !== 'leaky-relu') {
          setCurrentActivation('leaky-relu');
        }
      });
    }, 300);
    return () => clearInterval(interval);
  }, [currentActivation]);

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
            Layer 1 gradient &gt; {threshold}
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
              Gradients Rescued!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              By switching to a non-saturating activation, you fixed the vanishing gradient problem!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
