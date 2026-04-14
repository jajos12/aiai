import { NextRequest, NextResponse } from 'next/server';
import { getModuleData } from '@/core/registry';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const { moduleId } = await params;
    const module = await getModuleData(moduleId);
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    return NextResponse.json({ module });
  } catch (error) {
    console.error('Module data API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
