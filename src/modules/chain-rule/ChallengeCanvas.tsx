'use client';

import React from 'react';
import type { Challenge } from '@/core/types';
import { ComputationGraph } from './ComputationGraph';
import { ChainCalculator } from './Helpers';

interface Props {
  challenge: Challenge;
  onComplete: () => void;
}

export function ChallengeCanvas({ challenge, onComplete }: Props) {
  const props = (challenge.props ?? {}) as Record<string, unknown>;
  const component = (challenge.component ?? 'ComputationGraph') as string;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#e2e8f0', fontWeight: 700 }}>
        {challenge.title}
      </div>
      <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>{challenge.description}</p>

      <div style={{ flex: 1, minHeight: 0 }}>
        {component === 'ChainCalculator'
          ? <ChainCalculator {...props as any} challengeMode />
          : <ComputationGraph {...props as any} showForward showBackward />
        }
      </div>

      <button
        onClick={onComplete}
        style={{ padding: '10px 24px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 700, alignSelf: 'flex-end' }}
      >
        Mark Complete ✓
      </button>
    </div>
  );
}
