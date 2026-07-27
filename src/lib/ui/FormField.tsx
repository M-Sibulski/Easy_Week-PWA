import { forwardRef } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { as?: 'input'; children?: never };
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { as: 'select'; children?: ReactNode };

export type FormFieldProps = InputProps | SelectProps;

/**
 * FormField — standardised form input or select element.
 *
 * Applies the approved `field-blue-surface` design pattern and adds a visible
 * focus ring (`focus:ring-2 ring-blue-200`) for keyboard accessibility (FR-007).
 */
const FormField = forwardRef<HTMLInputElement | HTMLSelectElement, FormFieldProps>(
  ({ as: Tag = 'input', className, children, ...rest }, ref) => {
    const baseClass =
      'bg-blue-300 rounded-md hover:bg-blue-200 p-1 focus:outline-none focus:ring-2 ring-blue-200 ';

    if (Tag === 'select') {
      const { ...selectRest } = rest as SelectHTMLAttributes<HTMLSelectElement>;
      return (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          className={baseClass + (className ?? '')}
          {...selectRest}
        >
          {children}
        </select>
      );
    }

    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        className={baseClass + (className ?? '')}
        {...(rest as InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
