import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/db/users';
import { getContentModuleData, publishContentModule } from '@/lib/db/content';

async function requireAdmin(request: NextRequest): Promise<number | null> {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;
  const userId = await validateSession(token);
  if (!userId) return null;
  const user = getUserById(userId);
  if (!user || user.role !== 'admin') return null;
  return userId;
}

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
    const module = getContentModuleData(moduleId);
    if (!module) {
      return NextResponse.json({ error: 'Module content not found' }, { status: 404 });
    }
    return NextResponse.json({ module });
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
