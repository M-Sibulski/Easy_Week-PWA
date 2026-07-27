import './App.css';
import { repository } from './repository';
import { Accounts, Settings } from '../types.ts';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AccountType, accountTypes } from '../types.ts';
import { createSyncId } from '../syncIds.ts';
import { BottomSheet, SheetHeader, IconButton, FormField, SubmitButton } from './lib/ui';

interface Props {
    open: boolean;
    callback: () => void;
    settings: Settings | undefined;
}

const CreateAccount = ({open, callback, settings}: Props) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [type, setType] = useState<AccountType>('Savings');
    const [name, setName] = useState('');
    const [goalDate, setGoalDate] = useState('');
    const [goalValue, setGoalValue] = useState('');
    const [main, setMain] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) setShouldRender(true);
    },[open])

    const createAccount = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('createAccount');
        try {
            const now = new Date();
            const syncId = createSyncId('acc');

            if (type === "Savings" as AccountType) {
            const newAccount: Partial<Accounts> = {
                syncId,
                name: name,
                type: type,
                createdAt: now,
                updatedAt: now,
                ...(Number(goalValue) > 0 ? {goalValue: Number(goalValue)} : {}),
                ...(goalDate ? {goalDate:new Date(goalDate)} : {}),
            };            
            const id = await repository.addAccount(newAccount as Accounts);
            if (main && settings) {
                repository.updateSettings(settings.id, {main_account_id: id, main_account_sync_id: syncId})
            }
        } else {
            const id = await repository.addAccount({
                syncId,
                name: name,
                type: type,
                createdAt: now,
                updatedAt: now,
            });
            if (main && settings) {
                repository.updateSettings(settings.id, {main_account_id: id, main_account_sync_id: syncId})
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

    const handleClearButton = (e:React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        clearFields();
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

    if (!shouldRender && !open) return null;

  return (
    <BottomSheet open={open} ref={sheetRef} data-testid="account-form">
        <form id='account-form' onSubmit={e => createAccount(e)}>
            <SheetHeader
                title="New Account"
                leftSlot={
                    <IconButton onClick={e => handleClearButton(e)} role='clear' name='clear' aria-label="Clear form">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
                    </IconButton>
                }
                rightSlot={
                    <IconButton onClick={e => handleCloseButton(e)} role='close' name='close' aria-label="Close sheet">
                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M200-440v-80h560v80H200Z"/></svg>
                    </IconButton>
                }
            />
            <div className='flex flex-col gap-3 mt-2'>
                <FormField data-testid="name-input" type="text" placeholder="Name" value={name} onChange={e => setName(e.currentTarget.value)} name="name" id="name" />

                <FormField as="select" data-testid="type-input" value={type} onChange={e => setType(e.currentTarget.value as AccountType)} name="type" id="type">
                    {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </FormField>

                {type === "Savings" &&
                    <>
                        <FormField data-testid="date-input" type="date" value={goalDate} onChange={e => setGoalDate(e.currentTarget.value)} name="date" id="date" className="w-full" />
                        <FormField data-testid="value-input" type="text" placeholder='$ 0.00' inputMode="numeric" value={goalValue === '' ? '' : `$ ${goalValue}`} onChange={e => handleValueChange(e)} name="value" id="value" />
                    </>
                }
                <div className="flex gap-3 bg-blue-300 rounded-md p-1 hover:bg-blue-200">
                    <label htmlFor="main-account" className='flex-1 select-none'>Make this my main account? </label>
                    <input data-testid="main-input" type="checkbox" checked={main} onChange={e => setMain(e.currentTarget.checked)} name="main-account" id="main-account" className='size-6'/>
                </div>
                <SubmitButton data-testid='submit' name='submit' />
            </div>
        </form>
    </BottomSheet>
  )
}

export default CreateAccount;