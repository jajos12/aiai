'use client';

import type { ExplainLevel } from '@/types/tutor';

interface ExplanationLevelToggleProps {
  level: ExplainLevel;
  onChange: (level: ExplainLevel) => void;
  isLoading?: boolean;
}

const LEVELS: { value: ExplainLevel; label: string; title: string }[] = [
  { value: 'eli5', label: 'ELI5', title: 'Explain like I\'m 5 — simple analogies, no jargon' },
  { value: 'standard', label: 'Standard', title: 'Default explanation' },
  { value: 'expert', label: 'Expert', title: 'Formal definitions, mathematical depth' },
];

export function ExplanationLevelToggle({ level, onChange, isLoading }: ExplanationLevelToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        Level
      </span>
      <div
        style={{
          display: 'flex',
          gap: '2px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px',
        }}
      >
        {LEVELS.map((l) => (
          <button
            key={l.value}
            title={l.title}
            disabled={isLoading}
            onClick={() => onChange(l.value)}
            style={{
              padding: '0.2rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: isLoading ? 'wait' : 'pointer',
              transition: 'all 150ms ease',
              background: level === l.value ? 'var(--accent)' : 'transparent',
              color: level === l.value ? '#fff' : 'var(--text-muted)',
              boxShadow: level === l.value ? '0 1px 4px rgba(99,102,241,0.35)' : 'none',
              opacity: isLoading && level !== l.value ? 0.5 : 1,
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
      {isLoading && (
        <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontStyle: 'italic' }}>
          Generating…
        </span>
      )}
    </div>
  );
}
