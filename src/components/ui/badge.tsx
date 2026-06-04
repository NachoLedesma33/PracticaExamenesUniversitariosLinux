import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const colors = {
  default: 'bg-surface-700 text-surface-300',
  success: 'bg-green-900/60 text-green-400',
  warning: 'bg-yellow-900/60 text-yellow-400',
  danger: 'bg-red-900/60 text-red-400',
  info: 'bg-blue-900/60 text-blue-400',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${colors[variant]}`}>
      {children}
    </span>
  );
}
