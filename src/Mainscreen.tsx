// import './Mainscreen.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.ts';
import { Transactions } from '../db.ts';
// import Transaction from './Transaction.tsx';
import './App.css';
import CreateTransaction from './CreateTransaction.tsx';
import Day from './Day.tsx';

const Mainscreen = () => {
    const transactions = useLiveQuery<Transactions[]>(() => db.transactions.where("name").notEqual('').sortBy('date'));
    const dates = Array.from(new Set(transactions?.map(t => t.date)))
    console.log('Mainscreen');


  return (
    <div className='relative mx-auto max-w-lg overflow-hidden rounded-xl bg-white shadow-md md:max-w-2x1 flex flex-col min-h-full gap-2 p-1'>
        {transactions && dates.map(d => <Day key={d} date={d} transactions={transactions.filter((t2 => t2.date == d))} total={transactions.filter(t => t.date <= d).reduce((accumulator, transaction) => accumulator + transaction.value, 0)}/>)}
        <CreateTransaction/>
    </div>
  )
}

export default Mainscreen;