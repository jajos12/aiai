interface ProgressBarProps {
  value: number; // 0–1
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  gradient?: [string, string];
}

const sizeMap = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  size = 'md',
  gradient,
}: ProgressBarProps) {
  const clampedValue = Math.min(1, Math.max(0, value));
  const percent = Math.round(clampedValue * 100);

  const [from, to] = gradient ?? ['var(--accent)', 'var(--accent-hover)'];

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.375rem',
            fontSize: '0.8125rem',
          }}
        >
          {label && (
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {percent}%
            </span>
          )}
        </div>
      )}
      <div className="progress-bar" style={{ height: sizeMap[size] }}>
        <div
          className="progress-bar__fill"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${from}, ${to})`,
          }}
        />
      </div>
    </div>
  );
}
