import type { Accounts, Settings, Transactions } from '../../types';
import type { AccountInsert, IRepository, TransactionInsert } from './IRepository';
import { scheduleSync } from '../sync/syncService';

export class SyncingRepository implements IRepository {
  constructor(private readonly innerRepository: IRepository) {}

  getAccounts(): Promise<Accounts[]> {
    return this.innerRepository.getAccounts();
  }

  getAccountById(id: number): Promise<Accounts | undefined> {
    return this.innerRepository.getAccountById(id);
  }

  async addAccount(account: AccountInsert): Promise<number> {
    const result = await this.innerRepository.addAccount(account);
    void scheduleSync();
    return result;
  }

  async putAccount(account: Accounts): Promise<number> {
    const result = await this.innerRepository.putAccount(account);
    void scheduleSync();
    return result;
  }

  async updateAccount(id: number, changes: Partial<Accounts>): Promise<void> {
    await this.innerRepository.updateAccount(id, changes);
    void scheduleSync();
  }

  async deleteAccount(id: number): Promise<void> {
    await this.innerRepository.deleteAccount(id);
    void scheduleSync();
  }

  clearAccounts(): Promise<void> {
    return this.innerRepository.clearAccounts();
  }

  getTransactions(): Promise<Transactions[]> {
    return this.innerRepository.getTransactions();
  }

  getAllTransactions(): Promise<Transactions[]> {
    return this.innerRepository.getAllTransactions();
  }

  getTransactionsByAccountId(accountId: number): Promise<Transactions[]> {
    return this.innerRepository.getTransactionsByAccountId(accountId);
  }

  async addTransaction(transaction: TransactionInsert): Promise<number> {
    const result = await this.innerRepository.addTransaction(transaction);
    void scheduleSync();
    return result;
  }

  async putTransaction(transaction: Transactions): Promise<number> {
    const result = await this.innerRepository.putTransaction(transaction);
    void scheduleSync();
    return result;
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.innerRepository.deleteTransaction(id);
    void scheduleSync();
  }

  clearTransactions(): Promise<void> {
    return this.innerRepository.clearTransactions();
  }

  getSettings(): Promise<Settings | undefined> {
    return this.innerRepository.getSettings();
  }

  async putSettings(settings: Settings): Promise<void> {
    await this.innerRepository.putSettings(settings);
    void scheduleSync();
  }

  async updateSettings(id: number, changes: Partial<Settings>): Promise<void> {
    await this.innerRepository.updateSettings(id, changes);
    void scheduleSync();
  }

  clearSettings(): Promise<void> {
    return this.innerRepository.clearSettings();
  }
}
