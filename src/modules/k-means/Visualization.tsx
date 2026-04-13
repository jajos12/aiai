'use client';

import React from 'react';
import {
  DEFAULT_KMEANS_MANIM_SRC,
  KMeansManimPlayer,
  type KMeansManimFallbackVariant,
} from './KMeansManimPlayer';
import KMeansInteractive2D, { type XY } from './KMeansInteractive2D';

type Presentation = 'guided' | 'playground' | string | undefined;

function parseK(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/**
 * Guided steps: Manim lesson (deep, non-overlapping layout in the scene file).
 * Playground + challenges: 2D interactive canvas (drag centroids, Voronoi, Lloyd step).
 */
export default function KMeansVisualization({
  presentation,
  mode,
  ...rest
}: {
  presentation?: Presentation;
  mode?: string;
  k?: number;
  [key: string]: unknown;
}) {
  const useInteractive =
    presentation === 'playground' || mode === 'challenge';

  if (useInteractive) {
    const r = rest as Record<string, unknown>;
    const k = parseK(r.k) ?? 3;

    return (
      <KMeansInteractive2D
        presentation={presentation}
        mode={mode}
        k={k}
        points={Array.isArray(r.points) ? (r.points as XY[]) : undefined}
        centroids={Array.isArray(r.centroids) ? (r.centroids as XY[]) : undefined}
        draggableCentroids={r.draggableCentroids !== false}
        showAssignments={r.showAssignments !== false}
        showVoronoi={presentation === 'playground' || Boolean(r.showVoronoi)}
        showUpdateAnimation={
          presentation === 'playground' || Boolean(r.showUpdateAnimation)
        }
        onCentroidsChange={
          typeof r.onCentroidsChange === 'function'
            ? (r.onCentroidsChange as (c: XY[]) => void)
            : undefined
        }
      />
    );
  }

  const r = rest as Record<string, unknown>;
  const manimSrc =
    typeof r.manimSrc === 'string' && r.manimSrc.length > 0
      ? r.manimSrc
      : DEFAULT_KMEANS_MANIM_SRC;
  const fallbackVariant: KMeansManimFallbackVariant =
    r.manimFallback === 'assignment'
      ? 'assignment'
      : r.manimFallback === 'update'
        ? 'update'
        : r.manimFallback === 'distance'
          ? 'distance'
          : r.manimFallback === 'elbow'
            ? 'elbow'
            : r.manimFallback === 'silhouette'
              ? 'silhouette'
              : r.manimFallback === 'localoptima'
                ? 'localoptima'
                : 'main';

  return <KMeansManimPlayer videoSrc={manimSrc} fallbackVariant={fallbackVariant} />;
}
