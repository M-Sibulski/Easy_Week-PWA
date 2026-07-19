# ADR-009 Testing Strategy

## Status
Implemented

## Context
Architecture-critical behavior needs repeatable regression coverage across repository, sync, and UI workflows.

## Decision
Use Vitest with Testing Library and JSDOM, plus fake-indexeddb for IndexedDB-compatible tests, and track coverage with V8 reporters.

## Consequences
- Core architecture behavior has automated regression checks.
- Full offline-to-online lifecycle and multi-device convergence coverage remains limited.

## Current Implementation
- Test configuration is in [vite.config.ts](../../vite.config.ts).
- Test and coverage scripts are in [package.json](../../package.json).
- Testing strategy notes are in [docs/coding/testing.md](../coding/testing.md).
- Representative tests are in [src/repository/DexieRepository.test.ts](../../src/repository/DexieRepository.test.ts), [src/sync/syncService.test.ts](../../src/sync/syncService.test.ts), [src/Mainscreen.localfirst.test.tsx](../../src/Mainscreen.localfirst.test.tsx), and [src/App.test.tsx](../../src/App.test.tsx).

## Future Direction
- Add tests for weekly planning domain behavior and deeper sync integration scenarios as those features are implemented, as outlined in [docs/coding/testing.md](../coding/testing.md).

## Standards Added After Initial Adoption
- CI requires all tests to pass.
- Coverage floor is 80% lines overall and must not regress.
- Sync/conflict changes require convergence coverage.
- Flaky tests must be quarantined temporarily with ownership and fix deadline.
