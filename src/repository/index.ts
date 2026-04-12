import { DexieRepository } from './DexieRepository';
import { SyncingRepository } from './SyncingRepository';

export type { IRepository, AccountInsert, TransactionInsert } from './IRepository';

/**
 * The active repository instance used throughout the app.
 * Swap this for a SupabaseRepository (or a multi-backend composite) to enable cloud sync.
 */
export const repository = new SyncingRepository(new DexieRepository());
