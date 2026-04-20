import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { StudyKit } from '../schemas';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'study-kits');

function keyPath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

export async function getCachedStudyKit(key: string): Promise<StudyKit | null> {
  try {
    const raw = await readFile(keyPath(key), 'utf-8');
    return JSON.parse(raw) as StudyKit;
  } catch {
    return null;
  }
}

export async function setCachedStudyKit(key: string, value: StudyKit): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(keyPath(key), JSON.stringify(value, null, 2), 'utf-8');
}
