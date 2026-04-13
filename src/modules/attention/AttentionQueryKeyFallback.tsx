'use client';

/**
 * Shown when `public/attention-manim/AttentionQueryKeyDotProductLesson.mp4` is missing or fails to load.
 */
export function AttentionQueryKeyFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070a10] p-6 text-center">
      <p className="max-w-lg text-sm text-slate-300">
        <span className="font-semibold text-sky-300">Query–key dot product (Manim)</span> — fixed keys in
        the plane, rotating query <code className="text-slate-400">q</code>, live scores{' '}
        <code className="text-slate-400">q·k</code> for each key, then the batched{' '}
        <code className="text-slate-400">QKᵀ</code> idea.
      </p>
      <p className="max-w-lg font-mono text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">
          manim -qh attention_query_key_dot_product.py AttentionQueryKeyDotProductLesson
        </code>
      </p>
      <p className="max-w-md text-xs text-slate-500">
        Or run <code className="text-slate-400">npm run render:attention-manim</code> from{' '}
        <code className="text-slate-400">aiai/</code> to rebuild all attention clips.
      </p>
    </div>
  );
}
