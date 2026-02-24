'use client';

import dynamic from 'next/dynamic';
import { VizSkeleton } from '@/components/ui/Skeleton';

/**
 * Lazy-loaded visualization components.
 * Code-splits VectorTransform (~700 lines) and MatrixTransform (~760 lines)
 * into separate chunks that only load when rendered.
 */

export const LazyVectorTransform = dynamic(
  () => import('@/components/visualizations/VectorTransform').then(m => m.VectorTransform),
  {
    ssr: false,
    loading: () => <VizSkeleton />,
  },
);

export const LazyMatrixTransform = dynamic(
  () => import('@/components/visualizations/MatrixTransform').then(m => m.MatrixTransform),
  {
    ssr: false,
    loading: () => <VizSkeleton />,
  },
);

export const LazyEigenTransform = dynamic(
  () => import('@/components/visualizations/EigenTransform').then(m => m.EigenTransform),
  {
    ssr: false,
    loading: () => <VizSkeleton />,
  },
);
