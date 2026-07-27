import {
  type Accounts,
  bucketTypes,
  type BucketType,
  type SnapshotStatus,
  type StandardWeekTemplateItem,
  type Transactions,
  type WeeklyPlanSnapshot,
  type WeeklyPlanSnapshotItem,
} from '../../types';
import type { WeeklyPlanSnapshotItemInsert } from '../repository';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface PlanTotals {
  planned_income: number;
  planned_fixed_expenses: number;
  planned_variable_expenses: number;
  planned_savings: number;
  planned_total_spend: number;
  planned_net_margin: number;
}

export interface CompareCategoryVariance {
  category: string;
  bucket_type: BucketType;
  planned: number;
  actual: number;
  variance: number;
}

export type PacingStatus = 'ahead' | 'on_track' | 'behind';

export interface CompareMetrics extends PlanTotals {
  actual_spending: number;
  actual_income: number;
  actual_savings_progress: number;
  spending_remaining: number;
  savings_gap: number;
  pacing_target_to_date: number;
  pacing_delta: number;
  pacing_status: PacingStatus;
  elapsed_ratio: number;
  category_variances: CompareCategoryVariance[];
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const roundMoney = (value: number) => Number(value.toFixed(2));
const isBucketType = (value: string): value is BucketType => bucketTypes.includes(value as BucketType);
const normalizeCategory = (category: string) => category.trim();

export function calculatePlanTotals(items: Array<{ bucket_type: BucketType; amount: number }>): PlanTotals {
  const totals = items.reduce<PlanTotals>((accumulator, item) => {
    if (item.bucket_type === 'income') {
      accumulator.planned_income += item.amount;
    }

    if (item.bucket_type === 'fixed_expense') {
      accumulator.planned_fixed_expenses += item.amount;
    }

    if (item.bucket_type === 'variable_expense') {
      accumulator.planned_variable_expenses += item.amount;
    }

    if (item.bucket_type === 'savings') {
      accumulator.planned_savings += item.amount;
    }

    return accumulator;
  }, {
    planned_income: 0,
    planned_fixed_expenses: 0,
    planned_variable_expenses: 0,
    planned_savings: 0,
    planned_total_spend: 0,
    planned_net_margin: 0,
  });

  totals.planned_total_spend = roundMoney(totals.planned_fixed_expenses + totals.planned_variable_expenses);
  totals.planned_net_margin = roundMoney(
    totals.planned_income
      - totals.planned_fixed_expenses
      - totals.planned_variable_expenses
      - totals.planned_savings,
  );
  totals.planned_income = roundMoney(totals.planned_income);
  totals.planned_fixed_expenses = roundMoney(totals.planned_fixed_expenses);
  totals.planned_variable_expenses = roundMoney(totals.planned_variable_expenses);
  totals.planned_savings = roundMoney(totals.planned_savings);

  return totals;
}

export function validateTemplateItem(item: { category: string; bucket_type: BucketType; amount: number }): string[] {
  const errors: string[] = [];

  if (!normalizeCategory(item.category)) {
    errors.push('Category is required.');
  }

  if (!Number.isFinite(item.amount) || item.amount < 0) {
    errors.push('Amount must be greater than or equal to 0.');
  }

  if (!isBucketType(item.bucket_type)) {
    errors.push('Bucket type is invalid.');
  }

  return errors;
}

export function buildSnapshotItems(templateItems: StandardWeekTemplateItem[], weeklyPlanId: number): WeeklyPlanSnapshotItemInsert[] {
  return templateItems
    .filter((item) => !item.deletedAt)
    .map((item) => ({
      weekly_plan_id: weeklyPlanId,
      category: normalizeCategory(item.category),
      bucket_type: item.bucket_type,
      amount: roundMoney(item.amount),
    }));
}

export function isSnapshotEditable(snapshot: WeeklyPlanSnapshot): boolean {
  return snapshot.status === 'draft';
}

export function calculatePacingStatus(actual: number, target: number): PacingStatus {
  if (target <= 0) {
    return actual <= 0 ? 'on_track' : 'behind';
  }

  const threshold = Math.max(1, target * 0.05);

  if (actual < target - threshold) {
    return 'ahead';
  }

  if (actual > target + threshold) {
    return 'behind';
  }

  return 'on_track';
}

const buildVarianceActualKey = (bucketType: BucketType, category: string) => `${bucketType}::${normalizeCategory(category).toLowerCase()}`;

export function calculateCompareMetrics(
  snapshotItems: WeeklyPlanSnapshotItem[],
  transactions: Transactions[],
  accounts: Accounts[],
  weekStart: Date,
  weekEnd: Date,
): CompareMetrics {
  const windowStart = startOfDay(weekStart);
  const windowEnd = endOfDay(weekEnd);
  const visibleItems = snapshotItems.filter((item) => !item.deletedAt);
  const planTotals = calculatePlanTotals(visibleItems);
  const savingsAccountIds = new Set(accounts.filter((account) => account.type === 'Savings' && !account.deletedAt).map((account) => account.id));
  const actualsByKey = new Map<string, number>();

  let actualSpending = 0;
  let actualIncome = 0;
  let actualSavingsProgress = 0;

  for (const transaction of transactions) {
    if (transaction.deletedAt || transaction.date < windowStart || transaction.date > windowEnd) {
      continue;
    }

    const category = normalizeCategory(transaction.category ?? 'Uncategorized');

    if (transaction.type === 'Expense' || transaction.type === 'Bills') {
      const amount = Math.abs(transaction.value);
      actualSpending += amount;
      const expenseKey = buildVarianceActualKey('variable_expense', category);
      actualsByKey.set(expenseKey, roundMoney((actualsByKey.get(expenseKey) ?? 0) + amount));
      continue;
    }

    if (transaction.type === 'Income') {
      const amount = Math.abs(transaction.value);
      actualIncome += amount;
      const incomeKey = buildVarianceActualKey('income', category);
      actualsByKey.set(incomeKey, roundMoney((actualsByKey.get(incomeKey) ?? 0) + amount));
      continue;
    }

    if (transaction.type === 'Transfer' && typeof transaction.to_account_id === 'number' && savingsAccountIds.has(transaction.to_account_id)) {
      const amount = Math.abs(transaction.value);
      actualSavingsProgress += amount;
      const savingsKey = buildVarianceActualKey('savings', category);
      actualsByKey.set(savingsKey, roundMoney((actualsByKey.get(savingsKey) ?? 0) + amount));
    }
  }

  const groupedItems = visibleItems.reduce<Map<string, CompareCategoryVariance>>((accumulator, item) => {
    const normalizedCategory = normalizeCategory(item.category);
    const key = buildVarianceActualKey(item.bucket_type, normalizedCategory);
    const existing = accumulator.get(key);
    const planned = roundMoney((existing?.planned ?? 0) + item.amount);

    accumulator.set(key, {
      category: normalizedCategory,
      bucket_type: item.bucket_type,
      planned,
      actual: 0,
      variance: 0,
    });

    return accumulator;
  }, new Map());

  const categoryVariances = Array.from(groupedItems.values()).map((item) => {
    const actualKey = item.bucket_type === 'fixed_expense'
      ? buildVarianceActualKey('variable_expense', item.category)
      : buildVarianceActualKey(item.bucket_type, item.category);
    const actual = roundMoney(actualsByKey.get(actualKey) ?? 0);

    return {
      ...item,
      actual,
      variance: roundMoney(item.planned - actual),
    };
  }).sort((left, right) => left.category.localeCompare(right.category));

  const now = new Date();
  const comparisonDate = now < windowStart ? windowStart : now > windowEnd ? windowEnd : now;
  const elapsedRatio = Math.min(Math.max((comparisonDate.getTime() - windowStart.getTime()) / MS_PER_DAY / 7, 0), 1);
  const pacingTarget = roundMoney(planTotals.planned_total_spend * elapsedRatio);
  const roundedActualSpending = roundMoney(actualSpending);
  const roundedActualIncome = roundMoney(actualIncome);
  const roundedSavingsProgress = roundMoney(actualSavingsProgress);
  const pacingDelta = roundMoney(roundedActualSpending - pacingTarget);

  return {
    ...planTotals,
    actual_spending: roundedActualSpending,
    actual_income: roundedActualIncome,
    actual_savings_progress: roundedSavingsProgress,
    spending_remaining: roundMoney(planTotals.planned_total_spend - roundedActualSpending),
    savings_gap: roundMoney(planTotals.planned_savings - roundedSavingsProgress),
    pacing_target_to_date: pacingTarget,
    pacing_delta: pacingDelta,
    pacing_status: calculatePacingStatus(roundedActualSpending, pacingTarget),
    elapsed_ratio: Number(elapsedRatio.toFixed(4)),
    category_variances: categoryVariances,
  };
}

export function normalizeWeekStart(date: Date): Date {
  return startOfDay(date);
}

export function normalizeWeekEnd(date: Date): Date {
  return endOfDay(date);
}

export function resolveCurrentWeekStatus(snapshot: WeeklyPlanSnapshot, referenceDate: Date = new Date()): SnapshotStatus {
  return snapshot.week_end < referenceDate ? 'locked' : snapshot.status;
}

export function findSnapshotForWeek<T extends WeeklyPlanSnapshot>(snapshots: T[], weekStart: Date, weekEnd: Date): T | undefined {
  const exact = snapshots.find((snapshot) => snapshot.week_start.getTime() === weekStart.getTime() && snapshot.week_end.getTime() === weekEnd.getTime());

  if (exact) {
    return exact;
  }

  const midpoint = new Date((weekStart.getTime() + weekEnd.getTime()) / 2);
  return snapshots.find((snapshot) => snapshot.week_start <= midpoint && snapshot.week_end >= midpoint);
}
