'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  totalModules: number;
  publishedModules: number;
  draftModules: number;
  totalCourses: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalModules: 0,
    publishedModules: 0,
    draftModules: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, modulesRes, coursesRes] = await Promise.all([
          fetch('/api/admin/users', { credentials: 'include' }),
          fetch('/api/admin/content/modules', { credentials: 'include' }),
          fetch('/api/admin/content/courses', { credentials: 'include' }),
        ]);

        if (!usersRes.ok || !modulesRes.ok || !coursesRes.ok) {
          setLoadError(
            'Could not load admin data (often 403 if you are not signed in as admin). Sign out, sign in with an admin account, and try again.',
          );
          return;
        }

        const [usersData, modulesData, coursesData] = await Promise.all([
          usersRes.json(),
          modulesRes.json(),
          coursesRes.json(),
        ]);

        const modules = modulesData.modules || [];
        setStats({
          totalUsers: usersData.users?.length || 0,
          totalModules: modules.length,
          publishedModules: modules.filter((m: { status: string }) => m.status === 'published').length,
          draftModules: modules.filter((m: { status: string }) => m.status === 'draft').length,
          totalCourses: coursesData.courses?.length || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setLoadError('Network error while loading the dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'var(--accent)' },
    { label: 'Total Modules', value: stats.totalModules, icon: '📖', color: '#8b5cf6' },
    { label: 'Published', value: stats.publishedModules, icon: '✅', color: 'var(--color-success)' },
    { label: 'Draft', value: stats.draftModules, icon: '📝', color: 'var(--color-warning)' },
    { label: 'Courses', value: stats.totalCourses, icon: '📚', color: '#06b6d4' },
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/courses"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--bg-hover)' }}
            >
              <span className="text-xl">📚</span>
              <span style={{ color: 'var(--text-primary)' }}>Manage Courses</span>
            </a>
            <a
              href="/admin/modules"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--bg-hover)' }}
            >
              <span className="text-xl">📖</span>
              <span style={{ color: 'var(--text-primary)' }}>Edit Modules</span>
            </a>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Content Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Module Completion</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {stats.totalModules > 0 ? Math.round((stats.publishedModules / stats.totalModules) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${stats.totalModules > 0 ? (stats.publishedModules / stats.totalModules) * 100 : 0}%`,
                    background: 'var(--color-success)',
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-success)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Published</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'var(--color-warning)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
