import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import CreateAccount from './CreateAccount';
import { db } from '../db.ts';
import "@testing-library/jest-dom/vitest";

vi.mock('../db.ts', () => {
  return {
    db: {
      accounts: {
        add: vi.fn(),
      },
      settings: {
        update: vi.fn(),
      },
    },
  };
});

describe('CreateAccount', () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the form when open is true', async () => {
    render(<CreateAccount open={true} callback={mockCallback} settings={undefined} />);
    expect(screen.getByTestId('account-form')).toBeInTheDocument()
    
  });

  it('clears fields when clicking clear', async () => {
    render(<CreateAccount open={true} callback={mockCallback} settings={undefined} />);
    await userEvent.type(screen.getByTestId('name-input'), 'Vacation');
    await userEvent.click(screen.getByRole('clear'));
    expect(screen.getByTestId('name-input')).toHaveValue('');
  });

  it('closes the form when clicking close', async () => {
    render(<CreateAccount open={true} callback={mockCallback} settings={undefined} />);
    await userEvent.click(screen.getByRole('close'));
   expect(mockCallback).toHaveBeenCalled();
    
  });

  it('creates a Savings account and sets main_account_id', async () => {
    vi.mocked(db.accounts.add).mockResolvedValue(1);
    vi.mocked(db.settings.update).mockResolvedValue(1);

    render(<CreateAccount open={true} callback={mockCallback} settings={{ id: 1, syncId: 'set-main', main_account_id: 1, dark: true, week_starting_day: 1, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') }} />);

    await userEvent.type(screen.getByTestId('name-input'), 'Emergency Fund');
    await userEvent.selectOptions(screen.getByTestId('type-input'), 'Savings');
    await userEvent.type(screen.getByTestId('date-input'), '2025-12-31');
    await userEvent.type(screen.getByTestId('value-input'), '$1,500abc');
    await userEvent.click(screen.getByTestId('main-input'));

    await userEvent.click(screen.getByTestId('submit'));

    expect(db.accounts.add).toHaveBeenCalledWith(
    expect.objectContaining({
        name: 'Emergency Fund',
        type: 'Savings',
        goalDate: new Date('2025-12-31'),
        goalValue: 1500,
    })
    );
    expect(db.settings.update).toHaveBeenCalledWith(1, expect.objectContaining({ main_account_id: 1 }));
    expect(mockCallback).toHaveBeenCalled();
  });

  it('creates a non-Savings account without optional fields', async () => {
    vi.mocked(db.accounts.add).mockResolvedValue(2);

    render(<CreateAccount open={true} callback={mockCallback} settings={undefined} />);
    await userEvent.type(screen.getByTestId('name-input'), 'Cash Wallet');
    await userEvent.selectOptions(screen.getByTestId('type-input'), 'Everyday');
    await userEvent.click(screen.getByTestId('submit'));

    
    expect(db.accounts.add).toHaveBeenCalledWith(
    expect.objectContaining({
        name: 'Cash Wallet',
        type: 'Everyday',
    })
    );
  });

  // US1 Regression: bottom-sheet structural consistency
  describe('US1: bottom-sheet structure consistency', () => {
    it('renders a heading element for the sheet title', () => {
      render(<CreateAccount open={true} callback={mockCallback} settings={undefined} />);
      expect(screen.getByRole('heading', { name: /new account/i })).toBeInTheDocument();
    });

    it('renders a close button accessible by role', () => {
      render(<CreateAccount open={true} callback={mockCallback} settings={undefined} />);
      expect(screen.getByRole('close')).toBeInTheDocument();
    });

    it('sheet does not use translate-y-100 (defect D-001 regression)', () => {
      const { container } = render(<CreateAccount open={true} callback={mockCallback} settings={undefined} />);
      const form = container.querySelector('[data-testid="account-form"]');
      expect(form?.className).not.toContain('translate-y-100');
    });

    it('form inputs have a visible focus ring class (FR-007)', () => {
      render(<CreateAccount open={true} callback={mockCallback} settings={undefined} />);
      const nameInput = screen.getByTestId('name-input');
      expect(nameInput.className).toContain('focus:ring-2');
    });

    it('sheet uses translate-y-full for off-canvas state (not translate-y-100)', () => {
      const { rerender, container } = render(
        <CreateAccount open={true} callback={mockCallback} settings={undefined} />
      );
      rerender(<CreateAccount open={false} callback={mockCallback} settings={undefined} />);
      const sheet = container.querySelector('[data-testid="account-form"]');
      // After close, sheet should use translate-y-full for correct off-canvas
      if (sheet) {
        expect(sheet.className).toContain('translate-y-full');
        expect(sheet.className).not.toContain('translate-y-100');
      }
    });
  });
});