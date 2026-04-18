'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useAdminToast } from '@/components/admin/AdminToastProvider';

interface MediaItem {
  id: number;
  publicId: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  uploadedAt: string;
}

export default function MediaPage() {
  const { showToast } = useAdminToast();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/media', { credentials: 'include' });
      const data = (await res.json()) as { media?: MediaItem[]; error?: string };
      if (!res.ok) {
        showToast(data.error || 'Could not load media', 'err');
        return;
      }
      setMedia(data.media ?? []);
    } catch {
      showToast('Network error loading media', 'err');
    } finally {
      setListLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  const uploadToCloudinary = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadProgress(0);

      try {
        const response = await fetch('/api/admin/content/media/cloudinary-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            folder: 'ai-tutor/media',
            resourceType: file.type.startsWith('video/') ? 'video' : 'image',
          }),
        });
        const data = (await response.json()) as {
          signature?: string;
          apiKey?: string;
          cloudName?: string;
          timestamp?: number;
          folder?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || `Signature request failed (${response.status})`);
        }

        if (!data.signature || !data.apiKey || !data.cloudName || !data.timestamp) {
          throw new Error(data.error || 'Signature response missing required fields');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', data.apiKey);
        formData.append('timestamp', String(data.timestamp));
        formData.append('signature', data.signature);
        if (data.folder) formData.append('folder', data.folder);

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        const cloudResult = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText) as { public_id: string; secure_url: string });
            } else {
              reject(new Error('Upload failed'));
            }
          };
          xhr.onerror = () => reject(new Error('Upload failed'));
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`);
          xhr.send(formData);
        });

        const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
        const reg = await fetch('/api/admin/content/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            cloudinaryPublicId: cloudResult.public_id,
            url: cloudResult.secure_url,
            mediaType,
            name: file.name,
            sizeBytes: file.size,
          }),
        });
        const regJson = (await reg.json()) as { item?: MediaItem; error?: string };
        if (!reg.ok) {
          throw new Error(regJson.error || 'Could not save media record');
        }
        if (regJson.item) {
          setMedia((prev) => [regJson.item!, ...prev]);
        }
        showToast('Upload saved to library', 'ok');
      } catch (err) {
        console.error('Upload failed:', err);
        showToast(err instanceof Error ? err.message : 'Upload failed', 'err');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [showToast],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => void uploadToCloudinary(file));
    },
    [uploadToCloudinary],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    disabled: uploading,
  });

  const deleteMedia = async (item: MediaItem) => {
    if (!confirm(`Remove "${item.name}" from the library?`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/admin/content/media?id=${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showToast(data.error || 'Delete failed', 'err');
        return;
      }
      setMedia((prev) => prev.filter((m) => m.id !== item.id));
      showToast('Removed from library', 'ok');
    } catch {
      showToast('Network error', 'err');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMedia = media.filter((m) => filter === 'all' || m.type === filter);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    showToast('URL copied', 'ok');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Media Library</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Uploads are stored in Cloudinary and listed here for reuse across modules
        </p>
      </div>

      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors sm:p-8"
        style={{
          borderColor: isDragActive ? 'var(--accent)' : 'var(--border-subtle)',
          background: isDragActive ? 'var(--bg-hover)' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
              <span className="text-2xl">⏳</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Uploading... {uploadProgress}%</p>
            <div className="w-48 mx-auto h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${uploadProgress}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
              <span className="text-2xl">📁</span>
            </div>
            <p style={{ color: 'var(--text-primary)' }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Images (PNG, JPG, GIF, WebP) and Videos (MP4, WebM, MOV)
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'image', 'video'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              background: filter === f ? 'var(--accent)' : 'var(--bg-surface)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {listLoading ? (
        <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>Loading library…</div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-4xl mb-4 block">📭</span>
          <p style={{ color: 'var(--text-muted)' }}>No media files yet. Upload your first file above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="rounded-lg overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="aspect-square relative">
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" controls muted playsInline />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.name}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formatSize(item.size)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.url)}
                    className="text-xs px-3 py-1 rounded"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteMedia(item)}
                    disabled={deletingId === item.id}
                    className="text-xs px-3 py-1 rounded text-red-500 disabled:opacity-50"
                    style={{ background: 'var(--bg-hover)' }}
                  >
                    {deletingId === item.id ? '…' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
