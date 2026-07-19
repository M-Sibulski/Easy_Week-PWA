# ADR-003 Backend Abstraction

## Status
Needs Review

## Context
The product direction includes hosted cloud and self-host options, but current sync behavior is implemented directly against Supabase models and APIs.

## Decision
Keep backend integration optional and environment-driven while preserving local-only operation.

## Consequences
- The app runs without backend configuration.
- Current sync internals are Supabase-specific.
- A full backend-neutral sync adapter layer is not yet implemented.

## Current Implementation
- Supabase configuration gating is in [src/lib/supabaseClient.ts](../../src/lib/supabaseClient.ts).
- Supabase pull/merge/push logic is in [src/sync/syncService.ts](../../src/sync/syncService.ts).
- Supabase schema and RLS policy evidence is in [supabase/schema.sql](../../supabase/schema.sql).

## Future Direction
- Add PocketBase and potentially other backend adapters behind stable contracts, as described in [docs/architecture/backend.md](../architecture/backend.md) and [docs/product/roadmap.md](../product/roadmap.md).

## Open Questions
- Should sync orchestration be extracted behind a backend-neutral interface now?
- Where should backend-specific mapping code live to avoid service coupling?
