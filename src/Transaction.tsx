import { Accounts, db} from '../db.ts';
import { TransactionType, transactionTypes } from '../types.ts';
import './App.css';
import { Transactions } from '../db.ts';
import { useState, useRef, useEffect } from 'react';
import { dateToInputType } from './dateConversions.ts';

interface Props {
    transaction: Transactions;
    accounts: Accounts[] | undefined;
}

const Transaction = ({transaction, accounts}:Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(Math.abs(transaction.value).toString());
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [name, setName] = useState(transaction.name);
  const [date, setDate] = useState(dateToInputType(transaction.date));
  const [category, setCategory] = useState(transaction.category);
  const [alert, setAlert] = useState<string[]>([]);
  const [displayAlert, setDisplayAlert] = useState(false);
  const [accountId, setAccountId] = useState(transaction.account_id);
  const [toAccountId, setToAccountId] = useState(transaction.to_account_id);

  

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    
    if (transaction.type === "Transfer") {
      setAlert([])

      if (!accounts?.find(a => a.id === transaction.account_id)) {
        if (accounts) setAccountId(accounts?.filter(a => a.id != transaction.to_account_id).reduce((min, nextObj) => nextObj.id < min.id ? nextObj : min).id);
        setAlert(prev  => [...prev , 'The account that this transfer is comming from does not exist anymore']);
      }
      if (!accounts?.find(a => a.id === transaction.to_account_id)) {
        if (accounts) setToAccountId(accounts?.filter(a => a.id != transaction.account_id).reduce((min, nextObj) => nextObj.id < min.id ? nextObj : min).id);
        setAlert(prev  => [...prev , 'The account that this transfer is going to does not exist anymore']);
      }
    }
    
  }, [accounts, transaction])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);


  const handleDelete = async (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const id=Number(e.currentTarget.id);
    try {
      await db.transactions.delete(id);
    } catch(error) {
      console.log(error);
    }
  }

  const handleCloseButton = (e?:React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    setOpen(false);
  }

  const handleSaveButton = async (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (type === "Transfer" as TransactionType) {
        await db.transactions.put({
        id: transaction.id,
        value: 0-Number(value),
        name: name === ''?'Transfer': name,
        account_id: accountId,
        date: new Date(date),
        category: category,
        type: type,
        to_account_id: toAccountId
        });
      } else {
        await db.transactions.put({
        id: transaction.id,
        value: type === 'Expense' ? 0-Number(value) : Number(value),
        name: name === ''?'Generic Transaction': name,
        account_id: accountId,
        date: new Date(date),
        category: category,
        type: type
        });
      }
    } catch (error) {
      console.log(error)
    }
    setOpen(false);
  }


  return (
    <>      
      <div data-testid="transaction" className='flex gap-5 hover:bg-gray-200 rounded-md p-1' hidden={open} onClick={() => setOpen(true)}>
        <div className='flex-1 flex flex-col'>
          <h3 className='text-lg'>{transaction.name}</h3>
          <h3 className='text-sm text-gray-700'>{transaction.category}</h3>
        </div>
        {alert.length > 0 &&
          <button className="flex cursor-pointer" onClick={(e) => {e.stopPropagation();setDisplayAlert(!displayAlert)}}>
            {displayAlert &&
            <p className='text-red-700'>{alert}</p>
            }
            <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#c10007"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg>
          
          </button>
        }
        <h4 className={'text-right flex-none text-lg font-bold ' + (transaction.value > 0 ? 'text-green-700' : 'text-red-700')}>{(transaction.value < 0 ? '- $' : '$') + Math.abs(transaction.value)}</h4>
      </div>
          
      <form ref={formRef} data-testid='edit-transaction' className='z-30 flex flex-col bg-blue-400 rounded-md' hidden={!open}>
        <div className='flex justify-between'>
          <button data-testid="delete" id={transaction.id.toString()} onClick={e => handleDelete(e)}  className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-500">
            <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
          </button>
          <button data-testid='close' role='close' onClick={e => handleCloseButton(e)} className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-500">
            <svg  height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M200-440v-80h560v80H200Z"/></svg>
          </button>
        </div>
        
        <div className='flex flex-col gap-3 p-1'>
          <input data-testid="name" type="text" placeholder="Name (Generic Transaction)" value={name} onChange={e => setName(e.currentTarget.value)} name="name" id="name" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'/>

          <select data-testid="type" value={type} onChange={e => setType(e.currentTarget.value as TransactionType)} name="type" id="type" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'>
              {transactionTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          
          {type === "Transfer" &&
              <>
                <div className="flex gap-2">
                  <label className='p-1 w-10' htmlFor="from-account">From</label>
                  <select value={accountId} onChange={e => setAccountId(Number(e.currentTarget.value))} name="from-account" id="from-account" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1 flex-1'>
                    {accounts && accounts.filter(a => a.id != transaction.to_account_id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <label className='p-1 w-10' htmlFor="from-account">To</label>
                  <select value={toAccountId} onChange={e => setToAccountId(Number(e.currentTarget.value))} name="to-account" id="to-account" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1 flex-1'>
                    {accounts && accounts.filter(a => a.id != transaction.account_id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </>
          }
      
          <input data-testid="value" type="text" placeholder='$ 0.00' inputMode="numeric" value={value === '' ? '' : `$ ${value}`} onChange={e => setValue(e.currentTarget.value.replace(/[^0-9.]/g, ''))} name="value" id="value" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'/>
      
          <input data-testid="date" type="date" value={date} onChange={e => setDate(e.currentTarget.value)} name="date" id="date" className='bg-blue-300 rounded-md hover:bg-blue-200 w-full p-1'/>
      
          <input data-testid="category" type='text' placeholder="Category" value={category} onChange={e => setCategory(e.currentTarget.value)} name="category" id="category" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'  />
        
          <button data-testid="submit" id={transaction.id.toString()} onClick={e => handleSaveButton(e)} className="cursor-pointer h-full p-2 rounded-md hover:bg-blue-500 flex justify-center">
            <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
          </button>
        </div>
      </form>
    </>
  )
}

export default Transaction;