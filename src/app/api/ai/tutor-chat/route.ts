import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestSession } from '@/lib/auth/session';
import { getModuleData } from '@/core/registry';
import { streamTutorResponse } from '@/lib/ai/tutorService';
import { getTutorMessages, saveTutorMessage } from '@/lib/db/tutor';

export async function GET(request: NextRequest) {
  try {
    const userId = await validateRequestSession(request);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const moduleId = request.nextUrl.searchParams.get('moduleId');
    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }

    const messages = getTutorMessages(userId, moduleId, 50);
    return NextResponse.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const PostSchema = z.object({
  moduleId: z.string().min(1),
  moduleTitle: z.string().min(1),
  stepId: z.string().min(1),
  level: z.enum(['eli5', 'standard', 'expert']),
  message: z.string().min(1).max(2000),
  learnerProfile: z
    .object({
      weakConcepts: z.array(z.string()).optional(),
      strongConcepts: z.array(z.string()).optional(),
      skillByConcept: z.record(z.string(), z.number()).optional(),
      preferredPace: z.enum(['slow', 'normal', 'fast']).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await validateRequestSession(request);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { moduleId, moduleTitle, stepId, level, message, learnerProfile } = parsed.data;

    const moduleData = await getModuleData(moduleId);
    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const step = moduleData.steps.find((s) => s.id === stepId);
    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    const profile = {
      skillByConcept: learnerProfile?.skillByConcept ?? {},
      weakConcepts: learnerProfile?.weakConcepts ?? [],
      strongConcepts: learnerProfile?.strongConcepts ?? [],
      preferredPace: learnerProfile?.preferredPace ?? ('normal' as const),
    };

    const history = getTutorMessages(userId, moduleId, 12);

    saveTutorMessage(userId, moduleId, 'user', message);

    let fullText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamTutorResponse(
            moduleTitle,
            step,
            level,
            profile,
            history,
            message,
          )) {
            fullText += chunk;
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          saveTutorMessage(userId, moduleId, 'assistant', fullText || '(no response)');
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          controller.enqueue(new TextEncoder().encode(`\n[Error: ${msg}]`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
