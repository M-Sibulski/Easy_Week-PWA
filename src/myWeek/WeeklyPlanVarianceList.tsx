import type { CompareCategoryVariance } from '../weeklyPlanning';

interface WeeklyPlanVarianceListProps {
  variances: CompareCategoryVariance[];
}

const formatCurrency = (value: number) => `${value < 0 ? '- ' : ''}$${Math.abs(value).toFixed(2)}`;

export default function WeeklyPlanVarianceList({ variances }: WeeklyPlanVarianceListProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[var(--ew-surface-100)] dark:text-[var(--ew-text)]">
      <h3 className="text-base font-semibold">Category variance</h3>
      <ul className="mt-3 space-y-2">
        {variances.map((variance) => (
          <li key={`${variance.bucket_type}-${variance.category}`} className="flex flex-col gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-[var(--ew-border)]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{variance.category}</span>
              <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">{variance.bucket_type.replace('_', ' ')}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-300">
              <span>Planned {formatCurrency(variance.planned)}</span>
              <span>Actual {formatCurrency(variance.actual)}</span>
              <span>Variance {formatCurrency(variance.variance)}</span>
            </div>
          </li>
        ))}
        {variances.length === 0 && <li className="text-sm text-gray-500 dark:text-gray-300">No planned categories yet.</li>}
      </ul>
    </section>
  );
}
