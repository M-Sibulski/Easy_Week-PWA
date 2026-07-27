interface NoWeeklyPlanStateProps {
  onNavigateToPlanner?: () => void;
}

export default function NoWeeklyPlanState({ onNavigateToPlanner }: NoWeeklyPlanStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-blue-300 bg-white p-4 text-center shadow-sm dark:border-blue-700 dark:bg-[var(--ew-surface-100)] dark:text-[var(--ew-text)]">
      <h3 className="text-base font-semibold">No weekly plan yet</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Create this week&apos;s plan in Planner to compare your spending, income, and savings progress.</p>
      {onNavigateToPlanner && (
        <button
          type="button"
          onClick={onNavigateToPlanner}
          className="mt-4 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          Go to Planner
        </button>
      )}
    </section>
  );
}
