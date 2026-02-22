import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: CSSProperties;
  onClick?: () => void;
}

const paddingMap = {
  none: '0',
  sm: '0.75rem',
  md: '1.25rem',
  lg: '1.75rem',
};

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  style,
  onClick,
}: CardProps) {
  const variantClass =
    variant === 'elevated'
      ? 'card card--elevated'
      : variant === 'interactive'
        ? 'card card--interactive'
        : 'card';

  return (
    <div
      className={`${variantClass} ${className}`}
      style={{ padding: paddingMap[padding], ...style }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
