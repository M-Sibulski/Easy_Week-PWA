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
  const [value, setValue] = useState(Math.abs(transaction.value).toString());
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [name, setName] = useState(transaction.name);
  const [date, setDate] = useState(transaction.date);
  const [category, setCategory] = useState(transaction.category);

  const handleDelete = async (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const id=Number(e.currentTarget.id);
    try {
      await db.transactions.delete(id);
    } catch(error) {
      console.log(error);
    }
  }

  const handleBackButton = (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOpen(false);
  }

  const handleSaveButton = async (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await db.transactions.put({
        id: transaction.id,
        value: type === 'Expense' ? 0-Number(value) : Number(value),
        name: name === ''?'Generic Transaction': name,
        account_id: 1,
        date: date,
        category: category,
        type: type
      })
    } catch (error) {
      console.log(error)
    }
    setOpen(false);
  }

  console.log('Transaction');


  return (
    <>
      <div className='flex gap-5 hover:bg-gray-200 rounded-md p-1' hidden={open} onClick={() => setOpen(true)}>
          {/* <h5 className='flex-none text-xl'>{transaction.type === 'Expense' ? 'E' : 'I'}</h5> */}
          <div className='flex-1 flex flex-col'>
            <h3 className='text-md'>{transaction.name}</h3>
            <h3 className='text-sm text-gray-700'>{transaction.category}</h3>
          </div>
          
          {/* <button id={transaction.id.toString()} onClick={e => handleDelete(e)} className='bg-red-500 rounded-md hover:bg-red-400 cursor-pointer'>Delete</button> */}
          <h4 className={'text-right flex-none ' + (transaction.value > 0 ? 'text-green-700' : 'text-red-700')}>{transaction.value}</h4>
      </div>
      <form className='flex flex-col bg-gray-200 rounded-md p-1' hidden={!open}>
          <div className='flex justify-between'>
            <button id={transaction.id.toString()} onClick={e => handleBackButton(e)} className='bg-gray-500 rounded-md hover:bg-gray-400 cursor-pointer px-2'>Back</button>
            <button id={transaction.id.toString()} onClick={e => handleSaveButton(e)} className='bg-green-500 rounded-md hover:bg-green-400 cursor-pointer px-2'>Save</button>
          </div>
          
          <div className='flex gap-5'>
          {/* <h5 className='flex-none text-xl'>{transaction.type === 'Expense' ? 'E' : 'I'}</h5> */}
            <div className='flex-1 flex flex-col gap-2 py-2'>
              <input className='text-md' placeholder='Name' value={name} onChange={e => setName(e.currentTarget.value)}/>
              <input className='text-sm text-gray-700' placeholder='Category' value={category} onChange={e => setCategory(e.currentTarget.value)}/>
              <input className='text-sm text-gray-700' type='date' value={date} onChange={e => setDate(e.currentTarget.value)}/>
              <select className='text-sm text-gray-700' value={type} onChange={e => setType(e.currentTarget.value as TransactionType)}>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div className='flex-none flex flex-col justify-around'>
              
              
            </div>
            <input className='text-right flex-none w-20 self-center' placeholder='Value' type='number' value={value} onChange={e => setValue(e.currentTarget.value)}/>
          </div>
          <button id={transaction.id.toString()} onClick={e => handleDelete(e)} className='bg-red-500 rounded-md hover:bg-red-400 cursor-pointer px-2 self-end'>Delete</button>
          
      </form>
    </>
  )
}

export default Transaction;