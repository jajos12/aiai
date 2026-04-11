'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BEAT_MS = 5000;

type Beat = { caption: string; w: number; b: number };

/**
 * New story arc: “raw score” vs “public probability” — courtroom / dial metaphor,
 * not the old lecture-style walkthrough. Same math, totally different telling.
 */
const STORY_BEATS: Beat[] = [
  {
    w: 0.5,
    b: 0,
    caption:
      'Act I — The whisper. Before anyone sees a percentage, the model keeps an internal number z. Think of it as a backstage dial: it can spin negative, sit at zero, or scream positive.',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'That dial is computed the boring way: z = wx + b. Same linear algebra you already know — weights times inputs, plus bias. No magic yet, just a straight line when you plot z against x.',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'Here is the tension: humans want a chance between 0% and 100%. The dial z does not live in that box. You cannot hand someone “probability = −3.7” and keep a straight face.',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'So we hire a translator named σ (sigma). Its only job: take any backstage reading z and publish a number strictly between 0 and 1 — never exactly on the rails, but arbitrarily close.',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'The translator’s rule is σ(z) = 1 / (1 + e^(-z)). One smooth formula; no piecewise hacks. The exponential is what makes the bend — polynomials alone would not give this S.',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'Top graph: the backstage dial versus x (violet line). The dashed “z = 0” is the neutral setting — neither cheering nor booing the positive class yet.',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'Bottom graph: what the world is allowed to see — p = σ(z(x)). Same inputs x, but the published curve bends. That bend is the heart of “nonlinear in x.”',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'If p were linear in x, this lower plot would be another straight ramp. It is not: slope changes as you move along x. Middle of the S is twitchy; the flat ends are stubborn.',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'Flat ends mean saturation: once z is huge positive or huge negative, cranking x a little more barely moves p. The model acts “already convinced” — a nonlinear kind of certainty.',
  },
  {
    w: 0.5,
    b: 0,
    caption:
      'At z = 0, the translator splits the difference: σ(0) = 1/2. That is the 50–50 line in the lower panel — the fence you step over when deciding class 1 vs class 0.',
  },
  {
    w: 0.85,
    b: -2.2,
    caption:
      'Act II — Turn up the gain. Watch w grow: the violet line tilts faster. The orange probability s-curve steepens — the model now flips its mind over a shorter stretch of x.',
  },
  {
    w: 1.35,
    b: -4.8,
    caption:
      'Higher |w| is like a sharper microphone: small differences in x become loud differences in z, which become fast swings in p. Still the same σ; only the score path changed.',
  },
  {
    w: 1.5,
    b: -6,
    caption:
      'Act III — Slide the neutral point. Bias b slides the whole story sideways without changing how steep w is: it picks where along x the dial reads z = 0, hence where p hits one-half.',
  },
  {
    w: 1.5,
    b: -3.5,
    caption:
      'Nudge b upward (less negative): the S marches right. Same features now look “less alarming” — you need higher x to earn the same probability you had a moment ago.',
  },
  {
    w: 1.5,
    b: -8,
    caption:
      'Pull b down: the S slides left. The model awards high p earlier along x — a more eager classifier, even before you touch w again.',
  },
  {
    w: 1.5,
    b: -6,
    caption:
      'The gold vertical links where z crosses zero to where p crosses 0.5. Two panels, one story: linear backstage, nonlinear front stage.',
  },
  {
    w: 1.5,
    b: -6,
    caption:
      'Why call the whole thing “logistic regression” linear? Because w and b enter z in a linear way. But the map from x to p is not linear — σ forbids it.',
  },
  {
    w: 1.5,
    b: -6,
    caption:
      'Training nudges w and b with gradients on log loss, not MSE on 0/1 labels. The loss speaks the language of probabilities; the sigmoid makes that conversation differentiable.',
  },
  {
    w: 1.5,
    b: -6,
    caption:
      'Closing image: raw score (unbounded line) versus published chance (bounded S). That contrast is the whole design — not an afterthought, the point of the chapter.',
  },
  {
    w: 1.5,
    b: -6,
    caption:
      'Fade out, replay, or jump ahead in the module: 2D boundaries, then log loss in detail. This was Act I–III of σ — same symbols, a different story than before.',
  },
];

const NUM_BEATS = STORY_BEATS.length;
const TOTAL_CYCLE_SEC = Math.round((NUM_BEATS * BEAT_MS) / 1000);

function sigma(z: number) {
  if (z > 40) return 1;
  if (z < -40) return 0;
  return 1 / (1 + Math.exp(-z));
}

export function SigmoidStory() {
  const [phase, setPhase] = useState(0);
  const [auto, setAuto] = useState(true);

  const { w, b, caption } = STORY_BEATS[phase];

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

  const W = 720;
  const H_TOP = 128;
  const GAP = 8;
  const H_BOT = 308;
  const H = H_TOP + GAP + H_BOT + 56;
  const pad = { l: 56, r: 28, t: 40, b: 44 };

  const xMin = -4;
  const xMax = 14;
  const zMin = -10;
  const zMax = 10;

  const innerW = W - pad.l - pad.r;

  const topY0 = pad.t;
  const botY0 = pad.t + H_TOP + GAP;

  function sx(x: number) {
    return pad.l + ((x - xMin) / (xMax - xMin)) * innerW;
  }
  function syTop(z: number) {
    return topY0 + ((zMax - z) / (zMax - zMin)) * (H_TOP - 24);
  }
  function syBot(p: number) {
    return botY0 + ((1 - p) / 1) * (H_BOT - 28);
  }

  const zLinePath = useMemo(() => {
    const sxN = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * innerW;
    const syTN = (z: number) => topY0 + ((zMax - z) / (zMax - zMin)) * (H_TOP - 24);
    const n = 80;
    const parts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = xMin + (xMax - xMin) * (i / n);
      const zv = w * x + b;
      const px = sxN(x);
      const py = syTN(zv);
      parts.push(i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`);
    }
    return parts.join(' ');
  }, [w, b, innerW, pad.l, topY0, H_TOP, xMin, xMax, zMin, zMax]);

  const sigmoidPath = useMemo(() => {
    const sxN = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * innerW;
    const syPN = (p: number) => botY0 + ((1 - p) / 1) * (H_BOT - 28);
    const n = 80;
    const parts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = xMin + (xMax - xMin) * (i / n);
      const pr = sigma(w * x + b);
      const px = sxN(x);
      const py = syPN(pr);
      parts.push(i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`);
    }
    return parts.join(' ');
  }, [w, b, innerW, pad.l, botY0, H_BOT, xMin, xMax]);

  const xAtZ0 = Math.abs(w) < 1e-8 ? null : -b / w;
  const z0InRange = xAtZ0 !== null && xAtZ0 >= xMin && xAtZ0 <= xMax;

  const showZ0Line = phase >= 5;
  const showP50Line = phase >= 5;
  const showFormulaBanner = phase >= 3;
  const showBridgeLabel = phase >= 15;

  return (
    <div className="absolute inset-0 flex min-h-0 w-full flex-col bg-[#06080f]">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-2 py-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-[min(720px,100%)]"
          role="img"
          aria-label="Backstage score z and published probability sigma of z"
        >
          <defs>
            <linearGradient id="sigStoryBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1a1033" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#sigStoryBg)" rx={12} />

          {showFormulaBanner && (
            <text x={W / 2} y={24} textAnchor="middle" fill="#e9d5ff" fontSize={12} fontWeight={600}>
              Backstage: z = wx + b → Front stage: p = σ(z)
            </text>
          )}

          <rect
            x={pad.l}
            y={topY0}
            width={innerW}
            height={H_TOP - 8}
            fill="#111827"
            stroke="#4c1d95"
            strokeOpacity={0.45}
            strokeWidth={1}
            rx={6}
          />
          <text x={pad.l + 4} y={topY0 + 16} fill="#c4b5fd" fontSize={12} fontWeight={600}>
            Backstage dial · z = wx + b
          </text>

          <line
            x1={pad.l}
            y1={syTop(0)}
            x2={pad.l + innerW}
            y2={syTop(0)}
            stroke="#a78bfa"
            strokeWidth={1}
            strokeDasharray="5 4"
            opacity={showZ0Line ? 0.85 : 0.2}
          />
          {showZ0Line && (
            <text x={pad.l + innerW - 4} y={syTop(0) - 4} textAnchor="end" fill="#c4b5fd" fontSize={10}>
              z = 0 (neutral)
            </text>
          )}

          <line x1={pad.l} y1={topY0 + H_TOP - 16} x2={pad.l} y2={topY0 + 8} stroke="#64748b" strokeWidth={2} />
          <line
            x1={pad.l}
            y1={topY0 + H_TOP - 16}
            x2={pad.l + innerW}
            y2={topY0 + H_TOP - 16}
            stroke="#64748b"
            strokeWidth={2}
          />
          <text x={W / 2} y={topY0 + H_TOP - 2} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            feature x
          </text>

          <AnimatePresence mode="wait">
            <motion.path
              key={`z-${w}-${b}`}
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              d={zLinePath}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </AnimatePresence>

          <text x={pad.l - 6} y={syTop(zMax) + 4} textAnchor="end" fill="#64748b" fontSize={10}>
            +{zMax}
          </text>
          <text x={pad.l - 6} y={syTop(zMin) + 4} textAnchor="end" fill="#64748b" fontSize={10}>
            {zMin}
          </text>

          <rect
            x={pad.l}
            y={botY0}
            width={innerW}
            height={H_BOT - 12}
            fill="#111827"
            stroke="#9a3412"
            strokeOpacity={0.4}
            strokeWidth={1}
            rx={6}
          />
          <text x={pad.l + 4} y={botY0 + 16} fill="#fdba74" fontSize={12} fontWeight={600}>
            Published chance · p = σ(z(x))
          </text>

          <line
            x1={pad.l}
            y1={syBot(0.5)}
            x2={pad.l + innerW}
            y2={syBot(0.5)}
            stroke="#f472b6"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={showP50Line ? 0.8 : 0.2}
          />
          {showP50Line && (
            <text x={pad.l + innerW - 4} y={syBot(0.5) - 4} textAnchor="end" fill="#f472b6" fontSize={10}>
              p = 50%
            </text>
          )}

          <line x1={pad.l} y1={botY0 + H_BOT - 28} x2={pad.l} y2={botY0 + 24} stroke="#64748b" strokeWidth={2} />
          <line
            x1={pad.l}
            y1={botY0 + H_BOT - 28}
            x2={pad.l + innerW}
            y2={botY0 + H_BOT - 28}
            stroke="#64748b"
            strokeWidth={2}
          />
          <text x={W / 2} y={botY0 + H_BOT - 10} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            feature x
          </text>
          <text x={pad.l - 8} y={syBot(1) + 4} textAnchor="end" fill="#fdba74" fontSize={10} fontWeight={600}>
            100%
          </text>
          <text x={pad.l - 8} y={syBot(0) + 4} textAnchor="end" fill="#93c5fd" fontSize={10} fontWeight={600}>
            0%
          </text>

          <AnimatePresence mode="wait">
            <motion.path
              key={`p-${w}-${b}`}
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              d={sigmoidPath}
              fill="none"
              stroke="#fb923c"
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          </AnimatePresence>

          {z0InRange && showP50Line && (
            <line
              x1={sx(xAtZ0)}
              y1={topY0 + 8}
              x2={sx(xAtZ0)}
              y2={botY0 + H_BOT - 28}
              stroke="#fcd34d"
              strokeWidth={1.5}
              strokeDasharray="3 5"
              opacity={0.65}
            />
          )}
          {z0InRange && showBridgeLabel && (
            <text x={sx(xAtZ0) + 4} y={syBot(0.5) + 14} fill="#fcd34d" fontSize={10} fontWeight={600}>
              z=0 meets p=50%
            </text>
          )}

          <text x={pad.l + 4} y={H - 14} fill="#64748b" fontSize={11}>
            w = {w.toFixed(2)} · b = {b.toFixed(2)}
          </text>
        </svg>
      </div>

      <div className="shrink-0 border-t border-violet-950/80 bg-slate-950/95 px-4 py-3">
        <p className="flex min-h-[4.25rem] items-start justify-center text-center text-sm leading-relaxed text-slate-300">
          {caption}
        </p>
        <p className="mt-1 text-center text-[11px] text-slate-500">
          Scene {phase + 1} / {NUM_BEATS} · {BEAT_MS / 1000}s each · ~{TOTAL_CYCLE_SEC}s · new story arc
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
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
          >
            Replay from start
          </button>
        </div>
      </div>
    </div>
  );
}
