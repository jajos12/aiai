import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/app/api/admin/content/_shared';

const bodySchema = z.object({
  folder: z.string().optional(),
  publicId: z.string().optional(),
  resourceType: z.enum(['video', 'image', 'raw']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary environment variables are not configured' }, { status: 400 });
    }

    const payload = bodySchema.parse(await request.json());
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string | number> = { timestamp };
    if (payload.folder) params.folder = payload.folder;
    if (payload.publicId) params.public_id = payload.publicId;

    const canonical = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const signature = crypto.createHash('sha1').update(`${canonical}${apiSecret}`).digest('hex');

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder: payload.folder,
      publicId: payload.publicId,
      resourceType: payload.resourceType ?? 'video',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('Cloudinary signature error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
