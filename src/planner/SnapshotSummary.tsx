import type { SnapshotStatus, WeeklyPlanSnapshotItem } from '../../types';
import { calculatePlanTotals } from '../weeklyPlanning';

interface SnapshotSummaryProps {
  items: WeeklyPlanSnapshotItem[];
  status: SnapshotStatus;
}

const formatCurrency = (value: number) => `${value < 0 ? '- ' : ''}$${Math.abs(value).toFixed(2)}`;

export default function SnapshotSummary({ items, status }: SnapshotSummaryProps) {
  const totals = calculatePlanTotals(items);
  const isLocked = status === 'locked';

  return (
    <section className="rounded-2xl bg-emerald-50 p-4 text-sm text-gray-800 shadow-sm dark:bg-emerald-950/30 dark:text-[var(--ew-text)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">This week&apos;s plan</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLocked ? 'bg-gray-700 text-white' : 'bg-emerald-600 text-white'}`}>
          {isLocked ? 'Locked' : 'Draft'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <p>Income <span className="font-semibold">{formatCurrency(totals.planned_income)}</span></p>
        <p>Fixed <span className="font-semibold">{formatCurrency(totals.planned_fixed_expenses)}</span></p>
        <p>Variable <span className="font-semibold">{formatCurrency(totals.planned_variable_expenses)}</span></p>
        <p>Savings <span className="font-semibold">{formatCurrency(totals.planned_savings)}</span></p>
        <p>Total spend <span className="font-semibold">{formatCurrency(totals.planned_total_spend)}</span></p>
        <p>Net margin <span className="font-semibold">{formatCurrency(totals.planned_net_margin)}</span></p>
      </div>
      {isLocked && <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">This plan is read-only because the week ended and the snapshot was locked.</p>}
    </section>
  );
}
