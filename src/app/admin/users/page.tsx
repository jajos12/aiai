'use client';

import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '@/components/admin/shared/StatusBadge';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_verified: number;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { user?: { id?: number } };
        if (cancelled) return;
        const id = data.user?.id;
        if (typeof id === 'number' && Number.isInteger(id)) {
          setCurrentUserId(id);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    setBanner(null);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: 'err', text: data.error || `Failed to load users (${res.status})` });
        setUsers([]);
        return;
      }
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setBanner({ type: 'err', text: 'Network error while loading users.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setBanner(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setBanner({ type: 'ok', text: 'Role updated.' });
      } else {
        setBanner({ type: 'err', text: data.error || 'Could not update role.' });
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      setBanner({ type: 'err', text: 'Network error while updating role.' });
    }
  };

  const handleMarkVerified = async (userId: number) => {
    setBanner(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, markVerified: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => (u.id === userId ? { ...u, is_verified: 1 } : u)));
        setBanner({ type: 'ok', text: 'User marked as email-verified.' });
      } else {
        setBanner({ type: 'err', text: data.error || 'Could not verify user.' });
      }
    } catch (err) {
      console.error('Failed to verify user:', err);
      setBanner({ type: 'err', text: 'Network error.' });
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setBanner({ type: 'ok', text: 'User deleted.' });
      } else {
        setBanner({ type: 'err', text: data.error || 'Could not delete user.' });
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      setBanner({ type: 'err', text: 'Network error while deleting user.' });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Users</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage roles, unblock verification, or remove accounts
        </p>
      </div>

      {banner && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: banner.type === 'ok' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${banner.type === 'ok' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            color: banner.type === 'ok' ? 'var(--color-success)' : 'var(--color-error)',
          }}
        >
          {banner.text}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full p-3 rounded-lg outline-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'user')}
          className="w-full shrink-0 rounded-lg p-3 outline-none sm:w-auto"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border-subtle)' }}>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr style={{ background: 'var(--bg-surface)' }}>
              <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>User</th>
              <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Joined</th>
              <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-t"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-primary)' }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold"
                      style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="p-2 rounded text-sm outline-none"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={Number(user.is_verified) === 1 ? 'verified_email' : 'pending_email'}
                  />
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {Number(user.is_verified) !== 1 && (
                      <button
                        type="button"
                        onClick={() => handleMarkVerified(user.id)}
                        className="text-sm px-2 py-1 rounded"
                        style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}
                      >
                        Mark verified
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      disabled={currentUserId !== null && user.id === currentUserId}
                      className="text-sm text-red-500 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                      title={
                        currentUserId !== null && user.id === currentUserId
                          ? 'You cannot delete your own account here'
                          : undefined
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-8 text-center rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No users found</p>
        </div>
      )}
    </div>
  );
}
