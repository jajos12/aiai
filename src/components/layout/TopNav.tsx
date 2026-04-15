'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useProgress } from '@/hooks/useProgress';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface TopNavProps {
  currentPath?: string;
}

export function TopNav({ currentPath = '/' }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { isLoaded } = useProgress();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.push('/login');
  };

  const excludeNav = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify', '/admin'];
  if (excludeNav.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <nav
      className='nav-frosted'
      style={{
        height: 'var(--topnav-height)',
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
      <Link
        href='/'
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
      </Link>

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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Link
          href='/dashboard'
          style={{
            padding: '0.375rem 0.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Dashboard
        </Link>
        <StreakDisplay />
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                padding: '0.2rem 0.5rem',
                borderRadius: '999px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Hi, {user.name.split(' ')[0] || 'Learner'}
            </span>
            {user.role === 'admin' && (
              <Link
                href='/admin'
                style={{
                  padding: '0.375rem 0.75rem',
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: '0.375rem 0.75rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              href='/login'
              style={{
                padding: '0.375rem 0.75rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Login
            </Link>
            <Link
              href='/signup'
              style={{
                padding: '0.375rem 0.75rem',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Sign Up
            </Link>
          </div>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}

function StreakDisplay() {
  const { stats, isLoaded } = useProgress();
  const streakDays = isLoaded ? stats.streak.current : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        background: streakDays > 0 ? 'var(--accent-soft)' : 'var(--bg-surface)',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: streakDays > 0 ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      <span>🔥</span>
      <span>{streakDays}</span>
    </div>
  );
}

function Breadcrumb({ path }: { path: string }) {
  const segments = path.split('/').filter(Boolean);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <Link
        href="/"
        style={{
          color: 'var(--text-muted)',
          textDecoration: 'none',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.color = 'var(--text-secondary)';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        Home
      </Link>
      {segments.map((segment, index) => (
        <span key={segment + index} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>›</span>
          <span
            style={{
              color: index === segments.length - 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
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
