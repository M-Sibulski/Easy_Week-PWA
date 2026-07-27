import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import {
  Accounts,
  Settings,
  StandardWeekTemplateItem,
  Transactions,
  WeeklyPlanSnapshot,
  WeeklyPlanSnapshotItem,
} from '../../types';
import type { SnapshotWithItems, TemplateWithItems } from '../repository';

const notDeleted = <T extends { deletedAt?: Date }>(item: T) => !item.deletedAt;

export function useAccounts() {
  return useLiveQuery<Accounts[]>(async () => {
    const accounts = await db.accounts.toArray();
    return accounts.filter(notDeleted);
  });
}

export function useTransactions() {
  return useLiveQuery<Transactions[]>(async () => {
    const transactions = await db.transactions.where('name').notEqual('').sortBy('date');
    return transactions.filter(notDeleted);
  });
}

export function useSettingsArray() {
  return useLiveQuery<Settings[]>(async () => {
    const settings = await db.settings.toArray();
    return settings.filter(notDeleted);
  });
}

export function useStandardWeekTemplate(accountId: number) {
  return useLiveQuery<TemplateWithItems | undefined>(async () => {
    if (!accountId) {
      return undefined;
    }

    const templates = await db.standardWeekTemplates.where('account_id').equals(accountId).toArray();
    const activeTemplate = templates.filter(notDeleted).sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())[0];

    if (!activeTemplate) {
      return undefined;
    }

    const items = await db.standardWeekTemplateItems.where('template_id').equals(activeTemplate.id).toArray();

    return {
      template: activeTemplate,
      items: items.filter(notDeleted),
    };
  }, [accountId]);
}

export function useWeeklyPlansByAccount(accountId: number) {
  return useLiveQuery<SnapshotWithItems[]>(async () => {
    if (!accountId) {
      return [];
    }

    const plans = await db.weeklyPlans.where('account_id').equals(accountId).toArray();
    const activePlans = plans
      .filter(notDeleted)
      .sort((left, right) => right.week_start.getTime() - left.week_start.getTime());

    const itemsByPlanId = new Map<number, WeeklyPlanSnapshotItem[]>();

    for (const plan of activePlans) {
      const items = await db.weeklyPlanItems.where('weekly_plan_id').equals(plan.id).toArray();
      itemsByPlanId.set(plan.id, items.filter(notDeleted));
    }

    return activePlans.map((snapshot) => ({
      snapshot,
      items: itemsByPlanId.get(snapshot.id) ?? [],
    }));
  }, [accountId]);
}

export function useWeeklyPlanByAccountAndWeek(accountId: number, weekStart: Date, weekEnd: Date) {
  return useLiveQuery<SnapshotWithItems | undefined>(async () => {
    if (!accountId) {
      return undefined;
    }

    const plans = await db.weeklyPlans.where('account_id').equals(accountId).toArray();
    const snapshot = plans.find((plan) => notDeleted(plan)
      && plan.week_start.getTime() === weekStart.getTime()
      && plan.week_end.getTime() === weekEnd.getTime());

    if (!snapshot) {
      return undefined;
    }

    const items = await db.weeklyPlanItems.where('weekly_plan_id').equals(snapshot.id).toArray();

    return {
      snapshot,
      items: items.filter(notDeleted),
    };
  }, [accountId, weekStart.getTime(), weekEnd.getTime()]);
}

export type { TemplateWithItems, SnapshotWithItems, StandardWeekTemplateItem, WeeklyPlanSnapshot };
