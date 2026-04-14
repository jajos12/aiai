import { z } from 'zod';
import { db } from './database';
import type { ModuleData } from '@/core/types';

const moduleDataSchema = z.object({
  id: z.string().min(1),
  tierId: z.number(),
  clusterId: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string()),
  prerequisites: z.array(z.string()),
  difficulty: z.union([
    z.literal('beginner'),
    z.literal('intermediate'),
    z.literal('advanced'),
    z.literal('research'),
  ]),
  estimatedMinutes: z.number(),
  steps: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      concepts: z.array(z.string()).optional(),
      visualizationProps: z.record(z.string(), z.unknown()),
      content: z.object({
        text: z.string(),
        goDeeper: z
          .object({
            math: z.string().optional(),
            explanation: z.string(),
            references: z
              .array(
                z.object({
                  title: z.string(),
                  author: z.string(),
                  url: z.string().optional(),
                  year: z.number().optional(),
                }),
              )
              .optional(),
          })
          .optional(),
        authorNote: z.string().optional(),
      }),
      quiz: z
        .object({
          question: z.string(),
          options: z.array(z.string()),
          correctIndex: z.number(),
          explanation: z.string(),
        })
        .optional(),
      interactionHint: z.string().optional(),
    }),
  ),
  playground: z.object({
    description: z.string(),
    parameters: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.union([z.literal('slider'), z.literal('stepper'), z.literal('toggle'), z.literal('select')]),
        min: z.number().optional(),
        max: z.number().optional(),
        step: z.number().optional(),
        default: z.union([z.number(), z.boolean(), z.string()]),
        options: z.array(z.string()).optional(),
      }),
    ),
    tryThis: z.array(z.string()),
  }),
  challenges: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      concepts: z.array(z.string()).optional(),
      component: z.string().optional(),
      props: z.record(z.string(), z.unknown()).optional(),
      completionCriteria: z.object({
        type: z.union([z.literal('threshold'), z.literal('exact'), z.literal('custom'), z.literal('distance')]),
        target: z.union([z.number(), z.string(), z.object({ x: z.number(), y: z.number() })]),
        metric: z.string(),
      }),
      hints: z.array(z.string()).optional(),
      maxAttempts: z.number().optional(),
    }),
  ),
});

type ModuleRow = {
  module_id: string;
  runtime_module_id: string;
  tier_id: number;
  cluster_id: string;
  title: string;
  description: string;
  tags_json: string;
  prerequisites_json: string;
  difficulty: ModuleData['difficulty'];
  estimated_minutes: number;
  status: 'draft' | 'published';
  version: number;
  created_at: string;
  updated_at: string;
};

type StepRow = {
  step_id: string;
  title: string;
  concepts_json: string;
  visualization_props_json: string;
  content_text: string;
  go_deeper_json: string | null;
  author_note: string | null;
  interaction_hint: string | null;
  quiz_json: string | null;
  sort_order: number;
};

type PlaygroundRow = {
  description: string;
  parameters_json: string;
  try_this_json: string;
};

type ChallengeRow = {
  challenge_id: string;
  title: string;
  description: string;
  concepts_json: string;
  component: string | null;
  props_json: string | null;
  completion_criteria_json: string;
  hints_json: string;
  max_attempts: number | null;
  sort_order: number;
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function listContentModules(): Array<{
  moduleId: string;
  runtimeModuleId: string;
  title: string;
  tierId: number;
  clusterId: string;
  status: 'draft' | 'published';
  version: number;
  updatedAt: string;
}> {
  const rows = db
    .prepare(
      `SELECT module_id, runtime_module_id, title, tier_id, cluster_id, status, version, updated_at
       FROM content_modules
       ORDER BY tier_id ASC, title ASC`,
    )
    .all() as ModuleRow[];
  return rows.map((row) => ({
    moduleId: row.module_id,
    runtimeModuleId: row.runtime_module_id,
    title: row.title,
    tierId: row.tier_id,
    clusterId: row.cluster_id,
    status: row.status,
    version: row.version,
    updatedAt: row.updated_at,
  }));
}

export function getContentModuleData(moduleId: string, opts?: { publishedOnly?: boolean }): ModuleData | null {
  const whereStatus = opts?.publishedOnly ? `AND status = 'published'` : '';
  const moduleRow = db
    .prepare(`SELECT * FROM content_modules WHERE module_id = ? ${whereStatus}`)
    .get(moduleId) as ModuleRow | undefined;

  if (!moduleRow) return null;

  const stepRows = db
    .prepare(`SELECT * FROM content_module_steps WHERE module_id = ? ORDER BY sort_order ASC`)
    .all(moduleId) as StepRow[];
  const playgroundRow = db
    .prepare(`SELECT * FROM content_module_playgrounds WHERE module_id = ?`)
    .get(moduleId) as PlaygroundRow | undefined;
  const challengeRows = db
    .prepare(`SELECT * FROM content_module_challenges WHERE module_id = ? ORDER BY sort_order ASC`)
    .all(moduleId) as ChallengeRow[];

  const candidate = {
    id: moduleRow.module_id,
    tierId: moduleRow.tier_id,
    clusterId: moduleRow.cluster_id,
    title: moduleRow.title,
    description: moduleRow.description,
    tags: parseJson<string[]>(moduleRow.tags_json, []),
    prerequisites: parseJson<string[]>(moduleRow.prerequisites_json, []),
    difficulty: moduleRow.difficulty,
    estimatedMinutes: moduleRow.estimated_minutes,
    steps: stepRows.map((step) => ({
      id: step.step_id,
      title: step.title,
      concepts: parseJson<string[]>(step.concepts_json, []),
      visualizationProps: parseJson<Record<string, unknown>>(step.visualization_props_json, {}),
      content: {
        text: step.content_text,
        goDeeper: parseJson(step.go_deeper_json, undefined),
        authorNote: step.author_note ?? undefined,
      },
      quiz: parseJson(step.quiz_json, undefined),
      interactionHint: step.interaction_hint ?? undefined,
    })),
    playground: {
      description: playgroundRow?.description ?? '',
      parameters: parseJson(playgroundRow?.parameters_json, []),
      tryThis: parseJson(playgroundRow?.try_this_json, []),
    },
    challenges: challengeRows.map((ch) => ({
      id: ch.challenge_id,
      title: ch.title,
      description: ch.description,
      concepts: parseJson<string[]>(ch.concepts_json, []),
      component: ch.component ?? undefined,
      props: parseJson(ch.props_json, undefined),
      completionCriteria: parseJson(ch.completion_criteria_json, { type: 'threshold', target: 0, metric: 'unknown' }),
      hints: parseJson<string[]>(ch.hints_json, []),
      maxAttempts: ch.max_attempts ?? undefined,
    })),
  };

  const parsed = moduleDataSchema.safeParse(candidate);
  if (!parsed.success) return null;
  return parsed.data as ModuleData;
}

export function upsertContentModule(moduleData: ModuleData, updatedBy?: number, status: 'draft' | 'published' = 'draft'): void {
  const validated = moduleDataSchema.parse(moduleData) as ModuleData;
  const nowVersionRow = db
    .prepare(`SELECT version FROM content_modules WHERE module_id = ?`)
    .get(validated.id) as { version: number } | undefined;
  const nextVersion = (nowVersionRow?.version ?? 0) + 1;

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO content_modules (
        module_id, runtime_module_id, tier_id, cluster_id, title, description,
        tags_json, prerequisites_json, difficulty, estimated_minutes, status, version, updated_by, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(module_id) DO UPDATE SET
        runtime_module_id = excluded.runtime_module_id,
        tier_id = excluded.tier_id,
        cluster_id = excluded.cluster_id,
        title = excluded.title,
        description = excluded.description,
        tags_json = excluded.tags_json,
        prerequisites_json = excluded.prerequisites_json,
        difficulty = excluded.difficulty,
        estimated_minutes = excluded.estimated_minutes,
        status = excluded.status,
        version = excluded.version,
        updated_by = excluded.updated_by,
        updated_at = CURRENT_TIMESTAMP`,
    ).run(
      validated.id,
      validated.id,
      validated.tierId,
      validated.clusterId,
      validated.title,
      validated.description,
      JSON.stringify(validated.tags),
      JSON.stringify(validated.prerequisites),
      validated.difficulty,
      validated.estimatedMinutes,
      status,
      nextVersion,
      updatedBy ?? null,
    );

    db.prepare(`DELETE FROM content_module_steps WHERE module_id = ?`).run(validated.id);
    db.prepare(`DELETE FROM content_module_challenges WHERE module_id = ?`).run(validated.id);

    const insertStep = db.prepare(
      `INSERT INTO content_module_steps (
        module_id, step_id, sort_order, title, concepts_json, visualization_props_json,
        content_text, go_deeper_json, author_note, interaction_hint, quiz_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    );

    validated.steps.forEach((step, idx) => {
      insertStep.run(
        validated.id,
        step.id,
        idx,
        step.title,
        JSON.stringify(step.concepts ?? []),
        JSON.stringify(step.visualizationProps ?? {}),
        step.content.text ?? '',
        step.content.goDeeper ? JSON.stringify(step.content.goDeeper) : null,
        step.content.authorNote ?? null,
        step.interactionHint ?? null,
        step.quiz ? JSON.stringify(step.quiz) : null,
      );
    });

    db.prepare(
      `INSERT INTO content_module_playgrounds (module_id, description, parameters_json, try_this_json, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(module_id) DO UPDATE SET
         description = excluded.description,
         parameters_json = excluded.parameters_json,
         try_this_json = excluded.try_this_json,
         updated_at = CURRENT_TIMESTAMP`,
    ).run(
      validated.id,
      validated.playground.description ?? '',
      JSON.stringify(validated.playground.parameters ?? []),
      JSON.stringify(validated.playground.tryThis ?? []),
    );

    const insertChallenge = db.prepare(
      `INSERT INTO content_module_challenges (
        module_id, challenge_id, sort_order, title, description, concepts_json,
        component, props_json, completion_criteria_json, hints_json, max_attempts, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    );

    validated.challenges.forEach((challenge, idx) => {
      insertChallenge.run(
        validated.id,
        challenge.id,
        idx,
        challenge.title,
        challenge.description,
        JSON.stringify(challenge.concepts ?? []),
        challenge.component ?? null,
        challenge.props ? JSON.stringify(challenge.props) : null,
        JSON.stringify(challenge.completionCriteria),
        JSON.stringify(challenge.hints ?? []),
        challenge.maxAttempts ?? null,
      );
    });

    db.prepare(
      `INSERT INTO content_versions (module_id, version, status, payload_json, created_by)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(validated.id, nextVersion, status, JSON.stringify(validated), updatedBy ?? null);
  });

  tx();
}

export function publishContentModule(moduleId: string, publishedBy?: number): boolean {
  const existing = getContentModuleData(moduleId);
  if (!existing) return false;
  upsertContentModule(existing, publishedBy, 'published');
  return true;
}
