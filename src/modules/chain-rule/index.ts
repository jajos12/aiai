'use client';

import dynamic from 'next/dynamic';
import moduleData from './module';

export const Visualization = dynamic(
  () => import('./Visualization').then(m => m.ChainRuleViz) as any,
  { ssr: false }
);

export const ChallengeCanvas = dynamic(
  () => import('./ChallengeCanvas').then(m => m.ChallengeCanvas) as any,
  { ssr: false }
);

export { moduleData };
