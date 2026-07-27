import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { FormField } from './index';

describe('FormField', () => {
  it('renders an input element by default', () => {
    render(<FormField data-testid="field" />);
    expect(screen.getByTestId('field')).toBeInTheDocument();
  });

  it('applies standard field background styling', () => {
    render(<FormField data-testid="field" />);
    const field = screen.getByTestId('field');
    expect(field.className).toContain('bg-blue-300');
  });

  it('applies hover background styling', () => {
    render(<FormField data-testid="field" />);
    const field = screen.getByTestId('field');
    expect(field.className).toContain('hover:bg-blue-200');
  });

  it('applies focus ring styling for keyboard visibility', () => {
    render(<FormField data-testid="field" />);
    const field = screen.getByTestId('field');
    // Focus ring must be visible — keyboard accessibility requirement
    expect(field.className).toContain('focus:ring-2');
  });

  it('applies rounded styling', () => {
    render(<FormField data-testid="field" />);
    const field = screen.getByTestId('field');
    expect(field.className).toContain('rounded-md');
  });

  it('renders as a select when as="select" is passed', () => {
    render(
      <FormField as="select" data-testid="select-field">
        <option value="a">A</option>
      </FormField>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('forwards value and onChange to the underlying input', async () => {
    const handleChange = vi.fn();
    render(
      <FormField
        data-testid="controlled-field"
        value=""
        onChange={handleChange}
      />
    );
    await userEvent.type(screen.getByTestId('controlled-field'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('forwards placeholder to the underlying input', () => {
    render(<FormField data-testid="field" placeholder="Enter name" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });
});
