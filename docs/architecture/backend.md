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

## TODO (Architecture Review)
- Define production-grade auth/session hardening requirements.
- Define backend migration/versioning approach for future domain tables (weekly plans, reviews, insights).
- Define data retention/deletion policy (especially around soft-deleted rows and eventual purge).
