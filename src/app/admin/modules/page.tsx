'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ModuleData } from '@/core/types';
import ModuleEditor from '@/components/admin/editors/ModuleEditor';

interface ModuleWithStatus extends ModuleData {
  status: 'draft' | 'published';
}

interface ModuleListItem {
  moduleId: string;
  title: string;
  tierId: number;
  status: 'draft' | 'published';
}

function validateModuleBeforeSave(module: ModuleWithStatus): string | null {
  if (!module.steps.length) return 'A module must have at least one lesson step before saving.';
  for (const step of module.steps) {
    const hasText = Boolean(step.content.text?.trim());
    const noteLength = step.content.authorNote?.trim().length ?? 0;
    const hasDetailedNote = noteLength >= 80;
    const hasVideo = Boolean(step.content.video?.url?.trim());
    const hasImage = Boolean(step.content.image?.url?.trim());
    if (!hasText || !hasDetailedNote || (!hasVideo && !hasImage)) {
      return 'Each lesson step needs content text, a detailed note (at least 80 characters), and at least one media item (video or image).';
    }
  }
  return null;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleWithStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');

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

  const createNewModule = () => {
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
  };

  const handleModuleChange = (updatedModule: ModuleData) => {
    const moduleWithStatus: ModuleWithStatus = {
      ...(updatedModule as ModuleWithStatus),
      status: (updatedModule as ModuleWithStatus).status ?? selectedModule?.status ?? 'draft',
    };
    setSelectedModule(moduleWithStatus);
  };

  const selectModule = async (moduleId: string) => {
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
      };
      setSelectedModule(moduleWithStatus);
    } catch {
      setMessage('Failed to load module');
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
        await fetchModules();
        await selectModule(module.id);
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
        if (selectedModule?.id === moduleId) setSelectedModule(null);
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Modules</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Edit learning content, steps, quizzes, and challenges
          </p>
        </div>
        <button
          onClick={createNewModule}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          + New Module
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
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
          className="p-3 rounded-lg outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
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
                          className="w-2 h-2 rounded-full flex-shrink-0"
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

        <div className="col-span-3">
          {selectedModule ? (
            <div
              className="rounded-lg p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
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
              className="rounded-lg p-12 text-center"
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
