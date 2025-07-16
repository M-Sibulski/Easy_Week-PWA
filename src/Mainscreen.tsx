// import './Mainscreen.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.ts';
import { Transactions } from '../db.ts';
import Transaction from './Transaction.tsx';
import './App.css';
import CreateTransaction from './CreateTransaction.tsx';

const Mainscreen = () => {
    const transactions = useLiveQuery<Transactions[]>(() => db.transactions.where("name").notEqual('').sortBy('date'));


  return (
    <div className='relative mx-auto max-w-lg overflow-hidden rounded-xl bg-white shadow-md md:max-w-2x1 flex flex-col min-h-full gap-1'>
        {transactions && transactions.map(t => <Transaction key={t.id} transaction={t}/>)}
        <CreateTransaction/>
    </div>
  )
}

export default Mainscreen;