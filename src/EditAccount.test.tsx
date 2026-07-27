import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditAccount from './EditAccount.tsx';
import { db } from '../db.ts';
import { Accounts, Settings } from '../types.ts';
import '@testing-library/jest-dom/vitest';

vi.mock('../db.ts', () => {
  return {
    db: {
      accounts: {
        put: vi.fn(),
        update: vi.fn(),
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
        update: vi.fn(),
      },
    },
  };
});

describe('EditAccount', () => {
  const mockCallback = vi.fn();
  const mockAccount: Accounts = {
    id: 1,
    syncId: 'acc-vacation',
    name: 'Vacation Fund',
    type: 'Savings',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    goalDate: new Date('2025-12-31'),
    goalValue: 5000,
  };
  const mockSettings: Settings = {
    id: 1,
    syncId: 'set-main',
    main_account_id: 1,
    dark: false,
    week_starting_day: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
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
    expect(db.settings.update).toHaveBeenCalledWith(1, expect.objectContaining({ main_account_id: 1 }));
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

    
    expect(db.accounts.update).toHaveBeenCalledWith(1, expect.objectContaining({
      deletedAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }));
    expect(db.transactions.update).toHaveBeenCalledWith(101, expect.objectContaining({
      deletedAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }));
    expect(db.transactions.update).toHaveBeenCalledWith(102, expect.objectContaining({
      deletedAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }));
    expect(mockCallback).toHaveBeenCalled();
    
  });

  // US1 Regression: edit/settings sheet structural consistency
  describe('US1: edit sheet structure consistency', () => {
    it('renders a heading element for the sheet title', async () => {
      render(<EditAccount open={true} callback={mockCallback} settings={mockSettings} account={mockAccount} />);
      expect(await screen.findByRole('heading', { name: /edit account/i })).toBeInTheDocument();
    });

    it('renders a close button accessible by role', async () => {
      render(<EditAccount open={true} callback={mockCallback} settings={mockSettings} account={mockAccount} />);
      await screen.findByTestId('account-form');
      expect(screen.getByRole('close')).toBeInTheDocument();
    });

    it('sheet does not use translate-y-100 (defect D-001 regression)', async () => {
      render(
        <EditAccount open={true} callback={mockCallback} settings={mockSettings} account={mockAccount} />
      );
      const form = await screen.findByTestId('account-form');
      expect(form.className).not.toContain('translate-y-100');
    });

    it('delete button uses approved blue hover pattern (defect D-002 regression)', async () => {
      render(<EditAccount open={true} callback={mockCallback} settings={mockSettings} account={mockAccount} />);
      await screen.findByTestId('account-form');
      const deleteBtn = screen.getByTestId('delete');
      // D-002 fix: delete button must use hover:bg-blue-400 (not hover:bg-blue-500)
      expect(deleteBtn.className).toContain('hover:bg-blue-400');
    });
  });
});