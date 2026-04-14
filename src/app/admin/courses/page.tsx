'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/courses', { credentials: 'include' });
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses.map((c: CourseWithId) => ({
          ...c,
          sections: c.sections || [],
        })));
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

  const createNewCourse = () => {
    const newCourse: CourseWithId = {
      courseId: uuidv4(),
      title: 'New Course',
      description: '',
      status: 'draft',
      sortOrder: courses.length,
      sections: [],
    };
    setCourses([...courses, newCourse]);
    setSelectedCourse(newCourse);
  };

  const handleCourseChange = (updatedCourse: Course) => {
    const courseWithId = updatedCourse as CourseWithId;
    setCourses(courses.map(c => c.courseId === courseWithId.courseId ? courseWithId : c));
    setSelectedCourse(courseWithId);
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
        fetchCourses();
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
        }
      }
    } catch {
      setMessage('Failed to delete course');
    }
  };

  const availableModules = modules.map(m => ({
    moduleId: m.moduleId,
    title: m.title,
    status: m.status,
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Courses</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Organize modules into courses with sections
          </p>
        </div>
        <button
          onClick={createNewCourse}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          + New Course
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          <div
            className="rounded-lg p-3 space-y-1"
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
                  onClick={() => setSelectedCourse(course)}
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

        <div className="col-span-3">
          {selectedCourse ? (
            <div
              className="rounded-lg p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <CourseEditor
                course={selectedCourse}
                onChange={handleCourseChange}
                availableModules={availableModules}
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
              className="rounded-lg p-12 text-center"
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
