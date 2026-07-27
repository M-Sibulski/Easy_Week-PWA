import type {
  Accounts,
  CategorySuggestion,
  Settings,
  SnapshotStatus,
  Transactions,
  WeeklyPlanSnapshot,
  WeeklyPlanSnapshotItem,
} from '../../types';
import type {
  AccountInsert,
  CategorySuggestionInsert,
  IRepository,
  SnapshotWithItems,
  StandardWeekTemplateInsert,
  StandardWeekTemplateItemInsert,
  TemplateWithItems,
  TransactionInsert,
  WeeklyPlanSnapshotItemInsert,
} from './IRepository';
import { hardDeleteRemoteCategorySuggestions, scheduleSync } from '../sync/syncService';

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

  getCategorySuggestionsByTokens(tokens: string[]): Promise<CategorySuggestion[]> {
    return this.innerRepository.getCategorySuggestionsByTokens(tokens);
  }

  getAllCategorySuggestions(): Promise<CategorySuggestion[]> {
    return this.innerRepository.getAllCategorySuggestions();
  }

  async addCategorySuggestion(suggestion: CategorySuggestionInsert): Promise<number> {
    const result = await this.innerRepository.addCategorySuggestion(suggestion);
    void scheduleSync();
    return result;
  }

  async putCategorySuggestion(suggestion: CategorySuggestion): Promise<number> {
    const result = await this.innerRepository.putCategorySuggestion(suggestion);
    void scheduleSync();
    return result;
  }

  async deleteCategorySuggestionsBySyncIds(syncIds: string[]): Promise<void> {
    await hardDeleteRemoteCategorySuggestions(syncIds);
    await this.innerRepository.deleteCategorySuggestionsBySyncIds(syncIds);
  }

  clearCategorySuggestions(): Promise<void> {
    return this.innerRepository.clearCategorySuggestions();
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

  getStandardWeekTemplateByAccountId(accountId: number): Promise<TemplateWithItems | undefined> {
    return this.innerRepository.getStandardWeekTemplateByAccountId(accountId);
  }

  async upsertStandardWeekTemplate(template: StandardWeekTemplateInsert & { id?: number }, items: StandardWeekTemplateItemInsert[]): Promise<TemplateWithItems> {
    const result = await this.innerRepository.upsertStandardWeekTemplate(template, items);
    void scheduleSync();
    return result;
  }

  getWeeklyPlanByAccountAndWeek(accountId: number, weekStart: Date, weekEnd: Date): Promise<SnapshotWithItems | undefined> {
    return this.innerRepository.getWeeklyPlanByAccountAndWeek(accountId, weekStart, weekEnd);
  }

  async createWeeklyPlanFromTemplate(accountId: number, weekStart: Date, weekEnd: Date): Promise<SnapshotWithItems> {
    const result = await this.innerRepository.createWeeklyPlanFromTemplate(accountId, weekStart, weekEnd);
    void scheduleSync();
    return result;
  }

  async updateWeeklyPlan(
    weeklyPlanId: number,
    changes: Partial<Pick<WeeklyPlanSnapshot, 'notes' | 'status'>>,
    itemChanges: {
      add?: WeeklyPlanSnapshotItemInsert[];
      update?: Array<{ id: number; changes: Partial<WeeklyPlanSnapshotItem> }>;
      remove?: number[];
    },
  ): Promise<void> {
    await this.innerRepository.updateWeeklyPlan(weeklyPlanId, changes, itemChanges);
    void scheduleSync();
  }

  async lockPastWeeklyPlans(referenceDate: Date): Promise<number> {
    const result = await this.innerRepository.lockPastWeeklyPlans(referenceDate);
    if (result > 0) {
      void scheduleSync();
    }
    return result;
  }

  listWeeklyPlansByAccount(accountId: number, options?: { status?: SnapshotStatus; limit?: number }): Promise<SnapshotWithItems[]> {
    return this.innerRepository.listWeeklyPlansByAccount(accountId, options);
  }

  async deleteWeeklyPlan(id: number): Promise<void> {
    await this.innerRepository.deleteWeeklyPlan(id);
    void scheduleSync();
  }
}
