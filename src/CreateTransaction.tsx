import './App.css';
import { db } from '../db.ts';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { transactionTypes, TransactionType, Accounts } from '../types.ts';
import { dateToInputType } from './dateConversions.ts';

interface Props {
    accountId: number;
    accounts: Accounts[] | undefined;
    renderOpenButton: boolean;
}

const CreateTransaction = ({accountId, accounts, renderOpenButton}:Props) => {
    const [open, setOpen] = useState(false);
    const [toAccountId, setToAccountId] = useState(0);
    const [shouldRender, setShouldRender] = useState(false);
    const [value, setValue] = useState('');
    const [type, setType] = useState<TransactionType>('Expense');
    const [name, setName] = useState('');
    const [date, setDate] = useState(dateToInputType(new Date()));
    const [category, setCategory] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    if(toAccountId === 0) {
        if (accountId && accountId != 0) {
            const defaultToAccount = accounts && accounts.find(a => a.id != accountId);
            if (defaultToAccount) setToAccountId(defaultToAccount.id);
        }
    };

    const createTransaction = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
        if (type === "Transfer" as TransactionType) {
            await db.transactions.add({
            value: 0-Number(value),
            name: name === ''?'Transfer': name,
            account_id: accountId,
            date: new Date(date),
            category: category,
            type: type,
            to_account_id: toAccountId
            });
        } else {
            await db.transactions.add({
            value: type === 'Expense' || type === 'Bills' ? 0-Number(value) : Number(value),
            name: name === ''?'Generic Transaction': name,
            account_id: accountId,
            date: new Date(date),
            category: category,
            type: type
            });
        }
        } catch(error) {
            console.log(error)
        }
        clearFields();
    }

    const clearFields = () => {
        setValue('');
        setType('Expense');
        setName('');
        setDate(dateToInputType(new Date()));
        setCategory('');
    }

    const handleCloseButton = (e?:React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();
        setOpen(false);
    }

    const handleClearButton = (e:React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        clearFields();
        
    }

    const handleOpenButton = (e:React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShouldRender(true);
        requestAnimationFrame(() => setOpen(true));
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.currentTarget.value.replace(/[^0-9.]/g, ''))
    }

    useEffect(() => {
        const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.propertyName === "translate" && !open) {
            setShouldRender(false);
        }
        };
        const node = formRef.current;
        node?.addEventListener("transitionend", handleTransitionEnd);
        return () => node?.removeEventListener("transitionend", handleTransitionEnd);
    }, [open]);

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


  return (
    <>
    {!shouldRender ? 
        <button hidden={!renderOpenButton} role="open" onClick={(e) => {handleOpenButton(e)}} className='z-30 flex items-center align-middle hover:bg-blue-600 absolute bottom-7 left-1/2 transform -translate-x-1/2 bg-blue-500 size-15 rounded-full shadow-lg/20 cursor-pointer'>
            <svg className='w-full' height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
        </button>
    :
        <>
            <form ref={formRef} data-testid="transaction-form" id='transaction-form' onSubmit={e => createTransaction(e)} className={'z-40 absolute bottom-0 left-1/2 transition transition-discrete duration-200 ease-in-out transform -translate-x-1/2 bg-blue-500 p-3 rounded-t-xl flex flex-col gap-5 w-full' + (open ? ' translate-y-0' : ' translate-y-100')}>
                <div className="relative flex">
                    <button onClick={e => {handleClearButton(e)}} role='clear' name='clear' className="absolute left-0 cursor-pointer h-full p-1 rounded-md hover:bg-blue-400">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
                    </button>
                    <h3 className='w-full text-center text-gray-50 font-bold text-lg'>New Transaction</h3>
                    <button onClick={e => {handleCloseButton(e)}} role='close' name='close' className="absolute right-0 cursor-pointer h-full p-1 rounded-md hover:bg-blue-400">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M200-440v-80h560v80H200Z"/></svg>
                    </button>
                </div>
                <div className='flex flex-col gap-3'>
                    <input type="text" placeholder="Name (Generic Transaction)" value={name} onChange={e => setName(e.currentTarget.value)} name="name" id="name" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'/>

                    <select value={type} onChange={e => setType(e.currentTarget.value as TransactionType)} name="type" id="type" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'>
                        {transactionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    {type === "Transfer" &&
                        <select value={toAccountId} onChange={e => setToAccountId(Number(e.currentTarget.value))} name="to-account" id="to-account" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'>
                            {accounts && accounts.filter(a => a.id != accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    }

                    <input type="text" placeholder='$ 0.00' inputMode="numeric" value={value === '' ? '' : `$ ${value}`} onChange={e => handleValueChange(e)} name="value" id="value" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'/>
                
                    <input data-testid="date-input" type="date" value={date} onChange={e => setDate(e.currentTarget.value)} name="date" id="date" className='bg-blue-300 rounded-md hover:bg-blue-200 w-full p-1'/>
                
                    <input type='text' placeholder="Category" value={category} onChange={e => setCategory(e.currentTarget.value)} name="category" id="category" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'  />
                
                    <button role='submit' name='submit' type='submit' className="cursor-pointer h-full p-2 rounded-md hover:bg-blue-400 flex justify-center">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                    </button>
                </div>
            </form>
        </>
    }
    </>
  )
}

export default CreateTransaction;