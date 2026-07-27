import {
  Accounts,
  CategorySuggestion,
  Settings,
  SnapshotStatus,
  StandardWeekTemplate,
  StandardWeekTemplateItem,
  Transactions,
  WeeklyPlanSnapshot,
  WeeklyPlanSnapshotItem,
} from '../../types';

export type AccountInsert = Omit<Accounts, 'id' | 'syncId' | 'createdAt' | 'updatedAt'> & Partial<Pick<Accounts, 'syncId' | 'createdAt' | 'updatedAt'>>;
export type TransactionInsert = Omit<Transactions, 'id' | 'syncId' | 'createdAt' | 'updatedAt'> & Partial<Pick<Transactions, 'syncId' | 'createdAt' | 'updatedAt'>>;
export type CategorySuggestionInsert = Omit<CategorySuggestion, 'id' | 'syncId' | 'createdAt' | 'updatedAt'> & Partial<Pick<CategorySuggestion, 'syncId' | 'createdAt' | 'updatedAt'>>;
export type StandardWeekTemplateInsert = Omit<StandardWeekTemplate, 'id' | 'syncId' | 'createdAt' | 'updatedAt'> & Partial<Pick<StandardWeekTemplate, 'syncId' | 'createdAt' | 'updatedAt'>>;
export type StandardWeekTemplateItemInsert = Omit<StandardWeekTemplateItem, 'id' | 'syncId' | 'createdAt' | 'updatedAt'> & Partial<Pick<StandardWeekTemplateItem, 'syncId' | 'createdAt' | 'updatedAt'>>;
export type WeeklyPlanSnapshotInsert = Omit<WeeklyPlanSnapshot, 'id' | 'syncId' | 'createdAt' | 'updatedAt'> & Partial<Pick<WeeklyPlanSnapshot, 'syncId' | 'createdAt' | 'updatedAt'>>;
export type WeeklyPlanSnapshotItemInsert = Omit<WeeklyPlanSnapshotItem, 'id' | 'syncId' | 'createdAt' | 'updatedAt'> & Partial<Pick<WeeklyPlanSnapshotItem, 'syncId' | 'createdAt' | 'updatedAt'>>;

export interface TemplateWithItems {
  template: StandardWeekTemplate;
  items: StandardWeekTemplateItem[];
}

export interface SnapshotWithItems {
  snapshot: WeeklyPlanSnapshot;
  items: WeeklyPlanSnapshotItem[];
}

/**
 * Abstraction layer for all persistent data operations.
 * Implementations: DexieRepository (local), future SupabaseRepository (cloud/self-hosted).
 * Designed for "last write wins" sync – all mutating operations are async and can be
 * extended with conflict-resolution metadata (e.g. updated_at) without changing callers.
 */
export interface IRepository {
  // ── Accounts ──────────────────────────────────────────────────────────────
  getAccounts(): Promise<Accounts[]>;
  getAccountById(id: number): Promise<Accounts | undefined>;
  addAccount(account: AccountInsert): Promise<number>;
  /** Full replace (upsert by id). */
  putAccount(account: Accounts): Promise<number>;
  updateAccount(id: number, changes: Partial<Accounts>): Promise<void>;
  deleteAccount(id: number): Promise<void>;
  clearAccounts(): Promise<void>;

  // ── Transactions ──────────────────────────────────────────────────────────
  /** Returns all transactions with a non-empty name, sorted by date ascending. For UI display. */
  getTransactions(): Promise<Transactions[]>;
  /** Returns every transaction row without filtering. For sync / import deduplication. */
  getAllTransactions(): Promise<Transactions[]>;
  getTransactionsByAccountId(accountId: number): Promise<Transactions[]>;
  addTransaction(transaction: TransactionInsert): Promise<number>;
  /** Full replace (upsert by id). */
  putTransaction(transaction: Transactions): Promise<number>;
  deleteTransaction(id: number): Promise<void>;
  clearTransactions(): Promise<void>;

  // ── Category Suggestions ───────────────────────────────────────────────────
  getCategorySuggestionsByTokens(tokens: string[]): Promise<CategorySuggestion[]>;
  getAllCategorySuggestions(): Promise<CategorySuggestion[]>;
  addCategorySuggestion(suggestion: CategorySuggestionInsert): Promise<number>;
  /** Full replace (upsert by id). */
  putCategorySuggestion(suggestion: CategorySuggestion): Promise<number>;
  deleteCategorySuggestionsBySyncIds(syncIds: string[]): Promise<void>;
  clearCategorySuggestions(): Promise<void>;

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings(): Promise<Settings | undefined>;
  /** Full replace (upsert by id). */
  putSettings(settings: Settings): Promise<void>;
  updateSettings(id: number, changes: Partial<Settings>): Promise<void>;
  clearSettings(): Promise<void>;

  // ── Weekly Planning ───────────────────────────────────────────────────────
  getStandardWeekTemplateByAccountId(accountId: number): Promise<TemplateWithItems | undefined>;
  upsertStandardWeekTemplate(template: StandardWeekTemplateInsert & { id?: number }, items: StandardWeekTemplateItemInsert[]): Promise<TemplateWithItems>;
  getWeeklyPlanByAccountAndWeek(accountId: number, weekStart: Date, weekEnd: Date): Promise<SnapshotWithItems | undefined>;
  createWeeklyPlanFromTemplate(accountId: number, weekStart: Date, weekEnd: Date): Promise<SnapshotWithItems>;
  updateWeeklyPlan(
    weeklyPlanId: number,
    changes: Partial<Pick<WeeklyPlanSnapshot, 'notes' | 'status'>>,
    itemChanges: {
      add?: WeeklyPlanSnapshotItemInsert[];
      update?: Array<{ id: number; changes: Partial<WeeklyPlanSnapshotItem> }>;
      remove?: number[];
    },
  ): Promise<void>;
  lockPastWeeklyPlans(referenceDate: Date): Promise<number>;
  listWeeklyPlansByAccount(accountId: number, options?: { status?: SnapshotStatus; limit?: number }): Promise<SnapshotWithItems[]>;
  deleteWeeklyPlan(id: number): Promise<void>;
}
