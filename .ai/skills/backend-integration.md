# Skill: Backend Integration

## Purpose
Integrate cloud backends while preserving local-first guarantees and repository abstraction.

## When to use
- Extending Supabase sync.
- Adding PocketBase adapter.
- Preparing multi-backend support and self-host options.

## Rules
- Backend is optional. Core app must still work locally when backend is disabled.
- Keep backend-specific schema mapping in adapter/sync modules.
- Do not couple React components to backend clients.
- Keep conflict policy explicit. Default policy is last-write-wins by updatedAt with local tie-break, plus tombstone priority, linked-transfer integrity, and conflict escalation when unsafe.
- Design for multiple repository implementations: Local, Supabase, PocketBase.
- Sync reliability must assume durable queue persistence, retry/backoff, and idempotent remote writes.

## Step-by-step workflow
1. Define backend-neutral contract requirements in repository and service layers.
2. Implement backend adapter mapping for remote schema fields.
3. Add sync orchestration using existing queue pattern.
4. Ensure local IDs and sync IDs stay consistently mapped.
5. Add tests for merge behavior and serialization/mapping.
6. Validate signed-out and missing-env fallback path.
7. Document backend-specific constraints and self-host setup.

## Checklist
- [ ] Local-only operation remains fully functional.
- [ ] Backend adapter does not leak into UI modules.
- [ ] Sync mapping preserves syncId and timestamp semantics.
- [ ] Conflict resolution behavior is tested.
- [ ] Adapter can be swapped without feature-layer rewrites.
- [ ] Retryable vs terminal backend failures are classified intentionally.

## Common mistakes
- Assuming online availability in core flows.
- Embedding Supabase or PocketBase calls in components.
- Ignoring account sync mapping for transfer relationships.
- Treating backend schema as domain model.

## Related documentation
- [Backend Architecture](../../docs/architecture/backend.md)
- [Sync Architecture](../../docs/architecture/sync.md)
- [Backend Abstraction ADR](../../docs/decisions/ADR-003-backend-abstraction.md)
- [Sync Strategy ADR](../../docs/decisions/ADR-004-sync-strategy.md)
- [Supabase Schema](../../supabase/schema.sql)
