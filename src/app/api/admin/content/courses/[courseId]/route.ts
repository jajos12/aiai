import { NextRequest, NextResponse } from 'next/server';
import { deleteCourse, reorderCourseSections } from '@/lib/db/content';
import { requireAdmin } from '../../_shared';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { courseId } = await params;
    const ok = deleteCourse(courseId);
    if (!ok) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Admin delete course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { courseId } = await params;
    const body = (await request.json()) as { sectionIds?: string[] };
    const sectionIds = Array.isArray(body.sectionIds) ? body.sectionIds : [];
    reorderCourseSections(courseId, sectionIds);
    return NextResponse.json({ message: 'Course sections reordered' });
  } catch (error) {
    console.error('Admin reorder sections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
