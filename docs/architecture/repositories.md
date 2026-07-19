# Repository Layer

## Purpose (Implemented)
The repository layer provides a stable contract (`IRepository`) so UI/application logic is decoupled from storage and sync implementation details.

## Contract Surface (Implemented)
`IRepository` currently defines grouped operations for:
- Accounts
- Transactions
- Category suggestions
- Settings

Operation types include:
- Query/list lookups
- Insert/add
- Put (full row upsert/replace)
- Partial updates
- Soft/hard delete variants
- Clear table operations

## Active Implementations

### DexieRepository (Implemented)
Responsibilities:
- Read/write from IndexedDB tables through Dexie.
- Stamp records with:
  - `syncId` (if missing)
  - `createdAt` and `updatedAt`
- Soft-delete accounts and transactions by setting `deletedAt` + `updatedAt`.
- Filter soft-deleted rows from user-facing reads.
- Keep `getAllTransactions()` unfiltered for import dedupe/sync workflows.

### SyncingRepository (Implemented)
Responsibilities:
- Decorates an inner repository.
- For mutating methods, schedules async sync via `scheduleSync()`.
- Delegates read methods directly.
- Category exact-name delete path performs remote hard delete before local delete.

## Selection
Current exported repository instance:
- `new SyncingRepository(new DexieRepository())`

This means:
- Local write is primary.
- Sync is best-effort background follow-up.

## Future Direction
- Add additional repository implementations for cloud backends (e.g., Supabase-specific and PocketBase-specific adapters).
- Potential composite/fallback repository strategy if multi-backend support is active at runtime.

## TODO (Architecture Review)
- Decide if `clear*` methods should also schedule sync or remain local maintenance only.
- Define consistency guarantees for sequences of related writes across tables.
- Define a formal error contract (typed result vs thrown error) for repository methods.
