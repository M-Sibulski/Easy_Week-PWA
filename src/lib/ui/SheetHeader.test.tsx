import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { SheetHeader } from './index';

describe('SheetHeader', () => {
  it('renders the title text', () => {
    render(<SheetHeader title="My Sheet" />);
    expect(screen.getByText('My Sheet')).toBeInTheDocument();
  });

  it('renders title centered', () => {
    render(<SheetHeader title="Centered Title" />);
    const title = screen.getByText('Centered Title');
    expect(title.className).toContain('text-center');
  });

  it('renders leftSlot content when provided', () => {
    render(<SheetHeader title="Header" leftSlot={<button role="clear">Clear</button>} />);
    expect(screen.getByRole('clear')).toBeInTheDocument();
  });

  it('renders rightSlot content when provided', () => {
    render(<SheetHeader title="Header" rightSlot={<button role="close">Close</button>} />);
    expect(screen.getByRole('close')).toBeInTheDocument();
  });

  it('renders both left and right slots when provided', () => {
    render(
      <SheetHeader
        title="Full Header"
        leftSlot={<button role="clear">Clear</button>}
        rightSlot={<button role="close">Close</button>}
      />
    );
    expect(screen.getByRole('clear')).toBeInTheDocument();
    expect(screen.getByRole('close')).toBeInTheDocument();
    expect(screen.getByText('Full Header')).toBeInTheDocument();
  });

  it('uses a heading element for the title', () => {
    render(<SheetHeader title="Accessible Header" />);
    expect(screen.getByRole('heading', { name: 'Accessible Header' })).toBeInTheDocument();
  });
});
