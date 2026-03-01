'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VectorTransform as Visualization } from './Visualization';
import type { Challenge } from '@/core/types';

interface Vec2 { x: number; y: number }

interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}

function getVectorChallengeSetup(challengeId: string) {
  switch (challengeId) {
    case 'reach-the-target': {
      return {
        check: (vecs: Vec2[], target: Vec2) => {
          const a = vecs[0] || { x: 0, y: 0 };
          const b = vecs[1] || { x: 0, y: 0 };
          const sum = { x: a.x + b.x, y: a.y + b.y };
          const dist = Math.sqrt((sum.x - target.x) ** 2 + (sum.y - target.y) ** 2);
          return dist;
        }
      };
    }
    case 'scalar-sniper': {
      return {
        check: (vecs: Vec2[], target: Vec2, params?: any) => {
          const a = vecs[0] || { x: 0, y: 0 };
          const s = params?.scalar || 1;
          const scaled = { x: a.x * s, y: a.y * s };
          const dist = Math.sqrt((scaled.x - target.x) ** 2 + (scaled.y - target.y) ** 2);
          return dist;
        }
      };
    }
    case 'right-angle': {
      return {
        check: (vecs: Vec2[]) => {
          const a = vecs[0] || { x: 0, y: 0 };
          const b = vecs[1] || { x: 0, y: 0 };
          const dot = a.x * b.x + a.y * b.y;
          return Math.abs(dot);
        }
      };
    }
    case 'basis-builder': {
      return {
        check: (vecs: Vec2[], target: Vec2, params?: any) => {
          const a = vecs[0] || { x: 0, y: 0 };
          const b = vecs[1] || { x: 0, y: 0 };
          const c1 = params?.c1 || 1;
          const c2 = params?.c2 || 1;
          const comb = { x: a.x * c1 + b.x * c2, y: a.y * c1 + b.y * c2 };
          const dist = Math.sqrt((comb.x - target.x) ** 2 + (comb.y - target.y) ** 2);
          return dist;
        }
      };
    }
    default:
      return { check: () => 999 };
  }
}

export function ChallengeCanvas({ challenge, onComplete }: ChallengeCanvasProps) {
  const setup = getVectorChallengeSetup(challenge.id);
  const [distance, setDistance] = useState(999);
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const threshold = typeof challenge.completionCriteria.target === 'number' 
    ? challenge.completionCriteria.target 
    : 0.3;

  const latestState = useRef<{ vecs: Vec2[], params: any }>({ vecs: [], params: {} });
  const checkTimer = useRef<any>(null);

  useEffect(() => {
    checkTimer.current = setInterval(() => {
      const d = setup.check(
        latestState.current.vecs, 
        challenge.props?.target as Vec2 || { x: 0, y: 0 }, 
        latestState.current.params
      );
      setDistance(d);
      if (d <= threshold && !won) {
        setWon(true);
        setShowSuccess(true);
        onComplete();
      }
    }, 100);
    return () => clearInterval(checkTimer.current);
  }, [setup, challenge.props?.target, threshold, won, onComplete]);

  const handleVectorsChange = useCallback((v: Vec2[]) => {
    latestState.current.vecs = v;
  }, []);

  const handleParamsChange = useCallback((p: any) => {
    latestState.current.params = p;
  }, []);

  const progressColor = won ? '#34d399' : (distance < threshold * 3 ? '#fbbf24' : 'var(--text-muted)');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Visualization
        {...(challenge.props || {})}
        onVectorsChange={handleVectorsChange}
        onParamsChange={handleParamsChange}
      />

      <div style={{
        position: 'absolute', top: '0.5rem', right: '0.5rem',
        background: 'rgba(15, 17, 23, 0.85)', backdropFilter: 'blur(8px)',
        borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
        padding: '6px 10px', fontFamily: 'monospace', fontSize: '11px', pointerEvents: 'none'
      }}>
        <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>distance: </span><span style={{ color: progressColor, fontWeight: 600 }}>{distance < 999 ? distance.toFixed(3) : '—'}</span></div>
        <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>threshold: </span><span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>≤ {threshold}</span></div>
      </div>

      {showSuccess && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 17, 23, 0.7)', backdropFilter: 'blur(4px)', borderRadius: 'var(--radius-md)',
          animation: 'fadeIn 0.3s ease'
        }} onClick={() => setShowSuccess(false)}>
          <div style={{
            textAlign: 'center', padding: '2rem', background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)', border: '1px solid var(--success)',
            boxShadow: '0 0 40px rgba(52, 211, 153, 0.15)', maxWidth: '300px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#34d399', margin: '0 0 0.5rem 0' }}>Challenge Complete!</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>Progress saved.</p>
          </div>
        </div>
      )}
    </div>
  );
}
