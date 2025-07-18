import './App.css';
// import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.ts';
import { ChangeEvent, useState } from 'react';
import { TransactionType } from '../db.ts';


const CreateTransaction = () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [type, setType] = useState<TransactionType>('Expense');
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');

    // useEffect(() => {
    //     setDateToToday();
    // }, [])

    const createTransaction = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('createTransaction');
        try {
        const id = await db.transactions.add({
            value: type === 'Expense' ? 0-Number(value) : Number(value),
            name: name === ''?'Generic Transaction': name,
            account_id: 1,
            date: new Date(date),
            category: category,
            type: type
        });
        console.log(id);
        } catch(error) {
            console.log(error)
        }
        clearFields();
    }

    const clearFields = () => {
        setValue('');
        setType('Expense');
        setName('');
        setDate('');
        setCategory('');
    }

    const handleBackButton = () => {
        setOpen(false);
        clearFields();
    }

    console.log('CreateTransaction');

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.currentTarget.value.replace(/[^0-9.]/g, ''))
    }

  return (
    <div className=''>
        <span hidden={open} onClick={() => setOpen(true)} className='flex items-center align-middle hover:bg-blue-600 absolute bottom-7 left-1/2 transform -translate-x-1/2 bg-blue-500 size-15 rounded-full shadow-lg/20 cursor-pointer'>
            <svg className='w-full' height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
        </span>
        <form hidden={!open} id='transaction-form' onSubmit={e => createTransaction(e)} className='absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-blue-500 p-3 rounded-t-xl flex flex-col gap-5 w-full'>
            <div className="relative flex">
                <h3 className='w-full text-center text-gray-50 font-bold text-lg'>New Transaction</h3>
                <div className="absolute right-0 cursor-pointer h-full p-1 rounded-md hover:bg-blue-400">
                    <svg onClick={handleBackButton} className='' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M200-440v-80h560v80H200Z"/></svg>
                </div>
                
            </div>
            <div className='flex flex-col gap-3'>
                {/* <label htmlFor="name">Name</label> */}
                <input type="text" placeholder="Name (Generic Transaction)" value={name} onChange={e => setName(e.currentTarget.value)} name="name" id="name" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'/>

                {/* <label htmlFor="type">Type</label> */}
                <select value={type} onChange={e => setType(e.currentTarget.value as TransactionType)} name="type" id="type" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                </select>
            
                {/* <label htmlFor="value">Value</label> */}
                <input type="text" placeholder='$ 0.00' inputMode="numeric" value={value === '' ? '' : `$ ${value}`} onChange={e => handleValueChange(e)} name="value" id="value" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'/>
            
                {/* <label htmlFor="date">Date</label> */}
                <input type="date" value={date} onChange={e => setDate(e.currentTarget.value)} name="date" id="date" className='bg-blue-300 rounded-md hover:bg-blue-200 w-full p-1'/>
            
                {/* <label htmlFor="category">Category</label> */}
                <input type='text' placeholder="Category" value={category} onChange={e => setCategory(e.currentTarget.value)} name="category" id="category" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'  />
            
                {/* <button type='reset' onClick={handleBackButton} className='border-solid border rounded-md hover:bg-blue-400 cursor-pointer'>back</button> */}
                <button type='submit' className='rounded-md border rounded-md border-blue-100 bg-blue-100 text-blue-500 hover:bg-blue-400 cursor-pointer p-1'>Save</button>
            </div>
            
            
            
            
            
        </form>
    </div>
  )
}

export default CreateTransaction;