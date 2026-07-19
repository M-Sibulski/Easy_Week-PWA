# System Architecture

## Current Architecture (Implemented)
EasyWeek uses a local-first layered architecture:

1. UI Layer (React components)
- Screens and overlays for account, transaction, week navigation, settings, import.

2. Application/Data Access Layer
- `IRepository` contract for persistence operations.
- Active instance: `SyncingRepository(DexieRepository)`.

3. Local Persistence Layer
- Dexie/IndexedDB database (`accounts`, `transactions`, `categorySuggestions`, `settings`).
- Soft-delete via `deletedAt` for syncable tombstones.

4. Optional Sync Layer
- Supabase-backed pull/push sync.
- Last-write-wins by `updatedAt` timestamp.
- Triggered by mutating repository operations via `scheduleSync()`.

## Architectural Characteristics
- Offline-first: core flows operate on local IndexedDB.
- Backend optionality: app operates when Supabase is not configured.
- Contract-first persistence: UI code depends on repository abstraction, not direct DB APIs.
- Eventual consistency: sync runs asynchronously and is tolerant of sync failures.

## Runtime Flow (Current)
1. App initializes auth context.
2. If signed in and auth loading complete, app attempts `runFullSync()`.
3. Mainscreen renders local data via Dexie live queries.
4. CRUD operations update local DB immediately.
5. SyncingRepository schedules background sync attempts after mutations.

## Data Ownership
- Source of immediate truth for UI: local Dexie database.
- Source of eventual cloud copy (when enabled): Supabase tables keyed by `user_id + sync_id`.

## Future Direction
- Additional backend adapters (PocketBase and possibly others) behind the same repository/sync model.
- Domain expansion for weekly planning and compare workflows.
- Stronger sync observability and conflict diagnostics.

## TODO (Architecture Review)
- Define explicit module boundaries for "domain services" vs component-local logic.
- Decide long-term conflict resolution strategy beyond simple last-write-wins.
- Decide whether sync orchestration remains in the frontend or moves to a shared/offline sync engine module.
