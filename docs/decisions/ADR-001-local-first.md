# ADR-001 Local First

## Status
Implemented

## Context
EasyWeek must work without a backend and while offline. Core user flows need immediate local reads and writes.

## Decision
Use a local-first architecture where IndexedDB (via Dexie) is the immediate source of truth, with cloud sync as an optional asynchronous follow-up.

## Consequences
- The app remains usable while signed out and while offline.
- Local operations stay fast and resilient to network failures.
- Cloud consistency is eventual, not immediate.

## Current Implementation
- Dexie schema and migrations are implemented in [db.ts](../../db.ts).
- Reactive local reads are implemented in [src/hooks/useAppData.ts](../../src/hooks/useAppData.ts).
- The app shell remains available when signed out in [src/App.test.tsx](../../src/App.test.tsx).
- Local-first bootstrap behavior is covered in [src/Mainscreen.localfirst.test.tsx](../../src/Mainscreen.localfirst.test.tsx).

## Future Direction
- Keep local-first as a non-negotiable constraint while adding optional cloud adapters, as documented in [docs/product/vision.md](../product/vision.md).

## Open Questions
- What local queue durability guarantees are required for long offline periods?
- What convergence targets should be defined after reconnect?
