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
        image: z
          .object({
            url: z.string(),
            provider: z.string().optional(),
            assetId: z.string().optional(),
          })
          .optional(),
        video: z
          .object({
            url: z.string(),
            provider: z.string().optional(),
            assetId: z.string().optional(),
          })
          .optional(),
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
  image_url: string | null;
  image_provider: string | null;
  image_asset_id: string | null;
  video_url: string | null;
  video_provider: string | null;
  video_asset_id: string | null;
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
        image: step.image_url
          ? {
              url: step.image_url,
              provider: step.image_provider ?? undefined,
              assetId: step.image_asset_id ?? undefined,
            }
          : undefined,
        video: step.video_url
          ? {
              url: step.video_url,
              provider: step.video_provider ?? undefined,
              assetId: step.video_asset_id ?? undefined,
            }
          : undefined,
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
        content_text, go_deeper_json, author_note, image_url, image_provider, image_asset_id, video_url, video_provider, video_asset_id, interaction_hint, quiz_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
        step.content.image?.url ?? null,
        step.content.image?.provider ?? null,
        step.content.image?.assetId ?? null,
        step.content.video?.url ?? null,
        step.content.video?.provider ?? null,
        step.content.video?.assetId ?? null,
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

export function deleteContentModule(moduleId: string): boolean {
  const result = db.prepare(`DELETE FROM content_modules WHERE module_id = ?`).run(moduleId);
  return result.changes > 0;
}

type CourseRow = {
  course_id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  sort_order: number;
  updated_at: string;
};

type SectionRow = {
  section_id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
};

type SectionModuleRow = {
  section_id: string;
  module_id: string;
  sort_order: number;
};

export interface CourseHierarchy {
  courseId: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  sortOrder: number;
  updatedAt: string;
  sections: Array<{
    sectionId: string;
    title: string;
    description: string;
    sortOrder: number;
    modules: Array<{
      moduleId: string;
      title: string;
      status: 'draft' | 'published';
      sortOrder: number;
    }>;
  }>;
}

export function listCourseHierarchy(): CourseHierarchy[] {
  const courses = db
    .prepare(`SELECT * FROM content_courses ORDER BY sort_order ASC, title ASC`)
    .all() as CourseRow[];
  const sections = db
    .prepare(`SELECT * FROM content_course_sections ORDER BY sort_order ASC, title ASC`)
    .all() as SectionRow[];
  const sectionModules = db
    .prepare(`SELECT section_id, module_id, sort_order FROM content_section_modules ORDER BY sort_order ASC`)
    .all() as SectionModuleRow[];
  const modules = db
    .prepare(`SELECT module_id, title, status FROM content_modules`)
    .all() as Array<{ module_id: string; title: string; status: 'draft' | 'published' }>;

  const moduleById = new Map(modules.map((m) => [m.module_id, m]));
  const modulesBySection = new Map<string, SectionModuleRow[]>();
  for (const rel of sectionModules) {
    const arr = modulesBySection.get(rel.section_id) ?? [];
    arr.push(rel);
    modulesBySection.set(rel.section_id, arr);
  }

  const sectionsByCourse = new Map<string, SectionRow[]>();
  for (const section of sections) {
    const arr = sectionsByCourse.get(section.course_id) ?? [];
    arr.push(section);
    sectionsByCourse.set(section.course_id, arr);
  }

  return courses.map((course) => ({
    courseId: course.course_id,
    title: course.title,
    description: course.description,
    status: course.status,
    sortOrder: course.sort_order,
    updatedAt: course.updated_at,
    sections: (sectionsByCourse.get(course.course_id) ?? []).map((section) => ({
      sectionId: section.section_id,
      title: section.title,
      description: section.description,
      sortOrder: section.sort_order,
      modules: (modulesBySection.get(section.section_id) ?? [])
        .map((rel) => {
          const moduleMeta = moduleById.get(rel.module_id);
          if (!moduleMeta) return null;
          return {
            moduleId: rel.module_id,
            title: moduleMeta.title,
            status: moduleMeta.status,
            sortOrder: rel.sort_order,
          };
        })
        .filter(Boolean) as Array<{ moduleId: string; title: string; status: 'draft' | 'published'; sortOrder: number }>,
    })),
  }));
}

export function upsertCourse(input: {
  courseId: string;
  title: string;
  description?: string;
  status?: 'draft' | 'published';
  sortOrder?: number;
}): void {
  db.prepare(
    `INSERT INTO content_courses (course_id, title, description, status, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(course_id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       status = excluded.status,
       sort_order = excluded.sort_order,
       updated_at = CURRENT_TIMESTAMP`,
  ).run(
    input.courseId,
    input.title,
    input.description ?? '',
    input.status ?? 'draft',
    input.sortOrder ?? 0,
  );
}

export function deleteCourse(courseId: string): boolean {
  const result = db.prepare(`DELETE FROM content_courses WHERE course_id = ?`).run(courseId);
  return result.changes > 0;
}

export function upsertSection(input: {
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  sortOrder?: number;
}): void {
  db.prepare(
    `INSERT INTO content_course_sections (section_id, course_id, title, description, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(section_id) DO UPDATE SET
       course_id = excluded.course_id,
       title = excluded.title,
       description = excluded.description,
       sort_order = excluded.sort_order,
       updated_at = CURRENT_TIMESTAMP`,
  ).run(
    input.sectionId,
    input.courseId,
    input.title,
    input.description ?? '',
    input.sortOrder ?? 0,
  );
}

export function deleteSection(sectionId: string): boolean {
  const result = db.prepare(`DELETE FROM content_course_sections WHERE section_id = ?`).run(sectionId);
  return result.changes > 0;
}

export function assignModuleToSection(input: {
  sectionId: string;
  moduleId: string;
  sortOrder?: number;
}): void {
  db.prepare(
    `INSERT INTO content_section_modules (section_id, module_id, sort_order)
     VALUES (?, ?, ?)
     ON CONFLICT(section_id, module_id) DO UPDATE SET
       sort_order = excluded.sort_order`,
  ).run(input.sectionId, input.moduleId, input.sortOrder ?? 0);
}

export function unassignModuleFromSection(sectionId: string, moduleId: string): boolean {
  const result = db
    .prepare(`DELETE FROM content_section_modules WHERE section_id = ? AND module_id = ?`)
    .run(sectionId, moduleId);
  return result.changes > 0;
}

export function reorderSectionModules(sectionId: string, moduleIds: string[]): void {
  const tx = db.transaction(() => {
    moduleIds.forEach((moduleId, index) => {
      db.prepare(
        `UPDATE content_section_modules SET sort_order = ? WHERE section_id = ? AND module_id = ?`,
      ).run(index, sectionId, moduleId);
    });
  });
  tx();
}

export function reorderCourseSections(courseId: string, sectionIds: string[]): void {
  const tx = db.transaction(() => {
    sectionIds.forEach((sectionId, index) => {
      db.prepare(
        `UPDATE content_course_sections SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE course_id = ? AND section_id = ?`,
      ).run(index, courseId, sectionId);
    });
  });
  tx();
}

export function replaceCourseStructure(input: {
  courseId: string;
  sections: Array<{
    sectionId: string;
    title: string;
    description?: string;
    sortOrder?: number;
    modules?: Array<{ moduleId: string; sortOrder?: number }>;
  }>;
}): void {
  const tx = db.transaction(() => {
    const existingSections = db
      .prepare(`SELECT section_id FROM content_course_sections WHERE course_id = ?`)
      .all(input.courseId) as Array<{ section_id: string }>;

    for (const section of existingSections) {
      db.prepare(`DELETE FROM content_section_modules WHERE section_id = ?`).run(section.section_id);
    }
    db.prepare(`DELETE FROM content_course_sections WHERE course_id = ?`).run(input.courseId);

    const insertSection = db.prepare(
      `INSERT INTO content_course_sections (section_id, course_id, title, description, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    );
    const insertSectionModule = db.prepare(
      `INSERT INTO content_section_modules (section_id, module_id, sort_order) VALUES (?, ?, ?)`,
    );

    input.sections.forEach((section, sectionIndex) => {
      insertSection.run(
        section.sectionId,
        input.courseId,
        section.title,
        section.description ?? '',
        section.sortOrder ?? sectionIndex,
      );
      (section.modules ?? []).forEach((moduleRef, moduleIndex) => {
        insertSectionModule.run(
          section.sectionId,
          moduleRef.moduleId,
          moduleRef.sortOrder ?? moduleIndex,
        );
      });
    });
  });

  tx();
}

export function reorderModuleSteps(moduleId: string, stepIds: string[]): void {
  const tx = db.transaction(() => {
    stepIds.forEach((stepId, index) => {
      db.prepare(
        `UPDATE content_module_steps SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE module_id = ? AND step_id = ?`,
      ).run(index, moduleId, stepId);
    });
  });
  tx();
}

export function validateModuleAuthoring(moduleData: ModuleData): string | null {
  if (!moduleData.steps.length) {
    return 'A module must include at least one lesson step.';
  }

  for (const step of moduleData.steps) {
    const hasLessonBody = Boolean(step.content.text?.trim());
    const noteLength = step.content.authorNote?.trim().length ?? 0;
    const hasDetailedNote = noteLength >= 80;
    const hasVideo = Boolean(step.content.video?.url?.trim());
    const hasImage = Boolean(step.content.image?.url?.trim());
    if (!hasLessonBody || !hasDetailedNote || (!hasVideo && !hasImage)) {
      return 'Each lesson step must include content text, a detailed note (at least 80 characters), and at least one media item (video or image).';
    }
  }

  return null;
}
