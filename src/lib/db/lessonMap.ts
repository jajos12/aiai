import { db } from './database';

export interface StepInsight {
  stepId: string;
  insight: string;
  concepts: string[];
  summary?: string;
}

export type LessonMapInsights = Record<string, StepInsight>;

function normalizeStepInsight(raw: unknown, fallbackKey: string): StepInsight | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const stepId = typeof o.stepId === 'string' && o.stepId ? o.stepId : fallbackKey;
  const insight = typeof o.insight === 'string' ? o.insight : '';
  const concepts = Array.isArray(o.concepts)
    ? o.concepts.map((c) => String(c).slice(0, 200)).slice(0, 40)
    : [];
  const summary = typeof o.summary === 'string' ? o.summary.slice(0, 500) : undefined;
  return { stepId, insight: insight.slice(0, 2000), concepts, summary };
}

/** Accepts legacy or partially invalid cached JSON without throwing. */
export function getLessonMapInsights(moduleId: string): LessonMapInsights | null {
  const row = db
    .prepare('SELECT insights_json FROM lesson_map_insights WHERE module_id = ?')
    .get(moduleId) as { insights_json: string } | undefined;
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.insights_json) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const out: LessonMapInsights = {};
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      const rowInsight = normalizeStepInsight(val, key);
      if (!rowInsight) continue;
      out[rowInsight.stepId] = rowInsight;
    }
    return Object.keys(out).length > 0 ? out : null;
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
