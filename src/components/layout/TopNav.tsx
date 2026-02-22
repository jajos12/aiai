'use client';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface TopNavProps {
  currentPath?: string;
}

export function TopNav({ currentPath = '/' }: TopNavProps) {
  return (
    <nav
      style={{
        height: 'var(--topnav-height)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background var(--transition-slow), border-color var(--transition-slow)',
      }}
    >
      {/* Left: Logo */}
      <a
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🧠</span>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.125rem',
            letterSpacing: '-0.02em',
          }}
        >
          AI Playground
        </span>
      </a>

      {/* Center: Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
        }}
      >
        {currentPath !== '/' && (
          <Breadcrumb path={currentPath} />
        )}
      </div>

      {/* Right: Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <StreakDisplay />
        <ThemeToggle />
      </div>
    </nav>
  );
}

function StreakDisplay() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--accent-soft)',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--accent)',
      }}
    >
      <span>🔥</span>
      <span>0</span>
    </div>
  );
}

function Breadcrumb({ path }: { path: string }) {
  const segments = path.split('/').filter(Boolean);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <a
        href="/"
        style={{
          color: 'var(--text-muted)',
          textDecoration: 'none',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        Home
      </a>
      {segments.map((segment, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>›</span>
          <span
            style={{
              color: i === segments.length - 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
              textTransform: 'capitalize',
            }}
          >
            {segment.replace(/[-_]/g, ' ')}
          </span>
        </span>
      ))}
    </div>
  );
}
