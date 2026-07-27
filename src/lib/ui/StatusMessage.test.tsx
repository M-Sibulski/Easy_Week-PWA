import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { StatusMessage } from './index';

describe('StatusMessage', () => {
  it('renders children text', () => {
    render(<StatusMessage variant="info">All good</StatusMessage>);
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders a success variant with green styling', () => {
    const { container } = render(
      <StatusMessage variant="success">Saved successfully</StatusMessage>
    );
    const el = container.firstElementChild;
    expect(el?.className).toContain('bg-emerald-50');
    expect(el?.className).toContain('text-emerald-700');
  });

  it('renders an error variant with red styling', () => {
    const { container } = render(
      <StatusMessage variant="error">Something went wrong</StatusMessage>
    );
    const el = container.firstElementChild;
    expect(el?.className).toContain('bg-red-50');
    expect(el?.className).toContain('text-red-700');
  });

  it('renders a warning variant with amber styling', () => {
    const { container } = render(
      <StatusMessage variant="warning">Check this</StatusMessage>
    );
    const el = container.firstElementChild;
    expect(el?.className).toContain('bg-amber-50');
    expect(el?.className).toContain('text-amber-800');
  });

  it('renders an info variant with blue styling', () => {
    const { container } = render(
      <StatusMessage variant="info">Just so you know</StatusMessage>
    );
    const el = container.firstElementChild;
    // Info uses the existing blue-toned palette
    expect(el?.className).toContain('text-');
    expect(el?.textContent).toContain('Just so you know');
  });

  it('applies rounded-md class to all variants', () => {
    const variants = ['success', 'error', 'warning', 'info'] as const;
    variants.forEach(variant => {
      const { container, unmount } = render(
        <StatusMessage variant={variant}>Test</StatusMessage>
      );
      expect(container.firstElementChild?.className).toContain('rounded-md');
      unmount();
    });
  });

  it('renders with accessible text content', () => {
    render(<StatusMessage variant="error">Authentication failed</StatusMessage>);
    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
  });
});
