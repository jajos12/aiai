import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/content/_shared';
import { adminMarkUserVerified, getAllUsers, deleteUser, updateUser, getUserById } from '@/lib/db/users';
import { countUsersWithAdminAccess, userHasAdminAccess } from '@/lib/auth/adminUsers';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const all = getAllUsers();
    const total = all.length;

    if (!searchParams.has('page')) {
      return NextResponse.json({ users: all, total });
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
    );
    const start = (page - 1) * pageSize;
    const users = all.slice(start, start + pageSize);
    return NextResponse.json({ users, total, page, pageSize });
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

    if (userHasAdminAccess(deleteUserId) && countUsersWithAdminAccess() <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the only user with admin access. Promote another admin first.' },
        { status: 400 },
      );
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

    const target = getUserById(targetUserId);
    if (
      role === 'user' &&
      target &&
      userHasAdminAccess(targetUserId) &&
      countUsersWithAdminAccess() <= 1
    ) {
      return NextResponse.json(
        { error: 'Cannot demote the only user with admin access. Promote another admin first.' },
        { status: 400 },
      );
    }

    updateUser(targetUserId, { role });
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}