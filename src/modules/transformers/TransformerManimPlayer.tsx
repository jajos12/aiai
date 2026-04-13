'use client';

import React, { useCallback, useState } from 'react';
import { TransformerSandwichFallback } from './TransformerSandwichFallback';

export const DEFAULT_TRANSFORMER_SANDWICH_MANIM_SRC =
  '/transformers-manim/TransformerSandwichLesson.mp4';

type TransformerManimPlayerProps = {
  videoSrc?: string;
  manimFallback?: string;
};

export function TransformerManimPlayer({
  videoSrc = DEFAULT_TRANSFORMER_SANDWICH_MANIM_SRC,
  manimFallback = 'sandwich',
}: TransformerManimPlayerProps) {
  const [useFallback, setUseFallback] = useState(false);

  const onVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    return <TransformerSandwichFallback />;
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
