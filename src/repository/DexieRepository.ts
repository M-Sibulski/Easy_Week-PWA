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
  async getAccounts(): Promise<Accounts[]> {
    const accounts = await db.accounts.toArray();
    return accounts.filter((account) => !account.deletedAt);
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
    await db.accounts.update(id, { deletedAt: new Date(), updatedAt: new Date() });
  }

  async clearAccounts(): Promise<void> {
    await db.accounts.clear();
  }

  // ── Transactions ──────────────────────────────────────────────────────────
  async getTransactions(): Promise<Transactions[]> {
    const transactions = await db.transactions.where('name').notEqual('').sortBy('date');
    return transactions.filter((transaction) => !transaction.deletedAt);
  }

  getAllTransactions(): Promise<Transactions[]> {
    return db.transactions.toArray();
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transactions[]> {
    const transactions = await db.transactions.where('account_id').equals(accountId).toArray();
    return transactions.filter((transaction) => !transaction.deletedAt);
  }

  addTransaction(transaction: TransactionInsert): Promise<number> {
    return db.transactions.add(stampForCreate(transaction, 'txn') as Transactions);
  }

  putTransaction(transaction: Transactions): Promise<number> {
    return db.transactions.put(stampForPut(transaction, 'txn'));
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.transactions.update(id, { deletedAt: new Date(), updatedAt: new Date() });
  }

  async clearTransactions(): Promise<void> {
    await db.transactions.clear();
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  async getSettings(): Promise<Settings | undefined> {
    const all = await db.settings.toArray();
    return all.find((settings) => !settings.deletedAt);
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
