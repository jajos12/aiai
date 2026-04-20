import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestSession } from '@/lib/auth/session';
import { getModuleData } from '@/core/registry';
import { generateStepExplanation } from '@/lib/ai/tutorService';

const RequestSchema = z.object({
  moduleId: z.string().min(1),
  stepId: z.string().min(1),
  level: z.enum(['eli5', 'expert']),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await validateRequestSession(request);
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

    const result = await generateStepExplanation(step, level);
    if (!result.ok) {
      const msg = result.error;
      const noProvider =
        /no ai provider|not set|GROQ_API_KEY|HF_TOKEN/i.test(msg) ||
        msg.includes('No AI provider configured');
      return NextResponse.json({ error: msg }, { status: noProvider ? 503 : 502 });
    }

    return NextResponse.json(result.explanation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
