import type { ButtonHTMLAttributes } from 'react';

export interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * SubmitButton — standard form submission button with a checkmark icon.
 * Applies the approved `btn-submit-blue` interaction pattern.
 */
export default function SubmitButton({
  type = 'submit',
  className,
  children,
  ...rest
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      className={
        'cursor-pointer h-full p-2 rounded-md hover:bg-blue-400 flex justify-center ' +
        (className ?? '')
      }
      {...rest}
    >
      {children ?? (
        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb">
          <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
        </svg>
      )}
    </button>
  );
}
