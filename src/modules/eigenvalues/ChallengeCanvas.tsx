'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { EigenTransform as Visualization } from './Visualization';
import type { Challenge } from '@/core/types';

interface Mat2 { a: number; b: number; c: number; d: number }

interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}

function getEigenChallengeSetup(challengeId: string) {
  switch (challengeId) {
    case 'find-eigenvectors': {
      return {
        check: (m: Mat2) => {
          const tr = m.a + m.d;
          const det = m.a * m.d - m.b * m.c;
          const disc = tr * tr - 4 * det;
          if (disc < 0) return 999;
          const s = Math.sqrt(disc);
          const l1 = (tr + s) / 2;
          const l2 = (tr - s) / 2;
          if (Math.abs(l1 - l2) < 0.01) return 999;

          const getVec = (lambda: number) => {
            const ax = m.a - lambda, bx = m.b;
            if (Math.abs(bx) > 0.001) return { x: -bx, y: ax };
            if (Math.abs(ax) > 0.001) return { x: 0, y: 1 };
            return { x: 1, y: 0 };
          };

          const v1 = getVec(l1);
          const v2 = getVec(l2);
          const t1 = { x: 1, y: 1 };
          const t2 = { x: 1, y: -1 };

          const angleErr = (a: {x:number,y:number}, b: {x:number,y:number}) => {
            const cross = Math.abs(a.x * b.y - a.y * b.x);
            const ma = Math.sqrt(a.x*a.x + a.y*a.y);
            const mb = Math.sqrt(b.x*b.x + b.y*b.y);
            return ma > 0.01 && mb > 0.01 ? cross / (ma * mb) : 999;
          };

          const err1 = angleErr(v1, t1) + angleErr(v2, t2);
          const err2 = angleErr(v1, t2) + angleErr(v2, t1);
          return Math.min(err1, err2);
        },
      };
    }

    case 'make-rotation': {
      return {
        check: (m: Mat2) => {
          const tr = m.a + m.d;
          const det = m.a * m.d - m.b * m.c;
          const disc = tr * tr - 4 * det;
          return disc < 0 ? 0 : disc;
        },
      };
    }

    case 'positive-definite-challenge': {
      return {
        check: (m: Mat2) => {
          const tr = m.a + m.d;
          const det = m.a * m.d - m.b * m.c;
          const disc = tr * tr - 4 * det;
          if (disc < 0) return 999;
          const s = Math.sqrt(disc);
          const l1 = (tr + s) / 2;
          const l2 = (tr - s) / 2;
          const minEig = Math.min(l1, l2);
          return minEig > 0.1 ? 0 : 0.1 - minEig;
        },
      };
    }

    case 'fast-convergence': {
      return {
        check: (m: Mat2) => {
          const tr = m.a + m.d;
          const det = m.a * m.d - m.b * m.c;
          const disc = tr * tr - 4 * det;
          if (disc < 0) return 999;
          const s = Math.sqrt(disc);
          const l1 = (tr + s) / 2;
          const l2 = (tr - s) / 2;
          const absL1 = Math.abs(l1);
          const absL2 = Math.abs(l2);
          if (absL2 < 0.001) return 0;
          const ratio = Math.max(absL1, absL2) / Math.min(absL1, absL2);
          return ratio >= 5 ? 0 : 5 - ratio;
        },
      };
    }

    default:
      return { check: () => 999 };
  }
}

export function ChallengeCanvas({
  challenge,
  onComplete,
}: ChallengeCanvasProps) {
  const setup = getEigenChallengeSetup(challenge.id);
  const [distance, setDistance] = useState(999);
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const threshold = typeof challenge.completionCriteria.target === 'number'
    ? challenge.completionCriteria.target
    : 0.3;
  const latestMat = useRef<Mat2>({ a: 1, b: 0, c: 0, d: 1 });
  const checkTimer = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    checkTimer.current = setInterval(() => {
      const d = setup.check(latestMat.current);
      setDistance(d);
      if (d <= threshold && !won) {
        setWon(true);
        setShowSuccess(true);
        onComplete();
      }
    }, 100);
    return () => { if (checkTimer.current) clearInterval(checkTimer.current); };
  }, [setup, threshold, won, onComplete]);

  const handleMatrixChange = useCallback((m: Mat2) => {
    latestMat.current = m;
  }, []);

  const progressColor = won
    ? '#34d399'
    : distance < threshold * 3
      ? '#fbbf24'
      : 'var(--text-muted)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Visualization
          {...challenge.props}
          onMatrixChange={handleMatrixChange}
          interactive
        />
      </div>

      {/* Distance indicator */}
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
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>distance: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {distance < 999 ? distance.toFixed(3) : '—'}
          </span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>threshold: </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            ≤ {threshold}
          </span>
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
              Distance: {distance.toFixed(4)} (threshold: {threshold})
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
