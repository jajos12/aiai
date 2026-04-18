'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalModules: number;
  publishedModules: number;
  draftModules: number;
  totalCourses: number;
  draftCourses: number;
  publishedCourses: number;
  recentModules: Array<{ moduleId: string; title: string; status: string; updatedAt: string }>;
  recentCourses: Array<{ courseId: string; title: string; status: string; updatedAt: string }>;
  contentIntelligenceModules: number;
  lessonStudioSteps: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        if (!res.ok) {
          setLoadError(
            'Could not load admin data (often 403 if you are not signed in as admin). Sign out, sign in with an admin account, and try again.',
          );
          return;
        }
        const data = (await res.json()) as AdminStats;
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setLoadError('Network error while loading the dashboard.');
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  const s = stats ?? {
    totalUsers: 0,
    totalModules: 0,
    publishedModules: 0,
    draftModules: 0,
    totalCourses: 0,
    draftCourses: 0,
    publishedCourses: 0,
    recentModules: [],
    recentCourses: [],
    contentIntelligenceModules: 0,
    lessonStudioSteps: 0,
  };

  const statCards = [
    {
      label: 'Total Users',
      value: s.totalUsers,
      icon: '👥',
      color: 'var(--accent)',
      href: '/admin/users' as const,
    },
    {
      label: 'Total Modules',
      value: s.totalModules,
      icon: '📖',
      color: '#8b5cf6',
      href: '/admin/modules' as const,
    },
    {
      label: 'Published',
      value: s.publishedModules,
      icon: '✅',
      color: 'var(--color-success)',
      href: '/admin/modules' as const,
    },
    {
      label: 'Draft modules',
      value: s.draftModules,
      icon: '📝',
      color: 'var(--color-warning)',
      href: '/admin/modules' as const,
    },
    {
      label: 'Courses',
      value: s.totalCourses,
      icon: '📚',
      color: '#06b6d4',
      href: '/admin/courses' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Overview of your content and users
        </p>
      </div>

      {loadError && (
        <div
          className="p-4 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: 'var(--color-error)',
          }}
        >
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="block rounded-xl p-4 transition-transform hover:scale-[1.02] sm:p-6"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xl sm:text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-4 sm:p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="mb-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Quick actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/courses"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--bg-hover)' }}
            >
              <span className="text-xl">📚</span>
              <span style={{ color: 'var(--text-primary)' }}>Manage courses</span>
            </Link>
            <Link
              href="/admin/modules"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--bg-hover)' }}
            >
              <span className="text-xl">📖</span>
              <span style={{ color: 'var(--text-primary)' }}>Edit modules</span>
            </Link>
            <Link
              href="/admin/media"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--bg-hover)' }}
            >
              <span className="text-xl">🖼️</span>
              <span style={{ color: 'var(--text-primary)' }}>Media library</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--bg-hover)' }}
            >
              <span className="text-xl">👥</span>
              <span style={{ color: 'var(--text-primary)' }}>Users</span>
            </Link>
          </div>
        </div>

        <div className="rounded-xl p-4 sm:p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="mb-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Content health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Module publish rate</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {s.totalModules > 0 ? Math.round((s.publishedModules / s.totalModules) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${s.totalModules > 0 ? (s.publishedModules / s.totalModules) * 100 : 0}%`,
                    background: 'var(--color-success)',
                  }}
                />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Courses: {s.publishedCourses} published · {s.draftCourses} draft
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 sm:p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>Content intelligence (overview)</h3>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          Signals for structured lessons and stored lesson-map insights. Extend with learner telemetry when available.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.contentIntelligenceModules}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Modules with lesson-map insights</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.lessonStudioSteps}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Steps with Lesson Studio JSON</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-4 sm:p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Recently updated modules</h3>
          {s.recentModules.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No modules yet.</p>
          ) : (
            <ul className="space-y-2">
              {s.recentModules.map((m) => (
                <li key={m.moduleId} className="flex justify-between gap-2 text-sm">
                  <Link href="/admin/modules" className="truncate hover:underline" style={{ color: 'var(--accent)' }}>
                    {m.title}
                  </Link>
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {m.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl p-4 sm:p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Recently updated courses</h3>
          {s.recentCourses.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No courses yet.</p>
          ) : (
            <ul className="space-y-2">
              {s.recentCourses.map((c) => (
                <li key={c.courseId} className="flex justify-between gap-2 text-sm">
                  <Link href="/admin/courses" className="truncate hover:underline" style={{ color: 'var(--accent)' }}>
                    {c.title}
                  </Link>
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
