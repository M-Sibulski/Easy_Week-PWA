import type { ReactNode } from 'react';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info';

export interface StatusMessageProps {
  variant: StatusVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<StatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  error:   'bg-red-50 text-red-700 border border-red-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-300',
  info:    'bg-blue-400/70 text-white border border-white/30',
};

/**
 * StatusMessage — standardised feedback display component.
 *
 * Provides four semantic variants (success, error, warning, info) aligned
 * with the approved colour palette. Resolves FR-006 and FR-008 (SC-004).
 */
export default function StatusMessage({ variant, children, className }: StatusMessageProps) {
  return (
    <p
      className={
        'rounded-md px-3 py-2 text-sm ' +
        variantClasses[variant] +
        (className ? ' ' + className : '')
      }
    >
      {children}
    </p>
  );
}
