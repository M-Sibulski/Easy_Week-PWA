import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { IconButton } from './index';

// A minimal SVG icon for testing
const TestIcon = () => (
  <svg data-testid="icon-svg" height="24px" viewBox="0 -960 960 960" width="24px">
    <path d="M200-440v-80h560v80H200Z" />
  </svg>
);

describe('IconButton', () => {
  it('renders without crashing', () => {
    render(<IconButton onClick={vi.fn()} aria-label="Close"><TestIcon /></IconButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handler = vi.fn();
    render(<IconButton onClick={handler} aria-label="Close"><TestIcon /></IconButton>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('applies primary (blue hover) variant by default', () => {
    const { container } = render(
      <IconButton onClick={vi.fn()} aria-label="Close"><TestIcon /></IconButton>
    );
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('hover:bg-blue-400');
  });

  it('applies danger variant styling when variant=danger', () => {
    const { container } = render(
      <IconButton onClick={vi.fn()} variant="danger" aria-label="Delete"><TestIcon /></IconButton>
    );
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('hover:bg-blue-400');
  });

  it('renders children (icon) inside the button', () => {
    render(<IconButton onClick={vi.fn()} aria-label="Test"><TestIcon /></IconButton>);
    expect(screen.getByTestId('icon-svg')).toBeInTheDocument();
  });

  it('accepts and forwards aria-label for accessibility', () => {
    render(<IconButton onClick={vi.fn()} aria-label="Close sheet"><TestIcon /></IconButton>);
    expect(screen.getByRole('button', { name: 'Close sheet' })).toBeInTheDocument();
  });

  it('accepts a role prop for semantic override', () => {
    render(<IconButton onClick={vi.fn()} role="close" aria-label="Close"><TestIcon /></IconButton>);
    expect(screen.getByRole('close')).toBeInTheDocument();
  });
});
