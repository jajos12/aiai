import { db } from './database';

export interface AdminStatsSnapshot {
  totalUsers: number;
  totalModules: number;
  publishedModules: number;
  draftModules: number;
  totalCourses: number;
  draftCourses: number;
  publishedCourses: number;
  recentModules: Array<{ moduleId: string; title: string; status: string; updatedAt: string }>;
  recentCourses: Array<{ courseId: string; title: string; status: string; updatedAt: string }>;
  /** Modules with stored lesson-map / intelligence payloads (placeholder for richer analytics) */
  contentIntelligenceModules: number;
  /** Steps that include Lesson Studio structured payloads */
  lessonStudioSteps: number;
}

export function getAdminStatsSnapshot(): AdminStatsSnapshot {
  const totalUsers = (db.prepare(`SELECT COUNT(*) as c FROM users`).get() as { c: number }).c;

  const modRows = db
    .prepare(
      `SELECT module_id, title, status, updated_at FROM content_modules ORDER BY updated_at DESC`,
    )
    .all() as Array<{ module_id: string; title: string; status: string; updated_at: string }>;

  const totalModules = modRows.length;
  const publishedModules = modRows.filter((m) => m.status === 'published').length;
  const draftModules = totalModules - publishedModules;

  const courseRows = db
    .prepare(`SELECT course_id, title, status, updated_at FROM content_courses ORDER BY updated_at DESC`)
    .all() as Array<{ course_id: string; title: string; status: string; updated_at: string }>;

  const totalCourses = courseRows.length;
  const publishedCourses = courseRows.filter((c) => c.status === 'published').length;
  const draftCourses = totalCourses - publishedCourses;

  const contentIntelligenceModules = (
    db.prepare(`SELECT COUNT(*) as c FROM lesson_map_insights`).get() as { c: number }
  ).c;

  const lessonStudioSteps = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM content_module_steps WHERE content_studio_json IS NOT NULL AND TRIM(content_studio_json) != '' AND content_studio_json != '{}'`,
      )
      .get() as { c: number }
  ).c;

  return {
    totalUsers,
    totalModules,
    publishedModules,
    draftModules,
    totalCourses,
    draftCourses,
    publishedCourses,
    recentModules: modRows.slice(0, 8).map((m) => ({
      moduleId: m.module_id,
      title: m.title,
      status: m.status,
      updatedAt: m.updated_at,
    })),
    recentCourses: courseRows.slice(0, 8).map((c) => ({
      courseId: c.course_id,
      title: c.title,
      status: c.status,
      updatedAt: c.updated_at,
    })),
    contentIntelligenceModules,
    lessonStudioSteps,
  };
}
