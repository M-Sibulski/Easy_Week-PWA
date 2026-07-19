# ADR-008 UI Architecture

## Status
Implemented

## Context
Current UI is a single-page tabbed shell with one primary implemented workflow and placeholders for planned domains.

## Decision
Use a tabbed UI architecture focused on the weekly transaction workflow while keeping planner and accounts tabs as placeholders until those domains are implemented.

## Consequences
- Delivery is focused on currently implemented weekly finance flows.
- Planner and accounts experiences communicate roadmap intent but are not feature-complete.
- Route-based deep links are limited in the current model.

## Current Implementation
- Tab model is implemented in [src/BottomNav.tsx](../../src/BottomNav.tsx).
- Tab placeholders and weekly flow composition are in [src/Mainscreen.tsx](../../src/Mainscreen.tsx).
- Week-level view behavior is in [src/WeekScreen.tsx](../../src/WeekScreen.tsx).
- Current frontend architecture notes are in [docs/architecture/frontend.md](../architecture/frontend.md).

## Future Direction
- Weekly planning, compare, and review screens are planned in [docs/product/vision.md](../product/vision.md) and [docs/domain/weekly-plans.md](../domain/weekly-plans.md).

## Open Questions
- Should navigation remain tab-only or transition to route-driven screens?
- What accessibility and notification standards should be formalized globally?
