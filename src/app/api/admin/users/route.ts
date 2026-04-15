import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/content/_shared';
import { adminMarkUserVerified, getAllUsers, deleteUser, updateUser } from '@/lib/db/users';

export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    const users = getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const deleteUserId = parseInt(searchParams.get('id') || '0', 10);

    if (!deleteUserId || deleteUserId === adminId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    deleteUser(deleteUserId);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = (await request.json()) as { userId?: unknown; role?: string; markVerified?: boolean };

    if (body.markVerified === true) {
      const targetUserId = Number(body.userId);
      if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }
      const ok = adminMarkUserVerified(targetUserId);
      if (!ok) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'User marked as email-verified' });
    }

    const targetUserId = Number(body?.userId);
    const role = body?.role;

    if (!Number.isInteger(targetUserId) || targetUserId <= 0 || targetUserId === adminId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    updateUser(targetUserId, { role });
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}