import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/app/api/admin/content/_shared';
import { getModuleVersionPayload, listModuleVersions, restoreModuleVersion } from '@/lib/db/content';

export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId') ?? '';
    if (!moduleId) return NextResponse.json({ error: 'moduleId required' }, { status: 400 });
    return NextResponse.json({ versions: listModuleVersions(moduleId) });
  } catch (error) {
    console.error('list module versions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const restoreSchema = z.object({
  moduleId: z.string().min(1),
  version: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = restoreSchema.parse(await request.json());
    const result = restoreModuleVersion(body.moduleId, body.version, adminId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ message: 'Restored as draft', module: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid body' }, { status: 400 });
    }
    console.error('restore module version:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
