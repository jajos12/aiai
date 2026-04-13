'use client';

import { useState, useCallback } from 'react';
import type { Challenge } from '@/core/types';
import Visualization from './Visualization';

interface Point {
  x: number;
  y: number;
}

interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}

export function ChallengeCanvas({ challenge, onComplete }: ChallengeCanvasProps) {
  const [inertia, setInertia] = useState(999);
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const threshold =
    typeof challenge.completionCriteria.target === 'number'
      ? challenge.completionCriteria.target
      : 20;

  const handleCentroidsChange = useCallback((newCentroids: Point[]) => {
     if (!challenge.props) return;
     const points = challenge.props.points as Point[] || [];
     
     // Calculate Intertia quickly
     let currentInertia = 0;
     points.forEach((p) => {
        let minDist = Infinity;
        newCentroids.forEach((c) => {
           const distSq = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
           if (distSq < minDist) minDist = distSq;
        });
        currentInertia += minDist;
     });
     
     requestAnimationFrame(() => {
        setInertia(currentInertia);

        if (currentInertia <= threshold && !won) {
           setWon(true);
           setShowSuccess(true);
           onComplete();
        }
     });
  }, [challenge.props, onComplete, threshold, won]);

  const progressColor = won
    ? '#34d399'
    : inertia <= threshold * 1.5
      ? '#fbbf24'
      : 'var(--text-muted)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Visualization
        {...(challenge.props ?? {})}
        mode="challenge"
        onCentroidsChange={handleCentroidsChange}
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
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Variance: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {inertia < 999 ? inertia.toFixed(1) : '-'}
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
              Optimum Reached!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              You found the optimal clusters. Progress saved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
