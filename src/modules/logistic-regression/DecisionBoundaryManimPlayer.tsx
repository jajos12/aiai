'use client';

import React, { useCallback, useState } from 'react';
import { DecisionBoundaryFallback } from './DecisionBoundaryFallback';

const VIDEO_SRC = '/logistic-decision-boundary-manim/DecisionBoundaryLesson.mp4';

export function DecisionBoundaryManimPlayer() {
  const [useFallback, setUseFallback] = useState(false);

  const onVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    return <DecisionBoundaryFallback />;
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
