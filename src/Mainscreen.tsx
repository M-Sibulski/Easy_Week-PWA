import { useLiveQuery } from 'dexie-react-hooks';
import { Accounts, Settings, Transactions } from '../types.ts';
import { db } from '../db.ts';
import './App.css';
import Account from './Account.tsx';
import { useEffect, useRef, useState } from 'react';
import CreateTransaction from './CreateTransaction.tsx';
import WeekScreen from './WeekScreen.tsx';

const Mainscreen = () => {
  const [accountId, setAccountId] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const transactions = useLiveQuery<Transactions[]>(() => db.transactions.where("name").notEqual('').sortBy('date'));
  const settingsArray = useLiveQuery<Settings[]>(() => db.settings.toArray());
  const settings = settingsArray && settingsArray[0];
  const accounts = useLiveQuery<Accounts[]>(() => db.accounts.toArray());
  const transactionsInAccount: Transactions[] = transactions ? transactions.filter(t => t.account_id === accountId) : [];
  const transactionsToAccount: Transactions[] = transactions ? transactions.filter(t => t.to_account_id === accountId).map(t => ({...t, value: 0-t.value})) : [];
  const transactionsCombined: Transactions[] = [...transactionsInAccount, ...transactionsToAccount].sort((a, b) => a.date.getTime() - b.date.getTime());
  const accountTotal = transactionsCombined.reduce((accumulator, transaction) => accumulator + transaction.value, 0);

  const [scrollPosition, setScrollPosition] = useState(0);
  const [renderOpenButton, setRenderOpenButton] = useState(true);
  const scrollDemoRef = useRef(null);

  const clearAllCollections = () => {
    db.accounts.clear()
    db.transactions.clear()
    db.settings.clear()
  }

  const createMainAccount = async () => {
    try {
      await db.accounts.put({
        id: 1,
        name: 'Main Account',
        type: 'Everyday',
        dateCreated: new Date()
      });
      await db.accounts.put({
        id: 2,
        name: 'Savings',
        type: 'Savings',
        goalDate: new Date("2026/05/10"),
        goalValue: 4000,
        dateCreated: new Date()
      });
      } catch(error) {
          console.error(error)
      }
  }

  const createInitialSettings = async () => {
    try {
      await db.settings.put({
          id: 1,
          dark: true,
          main_account_id: 0,
          week_starting_day: 2
      });
      } catch(error) {
          console.error(error)
      }
  }

  useEffect(() => {
    //if first launch
    if(settingsArray && settingsArray.length === 0) {
      clearAllCollections();
      createMainAccount();
      createInitialSettings();
    }
    //Missing main account
    if (settings && accounts && accounts.length > 0 && !accounts?.find(a => a.id === accountId)) {
      if(accounts?.find(a => a.id === settings?.main_account_id)) //Just get from settings
        setAccountId(settings?.main_account_id)
      else { //Settings settings.main_account_id also wrong
        setAccountId(accounts?.reduce((m, c) => c.id < m.id ? c : m).id)
        db.settings.update(settings.id, {main_account_id: accounts?.reduce((m, c) => c.id < m.id ? c : m).id})
      }
    } else if (settings && accounts && accounts.length == 0) {
      setAccountId(0)
      db.settings.update(settings.id, {main_account_id: 0})
    }
    //All launches
    if (loading && settings) {
      setAccountId(settings.main_account_id);
      setLoading(false);
    }
    //Patch settings
    if(settings && !settings.week_starting_day) {
      db.settings.update(1, {week_starting_day: 2})
    }

  }, [accounts, accountId, loading, settings, settingsArray])

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