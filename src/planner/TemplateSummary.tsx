import type { BucketType } from '../../types';
import { calculatePlanTotals } from '../weeklyPlanning';

interface TemplateSummaryProps {
  items: Array<{ bucket_type: BucketType; amount: number }>;
}

const formatCurrency = (value: number) => `${value < 0 ? '- ' : ''}$${Math.abs(value).toFixed(2)}`;

export default function TemplateSummary({ items }: TemplateSummaryProps) {
  const totals = calculatePlanTotals(items);

  return (
    <section className="rounded-2xl bg-blue-50 p-4 text-sm text-gray-800 shadow-sm dark:bg-blue-950/30 dark:text-[var(--ew-text)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Template summary</h3>
        <span data-testid="template-net-margin" className="font-semibold">Net margin {formatCurrency(totals.planned_net_margin)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <p>Income <span className="font-semibold">{formatCurrency(totals.planned_income)}</span></p>
        <p>Fixed <span className="font-semibold">{formatCurrency(totals.planned_fixed_expenses)}</span></p>
        <p>Variable <span className="font-semibold">{formatCurrency(totals.planned_variable_expenses)}</span></p>
        <p>Savings <span className="font-semibold">{formatCurrency(totals.planned_savings)}</span></p>
        <p>Total spend <span className="font-semibold">{formatCurrency(totals.planned_total_spend)}</span></p>
      </div>
    </section>
  );
}
