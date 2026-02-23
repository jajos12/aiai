'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;
const WHEEL_SENSITIVITY = 0.002;

/**
 * Zoom hook for SVG visualizations.
 * Supports scroll-wheel, pinch, and button controls.
 * Returns zoom level + event handlers to attach to the container.
 */
export function useZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);
  const containerRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));

  const zoomIn = useCallback(() => setZoom((z) => clamp(z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => clamp(z - ZOOM_STEP)), []);
  const zoomReset = useCallback(() => setZoom(1), []);

  // Wheel handler (passive: false so we can preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom on trackpads sends ctrl+wheel
        e.preventDefault();
        setZoom((z) => clamp(z - e.deltaY * WHEEL_SENSITIVITY));
      }
    };

    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return { zoom, zoomIn, zoomOut, zoomReset, containerRef };
}
