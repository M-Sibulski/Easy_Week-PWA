import { useAccounts, useSettingsArray, useTransactions } from './hooks/useAppData';
import { repository } from './repository';
import { Accounts, Settings, Transactions } from '../types.ts';
import './App.css';
import Account from './Account.tsx';
import { useEffect, useRef, useState } from 'react';
import CreateTransaction from './CreateTransaction.tsx';
import WeekScreen from './WeekScreen.tsx';
import { createSyncId } from '../syncIds.ts';
import { useAuth } from './auth/useAuth';

interface Props {
  syncReady?: boolean;
}

const Mainscreen = ({ syncReady = true }: Props) => {
  const { loading: authLoading, user } = useAuth();
  const [accountId, setAccountId] = useState(0);
  const [loading, setLoading] = useState(true);
  
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
  const scrollDemoRef = useRef(null);

  const findFallbackAccount = (items: Accounts[]) => items.reduce((best, current) => current.id < best.id ? current : best);

  const clearAllCollections = () => {
    repository.clearAccounts();
    repository.clearTransactions();
    repository.clearSettings();
  }

  const createMainAccount = async () => {
    const now = new Date();
    const mainAccountSyncId = createSyncId('acc');
    const savingsAccountSyncId = createSyncId('acc');

    try {
      await repository.putAccount({
        id: 1,
        syncId: mainAccountSyncId,
        name: 'Main Account',
        type: 'Everyday',
        createdAt: now,
        updatedAt: now,
      });
      await repository.putAccount({
        id: 2,
        syncId: savingsAccountSyncId,
        name: 'Savings',
        type: 'Savings',
        goalDate: new Date("2026/05/10"),
        goalValue: 4000,
        createdAt: now,
        updatedAt: now,
      });
      } catch(error) {
          console.error(error)
      }
  }

  const createInitialSettings = async () => {
    const now = new Date();

    try {
      await repository.putSettings({
          id: 1,
          syncId: createSyncId('set'),
          dark: true,
          main_account_id: 0,
          main_account_sync_id: undefined,
          week_starting_day: 2,
          createdAt: now,
          updatedAt: now,
      });
      } catch(error) {
          console.error(error)
      }
  }

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    //if first launch
    if(syncReady && settingsArray && settingsArray.length === 0) {
      clearAllCollections();
      createMainAccount();
      createInitialSettings();
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

  }, [accounts, accountId, authLoading, loading, settings, settingsArray, syncReady, user])

  const handleScroll = () => {
    if (scrollDemoRef.current) {
      const { scrollTop } = scrollDemoRef.current;
      if (scrollTop > scrollPosition) setRenderOpenButton(false)
      else setRenderOpenButton(true)
      setScrollPosition(scrollTop);
    }
  }

  const changeAccount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAccountId(Number(e.target.value))
  }
  return (
    <>
      <Account accountId={accountId} total={accountTotal} accounts={accounts} changeAccount={changeAccount} settings={settings}/>
      <WeekScreen transactions={transactionsCombined} accounts={accounts} settings={settings} handleScroll={handleScroll}/>
      
      <CreateTransaction accountId={accountId} accounts={accounts} renderOpenButton={renderOpenButton}/>
    </>
  )
}

export default Mainscreen;