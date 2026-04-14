'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Video {
  url: string;
  provider?: string;
  assetId?: string;
}

interface VideoUploaderProps {
  video?: Video;
  onChange: (video: Video | undefined) => void;
}

export default function VideoUploader({ video, onChange }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const uploadToCloudinary = useCallback(async (file: File) => {
    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const response = await fetch('/api/admin/content/media/cloudinary-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folder: 'ai-tutor/videos', resourceType: 'video' }),
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

      const uploadResponse = await new Promise<Video>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            const mp4PlaybackUrl = `https://res.cloudinary.com/${data.cloudName}/video/upload/f_mp4,q_auto/${result.public_id}.mp4`;
            resolve({
              // Store a browser-friendly delivery URL for reliable in-editor preview.
              url: mp4PlaybackUrl,
              provider: 'cloudinary',
              assetId: result.public_id,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${data.cloudName}/video/upload`);
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
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('video/')) {
        setError('Please upload a video file');
        return;
      }
      uploadToCloudinary(file);
    }
  }, [uploadToCloudinary]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    const url = urlInput.trim();
    let provider = 'url';
    let processedUrl = url;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      provider = 'youtube';
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (match) {
        processedUrl = `https://www.youtube.com/embed/${match[1]}`;
      }
    } else if (url.includes('vimeo.com')) {
      provider = 'vimeo';
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) {
        processedUrl = `https://player.vimeo.com/video/${match[1]}`;
      }
    }

    onChange({ url: processedUrl, provider });
    setUrlInput('');
  };

  const removeVideo = () => {
    if (!confirm('Remove this video?')) return;
    onChange(undefined);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Step Video</h3>

      {video ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {video.provider === 'youtube' || video.provider === 'vimeo' ? (
              <div className="aspect-video">
                <iframe
                  src={video.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                src={video.url}
                controls
                className="w-full"
                style={{ maxHeight: '400px' }}
              />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {video.provider === 'youtube' ? 'YouTube' : video.provider === 'vimeo' ? 'Vimeo' : video.provider === 'cloudinary' ? 'Cloudinary' : 'Direct URL'}
            </span>
            <button
              onClick={removeVideo}
              className="text-sm text-red-500 hover:underline"
            >
              Remove Video
            </button>
          </div>
        </div>
      ) : (
        <>
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
                  <span className="text-2xl">🎬</span>
                </div>
                <p style={{ color: 'var(--text-primary)' }}>
                  {isDragActive ? 'Drop the video here' : 'Drag & drop a video, or click to browse'}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  MP4, WebM, MOV, AVI (max 500MB)
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border-subtle)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 text-sm" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                or
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="Paste YouTube, Vimeo, or direct video URL"
              className="flex-1 p-3 rounded-lg outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              Add URL
            </button>
          </div>
        </>
      )}
    </div>
  );
}
