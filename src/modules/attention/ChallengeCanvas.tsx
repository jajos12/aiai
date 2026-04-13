'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
      : 0.1;

  const latestQuery = useRef<number[]>([1, 0]);
  const checkTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const keys = (challenge.props?.keys as number[][]) || [];
    const values = (challenge.props?.values as number[][]) || [];
    const targetOutput = [2, -1]; // Hardcoded for this challenge, usually passed in props
    
    checkTimer.current = setInterval(() => {
      const q = latestQuery.current;
      if (!q || keys.length === 0) return;
      
      const scores = keys.map(k => q[0] * k[0] + q[1] * k[1]);
      const maxScore = Math.max(...scores);
      const exps = scores.map(s => Math.exp(s - maxScore));
      const sumExps = exps.reduce((a, b) => a + b, 0);
      const softmax = exps.map(e => e / sumExps);
      
      let outX = 0;
      let outY = 0;
      for (let i = 0; i < values.length; i++) {
        outX += softmax[i] * values[i][0];
        outY += softmax[i] * values[i][1];
      }
      
      const error = Math.sqrt((outX - targetOutput[0])**2 + (outY - targetOutput[1])**2);
      
      setDistance(error);

      if (error <= threshold && !won) {
        setWon(true);
        setShowSuccess(true);
        onComplete();
      }
    }, 100);

    return () => {
      if (checkTimer.current) {
        clearInterval(checkTimer.current);
      }
    };
  }, [challenge.props, onComplete, threshold, won]);

  const handleQueryChange = useCallback((query: number[]) => {
    latestQuery.current = query;
  }, []);

  const progressColor = won
    ? '#34d399'
    : distance <= threshold * 3
      ? '#fbbf24'
      : 'var(--text-muted)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Visualization
        {...(challenge.props ?? {})}
        onQueryChange={handleQueryChange}
      />

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
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Distance: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {distance < 999 ? distance.toFixed(3) : '-'}
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
              Progress saved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
