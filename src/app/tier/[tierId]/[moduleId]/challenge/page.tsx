'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getModule } from '@/content/registry';
import { useProgress } from '@/hooks/useProgress';
import { LazyVectorTransform as VectorTransform, LazyMatrixTransform as MatrixTransform, LazyEigenTransform as EigenTransform } from '@/components/visualizations/lazy';
import type { Module, Challenge } from '@/types/curriculum';

// ── Matrix types (mirroring MatrixTransform) ──
interface Mat2 { a: number; b: number; c: number; d: number }

// ── Challenge-specific configurations ──
// Each challenge has:
//   - a target (rendered as a red dot)
//   - VectorTransform mode + props
//   - a check function that returns distance-to-win

interface ChallengeSetup {
  mode: string;
  vizProps: Record<string, unknown>;
  target: { x: number; y: number };
  /** Returns distance-to-win. 0 = perfect. */
  check: (vecs: { x: number; y: number }[], params: { scalar?: number; c1?: number; c2?: number }) => number;
}

function getChallengeSetup(challengeId: string): ChallengeSetup {
  switch (challengeId) {
    case 'reach-the-target':
      return {
        mode: 'addition',
        vizProps: {
          draggable: true,
          showSum: true,
          showParallelogram: true,
          vectors: [
            { x: 2, y: 1, color: '#6366f1', label: 'a' },
            { x: 1, y: 2, color: '#34d399', label: 'b' },
          ],
        },
        target: { x: 4, y: -2 },
        check: (vecs) => {
          const sum = { x: vecs[0].x + vecs[1].x, y: vecs[0].y + vecs[1].y };
          return Math.sqrt((sum.x - 4) ** 2 + (sum.y + 2) ** 2);
        },
      };

    case 'scalar-sniper':
      return {
        mode: 'scalar',
        vizProps: {
          showScalarSlider: true,
          scalarRange: [-3, 3] as [number, number],
          vectors: [{ x: 2, y: 1, color: '#6366f1', label: 'v' }],
        },
        target: { x: -4, y: -2 },
        check: (_vecs, params) => {
          const s = params.scalar ?? 1;
          const scaled = { x: 2 * s, y: 1 * s };
          return Math.sqrt((scaled.x + 4) ** 2 + (scaled.y + 2) ** 2);
        },
      };

    case 'right-angle':
      return {
        mode: 'perpendicular',
        vizProps: {
          draggable: true,
          showDotProduct: true,
          showRightAngle: true,
          vectors: [
            { x: 3, y: 1, color: '#6366f1', label: 'a' },
            { x: 1, y: 2, color: '#34d399', label: 'b' },
          ],
        },
        target: { x: 0, y: 0 }, // No spatial target, just dot product → 0
        check: (vecs) => {
          return Math.abs(vecs[0].x * vecs[1].x + vecs[0].y * vecs[1].y);
        },
      };

    case 'basis-builder':
      return {
        mode: 'linear-combination',
        vizProps: {
          showSliders: true,
          showParallelogram: true,
          vectors: [
            { x: 2, y: 1, color: '#6366f1', label: 'e₁' },
            { x: -1, y: 2, color: '#34d399', label: 'e₂' },
          ],
        },
        target: { x: 3, y: 4 },
        check: (_vecs, params) => {
          const c1 = params.c1 ?? 1;
          const c2 = params.c2 ?? 1;
          // Fixed basis: 2,1 and -1,2
          const result = { x: 2 * c1 + (-1) * c2, y: 1 * c1 + 2 * c2 };
          return Math.sqrt((result.x - 3) ** 2 + (result.y - 4) ** 2);
        },
      };

    default:
      return {
        mode: 'interactive',
        vizProps: { draggable: true, vectors: [{ x: 3, y: 2, color: '#6366f1' }] },
        target: { x: 4, y: 4 },
        check: () => 999,
      };
  }
}

// ── Matrix challenge configurations ──
interface MatrixChallengeSetup {
  vizProps: Record<string, unknown>;
  /** Returns distance-to-win from the matrix state. 0 = perfect. */
  check: (mat: Mat2) => number;
}

function getMatrixChallengeSetup(challengeId: string): MatrixChallengeSetup {
  switch (challengeId) {
    case 'make-rotation':
      // Target: 90° CCW rotation → [[0, -1], [1, 0]]
      return {
        vizProps: {
          mode: 'custom',
          interactive: true,
          showBasisVectors: true,
          showTransformedBasis: true,
          showUnitCircle: true,
          showTransformedCircle: true,
        },
        check: (m) => {
          // Distance to rotation matrix [[cos90, -sin90],[sin90, cos90]] = [[0,-1],[1,0]]
          return Math.sqrt(
            (m.a - 0) ** 2 + (m.b - (-1)) ** 2 +
            (m.c - 1) ** 2 + (m.d - 0) ** 2
          );
        },
      };

    case 'zero-determinant':
      // Target: det(A) = 0
      return {
        vizProps: {
          mode: 'custom',
          interactive: true,
          showDeterminant: true,
          showTransformedGrid: true,
          showTransformedBasis: true,
        },
        check: (m) => Math.abs(m.a * m.d - m.b * m.c),
      };

    case 'double-area':
      // Target: det(A) = 2
      return {
        vizProps: {
          mode: 'custom',
          interactive: true,
          showDeterminant: true,
          showTransformedGrid: true,
          showTransformedBasis: true,
        },
        check: (m) => Math.abs((m.a * m.d - m.b * m.c) - 2),
      };

    default:
      return {
        vizProps: { mode: 'custom', interactive: true },
        check: () => 999,
      };
  }
}

// ── Eigen challenge configurations ──
interface EigenChallengeSetup {
  vizProps: Record<string, unknown>;
  /** Returns distance-to-win from the matrix state. 0 = perfect. */
  check: (mat: Mat2) => number;
}

function getEigenChallengeSetup(challengeId: string): EigenChallengeSetup {
  switch (challengeId) {
    case 'find-eigenvectors': {
      // Target: eigenvectors along (1,1) and (1,-1)
      return {
        vizProps: {
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showEigenspaceLines: true,
          showScalingIndicators: true,
          showCharacteristicEq: true,
          showMatrixControls: true,
          showPresets: true,
          showAnimation: true,
          highlightEigenDots: true,
          interactive: true,
        },
        check: (m) => {
          // Compute eigenvectors and measure angle error to (1,1) and (1,-1)
          const tr = m.a + m.d;
          const det = m.a * m.d - m.b * m.c;
          const disc = tr * tr - 4 * det;
          if (disc < 0) return 999; // complex eigenvalues = no real eigenvectors
          const s = Math.sqrt(disc);
          const l1 = (tr + s) / 2;
          const l2 = (tr - s) / 2;
          if (Math.abs(l1 - l2) < 0.01) return 999; // repeated = degenerate

          const getVec = (lambda: number) => {
            const ax = m.a - lambda, bx = m.b;
            if (Math.abs(bx) > 0.001) return { x: -bx, y: ax };
            if (Math.abs(ax) > 0.001) return { x: 0, y: 1 };
            return { x: 1, y: 0 };
          };

          const v1 = getVec(l1);
          const v2 = getVec(l2);

          // Target directions: (1,1) and (1,-1)
          const t1 = { x: 1, y: 1 };
          const t2 = { x: 1, y: -1 };

          // Angular error (using absolute cross product / magnitudes)
          const angleErr = (a: {x:number,y:number}, b: {x:number,y:number}) => {
            const cross = Math.abs(a.x * b.y - a.y * b.x);
            const ma = Math.sqrt(a.x*a.x + a.y*a.y);
            const mb = Math.sqrt(b.x*b.x + b.y*b.y);
            return ma > 0.01 && mb > 0.01 ? cross / (ma * mb) : 999;
          };

          // Try both assignments (v1→t1, v2→t2) and (v1→t2, v2→t1)
          const err1 = angleErr(v1, t1) + angleErr(v2, t2);
          const err2 = angleErr(v1, t2) + angleErr(v2, t1);
          return Math.min(err1, err2);
        },
      };
    }

    case 'make-rotation': {
      // Target: complex eigenvalues (discriminant < 0)
      return {
        vizProps: {
          mode: 'animate',
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showEigenspaceLines: true,
          showCharacteristicEq: true,
          showAnimation: true,
          showMatrixControls: true,
          showPresets: true,
          highlightEigenDots: true,
          interactive: true,
        },
        check: (m) => {
          const tr = m.a + m.d;
          const det = m.a * m.d - m.b * m.c;
          const disc = tr * tr - 4 * det;
          // disc < 0 = complex eigenvalues = win. Return 0 if complex.
          return disc < 0 ? 0 : disc;
        },
      };
    }

    case 'positive-definite-challenge': {
      // Target: symmetric + both eigenvalues > 0
      return {
        vizProps: {
          mode: 'symmetric',
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showEigenspaceLines: true,
          showUnitCircle: true,
          showDeterminantArea: true,
          showCharacteristicEq: true,
          showScalingIndicators: true,
          showMatrixControls: true,
          showPresets: true,
          highlightEigenDots: true,
          interactive: true,
          symmetricOnly: true,
        },
        check: (m) => {
          const tr = m.a + m.d;
          const det = m.a * m.d - m.b * m.c;
          const disc = tr * tr - 4 * det;
          if (disc < 0) return 999; // complex
          const s = Math.sqrt(disc);
          const l1 = (tr + s) / 2;
          const l2 = (tr - s) / 2;
          const minEig = Math.min(l1, l2);
          // Win when min eigenvalue > 0. Distance = how far from positive.
          return minEig > 0.1 ? 0 : 0.1 - minEig;
        },
      };
    }

    case 'fast-convergence': {
      // Target: |λ₁/λ₂| > 5
      return {
        vizProps: {
          mode: 'power-iteration',
          showPowerIteration: true,
          showDotCloud: true,
          showTransformedGrid: true,
          showBasisVectors: true,
          showEigenspaceLines: true,
          showScalingIndicators: true,
          showCharacteristicEq: true,
          showMatrixControls: true,
          showPresets: true,
          highlightEigenDots: true,
          interactive: true,
        },
        check: (m) => {
          const tr = m.a + m.d;
          const det = m.a * m.d - m.b * m.c;
          const disc = tr * tr - 4 * det;
          if (disc < 0) return 999; // complex
          const s = Math.sqrt(disc);
          const l1 = (tr + s) / 2;
          const l2 = (tr - s) / 2;
          const absL1 = Math.abs(l1);
          const absL2 = Math.abs(l2);
          if (absL2 < 0.001) return 0; // infinite ratio = instant convergence
          const ratio = Math.max(absL1, absL2) / Math.min(absL1, absL2);
          // Win when ratio > 5. Distance = how far from 5.
          return ratio >= 5 ? 0 : 5 - ratio;
        },
      };
    }

    default:
      return {
        vizProps: { showMatrixControls: true, showPresets: true, interactive: true },
        check: () => 999,
      };
  }
}

// ── Eigen Challenge Canvas ──
function EigenChallengeCanvas({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const setup = getEigenChallengeSetup(challenge.id);
  const [distance, setDistance] = useState(999);
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const threshold = typeof challenge.completionCriteria.target === 'number'
    ? challenge.completionCriteria.target
    : 0.3;
  const latestMat = useRef<Mat2>({ a: 1, b: 0, c: 0, d: 1 });
  const checkTimer = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    checkTimer.current = setInterval(() => {
      const d = setup.check(latestMat.current);
      setDistance(d);
      if (d <= threshold && !won) {
        setWon(true);
        setShowSuccess(true);
        onComplete();
      }
    }, 100);
    return () => { if (checkTimer.current) clearInterval(checkTimer.current); };
  }, [setup, threshold, won, onComplete]);

  const handleMatrixChange = useCallback((m: Mat2) => {
    latestMat.current = m;
  }, []);

  const progressColor = won
    ? '#34d399'
    : distance < threshold * 3
      ? '#fbbf24'
      : 'var(--text-muted)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <EigenTransform
          {...setup.vizProps}
          onMatrixChange={handleMatrixChange}
        />
      </div>

      {/* Distance indicator */}
      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'rgba(15, 17, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '6px 10px',
          fontFamily: 'monospace',
          fontSize: '11px',
          pointerEvents: 'none',
        }}
      >
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>distance: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {distance < 999 ? distance.toFixed(3) : '—'}
          </span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>threshold: </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            ≤ {threshold}
          </span>
        </div>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 17, 23, 0.7)',
            backdropFilter: 'blur(4px)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--success)',
              boxShadow: '0 0 40px rgba(52, 211, 153, 0.15)',
              maxWidth: '300px',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#34d399',
                margin: '0 0 0.5rem 0',
              }}
            >
              Challenge Complete!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              Distance: {distance.toFixed(4)} (threshold: {threshold})
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Click to dismiss
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Target marker rendered as an SVG overlay via a wrapper ──
function ChallengeCanvas({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const setup = getChallengeSetup(challenge.id);
  const [distance, setDistance] = useState(999);
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const threshold = typeof challenge.completionCriteria.target === 'number'
    ? challenge.completionCriteria.target
    : 0.3;
  const checkTimer = useRef<ReturnType<typeof setInterval>>(null);
  const latestVecs = useRef<{ x: number; y: number }[]>(
    ((setup.vizProps.vectors ?? []) as { x: number; y: number }[]).map(v => ({ x: v.x, y: v.y }))
  );
  const latestParams = useRef<{ scalar?: number; c1?: number; c2?: number }>({});

  // Periodic check (not on every render — every 100ms is fine)
  useEffect(() => {
    checkTimer.current = setInterval(() => {
      if (latestVecs.current.length === 0) return;
      const d = setup.check(latestVecs.current, latestParams.current);
      setDistance(d);
      if (d <= threshold && !won) {
        setWon(true);
        setShowSuccess(true);
        onComplete();
      }
    }, 100);
    return () => { if (checkTimer.current) clearInterval(checkTimer.current); };
  }, [setup, threshold, won, onComplete]);

  const handleVectorsChange = useCallback((vecs: { x: number; y: number }[]) => {
    latestVecs.current = vecs;
  }, []);

  // For simplicity, VectorTransform doesn't expose scalar/c1/c2 changes yet.
  // We'll use the viz internal state, but for scalar-sniper and basis-builder
  // we need to observe the values. We'll pass a wrapper.

  const showTarget = challenge.id !== 'right-angle'; // No spatial target for perpendicularity

  // Color gradient based on distance
  const progressColor = won
    ? '#34d399'
    : distance < threshold * 3
      ? '#fbbf24'
      : 'var(--text-muted)';

  const handleParamsChange = useCallback((params: { scalar?: number; c1?: number; c2?: number }) => {
    latestParams.current = { ...latestParams.current, ...params };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Viz with integrated target marker */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <VectorTransform
          {...setup.vizProps}
          mode={setup.mode}
          onVectorsChange={handleVectorsChange}
          onParamsChange={handleParamsChange}
          targetMarker={showTarget ? setup.target : undefined}
        />
      </div>

      {/* Distance indicator */}
      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'rgba(15, 17, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '6px 10px',
          fontFamily: 'monospace',
          fontSize: '11px',
          pointerEvents: 'none',
        }}
      >
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>distance: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {distance < 999 ? distance.toFixed(3) : '—'}
          </span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>threshold: </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            ≤ {threshold}
          </span>
        </div>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 17, 23, 0.7)',
            backdropFilter: 'blur(4px)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--success)',
              boxShadow: '0 0 40px rgba(52, 211, 153, 0.15)',
              maxWidth: '300px',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#34d399',
                margin: '0 0 0.5rem 0',
              }}
            >
              Challenge Complete!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              Distance: {distance.toFixed(4)} (threshold: {threshold})
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Click to dismiss
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Matrix Challenge Canvas ──
function MatrixChallengeCanvas({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: () => void;
}) {
  const setup = getMatrixChallengeSetup(challenge.id);
  const [distance, setDistance] = useState(999);
  const [won, setWon] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const threshold = typeof challenge.completionCriteria.target === 'number'
    ? challenge.completionCriteria.target
    : 0.3;
  const latestMat = useRef<Mat2>({ a: 1, b: 0, c: 0, d: 1 });
  const checkTimer = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    checkTimer.current = setInterval(() => {
      const d = setup.check(latestMat.current);
      setDistance(d);
      if (d <= threshold && !won) {
        setWon(true);
        setShowSuccess(true);
        onComplete();
      }
    }, 100);
    return () => { if (checkTimer.current) clearInterval(checkTimer.current); };
  }, [setup, threshold, won, onComplete]);

  const handleMatrixChange = useCallback((m: Mat2) => {
    latestMat.current = m;
  }, []);

  const progressColor = won
    ? '#34d399'
    : distance < threshold * 3
      ? '#fbbf24'
      : 'var(--text-muted)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MatrixTransform
          {...setup.vizProps}
          onMatrixChange={handleMatrixChange}
        />
      </div>

      {/* Distance indicator */}
      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'rgba(15, 17, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '6px 10px',
          fontFamily: 'monospace',
          fontSize: '11px',
          pointerEvents: 'none',
        }}
      >
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>distance: </span>
          <span style={{ color: progressColor, fontWeight: 600 }}>
            {distance < 999 ? distance.toFixed(3) : '—'}
          </span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>threshold: </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            ≤ {threshold}
          </span>
        </div>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 17, 23, 0.7)',
            backdropFilter: 'blur(4px)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--success)',
              boxShadow: '0 0 40px rgba(52, 211, 153, 0.15)',
              maxWidth: '300px',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#34d399',
                margin: '0 0 0.5rem 0',
              }}
            >
              Challenge Complete!
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              Distance: {distance.toFixed(4)} (threshold: {threshold})
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Click to dismiss
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──
export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const tierId = Number(params.tierId);
  const moduleId = params.moduleId as string;

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [hintRevealed, setHintRevealed] = useState(0);

  const { getModuleProgress, completeChallenge } = useProgress();

  useEffect(() => {
    setLoading(true);
    getModule(moduleId).then((mod) => {
      setModuleData(mod);
      setLoading(false);
    });
  }, [moduleId]);

  const progress = getModuleProgress(tierId, moduleId);

  const handleChallengeComplete = useCallback(() => {
    if (selectedChallenge) {
      completeChallenge(tierId, moduleId, selectedChallenge.id);
    }
  }, [selectedChallenge, tierId, moduleId, completeChallenge]);

  if (loading || !moduleData) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - var(--topnav-height))',
          background: 'var(--bg-base)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-heading)',
        }}
      >
        Loading challenges...
      </div>
    );
  }

  const basePath = `/tier/${tierId}/${moduleId}`;

  // ── Challenge detail view ──
  if (selectedChallenge) {
    const isCompleted = progress.challengesCompleted.includes(selectedChallenge.id);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - var(--topnav-height))',
          background: 'var(--bg-base)',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => { setSelectedChallenge(null); setHintRevealed(0); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              ← Challenges
            </button>
            <span style={{ color: 'var(--border-default)' }}>/</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedChallenge.title}
            </span>
          </div>
          {isCompleted && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#34d399',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
              }}
            >
              ✓ Completed
            </span>
          )}
        </div>

        {/* Challenge area */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Viz canvas */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div style={{ width: '100%', maxWidth: '550px', aspectRatio: '1', position: 'relative' }}>
              {selectedChallenge.component === 'EigenTransform' ? (
                <EigenChallengeCanvas
                  challenge={selectedChallenge}
                  onComplete={handleChallengeComplete}
                />
              ) : selectedChallenge.component === 'MatrixTransform' ? (
                <MatrixChallengeCanvas
                  challenge={selectedChallenge}
                  onComplete={handleChallengeComplete}
                />
              ) : (
                <ChallengeCanvas
                  challenge={selectedChallenge}
                  onComplete={handleChallengeComplete}
                />
              )}
            </div>
          </div>

          {/* Right sidebar — description + hints */}
          <div
            style={{
              width: '260px',
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0',
                }}
              >
                {selectedChallenge.title}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {selectedChallenge.description}
              </p>
            </div>

            {/* Criteria */}
            <div
              style={{
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Win Condition
              </span>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                {selectedChallenge.completionCriteria.metric.replace(/_/g, ' ')} ≤{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  {String(selectedChallenge.completionCriteria.target)}
                </span>
              </p>
            </div>

            {/* Hints — revealed one by one */}
            {selectedChallenge.hints && selectedChallenge.hints.length > 0 && (
              <div>
                <h4
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    margin: '0 0 0.5rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Hints
                </h4>
                {selectedChallenge.hints.map((hint, i) => (
                  <div key={i} style={{ marginBottom: '0.375rem' }}>
                    {i < hintRevealed ? (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {i + 1}. {hint}
                      </p>
                    ) : i === hintRevealed ? (
                      <button
                        onClick={() => setHintRevealed((prev) => prev + 1)}
                        style={{
                          background: 'var(--bg-hover)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                        }}
                      >
                        💡 Reveal hint {i + 1}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Challenge list view ──
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={() => router.push(basePath)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            padding: '0.25rem 0',
            marginBottom: '1.5rem',
          }}
        >
          ← {moduleData.title}
        </button>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0',
          }}
        >
          🏆 Challenges
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            margin: '0 0 1.5rem 0',
          }}
        >
          {progress.challengesCompleted.length}/{moduleData.challenges.length} completed
        </p>

        {/* Challenge cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {moduleData.challenges.map((challenge) => {
            const isCompleted = progress.challengesCompleted.includes(challenge.id);

            return (
              <div
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedChallenge(challenge);
                  }
                }}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isCompleted ? 'var(--success)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <span
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--success)' : 'var(--bg-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    color: isCompleted ? 'white' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? '✓' : '?'}
                </span>

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      margin: '0 0 0.125rem 0',
                    }}
                  >
                    {challenge.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      margin: 0,
                    }}
                  >
                    {challenge.description}
                  </p>
                </div>

                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>→</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
