'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import MediaLibraryPicker from '../shared/MediaLibraryPicker';

interface ImageAsset {
  url: string;
  provider?: string;
  assetId?: string;
}

interface ImageUploaderProps {
  image?: ImageAsset;
  onChange: (image: ImageAsset | undefined) => void;
}

export default function ImageUploader({ image, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);

  const uploadToCloudinary = useCallback(async (file: File) => {
    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const response = await fetch('/api/admin/content/media/cloudinary-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folder: 'ai-tutor/images', resourceType: 'image' }),
      });
      const data = (await response.json()) as {
        signature?: string;
        apiKey?: string;
        cloudName?: string;
        timestamp?: number;
        folder?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || `Signature request failed (${response.status})`);
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

      const uploadResponse = await new Promise<ImageAsset>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            resolve({ url: result.secure_url, provider: 'cloudinary', assetId: result.public_id });
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`);
        xhr.send(formData);
      });

      onChange(uploadResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    void uploadToCloudinary(file);
  }, [uploadToCloudinary]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-3">
      {image ? (
        <div className="space-y-2">
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image src={image.url} alt="Step visual" fill unoptimized className="object-cover" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Image attached</span>
            <button onClick={() => onChange(undefined)} className="text-sm text-red-500 hover:underline">Remove image</button>
          </div>
        </div>
      ) : (
        <>
          {libraryOpen && (
            <MediaLibraryPicker
              mediaType="image"
              onPick={(item) => {
                onChange({ url: item.url, provider: 'cloudinary', assetId: item.publicId });
                setLibraryOpen(false);
              }}
              onClose={() => setLibraryOpen(false)}
            />
          )}
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="w-full py-2 px-3 rounded-lg text-sm font-medium mb-3"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            Choose from media library
          </button>
          <div
            {...getRootProps()}
            className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors"
            style={{ borderColor: isDragActive ? 'var(--accent)' : 'var(--border-subtle)' }}
          >
            <input {...getInputProps()} />
            <p style={{ color: 'var(--text-primary)' }}>
              {uploading ? `Uploading image... ${uploadProgress}%` : 'Drag image here or click to upload'}
            </p>
          </div>
        </>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
