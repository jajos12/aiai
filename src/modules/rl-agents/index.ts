'use client';

import dynamic from 'next/dynamic';
import type { ChallengeCanvasProps, VisualizationProps } from '@/core/types';
import moduleData from './module';

export const Visualization = dynamic<VisualizationProps>(
  () => import('./Visualization').then((mod) => mod.default),
  { ssr: false },
);
export const ChallengeCanvas = dynamic<ChallengeCanvasProps>(
  () => import('./ChallengeCanvas').then((mod) => mod.ChallengeCanvas),
  { ssr: false },
);

export { moduleData };
