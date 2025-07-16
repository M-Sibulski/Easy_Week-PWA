import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.ts';
import { Transactions } from '../db.ts';
import './App.css';
import Day from './Day.tsx';

const Mainscreen = () => {
    const transactions = useLiveQuery<Transactions[]>(() => db.transactions.where("name").notEqual('').sortBy('date'));
    const dates = Array.from(new Set(transactions?.map(t => t.date)))
    console.log('Mainscreen');


  return (
    <div className='h-full overflow-y-auto flex flex-col min-h-full gap-2 p-1 rounded-xl shadow-md bg-white'>
        {transactions && dates.map(d => <Day key={d} date={d} transactions={transactions.filter((t2 => t2.date == d))} total={transactions.filter(t => t.date <= d).reduce((accumulator, transaction) => accumulator + transaction.value, 0)}/>)}
        
    </div>
  )
}

export default Mainscreen;