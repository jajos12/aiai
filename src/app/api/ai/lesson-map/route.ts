import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { getModuleData } from '@/core/registry';
import { generateLessonMapInsights } from '@/lib/ai/tutorService';
import { getLessonMapInsights, saveLessonMapInsights } from '@/lib/db/lessonMap';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = await validateSession(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const moduleId = request.nextUrl.searchParams.get('moduleId');
    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }

    const cached = getLessonMapInsights(moduleId);
    if (cached) {
      return NextResponse.json({ insights: cached, cached: true });
    }

    const moduleData = await getModuleData(moduleId);
    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const insights = await generateLessonMapInsights(moduleData);
    saveLessonMapInsights(moduleId, insights);

    return NextResponse.json({ insights, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const userId = await validateSession(token);
    if (!userId) return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });

    const moduleId = request.nextUrl.searchParams.get('moduleId');
    if (!moduleId) return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });

    const { deleteLessonMapInsights } = await import('@/lib/db/lessonMap');
    deleteLessonMapInsights(moduleId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
