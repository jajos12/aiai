import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '../db/database';
import { getAuthSecret } from './config';
import { getUserByEmail } from '@/lib/db/users';

function parsePositiveUserId(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) return raw;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Auth.js session validator (JWT strategy). */
export async function validateRequestSession(request: NextRequest): Promise<number | null> {
  try {
    const token = await getToken({
      req: request,
      secret: getAuthSecret(),
    });
    if (!token) return null;

    const fromToken = parsePositiveUserId(token.userId);
    if (fromToken != null) return fromToken;

    const email = typeof token.email === 'string' ? token.email : null;
    if (email) {
      const user = getUserByEmail(email);
      if (user) return Number(user.id);
    }
    return null;
  } catch {
    return null;
  }
}

export function deleteUserSessions(userId: number): void {
  try {
    // Clears legacy DB-backed sessions kept for backward compatibility.
    const stmt = db.prepare('DELETE FROM user_sessions WHERE user_id = ?');
    stmt.run(userId);
  } catch {
  }
}