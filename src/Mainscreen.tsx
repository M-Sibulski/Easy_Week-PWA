import { useEffect, useRef, useState } from 'react';
import { Accounts, Settings, Transactions } from '../types.ts';
import './App.css';
import Account from './Account.tsx';
import BottomNav, { type MainTab } from './BottomNav.tsx';
import CreateTransaction from './CreateTransaction.tsx';
import { initializeStarterPack } from './defaultData.ts';
import { useAccounts, useSettingsArray, useTransactions } from './hooks/useAppData';
import PlannerScreen from './PlannerScreen.tsx';
import { repository } from './repository';
import { isResetCurrentUserDataInProgress } from './resetUserData.ts';
import WeekScreen from './WeekScreen.tsx';

interface Props {
  syncReady?: boolean;
}

function TabPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-300 p-6 dark:bg-[var(--ew-surface-300)]">
      <p className="text-center text-lg font-medium text-gray-700 dark:text-[var(--ew-text)]">{title}</p>
      <p className="mt-2 text-center text-sm text-gray-700 opacity-80 dark:text-[var(--ew-text)]">Coming soon</p>
    </div>
  );
}

const Mainscreen = ({ syncReady = true }: Props) => {
  const [accountId, setAccountId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>('myWeek');

  const transactions: Transactions[] | undefined = useTransactions();
  const settingsArray: Settings[] | undefined = useSettingsArray();
  const settings = settingsArray && settingsArray[0];
  const accounts: Accounts[] | undefined = useAccounts();
  const transactionsInAccount: Transactions[] = transactions ? transactions.filter((transaction) => transaction.account_id === accountId) : [];
  const transactionsToAccount: Transactions[] = transactions ? transactions.filter((transaction) => transaction.to_account_id === accountId).map((transaction) => ({ ...transaction, value: 0 - transaction.value })) : [];
  const transactionsCombined: Transactions[] = [...transactionsInAccount, ...transactionsToAccount].sort((left, right) => left.date.getTime() - right.date.getTime());
  const accountTotal = transactionsCombined.reduce((accumulator, transaction) => accumulator + transaction.value, 0);

  const [scrollPosition, setScrollPosition] = useState(0);
  const [renderOpenButton, setRenderOpenButton] = useState(true);
  const isInitializingLocalDataRef = useRef(false);

  const findFallbackAccount = (items: Accounts[]) => items.reduce((best, current) => current.id < best.id ? current : best);

  const clearAllCollections = async () => {
    await repository.clearAccounts();
    await repository.clearTransactions();
    await repository.clearCategorySuggestions();
    await repository.clearSettings();
  };

  const createStarterPack = async () => {
    try {
      await initializeStarterPack(repository);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const initializeLocalData = async () => {
      isInitializingLocalDataRef.current = true;

      try {
        await clearAllCollections();
        await createStarterPack();
      } finally {
        isInitializingLocalDataRef.current = false;
      }
    };

    if (
      syncReady
      && settingsArray
      && settingsArray.length === 0
      && !isResetCurrentUserDataInProgress()
      && !isInitializingLocalDataRef.current
    ) {
      void initializeLocalData();
    }

    if (settings && accounts && accounts.length > 0 && !accounts.find((account) => account.id === accountId)) {
      if (accounts.find((account) => account.id === settings.main_account_id)) {
        setAccountId(settings.main_account_id);
      } else {
        const fallbackAccount = findFallbackAccount(accounts);
        setAccountId(fallbackAccount.id);
        void repository.updateSettings(settings.id, { main_account_id: fallbackAccount.id, main_account_sync_id: fallbackAccount.syncId });
      }
    } else if (settings && accounts && accounts.length === 0) {
      setAccountId(0);
      void repository.updateSettings(settings.id, { main_account_id: 0, main_account_sync_id: undefined });
    }

    if (loading && settings) {
      setAccountId(settings.main_account_id);
      setLoading(false);
    }

    if (settings && !settings.week_starting_day) {
      void repository.updateSettings(1, { week_starting_day: 2 });
    }
  }, [accounts, accountId, loading, settings, settingsArray, syncReady]);

  useEffect(() => {
    if (syncReady) {
      void repository.lockPastWeeklyPlans(new Date());
    }
  }, [accountId, activeTab, syncReady]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    if (scrollTop > scrollPosition) {
      setRenderOpenButton(false);
    } else {
      setRenderOpenButton(true);
    }
    setScrollPosition(scrollTop);
  };

  const changeAccount = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAccountId(Number(event.target.value));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {(activeTab === 'planner' || activeTab === 'myWeek') && (
          <Account accountId={accountId} total={accountTotal} accounts={accounts} changeAccount={changeAccount} settings={settings} />
        )}
        {activeTab === 'planner' && <PlannerScreen accountId={accountId} accounts={accounts} settings={settings} />}
        {activeTab === 'myWeek' && (
          <WeekScreen
            accountId={accountId}
            transactions={transactionsCombined}
            accounts={accounts}
            settings={settings}
            handleScroll={handleScroll}
            onNavigateToPlanner={() => setActiveTab('planner')}
          />
        )}
        {activeTab === 'accounts' && <TabPlaceholder title="Accounts" />}
      </div>

      <div className="relative z-20 flex shrink-0 flex-col">
        {activeTab === 'myWeek' && (
          <CreateTransaction accountId={accountId} accounts={accounts} renderOpenButton={renderOpenButton} />
        )}
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
};

export default Mainscreen;
