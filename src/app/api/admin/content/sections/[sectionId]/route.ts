import { NextRequest, NextResponse } from 'next/server';
import { deleteSection } from '@/lib/db/content';
import { requireAdmin } from '../../_shared';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { sectionId } = await params;
    const ok = deleteSection(sectionId);
    if (!ok) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    return NextResponse.json({ message: 'Section deleted' });
  } catch (error) {
    console.error('Admin delete section error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
