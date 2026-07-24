# Testing Strategy (Current + Draft)

## Current Test Stack (Implemented)
- Vitest test runner.
- Testing Library for React component tests.
- JSDOM environment.
- `fake-indexeddb` for IndexedDB-compatible tests.
- Coverage via V8 reporters (`text`, `html`).

## What Is Already Covered

### Repository and Sync
- DexieRepository behavior (stamping, filtering, soft delete, lookups).
- Last-write-wins helper behavior.
- Category suggestion serialization/mapping in sync layer.

### UI and Workflows
- App shell behavior for signed-out local-first use and initial sync indicator.
- Mainscreen local-first initialization behavior.
- WeekScreen grouping/navigation/scroll forwarding.
- CreateTransaction and Transaction interactions.
- Settings reset and update/create settings flows.
- Import parsing, transfer handling, dedupe behavior.

### Domain Logic
- Category suggestion tokenization/recommendation/learning.
- Date parsing preservation for calendar-day correctness.
- Reset-user-data sequence (remote delete then local reset/starter pack).

## Testing Gaps (Observed)
- No implemented tests for planner/weekly-plan domain (feature not implemented yet).
- Limited end-to-end tests across full offline-to-online sync lifecycle.
- No explicit performance/regression suite for large import datasets.

## Future Direction
- Add domain-level tests for weekly plans, planned-vs-actual, safe-to-spend, and review insights.
- Add contract tests for additional backend adapters (e.g., PocketBase).
- Add integration scenarios for sync conflicts and multi-device convergence.

## Testing Standards
- CI merge gate:
	- All tests must pass.
	- Coverage floor is 80% lines overall, with a ratchet that must not reduce current coverage.
	- Required suites include repository/unit, finance calculation unit, and critical UI interaction coverage.
- Sync-specific gate:
	- Changes to sync/conflict logic require at least one convergence scenario.
- Timezone correctness:
	- Maintain deterministic fixtures for week-boundary and timezone-sensitive scenarios.
- Flaky test policy:
	- Repeatedly flaky tests must be quarantined with owner and fix deadline; no permanent quarantine.
