import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '../db/database';
import { getAuthSecret } from './config';
/** Auth.js session validator (JWT strategy). */
export async function validateRequestSession(request: NextRequest): Promise<number | null> {
  try {
    const token = await getToken({
      req: request,
      secret: getAuthSecret(),
    });
    if (!token) return null;

    const userIdRaw = token.userId ?? token.sub;
    const userId = typeof userIdRaw === 'number' ? userIdRaw : Number(userIdRaw);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
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