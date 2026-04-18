import crypto from 'crypto';

/**
 * Deletes an asset from Cloudinary (best-effort). Returns true if API reported success.
 */
export async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: 'image' | 'video',
): Promise<boolean> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return false;

  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    public_id: publicId,
    timestamp,
  };
  const canonical = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const signature = crypto.createHash('sha1').update(`${canonical}${apiSecret}`).digest('hex');

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const endpoint =
    resourceType === 'video'
      ? `https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`
      : `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { result?: string };
    return json.result === 'ok';
  } catch {
    return false;
  }
}
