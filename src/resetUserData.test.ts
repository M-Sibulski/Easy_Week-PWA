import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IRepository } from './repository';
import { resetCurrentUserData } from './resetUserData';

function createDeleteQuery(error: null | Error = null) {
  return {
    eq: vi.fn().mockResolvedValue({ error }),
  };
}

describe('resetCurrentUserData', () => {
  const repository = {
    clearTransactions: vi.fn(),
    clearAccounts: vi.fn(),
    clearCategorySuggestions: vi.fn(),
    clearSettings: vi.fn(),
    putAccount: vi.fn(),
    putSettings: vi.fn(),
  } as unknown as Pick<
    IRepository,
    'clearTransactions' | 'clearAccounts' | 'clearCategorySuggestions' | 'clearSettings' | 'putAccount' | 'putSettings'
  >;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(repository.clearTransactions).mockResolvedValue(undefined);
    vi.mocked(repository.clearAccounts).mockResolvedValue(undefined);
    vi.mocked(repository.clearCategorySuggestions).mockResolvedValue(undefined);
    vi.mocked(repository.clearSettings).mockResolvedValue(undefined);
    vi.mocked(repository.putAccount).mockResolvedValue(1);
    vi.mocked(repository.putSettings).mockResolvedValue(undefined);
  });

  it('hard-deletes the current user remote data, clears local tables, and recreates the starter pack', async () => {
    const transactionsDelete = createDeleteQuery();
    const categorySuggestionsDelete = createDeleteQuery();
    const accountsDelete = createDeleteQuery();
    const settingsDelete = createDeleteQuery();

    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
      from: vi.fn((table: string) => ({
        delete: vi.fn(() => {
          if (table === 'transactions') return transactionsDelete;
          if (table === 'category_suggestions') return categorySuggestionsDelete;
          if (table === 'accounts') return accountsDelete;
          if (table === 'settings') return settingsDelete;
          throw new Error(`Unexpected table ${table}`);
        }),
      })),
    };

    const createSyncId = vi
      .fn()
      .mockReturnValueOnce('acc-main-generated')
      .mockReturnValueOnce('acc-savings-generated')
      .mockReturnValueOnce('set-generated');

    await resetCurrentUserData({
      repository,
      supabase,
      createSyncId,
    });

    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(supabase.from).toHaveBeenCalledWith('category_suggestions');
    expect(supabase.from).toHaveBeenCalledWith('accounts');
    expect(supabase.from).toHaveBeenCalledWith('settings');
    expect(transactionsDelete.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(categorySuggestionsDelete.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(accountsDelete.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(settingsDelete.eq).toHaveBeenCalledWith('user_id', 'user-1');

    expect(repository.clearTransactions).toHaveBeenCalled();
    expect(repository.clearAccounts).toHaveBeenCalled();
    expect(repository.clearCategorySuggestions).toHaveBeenCalled();
    expect(repository.clearSettings).toHaveBeenCalled();

    expect(repository.putAccount).toHaveBeenCalledTimes(2);
    expect(repository.putAccount).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      syncId: 'acc-main-generated',
      name: 'Main Account',
      type: 'Everyday',
    }));
    expect(repository.putAccount).toHaveBeenCalledWith(expect.objectContaining({
      id: 2,
      syncId: 'acc-savings-generated',
      name: 'Savings',
      type: 'Savings',
    }));
    expect(repository.putSettings).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      syncId: 'set-generated',
      main_account_id: 0,
      dark: true,
      week_starting_day: 2,
    }));
  });

  it('keeps local data intact when remote deletion fails', async () => {
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
      from: vi.fn(() => ({
        delete: vi.fn(() => createDeleteQuery(new Error('remote failure'))),
      })),
    };

    await expect(resetCurrentUserData({
      repository,
      supabase,
      createSyncId: vi.fn(),
    })).rejects.toThrow('remote failure');

    expect(repository.clearTransactions).not.toHaveBeenCalled();
    expect(repository.clearAccounts).not.toHaveBeenCalled();
    expect(repository.clearCategorySuggestions).not.toHaveBeenCalled();
    expect(repository.clearSettings).not.toHaveBeenCalled();
    expect(repository.putAccount).not.toHaveBeenCalled();
    expect(repository.putSettings).not.toHaveBeenCalled();
  });
});
