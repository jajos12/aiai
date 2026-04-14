import { z } from 'zod';

export type ConceptTreeNodeKind = 'topic' | 'subtopic' | 'concept';

export interface ConceptTreeNode {
  id: string;
  title: string;
  summary: string;
  prerequisites: string[];
  children: ConceptTreeNode[];
  /** Long-form text for the context panel (lesson notes, etc.). */
  detail?: string;
  /** Short “insight” line (e.g. go-deeper, connections). */
  insight?: string;
  /** Role in the hierarchy for layout and copy. */
  kind?: ConceptTreeNodeKind;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  concepts: string[];
}

export interface ModuleAnalysis {
  summary: string;
  keyConcepts: string[];
  misconceptions: string[];
  recommendedOrder: string[];
}

export interface StudyKit {
  analysis: ModuleAnalysis;
  conceptTree: ConceptTreeNode[];
  flashcards: Flashcard[];
  quizzes: QuizItem[];
  generatedAt: string;
  model: string;
  cached: boolean;
}

export interface StudyKitRequest {
  moduleId: string;
  tierId: number;
  learnerProfile?: {
    weakConcepts?: string[];
    strongConcepts?: string[];
    skillByConcept?: Record<string, number>;
  };
  mode?: 'seed' | 'refine';
}

export function isStudyKitRequest(value: unknown): value is StudyKitRequest {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as StudyKitRequest;
  return typeof candidate.moduleId === 'string' && typeof candidate.tierId === 'number';
}

export const LearnerProfileSchema = z
  .object({
    weakConcepts: z.array(z.string()).optional(),
    strongConcepts: z.array(z.string()).optional(),
    skillByConcept: z.record(z.string(), z.number()).optional(),
  })
  .optional();

export const StudyKitRequestSchema = z.object({
  moduleId: z.string().min(1),
  tierId: z.number(),
  learnerProfile: LearnerProfileSchema,
  mode: z.enum(['seed', 'refine']).optional(),
});

export type StudyKitRequestInput = z.infer<typeof StudyKitRequestSchema>;

const ConceptTreeNodeKindSchema = z.enum(['topic', 'subtopic', 'concept']);

export const ConceptTreeNodeSchema: z.ZodType<ConceptTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    prerequisites: z.array(z.string()),
    children: z.array(ConceptTreeNodeSchema),
    detail: z.string().optional(),
    insight: z.string().optional(),
    kind: ConceptTreeNodeKindSchema.optional(),
  }),
);

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  concepts: z.array(z.string()),
});

export const QuizItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2),
  answerIndex: z.number().int().nonnegative(),
  explanation: z.string(),
  concepts: z.array(z.string()),
});

export const ModuleAnalysisSchema = z.object({
  summary: z.string(),
  keyConcepts: z.array(z.string()),
  misconceptions: z.array(z.string()),
  recommendedOrder: z.array(z.string()),
});

export const StudyKitModelResponseSchema = z.object({
  analysis: ModuleAnalysisSchema,
  conceptTree: z.array(ConceptTreeNodeSchema),
  flashcards: z.array(FlashcardSchema),
  quizzes: z.array(QuizItemSchema),
});
