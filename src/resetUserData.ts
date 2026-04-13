import { createSyncId as defaultCreateSyncId } from '../syncIds.ts';
import { supabase as defaultSupabase } from './lib/supabaseClient';
import { initializeStarterPack } from './defaultData';
import { repository as defaultRepository } from './repository';
import type { IRepository } from './repository/IRepository';

type ResetRepository = Pick<
  IRepository,
  'clearTransactions' | 'clearAccounts' | 'clearCategorySuggestions' | 'clearSettings' | 'putAccount' | 'putSettings'
>;

type SupabaseDeleteQuery = {
  eq: (column: string, value: string) => PromiseLike<{ error: Error | null }>;
};

type SupabaseLike = {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null }; error: Error | null }>;
  };
  from: (table: string) => {
    delete: () => SupabaseDeleteQuery;
  };
};

type ResetDependencies = {
  repository?: ResetRepository;
  supabase?: SupabaseLike | null;
  createSyncId?: typeof defaultCreateSyncId;
};

const REMOTE_TABLES = ['transactions', 'category_suggestions', 'accounts', 'settings'] as const;
let resetCurrentUserDataInProgress = false;

export function isResetCurrentUserDataInProgress() {
  return resetCurrentUserDataInProgress;
}

async function deleteRemoteUserData(supabase: SupabaseLike, userId: string) {
  for (const table of REMOTE_TABLES) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      throw error;
    }
  }
}

export async function resetCurrentUserData(dependencies: ResetDependencies = {}) {
  const repository = dependencies.repository ?? defaultRepository;
  const supabase = dependencies.supabase ?? defaultSupabase;
  const createSyncId = dependencies.createSyncId ?? defaultCreateSyncId;

  resetCurrentUserDataInProgress = true;

  try {
    if (supabase) {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }

      if (data.user) {
        await deleteRemoteUserData(supabase, data.user.id);
      }
    }

    await repository.clearTransactions();
    await repository.clearAccounts();
    await repository.clearCategorySuggestions();
    await repository.clearSettings();

    await initializeStarterPack(repository, { createSyncId });
  } finally {
    resetCurrentUserDataInProgress = false;
  }
}
