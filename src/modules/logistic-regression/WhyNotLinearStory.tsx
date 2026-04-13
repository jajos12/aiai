'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ClassPoint = { x: number; y: number; class: number };

const DEFAULT_POINTS: ClassPoint[] = [
  { x: 1, y: 0, class: 0 },
  { x: 2, y: 0, class: 0 },
  { x: 3, y: 0, class: 0 },
  { x: 5, y: 1, class: 1 },
  { x: 6, y: 1, class: 1 },
  { x: 7, y: 1, class: 1 },
  { x: 15, y: 1, class: 1 },
];

/** Every beat is 5 seconds; full story compares linear vs logistic in depth. */
const BEAT_MS = 5000;

const STORY_BEATS = [
  {
    caption:
      'Email spam filtering: each message becomes one dot. We predict a category — not spam or spam — from a single numeric feature (for example, a “suspicious word count”).',
  },
  {
    caption:
      'Horizontal axis: feature x. Vertical axis: the label we store as a number. This is classification, not predicting a continuous quantity like temperature.',
  },
  {
    caption:
      'NOT SPAM is encoded as y = 0. SPAM is encoded as y = 1. The numbers are just codes for two classes — they are not “amount of spam.”',
  },
  {
    caption:
      'Blue points: typical NOT SPAM inboxes — low feature values sit at y = 0. They should stay on the floor of the plot.',
  },
  {
    caption:
      'Red points: typical SPAM — higher feature values sit at y = 1. Legitimate probabilities for “spam” must live between 0 and 1, not outside.',
  },
  {
    caption:
      'A common mistake: run ordinary linear regression through these 0/1 labels and read the height of the line as if it were a probability or confidence.',
  },
  {
    caption:
      'Least squares picks the line that minimizes mean squared vertical error to the 0s and 1s. Geometrically simple — statistically mismatched to classification.',
  },
  {
    caption:
      'Problem 1 — unbounded predictions: extend the straight line and ŷ can fall below 0 or above 1. Real probabilities cannot do that.',
  },
  {
    caption:
      'The tinted bands mark impossible probability territory. A linear model can happily predict there; a probabilistic classifier must not.',
  },
  {
    caption:
      'For ordinary NOT SPAM feature values between x = 1 and 3, this early fit still looks reasonable. Remember this teal neighborhood for contrast later.',
  },
  {
    caption:
      'Problem 2 — leverage: one mailbox explodes the feature to x = 15 while still labeled SPAM (y = 1). Squared error cares a lot about that far-off point.',
  },
  {
    caption:
      'That outlier is not “wrong,” but it dominates the sum of squares. Least squares rotates the entire line to appease one extreme coordinate.',
  },
  {
    caption:
      'After re-fitting with the outlier, the line pivots. Many NOT SPAM users did not change — yet their implied ŷ along the line can shift sharply.',
  },
  {
    caption:
      'Teal band: “normal” NOT SPAM feature range. The model’s behavior here should be stable; linear least squares can violate that intuition.',
  },
  {
    caption:
      'Higher x values correspond to SPAM training examples at y = 1. We want decisions that separate NOT SPAM vs SPAM without absurd extrapolation.',
  },
  {
    caption:
      'Recap — linear regression on 0/1 targets: predictions are unbounded, outliers tilt the whole hyperplane, and MSE on labels is not a principled probability model.',
  },
  {
    caption:
      'Logistic regression keeps a linear score z = wx + b, but outputs p = σ(z) = 1/(1 + e^{−z}). The sigmoid squashes every real z into the open interval (0, 1).',
  },
  {
    caption:
      'The green curve is the same type of object you will manipulate in the next lesson: a probability for class SPAM given x. It never crosses the forbidden bands.',
  },
  {
    caption:
      'As z → +∞, σ(z) → 1 (very SPAM-like). As z → −∞, σ(z) → 0 (very NOT SPAM-like). At z = 0, σ = 1/2 — exact indifference between classes.',
  },
  {
    caption:
      'The dashed vertical line marks p = 0.5, a standard decision boundary: to the left we tend toward NOT SPAM, to the right toward SPAM, with calibrated uncertainty in between.',
  },
  {
    caption:
      'Compare: the fading straight line is linear ŷ (least squares on 0/1). The bold S-curve is logistic p(y = 1 | x). Same data story — different functional commitment.',
  },
  {
    caption:
      'Outliers still influence estimated w and b in logistic regression, but each predicted probability remains in (0, 1) by construction — no “probability = −0.2” artifacts.',
  },
  {
    caption:
      'Training prefers log loss (cross-entropy) over MSE on probabilities. It matches Bernoulli outcomes, penalizes confident wrong answers heavily, and aligns with the sigmoid.',
  },
  {
    caption:
      'Deep distinction: linear regression assumes additive Gaussian noise around a line through arbitrary real y. Logistic regression assumes a Bernoulli draw whose rate depends on x through σ(wx + b).',
  },
  {
    caption:
      'Takeaway: NOT SPAM ↔ low σ(x), SPAM ↔ high σ(x), with honest probabilities in between. Next: explore σ, weights, and loss interactively in this module.',
  },
  {
    caption:
      'End of walkthrough — about two minutes at 5 seconds per scene. Pause to read, or replay from the start whenever you want.',
  },
] as const;

const NUM_BEATS = STORY_BEATS.length;
const TOTAL_CYCLE_SEC = Math.round((NUM_BEATS * BEAT_MS) / 1000);

/** Demo logistic curve z = w·x + b (not fitted to data — for shape only). */
const SIG_W = 0.42;
const SIG_B = -4.0;

function sigma(z: number) {
  if (z > 35) return 1;
  if (z < -35) return 0;
  return 1 / (1 + Math.exp(-z));
}

function ols(xs: number[], ys: number[]): { m: number; b: number } {
  const n = xs.length;
  if (n < 2) return { m: 0, b: ys[0] ?? 0 };
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
    sxx += xs[i] * xs[i];
    sxy += xs[i] * ys[i];
  }
  const den = n * sxx - sx * sx;
  if (Math.abs(den) < 1e-12) return { m: 0, b: sy / n };
  const m = (n * sxy - sx * sy) / den;
  const b = (sy - m * sx) / n;
  return { m, b };
}

function fitLine(pts: ClassPoint[]) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return ols(xs, ys);
}

function fmtLine(m: number, b: number) {
  const mPart = `${m.toFixed(3)}x`;
  const bPart = b >= 0 ? `+ ${b.toFixed(3)}` : `− ${Math.abs(b).toFixed(3)}`;
  return `ŷ_lin = ${mPart} ${bPart}`;
}

export function WhyNotLinearStory({ points = DEFAULT_POINTS }: { points?: ClassPoint[] }) {
  const core = useMemo(() => points.slice(0, -1), [points]);
  const outlier = points[points.length - 1];
  const line6 = useMemo(() => fitLine(core), [core]);
  const line7 = useMemo(() => fitLine(points), [points]);

  const [phase, setPhase] = useState(0);
  const [auto, setAuto] = useState(true);

  const replay = useCallback(() => {
    setAuto(true);
    setPhase(0);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => {
      setPhase((p) => (p + 1) % NUM_BEATS);
    }, BEAT_MS);
    return () => window.clearTimeout(t);
  }, [phase, auto]);

  const xMin = 0;
  const xMax = 16;
  const yMin = -0.38;
  const yMax = 1.32;
  const w = 720;
  const h = 440;
  const pad = { l: 56, r: 28, t: 44, b: 56 };

  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  function sx(x: number) {
    return pad.l + ((x - xMin) / (xMax - xMin)) * innerW;
  }
  function sy(y: number) {
    return pad.t + ((yMax - y) / (yMax - yMin)) * innerH;
  }

  const lineSeg = (m: number, b: number) => {
    const x0 = 0.2;
    const x1 = 15.85;
    return {
      x1: sx(x0),
      y1: sy(m * x0 + b),
      x2: sx(x1),
      y2: sy(m * x1 + b),
    };
  };

  const sigmoidPolyline = useMemo(() => {
    const sxN = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * innerW;
    const syN = (y: number) => pad.t + ((yMax - y) / (yMax - yMin)) * innerH;
    const parts: string[] = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      const pr = sigma(SIG_W * x + SIG_B);
      const px = sxN(x);
      const py = syN(pr);
      parts.push(i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`);
    }
    return parts.join(' ');
  }, [innerW, innerH, pad.l, pad.t, xMin, xMax, yMin, yMax]);

  const xAtP50 = -SIG_B / SIG_W;

  const showCore0 = phase >= 3;
  const showCore1 = phase >= 4;
  const showLine6 = phase >= 6 && phase < 11;
  const showOutlier = phase >= 10;
  const showLine7 = phase >= 11;
  const showOrdinaryBand = phase >= 9 && phase < 16;
  const showTealBand = phase >= 12 && phase < 16;
  const showInvalidBands = phase >= 7 && phase <= 8;
  const showEncodingBanner = phase >= 2;
  const showBigNotSpam = phase >= 13;
  const showBigSpam = phase >= 14;
  const showSigmoid = phase >= 16;
  const showP50 = phase >= 19;
  const linearGhost = phase >= 20;

  const lineOpacity = linearGhost ? 0.28 : 1;
  const sigmoidBold = phase >= 20;

  const caption = STORY_BEATS[phase].caption;

  return (
    <div className="absolute inset-0 flex min-h-0 w-full flex-col bg-[#070a10]">
      <div className="flex min-h-0 flex-1 items-center justify-center px-2 py-2">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-full max-h-[min(460px,58vh)] w-full max-w-[min(720px,100%)]"
          role="img"
          aria-label="Linear versus logistic regression for spam classification"
        >
          <rect width={w} height={h} fill="#0b1220" rx={12} />

          {showEncodingBanner && (
            <text x={w / 2} y={26} textAnchor="middle" fill="#e2e8f0" fontSize={13} fontWeight={600}>
              NOT SPAM → y = 0{'    '}|{'    '}SPAM → y = 1
            </text>
          )}

          {/* Invalid probability strips (linear can predict here) */}
          {showInvalidBands && (
            <g opacity={0.45}>
              <polygon
                points={`${sx(xMin)},${sy(yMax)} ${sx(xMax)},${sy(yMax)} ${sx(xMax)},${sy(1)} ${sx(xMin)},${sy(1)}`}
                fill="rgb(239 68 68)"
                fillOpacity={0.14}
              />
              <polygon
                points={`${sx(xMin)},${sy(0)} ${sx(xMax)},${sy(0)} ${sx(xMax)},${sy(yMin)} ${sx(xMin)},${sy(yMin)}`}
                fill="rgb(239 68 68)"
                fillOpacity={0.14}
              />
              <text x={w - pad.r - 4} y={sy(1.12)} textAnchor="end" fill="#f87171" fontSize={11}>
                &gt; 1 impossible for p
              </text>
              <text x={w - pad.r - 4} y={sy(-0.12)} textAnchor="end" fill="#f87171" fontSize={11}>
                &lt; 0 impossible for p
              </text>
            </g>
          )}

          <line
            x1={pad.l}
            y1={sy(0)}
            x2={w - pad.r}
            y2={sy(0)}
            stroke="#334155"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={pad.l}
            y1={sy(1)}
            x2={w - pad.r}
            y2={sy(1)}
            stroke="#334155"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={pad.l}
            y1={pad.t}
            x2={pad.l}
            y2={h - pad.b}
            stroke="#64748b"
            strokeWidth={2}
          />
          <line
            x1={pad.l}
            y1={h - pad.b}
            x2={w - pad.r}
            y2={h - pad.b}
            stroke="#64748b"
            strokeWidth={2}
          />
          <text x={w / 2} y={h - 18} textAnchor="middle" fill="#94a3b8" fontSize={14}>
            feature x (e.g. suspicious-word score)
          </text>
          <text
            x={20}
            y={pad.t + innerH / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={13}
            transform={`rotate(-90 20 ${pad.t + innerH / 2})`}
          >
            label / probability
          </text>
          <text x={pad.l - 8} y={sy(0) + 4} textAnchor="end" fill="#93c5fd" fontSize={12} fontWeight={600}>
            0 NOT SPAM
          </text>
          <text x={pad.l - 8} y={sy(1) + 4} textAnchor="end" fill="#fca5a5" fontSize={12} fontWeight={600}>
            1 SPAM
          </text>

          <AnimatePresence>
            {showOrdinaryBand && (
              <motion.polygon
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                points={`${sx(1)},${sy(-0.2)} ${sx(3)},${sy(-0.2)} ${sx(3)},${sy(1.1)} ${sx(1)},${sy(1.1)}`}
                fill="rgb(45 212 191)"
                fillOpacity={0.1}
                stroke="rgb(45 212 191)"
                strokeWidth={1.2}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showTealBand && (
              <motion.polygon
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                points={`${sx(1)},${sy(-0.2)} ${sx(3)},${sy(-0.2)} ${sx(3)},${sy(1.1)} ${sx(1)},${sy(1.1)}`}
                fill="rgb(45 212 191)"
                fillOpacity={0.16}
                stroke="rgb(52 211 153)"
                strokeWidth={1.8}
              />
            )}
          </AnimatePresence>

          {showBigNotSpam && (
            <text x={sx(2)} y={sy(-0.08)} textAnchor="middle" fill="#38bdf8" fontSize={15} fontWeight={700}>
              NOT SPAM
            </text>
          )}
          {showBigSpam && (
            <text x={sx(12.5)} y={sy(1.06)} textAnchor="middle" fill="#f87171" fontSize={15} fontWeight={700}>
              SPAM
            </text>
          )}

          {(showLine6 || showLine7) && (
            <text x={w / 2} y={showEncodingBanner ? 44 : pad.t + 8} textAnchor="middle" fill="#cbd5e1" fontSize={12} fontFamily="monospace">
              {showLine7 ? fmtLine(line7.m, line7.b) : fmtLine(line6.m, line6.b)}
            </text>
          )}

          {showSigmoid && (
            <text x={w / 2} y={showLine7 ? 58 : 44} textAnchor="middle" fill="#6ee7b7" fontSize={12} fontFamily="monospace">
              p_spam = σ(0.42x − 4.00)  (demo curve)
            </text>
          )}

          <AnimatePresence>
            {showSigmoid && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: sigmoidBold ? 1 : 0.85 }}
                exit={{ opacity: 0 }}
                d={sigmoidPolyline}
                fill="none"
                stroke="#34d399"
                strokeWidth={sigmoidBold ? 4 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </AnimatePresence>

          {showP50 && (
            <line
              x1={sx(xAtP50)}
              y1={pad.t + 18}
              x2={sx(xAtP50)}
              y2={h - pad.b}
              stroke="#e879f9"
              strokeWidth={2}
              strokeDasharray="6 5"
              opacity={0.85}
            />
          )}
          {showP50 && (
            <text x={sx(xAtP50) + 6} y={pad.t + 30} fill="#e879f9" fontSize={11} fontWeight={600}>
              p = 0.5
            </text>
          )}

          {core.map((p, i) => {
            if (p.class === 0 && !showCore0) return null;
            if (p.class === 1 && !showCore1) return null;
            return (
              <circle
                key={`c-${p.x}-${i}`}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={7}
                fill={p.class === 1 ? '#f87171' : '#60a5fa'}
                stroke={p.class === 1 ? '#fecaca' : '#bfdbfe'}
                strokeWidth={1}
              />
            );
          })}

          {showOutlier && (
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              cx={sx(outlier.x)}
              cy={sy(outlier.y)}
              r={9}
              fill="#ef4444"
              stroke="#fecaca"
              strokeWidth={1.5}
            />
          )}

          {showLine6 && !showLine7 && (
            <motion.line
              key="ln6"
              initial={{ opacity: 0 }}
              animate={{ opacity: lineOpacity }}
              transition={{ duration: 0.45 }}
              {...lineSeg(line6.m, line6.b)}
              stroke="#fbbf24"
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}

          {showLine7 && (
            <motion.line
              key="ln7"
              initial={{ opacity: 0 }}
              animate={{ opacity: lineOpacity }}
              transition={{ duration: 0.45 }}
              {...lineSeg(line7.m, line7.b)}
              stroke="#fb923c"
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}

          {linearGhost && showLine7 && (
            <text x={pad.l + 8} y={h - pad.b - 10} textAnchor="start" fill="#94a3b8" fontSize={11}>
              Faint: linear ŷ · Bold: logistic p
            </text>
          )}
        </svg>
      </div>

      <div className="shrink-0 border-t border-slate-800 bg-slate-950/90 px-4 py-3">
        <p className="flex min-h-[4.25rem] items-start justify-center text-center text-sm leading-relaxed text-slate-300">
          {caption}
        </p>
        <p className="mt-1 text-center text-[11px] text-slate-500">
          Scene {phase + 1} / {NUM_BEATS} · {BEAT_MS / 1000}s each · ~{TOTAL_CYCLE_SEC}s full loop
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            {auto ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={replay}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
          >
            Replay from start
          </button>
        </div>
      </div>
    </div>
  );
}
