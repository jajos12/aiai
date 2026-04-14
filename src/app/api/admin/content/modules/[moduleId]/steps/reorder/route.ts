import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reorderModuleSteps } from '@/lib/db/content';
import { requireAdmin } from '@/app/api/admin/content/_shared';

const bodySchema = z.object({
  stepIds: z.array(z.string()),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { moduleId } = await params;
    const payload = bodySchema.parse(await request.json());
    reorderModuleSteps(moduleId, payload.stepIds);
    return NextResponse.json({ message: 'Module steps reordered' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('Admin reorder module steps error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
