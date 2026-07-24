# ADR-002 Repository Pattern

## Status
Implemented

## Context
UI and feature logic should not depend directly on persistence internals.

## Decision
Define and use a repository contract for data access and mutations, and keep storage details behind repository implementations.

## Consequences
- Storage implementations can evolve with less UI churn.
- Data behavior is centralized and easier to test.
- Multi-step consistency and error semantics are formalized in the service layer rather than repository internals.

## Current Implementation
- Repository contract is defined in [src/repository/IRepository.ts](../../src/repository/IRepository.ts).
- Dexie-backed implementation is in [src/repository/DexieRepository.ts](../../src/repository/DexieRepository.ts).
- Active composition is exported in [src/repository/index.ts](../../src/repository/index.ts).
- Repository behavior tests are in [src/repository/DexieRepository.test.ts](../../src/repository/DexieRepository.test.ts).

## Future Direction
- Maintain repository abstraction as the isolation boundary for future storage implementations and adapters, consistent with [docs/architecture/repositories.md](../architecture/repositories.md).

## Standards Added After Initial Adoption
- Repository methods throw technical and infrastructure errors.
- Expected business outcomes belong in typed service results.
- User-facing destructive reset flows must not rely on silent local-only `clear*` behavior.
