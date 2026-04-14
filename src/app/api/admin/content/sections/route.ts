import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { upsertSection } from '@/lib/db/content';
import { requireAdmin } from '../_shared';

const sectionSchema = z.object({
  sectionId: z.string().min(1),
  courseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const payload = sectionSchema.parse(await request.json());
    upsertSection(payload);
    return NextResponse.json({ message: 'Section saved' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('Admin upsert section error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
