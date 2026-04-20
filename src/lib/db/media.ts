import { db } from './database';

export interface ContentMediaRow {
  id: number;
  cloudinary_public_id: string;
  url: string;
  media_type: 'image' | 'video';
  name: string;
  size_bytes: number;
  uploaded_by: number | null;
  created_at: string;
}

export function insertContentMedia(input: {
  cloudinaryPublicId: string;
  url: string;
  mediaType: 'image' | 'video';
  name: string;
  sizeBytes: number;
  uploadedBy: number | null;
}): ContentMediaRow {
  const stmt = db.prepare(
    `INSERT INTO content_media (cloudinary_public_id, url, media_type, name, size_bytes, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const result = stmt.run(
    input.cloudinaryPublicId,
    input.url,
    input.mediaType,
    input.name,
    input.sizeBytes,
    input.uploadedBy,
  );
  const row = db
    .prepare(`SELECT * FROM content_media WHERE id = ?`)
    .get(result.lastInsertRowid) as ContentMediaRow;
  return row;
}

export function listContentMedia(): ContentMediaRow[] {
  return db
    .prepare(`SELECT * FROM content_media ORDER BY created_at DESC`)
    .all() as ContentMediaRow[];
}

export function getContentMediaById(id: number): ContentMediaRow | undefined {
  return db.prepare(`SELECT * FROM content_media WHERE id = ?`).get(id) as ContentMediaRow | undefined;
}

export function deleteContentMediaById(id: number): boolean {
  const result = db.prepare(`DELETE FROM content_media WHERE id = ?`).run(id);
  return result.changes > 0;
}
