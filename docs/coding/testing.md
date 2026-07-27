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
- Weekly planning template/snapshot repository behavior, including lock transitions.
- Last-write-wins helper behavior.
- Category suggestion serialization/mapping in sync layer.

### UI and Workflows
- App shell behavior for signed-out local-first use and initial sync indicator.
- Mainscreen local-first initialization behavior and Planner CTA handoff.
- PlannerScreen template, snapshot CTA, and locked-state rendering.
- WeekScreen grouping/navigation/scroll forwarding plus empty/compare weekly-plan states.
- CreateTransaction and Transaction interactions.
- Settings reset and update/create settings flows.
- Import parsing, transfer handling, dedupe behavior.

### Domain Logic
- Category suggestion tokenization/recommendation/learning.
- Date parsing preservation for calendar-day correctness.
- Reset-user-data sequence (remote delete then local reset/starter pack).
- Weekly planning totals, validation, snapshot copying, pacing, savings progress, and variance calculations.

## Weekly Planning Coverage Guidance
- Unit tests should cover:
  - bucket-based totals and net margin
  - template validation
  - snapshot draft/locked mutability rules
  - transaction-type inclusion rules for spending, income, and savings
  - pacing thresholds and historical snapshot lookup fallbacks
- Repository tests should cover:
  - one-template-per-account reads
  - snapshot creation from template
  - draft update vs locked rejection paths
  - soft-delete and lock lifecycle behavior
- Component tests should cover:
  - Planner empty/template/draft/locked states
  - My Week no-plan CTA and compare rendering
  - regression of existing week navigation and transaction grouping

## Future Direction
- Add contract tests for additional backend adapters (e.g., PocketBase).
- Add integration scenarios for sync conflicts and multi-device convergence.
- Add explicit planner-history scenarios when historical review UI is introduced.

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
