'use client';

import React, { useCallback, useState } from 'react';
import { SoftmaxFallback } from './SoftmaxFallback';

const VIDEO_SRC = '/logistic-softmax-manim/SoftmaxLesson.mp4';

/**
 * Plays the Manim export when present; falls back to a static softmax bar example if missing.
 */
export function SoftmaxManimPlayer() {
  const [useFallback, setUseFallback] = useState(false);

  const onVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    return <SoftmaxFallback />;
  }

  return (
    <div className="absolute inset-0 flex h-full min-h-0 w-full flex-col bg-[#070a10]">
      <video
        className="h-full w-full flex-1 object-contain"
        controls
        playsInline
        preload="metadata"
        src={VIDEO_SRC}
        onError={onVideoError}
      />
    </div>
  );
}
