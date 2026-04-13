'use client';

import React, { useCallback, useState } from 'react';
import { AttentionDatabaseFallback } from './AttentionDatabaseFallback';
import { AttentionQueryKeyFallback } from './AttentionQueryKeyFallback';
import { AttentionSoftmaxFallback } from './AttentionSoftmaxFallback';

export const DEFAULT_ATTENTION_DATABASE_MANIM_SRC =
  '/attention-manim/AttentionDatabaseAnalogyLesson.mp4';

export const ATTENTION_QUERY_KEY_MANIM_SRC =
  '/attention-manim/AttentionQueryKeyDotProductLesson.mp4';

export const ATTENTION_SOFTMAX_MANIM_SRC =
  '/attention-manim/AttentionSoftmaxWeightsLesson.mp4';

type AttentionManimPlayerProps = {
  videoSrc?: string;
  /** Which static preview to show if the video fails to load. */
  manimFallback?: string;
};

export function AttentionManimPlayer({
  videoSrc = DEFAULT_ATTENTION_DATABASE_MANIM_SRC,
  manimFallback = 'database-analogy',
}: AttentionManimPlayerProps) {
  const [useFallback, setUseFallback] = useState(false);

  const onVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    if (manimFallback === 'query-key-dot-product') return <AttentionQueryKeyFallback />;
    if (manimFallback === 'softmax-weights') return <AttentionSoftmaxFallback />;
    return <AttentionDatabaseFallback />;
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
