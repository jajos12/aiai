import type { ReactNode, CSSProperties } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  style,
  type = 'button',
}: ButtonProps) {
  const variantClass = `btn btn--${variant}`;
  const sizeClass = size !== 'md' ? `btn--${size}` : '';

  return (
    <button
      className={`${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      type={type}
    >
      {children}
    </button>
  );
}
