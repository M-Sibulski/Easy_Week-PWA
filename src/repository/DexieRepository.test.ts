import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Accounts, CategorySuggestion, Settings, Transactions } from '../../types';
import { db } from '../../db';
import { DexieRepository } from './DexieRepository';

vi.mock('../../db', () => ({
  db: {
    accounts: {
      toArray: vi.fn(),
      get: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    },
    transactions: {
      where: vi.fn(),
      toArray: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    },
    categorySuggestions: {
      where: vi.fn(),
      toArray: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      clear: vi.fn(),
    },
    settings: {
      toArray: vi.fn(),
      put: vi.fn(),
      update: vi.fn(),
      clear: vi.fn(),
    },
  },
}));

vi.mock('../../syncIds', () => ({
  createSyncId: vi.fn((prefix: string) => `${prefix}-generated`),
}));

describe('DexieRepository', () => {
  const repository = new DexieRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds accounts with generated sync and timestamp fields when they are missing', async () => {
    vi.mocked(db.accounts.add).mockResolvedValue(5);

    const result = await repository.addAccount({
      name: 'Emergency Fund',
      type: 'Savings',
      goalValue: 1000,
      goalDate: new Date('2025-12-31'),
    });

    expect(result).toBe(5);
    expect(db.accounts.add).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Emergency Fund',
      type: 'Savings',
      syncId: 'acc-generated',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }));
  });

  it('reads visible transactions through the indexed name query and sorts by date', async () => {
    const transactions: Transactions[] = [
      {
        id: 1,
        syncId: 'txn-1',
        value: 10,
        type: 'Income',
        name: 'Salary',
        account_id: 1,
        account_sync_id: 'acc-main',
        date: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];
    const sortBy = vi.fn().mockResolvedValue(transactions);
    const notEqual = vi.fn().mockReturnValue({ sortBy });
    vi.mocked(db.transactions.where).mockReturnValue({ notEqual } as unknown as ReturnType<typeof db.transactions.where>);

    const result = await repository.getTransactions();

    expect(db.transactions.where).toHaveBeenCalledWith('name');
    expect(notEqual).toHaveBeenCalledWith('');
    expect(sortBy).toHaveBeenCalledWith('date');
    expect(result).toEqual(transactions);
  });

  it('returns the first settings row when loading settings', async () => {
    const settings: Settings[] = [
      {
        id: 1,
        syncId: 'set-main',
        dark: true,
        main_account_id: 1,
        main_account_sync_id: 'acc-main',
        week_starting_day: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        syncId: 'set-secondary',
        dark: false,
        main_account_id: 2,
        main_account_sync_id: 'acc-secondary',
        week_starting_day: 1,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];
    vi.mocked(db.settings.toArray).mockResolvedValue(settings);

    const result = await repository.getSettings();

    expect(result).toEqual(settings[0]);
  });

  it('updates settings with a fresh updatedAt timestamp', async () => {
    vi.mocked(db.settings.update).mockResolvedValue(1);

    await repository.updateSettings(7, { dark: false, week_starting_day: 5 });

    expect(db.settings.update).toHaveBeenCalledWith(7, expect.objectContaining({
      dark: false,
      week_starting_day: 5,
      updatedAt: expect.any(Date),
    }));
  });

  it('puts settings while refreshing updatedAt and filling a missing sync id', async () => {
    vi.mocked(db.settings.put).mockResolvedValue(1);

    await repository.putSettings({
      id: 1,
      syncId: undefined as unknown as string,
      dark: true,
      main_account_id: 0,
      main_account_sync_id: undefined,
      week_starting_day: 2,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });

    expect(db.settings.put).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      syncId: 'set-generated',
      createdAt: new Date('2024-01-01'),
      updatedAt: expect.any(Date),
    }));
  });

  it('loads account-scoped transactions through the account_id index', async () => {
    const transactions: Transactions[] = [
      {
        id: 2,
        syncId: 'txn-2',
        value: -20,
        type: 'Expense',
        name: 'Coffee',
        account_id: 4,
        account_sync_id: 'acc-4',
        date: new Date('2024-01-02'),
        category: 'Food',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];
    const toArray = vi.fn().mockResolvedValue(transactions);
    const equals = vi.fn().mockReturnValue({ toArray });
    vi.mocked(db.transactions.where).mockReturnValue({ equals } as unknown as ReturnType<typeof db.transactions.where>);

    const result = await repository.getTransactionsByAccountId(4);

    expect(db.transactions.where).toHaveBeenCalledWith('account_id');
    expect(equals).toHaveBeenCalledWith(4);
    expect(toArray).toHaveBeenCalled();
    expect(result).toEqual(transactions);
  });

  it('passes through account retrieval by id', async () => {
    const account: Accounts = {
      id: 9,
      syncId: 'acc-9',
      name: 'Travel',
      type: 'Everyday',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    vi.mocked(db.accounts.get).mockResolvedValue(account);

    const result = await repository.getAccountById(9);

    expect(db.accounts.get).toHaveBeenCalledWith(9);
    expect(result).toEqual(account);
  });

  it('filters soft-deleted accounts out of regular account reads', async () => {
    vi.mocked(db.accounts.toArray).mockResolvedValue([
      {
        id: 1,
        syncId: 'acc-visible',
        name: 'Visible',
        type: 'Everyday',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 2,
        syncId: 'acc-deleted',
        name: 'Deleted',
        type: 'Savings',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: new Date('2024-01-03'),
      },
    ] as Accounts[]);

    const result = await repository.getAccounts();

    expect(result).toHaveLength(1);
    expect(result[0]?.syncId).toBe('acc-visible');
  });

  it('soft-deletes transactions so tombstones can sync', async () => {
    vi.mocked(db.transactions.update).mockResolvedValue(1);

    await repository.deleteTransaction(12);

    expect(db.transactions.update).toHaveBeenCalledWith(12, expect.objectContaining({
      deletedAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }));
  });

  it('loads category suggestions by token through the token index', async () => {
    const suggestions: CategorySuggestion[] = [
      {
        id: 1,
        syncId: 'cat-1',
        token: 'uber',
        category: 'Transport',
        score: 3,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];
    const toArray = vi.fn().mockResolvedValue(suggestions);
    const anyOf = vi.fn().mockReturnValue({ toArray });
    vi.mocked(db.categorySuggestions.where).mockReturnValue({ anyOf } as unknown as ReturnType<typeof db.categorySuggestions.where>);

    const result = await repository.getCategorySuggestionsByTokens(['uber', 'eats']);

    expect(db.categorySuggestions.where).toHaveBeenCalledWith('token');
    expect(anyOf).toHaveBeenCalledWith(['uber', 'eats']);
    expect(toArray).toHaveBeenCalled();
    expect(result).toEqual(suggestions);
  });

  it('adds category suggestions with generated sync and timestamp fields when missing', async () => {
    vi.mocked(db.categorySuggestions.add).mockResolvedValue(6);

    const result = await repository.addCategorySuggestion({
      token: 'uber',
      category: 'Transport',
      score: 1,
    });

    expect(result).toBe(6);
    expect(db.categorySuggestions.add).toHaveBeenCalledWith(expect.objectContaining({
      token: 'uber',
      category: 'Transport',
      score: 1,
      syncId: 'cat-generated',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    }));
  });

  it('puts category suggestions while refreshing updatedAt and keeping createdAt', async () => {
    vi.mocked(db.categorySuggestions.put).mockResolvedValue(1);

    await repository.putCategorySuggestion({
      id: 3,
      syncId: 'cat-3',
      token: 'uber',
      category: 'Transport',
      score: 4,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });

    expect(db.categorySuggestions.put).toHaveBeenCalledWith(expect.objectContaining({
      id: 3,
      syncId: 'cat-3',
      token: 'uber',
      category: 'Transport',
      score: 4,
      createdAt: new Date('2024-01-01'),
      updatedAt: expect.any(Date),
    }));
  });
});
