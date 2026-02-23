'use client';

import { useZoom } from '@/hooks/useZoom';
import { useState, useCallback, useRef } from 'react';

/**
 * Wraps a visualization component with zoom + pan controls.
 * Supports ctrl/cmd+scroll (trackpad pinch) for zoom, and click-drag for panning.
 */
export function VizZoomWrapper({ children }: { children: React.ReactNode }) {
  const { zoom, zoomIn, zoomOut, zoomReset, containerRef } = useZoom();

  // ── Pan state ──
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan with middle-click, or left-click + shift, or left-click if not on interactive child
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('[data-drag-handle]') || target.tagName === 'circle';
    if (isInteractive) return;

    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOffset.current = { ...pan };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({
      x: panOffset.current.x + dx,
      y: panOffset.current.y + dy,
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const resetAll = useCallback(() => {
    zoomReset();
    setPan({ x: 0, y: 0 });
  }, [zoomReset]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: isPanning.current ? 'grabbing' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Zoomable + pannable content */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning.current ? 'none' : 'transform 0.15s ease',
        }}
      >
        {children}
      </div>

      {/* Zoom controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'var(--viz-panel-bg)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid var(--viz-panel-border)',
          padding: '4px',
          zIndex: 10,
        }}
      >
        <button
          onClick={zoomOut}
          title="Zoom out"
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          −
        </button>

        <button
          onClick={resetAll}
          title="Reset zoom & pan"
          style={{
            height: '28px',
            padding: '0 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: 'var(--viz-annotation)',
            fontSize: '10px',
            fontFamily: 'monospace',
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: '40px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={zoomIn}
          title="Zoom in"
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          +
        </button>
      </div>
    </div>
  );
}
