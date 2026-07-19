# ADR-004 Sync Strategy

## Status
Implemented

## Context
Mutations should remain local-first while cloud sync stays non-blocking and conflict-tolerant.

## Decision
Use queued best-effort sync with last-write-wins by updatedAt, preferring local rows when timestamps are equal.

## Consequences
- Local writes are not blocked by sync.
- Merge behavior is deterministic for timestamp-orderable conflicts.
- Domain-specific merge rules are not yet implemented.

## Current Implementation
- Sync queueing and execution are implemented in [src/sync/syncService.ts](../../src/sync/syncService.ts).
- Post-mutation scheduling is implemented in [src/repository/SyncingRepository.ts](../../src/repository/SyncingRepository.ts).
- LWW behavior is tested in [src/sync/syncService.test.ts](../../src/sync/syncService.test.ts).
- Initial signed-in sync flow is implemented in [src/App.tsx](../../src/App.tsx).

## Future Direction
- Hardening goals include retry strategy, observability, and additional adapters, documented in [docs/architecture/sync.md](../architecture/sync.md).
- Manual sync before automatic sync is a known future decision and is not implemented in current code.

## Open Questions
- Should manual user-triggered sync become a required first step?
- What retry and backoff policy should be standardized?
