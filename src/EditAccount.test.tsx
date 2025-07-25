import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditAccount from './EditAccount.tsx';
import { Accounts, db, Settings } from '../db.ts';
import '@testing-library/jest-dom/vitest';

vi.mock('../db.ts', () => {
  return {
    db: {
      accounts: {
        put: vi.fn(),
        delete: vi.fn(),
      },
      settings: {
        update: vi.fn(),
      },
      transactions: {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([{ id: 101 }, { id: 102 }]),
          })),
        })),
        delete: vi.fn(),
      },
    },
  };
});

describe('EditAccount', () => {
  const mockCallback = vi.fn();
  const mockAccount: Accounts = {
    id: 1,
    name: 'Vacation Fund',
    type: 'Savings',
    dateCreated: new Date('2024-01-01'),
    goalDate: new Date('2025-12-31'),
    goalValue: 5000,
  };
  const mockSettings: Settings = {
    id: 1,
    main_account_id: 1,
    dark: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form when open is true', async () => {
    render(<EditAccount open={true} callback={mockCallback} settings={mockSettings} account={mockAccount} />);
    expect(await screen.findByTestId('account-form')).toBeInTheDocument();
  });

  it('closes form on close button click', async () => {
    render(<EditAccount open={true} callback={mockCallback} settings={mockSettings} account={mockAccount} />);
    await userEvent.click(screen.getByRole('close'));
    expect(mockCallback).toHaveBeenCalled();
  });

  it('submits edited Savings account and updates main account setting', async () => {
    vi.mocked(db.accounts.put).mockResolvedValue(1);
    vi.mocked(db.settings.update).mockResolvedValue(1);

    render(<EditAccount open={true} callback={mockCallback} settings={mockSettings} account={mockAccount} />);

    await userEvent.clear(screen.getByDisplayValue('Vacation Fund'));
    await userEvent.type(screen.getByDisplayValue(''), 'Updated Fund');
    await userEvent.click(screen.getByTestId('submit'));

    
    expect(db.accounts.put).toHaveBeenCalledWith(
    expect.objectContaining({
        id: 1,
        name: 'Updated Fund',
        type: 'Savings',
        goalValue: 5000,
        goalDate: new Date('2025-12-31'),
    })
    );
    expect(db.settings.update).toHaveBeenCalledWith(1, { main_account_id: 1 });
    expect(mockCallback).toHaveBeenCalled();
    
  });

  it('submits edited non-Savings account and skips goal fields', async () => {
    const nonSavingsAccount: Accounts = { ...mockAccount, type: 'Everyday' };

    render(<EditAccount open={true} callback={mockCallback} settings={undefined} account={nonSavingsAccount} />);

    await userEvent.selectOptions(screen.getByDisplayValue('Everyday'), 'Everyday');
    await userEvent.click(screen.getByTestId('submit'));

    expect(db.accounts.put).toHaveBeenCalledWith(
    expect.objectContaining({
        id: 1,
        name: 'Vacation Fund',
        type: 'Everyday',
    })
    );
  });

  it('deletes account and related transactions', async () => {
    render(<EditAccount open={true} callback={mockCallback} settings={mockSettings} account={mockAccount} />);
    await userEvent.click(screen.getByTestId('delete'));

    
    expect(db.accounts.delete).toHaveBeenCalledWith(1);
    expect(db.transactions.delete).toHaveBeenCalledWith(101);
    expect(db.transactions.delete).toHaveBeenCalledWith(102);
    expect(mockCallback).toHaveBeenCalled();
    
  });
});