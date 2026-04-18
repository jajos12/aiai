'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ModuleData, Step, Challenge, PlaygroundConfig } from '@/core/types';
import StatusBadge from '../shared/StatusBadge';
import DragDropList from '../shared/DragDropList';
import StepEditor from './StepEditor';

interface AdminModuleData extends ModuleData {
  status?: 'draft' | 'published';
  version?: number;
}

interface ModuleEditorProps {
  module: AdminModuleData;
  onChange: (module: ModuleData) => void;
  onSave?: (module: ModuleData) => Promise<void>;
  isSaving?: boolean;
}

export default function ModuleEditor({ module, onChange, onSave, isSaving }: ModuleEditorProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'steps' | 'playground' | 'challenges'>('details');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [versions, setVersions] = useState<Array<{ version: number; status: string; createdAt: string }>>([]);
  const [restoreVersion, setRestoreVersion] = useState<string>('');

  const loadVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/content/module-versions?moduleId=${encodeURIComponent(module.id)}`, {
        credentials: 'include',
      });
      const data = (await res.json()) as { versions?: typeof versions };
      if (data.versions) setVersions(data.versions);
    } catch {
      setVersions([]);
    }
  }, [module.id]);

  useEffect(() => {
    void loadVersions();
  }, [loadVersions, module.version]);

  const updateModule = (updates: Partial<ModuleData>) => {
    onChange({ ...module, ...updates });
  };

  const addStep = () => {
    const newStep: Step = {
      id: uuidv4(),
      title: `Step ${module.steps.length + 1}`,
      visualizationProps: {},
      content: { text: '' },
    };
    updateModule({ steps: [...module.steps, newStep] });
    setSelectedStepId(newStep.id);
  };

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    updateModule({
      steps: module.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
    });
  };

  const removeStep = (stepId: string) => {
    if (!confirm('Remove this step?')) return;
    updateModule({ steps: module.steps.filter(s => s.id !== stepId) });
    if (selectedStepId === stepId) setSelectedStepId(null);
  };

  const reorderSteps = (newSteps: Step[]) => {
    updateModule({ steps: newSteps });
  };

  const selectedStep = module.steps.find(s => s.id === selectedStepId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>Version {module.version ?? '—'}</span>
          <select
            value={restoreVersion}
            onChange={(e) => setRestoreVersion(e.target.value)}
            className="max-w-[200px] rounded border px-2 py-1 text-xs"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          >
            <option value="">Restore snapshot…</option>
            {versions.map((v) => (
              <option key={v.version} value={String(v.version)}>
                v{v.version} ({v.status}) {new Date(v.createdAt).toLocaleString()}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!restoreVersion}
            onClick={async () => {
              const v = Number(restoreVersion);
              if (!v || !confirm(`Restore module to version ${v} as draft? Unsaved editor changes may be lost.`)) return;
              const res = await fetch('/api/admin/content/module-versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ moduleId: module.id, version: v }),
              });
              const data = (await res.json()) as { module?: typeof module; error?: string };
              if (!res.ok) {
                alert(data.error || 'Restore failed');
                return;
              }
              if (data.module) {
                onChange({ ...(data.module as ModuleData), status: 'draft' } as AdminModuleData);
              }
              setRestoreVersion('');
              void loadVersions();
            }}
            className="rounded px-2 py-1 text-xs font-medium disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Restore
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <input
            type="text"
            value={module.title}
            onChange={(e) => updateModule({ title: e.target.value })}
            placeholder="Module title"
            className="min-w-0 w-full flex-1 bg-transparent text-xl font-semibold outline-none sm:text-2xl"
            style={{ color: 'var(--text-primary)' }}
          />
          <StatusBadge status={module.status as 'draft' | 'published' || 'draft'} />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const newStatus = module.status === 'published' ? 'draft' : 'published';
              onChange({ ...module, status: newStatus } as ModuleData);
            }}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: module.status === 'published' ? 'var(--bg-hover)' : 'var(--accent)',
              color: module.status === 'published' ? 'var(--text-primary)' : 'white',
            }}
          >
            {module.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          {onSave && (
            <button
              onClick={() => onSave(module)}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {isSaving ? 'Saving...' : 'Save Module'}
            </button>
          )}
        </div>
      </div>

      <div className="-mx-1 flex gap-1 overflow-x-auto p-1 pb-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
        {(['details', 'steps', 'playground', 'challenges'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors sm:px-4"
            style={{
              background: activeTab === tab ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <ModuleDetailsEditor module={module} onChange={updateModule} />
      )}

      {activeTab === 'steps' && (
        <div className="grid min-h-[320px] grid-cols-1 gap-4 xl:min-h-[500px] xl:grid-cols-3">
          <div className="space-y-2 xl:col-span-1">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Lessons ({module.steps.length})
              </h3>
              <button
                onClick={addStep}
                className="w-full shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium sm:w-auto"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                + Add Lesson Step
              </button>
            </div>
            {module.steps.length === 0 ? (
              <div
                className="p-4 text-center rounded-lg border-2 border-dashed"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                No lessons yet. Add at least one lesson step before saving this module.
              </div>
            ) : (
              <DragDropList
                items={module.steps}
                onReorder={reorderSteps}
                keyExtractor={(s) => s.id}
                renderItem={(step) => (
                  <button
                    onClick={() => setSelectedStepId(step.id)}
                    className="w-full text-left"
                    style={{
                      background: selectedStepId === step.id ? 'var(--accent)' : 'transparent',
                      color: selectedStepId === step.id ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    <span className="block truncate">{step.title}</span>
                  </button>
                )}
                itemClassName="cursor-pointer p-2 hover:bg-black/5"
              />
            )}
          </div>

          <div className="min-w-0 rounded-lg p-3 sm:p-4 xl:col-span-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {selectedStep ? (
              <StepEditor
                step={selectedStep}
                moduleTitle={module.title}
                onChange={(updates) => updateStep(selectedStep.id, updates)}
                onRemove={() => removeStep(selectedStep.id)}
              />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
                Select a step to edit
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'playground' && (
        <PlaygroundEditor
          playground={module.playground}
          onChange={(playground) => updateModule({ playground })}
        />
      )}

      {activeTab === 'challenges' && (
        <ChallengesEditor
          challenges={module.challenges}
          onChange={(challenges) => updateModule({ challenges })}
        />
      )}
    </div>
  );
}

interface ModuleDetailsEditorProps {
  module: ModuleData;
  onChange: (updates: Partial<ModuleData>) => void;
}

function ModuleDetailsEditor({ module, onChange }: ModuleDetailsEditorProps) {
  const [newTag, setNewTag] = useState('');
  const [newPrereq, setNewPrereq] = useState('');

  const addTag = () => {
    if (!newTag.trim()) return;
    onChange({ tags: [...module.tags, newTag.trim()] });
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    onChange({ tags: module.tags.filter(t => t !== tag) });
  };

  const addPrereq = () => {
    if (!newPrereq.trim()) return;
    onChange({ prerequisites: [...module.prerequisites, newPrereq.trim()] });
    setNewPrereq('');
  };

  const removePrereq = (prereq: string) => {
    onChange({ prerequisites: module.prerequisites.filter(p => p !== prereq) });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Description
          </label>
          <textarea
            value={module.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Module description..."
            rows={3}
            className="w-full p-3 rounded-lg outline-none resize-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Difficulty
            </label>
            <select
              value={module.difficulty}
              onChange={(e) => onChange({ difficulty: e.target.value as ModuleData['difficulty'] })}
              className="w-full p-2 rounded-lg outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="research">Research</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Estimated Minutes
            </label>
            <input
              type="number"
              value={module.estimatedMinutes}
              onChange={(e) => onChange({ estimatedMinutes: parseInt(e.target.value) || 0 })}
              className="w-full p-2 rounded-lg outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {module.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="text-red-500 hover:underline">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add a tag"
              className="flex-1 p-2 rounded-lg outline-none text-sm"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <button onClick={addTag} className="px-3 py-1 rounded-lg text-sm" style={{ background: 'var(--accent)', color: 'white' }}>Add</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Prerequisites (module IDs)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {module.prerequisites.map((prereq) => (
              <span
                key={prereq}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                {prereq}
                <button onClick={() => removePrereq(prereq)} className="text-red-500 hover:underline">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPrereq}
              onChange={(e) => setNewPrereq(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPrereq()}
              placeholder="Add prerequisite module ID"
              className="flex-1 p-2 rounded-lg outline-none text-sm"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <button onClick={addPrereq} className="px-3 py-1 rounded-lg text-sm" style={{ background: 'var(--accent)', color: 'white' }}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlaygroundEditorProps {
  playground: PlaygroundConfig;
  onChange: (playground: PlaygroundConfig) => void;
}

function PlaygroundEditor({ playground, onChange }: PlaygroundEditorProps) {
  const updatePlayground = (updates: Partial<PlaygroundConfig>) => {
    onChange({ ...playground, ...updates });
  };

  const addParameter = () => {
    onChange({
      ...playground,
      parameters: [
        ...playground.parameters,
        { id: uuidv4(), label: 'New Parameter', type: 'slider', default: 0, min: 0, max: 100 },
      ],
    });
  };

  const updateParameter = (paramId: string, updates: Partial<typeof playground.parameters[0]>) => {
    onChange({
      ...playground,
      parameters: playground.parameters.map(p => p.id === paramId ? { ...p, ...updates } : p),
    });
  };

  const removeParameter = (paramId: string) => {
    onChange({ ...playground, parameters: playground.parameters.filter(p => p.id !== paramId) });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Playground Description
        </label>
        <textarea
          value={playground.description}
          onChange={(e) => updatePlayground({ description: e.target.value })}
          placeholder="Describe what users can explore in this playground..."
          rows={3}
          className="w-full p-3 rounded-lg outline-none resize-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        />
      </div>

      <div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Parameters
          </label>
          <button
            onClick={addParameter}
            className="w-full rounded-lg px-3 py-1.5 text-sm font-medium sm:w-auto"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            + Add Parameter
          </button>
        </div>
        <div className="space-y-3">
          {playground.parameters.map((param) => (
            <div key={param.id} className="flex flex-col gap-3 rounded-lg p-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="min-w-0 flex-1 sm:basis-full lg:basis-auto">
                <input
                  type="text"
                  value={param.label}
                  onChange={(e) => updateParameter(param.id, { label: e.target.value })}
                  className="w-full p-2 rounded outline-none text-sm font-medium"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                />
              </div>
              <select
                value={param.type}
                onChange={(e) => updateParameter(param.id, { type: e.target.value as 'slider' | 'stepper' | 'toggle' | 'select' })}
                className="w-full shrink-0 rounded p-2 text-sm sm:w-auto"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
              >
                <option value="slider">Slider</option>
                <option value="stepper">Stepper</option>
                <option value="toggle">Toggle</option>
                <option value="select">Select</option>
              </select>
              {(param.type === 'slider' || param.type === 'stepper') && (
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <input
                    type="number"
                    value={param.min ?? 0}
                    onChange={(e) => updateParameter(param.id, { min: parseFloat(e.target.value) })}
                    placeholder="Min"
                    className="min-w-0 flex-1 rounded p-2 text-sm sm:w-20 sm:flex-none"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                  />
                  <input
                    type="number"
                    value={param.max ?? 100}
                    onChange={(e) => updateParameter(param.id, { max: parseFloat(e.target.value) })}
                    placeholder="Max"
                    className="min-w-0 flex-1 rounded p-2 text-sm sm:w-20 sm:flex-none"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                  />
                </div>
              )}
              <input
                type="number"
                value={param.default as number}
                onChange={(e) => updateParameter(param.id, { default: parseFloat(e.target.value) })}
                placeholder="Default"
                className="w-full rounded p-2 text-sm sm:w-24"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
              />
              <button type="button" onClick={() => removeParameter(param.id)} className="self-start text-sm text-red-500 hover:underline sm:self-center">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Try This Suggestions
        </label>
        <div className="space-y-2">
          {playground.tryThis.map((suggestion, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={suggestion}
                onChange={(e) => {
                  const newTryThis = [...playground.tryThis];
                  newTryThis[i] = e.target.value;
                  updatePlayground({ tryThis: newTryThis });
                }}
                className="flex-1 p-2 rounded-lg outline-none text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => updatePlayground({ tryThis: playground.tryThis.filter((_, idx) => idx !== i) })}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => updatePlayground({ tryThis: [...playground.tryThis, ''] })}
            className="text-sm"
            style={{ color: 'var(--accent)' }}
          >
            + Add suggestion
          </button>
        </div>
      </div>
    </div>
  );
}

interface ChallengesEditorProps {
  challenges: Challenge[];
  onChange: (challenges: Challenge[]) => void;
}

function ChallengesEditor({ challenges, onChange }: ChallengesEditorProps) {
  const addChallenge = () => {
    const newChallenge: Challenge = {
      id: uuidv4(),
      title: `Challenge ${challenges.length + 1}`,
      description: '',
      completionCriteria: { type: 'threshold', target: 80, metric: 'score' },
    };
    onChange([...challenges, newChallenge]);
  };

  const updateChallenge = (id: string, updates: Partial<Challenge>) => {
    onChange(challenges.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeChallenge = (id: string) => {
    if (!confirm('Remove this challenge?')) return;
    onChange(challenges.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
          Challenges ({challenges.length})
        </h3>
        <button
          onClick={addChallenge}
          className="w-full rounded-lg px-3 py-1.5 text-sm font-medium sm:w-auto"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          + Add Challenge
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="p-8 text-center rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
          No challenges yet. Add challenges to test learner understanding.
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="p-4 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <div className="min-w-0 flex-1 space-y-3">
                  <input
                    type="text"
                    value={challenge.title}
                    onChange={(e) => updateChallenge(challenge.id, { title: e.target.value })}
                    className="w-full p-2 rounded-lg outline-none font-medium"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                  />
                  <textarea
                    value={challenge.description}
                    onChange={(e) => updateChallenge(challenge.id, { description: e.target.value })}
                    placeholder="Challenge description..."
                    rows={2}
                    className="w-full p-2 rounded-lg outline-none resize-none text-sm"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <select
                      value={challenge.completionCriteria.type}
                      onChange={(e) => updateChallenge(challenge.id, { completionCriteria: { ...challenge.completionCriteria, type: e.target.value as Challenge['completionCriteria']['type'] } })}
                      className="p-2 rounded text-sm"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                    >
                      <option value="threshold">Threshold</option>
                      <option value="exact">Exact</option>
                      <option value="distance">Distance</option>
                    </select>
                    <input
                      type="number"
                      value={challenge.completionCriteria.target as number}
                      onChange={(e) => updateChallenge(challenge.id, { completionCriteria: { ...challenge.completionCriteria, target: parseFloat(e.target.value) } })}
                      placeholder="Target"
                      className="p-2 rounded text-sm"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                    />
                    <input
                      type="text"
                      value={challenge.completionCriteria.metric}
                      onChange={(e) => updateChallenge(challenge.id, { completionCriteria: { ...challenge.completionCriteria, metric: e.target.value } })}
                      placeholder="Metric"
                      className="p-2 rounded text-sm"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
                <button type="button" onClick={() => removeChallenge(challenge.id)} className="shrink-0 self-start text-sm text-red-500 hover:underline sm:self-auto">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
