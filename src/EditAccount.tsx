import './App.css';
import { repository } from './repository';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AccountType, accountTypes, Accounts, Settings } from '../types.ts';
import { dateToInputType } from './dateConversions.ts';
import { BottomSheet, SheetHeader, IconButton, FormField, SubmitButton } from './lib/ui';

interface Props {
    open: boolean;
    callback: () => void;
    settings: Settings | undefined;
    account: Accounts | undefined;
}

const EditAccount = ({open, callback, settings, account}: Props) => {
    const [type, setType] = useState<AccountType>(account ? account.type : 'Everyday');
    const [name, setName] = useState(account ? account.name : '');
    const [goalDate, setGoalDate] = useState(account?.goalDate ? dateToInputType(account.goalDate) : '');
    const [goalValue, setGoalValue] = useState(account?.goalValue ? account.goalValue : '0');
    const [main, setMain] = useState(settings?.main_account_id === account?.id ? true : false);
    const sheetRef = useRef<HTMLDivElement>(null);

    const editAccount = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('EditAccount');
        try {
            const createdAt = account?.createdAt ?? new Date();

            if (type === "Savings" as AccountType) {
            const newAccount: Partial<Accounts> = {
                id: account?.id,
                syncId: account?.syncId,
                name: name,
                type: type,
                createdAt,
                updatedAt: new Date(),
                ...(Number(goalValue) > 0 ? {goalValue: Number(goalValue)} : {}),
                ...(goalDate ? {goalDate:new Date(goalDate)} : {}),
            };            
            await repository.putAccount(newAccount as Accounts);
            if (main && settings) {
                repository.updateSettings(settings.id, {main_account_id: account?.id, main_account_sync_id: account?.syncId})
            }
        } else {
            await repository.putAccount({
                id: account?.id,
                syncId: account?.syncId,
                name: name,
                type: type,
                createdAt,
                updatedAt: new Date(),
            } as Accounts);
            if (main && settings) {
                repository.updateSettings(settings.id, {main_account_id: account?.id, main_account_sync_id: account?.syncId})
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
                await repository.deleteAccount(account.id);
            } catch(error) {
                console.log(error);
            }
            const transactionsToDelete = await repository.getTransactionsByAccountId(account.id);
            transactionsToDelete.map(async a => await repository.deleteTransaction(a.id))
            console.log({transactionsToDelete})
        }
        
        clearFields();
        callback();
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setGoalValue(e.currentTarget.value.replace(/[^0-9.]/g, ''))
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
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
    <BottomSheet open={open} ref={sheetRef} data-testid="account-form">
        <form id='account-form' onSubmit={e => editAccount(e)}>
            <SheetHeader
                title="Edit Account"
                leftSlot={
                    /* D-002 fix: use hover:bg-blue-400 (approved pattern) instead of hover:bg-blue-500 */
                    <IconButton data-testid="delete" id={account?.id?.toString()} onClick={e => handleDelete(e)} aria-label="Delete account">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                    </IconButton>
                }
                rightSlot={
                    <IconButton onClick={e => handleCloseButton(e)} role='close' name='close' aria-label="Close sheet">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M200-440v-80h560v80H200Z"/></svg>
                    </IconButton>
                }
            />
            <div className='flex flex-col gap-3 mt-2'>
                <FormField type="text" placeholder="Name" value={name} onChange={e => setName(e.currentTarget.value)} name="name" id="name" />

                <FormField as="select" value={type} onChange={e => setType(e.currentTarget.value as AccountType)} name="type" id="type">
                    {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </FormField>

                {type === "Savings" &&
                    <>
                        <FormField data-testid="date-input" type="date" value={goalDate} onChange={e => setGoalDate(e.currentTarget.value)} name="date" id="date" className="w-full" />
                        <FormField type="text" placeholder='$ 0.00' inputMode="numeric" value={goalValue === '' ? '' : `$ ${goalValue}`} onChange={e => handleValueChange(e)} name="value" id="value" />
                    </>
                }
                <div className="flex gap-3 bg-blue-300 rounded-md p-1 hover:bg-blue-200">
                    <label htmlFor="main-account" className='flex-1 select-none'>Make this my main account? </label>
                    <input type="checkbox" checked={main} onChange={e => setMain(e.currentTarget.checked)} name="main-account" id="main-account" className='size-6'/>
                </div>
                <SubmitButton data-testid='submit' name='submit' />
            </div>
        </form>
    </BottomSheet>
  )
}

export default EditAccount;