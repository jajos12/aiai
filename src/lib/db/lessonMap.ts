import { db } from './database';

export interface StepInsight {
  stepId: string;
  insight: string;
  concepts: string[];
  summary?: string;
}

export type LessonMapInsights = Record<string, StepInsight>;

export function getLessonMapInsights(moduleId: string): LessonMapInsights | null {
  const row = db
    .prepare('SELECT insights_json FROM lesson_map_insights WHERE module_id = ?')
    .get(moduleId) as { insights_json: string } | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.insights_json) as LessonMapInsights;
  } catch {
    return null;
  }
}

export function saveLessonMapInsights(moduleId: string, insights: LessonMapInsights): void {
  db.prepare(
    `INSERT INTO lesson_map_insights (module_id, insights_json, created_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(module_id) DO UPDATE SET insights_json = excluded.insights_json, created_at = CURRENT_TIMESTAMP`,
  ).run(moduleId, JSON.stringify(insights));
}

export function deleteLessonMapInsights(moduleId: string): void {
  db.prepare('DELETE FROM lesson_map_insights WHERE module_id = ?').run(moduleId);
}
