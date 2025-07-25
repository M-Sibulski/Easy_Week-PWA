import './App.css';
import { Accounts, db, Settings } from '../db.ts';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AccountType, accountTypes } from '../types.ts';
import { dateToInputType } from './dateConversions.ts';

interface Props {
    open: boolean;
    callback: () => void;
    settings: Settings | undefined;
    account: Accounts | undefined;
}

const EditAccount = ({open, callback, settings, account}: Props) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [type, setType] = useState<AccountType>(account ? account.type : 'Everyday');
    const [name, setName] = useState(account ? account.name : '');
    const [goalDate, setGoalDate] = useState(account?.goalDate ? dateToInputType(account.goalDate) : '');
    const [goalValue, setGoalValue] = useState(account?.goalValue ? account.goalValue : '0');
    const [main, setMain] = useState(settings?.main_account_id === account?.id ? true : false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if(open) setShouldRender(true);
    },[open])

    const editAccount = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('EditAccount');
        try {
            if (type === "Savings" as AccountType) {
            const newAccount: Partial<Accounts> = {
                id: account?.id,
                name: name,
                type: type,
                dateCreated: new Date(),
                ...(Number(goalValue) > 0 ? {goalValue: Number(goalValue)} : {}),
                ...(goalDate ? {goalDate:new Date(goalDate)} : {}),
            };            
            await db.accounts.put(newAccount as Accounts);
            if (main && settings) {
                db.settings.update(settings.id, {main_account_id: account?.id})
            }
        } else {
            await db.accounts.put({
                id: account?.id,
                name: name,
                type: type,
                dateCreated: new Date(),
            });
            if (main && settings) {
                db.settings.update(settings.id, {main_account_id: account?.id})
            }
        }
        
        } catch(error) {
            console.log(error)
        }
        clearFields();
        callback();
    }

    const clearFields = () => {
        setType('Savings');
        setName('');
        setGoalDate('');
        setGoalValue('');
    }

    const handleCloseButton = (e?:React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();
        callback();
    }

    const handleDelete = async (e:React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (account) {
            try {
                await db.accounts.delete(account.id);
            } catch(error) {
                console.log(error);
            }
            const transactionsToDelete = await db.transactions.where("account_id").equals(account.id).toArray();
            transactionsToDelete.map(async a => await db.transactions.delete(a.id))
            console.log({transactionsToDelete})
        }
        
        clearFields();
        callback();
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setGoalValue(e.currentTarget.value.replace(/[^0-9.]/g, ''))
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
            callback();
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
    }, [open, callback]);


  return (
    <>
    {shouldRender &&
        <>
            <form ref={formRef} data-testid="account-form" id='account-form' onSubmit={e => editAccount(e)} className={'z-40 absolute bottom-0 left-1/2 transition transition-discrete duration-200 ease-in-out transform -translate-x-1/2 bg-blue-500 p-3 rounded-t-xl flex flex-col gap-5 w-full' + (open ? ' translate-y-0' : ' translate-y-100')}>
                <div className="relative flex">
                    <button data-testid="delete" id={account?.id.toString()} onClick={e => handleDelete(e)}  className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-500">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                    </button>
                    <h3 className='w-full text-center text-gray-50 font-bold text-lg'>Edit Account</h3>
                    <button onClick={e => {handleCloseButton(e)}} role='close' name='close' className="absolute right-0 cursor-pointer h-full p-1 rounded-md hover:bg-blue-400">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M200-440v-80h560v80H200Z"/></svg>
                    </button>
                </div>
                <div className='flex flex-col gap-3'>
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.currentTarget.value)} name="name" id="name" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'/>

                    <select value={type} onChange={e => setType(e.currentTarget.value as AccountType)} name="type" id="type" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'>
                        {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    {type === "Savings" &&
                        <>
                            <input data-testid="date-input" type="date" value={goalDate} onChange={e => setGoalDate(e.currentTarget.value)} name="date" id="date" className='bg-blue-300 rounded-md hover:bg-blue-200 w-full p-1'/>
                            <input type="text" placeholder='$ 0.00' inputMode="numeric" value={goalValue === '' ? '' : `$ ${goalValue}`} onChange={e => handleValueChange(e)} name="value" id="value" className='bg-blue-300 rounded-md hover:bg-blue-200 p-1'/>
                        </>
                    }
                    <div className="flex gap-3 bg-blue-300 rounded-md p-1 hover:bg-blue-200 ">
                        <label htmlFor="main-account" className='flex-1 select-none'>Make this my main account? </label>
                        <input type="checkbox" checked={main} onChange={e => setMain(e.currentTarget.checked)} name="main-account" id="main-account" className='size-6'/>
                    </div>
                    <button data-testid='submit' name='submit' type='submit' className="cursor-pointer h-full p-2 rounded-md hover:bg-blue-400 flex justify-center">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                    </button>
                </div>
            </form>
        </>
    }
    </>
  )
}

export default EditAccount;