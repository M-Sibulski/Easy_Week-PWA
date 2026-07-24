# ADR-004 Sync Strategy

## Status
Implemented

## Context
Mutations should remain local-first while cloud sync stays non-blocking and conflict-tolerant.

## Decision
Use local-first sync with a durable queued outbox, last-write-wins by `updatedAt` as the default merge rule, domain-specific conflict safeguards, and non-blocking local writes.

## Consequences
- Local writes are not blocked by sync.
- Merge behavior is deterministic for timestamp-orderable conflicts.
- Domain-specific merge rules must protect tombstones and linked transfer integrity.
- Retry behavior and sync queue durability are part of the architecture contract, not an optional implementation detail.

## Current Implementation
- Sync queueing and execution are implemented in [src/sync/syncService.ts](../../src/sync/syncService.ts).
- Post-mutation scheduling is implemented in [src/repository/SyncingRepository.ts](../../src/repository/SyncingRepository.ts).
- LWW behavior is tested in [src/sync/syncService.test.ts](../../src/sync/syncService.test.ts).
- Initial signed-in sync flow is implemented in [src/App.tsx](../../src/App.tsx).

## Future Direction
- Hardening goals include retry strategy, observability, and additional adapters, documented in [docs/architecture/sync.md](../architecture/sync.md).
- Manual sync before automatic sync is a known future decision and is not implemented in current code.

## Standards Added After Initial Adoption
- Persist pending sync work locally so retries survive reload/crash.
- Use exponential backoff with jitter for retryable failures.
- Classify failures into retryable versus terminal states.
- Surface sync state through the shared status model: `idle`, `syncing`, `degraded`, `actionRequired`, `offline`.
