import './App.css';
import { repository } from './repository';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { transactionTypes, TransactionType, Accounts } from '../types.ts';
import { dateToInputType, parseInputDate } from './dateConversions.ts';
import { getSuggestedCategory, learnCategorySuggestion } from './categorySuggestions.ts';
import { BottomSheet, SheetHeader, IconButton, FormField, SubmitButton } from './lib/ui';

interface Props {
    accountId: number;
    accounts: Accounts[] | undefined;
    renderOpenButton: boolean;
}

const CreateTransaction = ({accountId, accounts, renderOpenButton}:Props) => {
    const [open, setOpen] = useState(false);
    const [toAccountId, setToAccountId] = useState(0);
    const [value, setValue] = useState('');
    const [type, setType] = useState<TransactionType>('Expense');
    const [name, setName] = useState('');
    const [date, setDate] = useState(dateToInputType(new Date()));
    const [category, setCategory] = useState('');
    const [categoryManuallyEdited, setCategoryManuallyEdited] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    // Callback ref: focuses the name input as soon as it mounts (after BottomSheet renders content).
    const nameInputRef = useRef<HTMLInputElement>(null);
    const nameInputCallbackRef = useCallback((node: HTMLInputElement | null) => {
        (nameInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (node && open) {
            node.focus();
        }
    }, [open]);

    if(toAccountId === 0) {
        if (accountId && accountId != 0) {
            const defaultToAccount = accounts && accounts.find(a => a.id != accountId);
            if (defaultToAccount) setToAccountId(defaultToAccount.id);
        }
    };

    const createTransaction = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
        const fromAccount = accounts?.find(a => a.id === accountId);
        const targetAccount = accounts?.find(a => a.id === toAccountId);

        if (!fromAccount) {
            return;
        }

        if (type === "Transfer" as TransactionType) {
            if (!targetAccount) {
                return;
            }

            await repository.addTransaction({
            value: 0-Number(value),
            name: name === ''?'Transfer': name,
            account_id: accountId,
            account_sync_id: fromAccount.syncId,
            date: parseInputDate(date),
            category: category,
            type: type,
            to_account_id: toAccountId,
            to_account_sync_id: targetAccount.syncId,
            });
        } else {
            await repository.addTransaction({
            value: type === 'Expense' || type === 'Bills' ? 0-Number(value) : Number(value),
            name: name === ''?'Generic Transaction': name,
            account_id: accountId,
            account_sync_id: fromAccount.syncId,
            date: parseInputDate(date),
            category: category,
            type: type
            });
        }
        if (category.trim() !== '') {
            await learnCategorySuggestion(name, category, repository);
        }
        } catch(error) {
            console.log(error)
        }
        clearFields();
        nameInputRef.current?.focus();
    }

    const clearFields = () => {
        setValue('');
        setType('Expense');
        setName('');
        setDate(dateToInputType(new Date()));
        setCategory('');
        setCategoryManuallyEdited(false);
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
        setOpen(true);
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.currentTarget.value.replace(/[^0-9.]/g, ''))
    }

    const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCategory(e.currentTarget.value);
        setCategoryManuallyEdited(true);
    }

    const focusField = (fieldId: string) => {
        sheetRef.current?.querySelector<HTMLElement>(`#${fieldId}`)?.focus();
    }

    const handleFieldEnter = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, fieldId: string) => {
        if (e.key !== 'Enter') {
            return;
        }

        if (fieldId === 'category') {
            e.preventDefault();
            sheetRef.current?.querySelector<HTMLFormElement>('form')?.requestSubmit();
            return;
        }

        e.preventDefault();

        if (fieldId === 'name') {
            focusField('type');
            return;
        }

        if (fieldId === 'type') {
            focusField(type === 'Transfer' ? 'to-account' : 'value');
            return;
        }

        if (fieldId === 'to-account') {
            focusField('value');
            return;
        }

        if (fieldId === 'value') {
            focusField('date');
            return;
        }

        if (fieldId === 'date') {
            focusField('category');
        }
    }

    useEffect(() => {
        let isCancelled = false;

        const updateSuggestedCategory = async () => {
            if (categoryManuallyEdited) {
                return;
            }

            if (name.trim() === '') {
                setCategory('');
                return;
            }

            const suggestedCategory = await getSuggestedCategory(name, repository);
            if (!isCancelled) {
                setCategory(suggestedCategory ?? '');
            }
        };

        void updateSuggestedCategory();

        return () => {
            isCancelled = true;
        };
    }, [name, categoryManuallyEdited]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
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
      <button hidden={!renderOpenButton || open} role="open" onClick={(e) => {handleOpenButton(e)}} className='z-30 flex size-15 cursor-pointer items-center align-middle rounded-full bg-blue-500 shadow-lg/20 hover:bg-blue-600 fixed bottom-[calc(var(--ew-bottom-nav-height)+0.5rem)] left-1/2 -translate-x-1/2 transform'>
          <svg className='w-full' height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
      </button>
      <BottomSheet open={open} ref={sheetRef} data-testid="transaction-form" className="fixed max-w-lg">
            <form id='transaction-form' onSubmit={e => createTransaction(e)}>
                <SheetHeader
                    title="New Transaction"
                    leftSlot={
                        <IconButton type="button" onClick={e => handleClearButton(e)} role='clear' name='clear' aria-label="Clear form">
                            <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
                        </IconButton>
                    }
                    rightSlot={
                        <IconButton type="button" onClick={e => handleCloseButton(e)} role='close' name='close' aria-label="Close sheet">
                            <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#f9fafb"><path d="M200-440v-80h560v80H200Z"/></svg>
                        </IconButton>
                    }
                />
                <div className='flex flex-col gap-3 mt-2'>
                    <FormField ref={nameInputCallbackRef} type="text" placeholder="Name (Generic Transaction)" value={name} onChange={e => setName(e.currentTarget.value)} onKeyDown={e => handleFieldEnter(e, 'name')} name="name" id="name" />

                    <FormField as="select" value={type} onChange={e => setType(e.currentTarget.value as TransactionType)} onKeyDown={e => handleFieldEnter(e, 'type')} name="type" id="type">
                        {transactionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </FormField>

                    {type === "Transfer" &&
                        <FormField as="select" value={toAccountId} onChange={e => setToAccountId(Number(e.currentTarget.value))} onKeyDown={e => handleFieldEnter(e, 'to-account')} name="to-account" id="to-account">
                            {accounts && accounts.filter(a => a.id != accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </FormField>
                    }

                    <FormField type="text" placeholder='$ 0.00' inputMode="numeric" value={value === '' ? '' : `$ ${value}`} onChange={e => handleValueChange(e)} onKeyDown={e => handleFieldEnter(e, 'value')} name="value" id="value" />
                
                    <FormField data-testid="date-input" type="date" value={date} onChange={e => setDate(e.currentTarget.value)} onKeyDown={e => handleFieldEnter(e, 'date')} name="date" id="date" className="w-full" />
                
                    <FormField type='text' placeholder="Category" value={category} onChange={e => handleCategoryChange(e)} onKeyDown={e => handleFieldEnter(e, 'category')} name="category" id="category" />
                
                    <SubmitButton role='submit' name='submit' />
                </div>
            </form>
        </BottomSheet>
    </>
  )
}

export default CreateTransaction;
