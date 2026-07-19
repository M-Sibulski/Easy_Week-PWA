# ADR-006 Offline Storage

## Status
Implemented

## Context
The app needs durable browser-side persistence for accounts, transactions, category suggestions, and settings.

## Decision
Use Dexie over IndexedDB with explicit schema versioning and migrations, including sync identifiers and tombstone metadata.

## Consequences
- Data persists across reloads and offline sessions.
- Schema migration complexity grows over time.
- Soft-delete semantics support sync tombstones.

## Current Implementation
- Dexie versions, indexes, and migrations are in [db.ts](../../db.ts).
- Data model fields for sync and deletion metadata are in [types.ts](../../types.ts).
- Soft-delete repository behavior is in [src/repository/DexieRepository.ts](../../src/repository/DexieRepository.ts).

## Future Direction
- Add new domain tables for weekly planning and compare workflows when planned features are implemented, per [docs/product/roadmap.md](../product/roadmap.md).

## Open Questions
- What retention policy should apply to tombstoned rows?
- When should purge or compaction processes run locally?
