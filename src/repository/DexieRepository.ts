import { db } from '../../db';
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
import {
  buildSnapshotItems,
  normalizeWeekEnd,
  normalizeWeekStart,
  validateTemplateItem,
} from '../weeklyPlanning';
import {
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

const isVisible = <T extends { deletedAt?: Date }>(resource: T) => !resource.deletedAt;
const assertValidTemplateItems = (items: Array<{ category: string; bucket_type: StandardWeekTemplateItem['bucket_type']; amount: number }>) => {
  const messages = items.flatMap((item) => validateTemplateItem(item));

  if (messages.length > 0) {
    throw new Error(messages.join(' '));
  }
};

export class DexieRepository implements IRepository {
  private async ensureActiveAccount(accountId: number): Promise<Accounts> {
    const account = await db.accounts.get(accountId);

    if (!account || account.deletedAt) {
      throw new Error('Account not found.');
    }

    return account;
  }

  private async getTemplateItems(templateId: number): Promise<StandardWeekTemplateItem[]> {
    const items = await db.standardWeekTemplateItems.where('template_id').equals(templateId).toArray();
    return items.filter(isVisible);
  }

  private async getSnapshotItems(snapshotId: number): Promise<WeeklyPlanSnapshotItem[]> {
    const items = await db.weeklyPlanItems.where('weekly_plan_id').equals(snapshotId).toArray();
    return items.filter(isVisible);
  }

  private async getActiveTemplateRecordByAccountId(accountId: number): Promise<StandardWeekTemplate | undefined> {
    const templates = await db.standardWeekTemplates.where('account_id').equals(accountId).toArray();
    return templates.filter(isVisible).sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())[0];
  }

  private async getActiveSnapshotRecordByAccountAndWeek(accountId: number, weekStart: Date, weekEnd: Date): Promise<WeeklyPlanSnapshot | undefined> {
    const plans = await db.weeklyPlans.where('account_id').equals(accountId).toArray();
    return plans.find((plan) => isVisible(plan)
      && plan.week_start.getTime() === weekStart.getTime()
      && plan.week_end.getTime() === weekEnd.getTime());
  }

  // ── Accounts ──────────────────────────────────────────────────────────────
  async getAccounts(): Promise<Accounts[]> {
    const accounts = await db.accounts.toArray();
    return accounts.filter(isVisible);
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
    return transactions.filter(isVisible);
  }

  getAllTransactions(): Promise<Transactions[]> {
    return db.transactions.toArray();
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transactions[]> {
    const transactions = await db.transactions.where('account_id').equals(accountId).toArray();
    return transactions.filter(isVisible);
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

  // ── Category Suggestions ───────────────────────────────────────────────────
  async getCategorySuggestionsByTokens(tokens: string[]): Promise<CategorySuggestion[]> {
    if (tokens.length === 0) {
      return [];
    }

    const suggestions = await db.categorySuggestions.where('token').anyOf(tokens).toArray();
    return suggestions.filter(isVisible);
  }

  async getAllCategorySuggestions(): Promise<CategorySuggestion[]> {
    const suggestions = await db.categorySuggestions.toArray();
    return suggestions.filter(isVisible);
  }

  addCategorySuggestion(suggestion: CategorySuggestionInsert): Promise<number> {
    return db.categorySuggestions.add(stampForCreate(suggestion, 'cat') as CategorySuggestion);
  }

  putCategorySuggestion(suggestion: CategorySuggestion): Promise<number> {
    return db.categorySuggestions.put(stampForPut(suggestion, 'cat'));
  }

  async deleteCategorySuggestionsBySyncIds(syncIds: string[]): Promise<void> {
    if (syncIds.length === 0) {
      return;
    }

    const suggestions = await db.categorySuggestions.where('syncId').anyOf(syncIds).toArray();
    await Promise.all(suggestions.map(async (suggestion) => {
      await db.categorySuggestions.delete(suggestion.id);
    }));
  }

  async clearCategorySuggestions(): Promise<void> {
    await db.categorySuggestions.clear();
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  async getSettings(): Promise<Settings | undefined> {
    const all = await db.settings.toArray();
    return all.find(isVisible);
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

  // ── Weekly Planning ───────────────────────────────────────────────────────
  async getStandardWeekTemplateByAccountId(accountId: number): Promise<TemplateWithItems | undefined> {
    const template = await this.getActiveTemplateRecordByAccountId(accountId);

    if (!template) {
      return undefined;
    }

    return {
      template,
      items: await this.getTemplateItems(template.id),
    };
  }

  async upsertStandardWeekTemplate(template: StandardWeekTemplateInsert & { id?: number }, items: StandardWeekTemplateItemInsert[]): Promise<TemplateWithItems> {
    const account = await this.ensureActiveAccount(template.account_id);
    assertValidTemplateItems(items);

    const existingTemplate = template.id
      ? await db.standardWeekTemplates.get(template.id)
      : await this.getActiveTemplateRecordByAccountId(template.account_id);

    const templatePayload = {
      ...template,
      account_sync_id: template.account_sync_id || account.syncId,
      name: template.name?.trim() || 'Standard Week',
      notes: template.notes?.trim() || undefined,
      deletedAt: undefined,
    };

    const templateId = existingTemplate && !existingTemplate.deletedAt
      ? await db.standardWeekTemplates.put(stampForPut({ ...existingTemplate, ...templatePayload }, 'tpl'))
      : await db.standardWeekTemplates.add(stampForCreate(templatePayload, 'tpl') as StandardWeekTemplate);

    const existingItems = await db.standardWeekTemplateItems.where('template_id').equals(templateId).toArray();
    const tombstoneTime = new Date();
    await Promise.all(existingItems.filter(isVisible).map(async (item) => {
      await db.standardWeekTemplateItems.update(item.id, { deletedAt: tombstoneTime, updatedAt: tombstoneTime });
    }));

    await Promise.all(items.map(async (item) => {
      await db.standardWeekTemplateItems.add(stampForCreate({
        ...item,
        template_id: templateId,
        category: item.category.trim(),
        amount: Number(item.amount),
      }, 'tpi') as StandardWeekTemplateItem);
    }));

    const savedTemplate = await this.getStandardWeekTemplateByAccountId(templateId ? template.account_id : template.account_id);

    if (!savedTemplate) {
      throw new Error('Failed to save standard week template.');
    }

    return savedTemplate;
  }

  async getWeeklyPlanByAccountAndWeek(accountId: number, weekStart: Date, weekEnd: Date): Promise<SnapshotWithItems | undefined> {
    const snapshot = await this.getActiveSnapshotRecordByAccountAndWeek(accountId, normalizeWeekStart(weekStart), normalizeWeekEnd(weekEnd));

    if (!snapshot) {
      return undefined;
    }

    return {
      snapshot,
      items: await this.getSnapshotItems(snapshot.id),
    };
  }

  async createWeeklyPlanFromTemplate(accountId: number, weekStart: Date, weekEnd: Date): Promise<SnapshotWithItems> {
    const templateWithItems = await this.getStandardWeekTemplateByAccountId(accountId);

    if (!templateWithItems) {
      throw new Error('A standard week template is required before creating a weekly plan.');
    }

    const normalizedWeekStart = normalizeWeekStart(weekStart);
    const normalizedWeekEnd = normalizeWeekEnd(weekEnd);
    const existingSnapshot = await this.getActiveSnapshotRecordByAccountAndWeek(accountId, normalizedWeekStart, normalizedWeekEnd);

    if (existingSnapshot) {
      throw new Error('A weekly plan already exists for this week.');
    }

    const snapshotId = await db.weeklyPlans.add(stampForCreate({
      account_id: templateWithItems.template.account_id,
      account_sync_id: templateWithItems.template.account_sync_id,
      template_id: templateWithItems.template.id,
      week_start: normalizedWeekStart,
      week_end: normalizedWeekEnd,
      status: 'draft',
      notes: templateWithItems.template.notes,
    }, 'wpl') as WeeklyPlanSnapshot);

    const snapshotItems = buildSnapshotItems(templateWithItems.items, snapshotId);
    await Promise.all(snapshotItems.map(async (item) => {
      await db.weeklyPlanItems.add(stampForCreate(item, 'wpi') as WeeklyPlanSnapshotItem);
    }));

    const result = await this.getWeeklyPlanByAccountAndWeek(accountId, normalizedWeekStart, normalizedWeekEnd);

    if (!result) {
      throw new Error('Failed to create weekly plan.');
    }

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
    const snapshot = await db.weeklyPlans.get(weeklyPlanId);

    if (!snapshot || snapshot.deletedAt) {
      throw new Error('Weekly plan not found.');
    }

    if (snapshot.status !== 'draft') {
      throw new Error('Locked weekly plans cannot be edited.');
    }

    const addItems = itemChanges.add ?? [];
    const updateItems = itemChanges.update ?? [];

    assertValidTemplateItems(addItems);
    assertValidTemplateItems(updateItems.map((item) => ({
      category: typeof item.changes.category === 'string' ? item.changes.category : 'existing',
      bucket_type: (item.changes.bucket_type ?? 'income') as StandardWeekTemplateItem['bucket_type'],
      amount: typeof item.changes.amount === 'number' ? item.changes.amount : 0,
    })));

    await db.weeklyPlans.update(weeklyPlanId, {
      ...('notes' in changes ? { notes: changes.notes?.trim() || undefined } : {}),
      ...('status' in changes ? { status: changes.status } : {}),
      updatedAt: new Date(),
    });

    await Promise.all(addItems.map(async (item) => {
      await db.weeklyPlanItems.add(stampForCreate({
        ...item,
        weekly_plan_id: weeklyPlanId,
        category: item.category.trim(),
        amount: Number(item.amount),
      }, 'wpi') as WeeklyPlanSnapshotItem);
    }));

    await Promise.all(updateItems.map(async (item) => {
      const existingItem = await db.weeklyPlanItems.get(item.id);

      if (!existingItem || existingItem.weekly_plan_id !== weeklyPlanId || existingItem.deletedAt) {
        throw new Error('Weekly plan item not found.');
      }

      await db.weeklyPlanItems.update(item.id, {
        ...('category' in item.changes ? { category: item.changes.category?.trim() } : {}),
        ...('bucket_type' in item.changes ? { bucket_type: item.changes.bucket_type } : {}),
        ...('amount' in item.changes ? { amount: Number(item.changes.amount) } : {}),
        updatedAt: new Date(),
      });
    }));

    await Promise.all((itemChanges.remove ?? []).map(async (itemId) => {
      await db.weeklyPlanItems.update(itemId, { deletedAt: new Date(), updatedAt: new Date() });
    }));
  }

  async lockPastWeeklyPlans(referenceDate: Date): Promise<number> {
    const plans = await db.weeklyPlans.where('status').equals('draft').toArray();
    const normalizedReference = normalizeWeekStart(referenceDate);
    const lockable = plans.filter((plan) => isVisible(plan) && plan.week_end < normalizedReference);

    await Promise.all(lockable.map(async (plan) => {
      await db.weeklyPlans.update(plan.id, { status: 'locked', updatedAt: new Date() });
    }));

    return lockable.length;
  }

  async listWeeklyPlansByAccount(accountId: number, options?: { status?: SnapshotStatus; limit?: number }): Promise<SnapshotWithItems[]> {
    const plans = await db.weeklyPlans.where('account_id').equals(accountId).toArray();
    const filteredPlans = plans
      .filter((plan) => isVisible(plan) && (!options?.status || plan.status === options.status))
      .sort((left, right) => right.week_start.getTime() - left.week_start.getTime());
    const limitedPlans = typeof options?.limit === 'number' ? filteredPlans.slice(0, options.limit) : filteredPlans;

    return Promise.all(limitedPlans.map(async (snapshot) => ({
      snapshot,
      items: await this.getSnapshotItems(snapshot.id),
    })));
  }

  async deleteWeeklyPlan(id: number): Promise<void> {
    const snapshot = await db.weeklyPlans.get(id);

    if (!snapshot || snapshot.deletedAt) {
      return;
    }

    const deletedAt = new Date();
    await db.weeklyPlans.update(id, { deletedAt, updatedAt: deletedAt });

    const items = await db.weeklyPlanItems.where('weekly_plan_id').equals(id).toArray();
    await Promise.all(items.filter(isVisible).map(async (item) => {
      await db.weeklyPlanItems.update(item.id, { deletedAt, updatedAt: deletedAt });
    }));
  }
}
