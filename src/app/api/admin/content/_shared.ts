import { NextRequest } from 'next/server';
import { validateRequestSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/db/users';
import { hasAdminAccess } from '@/lib/auth/adminEnv';

/** Resolves session and requires admin (env-listed email or DB admin when env list is empty). */
export async function requireAdmin(request: NextRequest): Promise<number | null> {
  const userId = await validateRequestSession(request);
  if (!userId) return null;
  const user = getUserById(userId);
  if (!user || !hasAdminAccess(user.email, user.role)) return null;
  return userId;
}
