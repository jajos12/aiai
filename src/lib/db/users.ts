import crypto from 'crypto';
import { db, User, UserProgress, UserPreferences } from './database';

export function createUser(email: string, passwordHash: string, name: string, verificationToken?: string): User {
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash, name, verification_token, is_verified) VALUES (?, ?, ?, ?, 0)'
  );
  const result = stmt.run(email, passwordHash, name, verificationToken || null);
  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function markUserVerifiedByEmail(email: string): void {
  const stmt = db.prepare(
    'UPDATE users SET is_verified = 1, verification_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
  );
  stmt.run(email);
}

export function updateUser(id: number, updates: Partial<Pick<User, 'name' | 'role'>>): void {
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.role !== undefined) {
    fields.push('role = ?');
    values.push(updates.role);
  }
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deleteUser(id: number): void {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(id);
}

/** Deletes all unverified users and returns number of removed rows. */
export function deleteAllUnverifiedUsers(): number {
  const stmt = db.prepare('DELETE FROM users WHERE is_verified = 0');
  const result = stmt.run();
  return Number(result.changes ?? 0);
}

/** Deletes stale unverified account for a given email, returns true when removed. */
export function deleteUnverifiedUserByEmail(email: string): boolean {
  const stmt = db.prepare('DELETE FROM users WHERE email = ? AND is_verified = 0');
  const result = stmt.run(email);
  return Number(result.changes ?? 0) > 0;
}

export function getAllUsers(): User[] {
  const stmt = db.prepare('SELECT id, email, name, role, is_verified, created_at, updated_at FROM users ORDER BY created_at DESC');
  return stmt.all() as User[];
}

export function verifyUser(token: string): boolean {
  const stmt = db.prepare('SELECT id FROM users WHERE verification_token = ?');
  const user = stmt.get(token) as { id: number } | undefined;
  if (!user) return false;
  
  const update = db.prepare('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?');
  update.run(user.id);
  return true;
}

/** Admin-only: mark a user verified when email delivery failed or support needs to unblock login. */
export function adminMarkUserVerified(userId: number): boolean {
  const stmt = db.prepare('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?');
  const result = stmt.run(userId);
  return result.changes > 0;
}

export function getUserByVerificationToken(token: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE verification_token = ?');
  return stmt.get(token) as User | undefined;
}

export function updateUserPassword(userId: number, passwordHash: string): void {
  const stmt = db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(passwordHash, userId);
}

export function createPasswordResetToken(userId: number, token: string, expiresAt: Date): void {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const stmt = db.prepare('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)');
  stmt.run(userId, tokenHash, expiresAt.toISOString());
}

export function getUserByPasswordResetToken(token: string): User | undefined {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    SELECT u.* FROM users u
    JOIN password_reset_tokens t ON u.id = t.user_id
    WHERE t.token_hash = ? AND t.expires_at > ?
  `);
  return stmt.get(tokenHash, now) as User | undefined;
}

export function consumePasswordResetToken(token: string): void {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const stmt = db.prepare('DELETE FROM password_reset_tokens WHERE token_hash = ?');
  stmt.run(tokenHash);
}

export function getUserProgress(userId: number): UserProgress[] {
  const stmt = db.prepare('SELECT * FROM user_progress WHERE user_id = ?');
  return stmt.all(userId) as UserProgress[];
}

export function getUserModuleProgress(userId: number, moduleId: string, tierId: string): UserProgress | undefined {
  const stmt = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND module_id = ? AND tier_id = ?'
  );
  return stmt.get(userId, moduleId, tierId) as UserProgress | undefined;
}

export function upsertUserProgress(
  userId: number,
  moduleId: string,
  tierId: string,
  completedSteps: string[],
  quizScores: number[]
): void {
  const stmt = db.prepare(`
    INSERT INTO user_progress (user_id, module_id, tier_id, completed_steps, quiz_scores, last_accessed)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, module_id, tier_id) DO UPDATE SET
      completed_steps = excluded.completed_steps,
      quiz_scores = excluded.quiz_scores,
      last_accessed = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, moduleId, tierId, JSON.stringify(completedSteps), JSON.stringify(quizScores));
}

export function getUserPreferences(userId: number): UserPreferences | undefined {
  const stmt = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
  return stmt.get(userId) as UserPreferences | undefined;
}

export function upsertUserPreferences(
  userId: number,
  preferences: Partial<Omit<UserPreferences, 'id' | 'user_id'>>
): void {
  const fields: string[] = [];
  const fieldValues: unknown[] = [];
  
  if (preferences.theme !== undefined) {
    fields.push('theme = ?');
    fieldValues.push(preferences.theme);
  }
  if (preferences.difficulty !== undefined) {
    fields.push('difficulty = ?');
    fieldValues.push(preferences.difficulty);
  }
  if (preferences.learning_goal !== undefined) {
    fields.push('learning_goal = ?');
    fieldValues.push(preferences.learning_goal);
  }
  
  if (fields.length === 0) return;
  
  const stmt = db.prepare(`
    INSERT INTO user_preferences (user_id, ${fields.join(', ')})
    VALUES (?, ${fields.map(() => '?').join(', ')})
    ON CONFLICT(user_id) DO UPDATE SET ${fields.join(', ')}
  `);
  stmt.run(userId, ...fieldValues, ...fieldValues);
}