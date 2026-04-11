import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SettingsScreen from './SettingsScreen';
import { db } from '../db';

vi.mock('../db', () => ({
  db: {
    accounts: {
      clear: vi.fn(),
    },
    transactions: {
      clear: vi.fn(),
    },
    settings: {
      put: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('SettingsScreen', () => {
  const mockCallback = vi.fn();
  const mockConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', mockConfirm);
  });

  it('clears all accounts and transactions after confirmation', async () => {
    mockConfirm.mockReturnValue(true);
    vi.mocked(db.transactions.clear).mockResolvedValue(undefined);
    vi.mocked(db.accounts.clear).mockResolvedValue(undefined);
    vi.mocked(db.settings.put).mockResolvedValue(1);

    render(
      <SettingsScreen
        open={true}
        callback={mockCallback}
        settings={{ id: 3, dark: false, main_account_id: 2, week_starting_day: 4, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') }}
        accounts={[]}
      />
    );

    await userEvent.click(screen.getByTestId('clear-all-data'));

    expect(db.transactions.clear).toHaveBeenCalled();
    expect(db.accounts.clear).toHaveBeenCalled();
    expect(db.settings.put).toHaveBeenCalledWith(expect.objectContaining({
      id: 3,
      main_account_id: 0,
      week_starting_day: 2,
      dark: true,
      createdAt: new Date('2024-01-01'),
    }));
    expect(mockCallback).toHaveBeenCalled();
  });

  it('does nothing when clear all data is cancelled', async () => {
    mockConfirm.mockReturnValue(false);

    render(
      <SettingsScreen
        open={true}
        callback={mockCallback}
        settings={{ id: 1, dark: true, main_account_id: 1, week_starting_day: 2, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') }}
        accounts={[]}
      />
    );

    await userEvent.click(screen.getByTestId('clear-all-data'));

    expect(db.transactions.clear).not.toHaveBeenCalled();
    expect(db.accounts.clear).not.toHaveBeenCalled();
    expect(db.settings.put).not.toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });
});