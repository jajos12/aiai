import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { assignModuleToSection, reorderSectionModules, unassignModuleFromSection } from '@/lib/db/content';
import { requireAdmin } from '../_shared';

const assignSchema = z.object({
  sectionId: z.string().min(1),
  moduleId: z.string().min(1),
  sortOrder: z.number().optional(),
});

const reorderSchema = z.object({
  sectionId: z.string().min(1),
  moduleIds: z.array(z.string()),
});

export async function PUT(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const payload = assignSchema.parse(await request.json());
    assignModuleToSection(payload);
    return NextResponse.json({ message: 'Module assigned to section' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('Admin assign module error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId') ?? '';
    const moduleId = searchParams.get('moduleId') ?? '';
    if (!sectionId || !moduleId) {
      return NextResponse.json({ error: 'sectionId and moduleId are required' }, { status: 400 });
    }
    const ok = unassignModuleFromSection(sectionId, moduleId);
    if (!ok) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    return NextResponse.json({ message: 'Module unassigned from section' });
  } catch (error) {
    console.error('Admin unassign module error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const payload = reorderSchema.parse(await request.json());
    reorderSectionModules(payload.sectionId, payload.moduleIds);
    return NextResponse.json({ message: 'Section modules reordered' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('Admin reorder section modules error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
