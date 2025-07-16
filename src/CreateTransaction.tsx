import './App.css';
// import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.ts';
import { useEffect, useState } from 'react';
import { TransactionType } from '../db.ts';


const CreateTransaction = () => {
    const [value, setValue] = useState('0');
    const [type, setType] = useState<TransactionType>('Expense');
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    
    const setDateToToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        setDate(formattedDate);
    }

    useEffect(() => {
        setDateToToday();
    }, [])

    const createTransaction = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('createTransaction');
        try {
        const id = await db.transactions.add({
            value: type === 'Expense' ? 0-Number(value) : Number(value),
            name: name === ''?'Generic Transaction': name,
            account_id: 1,
            date: date,
            category: category,
            type: type
        });
        console.log(id);
        } catch(error) {
            console.log(error)
        }
        setValue('0');
        setType('Expense');
        setName('');
        setDateToToday();
        setCategory('');
    }

    console.log('CreateTransaction');

  return (
    <>
        {/* <button className='absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-red-500 border-red-200 hover:bg-red-600 size-15 rounded-full text-center cursor-pointer'>
            <p className='text-2xl bold'>+</p>
        </button> */}
        <span hidden={false} onClick={() => console.log('click')} className='hover:bg-red-600 absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-red-500 size-15 rounded-full text-center cursor-pointer'>
            <p className='text-2xl bold'>+</p>
        </span>
        <form id='transaction-form' onSubmit={e => createTransaction(e)} className='absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-red-500 p-2 rounded-t-xl flex flex-col gap-1'>
            <h3 className='w-full text-center'>New Transaction</h3>
            <div className='grid grid-cols-2 gap-1'>
                <label htmlFor="name">Name</label>
                <input type="text" placeholder="Generic Transaction" value={name} onChange={e => setName(e.currentTarget.value)} name="name" id="name" className='bg-red-300 rounded-md hover:bg-red-200'/>

                <label htmlFor="type">Type</label>
                <select value={type} onChange={e => setType(e.currentTarget.value as TransactionType)} name="type" id="type" className='bg-red-300 rounded-md hover:bg-red-200'>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                </select>
            
                <label htmlFor="value">Value</label>
                <input type="text" value={value} onChange={e => setValue(e.currentTarget.value)} name="value" id="value" className='bg-red-300 rounded-md hover:bg-red-200'/>
            
                <label htmlFor="date">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.currentTarget.value)} name="date" id="date" className='bg-red-300 rounded-md hover:bg-red-200'/>
            
                <label htmlFor="category">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.currentTarget.value)} name="category" id="category" className='bg-red-300 rounded-md hover:bg-red-200'  />
            
                <button type='reset' className='border-solid border rounded-md hover:bg-red-400 cursor-pointer'>back</button>
                <button type='submit' className='rounded-md border rounded-md border-red-100 bg-red-100 text-red-500 hover:bg-red-400 cursor-pointer'>Save</button>
            </div>
            
            
            
            
            
        </form>
        {/* <button type='button' className='hover:bg-red-500'>Test</button> */}
    </>
  )
}

export default CreateTransaction;