# ADR-008 UI Architecture

## Status
Implemented

## Context
Current UI is a single-page tabbed shell with one primary implemented workflow and placeholders for planned domains.

## Decision
Use bottom tabs for top-level domains, while allowing route-driven sub-screens inside each domain as workflows deepen.

## Consequences
- Delivery is focused on currently implemented weekly finance flows.
- Planner and accounts experiences communicate roadmap intent but are not feature-complete.
- Deep links and browser-history-friendly sub-flows can be introduced incrementally without replacing the current shell.

## Current Implementation
- Tab model is implemented in [src/BottomNav.tsx](../../src/BottomNav.tsx).
- Tab placeholders and weekly flow composition are in [src/Mainscreen.tsx](../../src/Mainscreen.tsx).
- Week-level view behavior is in [src/WeekScreen.tsx](../../src/WeekScreen.tsx).
- Current frontend architecture notes are in [docs/architecture/frontend.md](../architecture/frontend.md).

## Future Direction
- Weekly planning, compare, and review screens are planned in [docs/product/vision.md](../product/vision.md) and [docs/domain/weekly-plans.md](../domain/weekly-plans.md).

## Standards Added After Initial Adoption
- Keep tabs for `Planner`, `My Week`, and `Accounts` as the top-level navigation model.
- Use route-driven sub-screens for compare details, review history, and sync diagnostics.
- Apply the shared accessibility baseline across all new screens.
