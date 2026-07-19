# Synchronization Architecture

## Current State (Implemented)
Sync exists as an optional Supabase integration and is not required for local operation.

## Trigger Model
- Sync is queued by `scheduleSync()` after mutating repository operations.
- Queueing serializes sync attempts through a promise chain (`queuedSync`).
- Errors are logged and do not block local writes.

## Full Sync Flow (runFullSync)
For authenticated users with configured Supabase:
1. Pull remote accounts, merge with local accounts, apply last-write-wins, push local winners.
2. Rebuild account syncId -> local ID map.
3. Pull/merge/push transactions.
4. Pull/merge/push category suggestions.
5. Pull/merge/push settings.

## Merge Policy (Implemented)
- Identity key: `syncId`.
- Conflict rule: latest `updatedAt` wins.
- Tie-breaker: local record wins when timestamps are equal.

## Delete Semantics
- Local delete for accounts/transactions/settings is soft delete (`deletedAt`).
- Soft-deleted rows can sync as tombstones.
- Category exact-name cleanup can hard-delete remote rows by sync ID.

## Operational Characteristics
- Eventual consistency; no realtime subscriptions currently.
- Sync runs on demand after writes and at app initialization when signed in.
- Local reads are immediate and independent from sync status.

## Future Direction
- Local-first synchronization hardening (retry strategy, batching, telemetry).
- Additional backend sync adapters (PocketBase).
- Sync status UX beyond current minimal spinner + last error text.

## TODO (Architecture Review)
- Define conflict-resolution extensions for domain-specific conflicts (not only timestamp).
- Define retry/backoff policy and offline queue durability requirements.
- Define multi-device convergence tests and correctness criteria.
