import { db } from '../../db';
import type { Accounts, Settings, Transactions } from '../../types';
import { supabase } from '../lib/supabaseClient';

type LocalAccountCandidate = Omit<Accounts, 'id'> & Partial<Pick<Accounts, 'id'>>;
type LocalTransactionCandidate = Omit<Transactions, 'id'> & Partial<Pick<Transactions, 'id'>>;
type LocalSettingsCandidate = Omit<Settings, 'id'> & Partial<Pick<Settings, 'id'>>;

type TimestampedRecord = {
  syncId: string;
  updatedAt: Date;
};

type RemoteAccountRow = {
  sync_id: string;
  name: string;
  type: Accounts['type'];
  goal_value: number | null;
  goal_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type RemoteTransactionRow = {
  sync_id: string;
  value: number;
  type: Transactions['type'];
  name: string;
  account_sync_id: string;
  date: string;
  category: string | null;
  to_account_sync_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type RemoteSettingsRow = {
  sync_id: string;
  dark: boolean;
  main_account_sync_id: string | null;
  week_starting_day: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type SyncPlan<T> = {
  pushRemote: T[];
  applyLocal: T[];
};

let queuedSync: Promise<void> = Promise.resolve();

export function pickLastWriteWinsRecord<T extends TimestampedRecord>(localRecord?: T, remoteRecord?: T): T | undefined {
  if (!localRecord) {
    return remoteRecord;
  }

  if (!remoteRecord) {
    return localRecord;
  }

  return localRecord.updatedAt.getTime() >= remoteRecord.updatedAt.getTime() ? localRecord : remoteRecord;
}

function buildSyncPlan<T extends TimestampedRecord>(localRows: T[], remoteRows: T[]): SyncPlan<T> {
  const localBySyncId = new Map(localRows.map((row) => [row.syncId, row]));
  const remoteBySyncId = new Map(remoteRows.map((row) => [row.syncId, row]));
  const syncIds = new Set([...localBySyncId.keys(), ...remoteBySyncId.keys()]);
  const pushRemote: T[] = [];
  const applyLocal: T[] = [];

  for (const syncId of syncIds) {
    const localRow = localBySyncId.get(syncId);
    const remoteRow = remoteBySyncId.get(syncId);
    const winner = pickLastWriteWinsRecord(localRow, remoteRow);

    if (!winner) {
      continue;
    }

    if (winner === localRow && localRow && (!remoteRow || localRow.updatedAt.getTime() > remoteRow.updatedAt.getTime())) {
      pushRemote.push(localRow);
    }

    if (winner === remoteRow && remoteRow && (!localRow || remoteRow.updatedAt.getTime() > localRow.updatedAt.getTime())) {
      applyLocal.push(remoteRow);
    }
  }

  return { pushRemote, applyLocal };
}

function toDate(value: string | null | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}

function mapRemoteAccount(row: RemoteAccountRow): LocalAccountCandidate {
  return {
    syncId: row.sync_id,
    name: row.name,
    type: row.type,
    goalValue: row.goal_value ?? undefined,
    goalDate: toDate(row.goal_date),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: toDate(row.deleted_at),
  };
}

function mapRemoteTransaction(
  row: RemoteTransactionRow,
  accountIdBySyncId: Map<string, number>,
  existing?: Transactions,
): LocalTransactionCandidate {
  return {
    syncId: row.sync_id,
    value: row.value,
    type: row.type,
    name: row.name,
    account_id: accountIdBySyncId.get(row.account_sync_id) ?? existing?.account_id ?? 0,
    account_sync_id: row.account_sync_id,
    date: new Date(row.date),
    category: row.category ?? undefined,
    to_account_id: row.to_account_sync_id ? (accountIdBySyncId.get(row.to_account_sync_id) ?? existing?.to_account_id) : undefined,
    to_account_sync_id: row.to_account_sync_id ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: toDate(row.deleted_at),
  };
}

function mapRemoteSettings(
  row: RemoteSettingsRow,
  accountIdBySyncId: Map<string, number>,
): LocalSettingsCandidate {
  return {
    syncId: row.sync_id,
    dark: row.dark,
    main_account_id: row.main_account_sync_id ? (accountIdBySyncId.get(row.main_account_sync_id) ?? 0) : 0,
    main_account_sync_id: row.main_account_sync_id ?? undefined,
    week_starting_day: row.week_starting_day,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: toDate(row.deleted_at),
  };
}

function serializeAccount(userId: string, row: Accounts) {
  return {
    user_id: userId,
    sync_id: row.syncId,
    name: row.name,
    type: row.type,
    goal_value: row.goalValue ?? null,
    goal_date: row.goalDate ? row.goalDate.toISOString() : null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    deleted_at: row.deletedAt ? row.deletedAt.toISOString() : null,
  };
}

function serializeTransaction(userId: string, row: Transactions) {
  return {
    user_id: userId,
    sync_id: row.syncId,
    value: row.value,
    type: row.type,
    name: row.name,
    account_sync_id: row.account_sync_id,
    date: row.date.toISOString(),
    category: row.category ?? null,
    to_account_sync_id: row.to_account_sync_id ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    deleted_at: row.deletedAt ? row.deletedAt.toISOString() : null,
  };
}

function serializeSettings(userId: string, row: Settings) {
  return {
    user_id: userId,
    sync_id: row.syncId,
    dark: row.dark,
    main_account_sync_id: row.main_account_sync_id ?? null,
    week_starting_day: row.week_starting_day,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    deleted_at: row.deletedAt ? row.deletedAt.toISOString() : null,
  };
}

async function upsertLocalAccount(row: LocalAccountCandidate) {
  const existing = await db.accounts.where('syncId').equals(row.syncId).first();
  if (existing) {
    await db.accounts.put({ ...row, id: existing.id } as Accounts);
    return;
  }

  await db.accounts.add(row as Accounts);
}

async function upsertLocalTransaction(row: LocalTransactionCandidate) {
  const existing = await db.transactions.where('syncId').equals(row.syncId).first();
  if (existing) {
    await db.transactions.put({ ...row, id: existing.id } as Transactions);
    return;
  }

  await db.transactions.add(row as Transactions);
}

async function upsertLocalSettings(row: LocalSettingsCandidate) {
  const existing = await db.settings.where('syncId').equals(row.syncId).first();
  if (existing) {
    await db.settings.put({ ...row, id: existing.id } as Settings);
    return;
  }

  await db.settings.add(row as Settings);
}

async function pullRemoteAccounts(userId: string): Promise<Accounts[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('sync_id,name,type,goal_value,goal_date,created_at,updated_at,deleted_at')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapRemoteAccount(row as RemoteAccountRow) as Accounts);
}

async function pullRemoteTransactions(userId: string, accountIdBySyncId: Map<string, number>): Promise<Transactions[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('sync_id,value,type,name,account_sync_id,date,category,to_account_sync_id,created_at,updated_at,deleted_at')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapRemoteTransaction(row as RemoteTransactionRow, accountIdBySyncId) as Transactions);
}

async function pullRemoteSettings(userId: string, accountIdBySyncId: Map<string, number>): Promise<Settings[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('settings')
    .select('sync_id,dark,main_account_sync_id,week_starting_day,created_at,updated_at,deleted_at')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapRemoteSettings(row as RemoteSettingsRow, accountIdBySyncId) as Settings);
}

async function pushAccounts(userId: string, accounts: Accounts[]) {
  if (!supabase || accounts.length === 0) {
    return;
  }

  const { error } = await supabase.from('accounts').upsert(
    accounts.map((account) => serializeAccount(userId, account)),
    { onConflict: 'user_id,sync_id' },
  );

  if (error) {
    throw error;
  }
}

async function pushTransactions(userId: string, transactions: Transactions[]) {
  if (!supabase || transactions.length === 0) {
    return;
  }

  const { error } = await supabase.from('transactions').upsert(
    transactions.map((transaction) => serializeTransaction(userId, transaction)),
    { onConflict: 'user_id,sync_id' },
  );

  if (error) {
    throw error;
  }
}

async function pushSettings(userId: string, settings: Settings[]) {
  if (!supabase || settings.length === 0) {
    return;
  }

  const { error } = await supabase.from('settings').upsert(
    settings.map((row) => serializeSettings(userId, row)),
    { onConflict: 'user_id,sync_id' },
  );

  if (error) {
    throw error;
  }
}

function buildAccountIdBySyncId(accounts: Accounts[]) {
  return new Map(accounts.map((account) => [account.syncId, account.id]));
}

export async function runFullSync() {
  if (!supabase) {
    return;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user) {
    return;
  }

  const localAccounts = await db.accounts.toArray();
  const remoteAccounts = await pullRemoteAccounts(user.id);
  const accountPlan = buildSyncPlan(localAccounts, remoteAccounts);

  for (const remoteAccount of accountPlan.applyLocal) {
    await upsertLocalAccount(remoteAccount);
  }
  await pushAccounts(user.id, accountPlan.pushRemote);

  const syncedAccounts = await db.accounts.toArray();
  const accountIdBySyncId = buildAccountIdBySyncId(syncedAccounts);

  const localTransactions = await db.transactions.toArray();
  const remoteTransactions = await pullRemoteTransactions(user.id, accountIdBySyncId);
  const transactionPlan = buildSyncPlan(localTransactions, remoteTransactions);

  for (const remoteTransaction of transactionPlan.applyLocal) {
    await upsertLocalTransaction(remoteTransaction);
  }
  await pushTransactions(user.id, transactionPlan.pushRemote);

  const localSettings = await db.settings.toArray();
  const remoteSettings = await pullRemoteSettings(user.id, accountIdBySyncId);
  const settingsPlan = buildSyncPlan(localSettings, remoteSettings);

  for (const remoteSetting of settingsPlan.applyLocal) {
    await upsertLocalSettings(remoteSetting);
  }
  await pushSettings(user.id, settingsPlan.pushRemote);
}

export function scheduleSync() {
  queuedSync = queuedSync
    .catch(() => undefined)
    .then(async () => {
      try {
        await runFullSync();
      } catch (error) {
        console.error('Supabase sync failed.', error);
      }
    });

  return queuedSync;
}
