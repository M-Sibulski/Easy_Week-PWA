import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.ts';
import { Transactions } from '../db.ts';
import './App.css';
import Day from './Day.tsx';
import { dateToInputType } from './dateConversions.ts';

const Mainscreen = () => {
    const transactions = useLiveQuery<Transactions[]>(() => db.transactions.where("name").notEqual('').sortBy('date'));
    // const dates = Array.from(new Set(transactions?.map(t => t.date)))
    const dateNames = transactions ? Array.from(new Set(transactions?.map(t => dateToInputType(t.date)))) : [];
    console.log('Mainscreen');


  return (
    <div className='h-full overflow-y-auto flex flex-col gap-2 p-1 bg-gray-300'>
        {transactions && dateNames.map(d => <Day key={d} date={d} transactions={transactions.filter((t2 => dateToInputType(t2.date) == d))} total={transactions.filter(t => dateToInputType(t.date) <= d).reduce((accumulator, transaction) => accumulator + transaction.value, 0)}/>)}
    </div>
  )
}

export default Mainscreen;