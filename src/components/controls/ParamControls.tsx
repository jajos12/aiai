'use client';

interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  showValue?: boolean;
  color?: string;
}

export function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  showValue = true,
  color = 'var(--accent)',
}: ParamSliderProps) {
  const fraction = (value - min) / (max - min);

  return (
    <div style={{ width: '100%' }}>
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.375rem',
        }}
      >
        <label
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
        {showValue && (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
            }}
          >
            {value.toFixed(step < 1 ? 1 : 0)}
            {unit ? ` ${unit}` : ''}
          </span>
        )}
      </div>

      {/* Slider */}
      <div style={{ position: 'relative', height: '1.5rem', display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            appearance: 'none',
            WebkitAppearance: 'none',
            borderRadius: '3px',
            outline: 'none',
            cursor: 'pointer',
            background: `linear-gradient(to right, ${color} 0%, ${color} ${fraction * 100}%, var(--bg-hover) ${fraction * 100}%, var(--bg-hover) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

interface ParamStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function ParamStepper({
  label,
  value,
  min,
  max,
  step: stepAmount = 1,
  onChange,
}: ParamStepperProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}
    >
      <label
        style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button
          onClick={() => onChange(Math.max(min, value - stepAmount))}
          disabled={value <= min}
          style={{
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            color: value <= min ? 'var(--text-muted)' : 'var(--text-primary)',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value <= min ? 'not-allowed' : 'pointer',
          }}
        >
          −
        </button>
        <span
          style={{
            minWidth: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
          }}
        >
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + stepAmount))}
          disabled={value >= max}
          style={{
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            color: value >= max ? 'var(--text-muted)' : 'var(--text-primary)',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value >= max ? 'not-allowed' : 'pointer',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface ParamToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function ParamToggle({ label, enabled, onChange }: ParamToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}
    >
      <label
        style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </label>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        style={{
          position: 'relative',
          width: '2.5rem',
          height: '1.375rem',
          borderRadius: '0.6875rem',
          border: 'none',
          background: enabled ? 'var(--accent)' : 'var(--bg-hover)',
          cursor: 'pointer',
          transition: 'background var(--transition-fast)',
          padding: 0,
          boxShadow: enabled ? '0 0 8px rgba(99, 102, 241, 0.3)' : 'none',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: enabled ? 'calc(100% - 1.125rem - 2px)' : '2px',
            width: '1.125rem',
            height: '1.125rem',
            borderRadius: '50%',
            background: 'white',
            transition: 'left var(--transition-fast)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}
