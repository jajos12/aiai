'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';

// Tier color mapping
const TIER_COLORS: Record<number, string> = {
  0: 'var(--tier-0)',
  1: 'var(--tier-1)',
  2: 'var(--tier-2)',
  3: 'var(--tier-3)',
  4: 'var(--tier-4)',
  5: 'var(--tier-5)',
};

interface TierCardProps {
  id: number;
  title: string;
  emoji: string;
  description: string;
  moduleCount: number;
  completedModules: number;
  isUnlocked: boolean;
  unlockRequirement?: string;
  onClick?: () => void;
}

export function TierCard({
  id,
  title,
  emoji,
  description,
  moduleCount,
  completedModules,
  isUnlocked,
  unlockRequirement,
  onClick,
}: TierCardProps) {
  const progress = moduleCount > 0 ? completedModules / moduleCount : 0;
  const tierColor = TIER_COLORS[id] ?? 'var(--accent)';
  const isCompleted = progress >= 1;

  return (
    <div
      className={`tier-card ${!isUnlocked ? 'tier-card--locked' : ''}`}
      style={{
        ['--tier-color' as string]: tierColor,
        padding: '1.5rem',
        cursor: isUnlocked ? 'pointer' : 'not-allowed',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={isUnlocked ? onClick : undefined}
      role={isUnlocked ? 'button' : undefined}
      tabIndex={isUnlocked ? 0 : undefined}
      onKeyDown={
        isUnlocked && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Tier accent background glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: `linear-gradient(180deg, ${tierColor}08 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.75rem' }}>{emoji}</span>
          <div>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: tierColor,
                marginBottom: '0.125rem',
              }}
            >
              Tier {id}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {title}
            </h3>
          </div>
        </div>

        {/* Status badge */}
        {!isUnlocked && (
          <span style={{ fontSize: '1.25rem' }}>🔒</span>
        )}
        {isCompleted && (
          <Badge variant="success">✓ Complete</Badge>
        )}
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '0 0 1rem 0',
          lineHeight: 1.5,
        }}
      >
        {isUnlocked ? description : unlockRequirement ?? `Complete previous tier to unlock`}
      </p>

      {/* Progress */}
      <div>
        <ProgressBar
          value={progress}
          showPercentage
          size="sm"
          gradient={[tierColor, tierColor]}
          label={`${completedModules}/${moduleCount} modules`}
        />
      </div>
    </div>
  );
}
