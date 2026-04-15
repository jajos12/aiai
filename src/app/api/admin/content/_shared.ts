import { NextRequest } from 'next/server';
import { validateRequestSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/db/users';

/** Resolves session (JWT or legacy DB session) and requires admin role from the database. */
export async function requireAdmin(request: NextRequest): Promise<number | null> {
  const userId = await validateRequestSession(request);
  if (!userId) return null;
  const user = getUserById(userId);
  if (!user || user.role !== 'admin') return null;
  return userId;
}
