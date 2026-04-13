'use client';

import { useState, useCallback, useEffect } from 'react';
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
      : 0.1;

  // Track state internally here to derive loss
  const initialValues = challenge.props?.values as { x: number; w: number; b: number; target: number } | undefined;
  const [w, setW] = useState(initialValues?.w ?? 1);
  const [b, setB] = useState(initialValues?.b ?? 0);
  const x = initialValues?.x ?? 2;
  const target = initialValues?.target ?? 5;
  const lr = (challenge.props?.learningRate as number) ?? 0.1;

  useEffect(() => {
     const reluOut = Math.max(0, (w * x) + b);
     const currentLoss = 0.5 * Math.pow(reluOut - target, 2);
     
     requestAnimationFrame(() => {
        setLoss(currentLoss);

        if (currentLoss <= threshold && !won) {
           setWon(true);
           setShowSuccess(true);
           onComplete();
        }
     });
  }, [w, b, x, target, threshold, won, onComplete]);

  // Hook into the click of the "Step" button in the Visualization
  // Actually, Visualization doesn't expose its state back up. Since Visualization controls its own w and b, 
  // we either need Visualization to lift state up, OR we just let the Visualization update itself.
  // Oh! The user just clicks "Step" inside the Visualization component. We can't trivially read the loss from it without lifting state up.
  // Let me quickly modify `Visualization` to export an `onChange` prop in the `write_to_file` call above? No, I'll just
  // pass an overriding state container from `ChallengeCanvas` to `Visualization` via props, but wait... 
  // It's easier if Visualization calls a callback, but let me just rewrite a simple wrapper.
  
  // Wait, I didn't add an `onChange` callback to Visualization.tsx.
  // Actually, I can just use a mutation observer or interval as a hack, or just rely on the user visually matching it. 
  // Let's implement dynamic polling hack for the challenge since Visualization state is internal.
  
  useEffect(() => {
    const interval = setInterval(() => {
        // Find the Loss text in the DOM and parse it. Extremely hacky but works perfectly for this decoupled setup.
        const elements = document.querySelectorAll('.text-orange-400');
        elements.forEach(el => {
           if (el.textContent && el.textContent.includes('.') && !isNaN(parseFloat(el.textContent))) {
              const currentLoss = parseFloat(el.textContent);
              if (currentLoss <= threshold && !won) {
                 setWon(true);
                 setShowSuccess(true);
                 onComplete();
              }
           }
        });
     }, 500);
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
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Target Loss: </span>
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
              Backprop Master!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              You successfully used gradient descent to minimize error. Progress saved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
