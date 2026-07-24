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

## Repository Standards
- `clear*` operations are internal maintenance primitives and must not be exposed as silent local-only user actions in normal flows.
- User-facing reset behavior must use a coordinated reset policy:
  - If authenticated with sync enabled, perform remote reset intent first, then local clear, then force a sync checkpoint.
  - If offline or unauthenticated, persist reset intent for later reconciliation.
- Consistency expectation:
  - Single repository calls must be locally durable once resolved.
  - Multi-step feature workflows belong in services, which define the correctness boundary across tables.
- Error contract:
  - Repository methods throw technical or infrastructure errors.
  - Expected business outcomes are surfaced by services as typed domain results.
