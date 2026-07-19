# ADR-007 State Management

## Status
Implemented

## Context
Current app behavior combines persisted domain data with transient UI interaction state.

## Decision
Use React local component state for UI state, Dexie live queries for persisted data reactivity, and context only for cross-cutting concerns such as auth.

## Consequences
- Current implementation remains simple and explicit.
- Local persistence updates automatically refresh the UI.
- Larger planning and compare workflows may require clearer domain state boundaries.

## Current Implementation
- Reactive data hooks are in [src/hooks/useAppData.ts](../../src/hooks/useAppData.ts).
- Main orchestration state is in [src/Mainscreen.tsx](../../src/Mainscreen.tsx).
- Cross-cutting auth context is in [src/auth/AuthProvider.tsx](../../src/auth/AuthProvider.tsx).

## Future Direction
- Revisit state boundaries when weekly planning features are implemented, as identified in [docs/architecture/architecture.md](../architecture/architecture.md).

## Standards Added After Initial Adoption
- Components should gather input, invoke services, and render state.
- Services own multi-step workflow orchestration and typed domain outcomes.
- Context remains for cross-cutting concerns rather than general feature orchestration unless a later ADR expands that scope.
