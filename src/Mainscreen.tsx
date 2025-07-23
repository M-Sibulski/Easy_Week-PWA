import { useLiveQuery } from 'dexie-react-hooks';
import { Accounts, db } from '../db.ts';
import { Transactions } from '../db.ts';
import './App.css';
import Day from './Day.tsx';
import { dateToInputType } from './dateConversions.ts';
import Account from './Account.tsx';
import { useEffect, useState } from 'react';
import CreateTransaction from './CreateTransaction.tsx';

export interface AccountsTotals {
    id: number;
    total: number;
}

const Mainscreen = () => {
  const [accountId, setAccountId] = useState(0);
  const transactions = useLiveQuery<Transactions[]>(() => db.transactions.where("name").notEqual('').sortBy('date'));
  const accounts = useLiveQuery<Accounts[]>(() => db.accounts.toArray());
  const transactionsInAccount = transactions && transactions.filter(t => t.account_id === accountId);
  const dateNames = transactionsInAccount ? Array.from(new Set(transactionsInAccount?.map(t => dateToInputType(t.date)))) : [];
  const accountTotals:AccountsTotals[] = [];
  accounts?.forEach(a => {
    const total = transactionsInAccount ? transactionsInAccount?.reduce((accumulator, transaction) => accumulator + transaction.value, 0) : 0;
    accountTotals.push({'id': a.id, 'total': total})
  });
  console.log(accountTotals);
  console.log('Mainscreen');

  const createMainAccount = async () => {
    try {
      const id1 = await db.accounts.add({
          name: 'Main Account',
          type: 'Everyday',
          main: true
      });
      const id2 = await db.accounts.add({
          name: 'Savings 1',
          type: 'Savings',
          main: false
      });
      console.log(id1, id2);
      } catch(error) {
          console.log(error)
      }
  }

  useEffect(() => {
    console.log('accounts: ')
    console.log(accounts)
    console.log(typeof(accounts))
    if(accounts && accounts.length === 0) {
      createMainAccount()
    }
    if (accountId === 0) {
      const mainAccount = accounts?.find(a => a.main === true)?.id
      if (mainAccount) setAccountId(mainAccount)
    }
  }, [accounts])

  const changeAccount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    setAccountId(Number(e.target.value))
  }

  console.log({accountId})

  return (
    <>
      <Account accountId={accountId} totals={accountTotals} accounts={accounts} changeAccount={changeAccount}/>
      <div className='h-full overflow-y-auto flex flex-col gap-2 p-1 bg-gray-300'>
          {transactionsInAccount && dateNames.map(d => <Day key={d} date={d} accountId={accountId} transactions={transactionsInAccount.filter((t2 => dateToInputType(t2.date) == d))} total={transactionsInAccount.filter(t => dateToInputType(t.date) <= d).reduce((accumulator, transaction) => accumulator + transaction.value, 0)}/>)}
      </div>
      
      <CreateTransaction accountId={accountId}/>
    </>
  )
}

export default Mainscreen;