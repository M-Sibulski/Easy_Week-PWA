# Backend Architecture

## Current Backend Reality
The core app does not require a backend for local usage.

Optional backend integration currently implemented:
- Supabase client initialization via environment variables.
- Supabase Auth integration (session restore, sign-in/up, magic link, sign-out).
- Supabase sync for:
  - accounts
  - transactions
  - category suggestions
  - settings

If Supabase environment variables are missing, backend integrations are disabled and the app continues to operate locally.

## Supabase Data Model (Implemented)
Defined in SQL schema:
- `accounts`
- `transactions`
- `category_suggestions`
- `settings`

Common patterns:
- `user_id` ownership.
- `sync_id` identity per logical record.
- `created_at`, `updated_at`, `deleted_at` timestamps.
- RLS policies enforcing `auth.uid() = user_id`.

## Sync Semantics with Backend
- Pull remote rows per table for authenticated user.
- Merge with local rows by `syncId`.
- Select winner by latest `updatedAt` (local wins ties).
- Apply remote winners locally.
- Upsert local winners to remote.

## Future Direction
- PocketBase self-host backend option.
- Potential additional backend adapters behind repository/sync contracts.
- Better backend operational concerns (rate limiting, retry policy, observability).

## Backend Standards
- Sync backend expectations:
  - Remote writes must support idempotent retry behavior.
  - Terminal sync failures must be diagnosable without exposing finance data in logs.
- Migration/versioning policy:
  - Use forward-only, deterministic migrations for new backend tables.
  - Avoid destructive replacement/removal in the same release that introduces a new schema path.
- Data retention and deletion policy:
  - Respect soft-delete/tombstone behavior for sync convergence.
  - Production logging must never include raw finance fields or user identifiers.
  - Deletion and retention behavior must remain compatible with user-visible reset and purge controls.
