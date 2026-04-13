import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import WeekScreen from './WeekScreen';
import type { Accounts, Settings, Transactions } from '../types';

vi.mock('./Day', () => ({
  default: ({ date, total, transactions }: { date: string; total: number; transactions: Transactions[] }) => (
    <div data-testid="day-summary">
      {date} | total={total} | tx={transactions.map((transaction) => transaction.name).join(',')}
    </div>
  ),
}));

describe('WeekScreen', () => {
  const handleScroll = vi.fn();
  const accounts: Accounts[] = [
    {
      id: 1,
      syncId: 'acc-main',
      name: 'Main',
      type: 'Everyday',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
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
    {
      id: 1,
      syncId: 'txn-salary',
      name: 'Salary',
      value: 1000,
      date: new Date('2024-01-01'),
      category: 'Work',
      type: 'Income',
      account_id: 1,
      account_sync_id: 'acc-main',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      syncId: 'txn-groceries',
      name: 'Groceries',
      value: -200,
      date: new Date('2024-01-03'),
      category: 'Food',
      type: 'Expense',
      account_id: 1,
      account_sync_id: 'acc-main',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
    {
      id: 3,
      syncId: 'txn-rent',
      name: 'Rent',
      value: -400,
      date: new Date('2024-01-08'),
      category: 'Housing',
      type: 'Expense',
      account_id: 1,
      account_sync_id: 'acc-main',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08'),
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-03T12:00:00'));
    handleScroll.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes the visible week from settings and groups matching transactions by day', () => {
    render(
      <WeekScreen
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
      />
    );

    expect(screen.getByText('2024-01-01 - 2024-01-07')).toBeInTheDocument();
    expect(screen.getByText('Monday, 1 | total=1000 | tx=Salary')).toBeInTheDocument();
    expect(screen.getByText('Wednesday, 3 | total=800 | tx=Groceries')).toBeInTheDocument();
    expect(screen.queryByText(/Rent/)).not.toBeInTheDocument();
  });

  it('moves between week ranges with the navigation buttons', async () => {
    render(
      <WeekScreen
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
      />
    );

    const [backButton, forwardButton] = screen.getAllByRole('button');

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
        transactions={transactions}
        accounts={accounts}
        settings={settings}
        handleScroll={handleScroll}
      />
    );

    const statementScreen = document.getElementById('statement-screen');
    expect(statementScreen).not.toBeNull();

    fireEvent.scroll(statementScreen!);

    expect(handleScroll).toHaveBeenCalled();
  });
});
