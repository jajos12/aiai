'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Challenge } from '@/core/types';
import Visualization from './Visualization';

interface Point {
  x: number;
  y: number;
}

interface LineParams {
  m: number;
  b: number;
}

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
      : 0.5;

  const points = (challenge.props?.points as Point[]) || [];
  
  const initialLine = (challenge.props?.line as LineParams) || { m: 1, b: 0 };
  const latestLine = useRef<LineParams>({ m: initialLine.m, b: initialLine.b });
  const checkTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    checkTimer.current = setInterval(() => {
      let totalSqError = 0;
      points.forEach(p => {
        const yHat = latestLine.current.m * p.x + latestLine.current.b;
        totalSqError += (p.y - yHat) ** 2;
      });
      const mse = points.length ? totalSqError / points.length : 999;

      setDistance(mse);

      if (mse <= threshold && !won) {
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
  }, [challenge.props, onComplete, points, threshold, won]);

  const handleLineChange = useCallback((line: LineParams) => {
    latestLine.current = line;
  }, []);

  const progressColor = won
    ? '#34d399'
    : distance < threshold * 3
      ? '#fbbf24'
      : 'var(--text-muted)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Visualization
        {...(challenge.props ?? {})}
        onLineChange={handleLineChange}
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
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>MSE: </span>
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
