'use client';

import React, { useCallback, useState } from 'react';
import { WhyNotLinearStory, type ClassPoint } from './WhyNotLinearStory';

const VIDEO_SRC = '/logistic-why-not-linear-manim/WhyNotLinearRegression.mp4';

const FALLBACK_POINTS: ClassPoint[] = [
  { x: 1, y: 0, class: 0 },
  { x: 2, y: 0, class: 0 },
  { x: 3, y: 0, class: 0 },
  { x: 5, y: 1, class: 1 },
  { x: 6, y: 1, class: 1 },
  { x: 7, y: 1, class: 1 },
  { x: 15, y: 1, class: 1 },
];

type Props = {
  points?: ClassPoint[];
};

/**
 * Manim lesson when MP4 is present; otherwise the legacy in-browser walkthrough.
 */
export function WhyNotLinearManimPlayer({ points }: Props) {
  const [useFallback, setUseFallback] = useState(false);

  const onVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    return <WhyNotLinearStory points={points ?? FALLBACK_POINTS} />;
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
