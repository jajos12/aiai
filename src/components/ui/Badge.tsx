interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variantClass = variant === 'default' ? 'badge' : `badge badge--${variant}`;

  return (
    <span className={`${variantClass} ${className}`}>
      {children}
    </span>
  );
}
