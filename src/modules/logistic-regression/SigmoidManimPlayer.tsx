'use client';

import React, { useCallback, useState } from 'react';
import { SigmoidStory } from './SigmoidStory';

const VIDEO_SRC = '/logistic-sigmoid-manim/SigmoidFunctionLesson.mp4';

/**
 * Plays the Manim export when present; falls back to the in-browser story if the file is missing.
 */
export function SigmoidManimPlayer() {
  const [useFallback, setUseFallback] = useState(false);

  const onVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    return <SigmoidStory />;
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
