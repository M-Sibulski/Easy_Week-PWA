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

  const handleBackButton = () => {
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
      <div hidden={!open} className="z-10 absolute w-screen h-screen right-0 bottom-0" onClick={handleBackButton}></div>
      
      {/* <div className=''> */}
        <form className={'z-20 transition-all duration-1000 ease-in-out p-0 bg-blue-400 rounded-md' + (open ? '' : ' bg-gray-50 hover:bg-gray-200')}>
          <div className='flex gap-5 hover:bg-gray-200 rounded-md p-1' hidden={open} onClick={() => setOpen(true)}>
              <div className='flex-1 flex flex-col'>
                <h3 className='text-lg'>{transaction.name}</h3>
                <h3 className='text-sm text-gray-700'>{transaction.category}</h3>
              </div>
              
              <h4 className={'text-right flex-none text-lg font-bold ' + (transaction.value > 0 ? 'text-green-700' : 'text-red-700')}>{(transaction.value < 0 ? '- $' : '$') + Math.abs(transaction.value)}</h4>
          </div>
          <div className='flex flex-col' hidden={!open}>
            <div className='flex justify-between'>
              {/* <button id={transaction.id.toString()} onClick={handleBackButton} className='bg-gray-500 rounded-md hover:bg-gray-400 cursor-pointer px-2'>Back</button> */}
              <button id={transaction.id.toString()} onClick={e => handleDelete(e)}  className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
              </button>
              <div className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-500">
                      <svg onClick={handleBackButton} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M200-440v-80h560v80H200Z"/></svg>
              </div>
            </div>
            
            <div className='flex gap-5 p-1'>
            {/* <h5 className='flex-none text-xl'>{transaction.type === 'Expense' ? 'E' : 'I'}</h5> */}
              <div className='flex-1 flex flex-col gap-2'>
                <input className='text-md' placeholder='Name' value={name} onChange={e => setName(e.currentTarget.value)}/>
                <input className='text-sm text-gray-700' placeholder='Category' value={category} onChange={e => setCategory(e.currentTarget.value)}/>
                <input className='text-sm text-gray-700' type='date' value={dateToInputType(date)} onChange={e => setDate(new Date(e.currentTarget.value))}/>
                <select className='text-sm text-gray-700' value={type} onChange={e => setType(e.currentTarget.value as TransactionType)}>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div className='flex-none flex flex-col justify-around'>
                
                
              </div>
              <input className='text-right flex-none w-20 self-center' placeholder='Value' type='number' value={value} onChange={e => setValue(e.currentTarget.value)}/>
            </div>
            {/* <button id={transaction.id.toString()} onClick={e => handleDelete(e)} className='bg-red-500 rounded-md hover:bg-red-400 cursor-pointer px-2 self-end'>Delete</button> */}
            <button id={transaction.id.toString()} onClick={e => handleSaveButton(e)} className="cursor-pointer h-full p-2 rounded-md hover:bg-blue-500 flex justify-center">
              <svg className='' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
            </button>
          </div>
        </form>
      {/* </div> */}
    </>
  )
}

export default Transaction;