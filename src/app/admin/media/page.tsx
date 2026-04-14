'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  uploadedAt: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  const uploadToCloudinary = useCallback(async (file: File) => {
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

      const uploadResponse = await new Promise<MediaItem>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            resolve({
              id: result.public_id,
              url: result.secure_url,
              type: file.type.startsWith('video/') ? 'video' : 'image',
              name: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString(),
            });
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`);
        xhr.send(formData);
      });

      setMedia((prev) => [uploadResponse, ...prev]);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => uploadToCloudinary(file));
  }, [uploadToCloudinary]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    disabled: uploading,
  });

  const filteredMedia = media.filter(m => filter === 'all' || m.type === filter);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Media Library</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Upload and manage images and videos
        </p>
      </div>

      <div
        {...getRootProps()}
        className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors"
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

      <div className="flex gap-2">
        {(['all', 'image', 'video'] as const).map((f) => (
          <button
            key={f}
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

      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-4xl mb-4 block">📭</span>
          <p style={{ color: 'var(--text-muted)' }}>No media files yet. Upload your first file above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  <video src={item.url} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.name}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formatSize(item.size)}
                </p>
                <button
                  onClick={() => copyToClipboard(item.url)}
                  className="mt-2 text-xs px-3 py-1 rounded"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
