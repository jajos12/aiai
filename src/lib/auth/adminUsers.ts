import { getAllUsers, getUserById } from '@/lib/db/users';
import { hasAdminAccess } from '@/lib/auth/adminEnv';

/** Users who receive admin capabilities (env list or DB role). */
export function countUsersWithAdminAccess(): number {
  return getAllUsers().filter((u) => hasAdminAccess(u.email, u.role)).length;
}

export function userHasAdminAccess(userId: number): boolean {
  const u = getUserById(userId);
  return u ? hasAdminAccess(u.email, u.role) : false;
}
