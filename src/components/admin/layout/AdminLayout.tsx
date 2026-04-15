'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/courses', label: 'Courses', icon: '📚' },
  { href: '/admin/modules', label: 'Modules', icon: '📖' },
  { href: '/admin/media', label: 'Media', icon: '🖼️' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      window.location.href = '/login';
      return;
    }
    try {
      const parsed = JSON.parse(userStr) as { name: string; email: string; role: string };
      if (parsed.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(parsed);
      setIsReady(true);
    } catch {
      window.location.href = '/login';
    }
  }, []);

  if (!isReady || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <aside
        className="fixed left-0 top-0 h-full z-40 transition-all duration-300"
        style={{
          width: sidebarOpen ? '260px' : '72px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-between p-4" style={{ height: '64px', borderBottom: '1px solid var(--border-subtle)' }}>
          {sidebarOpen && (
            <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              Admin Panel
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
            }}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                style={{
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  fontWeight: isActive ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span className="text-xl">🏠</span>
            {sidebarOpen && <span>Back to App</span>}
          </Link>
        </div>
      </aside>

      <main
        className="flex-1 transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? '260px' : '72px',
        }}
      >
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6"
          style={{
            height: '64px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {navItems.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
