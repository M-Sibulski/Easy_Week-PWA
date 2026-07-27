import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import WeekScreen from './WeekScreen';
import type { Accounts, Settings, Transactions } from '../types';

const { mockUseWeeklyPlansByAccount } = vi.hoisted(() => ({
  mockUseWeeklyPlansByAccount: vi.fn(),
}));

vi.mock('./hooks/useAppData', () => ({
  useWeeklyPlansByAccount: (accountId: number) => mockUseWeeklyPlansByAccount(accountId),
}));

vi.mock('./Day', () => ({
  default: ({ date, total, transactions }: { date: string; total: number; transactions: Transactions[] }) => (
    <div data-testid="day-summary">
      {date} | total={total} | tx={transactions.map((transaction) => transaction.name).join(',')}
    </div>
  ),
}));

describe('WeekScreen', () => {
  const handleScroll = vi.fn();
  const onNavigateToPlanner = vi.fn();
  const accounts: Accounts[] = [
    { id: 1, syncId: 'acc-main', name: 'Main', type: 'Everyday', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: 2, syncId: 'acc-save', name: 'Savings', type: 'Savings', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  ];
  const settings: Settings = {
    id: 1,
    syncId: 'set-main',
    dark: true,
    main_account_id: 1,
    main_account_sync_id: 'acc-main',
    week_starting_day: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };
  const transactions: Transactions[] = [
    { id: 1, syncId: 'txn-salary', name: 'Salary', value: 1000, date: new Date('2024-01-01'), category: 'Salary', type: 'Income', account_id: 1, account_sync_id: 'acc-main', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: 2, syncId: 'txn-groceries', name: 'Groceries', value: -200, date: new Date('2024-01-03'), category: 'Food', type: 'Expense', account_id: 1, account_sync_id: 'acc-main', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
    { id: 3, syncId: 'txn-rent', name: 'Rent', value: -400, date: new Date('2024-01-08'), category: 'Rent', type: 'Bills', account_id: 1, account_sync_id: 'acc-main', createdAt: new Date('2024-01-08'), updatedAt: new Date('2024-01-08') },
    { id: 4, syncId: 'txn-transfer', name: 'Transfer', value: -50, date: new Date('2024-01-04'), category: 'Emergency Fund', type: 'Transfer', account_id: 1, account_sync_id: 'acc-main', to_account_id: 2, to_account_sync_id: 'acc-save', createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-03T12:00:00Z'));
    handleScroll.mockReset();
    onNavigateToPlanner.mockReset();
    mockUseWeeklyPlansByAccount.mockReturnValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes the visible week from settings and groups matching transactions by day', () => {
    render(
      <WeekScreen
        accountId={1}
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
        onNavigateToPlanner={onNavigateToPlanner}
      />,
    );

    expect(screen.getByText('2024-01-01 - 2024-01-07')).toBeInTheDocument();
    expect(screen.getByText('Monday, 1 | total=1000 | tx=Salary')).toBeInTheDocument();
    expect(screen.getByText('Wednesday, 3 | total=800 | tx=Groceries')).toBeInTheDocument();
    expect(screen.queryByText(/Rent/)).not.toBeInTheDocument();
  });

  it('shows a planner CTA when no weekly plan exists for the selected week', () => {
    render(
      <WeekScreen
        accountId={1}
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
        onNavigateToPlanner={onNavigateToPlanner}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to Planner' }));
    expect(onNavigateToPlanner).toHaveBeenCalled();
  });

  it('renders compare cards and variance list when a weekly plan exists', () => {
    mockUseWeeklyPlansByAccount.mockReturnValue([
      {
        snapshot: {
          id: 5,
          syncId: 'wpl-5',
          account_id: 1,
          account_sync_id: 'acc-main',
          template_id: 2,
          week_start: new Date('2024-01-01T00:00:00.000Z'),
          week_end: new Date('2024-01-07T23:59:59.999Z'),
          status: 'draft',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        items: [
          { id: 21, syncId: 'wpi-21', weekly_plan_id: 5, category: 'Food', bucket_type: 'variable_expense', amount: 300, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
          { id: 22, syncId: 'wpi-22', weekly_plan_id: 5, category: 'Emergency Fund', bucket_type: 'savings', amount: 100, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
        ],
      },
    ]);

    render(
      <WeekScreen
        accountId={1}
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
        onNavigateToPlanner={onNavigateToPlanner}
      />,
    );

    expect(screen.getByText('Spending remaining')).toBeInTheDocument();
    expect(screen.getByText('Savings progress')).toBeInTheDocument();
    expect(screen.getByText('Category variance')).toBeInTheDocument();
    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
  });

  it('moves between week ranges with the navigation buttons', async () => {
    render(
      <WeekScreen
        accountId={1}
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
        onNavigateToPlanner={onNavigateToPlanner}
      />,
    );

    const [backButton, forwardButton] = screen.getAllByRole('button').filter((button) => button.textContent === '');

    fireEvent.click(forwardButton);
    expect(screen.getByText('2024-01-08 - 2024-01-14')).toBeInTheDocument();
    expect(screen.getByText('Monday, 8 | total=-400 | tx=Rent')).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(screen.getByText('2024-01-01 - 2024-01-07')).toBeInTheDocument();
    expect(screen.getByText('Monday, 1 | total=1000 | tx=Salary')).toBeInTheDocument();
  });

  it('forwards scroll events from the statement container', () => {
    render(
      <WeekScreen
        accountId={1}
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
        onNavigateToPlanner={onNavigateToPlanner}
      />,
    );

    const statementScreen = document.getElementById('statement-screen');
    expect(statementScreen).not.toBeNull();

    fireEvent.scroll(statementScreen!);

    expect(handleScroll).toHaveBeenCalled();
  });

  it('statement container uses dark: utility class for theming (D-003 readability)', () => {
    const { container } = render(
      <WeekScreen
        accountId={1}
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
        onNavigateToPlanner={onNavigateToPlanner}
      />,
    );
    const statementScreen = container.querySelector('#statement-screen');
    expect(statementScreen?.className).toContain('dark:');
  });

  it('navigation arrows use fill="currentColor" so they are visible in dark mode (D-004 regression)', () => {
    const { container } = render(
      <WeekScreen
        accountId={1}
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
        onNavigateToPlanner={onNavigateToPlanner}
      />,
    );
    const svgs = container.querySelectorAll('svg');
    svgs.forEach((svg) => {
      expect(svg.getAttribute('fill')).toBe('currentColor');
    });
  });
});
