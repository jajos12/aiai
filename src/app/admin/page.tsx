'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ModuleData } from '@/core/types';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_verified: number;
  created_at: string;
}

interface ContentModuleSummary {
  moduleId: string;
  runtimeModuleId: string;
  title: string;
  tierId: number;
  clusterId: string;
  status: 'draft' | 'published';
  version: number;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contentModules, setContentModules] = useState<ContentModuleSummary[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [moduleEditorText, setModuleEditorText] = useState('');
  const [contentMessage, setContentMessage] = useState('');
  const [structuredModule, setStructuredModule] = useState<ModuleData | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    fetchUsers();
    fetchContentModules();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch users');
        return;
      }
      setUsers(data.users);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const fetchContentModules = async () => {
    try {
      const res = await fetch('/api/admin/content/modules', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) return;
      const modules = (data.modules ?? []) as ContentModuleSummary[];
      setContentModules(modules);
      if (!selectedModuleId && modules.length > 0) {
        setSelectedModuleId(modules[0].moduleId);
      }
    } catch {
      // Keep user management usable even if content API is unavailable
    }
  };

  const loadModuleForEditing = async () => {
    if (!selectedModuleId) return;
    setContentMessage('');
    try {
      const res = await fetch(`/api/admin/content/modules/${selectedModuleId}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setContentMessage(data.error || 'Failed to load module content.');
        return;
      }
      setModuleEditorText(JSON.stringify(data.module, null, 2));
      setStructuredModule(data.module as ModuleData);
      setContentMessage('Loaded module content.');
    } catch {
      setContentMessage('Failed to load module content.');
    }
  };

  const saveModuleContent = async (status: 'draft' | 'published') => {
    setContentMessage('');
    try {
      const parsed = JSON.parse(moduleEditorText);
      const res = await fetch('/api/admin/content/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ module: parsed, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setContentMessage(data.error || 'Failed to save module content.');
        return;
      }
      setContentMessage(`Module saved as ${status}.`);
      fetchContentModules();
    } catch {
      setContentMessage('Invalid JSON payload.');
    }
  };

  const syncStructuredFromJson = () => {
    setContentMessage('');
    try {
      const parsed = JSON.parse(moduleEditorText) as ModuleData;
      setStructuredModule(parsed);
      setContentMessage('Structured editor synced from JSON.');
    } catch {
      setContentMessage('Invalid JSON payload.');
    }
  };

  const syncJsonFromStructured = (nextModule: ModuleData) => {
    setStructuredModule(nextModule);
    setModuleEditorText(JSON.stringify(nextModule, null, 2));
  };

  const updateStep = (index: number, updater: (step: ModuleData['steps'][number]) => ModuleData['steps'][number]) => {
    if (!structuredModule) return;
    const nextSteps = structuredModule.steps.map((step, idx) => (idx === index ? updater(step) : step));
    syncJsonFromStructured({ ...structuredModule, steps: nextSteps });
  };

  const updateChallenge = (
    index: number,
    updater: (challenge: ModuleData['challenges'][number]) => ModuleData['challenges'][number],
  ) => {
    if (!structuredModule) return;
    const nextChallenges = structuredModule.challenges.map((challenge, idx) =>
      idx === index ? updater(challenge) : challenge,
    );
    syncJsonFromStructured({ ...structuredModule, challenges: nextChallenges });
  };

  const publishSelectedModule = async () => {
    if (!selectedModuleId) return;
    setContentMessage('');
    try {
      const res = await fetch(`/api/admin/content/modules/${selectedModuleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'publish' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setContentMessage(data.error || 'Failed to publish module.');
        return;
      }
      setContentMessage('Module published.');
      fetchContentModules();
    } catch {
      setContentMessage('Failed to publish module.');
    }
  };

  const migrateFromCodeToDb = async () => {
    setContentMessage('');
    try {
      const res = await fetch('/api/admin/content/migrate', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setContentMessage(data.error || 'Migration failed.');
        return;
      }
      const warningCount = Array.isArray(data.warnings) ? data.warnings.length : 0;
      setContentMessage(
        `Migration complete: ${data.migrated}/${data.totalCandidates} modules. Warnings: ${warningCount}.`,
      );
      fetchContentModules();
    } catch {
      setContentMessage('Migration failed.');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid var(--border)', 
          borderTopColor: 'var(--accent)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              User Management
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>
              Manage all registered users
            </p>
          </div>
          <Link 
            href='/'
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Joined</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === currentUser?.id}
                        style={{
                          padding: '0.375rem 0.625rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: user.role === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)',
                          color: user.role === 'admin' ? '#3b82f6' : 'var(--text-primary)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value='user'>User</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: user.is_verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        color: user.is_verified ? '#22c55e' : '#eab308',
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: user.is_verified ? '#22c55e' : '#eab308',
                        }} />
                        {user.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Total users: {users.length}
        </div>

        <div
          style={{
            marginTop: '2rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>Content CMS (DB-backed)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
            Manage full module payloads outside code. Edit JSON then save draft or publish.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              style={{
                padding: '0.45rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                minWidth: 260,
              }}
            >
              <option value="">Select module</option>
              {contentModules.map((module) => (
                <option key={module.moduleId} value={module.moduleId}>
                  {module.moduleId} ({module.status}, v{module.version})
                </option>
              ))}
            </select>

            <button className="btn btn--ghost btn--sm" onClick={loadModuleForEditing}>
              Load
            </button>
            <button className="btn btn--ghost btn--sm" onClick={syncStructuredFromJson}>
              JSON {'->'} Structured
            </button>
            <button className="btn btn--ghost btn--sm" onClick={migrateFromCodeToDb}>
              Migrate Code {'->'} DB
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => saveModuleContent('draft')}>
              Save Draft
            </button>
            <button className="btn btn--primary btn--sm" onClick={() => saveModuleContent('published')}>
              Save + Publish
            </button>
            <button className="btn btn--ghost btn--sm" onClick={publishSelectedModule}>
              Publish Existing
            </button>
          </div>

          <textarea
            value={moduleEditorText}
            onChange={(e) => setModuleEditorText(e.target.value)}
            placeholder='Paste full ModuleData JSON here'
            style={{
              marginTop: '0.75rem',
              width: '100%',
              minHeight: 280,
              padding: '0.7rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
            }}
          />

          {structuredModule && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
              }}
            >
              <h3 style={{ margin: '0 0 0.7rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Structured Editor
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <input
                  value={structuredModule.title}
                  onChange={(e) => syncJsonFromStructured({ ...structuredModule, title: e.target.value })}
                  placeholder="Module title"
                  style={{ padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border)' }}
                />
                <input
                  value={structuredModule.clusterId}
                  onChange={(e) => syncJsonFromStructured({ ...structuredModule, clusterId: e.target.value })}
                  placeholder="Cluster ID"
                  style={{ padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border)' }}
                />
                <input
                  value={String(structuredModule.tierId)}
                  onChange={(e) =>
                    syncJsonFromStructured({ ...structuredModule, tierId: Number(e.target.value) || 0 })
                  }
                  placeholder="Tier ID"
                  style={{ padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border)' }}
                />
                <input
                  value={structuredModule.estimatedMinutes}
                  onChange={(e) =>
                    syncJsonFromStructured({
                      ...structuredModule,
                      estimatedMinutes: Number(e.target.value) || 0,
                    })
                  }
                  placeholder="Estimated minutes"
                  style={{ padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border)' }}
                />
              </div>

              <textarea
                value={structuredModule.description}
                onChange={(e) => syncJsonFromStructured({ ...structuredModule, description: e.target.value })}
                placeholder="Module description"
                style={{
                  marginTop: '0.6rem',
                  width: '100%',
                  minHeight: 80,
                  padding: '0.45rem',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                }}
              />

              <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Steps ({structuredModule.steps.length})
              </div>
              <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {structuredModule.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    style={{ padding: '0.55rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input
                        value={step.id}
                        onChange={(e) => updateStep(idx, (prev) => ({ ...prev, id: e.target.value }))}
                        placeholder="Step ID"
                        style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid var(--border)' }}
                      />
                      <input
                        value={step.title}
                        onChange={(e) => updateStep(idx, (prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Step title"
                        style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid var(--border)' }}
                      />
                    </div>
                    <textarea
                      value={step.content.text}
                      onChange={(e) =>
                        updateStep(idx, (prev) => ({
                          ...prev,
                          content: { ...prev.content, text: e.target.value },
                        }))
                      }
                      placeholder="Step content text"
                      style={{
                        marginTop: '0.45rem',
                        width: '100%',
                        minHeight: 74,
                        padding: '0.45rem',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    />
                    <textarea
                      value={step.content.goDeeper?.explanation ?? ''}
                      onChange={(e) =>
                        updateStep(idx, (prev) => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            goDeeper: {
                              ...(prev.content.goDeeper ?? { explanation: '' }),
                              explanation: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Go deeper explanation"
                      style={{
                        marginTop: '0.45rem',
                        width: '100%',
                        minHeight: 64,
                        padding: '0.45rem',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    />
                    <textarea
                      value={step.content.authorNote ?? ''}
                      onChange={(e) =>
                        updateStep(idx, (prev) => ({
                          ...prev,
                          content: { ...prev.content, authorNote: e.target.value || undefined },
                        }))
                      }
                      placeholder="Author note"
                      style={{
                        marginTop: '0.45rem',
                        width: '100%',
                        minHeight: 48,
                        padding: '0.45rem',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    />
                    <input
                      value={step.interactionHint ?? ''}
                      onChange={(e) =>
                        updateStep(idx, (prev) => ({
                          ...prev,
                          interactionHint: e.target.value || undefined,
                        }))
                      }
                      placeholder="Interaction hint"
                      style={{
                        marginTop: '0.45rem',
                        width: '100%',
                        padding: '0.4rem',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    />
                    {step.quiz && (
                      <div style={{ marginTop: '0.45rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem' }}>
                        <input
                          value={step.quiz.question}
                          onChange={(e) =>
                            updateStep(idx, (prev) => ({
                              ...prev,
                              quiz: prev.quiz ? { ...prev.quiz, question: e.target.value } : prev.quiz,
                            }))
                          }
                          placeholder="Quiz question"
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 6, border: '1px solid var(--border)' }}
                        />
                        <input
                          value={step.quiz.options.join(' | ')}
                          onChange={(e) =>
                            updateStep(idx, (prev) => ({
                              ...prev,
                              quiz: prev.quiz
                                ? { ...prev.quiz, options: e.target.value.split('|').map((o) => o.trim()).filter(Boolean) }
                                : prev.quiz,
                            }))
                          }
                          placeholder="Quiz options separated by |"
                          style={{
                            marginTop: '0.4rem',
                            width: '100%',
                            padding: '0.4rem',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                          }}
                        />
                        <input
                          type="number"
                          value={step.quiz.correctIndex}
                          onChange={(e) =>
                            updateStep(idx, (prev) => ({
                              ...prev,
                              quiz: prev.quiz ? { ...prev.quiz, correctIndex: Number(e.target.value) || 0 } : prev.quiz,
                            }))
                          }
                          placeholder="Correct option index"
                          style={{
                            marginTop: '0.4rem',
                            width: '100%',
                            padding: '0.4rem',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                          }}
                        />
                        <textarea
                          value={step.quiz.explanation}
                          onChange={(e) =>
                            updateStep(idx, (prev) => ({
                              ...prev,
                              quiz: prev.quiz ? { ...prev.quiz, explanation: e.target.value } : prev.quiz,
                            }))
                          }
                          placeholder="Quiz explanation"
                          style={{
                            marginTop: '0.4rem',
                            width: '100%',
                            minHeight: 56,
                            padding: '0.4rem',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Playground
              </div>
              <textarea
                value={structuredModule.playground.description}
                onChange={(e) =>
                  syncJsonFromStructured({
                    ...structuredModule,
                    playground: { ...structuredModule.playground, description: e.target.value },
                  })
                }
                placeholder="Playground description"
                style={{
                  marginTop: '0.4rem',
                  width: '100%',
                  minHeight: 64,
                  padding: '0.45rem',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                }}
              />
              <input
                value={structuredModule.playground.tryThis.join(' | ')}
                onChange={(e) =>
                  syncJsonFromStructured({
                    ...structuredModule,
                    playground: {
                      ...structuredModule.playground,
                      tryThis: e.target.value.split('|').map((t) => t.trim()).filter(Boolean),
                    },
                  })
                }
                placeholder="Try-this items separated by |"
                style={{
                  marginTop: '0.4rem',
                  width: '100%',
                  padding: '0.4rem',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                }}
              />

              <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Challenges ({structuredModule.challenges.length})
              </div>
              <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {structuredModule.challenges.map((challenge, idx) => (
                  <div
                    key={challenge.id}
                    style={{ padding: '0.55rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input
                        value={challenge.id}
                        onChange={(e) => updateChallenge(idx, (prev) => ({ ...prev, id: e.target.value }))}
                        placeholder="Challenge ID"
                        style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid var(--border)' }}
                      />
                      <input
                        value={challenge.title}
                        onChange={(e) => updateChallenge(idx, (prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Challenge title"
                        style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid var(--border)' }}
                      />
                    </div>
                    <textarea
                      value={challenge.description}
                      onChange={(e) => updateChallenge(idx, (prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Challenge description"
                      style={{
                        marginTop: '0.4rem',
                        width: '100%',
                        minHeight: 58,
                        padding: '0.4rem',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    />
                    <input
                      value={challenge.hints?.join(' | ') ?? ''}
                      onChange={(e) =>
                        updateChallenge(idx, (prev) => ({
                          ...prev,
                          hints: e.target.value.split('|').map((h) => h.trim()).filter(Boolean),
                        }))
                      }
                      placeholder="Hints separated by |"
                      style={{
                        marginTop: '0.4rem',
                        width: '100%',
                        padding: '0.4rem',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {contentMessage || `Modules in DB: ${contentModules.length}`}
          </div>
        </div>
      </div>
    </div>
  );
}