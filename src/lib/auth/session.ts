import crypto from 'crypto';
import { db } from '../db/database';

const TOKEN_EXPIRY_DAYS = 7;

export function createSession(userId: number): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  const stmt = db.prepare(
    'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
  );
  stmt.run(userId, tokenHash, expiresAt.toISOString());

  return { token, expiresAt };
}

export async function validateSession(token: string): Promise<number | null> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date().toISOString();

  const stmt = db.prepare(
    'SELECT user_id FROM user_sessions WHERE token_hash = ? AND expires_at > ?'
  );
  const session = stmt.get(tokenHash, now) as { user_id: number } | undefined;

  return session?.user_id ?? null;
}

export function deleteSession(token: string): void {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const stmt = db.prepare('DELETE FROM user_sessions WHERE token_hash = ?');
  stmt.run(tokenHash);
}

export function deleteUserSessions(userId: number): void {
  const stmt = db.prepare('DELETE FROM user_sessions WHERE user_id = ?');
  stmt.run(userId);
}

export function cleanupExpiredSessions(): void {
  const now = new Date().toISOString();
  const stmt = db.prepare('DELETE FROM user_sessions WHERE expires_at <= ?');
  stmt.run(now);
}