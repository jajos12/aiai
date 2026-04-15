import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteContentModule, getContentModuleData, publishContentModule, upsertContentModule, validateModuleAuthoring } from '@/lib/db/content';
import type { ModuleData } from '@/core/types';
import { requireAdmin } from '../../_shared';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { moduleId } = await params;
    const moduleData = getContentModuleData(moduleId);
    if (!moduleData) {
      return NextResponse.json({ error: 'Module content not found' }, { status: 404 });
    }
    return NextResponse.json({ module: moduleData });
  } catch (error) {
    console.error('Admin get content module error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { moduleId } = await params;
    const body = (await request.json()) as { action?: string };
    if (body.action !== 'publish') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    const ok = publishContentModule(moduleId, adminId);
    if (!ok) {
      return NextResponse.json({ error: 'Module content not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Module content published' });
  } catch (error) {
    console.error('Admin publish content module error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { moduleId } = await params;
    const body = (await request.json()) as ModuleData & { status?: 'draft' | 'published' };
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const payload: ModuleData = { ...body, id: moduleId };
    const validationError = validateModuleAuthoring(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    const status = body.status === 'published' ? 'published' : 'draft';
    upsertContentModule(payload, adminId, status);
    return NextResponse.json({ message: 'Module content saved', status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('Admin update content module error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { moduleId } = await params;
    const ok = deleteContentModule(moduleId);
    if (!ok) {
      return NextResponse.json({ error: 'Module content not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Module content deleted' });
  } catch (error) {
    console.error('Admin delete content module error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
