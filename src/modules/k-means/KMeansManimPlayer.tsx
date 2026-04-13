'use client';

import React, { useCallback, useState } from 'react';
import { KMeansAssignmentFallback } from './KMeansAssignmentFallback';
import { KMeansFallback } from './KMeansFallback';
import { KMeansDistanceFallback } from './KMeansDistanceFallback';
import { KMeansElbowFallback } from './KMeansElbowFallback';
import { KMeansLocalOptimaFallback } from './KMeansLocalOptimaFallback';
import { KMeansSilhouetteFallback } from './KMeansSilhouetteFallback';
import { KMeansUpdateFallback } from './KMeansUpdateFallback';

export const DEFAULT_KMEANS_MANIM_SRC = '/k-means-manim/KMeansLesson.mp4';
export const KMEANS_ASSIGNMENT_MANIM_SRC = '/k-means-manim/KMeansAssignmentLesson.mp4';
export const KMEANS_UPDATE_MANIM_SRC = '/k-means-manim/KMeansUpdateLesson.mp4';
export const KMEANS_DISTANCE_MANIM_SRC = '/k-means-manim/KMeansDistanceMetricsLesson.mp4';
export const KMEANS_ELBOW_MANIM_SRC = '/k-means-manim/KMeansElbowLesson.mp4';
export const KMEANS_SILHOUETTE_MANIM_SRC = '/k-means-manim/KMeansSilhouetteLesson.mp4';
export const KMEANS_LOCAL_OPTIMA_MANIM_SRC = '/k-means-manim/KMeansLocalOptimaLesson.mp4';

export type KMeansManimFallbackVariant =
  | 'main'
  | 'assignment'
  | 'update'
  | 'distance'
  | 'elbow'
  | 'silhouette'
  | 'localoptima';

type KMeansManimPlayerProps = {
  /** Video URL under `public/` (e.g. `/k-means-manim/....mp4`). */
  videoSrc?: string;
  /** Which static preview to show if the video fails to load. */
  fallbackVariant?: KMeansManimFallbackVariant;
};

/** Plays a Manim export when present; otherwise shows a matching static summary. */
export function KMeansManimPlayer({
  videoSrc = DEFAULT_KMEANS_MANIM_SRC,
  fallbackVariant = 'main',
}: KMeansManimPlayerProps) {
  const [useFallback, setUseFallback] = useState(false);

  const onVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    if (fallbackVariant === 'assignment') return <KMeansAssignmentFallback />;
    if (fallbackVariant === 'update') return <KMeansUpdateFallback />;
    if (fallbackVariant === 'distance') return <KMeansDistanceFallback />;
    if (fallbackVariant === 'elbow') return <KMeansElbowFallback />;
    if (fallbackVariant === 'silhouette') return <KMeansSilhouetteFallback />;
    if (fallbackVariant === 'localoptima') return <KMeansLocalOptimaFallback />;
    return <KMeansFallback />;
  }

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col bg-[#070a10]">
      <video
        key={videoSrc}
        className="h-full w-full flex-1 object-contain"
        controls
        playsInline
        preload="metadata"
        src={videoSrc}
        onError={onVideoError}
      />
    </div>
  );
}
