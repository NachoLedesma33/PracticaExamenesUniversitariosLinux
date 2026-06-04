import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const colors = {
  default: 'bg-[var(--badge-default-bg)] text-[var(--badge-default-text)]',
  success: 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]',
  warning: 'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]',
  danger: 'bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)]',
  info: 'bg-[var(--badge-info-bg)] text-[var(--badge-info-text)]',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${colors[variant]}`}>
      {children}
    </span>
  );
}
