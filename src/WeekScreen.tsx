import { useEffect, useMemo, useRef, useState } from 'react';
import type { Accounts, Settings, Transactions } from '../types';
import { dateToInputType, dateToTitle, getNextWeekRange, getPrevWeekRange, getWeek, parseInputDate } from './dateConversions';
import { useWeeklyPlansByAccount } from './hooks/useAppData';
import Day from './Day';
import NoWeeklyPlanState from './myWeek/NoWeeklyPlanState';
import WeeklyPlanCompareCards from './myWeek/WeeklyPlanCompareCards';
import WeeklyPlanVarianceList from './myWeek/WeeklyPlanVarianceList';
import WeekNavigation from './WeekNavigation';
import { calculateCompareMetrics, findSnapshotForWeek, normalizeWeekEnd, normalizeWeekStart } from './weeklyPlanning';

interface Props {
  accountId: number;
  transactions: Transactions[];
  accounts: Accounts[] | undefined;
  settings: Settings | undefined;
  handleScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
  onNavigateToPlanner?: () => void;
}

const WeekScreen = ({ accountId, transactions, accounts, settings, handleScroll, onNavigateToPlanner }: Props) => {
  const [week, setWeek] = useState({ weekStart: new Date(), weekEnd: new Date() });
  const weeklyPlans = useWeeklyPlansByAccount(accountId);
  const scrollDemoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const today = new Date();
    if (settings) {
      setWeek(getWeek(today, settings.week_starting_day));
    }
  }, [settings]);

  const normalizedWeekStart = useMemo(() => normalizeWeekStart(week.weekStart), [week.weekStart]);
  const normalizedWeekEnd = useMemo(() => normalizeWeekEnd(week.weekEnd), [week.weekEnd]);
  const weekTransactions = useMemo(() => transactions.filter((transaction) => transaction.date >= normalizedWeekStart && transaction.date <= normalizedWeekEnd), [normalizedWeekEnd, normalizedWeekStart, transactions]);
  const dateNames = useMemo(() => Array.from(new Set(weekTransactions.map((transaction) => dateToInputType(transaction.date)))), [weekTransactions]);

  const selectedPlan = useMemo(() => {
    if (!weeklyPlans) {
      return undefined;
    }

    const match = findSnapshotForWeek(weeklyPlans.map((plan) => plan.snapshot), normalizedWeekStart, normalizedWeekEnd);
    return weeklyPlans.find((plan) => plan.snapshot.id === match?.id);
  }, [normalizedWeekEnd, normalizedWeekStart, weeklyPlans]);

  const compareMetrics = useMemo(() => {
    if (!selectedPlan) {
      return undefined;
    }

    return calculateCompareMetrics(selectedPlan.items, transactions, accounts ?? [], selectedPlan.snapshot.week_start, selectedPlan.snapshot.week_end);
  }, [accounts, selectedPlan, transactions]);

  const handleNavBack = () => {
    setWeek(getPrevWeekRange(week));
  };

  const handleNavForward = () => {
    setWeek(getNextWeekRange(week));
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-hidden">
      <WeekNavigation week={week} navBack={handleNavBack} navForward={handleNavForward} />
      <div ref={scrollDemoRef} onScroll={handleScroll} id="statement-screen" className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-300 p-3 box-border dark:bg-[var(--ew-surface-300)]">
        {compareMetrics ? (
          <>
            <WeeklyPlanCompareCards metrics={compareMetrics} />
            <WeeklyPlanVarianceList variances={compareMetrics.category_variances} />
          </>
        ) : (
          <NoWeeklyPlanState onNavigateToPlanner={onNavigateToPlanner} />
        )}
        {dateNames.map((dateName) => (
          <Day
            key={dateName}
            date={dateToTitle(parseInputDate(dateName))}
            transactions={weekTransactions.filter((transaction) => dateToInputType(transaction.date) === dateName)}
            accounts={accounts}
            total={weekTransactions.filter((transaction) => dateToInputType(transaction.date) <= dateName).reduce((accumulator, transaction) => accumulator + transaction.value, 0)}
          />
        ))}
      </div>
    </div>
  );
};

export default WeekScreen;
