import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { SubmitButton } from './index';

describe('SubmitButton', () => {
  it('renders a button with type=submit by default', () => {
    render(<SubmitButton />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'submit');
  });

  it('renders a checkmark icon inside the button', () => {
    const { container } = render(<SubmitButton />);
    // Should contain an SVG for the checkmark
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies standard submit button styling', () => {
    const { container } = render(<SubmitButton />);
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('hover:bg-blue-400');
    expect(btn?.className).toContain('justify-center');
  });

  it('can be disabled', () => {
    render(<SubmitButton disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('accepts data-testid for test targeting', () => {
    render(<SubmitButton data-testid="my-submit" />);
    expect(screen.getByTestId('my-submit')).toBeInTheDocument();
  });

  it('calls onClick when clicked (if not submit context)', async () => {
    const handler = vi.fn();
    render(<SubmitButton onClick={handler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalled();
  });
});
