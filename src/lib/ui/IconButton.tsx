import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element to render inside the button */
  children: ReactNode;
  /**
   * Visual variant.
   * - 'primary' (default): blue hover pattern (btn-icon-blue)
   * - 'danger': uses blue hover on a blue surface — delete icon affordance
   */
  variant?: 'primary' | 'danger';
}

/**
 * IconButton — standardised icon action button.
 * Applies the approved `btn-icon-blue` interaction pattern from the design system.
 */
export default function IconButton({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  void variant; // variant reserved for future differentiation; both map to blue pattern currently

  return (
    <button
      type={type}
      className={
        'cursor-pointer h-full p-1 rounded-md hover:bg-blue-400 ' +
        (className ?? '')
      }
      {...rest}
    >
      {children}
    </button>
  );
}
