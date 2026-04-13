'use client';

/**
 * Shown when `public/attention-manim/AttentionSoftmaxWeightsLesson.mp4` is missing or fails to load.
 */
export function AttentionSoftmaxFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070a10] p-6 text-center">
      <p className="max-w-lg text-sm text-slate-300">
        <span className="font-semibold text-sky-300">Softmax weights (Manim)</span> — logits → exponentials →
        normalize to probabilities, shift invariance, subtract-max stability, temperature (flatter / sharper),
        and how weights feed <code className="text-slate-400">y = Σ αᵢ Vᵢ</code>.
      </p>
      <p className="max-w-lg font-mono text-xs text-slate-500">
        Render:{' '}
        <code className="text-slate-400">
          manim -qh attention_softmax_lesson.py AttentionSoftmaxWeightsLesson
        </code>
      </p>
      <p className="max-w-md text-xs text-slate-500">
        Or run <code className="text-slate-400">npm run render:attention-manim</code> from{' '}
        <code className="text-slate-400">aiai/</code> to rebuild all attention clips.
      </p>
    </div>
  );
}
