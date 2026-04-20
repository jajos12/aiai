import { db } from './database';
import type { TutorMessage } from '@/types/tutor';

const MAX_HISTORY = 100;

export function getTutorMessages(userId: number, moduleId: string, limit = 50): TutorMessage[] {
  const stmt = db.prepare(`
    SELECT role, content, created_at AS timestamp
    FROM tutor_chat_messages
    WHERE user_id = ? AND module_id = ?
    ORDER BY created_at ASC
    LIMIT ?
  `);
  return stmt.all(userId, moduleId, limit) as TutorMessage[];
}

export function saveTutorMessage(
  userId: number,
  moduleId: string,
  role: 'user' | 'assistant',
  content: string,
): void {
  db.prepare(
    'INSERT INTO tutor_chat_messages (user_id, module_id, role, content) VALUES (?, ?, ?, ?)',
  ).run(userId, moduleId, role, content);

  const countRow = db
    .prepare('SELECT COUNT(*) AS cnt FROM tutor_chat_messages WHERE user_id = ? AND module_id = ?')
    .get(userId, moduleId) as { cnt: number };

  if (countRow.cnt > MAX_HISTORY) {
    db.prepare(`
      DELETE FROM tutor_chat_messages
      WHERE user_id = ? AND module_id = ?
      AND id NOT IN (
        SELECT id FROM tutor_chat_messages
        WHERE user_id = ? AND module_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      )
    `).run(userId, moduleId, userId, moduleId, MAX_HISTORY);
  }
}

export function clearTutorHistory(userId: number, moduleId: string): void {
  db.prepare(
    'DELETE FROM tutor_chat_messages WHERE user_id = ? AND module_id = ?',
  ).run(userId, moduleId);
}
