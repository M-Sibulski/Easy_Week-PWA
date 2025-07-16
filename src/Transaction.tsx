// import { useLiveQuery } from 'dexie-react-hooks';
import { db, TransactionType } from '../db.ts';
import './App.css';
import { Transactions } from '../db.ts';
import { useState } from 'react';

interface Props {
    transaction: Transactions;
}

const Transaction = ({transaction}:Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(transaction.value.toString());
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [name, setName] = useState(transaction.name);
  const [date, setDate] = useState(transaction.date);
  const [category, setCategory] = useState(transaction.category);

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
    <>
      <div className='flex gap-5 hover:bg-gray-200 rounded-md p-1' hidden={open} onClick={() => setOpen(!open)}>
          {/* <h5 className='flex-none text-xl'>{transaction.type === 'Expense' ? 'E' : 'I'}</h5> */}
          <div className='flex-1 flex flex-col'>
            <h3 className='text-md'>{transaction.name}</h3>
            <h3 className='text-sm text-gray-700'>{transaction.category}</h3>
          </div>
          
          {/* <button id={transaction.id.toString()} onClick={e => handleDelete(e)} className='bg-red-500 rounded-md hover:bg-red-400 cursor-pointer'>Delete</button> */}
          <h4 className={'text-right flex-none ' + (transaction.value > 0 ? 'text-green-700' : 'text-red-700')}>{transaction.value}</h4>
      </div>
      <form className='flex gap-5 hover:bg-red-200 rounded-md p-1' hidden={!open} onClick={() => setOpen(!open)}>
          {/* <h5 className='flex-none text-xl'>{transaction.type === 'Expense' ? 'E' : 'I'}</h5> */}
          <div className='flex-1 flex flex-col'>
            <input className='text-md' value={name} onChange={e => setName(e.currentTarget.value)}/>
            <input className='text-sm text-gray-700' value={category} onChange={e => setCategory(e.currentTarget.value)}/>
            <input className='text-sm text-gray-700' value={date} onChange={e => setDate(e.currentTarget.value)}/>
            <select className='text-sm text-gray-700' value={type} onChange={e => setType(e.currentTarget.value as TransactionType)}>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          
          <button id={transaction.id.toString()} onClick={e => handleDelete(e)} className='bg-red-500 rounded-md hover:bg-red-400 cursor-pointer px-2'>Delete</button>
          <input className='text-right flex-none w-15' value={value} onChange={e => setValue(e.currentTarget.value)}/>
      </form>
    </>
  )
}

export default Transaction;