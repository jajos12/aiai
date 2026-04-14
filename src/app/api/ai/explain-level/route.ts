import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSession } from '@/lib/auth/session';
import { getModuleData } from '@/core/registry';
import { generateStepExplanation } from '@/lib/ai/tutorService';

const RequestSchema = z.object({
  moduleId: z.string().min(1),
  stepId: z.string().min(1),
  level: z.enum(['eli5', 'expert']),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = await validateSession(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { moduleId, stepId, level } = parsed.data;

    const moduleData = await getModuleData(moduleId);
    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const step = moduleData.steps.find((s) => s.id === stepId);
    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    const explanation = await generateStepExplanation(step, level);
    if (!explanation) {
      return NextResponse.json({ error: 'AI generation failed — try again' }, { status: 502 });
    }

    return NextResponse.json(explanation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
