import Dexie, { EntityTable } from 'dexie';
import { Accounts, CategorySuggestion, Transactions, Settings } from './types';
import { createSyncId } from './syncIds';

class AppDatabase extends Dexie {
  accounts!: EntityTable<Accounts, 'id'>; // 'id' is the primary key property
  transactions!: EntityTable<Transactions, 'id'>;
  categorySuggestions!: EntityTable<CategorySuggestion, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor() {
    super('easyWeekDatabase');
    this.version(1).stores({
        accounts: '++id, type, goalValue, goalDate, main, dateCreated',
        transactions: '++id, value, type, name, account_id, date, category',
        settings: '++id, dark, last_account_id',
    });

    this.version(2)
      .stores({
        accounts: '++id, type, goalValue, goalDate, main, createdAt, updatedAt',
        transactions: '++id, value, type, name, account_id, date, category, createdAt, updatedAt',
        settings: '++id, dark, last_account_id, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        const now = new Date();

        await tx.table('accounts').toCollection().modify((account: Record<string, unknown>) => {
          const createdAt = account.createdAt instanceof Date
            ? account.createdAt
            : account.dateCreated instanceof Date
              ? account.dateCreated
              : now;

          account.createdAt = createdAt;
          account.updatedAt = account.updatedAt instanceof Date ? account.updatedAt : createdAt;
          delete account.dateCreated;
        });

        await tx.table('transactions').toCollection().modify((transaction: Record<string, unknown>) => {
          const createdAt = transaction.createdAt instanceof Date
            ? transaction.createdAt
            : transaction.date instanceof Date
              ? transaction.date
              : now;

          transaction.createdAt = createdAt;
          transaction.updatedAt = transaction.updatedAt instanceof Date ? transaction.updatedAt : createdAt;
        });

        await tx.table('settings').toCollection().modify((settings: Record<string, unknown>) => {
          const createdAt = settings.createdAt instanceof Date ? settings.createdAt : now;

          settings.createdAt = createdAt;
          settings.updatedAt = settings.updatedAt instanceof Date ? settings.updatedAt : createdAt;
        });
      });

    this.version(3)
      .stores({
        accounts: '++id, &syncId, type, goalValue, goalDate, createdAt, updatedAt',
        transactions: '++id, &syncId, value, type, name, account_id, account_sync_id, to_account_id, to_account_sync_id, date, category, createdAt, updatedAt',
        settings: '++id, &syncId, dark, main_account_id, main_account_sync_id, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        const accountsTable = tx.table('accounts');
        const transactionsTable = tx.table('transactions');
        const settingsTable = tx.table('settings');

        const accounts = await accountsTable.toArray() as Array<Record<string, unknown>>;
        const accountSyncIdByLocalId = new Map<number, string>();

        for (const account of accounts) {
          if (typeof account.id !== 'number') {
            continue;
          }

          const syncId = typeof account.syncId === 'string' ? account.syncId : createSyncId('acc');
          accountSyncIdByLocalId.set(account.id, syncId);
        }

        await accountsTable.toCollection().modify((account: Record<string, unknown>) => {
          account.syncId = typeof account.syncId === 'string' ? account.syncId : createSyncId('acc');
        });

        await transactionsTable.toCollection().modify((transaction: Record<string, unknown>) => {
          transaction.syncId = typeof transaction.syncId === 'string' ? transaction.syncId : createSyncId('txn');

          if (typeof transaction.account_sync_id !== 'string' && typeof transaction.account_id === 'number') {
            transaction.account_sync_id = accountSyncIdByLocalId.get(transaction.account_id);
          }

          if (typeof transaction.to_account_sync_id !== 'string' && typeof transaction.to_account_id === 'number') {
            transaction.to_account_sync_id = accountSyncIdByLocalId.get(transaction.to_account_id);
          }
        });

        await settingsTable.toCollection().modify((settings: Record<string, unknown>) => {
          settings.syncId = typeof settings.syncId === 'string' ? settings.syncId : createSyncId('set');

          if (typeof settings.main_account_sync_id !== 'string' && typeof settings.main_account_id === 'number' && settings.main_account_id !== 0) {
            settings.main_account_sync_id = accountSyncIdByLocalId.get(settings.main_account_id);
          }
        });
      });

    this.version(4)
      .stores({
        accounts: '++id, &syncId, type, goalValue, goalDate, createdAt, updatedAt, deletedAt',
        transactions: '++id, &syncId, value, type, name, account_id, account_sync_id, to_account_id, to_account_sync_id, date, category, createdAt, updatedAt, deletedAt',
        settings: '++id, &syncId, dark, main_account_id, main_account_sync_id, createdAt, updatedAt, deletedAt',
      })
      .upgrade(async (tx) => {
        const normalizeDeletedAt = (resource: Record<string, unknown>) => {
          resource.deletedAt = resource.deletedAt instanceof Date ? resource.deletedAt : undefined;
        };

        await tx.table('accounts').toCollection().modify(normalizeDeletedAt);
        await tx.table('transactions').toCollection().modify(normalizeDeletedAt);
        await tx.table('settings').toCollection().modify(normalizeDeletedAt);
      });

    this.version(5)
      .stores({
        accounts: '++id, &syncId, type, goalValue, goalDate, createdAt, updatedAt, deletedAt',
        transactions: '++id, &syncId, value, type, name, account_id, account_sync_id, to_account_id, to_account_sync_id, date, category, createdAt, updatedAt, deletedAt',
        categorySuggestions: '++id, &syncId, &[token+category], token, category, score, createdAt, updatedAt, deletedAt',
        settings: '++id, &syncId, dark, main_account_id, main_account_sync_id, createdAt, updatedAt, deletedAt',
      })
      .upgrade(async (tx) => {
        await tx.table('categorySuggestions').toCollection().modify((suggestion: Record<string, unknown>) => {
          const createdAt = suggestion.createdAt instanceof Date ? suggestion.createdAt : new Date();
          suggestion.syncId = typeof suggestion.syncId === 'string' ? suggestion.syncId : createSyncId('cat');
          suggestion.score = typeof suggestion.score === 'number' ? suggestion.score : 0;
          suggestion.createdAt = createdAt;
          suggestion.updatedAt = suggestion.updatedAt instanceof Date ? suggestion.updatedAt : createdAt;
          suggestion.deletedAt = suggestion.deletedAt instanceof Date ? suggestion.deletedAt : undefined;
        });
      });
  }
}

export const db = new AppDatabase();