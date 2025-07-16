// import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.ts';
import './App.css';
import { Transactions } from '../db.ts';

interface Props {
    transaction: Transactions;
}

const Transaction = ({transaction}:Props) => {
  const handleDelete = async (e:React.MouseEvent<HTMLButtonElement>) => {
    const id=Number(e.currentTarget.id);
    try {
      await db.transactions.delete(id);
    } catch(error) {
      console.log(error);
    }
  }

  console.log('Transaction');


  return (
    <div className='grid grid-cols-4 gap-1 mx-2'>
        <h3>{transaction.name}</h3>
        <h4>{transaction.value}</h4>
        <h5>{transaction.type}</h5>
        <button id={transaction.id.toString()} onClick={e => handleDelete(e)} className='bg-red-500 rounded-md hover:bg-red-400 cursor-pointer'>Delete</button>
    </div>
  )
}

export default Transaction;