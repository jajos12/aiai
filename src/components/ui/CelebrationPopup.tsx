'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * LeetCode-style streak celebration popup.
 * Shows when user earns their first activity of the day.
 */
export function StreakPopup({
  streakDays,
  show,
  onClose,
}: {
  streakDays: number;
  show: boolean;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setClosing(false);
    }
  }, [show]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onClose();
    }, 300);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      className={closing ? 'popup-backdrop popup-closing' : 'popup-backdrop'}
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        animation: closing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          padding: '2rem 2.5rem',
          textAlign: 'center',
          maxWidth: '340px',
          width: '90vw',
          boxShadow: 'var(--shadow-lg)',
          animation: closing
            ? 'popupScaleOut 0.3s ease forwards'
            : 'popupScaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        }}
      >
        {/* Fire emoji with pulse */}
        <div
          style={{
            fontSize: '3.5rem',
            lineHeight: 1,
            marginBottom: '0.75rem',
            animation: 'streakPulse 0.6s ease 0.3s both',
          }}
        >
          🔥
        </div>

        {/* Streak count */}
        <div
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--accent)',
            lineHeight: 1,
            marginBottom: '0.25rem',
          }}
        >
          {streakDays} Day{streakDays !== 1 ? 's' : ''}
        </div>
        <div
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem',
            fontWeight: 500,
          }}
        >
          {streakDays === 1
            ? 'New streak started! Keep it going!'
            : streakDays <= 3
              ? 'Streak growing! Stay consistent!'
              : streakDays <= 7
                ? "You're on fire! Amazing consistency! 🎯"
                : "Incredible dedication! You're unstoppable! 🚀"}
        </div>

        {/* Progress bar decoration */}
        <div
          style={{
            height: '4px',
            borderRadius: '2px',
            background: 'var(--bg-hover)',
            marginBottom: '1.25rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(streakDays * 14, 100)}%`,
              borderRadius: '2px',
              background: 'linear-gradient(90deg, var(--accent), #a78bfa)',
              animation: 'streakBarFill 0.8s ease 0.4s both',
            }}
          />
        </div>

        <button
          onClick={handleClose}
          className="btn btn--primary"
          style={{
            width: '100%',
            padding: '0.625rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          Keep Learning →
        </button>
      </div>
    </div>
  );
}

/**
 * Module completion celebration popup with confetti.
 */
export function CompletionPopup({
  moduleName,
  show,
  onClose,
}: {
  moduleName: string;
  show: boolean;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; x: number; delay: number; color: string; rotation: number; size: number }[]
  >([]);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setClosing(false);
      // Generate confetti
      const colors = ['#6366f1', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#e879f9', '#fb923c'];
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 6,
      }));
      setConfettiPieces(pieces);
    }
  }, [show]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onClose();
    }, 300);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        animation: closing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease forwards',
      }}
    >
      {/* Confetti layer */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {confettiPieces.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: '-10px',
              width: `${p.size}px`,
              height: `${p.size * 0.6}px`,
              background: p.color,
              borderRadius: '1px',
              transform: `rotate(${p.rotation}deg)`,
              animation: `confettiFall ${2 + Math.random()}s ease-in ${p.delay}s forwards`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          padding: '2.5rem 2.5rem 2rem',
          textAlign: 'center',
          maxWidth: '380px',
          width: '90vw',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          zIndex: 1,
          animation: closing
            ? 'popupScaleOut 0.3s ease forwards'
            : 'popupScaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        }}
      >
        <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.75rem' }}>🎉</div>
        <div
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            marginBottom: '0.375rem',
          }}
        >
          Module Complete!
        </div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--accent)',
            marginBottom: '0.5rem',
          }}
        >
          {moduleName}
        </div>
        <div
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          Congratulations! You&apos;ve mastered all the concepts in this module. Ready for the next challenge?
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleClose}
            className="btn btn--ghost"
            style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem' }}
          >
            Review
          </button>
          <button
            onClick={handleClose}
            className="btn btn--primary"
            style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem', fontWeight: 600 }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
