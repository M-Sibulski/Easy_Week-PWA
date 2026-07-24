# Implementation Plan: Weekly Planning Foundation

**Branch**: `[001-weekly-planning-foundation]` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-weekly-planning-foundation/spec.md`

## Summary

Implement account-scoped weekly planning using a reusable standard-week template and explicit week snapshots, then surface planned-vs-actual feedback in My Week. The implementation uses the existing local-first repository architecture (IRepository + DexieRepository + SyncingRepository), adds deterministic planning calculation services, and introduces Planner/My Week UI states for template setup, snapshot creation, and weekly comparison signals.

## Technical Context

**Language/Version**: TypeScript 5.9.x, React 19.x

**Primary Dependencies**: React, Dexie, dexie-react-hooks, Vitest, Testing Library

**Storage**: Dexie/IndexedDB local-first stores with sync metadata fields (`syncId`, timestamps, optional `deletedAt`)

**Testing**: Vitest (`vitest run --coverage --typecheck`), Testing Library, fake-indexeddb for repository/persistence tests

**Target Platform**: Web PWA (modern desktop/mobile browsers)

**Project Type**: Single-project frontend web application (offline-first)

**Performance Goals**:
- Planner and My Week computations are instant at interactive scale (single account, one-week window)
- Weekly comparison calculations complete during render/update without visible UI lag

**Constraints**:
- Must preserve local-first behavior and offline operation
- Must keep money logic deterministic and traceable
- Must avoid regressions in existing account/transaction/week navigation flows
- Snapshot mutability policy is strict (`draft` editable, `locked` immutable)

**Scale/Scope**:
- v1 supports one standard template per account
- One snapshot per account/week window
- Feature scope includes domain, persistence, service logic, Planner flow, and My Week compare integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

- **Local-First Data Safety**: PASS
  - New planning entities are additive stores only; no destructive migration path required.
  - Soft-delete and sync metadata patterns are preserved.
  - Snapshot creation is explicit user action; no silent background data rewrites.
- **Deterministic Money Logic**: PASS
  - Comparison rules are explicit: Expense/Bills for spending, Income for income, Transfer excluded from spending.
  - Savings progress rule is explicit: transfers into savings accounts.
  - Snapshot boundaries are immutable after creation.
- **Test-Gated Changes**: PASS
  - Plan includes unit, repository, component, and regression tests for all behavior changes.
- **Pre-Release Breaking Changes**: PASS
  - Spec marks this feature as non-breaking.
  - Existing user data/workflows remain valid; weekly planning starts from empty state.
- **Open-Source Hygiene**: PASS
  - No secrets introduced.
  - Feature docs and behavior notes are included in spec/plan artifacts.

### Post-Phase 1 Re-Check

- **Local-First Data Safety**: PASS
  - Data model and contracts enforce immutable historical snapshots and additive schema changes.
- **Deterministic Money Logic**: PASS
  - Derived totals and variance formulas are codified in artifacts.
- **Test-Gated Changes**: PASS
  - Quickstart includes fail-first expectations and verification sequence.
- **Pre-Release Breaking Changes**: PASS
  - No migration required for existing users.
- **Open-Source Hygiene**: PASS
  - Artifacts are self-contained and publication-ready.

## Project Structure

### Documentation (this feature)

```text
specs/001-weekly-planning-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── repository-weekly-planning.md
│   └── ui-weekly-planning.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── repository/
│   ├── IRepository.ts
│   ├── DexieRepository.ts
│   └── SyncingRepository.ts
├── hooks/
│   └── useAppData.ts
├── sync/
├── auth/
├── Mainscreen.tsx
├── WeekScreen.tsx
├── SettingsScreen.tsx
├── ...existing UI/components/tests...

db.ts
types.ts
```

**Structure Decision**: Use the existing single-project React + TypeScript layout with feature-oriented additions in `src/repository`, new planning domain/service modules under `src`, and colocated `*.test.ts`/`*.test.tsx` files following current repository conventions.

## Phase 0 Research Outcomes

Research outputs are documented in [research.md](./research.md) and resolve all planning unknowns for this feature.

## Phase 1 Design Outputs

- Data model: [data-model.md](./data-model.md)
- Interface contracts:
  - [contracts/repository-weekly-planning.md](./contracts/repository-weekly-planning.md)
  - [contracts/ui-weekly-planning.md](./contracts/ui-weekly-planning.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Complexity Tracking

No constitution violations requiring justification.
