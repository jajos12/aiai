'use client';

/**
 * Skeleton — Shimmer loading placeholder
 * Shows a pulsing placeholder while content loads.
 */

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  style,
}: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

/** Pre-built skeleton for a module card */
export function ModuleCardSkeleton() {
  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
      }}
    >
      <Skeleton width="2.5rem" height="2.5rem" borderRadius="var(--radius-md)" />
      <div style={{ flex: 1 }}>
        <Skeleton width="45%" height="1rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="80%" height="0.75rem" style={{ marginBottom: '0.375rem' }} />
        <Skeleton width="30%" height="0.5rem" />
      </div>
      <Skeleton width="80px" height="4px" borderRadius="2px" />
    </div>
  );
}

/** Pre-built skeleton for the visualization canvas */
export function VizSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1',
        maxWidth: '600px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Skeleton width="100%" height="100%" borderRadius="var(--radius-md)" />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
        }}
      >
        <div
          style={{
            width: '2rem',
            height: '2rem',
            border: '3px solid var(--border-subtle)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 0.75rem',
          }}
        />
        Loading visualization...
      </div>
    </div>
  );
}

/** Full-page skeleton for module hub */
export function ModuleHubSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Skeleton width="80px" height="0.875rem" style={{ marginBottom: '1.5rem' }} />
        <Skeleton width="50%" height="2rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="80%" height="1rem" style={{ marginBottom: '2rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ModuleCardSkeleton />
          <ModuleCardSkeleton />
          <ModuleCardSkeleton />
        </div>
      </div>
    </div>
  );
}
