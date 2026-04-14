import { NextRequest, NextResponse } from 'next/server';
import { getModuleData } from '@/core/registry';
import { generateStudyKit } from '@/lib/ai/studyKitService';
import { StudyKitRequestSchema } from '@/lib/ai/schemas';
import { validateSession } from '@/lib/auth/session';

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
    const parsed = StudyKitRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const payload = parsed.data;

    const moduleData = await getModuleData(payload.moduleId);
    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const studyKit = await generateStudyKit(moduleData, { ...payload, mode: 'seed' });
    return NextResponse.json({
      analysis: studyKit.analysis,
      conceptTree: studyKit.conceptTree,
      generatedAt: studyKit.generatedAt,
      model: studyKit.model,
      cached: studyKit.cached,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
