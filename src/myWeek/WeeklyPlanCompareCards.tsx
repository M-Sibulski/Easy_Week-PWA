import type { CompareMetrics } from '../weeklyPlanning';

interface WeeklyPlanCompareCardsProps {
  metrics: CompareMetrics;
}

const formatCurrency = (value: number) => `${value < 0 ? '- ' : ''}$${Math.abs(value).toFixed(2)}`;

const pacingLabel: Record<CompareMetrics['pacing_status'], string> = {
  ahead: 'Ahead',
  on_track: 'On track',
  behind: 'Behind',
};

export default function WeeklyPlanCompareCards({ metrics }: WeeklyPlanCompareCardsProps) {
  const cards = [
    { title: 'Spending remaining', value: formatCurrency(metrics.spending_remaining), subtitle: `Spent ${formatCurrency(metrics.actual_spending)} of ${formatCurrency(metrics.planned_total_spend)}` },
    { title: 'Income', value: formatCurrency(metrics.actual_income), subtitle: `Planned ${formatCurrency(metrics.planned_income)}` },
    { title: 'Savings progress', value: formatCurrency(metrics.actual_savings_progress), subtitle: `Gap ${formatCurrency(metrics.savings_gap)}` },
    { title: 'Pacing status', value: pacingLabel[metrics.pacing_status], subtitle: `${formatCurrency(metrics.pacing_delta)} vs target ${formatCurrency(metrics.pacing_target_to_date)}` },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2" aria-label="Weekly plan compare cards">
      {cards.map((card) => (
        <article key={card.title} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[var(--ew-surface-100)] dark:text-[var(--ew-text)]">
          <p className="text-sm text-gray-500 dark:text-gray-300">{card.title}</p>
          <p className="mt-2 text-xl font-semibold">{card.value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">{card.subtitle}</p>
        </article>
      ))}
    </section>
  );
}
