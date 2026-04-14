import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

function resolveDbPath(): string {
  const onVercel = Boolean(process.env.VERCEL);
  const customPath = process.env.AIAI_DB_PATH?.trim();

  if (onVercel && !customPath) {
    console.warn(
      '[aiai/db] WARNING: Running on Vercel without AIAI_DB_PATH set.\n' +
      '  The database will use /tmp which is EPHEMERAL — all data (sessions, progress,\n' +
      '  chat history) is lost on every cold start and deployment.\n' +
      '  For persistence, set AIAI_DB_PATH to a mounted volume path, or migrate to\n' +
      '  a cloud database (Turso, Neon, PlanetScale) before going to production.',
    );
  }

  const candidates = [
    customPath,
    // /tmp is writable on Vercel/serverless but NOT persistent across cold starts or deploys.
    // Only used as a last resort when no custom path is provided.
    onVercel ? '/tmp/aiai-data/aiai.db' : undefined,
    process.env.NODE_ENV === 'production' ? '/tmp/aiai-data/aiai.db' : undefined,
    path.join(process.cwd(), 'data', 'aiai.db'),
  ].filter(Boolean) as string[];

  let lastError: unknown = null;
  for (const candidate of candidates) {
    try {
      const dir = path.dirname(candidate);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return candidate;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Could not initialize database directory: ${String(lastError)}`);
}

const dbPath = resolveDbPath();
let db: Database.Database;
try {
  db = new Database(dbPath);
} catch (error) {
  // Last-resort fallback avoids hard crashing API route module eval.
  console.error(`Failed to open SQLite at ${dbPath}, falling back to in-memory DB:`, error);
  db = new Database(':memory:');
}
export { db };

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    module_id TEXT NOT NULL,
    tier_id TEXT NOT NULL,
    completed_steps TEXT DEFAULT '[]',
    quiz_scores TEXT DEFAULT '[]',
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, module_id, tier_id)
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    theme TEXT DEFAULT 'system',
    difficulty TEXT DEFAULT 'intermediate',
    learning_goal TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS content_modules (
    module_id TEXT PRIMARY KEY,
    runtime_module_id TEXT NOT NULL,
    tier_id REAL NOT NULL,
    cluster_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags_json TEXT NOT NULL DEFAULT '[]',
    prerequisites_json TEXT NOT NULL DEFAULT '[]',
    difficulty TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    updated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS content_module_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    concepts_json TEXT NOT NULL DEFAULT '[]',
    visualization_props_json TEXT NOT NULL DEFAULT '{}',
    content_text TEXT NOT NULL DEFAULT '',
    go_deeper_json TEXT,
    author_note TEXT,
    interaction_hint TEXT,
    quiz_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES content_modules(module_id) ON DELETE CASCADE,
    UNIQUE(module_id, step_id)
  );

  CREATE TABLE IF NOT EXISTS content_module_playgrounds (
    module_id TEXT PRIMARY KEY,
    description TEXT NOT NULL DEFAULT '',
    parameters_json TEXT NOT NULL DEFAULT '[]',
    try_this_json TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES content_modules(module_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS content_module_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    challenge_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    concepts_json TEXT NOT NULL DEFAULT '[]',
    component TEXT,
    props_json TEXT,
    completion_criteria_json TEXT NOT NULL,
    hints_json TEXT NOT NULL DEFAULT '[]',
    max_attempts INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES content_modules(module_id) ON DELETE CASCADE,
    UNIQUE(module_id, challenge_id)
  );

  CREATE TABLE IF NOT EXISTS content_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    status TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES content_modules(module_id) ON DELETE CASCADE,
    UNIQUE(module_id, version)
  );

  CREATE INDEX IF NOT EXISTS idx_content_modules_status ON content_modules(status);
  CREATE INDEX IF NOT EXISTS idx_content_steps_module ON content_module_steps(module_id, sort_order);
  CREATE INDEX IF NOT EXISTS idx_content_challenges_module ON content_module_challenges(module_id, sort_order);
`);

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  is_verified: number;
  verification_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  module_id: string;
  tier_id: string;
  completed_steps: string;
  quiz_scores: string;
  last_accessed: string;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  theme: string;
  difficulty: string;
  learning_goal: string;
}