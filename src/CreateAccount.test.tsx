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

    render(<CreateAccount open={true} callback={mockCallback} settings={{ id: 1, main_account_id: 1, dark: true }} />);

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
    expect(db.settings.update).toHaveBeenCalledWith(1, { main_account_id: 1 });
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
});