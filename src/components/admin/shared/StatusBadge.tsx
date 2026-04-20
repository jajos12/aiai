'use client';

type Status =
  | 'draft'
  | 'published'
  | 'archived'
  | 'active'
  | 'inactive'
  /** Email verification (users table) */
  | 'verified_email'
  | 'pending_email';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { bg: string; color: string; label: string }> = {
  draft: { bg: 'var(--bg-hover)', color: 'var(--text-secondary)', label: 'Draft' },
  published: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-success)', label: 'Published' },
  archived: { bg: 'rgba(107, 114, 128, 0.15)', color: 'var(--text-muted)', label: 'Archived' },
  active: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-success)', label: 'Active' },
  inactive: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)', label: 'Inactive' },
  verified_email: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-success)', label: 'Email verified' },
  pending_email: { bg: 'rgba(245, 158, 11, 0.18)', color: 'var(--color-warning)', label: 'Email pending' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span
      className="inline-flex items-center rounded-full font-medium"
      style={{
        background: config.bg,
        color: config.color,
        fontSize: size === 'sm' ? '11px' : '12px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
      }}
    >
      <span
        className="mr-1.5 rounded-full"
        style={{
          width: '6px',
          height: '6px',
          background: config.color,
        }}
      />
      {config.label}
    </span>
  );
}
