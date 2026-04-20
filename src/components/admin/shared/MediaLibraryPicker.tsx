'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface MediaItem {
  id: number;
  publicId: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
}

interface MediaLibraryPickerProps {
  /** Filter by asset type; 'all' shows everything */
  mediaType: 'image' | 'video' | 'all';
  onPick: (item: { url: string; publicId: string; type: 'image' | 'video'; name?: string }) => void;
  onClose: () => void;
}

export default function MediaLibraryPicker({ mediaType, onPick, onClose }: MediaLibraryPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/admin/content/media', { credentials: 'include' });
        const data = (await res.json()) as { media?: MediaItem[]; error?: string };
        if (!res.ok) {
          if (!cancelled) setErr(data.error || 'Could not load library');
          return;
        }
        if (!cancelled) setItems(data.media ?? []);
      } catch {
        if (!cancelled) setErr('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = items.filter((m) => mediaType === 'all' || m.type === mediaType);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Media library"
    >
      <div
        className="flex max-h-[85vh] min-w-0 w-full max-w-[min(100vw-2rem,48rem)] flex-col overflow-hidden rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between gap-2 border-b px-3 py-3 sm:px-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="min-w-0 truncate font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
            Pick from media library
          </h3>
          <button type="button" onClick={onClose} className="text-sm px-2 py-1 rounded" style={{ color: 'var(--text-muted)' }}>
            Close
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
          {err && <p className="text-sm text-red-500">{err}</p>}
          {!loading && !err && filtered.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No matching files. Upload assets in Admin → Media first.
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() =>
                  onPick({ url: m.url, publicId: m.publicId, type: m.type, name: m.name })
                }
                className="text-left rounded-lg overflow-hidden border transition-opacity hover:opacity-90"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="aspect-video relative bg-black/20">
                  {m.type === 'image' ? (
                    <Image src={m.url} alt="" fill unoptimized className="object-cover" sizes="200px" />
                  ) : (
                    <video src={m.url} className="w-full h-full object-cover" muted playsInline />
                  )}
                </div>
                <div className="p-2 text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                  {m.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
