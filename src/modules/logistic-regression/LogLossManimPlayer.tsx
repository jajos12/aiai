'use client';

import React, { useCallback, useState } from 'react';
import { LogLossFallback } from './LogLossFallback';

const VIDEO_SRC = '/logistic-logloss-manim/CrossEntropyLossLesson.mp4';

/**
 * Plays the Manim export when present; falls back to an in-browser loss-vs-p chart if missing.
 */
export function LogLossManimPlayer() {
  const [useFallback, setUseFallback] = useState(false);

  const onVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    return <LogLossFallback />;
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
