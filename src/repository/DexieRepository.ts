import { db } from '../../db';
import { Accounts, Settings, Transactions } from '../../types';
import { AccountInsert, IRepository, TransactionInsert } from './IRepository';
import { createSyncId } from '../../syncIds';

const stampForCreate = <T extends { syncId?: string; createdAt?: Date; updatedAt?: Date }>(resource: T, prefix: string) => {
  const now = new Date();

  return {
    ...resource,
    syncId: resource.syncId ?? createSyncId(prefix),
    createdAt: resource.createdAt ?? now,
    updatedAt: resource.updatedAt ?? now,
  };
};

const stampForPut = <T extends { syncId?: string; createdAt?: Date; updatedAt?: Date }>(resource: T, prefix: string) => ({
  ...resource,
  syncId: resource.syncId ?? createSyncId(prefix),
  createdAt: resource.createdAt ?? new Date(),
  updatedAt: new Date(),
});

export class DexieRepository implements IRepository {
  // ── Accounts ──────────────────────────────────────────────────────────────
  getAccounts(): Promise<Accounts[]> {
    return db.accounts.toArray();
  }

  getAccountById(id: number): Promise<Accounts | undefined> {
    return db.accounts.get(id);
  }

  addAccount(account: AccountInsert): Promise<number> {
    return db.accounts.add(stampForCreate(account, 'acc') as Accounts);
  }

  putAccount(account: Accounts): Promise<number> {
    return db.accounts.put(stampForPut(account, 'acc'));
  }

  async updateAccount(id: number, changes: Partial<Accounts>): Promise<void> {
    await db.accounts.update(id, { ...changes, updatedAt: new Date() });
  }

  async deleteAccount(id: number): Promise<void> {
    await db.accounts.delete(id);
  }

  async clearAccounts(): Promise<void> {
    await db.accounts.clear();
  }

  // ── Transactions ──────────────────────────────────────────────────────────
  getTransactions(): Promise<Transactions[]> {
    return db.transactions.where('name').notEqual('').sortBy('date');
  }

  getAllTransactions(): Promise<Transactions[]> {
    return db.transactions.toArray();
  }

  getTransactionsByAccountId(accountId: number): Promise<Transactions[]> {
    return db.transactions.where('account_id').equals(accountId).toArray();
  }

  addTransaction(transaction: TransactionInsert): Promise<number> {
    return db.transactions.add(stampForCreate(transaction, 'txn') as Transactions);
  }

  putTransaction(transaction: Transactions): Promise<number> {
    return db.transactions.put(stampForPut(transaction, 'txn'));
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.transactions.delete(id);
  }

  async clearTransactions(): Promise<void> {
    await db.transactions.clear();
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  async getSettings(): Promise<Settings | undefined> {
    const all = await db.settings.toArray();
    return all[0];
  }

  async putSettings(settings: Settings): Promise<void> {
    await db.settings.put(stampForPut(settings, 'set'));
  }

  async updateSettings(id: number, changes: Partial<Settings>): Promise<void> {
    await db.settings.update(id, { ...changes, updatedAt: new Date() });
  }

  async clearSettings(): Promise<void> {
    await db.settings.clear();
  }
}
