import crypto from 'crypto';
import { db } from '../db/database';
import { verifyToken } from './jwt';

const TOKEN_EXPIRY_DAYS = 7;

export function createSession(userId: number): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  try {
    const stmt = db.prepare(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
    );
    stmt.run(userId, tokenHash, expiresAt.toISOString());
  } catch {
  }

  return { token, expiresAt };
}

export async function validateSession(token: string): Promise<number | null> {
  const jwtPayload = await verifyToken(token);
  if (jwtPayload) {
    return jwtPayload.userId;
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date().toISOString();
    const stmt = db.prepare(
      'SELECT user_id FROM user_sessions WHERE token_hash = ? AND expires_at > ?'
    );
    const session = stmt.get(tokenHash, now) as { user_id: number } | undefined;
    return session?.user_id ?? null;
  } catch {
    return null;
  }
}

export function deleteSession(_token: string): void {
  try {
    const tokenHash = crypto.createHash('sha256').update(_token).digest('hex');
    const stmt = db.prepare('DELETE FROM user_sessions WHERE token_hash = ?');
    stmt.run(tokenHash);
  } catch {
  }
}

export function deleteUserSessions(userId: number): void {
  try {
    const stmt = db.prepare('DELETE FROM user_sessions WHERE user_id = ?');
    stmt.run(userId);
  } catch {
  }
}

export function cleanupExpiredSessions(): void {
  try {
    const now = new Date().toISOString();
    const stmt = db.prepare('DELETE FROM user_sessions WHERE expires_at <= ?');
    stmt.run(now);
  } catch {
  }
}