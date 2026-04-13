'use client';

/**
 * Shown when `public/attention-manim/AttentionDatabaseAnalogyLesson.mp4` is missing or fails to load.
 */
export function AttentionDatabaseFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070a10] p-6 text-center">
      <p className="max-w-lg text-sm text-slate-300">
        <span className="font-semibold text-sky-300">Database analogy (Manim)</span> — hard lookup vs soft
        attention: scores on every key, softmax weights, then a weighted mix of values.
      </p>
      <p className="max-w-lg font-mono text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">
          manim -qh attention_database_analogy.py AttentionDatabaseAnalogyLesson
        </code>
      </p>
      <p className="max-w-md text-xs text-slate-500">
        From <code className="text-slate-400">aiai/</code> run{' '}
        <code className="text-slate-400">npm run render:attention-manim</code> (requires Manim), or copy the
        rendered MP4 into{' '}
        <code className="text-slate-400">public/attention-manim/AttentionDatabaseAnalogyLesson.mp4</code>
      </p>
    </div>
  );
}
