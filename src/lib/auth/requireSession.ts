import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authjs';
import { getUserByEmail } from '@/lib/db/users';

/**
 * Resolves the signed-in user id for server layouts (tier, dashboard, etc.).
 * Redirects to login with callback when unauthenticated — works even if edge proxy
 * does not run for a given request.
 */
export async function requireAuthenticatedUserId(): Promise<number> {
  const session = await getServerSession(authOptions);
  let userId = Number(session?.user?.id ?? 0);
  const email = session?.user?.email?.trim();
  if ((!Number.isInteger(userId) || userId <= 0) && email) {
    const u = getUserByEmail(email);
    if (u) userId = Number(u.id);
  }
  if (!Number.isInteger(userId) || userId <= 0) {
    const h = await headers();
    const path = h.get('x-pathname')?.trim() || '/';
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }
  return userId;
}
