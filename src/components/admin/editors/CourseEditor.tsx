'use client';

import { useState } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import StatusBadge from '../shared/StatusBadge';
import DragDropList from '../shared/DragDropList';
import MediaLibraryPicker from '../shared/MediaLibraryPicker';

export interface Course {
  courseId: string;
  title: string;
  description?: string;
  subtitle?: string;
  learningOutcomes?: string[];
  audienceText?: string;
  prerequisitesText?: string;
  coverImageUrl?: string;
  introVideoUrl?: string;
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

export type ModuleListItem = { moduleId: string; title: string; status: string; tierId: number };

interface CourseEditorProps {
  course: Course;
  onChange: (course: Course) => void;
  allModules?: ModuleListItem[];
  onSave?: (course: Course) => Promise<void>;
  isSaving?: boolean;
}

export default function CourseEditor({ course, onChange, allModules = [], onSave, isSaving }: CourseEditorProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'sections'>('details');
  const [coverLibraryOpen, setCoverLibraryOpen] = useState(false);
  const [introLibraryOpen, setIntroLibraryOpen] = useState(false);

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
    
    const selectedModule = allModules.find(m => m.moduleId === moduleId);
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

  const unassignedModules = allModules.filter(
    m => !course.sections.some(s => s.modules.some(sm => sm.moduleId === m.moduleId))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <input
            type="text"
            value={course.title}
            onChange={(e) => updateCourse({ title: e.target.value })}
            placeholder="Course title"
            className="min-w-0 w-full bg-transparent text-xl font-semibold outline-none sm:text-2xl"
            style={{ color: 'var(--text-primary)' }}
          />
          <StatusBadge status={course.status} />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
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

      <div className="-mx-1 flex gap-1 overflow-x-auto p-1 pb-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
        {(['details', 'sections'] as const).map((tab) => (
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
        <div className="space-y-4">
          {coverLibraryOpen && (
            <MediaLibraryPicker
              mediaType="image"
              onPick={(item) => {
                updateCourse({ coverImageUrl: item.url });
                setCoverLibraryOpen(false);
              }}
              onClose={() => setCoverLibraryOpen(false)}
            />
          )}
          {introLibraryOpen && (
            <MediaLibraryPicker
              mediaType="video"
              onPick={(item) => {
                updateCourse({ introVideoUrl: item.url });
                setIntroLibraryOpen(false);
              }}
              onClose={() => setIntroLibraryOpen(false)}
            />
          )}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Subtitle
            </label>
            <input
              type="text"
              value={course.subtitle || ''}
              onChange={(e) => updateCourse({ subtitle: e.target.value })}
              placeholder="Short line under the title"
              className="w-full p-3 rounded-lg outline-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Markdown-style line breaks; rich formatting may be rendered for learners.
            </p>
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
              Learning outcomes
            </label>
            <div className="space-y-2">
              {(course.learningOutcomes ?? []).map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => {
                      const next = [...(course.learningOutcomes ?? [])];
                      next[idx] = e.target.value;
                      updateCourse({ learningOutcomes: next });
                    }}
                    placeholder={`Outcome ${idx + 1}`}
                    className="flex-1 p-2 rounded-lg outline-none text-sm"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = (course.learningOutcomes ?? []).filter((_, i) => i !== idx);
                      updateCourse({ learningOutcomes: next });
                    }}
                    className="text-sm px-2 text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateCourse({ learningOutcomes: [...(course.learningOutcomes ?? []), ''] })}
                className="text-sm px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              >
                + Add outcome
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Audience
            </label>
            <textarea
              value={course.audienceText || ''}
              onChange={(e) => updateCourse({ audienceText: e.target.value })}
              placeholder="Who this course is for..."
              rows={2}
              className="w-full p-3 rounded-lg outline-none resize-none text-sm"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Prerequisites
            </label>
            <textarea
              value={course.prerequisitesText || ''}
              onChange={(e) => updateCourse({ prerequisitesText: e.target.value })}
              placeholder="What learners should know first..."
              rows={2}
              className="w-full p-3 rounded-lg outline-none resize-none text-sm"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Cover image URL
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <input
                type="text"
                value={course.coverImageUrl || ''}
                onChange={(e) => updateCourse({ coverImageUrl: e.target.value })}
                placeholder="https://…"
                className="flex-1 min-w-[200px] p-2 rounded-lg outline-none text-sm"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={() => setCoverLibraryOpen(true)}
                className="text-sm px-3 py-2 rounded-lg whitespace-nowrap"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                From library
              </button>
            </div>
            {course.coverImageUrl ? (
              <div className="relative w-full max-w-md h-40 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-subtle)' }}>
                <Image src={course.coverImageUrl} alt="" fill unoptimized className="object-cover" />
              </div>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Intro video URL
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={course.introVideoUrl || ''}
                onChange={(e) => updateCourse({ introVideoUrl: e.target.value })}
                placeholder="YouTube, Vimeo, Loom, or hosted file URL"
                className="flex-1 min-w-[200px] p-2 rounded-lg outline-none text-sm"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={() => setIntroLibraryOpen(true)}
                className="text-sm px-3 py-2 rounded-lg whitespace-nowrap"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                From library
              </button>
            </div>
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
  availableModules: ModuleListItem[];
  onUpdate: (updates: Partial<Section>) => void;
  onRemove: () => void;
  onAddModule: (moduleId: string) => void;
  onRemoveModule: (moduleId: string) => void;
}

function SectionCard({ section, availableModules, onUpdate, onRemove, onAddModule, onRemoveModule }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const q = moduleSearch.trim().toLowerCase();
  const filteredForPicker = availableModules.filter(
    (m) =>
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.moduleId.toLowerCase().includes(q) ||
      String(m.tierId).includes(q),
  );

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
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Optional. Supports plain text / line breaks; may be shown with markdown rendering.
          </p>
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
                type="button"
                onClick={() => {
                  setShowModuleDropdown(!showModuleDropdown);
                  if (!showModuleDropdown) setModuleSearch('');
                }}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              >
                + Add Module
              </button>
              {showModuleDropdown && (
                <div
                  className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[min(70vh,24rem)] w-full min-w-0 overflow-hidden rounded-lg py-2 shadow-lg sm:right-auto sm:max-w-md"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <input
                    type="search"
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    placeholder="Search by title, id, or tier…"
                    className="w-full px-3 py-2 text-sm outline-none border-b mb-1"
                    style={{
                      background: 'transparent',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                    autoFocus
                  />
                  <div className="max-h-56 overflow-y-auto">
                    {filteredForPicker.length === 0 ? (
                      <p className="px-3 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        No modules match this filter.
                      </p>
                    ) : (
                      filteredForPicker.map((mod) => (
                        <button
                          key={mod.moduleId}
                          type="button"
                          onClick={() => {
                            onAddModule(mod.moduleId);
                            setShowModuleDropdown(false);
                            setModuleSearch('');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <span className="block font-medium">{mod.title}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Tier {mod.tierId} · {mod.moduleId}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
