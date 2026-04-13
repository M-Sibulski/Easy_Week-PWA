import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Accounts, Settings, Transactions } from '../../types';

/**
 * Reactive hooks for live data from the local Dexie store.
 * When a cloud backend (Supabase) is added, replace these hooks with ones that
 * subscribe to the remote change feed instead of (or in addition to) useLiveQuery.
 */

export function useAccounts() {
  return useLiveQuery<Accounts[]>(async () => {
    const accounts = await db.accounts.toArray();
    return accounts.filter((account) => !account.deletedAt);
  });
}

export function useTransactions() {
  return useLiveQuery<Transactions[]>(async () => {
    const transactions = await db.transactions.where('name').notEqual('').sortBy('date');
    return transactions.filter((transaction) => !transaction.deletedAt);
  });
}

export function useSettingsArray() {
  return useLiveQuery<Settings[]>(async () => {
    const settings = await db.settings.toArray();
    return settings.filter((row) => !row.deletedAt);
  });
}
