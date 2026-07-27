import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Accounts, StandardWeekTemplateItem, Transactions, WeeklyPlanSnapshot, WeeklyPlanSnapshotItem } from '../../types';
import {
  buildSnapshotItems,
  calculateCompareMetrics,
  calculatePacingStatus,
  calculatePlanTotals,
  findSnapshotForWeek,
  isSnapshotEditable,
  normalizeWeekEnd,
  normalizeWeekStart,
  validateTemplateItem,
} from './weeklyPlanningService';

describe('weeklyPlanningService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('calculates plan totals by bucket and net margin', () => {
    expect(calculatePlanTotals([
      { bucket_type: 'income', amount: 1200 },
      { bucket_type: 'fixed_expense', amount: 400 },
      { bucket_type: 'variable_expense', amount: 250 },
      { bucket_type: 'savings', amount: 150 },
    ])).toEqual({
      planned_income: 1200,
      planned_fixed_expenses: 400,
      planned_variable_expenses: 250,
      planned_savings: 150,
      planned_total_spend: 650,
      planned_net_margin: 400,
    });
  });

  it('validates template item fields', () => {
    expect(validateTemplateItem({ category: '  ', bucket_type: 'income', amount: -10 })).toEqual([
      'Category is required.',
      'Amount must be greater than or equal to 0.',
    ]);
  });

  it('builds editable snapshot items from template rows', () => {
    const templateItems: StandardWeekTemplateItem[] = [
      {
        id: 1,
        syncId: 'tpi-1',
        template_id: 3,
        category: ' Rent ',
        bucket_type: 'fixed_expense',
        amount: 500,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    expect(buildSnapshotItems(templateItems, 9)).toEqual([
      {
        weekly_plan_id: 9,
        category: 'Rent',
        bucket_type: 'fixed_expense',
        amount: 500,
      },
    ]);
  });

  it('treats only draft snapshots as editable', () => {
    const snapshot: WeeklyPlanSnapshot = {
      id: 1,
      syncId: 'wpl-1',
      account_id: 1,
      account_sync_id: 'acc-1',
      template_id: 2,
      week_start: new Date('2024-01-01'),
      week_end: new Date('2024-01-07'),
      status: 'draft',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    expect(isSnapshotEditable(snapshot)).toBe(true);
    expect(isSnapshotEditable({ ...snapshot, status: 'locked' })).toBe(false);
  });

  it('finds an overlapping historical snapshot when week-start settings changed later', () => {
    const snapshots: WeeklyPlanSnapshot[] = [
      {
        id: 1,
        syncId: 'wpl-1',
        account_id: 1,
        account_sync_id: 'acc-1',
        template_id: 2,
        week_start: normalizeWeekStart(new Date('2024-01-01')),
        week_end: normalizeWeekEnd(new Date('2024-01-07')),
        status: 'locked',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    const result = findSnapshotForWeek(snapshots, normalizeWeekStart(new Date('2023-12-31')), normalizeWeekEnd(new Date('2024-01-06')));

    expect(result?.id).toBe(1);
  });

  it('calculates compare metrics with spending, income, savings, and pacing rules', () => {
    vi.setSystemTime(new Date('2024-01-04T12:00:00Z'));
    const snapshotItems: WeeklyPlanSnapshotItem[] = [
      { id: 1, syncId: 'wpi-1', weekly_plan_id: 7, category: 'Salary', bucket_type: 'income', amount: 1200, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
      { id: 2, syncId: 'wpi-2', weekly_plan_id: 7, category: 'Rent', bucket_type: 'fixed_expense', amount: 500, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
      { id: 3, syncId: 'wpi-3', weekly_plan_id: 7, category: 'Food', bucket_type: 'variable_expense', amount: 200, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
      { id: 4, syncId: 'wpi-4', weekly_plan_id: 7, category: 'Emergency Fund', bucket_type: 'savings', amount: 150, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    ];
    const accounts: Accounts[] = [
      { id: 1, syncId: 'acc-1', name: 'Main', type: 'Everyday', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
      { id: 2, syncId: 'acc-2', name: 'Savings', type: 'Savings', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    ];
    const transactions: Transactions[] = [
      { id: 1, syncId: 'txn-1', name: 'Payroll', value: 1200, type: 'Income', account_id: 1, account_sync_id: 'acc-1', date: new Date('2024-01-02T10:00:00Z'), category: 'Salary', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
      { id: 2, syncId: 'txn-2', name: 'Rent', value: -450, type: 'Bills', account_id: 1, account_sync_id: 'acc-1', date: new Date('2024-01-03T10:00:00Z'), category: 'Rent', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
      { id: 3, syncId: 'txn-3', name: 'Groceries', value: -120, type: 'Expense', account_id: 1, account_sync_id: 'acc-1', date: new Date('2024-01-04T10:00:00Z'), category: 'Food', createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
      { id: 4, syncId: 'txn-4', name: 'Savings Transfer', value: -100, type: 'Transfer', account_id: 1, account_sync_id: 'acc-1', to_account_id: 2, to_account_sync_id: 'acc-2', date: new Date('2024-01-04T11:00:00Z'), category: 'Emergency Fund', createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
      { id: 5, syncId: 'txn-5', name: 'Ignored Transfer', value: -75, type: 'Transfer', account_id: 1, account_sync_id: 'acc-1', date: new Date('2024-01-04T12:00:00Z'), category: 'Ignore', createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
    ];

    const metrics = calculateCompareMetrics(snapshotItems, transactions, accounts, new Date('2024-01-01T00:00:00Z'), new Date('2024-01-07T23:59:59Z'));

    expect(metrics.actual_spending).toBe(570);
    expect(metrics.actual_income).toBe(1200);
    expect(metrics.actual_savings_progress).toBe(100);
    expect(metrics.spending_remaining).toBe(130);
    expect(metrics.savings_gap).toBe(50);
    expect(metrics.pacing_status).toBe('behind');
    expect(metrics.category_variances).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: 'Food', actual: 120, variance: 80 }),
      expect.objectContaining({ category: 'Rent', actual: 450, variance: 50 }),
      expect.objectContaining({ category: 'Emergency Fund', actual: 100, variance: 50 }),
    ]));
  });

  it('calculates pacing status thresholds', () => {
    expect(calculatePacingStatus(30, 50)).toBe('ahead');
    expect(calculatePacingStatus(52, 50)).toBe('on_track');
    expect(calculatePacingStatus(70, 50)).toBe('behind');
  });
});
