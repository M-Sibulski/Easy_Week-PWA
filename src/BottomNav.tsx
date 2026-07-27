import './App.css';

export type MainTab = 'planner' | 'myWeek' | 'accounts';

interface BottomNavProps {
  active: MainTab;
  onChange: (tab: MainTab) => void;
}

const tabs: { id: MainTab; label: string }[] = [
  { id: 'planner', label: 'Planner' },
  { id: 'myWeek', label: 'myWeek' },
  { id: 'accounts', label: 'Accounts' },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Main"
      className="flex w-full items-stretch justify-around gap-1 border-t border-gray-400/50 bg-gray-100 dark:bg-[var(--ew-surface-100)] pt-1 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      {tabs.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(id)}
            className={
              'flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center rounded-t-lg px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ' +
              (isActive
                ? 'bg-blue-500 text-gray-50'
                : 'text-gray-700 dark:text-[var(--ew-text)] hover:bg-gray-200 dark:hover:bg-[var(--ew-surface-200)]')
            }
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
