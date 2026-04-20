import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/app/api/admin/content/_shared';
import {
  parseBlocksOutlineFromAi,
  parseIntelligenceFromAi,
  parseQuizFromAi,
  runLessonAssist,
  summarizeStepForAi,
  type LessonAssistAction,
} from '@/lib/ai/lessonAssistService';
import type { Step } from '@/core/types';
import { v4 as uuidv4 } from 'uuid';

const bodySchema = z.object({
  action: z.enum([
    'generate_explanation',
    'simplify',
    'intuitive',
    'analogy',
    'generate_blocks_outline',
    'rewrite_audience',
    'intelligence_scan',
    'generate_quiz',
    'course_outline',
  ]),
  text: z.string().optional(),
  step: z.record(z.string(), z.unknown()).optional(),
  moduleTitle: z.string().optional(),
  stepTitle: z.string().optional(),
  audience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const json = bodySchema.parse(await request.json());
    const action = json.action as LessonAssistAction;

    let text = json.text?.trim() ?? '';
    if (!text && json.step) {
      text = summarizeStepForAi(json.step as unknown as Step);
    }

    if (action === 'course_outline') {
      if (!json.text?.trim()) {
        return NextResponse.json({ error: 'text (course topic) is required' }, { status: 400 });
      }
      text = json.text.trim();
    } else if (!text) {
      return NextResponse.json({ error: 'text or step is required' }, { status: 400 });
    }

    const stepTitle =
      json.stepTitle ??
      (json.step && typeof json.step === 'object' && 'title' in json.step && typeof (json.step as { title: unknown }).title === 'string'
        ? (json.step as { title: string }).title
        : undefined);

    const res = await runLessonAssist({
      action,
      text,
      audience: json.audience,
      moduleTitle: json.moduleTitle,
      stepTitle,
    });

    if ('error' in res) {
      return NextResponse.json({ error: res.error }, { status: 502 });
    }

    if (action === 'generate_quiz') {
      const quiz = parseQuizFromAi(res.text);
      if (!quiz) return NextResponse.json({ error: 'Could not parse quiz JSON from model' }, { status: 502 });
      return NextResponse.json({ quiz });
    }

    if (action === 'intelligence_scan') {
      const intelligence = parseIntelligenceFromAi(res.text);
      if (!intelligence) return NextResponse.json({ error: 'Could not parse intelligence JSON' }, { status: 502 });
      return NextResponse.json({ intelligence });
    }

    if (action === 'generate_blocks_outline') {
      const blocks = parseBlocksOutlineFromAi(res.text, () => uuidv4());
      if (!blocks) return NextResponse.json({ error: 'Could not parse blocks JSON' }, { status: 502 });
      return NextResponse.json({ blocks });
    }

    return NextResponse.json({ text: res.text });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
    }
    console.error('lesson-studio AI error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
