import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Accounts, Settings, Transactions } from '../../types';

/**
 * Reactive hooks for live data from the local Dexie store.
 * When a cloud backend (Supabase) is added, replace these hooks with ones that
 * subscribe to the remote change feed instead of (or in addition to) useLiveQuery.
 */

export function useAccounts() {
  return useLiveQuery<Accounts[]>(() => db.accounts.toArray());
}

export function useTransactions() {
  return useLiveQuery<Transactions[]>(() =>
    db.transactions.where('name').notEqual('').sortBy('date')
  );
}

export function useSettingsArray() {
  return useLiveQuery<Settings[]>(() => db.settings.toArray());
}
