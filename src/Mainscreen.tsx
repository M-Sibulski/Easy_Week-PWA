import { useAccounts, useSettingsArray, useTransactions } from './hooks/useAppData';
import { repository } from './repository';
import { Accounts, Settings, Transactions } from '../types.ts';
import './App.css';
import Account from './Account.tsx';
import { useEffect, useRef, useState } from 'react';
import CreateTransaction from './CreateTransaction.tsx';
import WeekScreen from './WeekScreen.tsx';
import { initializeStarterPack } from './defaultData.ts';
import { isResetCurrentUserDataInProgress } from './resetUserData.ts';
import BottomNav, { type MainTab } from './BottomNav.tsx';

interface Props {
  syncReady?: boolean;
}

function TabPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-300 p-6">
      <p className="text-center text-lg font-medium text-gray-700">{title}</p>
      <p className="mt-2 text-center text-sm text-gray-700 opacity-80">Coming soon</p>
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
  const transactionsInAccount: Transactions[] = transactions ? transactions.filter(t => t.account_id === accountId) : [];
  const transactionsToAccount: Transactions[] = transactions ? transactions.filter(t => t.to_account_id === accountId).map(t => ({...t, value: 0-t.value})) : [];
  const transactionsCombined: Transactions[] = [...transactionsInAccount, ...transactionsToAccount].sort((a, b) => a.date.getTime() - b.date.getTime());
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
  }

  const createStarterPack = async () => {
    try {
      await initializeStarterPack(repository);
    } catch(error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const initializeLocalData = async () => {
      isInitializingLocalDataRef.current = true;

      try {
        await clearAllCollections();
        await createStarterPack();
      } finally {
        isInitializingLocalDataRef.current = false;
      }
    }

    //if first launch
    if(
      syncReady &&
      settingsArray &&
      settingsArray.length === 0 &&
      !isResetCurrentUserDataInProgress() &&
      !isInitializingLocalDataRef.current
    ) {
      void initializeLocalData();
    }
    //Missing main account
    if (settings && accounts && accounts.length > 0 && !accounts?.find(a => a.id === accountId)) {
      if(accounts?.find(a => a.id === settings?.main_account_id)) //Just get from settings
        setAccountId(settings?.main_account_id)
      else { //Settings settings.main_account_id also wrong
        const fallbackAccount = findFallbackAccount(accounts)
        setAccountId(fallbackAccount.id)
        repository.updateSettings(settings.id, {main_account_id: fallbackAccount.id, main_account_sync_id: fallbackAccount.syncId})
      }
    } else if (settings && accounts && accounts.length == 0) {
      setAccountId(0)
      repository.updateSettings(settings.id, {main_account_id: 0, main_account_sync_id: undefined})
    }
    //All launches
    if (loading && settings) {
      setAccountId(settings.main_account_id);
      setLoading(false);
    }
    //Patch settings
    if(settings && !settings.week_starting_day) {
      repository.updateSettings(1, {week_starting_day: 2})
    }

  }, [accounts, accountId, loading, settings, settingsArray, syncReady])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop > scrollPosition) setRenderOpenButton(false);
    else setRenderOpenButton(true);
    setScrollPosition(scrollTop);
  };

  const changeAccount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAccountId(Number(e.target.value))
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'planner' && <TabPlaceholder title="Planner" />}
        {activeTab === 'myWeek' && (
          <>
            <Account accountId={accountId} total={accountTotal} accounts={accounts} changeAccount={changeAccount} settings={settings}/>
            <WeekScreen transactions={transactionsCombined} accounts={accounts} settings={settings} handleScroll={handleScroll}/>
          </>
        )}
        {activeTab === 'accounts' && <TabPlaceholder title="Accounts" />}
      </div>

      <div className="relative z-20 flex shrink-0 flex-col">
        {activeTab === 'myWeek' && (
          <CreateTransaction accountId={accountId} accounts={accounts} renderOpenButton={renderOpenButton}/>
        )}
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}

export default Mainscreen;