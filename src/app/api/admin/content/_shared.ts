import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/db/users';

/** Resolves session (JWT or legacy DB session) and requires admin role from the database. */
export async function requireAdmin(request: NextRequest): Promise<number | null> {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;
  const userId = await validateSession(token);
  if (!userId) return null;
  const user = getUserById(userId);
  if (!user || user.role !== 'admin') return null;
  return userId;
}
