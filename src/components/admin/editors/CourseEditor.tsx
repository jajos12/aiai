'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StatusBadge from '../shared/StatusBadge';
import DragDropList from '../shared/DragDropList';

export interface Course {
  courseId: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  sortOrder: number;
  sections: Section[];
}

export interface Section {
  sectionId: string;
  title: string;
  description?: string;
  sortOrder: number;
  modules: ModuleRef[];
}

export interface ModuleRef {
  moduleId: string;
  sortOrder: number;
  title?: string;
  status?: 'draft' | 'published';
}

interface CourseEditorProps {
  course: Course;
  onChange: (course: Course) => void;
  availableModules?: { moduleId: string; title: string; status: string }[];
  onSave?: (course: Course) => Promise<void>;
  isSaving?: boolean;
}

export default function CourseEditor({ course, onChange, availableModules = [], onSave, isSaving }: CourseEditorProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'sections'>('details');

  const updateCourse = (updates: Partial<Course>) => {
    onChange({ ...course, ...updates });
  };

  const addSection = () => {
    const newSection: Section = {
      sectionId: uuidv4(),
      title: `Section ${course.sections.length + 1}`,
      description: '',
      sortOrder: course.sections.length,
      modules: [],
    };
    updateCourse({ sections: [...course.sections, newSection] });
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    updateCourse({
      sections: course.sections.map(s => s.sectionId === sectionId ? { ...s, ...updates } : s),
    });
  };

  const removeSection = (sectionId: string) => {
    if (!confirm('Remove this section?')) return;
    updateCourse({
      sections: course.sections.filter(s => s.sectionId !== sectionId),
    });
  };

  const reorderSections = (newSections: Section[]) => {
    updateCourse({
      sections: newSections.map((s, i) => ({ ...s, sortOrder: i })),
    });
  };

  const addModuleToSection = (sectionId: string, moduleId: string) => {
    const section = course.sections.find(s => s.sectionId === sectionId);
    if (!section) return;
    if (section.modules.some(m => m.moduleId === moduleId)) return;
    
    const selectedModule = availableModules.find(m => m.moduleId === moduleId);
    updateSection(sectionId, {
      modules: [...section.modules, { moduleId, sortOrder: section.modules.length, title: selectedModule?.title }],
    });
  };

  const removeModuleFromSection = (sectionId: string, moduleId: string) => {
    const section = course.sections.find(s => s.sectionId === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      modules: section.modules.filter(m => m.moduleId !== moduleId),
    });
  };

  const unassignedModules = availableModules.filter(
    m => !course.sections.some(s => s.modules.some(sm => sm.moduleId === m.moduleId))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={course.title}
            onChange={(e) => updateCourse({ title: e.target.value })}
            placeholder="Course title"
            className="text-2xl font-semibold bg-transparent outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <StatusBadge status={course.status} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateCourse({ status: course.status === 'published' ? 'draft' : 'published' })}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: course.status === 'published' ? 'var(--bg-hover)' : 'var(--accent)',
              color: course.status === 'published' ? 'var(--text-primary)' : 'white',
            }}
          >
            {course.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          {onSave && (
            <button
              onClick={() => onSave(course)}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {isSaving ? 'Saving...' : 'Save Course'}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
        {(['details', 'sections'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize"
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              value={course.description || ''}
              onChange={(e) => updateCourse({ description: e.target.value })}
              placeholder="Course description..."
              rows={4}
              className="w-full p-3 rounded-lg outline-none resize-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Sort Order
            </label>
            <input
              type="number"
              value={course.sortOrder}
              onChange={(e) => updateCourse({ sortOrder: parseInt(e.target.value) || 0 })}
              className="w-32 p-2 rounded-lg outline-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Sections ({course.sections.length})
            </h3>
            <button
              onClick={addSection}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              + Add Section
            </button>
          </div>

          {course.sections.length === 0 ? (
            <div
              className="p-8 text-center rounded-lg border-2 border-dashed"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              <p>No sections yet. Add your first section to organize course content.</p>
            </div>
          ) : (
            <DragDropList
              items={course.sections}
              onReorder={reorderSections}
              keyExtractor={(s) => s.sectionId}
              renderItem={(section) => (
                <SectionCard
                  section={section}
                  availableModules={unassignedModules}
                  onUpdate={(updates) => updateSection(section.sectionId, updates)}
                  onRemove={() => removeSection(section.sectionId)}
                  onAddModule={(moduleId) => addModuleToSection(section.sectionId, moduleId)}
                  onRemoveModule={(moduleId) => removeModuleFromSection(section.sectionId, moduleId)}
                />
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface SectionCardProps {
  section: Section;
  availableModules: { moduleId: string; title: string; status: string }[];
  onUpdate: (updates: Partial<Section>) => void;
  onRemove: () => void;
  onAddModule: (moduleId: string) => void;
  onRemoveModule: (moduleId: string) => void;
}

function SectionCard({ section, availableModules, onUpdate, onRemove, onAddModule, onRemoveModule }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);

  return (
    <div className="p-3">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="flex-1 bg-transparent outline-none font-medium"
          style={{ color: 'var(--text-primary)' }}
        />
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {section.modules.length} modules
        </span>
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-red-500/20 text-red-500"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-3">
          <textarea
            value={section.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Section description (optional)"
            rows={2}
            className="w-full p-2 rounded-lg text-sm outline-none resize-none"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />

          <div className="space-y-2">
            {section.modules.map((mod) => (
              <div
                key={mod.moduleId}
                className="flex items-center justify-between p-2 rounded"
                style={{ background: 'var(--bg-hover)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{mod.title || mod.moduleId}</span>
                <button
                  onClick={() => onRemoveModule(mod.moduleId)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {availableModules.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowModuleDropdown(!showModuleDropdown)}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              >
                + Add Module
              </button>
              {showModuleDropdown && (
                <div
                  className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-10 min-w-[200px]"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  {availableModules.map((mod) => (
                    <button
                      key={mod.moduleId}
                      onClick={() => {
                        onAddModule(mod.moduleId);
                        setShowModuleDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {mod.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
