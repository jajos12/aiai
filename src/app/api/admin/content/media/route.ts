import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/app/api/admin/content/_shared';
import {
  deleteContentMediaById,
  getContentMediaById,
  insertContentMedia,
  listContentMedia,
} from '@/lib/db/media';
import { destroyCloudinaryAsset } from '@/lib/cloudinaryDestroy';

const registerSchema = z.object({
  cloudinaryPublicId: z.string().min(1),
  url: z.string().url(),
  mediaType: z.enum(['image', 'video']),
  name: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
});

export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const rows = listContentMedia();
    const media = rows.map((r) => ({
      id: r.id,
      publicId: r.cloudinary_public_id,
      url: r.url,
      type: r.media_type,
      name: r.name,
      size: r.size_bytes,
      uploadedAt: r.created_at,
    }));
    return NextResponse.json({ media });
  } catch (error) {
    console.error('Admin list media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = registerSchema.parse(await request.json());
    let row;
    try {
      row = insertContentMedia({
        cloudinaryPublicId: body.cloudinaryPublicId,
        url: body.url,
        mediaType: body.mediaType,
        name: body.name,
        sizeBytes: body.sizeBytes,
        uploadedBy: adminId,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('UNIQUE') || msg.includes('unique')) {
        return NextResponse.json({ error: 'This file is already in the library.' }, { status: 409 });
      }
      throw e;
    }
    return NextResponse.json({
      item: {
        id: row.id,
        publicId: row.cloudinary_public_id,
        url: row.url,
        type: row.media_type,
        name: row.name,
        size: row.size_bytes,
        uploadedAt: row.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('Admin register media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const id = parseInt(new URL(request.url).searchParams.get('id') || '0', 10);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const row = getContentMediaById(id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await destroyCloudinaryAsset(row.cloudinary_public_id, row.media_type === 'video' ? 'video' : 'image');
    deleteContentMediaById(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin delete media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
