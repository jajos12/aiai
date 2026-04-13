'use client';

/**
 * Shown when `public/transformers-manim/TransformerSandwichLesson.mp4` is missing or fails to load.
 */
export function TransformerSandwichFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070a10] p-6 text-center">
      <p className="max-w-lg text-sm text-slate-300">
        <span className="font-semibold text-violet-300">Transformer sandwich (Manim)</span> — Pre-LN data
        flow (bottom → top): LayerNorm → MHA → residual (+), then LayerNorm → FFN → residual (+); residual
        skips as identity paths; MHA mixes all token rows, FFN acts per row; Post-LN contrast and ∂h Jacobian
        hint.
      </p>
      <p className="max-w-lg font-mono text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">
          manim -qh transformer_sandwich_lesson.py TransformerSandwichLesson
        </code>
      </p>
      <p className="max-w-md text-xs text-slate-500">
        From <code className="text-slate-400">aiai/</code> run{' '}
        <code className="text-slate-400">npm run render:transformers-manim</code> (requires Manim), or copy
        the MP4 to{' '}
        <code className="text-slate-400">public/transformers-manim/TransformerSandwichLesson.mp4</code>
      </p>
    </div>
  );
}
