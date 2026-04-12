import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Accounts, Settings, Transactions } from '../types';
import Mainscreen from './Mainscreen';

const {
  mockUseAuth,
  mockUseAccounts,
  mockUseTransactions,
  mockUseSettingsArray,
  mockRepository,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseAccounts: vi.fn(),
  mockUseTransactions: vi.fn(),
  mockUseSettingsArray: vi.fn(),
  mockRepository: {
    clearAccounts: vi.fn(),
    clearTransactions: vi.fn(),
    clearCategorySuggestions: vi.fn(),
    clearSettings: vi.fn(),
    putAccount: vi.fn(),
    putSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

vi.mock('./hooks/useAppData', () => ({
  useAccounts: () => mockUseAccounts(),
  useTransactions: () => mockUseTransactions(),
  useSettingsArray: () => mockUseSettingsArray(),
}));

vi.mock('./repository', () => ({
  repository: mockRepository,
}));

vi.mock('./auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('./Account.tsx', () => ({
  default: () => <div>Account header</div>,
}));

vi.mock('./WeekScreen.tsx', () => ({
  default: () => <div>Week screen</div>,
}));

vi.mock('./CreateTransaction.tsx', () => ({
  default: () => <div>Create transaction</div>,
}));

describe('Mainscreen local-first behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTransactions.mockReturnValue([] as Transactions[]);
    mockUseSettingsArray.mockReturnValue([] as Settings[]);
    mockUseAccounts.mockReturnValue([] as Accounts[]);
    mockUseAuth.mockReturnValue({
      loading: false,
      user: null,
    });
  });

  it('initializes local accounts and settings even without a signed-in user', async () => {
    render(<Mainscreen syncReady={true} />);

    await waitFor(() => {
      expect(mockRepository.putAccount).toHaveBeenCalled();
      expect(mockRepository.putSettings).toHaveBeenCalled();
    });
  });
});
