import { NextResponse } from 'next/server';
import { getModuleData } from '@/core/registry';
import { generateStudyKit } from '@/lib/ai/studyKitService';
import { StudyKitRequestSchema } from '@/lib/ai/schemas';

export async function POST(request: Request) {
  try {
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
