'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminToastProvider } from '@/components/admin/AdminToastProvider';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/courses', label: 'Courses', icon: '📚' },
  { href: '/admin/modules', label: 'Modules', icon: '📖' },
  { href: '/admin/media', label: 'Media', icon: '🖼️' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /** null until client knows viewport — assume mobile-safe layout first */
  const [isMdUp, setIsMdUp] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => {
      setIsMdUp(mq.matches);
      if (mq.matches) setMobileMenuOpen(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const isDesktop = isMdUp === true;
  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);

  const sidebarWidth = isDesktop ? (sidebarOpen ? 260 : 72) : 260;
  const mainMarginLeft = isDesktop ? (sidebarOpen ? 260 : 72) : 0;
  const asideOffCanvas = !isDesktop && !mobileMenuOpen;

  const navLinkClick = () => {
    if (!isDesktop) closeMobile();
  };

  return (
    <AdminToastProvider>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {!isDesktop && mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={closeMobile}
          />
        )}

        <aside
          className="fixed left-0 top-0 z-40 flex h-full min-h-screen flex-col transition-[transform,width] duration-300"
          style={{
            width: sidebarWidth,
            transform: asideOffCanvas ? 'translateX(-100%)' : 'translateX(0)',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-subtle)',
            boxShadow: !isDesktop && mobileMenuOpen ? '4px 0 24px rgba(0,0,0,0.12)' : undefined,
          }}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-2 p-3 sm:p-4"
            style={{ height: '64px', borderBottom: '1px solid var(--border-subtle)' }}
          >
            {(!isDesktop || sidebarOpen) && (
              <span className="min-w-0 flex-1 truncate font-semibold text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                Admin Panel
              </span>
            )}
            {!isDesktop && mobileMenuOpen && (
              <button
                type="button"
                onClick={closeMobile}
                className="shrink-0 rounded-lg p-2 text-sm md:hidden"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                aria-label="Close menu"
              >
                ✕
              </button>
            )}
            {isDesktop && (
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`shrink-0 rounded-lg p-2 transition-colors ${!sidebarOpen ? 'ml-auto' : ''}`}
                style={{
                  background: 'var(--bg-hover)',
                  color: 'var(--text-secondary)',
                }}
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? '◀' : '▶'}
              </button>
            )}
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 sm:p-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all"
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
                  onClick={navLinkClick}
                >
                  <span className="shrink-0 text-xl">{item.icon}</span>
                  {(sidebarOpen || !isDesktop) && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t p-2 sm:p-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onClick={navLinkClick}
            >
              <span className="shrink-0 text-xl">🏠</span>
              {(sidebarOpen || !isDesktop) && <span>Back to App</span>}
            </Link>
          </div>
        </aside>

        <main
          className="min-w-0 flex-1 transition-[margin] duration-300"
          style={{ marginLeft: mainMarginLeft }}
        >
          <header
            className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6"
            style={{
              height: '64px',
              background: 'var(--bg-primary)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {!isDesktop && (
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-2 md:hidden"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                >
                  ☰
                </button>
              )}
              <h1 className="truncate text-lg font-semibold sm:text-xl" style={{ color: 'var(--text-primary)' }}>
                {navItems.find(
                  (item) =>
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)),
                )?.label || 'Admin'}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-semibold sm:h-10 sm:w-10 sm:text-lg"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {user.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                  </p>
                  <p className="max-w-[220px] truncate text-sm" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </AdminToastProvider>
  );
}
