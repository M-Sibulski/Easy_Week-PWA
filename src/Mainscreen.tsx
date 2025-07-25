import { useLiveQuery } from 'dexie-react-hooks';
import { Accounts, db, Settings } from '../db.ts';
import { Transactions } from '../db.ts';
import './App.css';
import Day from './Day.tsx';
import { dateToInputType } from './dateConversions.ts';
import Account from './Account.tsx';
import { useEffect, useState } from 'react';
import CreateTransaction from './CreateTransaction.tsx';

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
  const dateNames = transactionsCombined ? Array.from(new Set(transactionsCombined.map(t => dateToInputType(t.date)))) : [];
  const accountTotal = transactionsCombined.reduce((accumulator, transaction) => accumulator + transaction.value, 0);
  // const [accountTotal, setAccountTotal] = useState(transactionsCombined.reduce((accumulator, transaction) => accumulator + transaction.value, 0));
  // useEffect(() => {
  //   settings = settingsArray && settingsArray[0];
  //   transactionsInAccount = transactions ? transactions.filter(t => t.account_id === accountId) : [];
  //   transactionsToAccount = transactions ? transactions.filter(t => t.to_account_id === accountId).map(t => ({...t, value: 0-t.value})) : [];
  //   transactionsCombined = [...transactionsInAccount, ...transactionsToAccount].sort((a, b) => a.date.getTime() - b.date.getTime());
  //   dateNames = transactionsCombined ? Array.from(new Set(transactionsCombined.map(t => dateToInputType(t.date)))) : [];
  //   accountTotal = transactionsCombined.reduce((accumulator, transaction) => accumulator + transaction.value, 0);
  //   console.log({transactionsCombined})
  // },[accountId, accounts])

  const createMainAccount = async () => {
    try {
      await db.accounts.add({
        name: 'Main Account',
        type: 'Everyday',
        dateCreated: new Date()
      });
      await db.accounts.add({
        name: 'Savings 1',
        type: 'Savings',
        goalDate: new Date("2026/05/10"),
        goalValue: 4000,
        dateCreated: new Date()
      });
      } catch(error) {
          console.log(error)
      }
  }

  const createInitialSettings = async () => {
    try {
      await db.settings.add({
          dark: true,
          main_account_id: 0,
      });
      } catch(error) {
          console.log(error)
      }
  }

  useEffect(() => {
    if(settingsArray && settingsArray.length === 0) {
      createInitialSettings()
    }
    if(accounts && accounts.length === 0) {
      createMainAccount()
    }
    if (settings && settings.main_account_id === 0) {
      const mainAccount = accounts?.reduce((min, current) => current.id < min.id ? current : min)
      if (mainAccount) db.settings.update(settings.id, {main_account_id: mainAccount.id})
    }
    if (loading && settings) {
      setAccountId(settings.main_account_id);
      setLoading(false);
    }
    if (settings && accounts && accounts.length > 0 && !accounts?.find(a => a.id === accountId)) {
      console.log('current account deleted')
      if(accounts?.find(a => a.id === settings?.main_account_id))
        setAccountId(settings?.main_account_id)
      else {
        console.log('current account deleted + new main account')
        setAccountId(accounts?.reduce((m, c) => c.id < m.id ? c : m).id)
        db.settings.update(settings.id, {main_account_id: accounts?.reduce((m, c) => c.id < m.id ? c : m).id})
      }
    }

  }, [accounts, accountId, loading, settings, settingsArray])

  const changeAccount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAccountId(Number(e.target.value))
  }

  return (
    <>
      <Account accountId={accountId} total={accountTotal} accounts={accounts} changeAccount={changeAccount} settings={settings}/>
      <div className='h-full overflow-y-auto flex flex-col gap-2 p-1 bg-gray-300'>
          {dateNames.map(d => <Day key={d} date={d} transactions={transactionsCombined.filter((t2 => dateToInputType(t2.date) == d))} accounts={accounts} total={transactionsCombined.filter(t => dateToInputType(t.date) <= d).reduce((accumulator, transaction) => accumulator + transaction.value, 0)}/>)}
      </div>
      
      <CreateTransaction accountId={accountId} accounts={accounts}/>
    </>
  )
}

export default Mainscreen;