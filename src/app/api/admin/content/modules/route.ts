import { NextRequest, NextResponse } from 'next/server';
import { listContentModules, upsertContentModule, validateModuleAuthoring } from '@/lib/db/content';
import type { ModuleData } from '@/core/types';
import { requireAdmin } from '../_shared';

export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const modules = listContentModules();
    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Admin list content modules error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = (await request.json()) as { module: ModuleData; status?: 'draft' | 'published' };
    if (!body?.module?.id) {
      return NextResponse.json({ error: 'Invalid module payload' }, { status: 400 });
    }
    const validationError = validateModuleAuthoring(body.module);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const status = body.status === 'published' ? 'published' : 'draft';
    upsertContentModule(body.module, adminId, status);
    return NextResponse.json({ message: 'Module content saved', status });
  } catch (error) {
    console.error('Admin upsert content module error:', error);
    return NextResponse.json({ error: 'Invalid module schema or request payload' }, { status: 400 });
  }
}
