'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ModuleData } from '@/core/types';
import ModuleEditor from '@/components/admin/editors/ModuleEditor';

interface ModuleWithStatus extends ModuleData {
  status: 'draft' | 'published';
  version?: number;
}

interface ModuleListItem {
  moduleId: string;
  title: string;
  tierId: number;
  status: 'draft' | 'published';
  version?: number;
}

function validateModuleBeforeSave(module: ModuleWithStatus): string | null {
  if (!module.steps.length) return 'A module must have at least one lesson step before saving.';
  for (const step of module.steps) {
    const hasBlocks = Boolean(
      step.content.studio?.blocks?.some((b) => {
        if (b.type === 'concept' || b.type === 'explanation' || b.type === 'callout') return b.body.trim().length > 0;
        if (b.type === 'math') return b.latex.trim().length > 0;
        return true;
      }),
    );
    const hasText = Boolean(step.content.text?.trim()) || hasBlocks;
    const noteLength = step.content.authorNote?.trim().length ?? 0;
    const hasDetailedNote = noteLength >= 80;
    const hasVideo = Boolean(step.content.video?.url?.trim());
    const hasImage = Boolean(step.content.image?.url?.trim());
    if (!hasText || !hasDetailedNote || (!hasVideo && !hasImage)) {
      return 'Each lesson step needs content text (or Lesson Studio blocks), a detailed note (at least 80 characters), and at least one media item (video or image).';
    }
  }
  return null;
}

function duplicateModuleData(m: ModuleWithStatus): ModuleWithStatus {
  return {
    ...m,
    id: uuidv4(),
    title: `Copy of ${m.title}`,
    status: 'draft',
    steps: m.steps.map((s) => ({ ...s, id: uuidv4() })),
    challenges: (m.challenges ?? []).map((c) => ({ ...c, id: uuidv4() })),
    playground: {
      ...m.playground,
      parameters: m.playground.parameters.map((p) => ({ ...p, id: uuidv4() })),
    },
  };
}

export default function ModulesPage() {
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleWithStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [dirty, setDirty] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/modules', { credentials: 'include' });
      const data = await res.json();
      if (data.modules) {
        setModules(data.modules);
      }
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    }
  }, []);

  useEffect(() => {
    fetchModules().finally(() => setLoading(false));
  }, [fetchModules]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const createNewModule = () => {
    if (dirty && !window.confirm('Discard unsaved changes on the current module?')) return;
    const newModule: ModuleWithStatus = {
      id: uuidv4(),
      tierId: 0,
      clusterId: 'new',
      title: 'New Module',
      description: '',
      tags: [],
      prerequisites: [],
      difficulty: 'beginner',
      estimatedMinutes: 30,
      steps: [{
        id: uuidv4(),
        title: 'Introduction',
        visualizationProps: {},
        content: { text: '' },
      }],
      playground: {
        description: '',
        parameters: [],
        tryThis: [],
      },
      challenges: [],
      status: 'draft',
    };
    setSelectedModule(newModule);
    setDirty(false);
  };

  const handleModuleChange = (updatedModule: ModuleData) => {
    const moduleWithStatus: ModuleWithStatus = {
      ...(updatedModule as ModuleWithStatus),
      status: (updatedModule as ModuleWithStatus).status ?? selectedModule?.status ?? 'draft',
    };
    setSelectedModule(moduleWithStatus);
    setDirty(true);
  };

  const selectModule = async (moduleId: string) => {
    if (selectedModule?.id === moduleId) {
      return;
    }
    if (selectedModule && dirty) {
      if (!window.confirm('You have unsaved changes. Discard them and open another module?')) return;
    }
    try {
      const res = await fetch(`/api/admin/content/modules/${moduleId}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.module) {
        setMessage(data.error || 'Failed to load module');
        return;
      }
      const listItem = modules.find((m) => m.moduleId === moduleId);
      const moduleWithStatus: ModuleWithStatus = {
        ...data.module,
        status: listItem?.status ?? 'draft',
        version: (data as { version?: number }).version ?? listItem?.version,
      };
      setSelectedModule(moduleWithStatus);
      setDirty(false);
    } catch {
      setMessage('Failed to load module');
    }
  };

  const duplicateSelectedModule = () => {
    if (!selectedModule) return;
    const dup = duplicateModuleData(selectedModule);
    setSelectedModule(dup);
    setDirty(true);
    setMessage('Duplicate created — save to add it to the catalog.');
  };

  const exportSelectedModule = () => {
    if (!selectedModule) return;
    const blob = new Blob([JSON.stringify(selectedModule, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `module-${selectedModule.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onImportModuleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ModuleWithStatus;
      if (!parsed.id || !Array.isArray(parsed.steps)) {
        setMessage('Invalid module file: expected id and steps[]');
        return;
      }
      const imported: ModuleWithStatus = {
        ...parsed,
        id: uuidv4(),
        status: 'draft',
      };
      setSelectedModule(imported);
      setDirty(true);
      setMessage('Imported draft — review and save when ready.');
    } catch {
      setMessage('Could not read JSON file.');
    }
  };

  const saveModule = async (module: ModuleData) => {
    setSaving(true);
    setMessage('');
    try {
      const moduleWithStatus = module as ModuleWithStatus;
      const validationError = validateModuleBeforeSave(moduleWithStatus);
      if (validationError) {
        setMessage(validationError);
        return;
      }
      const res = await fetch(`/api/admin/content/modules/${module.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(moduleWithStatus),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to save module');
      } else {
        setMessage('Module saved successfully!');
        setDirty(false);
        await fetchModules();
        const reload = await fetch(`/api/admin/content/modules/${module.id}`, { credentials: 'include' });
        const reloadData = await reload.json();
        if (reload.ok && reloadData.module) {
          setSelectedModule({
            ...reloadData.module,
            status: moduleWithStatus.status,
            version: (reloadData as { version?: number }).version,
          });
        }
      }
    } catch {
      setMessage('Failed to save module');
    } finally {
      setSaving(false);
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/content/modules/${moduleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setModules(modules.filter(m => m.moduleId !== moduleId));
        if (selectedModule?.id === moduleId) {
          setSelectedModule(null);
          setDirty(false);
        }
      }
    } catch {
      setMessage('Failed to delete module');
    }
  };

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.moduleId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const groupedModules = filteredModules.reduce((acc, module) => {
    const tier = module.tierId;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(module);
    return acc;
  }, {} as Record<number, ModuleListItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading modules...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className="p-4 rounded-lg"
          style={{
            background: message.includes('success') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: message.includes('success') ? 'var(--color-success)' : 'var(--color-error)',
          }}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>Modules</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Edit learning content, steps, quizzes, and challenges
          </p>
        </div>
        <button
          onClick={createNewModule}
          className="w-full shrink-0 rounded-lg px-4 py-2 font-medium sm:w-auto"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          + New Module
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules..."
            className="w-full p-3 rounded-lg outline-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'published')}
          className="w-full shrink-0 rounded-lg p-3 outline-none sm:w-auto"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
        <div className="max-h-64 space-y-4 overflow-y-auto lg:col-span-1 lg:max-h-[calc(100vh-280px)]">
          {Object.entries(groupedModules).length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
              No modules found
            </p>
          ) : (
            Object.entries(groupedModules).map(([tier, tierModules]) => (
              <div key={tier}>
                <h3 className="text-sm font-medium mb-2 px-2" style={{ color: 'var(--text-muted)' }}>
                  Tier {tier}
                </h3>
                <div
                  className="rounded-lg p-2 space-y-1"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  {tierModules.map((module) => (
                    <button
                      key={module.moduleId}
                      onClick={() => void selectModule(module.moduleId)}
                      className="w-full text-left p-2 rounded-lg transition-colors"
                      style={{
                        background: selectedModule?.id === module.moduleId ? 'var(--bg-hover)' : 'transparent',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate text-sm">{module.title}</span>
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: module.status === 'published' ? 'var(--color-success)' : 'var(--text-muted)' }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Tier {module.tierId} • {module.moduleId}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="min-w-0 lg:col-span-3">
          {selectedModule ? (
            <div
              className="rounded-lg p-4 sm:p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={duplicateSelectedModule}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={exportSelectedModule}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                >
                  Import JSON
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={onImportModuleFile}
                />
                {dirty && (
                  <span className="text-xs self-center" style={{ color: 'var(--color-warning)' }}>
                    Unsaved changes
                  </span>
                )}
              </div>
              <ModuleEditor
                module={selectedModule}
                onChange={handleModuleChange}
                onSave={saveModule}
                isSaving={saving}
              />
              <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => deleteModule(selectedModule.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete Module
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg p-8 text-center sm:p-12"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No module selected</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Select a module from the list or create a new one
              </p>
              <button
                onClick={createNewModule}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Create New Module
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
