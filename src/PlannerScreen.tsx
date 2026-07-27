import { useEffect, useMemo, useRef, useState } from 'react';
import type { Accounts, Settings, WeeklyPlanSnapshotItem } from '../types';
import { getWeek } from './dateConversions';
import { useStandardWeekTemplate, useWeeklyPlansByAccount } from './hooks/useAppData';
import SnapshotItemEditor from './planner/SnapshotItemEditor';
import SnapshotSummary from './planner/SnapshotSummary';
import TemplateItemRow, { type PlannerEditableItem } from './planner/TemplateItemRow';
import TemplateSummary from './planner/TemplateSummary';
import { repository } from './repository';
import {
  findSnapshotForWeek,
  isSnapshotEditable,
  normalizeWeekEnd,
  normalizeWeekStart,
  validateTemplateItem,
} from './weeklyPlanning';

interface PlannerScreenProps {
  accountId: number;
  accounts?: Accounts[];
  settings?: Settings;
  referenceDate?: Date;
}

const createLocalId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createEmptyItem = (): PlannerEditableItem => ({
  localId: createLocalId(),
  category: '',
  bucket_type: 'variable_expense',
  amount: 0,
});

const toEditableItem = (item: { id?: number; category: string; bucket_type: PlannerEditableItem['bucket_type']; amount: number }): PlannerEditableItem => ({
  localId: createLocalId(),
  id: item.id,
  category: item.category,
  bucket_type: item.bucket_type,
  amount: item.amount,
});

export default function PlannerScreen({ accountId, accounts, settings, referenceDate = new Date() }: PlannerScreenProps) {
  const templateData = useStandardWeekTemplate(accountId);
  const weeklyPlans = useWeeklyPlansByAccount(accountId);
  const account = accounts?.find((item) => item.id === accountId);
  const idMapRef = useRef(new Map<number, string>());
  const [templateName, setTemplateName] = useState('Standard Week');
  const [templateNotes, setTemplateNotes] = useState('');
  const [templateItems, setTemplateItems] = useState<PlannerEditableItem[]>([createEmptyItem()]);
  const [templateError, setTemplateError] = useState<string | undefined>();
  const [templateSuccess, setTemplateSuccess] = useState<string | undefined>();
  const [snapshotNotes, setSnapshotNotes] = useState('');
  const [snapshotItems, setSnapshotItems] = useState<PlannerEditableItem[]>([]);
  const [snapshotMessage, setSnapshotMessage] = useState<string | undefined>();
  const plannerWeek = useMemo(() => getWeek(referenceDate, settings?.week_starting_day ?? 1), [referenceDate, settings?.week_starting_day]);
  const normalizedWeekStart = useMemo(() => normalizeWeekStart(plannerWeek.weekStart), [plannerWeek.weekStart]);
  const normalizedWeekEnd = useMemo(() => normalizeWeekEnd(plannerWeek.weekEnd), [plannerWeek.weekEnd]);

  const currentSnapshot = useMemo(() => {
    if (!weeklyPlans) {
      return undefined;
    }

    const match = findSnapshotForWeek(weeklyPlans.map((item) => item.snapshot), normalizedWeekStart, normalizedWeekEnd);
    return weeklyPlans.find((plan) => plan.snapshot.id === match?.id);
  }, [normalizedWeekEnd, normalizedWeekStart, weeklyPlans]);

  const snapshotEditable = currentSnapshot ? isSnapshotEditable(currentSnapshot.snapshot) : false;

  useEffect(() => {
    if (templateData) {
      setTemplateName(templateData.template.name);
      setTemplateNotes(templateData.template.notes ?? '');
      setTemplateItems(templateData.items.length > 0 ? templateData.items.map((item) => toEditableItem(item)) : [createEmptyItem()]);
      setTemplateError(undefined);
    } else {
      setTemplateName('Standard Week');
      setTemplateNotes('');
      setTemplateItems([createEmptyItem()]);
    }
  }, [templateData]);

  useEffect(() => {
    if (!currentSnapshot) {
      setSnapshotNotes('');
      setSnapshotItems([]);
      return;
    }

    currentSnapshot.items.forEach((item) => {
      const existing = idMapRef.current.get(item.id);
      if (!existing) {
        idMapRef.current.set(item.id, createLocalId());
      }
    });
    setSnapshotNotes(currentSnapshot.snapshot.notes ?? '');
    setSnapshotItems(currentSnapshot.items.map((item) => ({
      localId: idMapRef.current.get(item.id) ?? createLocalId(),
      id: item.id,
      category: item.category,
      bucket_type: item.bucket_type,
      amount: item.amount,
    })));
  }, [currentSnapshot]);

  const templateSummaryItems = useMemo(() => templateItems.map((item) => ({ bucket_type: item.bucket_type, amount: Number(item.amount) || 0 })), [templateItems]);
  const snapshotSummaryItems = useMemo<WeeklyPlanSnapshotItem[]>(() => snapshotItems.map((item, index) => ({
    id: item.id ?? index + 1,
    syncId: `local-${item.localId}`,
    weekly_plan_id: currentSnapshot?.snapshot.id ?? 0,
    category: item.category,
    bucket_type: item.bucket_type,
    amount: Number(item.amount) || 0,
    createdAt: currentSnapshot?.snapshot.createdAt ?? referenceDate,
    updatedAt: currentSnapshot?.snapshot.updatedAt ?? referenceDate,
  })), [currentSnapshot?.snapshot.createdAt, currentSnapshot?.snapshot.id, currentSnapshot?.snapshot.updatedAt, referenceDate, snapshotItems]);

  const validateRows = (rows: PlannerEditableItem[]) => {
    const meaningfulRows = rows.filter((row) => row.category.trim() || row.amount > 0);

    if (meaningfulRows.length === 0) {
      return 'Add at least one weekly plan item.';
    }

    const errors = meaningfulRows.flatMap((row) => validateTemplateItem({
      category: row.category,
      bucket_type: row.bucket_type,
      amount: Number(row.amount),
    }));

    return errors[0];
  };

  const updateTemplateItem = (nextItem: PlannerEditableItem) => {
    setTemplateItems((items) => items.map((item) => item.localId === nextItem.localId ? nextItem : item));
  };

  const updateSnapshotItem = (nextItem: PlannerEditableItem) => {
    setSnapshotItems((items) => items.map((item) => item.localId === nextItem.localId ? nextItem : item));
  };

  const saveTemplate = async () => {
    if (!account || !settings) {
      setTemplateError('Select an account before creating a template.');
      return;
    }

    const error = validateRows(templateItems);
    if (error) {
      setTemplateError(error);
      return;
    }

    const meaningfulRows = templateItems.filter((row) => row.category.trim() || row.amount > 0);

    await repository.upsertStandardWeekTemplate({
      id: templateData?.template.id,
      account_id: account.id,
      account_sync_id: account.syncId,
      week_starting_day_snapshot: settings.week_starting_day,
      name: templateName,
      notes: templateNotes,
    }, meaningfulRows.map((row) => ({
      template_id: templateData?.template.id ?? 0,
      category: row.category.trim(),
      bucket_type: row.bucket_type,
      amount: Number(row.amount),
    })));

    setTemplateError(undefined);
    setTemplateSuccess('Standard week template saved.');
  };

  const createWeeklyPlan = async () => {
    if (!account) {
      setSnapshotMessage('Select an account before creating a weekly plan.');
      return;
    }

    await repository.createWeeklyPlanFromTemplate(account.id, normalizedWeekStart, normalizedWeekEnd);
    setSnapshotMessage('This week plan created.');
  };

  const saveSnapshot = async () => {
    if (!currentSnapshot) {
      return;
    }

    const error = validateRows(snapshotItems);
    if (error) {
      setSnapshotMessage(error);
      return;
    }

    const existingById = new Map(currentSnapshot.items.map((item) => [item.id, item]));
    const add = snapshotItems.filter((item) => !item.id).map((item) => ({
      weekly_plan_id: currentSnapshot.snapshot.id,
      category: item.category.trim(),
      bucket_type: item.bucket_type,
      amount: Number(item.amount),
    }));
    const update = snapshotItems.flatMap((item) => {
      if (!item.id) {
        return [];
      }

      const existing = existingById.get(item.id);
      if (!existing) {
        return [];
      }

      if (existing.category === item.category && existing.bucket_type === item.bucket_type && existing.amount === Number(item.amount)) {
        return [];
      }

      return [{
        id: item.id,
        changes: {
          category: item.category.trim(),
          bucket_type: item.bucket_type,
          amount: Number(item.amount),
        },
      }];
    });
    const remove = currentSnapshot.items.filter((item) => !snapshotItems.some((row) => row.id === item.id)).map((item) => item.id);

    await repository.updateWeeklyPlan(currentSnapshot.snapshot.id, { notes: snapshotNotes }, { add, update, remove });
    setSnapshotMessage('Weekly plan saved.');
  };

  if (!accountId || !account) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-300 p-6 text-center dark:bg-[var(--ew-surface-300)] dark:text-[var(--ew-text)]">
        Select an account to start planning your week.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-gray-300 p-4 dark:bg-[var(--ew-surface-300)] dark:text-[var(--ew-text)]">
      <header className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[var(--ew-surface-100)]">
        <p className="text-sm text-gray-500 dark:text-gray-300">Planner</p>
        <h2 className="text-xl font-semibold">{account.name}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Week of {normalizedWeekStart.toLocaleDateString()} - {normalizedWeekEnd.toLocaleDateString()}</p>
      </header>

      {!currentSnapshot && (
        <section className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-[var(--ew-surface-100)]">
          <div>
            <h3 className="text-lg font-semibold">{templateData ? 'Standard week template' : 'Create your standard week template'}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Build one reusable weekly plan per account with categories for income, spending, and savings.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              aria-label="Template name"
              type="text"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="Template name"
              className="rounded-lg border border-gray-300 px-3 py-2 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)]"
            />
            <textarea
              aria-label="Template notes"
              value={templateNotes}
              onChange={(event) => setTemplateNotes(event.target.value)}
              placeholder="Notes"
              rows={2}
              className="rounded-lg border border-gray-300 px-3 py-2 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)]"
            />
          </div>

          <div className="flex flex-col gap-3">
            {templateItems.map((item) => (
              <TemplateItemRow
                key={item.localId}
                item={item}
                onChange={updateTemplateItem}
                onDelete={(localId) => setTemplateItems((rows) => rows.length > 1 ? rows.filter((row) => row.localId !== localId) : [createEmptyItem()])}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTemplateItems((items) => [...items, createEmptyItem()])}
              className="rounded-full border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-950/30"
            >
              Add template item
            </button>
            <button
              type="button"
              onClick={() => void saveTemplate()}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Save standard week
            </button>
            {templateData && (
              <button
                type="button"
                onClick={() => void createWeeklyPlan()}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Create this week plan
              </button>
            )}
          </div>

          {templateError && <p role="alert" className="text-sm text-red-600">{templateError}</p>}
          {templateSuccess && <p className="text-sm text-emerald-600">{templateSuccess}</p>}
          <TemplateSummary items={templateSummaryItems} />
        </section>
      )}

      {currentSnapshot && (
        <section className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-[var(--ew-surface-100)]">
          <SnapshotSummary items={snapshotSummaryItems} status={currentSnapshot.snapshot.status} />
          <textarea
            aria-label="Weekly plan notes"
            value={snapshotNotes}
            disabled={!snapshotEditable}
            onChange={(event) => setSnapshotNotes(event.target.value)}
            rows={3}
            className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-70 dark:border-[var(--ew-border)] dark:bg-[var(--ew-surface-200)]"
          />
          <div className="flex flex-col gap-3">
            {snapshotItems.map((item) => (
              <SnapshotItemEditor
                key={item.localId}
                item={item}
                editable={snapshotEditable}
                onChange={updateSnapshotItem}
                onDelete={(localId) => setSnapshotItems((items) => items.filter((row) => row.localId !== localId))}
              />
            ))}
          </div>
          {snapshotEditable && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSnapshotItems((items) => [...items, createEmptyItem()])}
                className="rounded-full border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-950/30"
              >
                Add snapshot item
              </button>
              <button
                type="button"
                onClick={() => void saveSnapshot()}
                className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Save weekly plan
              </button>
            </div>
          )}
          {snapshotMessage && <p className="text-sm text-emerald-600">{snapshotMessage}</p>}
        </section>
      )}
    </div>
  );
}
