/**
 * Optional strict admin gate: set ADMIN_EMAIL or ADMIN_EMAILS in the environment.
 * When at least one address is configured, only those accounts receive admin access
 * (session + API), regardless of the role column in the database.
 * When unset/empty, the database `role` field is used (backward compatible).
 */
export function parseAdminEmailList(): string[] {
  const combined = [process.env.ADMIN_EMAILS, process.env.ADMIN_EMAIL]
    .filter(Boolean)
    .join(',');
  if (!combined.trim()) return [];
  return combined
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEnvListedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = parseAdminEmailList();
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}

/** True when this email should be treated as admin (env list or DB when env is off). */
export function hasAdminAccess(email: string | null | undefined, dbRole: string | null | undefined): boolean {
  const list = parseAdminEmailList();
  if (list.length > 0) return isEnvListedAdmin(email);
  return (dbRole ?? 'user').trim().toLowerCase() === 'admin';
}

/** Role string stored on the JWT / session (`admin` | `user`). */
export function effectiveSessionRole(email: string | null | undefined, dbRole: string): string {
  return hasAdminAccess(email, dbRole) ? 'admin' : 'user';
}
