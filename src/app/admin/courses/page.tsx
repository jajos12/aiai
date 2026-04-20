'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CourseEditor, { Course } from '@/components/admin/editors/CourseEditor';

interface CourseWithId extends Course {
  _id?: number;
}

interface ContentModuleSummary {
  moduleId: string;
  runtimeModuleId: string;
  title: string;
  tierId: number;
  clusterId: string;
  status: 'draft' | 'published';
  version: number;
}

function validateCourseBeforeSave(course: Course): string | null {
  const totalModules = course.sections.reduce((count, section) => count + section.modules.length, 0);
  if (totalModules === 0) {
    return 'A course must include at least one module inside a section before saving.';
  }
  return null;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithId[]>([]);
  const [modules, setModules] = useState<ContentModuleSummary[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/courses', { credentials: 'include' });
      const data = await res.json();
      if (data.courses) {
        setCourses(
          data.courses.map((c: CourseWithId) => ({
            ...c,
            sections: c.sections || [],
            learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes : [],
            subtitle: c.subtitle ?? '',
            audienceText: c.audienceText ?? '',
            prerequisitesText: c.prerequisitesText ?? '',
            coverImageUrl: c.coverImageUrl ?? '',
            introVideoUrl: c.introVideoUrl ?? '',
          })),
        );
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  }, []);

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
    Promise.all([fetchCourses(), fetchModules()]).finally(() => setLoading(false));
  }, [fetchCourses, fetchModules]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const selectCourse = (course: CourseWithId | null) => {
    if (course && selectedCourse && course.courseId === selectedCourse.courseId) {
      setSelectedCourse(course);
      return;
    }
    if (
      dirty &&
      selectedCourse &&
      course &&
      course.courseId !== selectedCourse.courseId
    ) {
      if (!window.confirm('You have unsaved changes. Discard them and switch course?')) return;
    }
    if (dirty && selectedCourse && course === null) {
      if (!window.confirm('You have unsaved changes. Leave without saving?')) return;
    }
    setDirty(false);
    setSelectedCourse(course);
  };

  const createNewCourse = () => {
    if (dirty && !window.confirm('Discard unsaved changes on the current course?')) return;
    const newCourse: CourseWithId = {
      courseId: uuidv4(),
      title: 'New Course',
      description: '',
      subtitle: '',
      learningOutcomes: [],
      audienceText: '',
      prerequisitesText: '',
      coverImageUrl: '',
      introVideoUrl: '',
      status: 'draft',
      sortOrder: courses.length,
      sections: [],
    };
    setCourses([...courses, newCourse]);
    setSelectedCourse(newCourse);
    setDirty(false);
  };

  const handleCourseChange = (updatedCourse: Course) => {
    const courseWithId = updatedCourse as CourseWithId;
    setCourses(courses.map(c => c.courseId === courseWithId.courseId ? courseWithId : c));
    setSelectedCourse(courseWithId);
    setDirty(true);
  };

  const duplicateSelectedCourse = () => {
    if (!selectedCourse) return;
    const dup: CourseWithId = {
      ...selectedCourse,
      courseId: uuidv4(),
      title: `Copy of ${selectedCourse.title}`,
      status: 'draft',
      sortOrder: courses.length,
      sections: selectedCourse.sections.map((s) => ({
        ...s,
        sectionId: uuidv4(),
        modules: s.modules.map((m) => ({ ...m })),
      })),
    };
    setCourses([...courses, dup]);
    setSelectedCourse(dup);
    setDirty(true);
    setMessage('Duplicate created — save when ready.');
  };

  const exportSelectedCourse = () => {
    if (!selectedCourse) return;
    const blob = new Blob([JSON.stringify(selectedCourse, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `course-${selectedCourse.courseId}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onImportCourseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as CourseWithId;
      if (!parsed.courseId || !Array.isArray(parsed.sections)) {
        setMessage('Invalid course file: expected courseId and sections[]');
        return;
      }
      const imported: CourseWithId = {
        ...parsed,
        courseId: uuidv4(),
        status: 'draft',
        sections: parsed.sections ?? [],
      };
      setCourses((c) => [...c, imported]);
      setSelectedCourse(imported);
      setDirty(true);
      setMessage('Imported draft — review and save when ready.');
    } catch {
      setMessage('Could not read JSON file.');
    }
  };

  const saveCourse = async (course: Course) => {
    setSaving(true);
    setMessage('');
    try {
      const validationError = validateCourseBeforeSave(course);
      if (validationError) {
        setMessage(validationError);
        return;
      }
      const res = await fetch('/api/admin/content/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(course),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to save course');
      } else {
        setMessage('Course saved successfully!');
        setDirty(false);
        void fetchCourses();
      }
    } catch {
      setMessage('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/content/courses?courseId=${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setCourses(courses.filter(c => c.courseId !== courseId));
        if (selectedCourse?.courseId === courseId) {
          setSelectedCourse(null);
          setDirty(false);
        }
      }
    } catch {
      setMessage('Failed to delete course');
    }
  };

  const allModules = modules.map((m) => ({
    moduleId: m.moduleId,
    title: m.title,
    status: m.status,
    tierId: m.tierId,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading courses...</div>
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
          <h2 className="text-xl font-semibold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>Courses</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Organize modules into courses with sections
          </p>
        </div>
        <button
          onClick={createNewCourse}
          className="w-full shrink-0 rounded-lg px-4 py-2 font-medium sm:w-auto"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          + New Course
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
        <div className="space-y-2 lg:col-span-1">
          <div
            className="max-h-52 space-y-1 overflow-y-auto rounded-lg p-3 lg:max-h-none lg:overflow-visible"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            {courses.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No courses yet
              </p>
            ) : (
              courses.map((course) => (
                <button
                  key={course.courseId}
                  type="button"
                  onClick={() => selectCourse(course)}
                  className="w-full text-left p-2 rounded-lg transition-colors"
                  style={{
                    background: selectedCourse?.courseId === course.courseId ? 'var(--bg-hover)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{course.title}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: course.status === 'published' ? 'var(--color-success)' : 'var(--text-muted)' }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {course.sections.length} sections
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="min-w-0 lg:col-span-3">
          {selectedCourse ? (
            <div
              className="rounded-lg p-4 sm:p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={duplicateSelectedCourse}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={exportSelectedCourse}
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
                  onChange={onImportCourseFile}
                />
                {dirty && (
                  <span className="text-xs self-center" style={{ color: 'var(--color-warning)' }}>
                    Unsaved changes
                  </span>
                )}
              </div>
              <CourseEditor
                course={selectedCourse}
                onChange={handleCourseChange}
                allModules={allModules}
                onSave={saveCourse}
                isSaving={saving}
              />
              <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => deleteCourse(selectedCourse.courseId)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete Course
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg p-8 text-center sm:p-12"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No course selected</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Select a course from the list or create a new one
              </p>
              <button
                onClick={createNewCourse}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Create New Course
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
