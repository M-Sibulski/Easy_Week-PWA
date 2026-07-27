# Tasks: Weekly Planning Foundation

**Input**: Design documents from `/specs/001-weekly-planning-foundation/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are REQUIRED for this feature because it introduces behavior-changing financial logic, persistence flows, and UI state changes.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story?] Description`

- [P] means task can run in parallel
- [Story] is only used in user story phases
- Every task includes explicit file path(s)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create weekly planning module/test scaffolding used by all stories.

- [X] T001 Create weekly planning module scaffold in src/weeklyPlanning/index.ts and src/weeklyPlanning/weeklyPlanningService.ts
- [X] T002 Create weekly planning test scaffold in src/weeklyPlanning/weeklyPlanningService.test.ts
- [X] T003 [P] Create planning UI folder scaffolds in src/planner/.gitkeep and src/myWeek/.gitkeep

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add data model, persistence contracts, and shared access wiring before story work.

**CRITICAL**: No user story work starts before this phase is complete.

- [X] T004 Extend planning entity and enum types in types.ts
- [X] T005 Add Dexie schema version for weekly planning stores and indexes in db.ts
- [X] T006 Add weekly planning repository contract methods in src/repository/IRepository.ts
- [X] T007 Implement shared Dexie mapping helpers for planning rows in src/repository/DexieRepository.ts
- [X] T008 Implement SyncingRepository passthrough methods for planning APIs in src/repository/SyncingRepository.ts
- [X] T009 [P] Add live query hooks for templates/snapshots in src/hooks/useAppData.ts
- [X] T010 [P] Export new planning public types/helpers in src/weeklyPlanning/index.ts

**Checkpoint**: Foundation complete. User stories can begin.

---

## Phase 3: User Story 1 - Define Standard Week Plan (Priority: P1) 🎯 MVP

**Goal**: User can create and maintain one standard weekly template per account with derived totals preview.

**Independent Test**: Create template with multiple rows, save, reopen Planner, verify persistence and derived totals.

### Tests for User Story 1 (write first, fail first)

- [X] T011 [P] [US1] Add template validation/totals unit tests in src/weeklyPlanning/weeklyPlanningService.test.ts
- [X] T012 [P] [US1] Add template repository CRUD tests in src/repository/DexieRepository.test.ts
- [X] T013 [P] [US1] Add Planner template editor component tests in src/PlannerScreen.test.tsx

### Implementation for User Story 1

- [X] T014 [US1] Implement template validation and derived totals logic in src/weeklyPlanning/weeklyPlanningService.ts
- [X] T015 [US1] Implement getStandardWeekTemplateByAccountId and upsertStandardWeekTemplate in src/repository/DexieRepository.ts
- [X] T016 [P] [US1] Build template row editor component in src/planner/TemplateItemRow.tsx
- [X] T017 [P] [US1] Build template summary preview component in src/planner/TemplateSummary.tsx
- [X] T018 [US1] Build Planner screen template workflow in src/PlannerScreen.tsx
- [X] T019 [US1] Replace Planner placeholder with PlannerScreen in src/Mainscreen.tsx
- [X] T020 [US1] Wire Planner account/template data loading hooks in src/PlannerScreen.tsx and src/hooks/useAppData.ts

**Checkpoint**: US1 fully functional and independently testable.

---

## Phase 4: User Story 2 - Create and Manage Weekly Snapshot (Priority: P1)

**Goal**: User can explicitly create current-week snapshot from template, edit during active week, and be blocked once locked.

**Independent Test**: Create current-week snapshot from template, edit in active week, advance reference date past week end, verify locked behavior.

### Tests for User Story 2 (write first, fail first)

- [X] T021 [P] [US2] Add snapshot creation/mutability/locking unit tests in src/weeklyPlanning/weeklyPlanningService.test.ts
- [X] T022 [P] [US2] Add snapshot repository and lock query tests in src/repository/DexieRepository.test.ts
- [X] T023 [P] [US2] Add Planner snapshot CTA and read-only-state tests in src/PlannerScreen.test.tsx

### Implementation for User Story 2

- [X] T024 [US2] Implement snapshot build and mutability policy logic in src/weeklyPlanning/weeklyPlanningService.ts
- [X] T025 [US2] Implement snapshot repository methods (create/get/update/list/delete/lock) in src/repository/DexieRepository.ts
- [X] T026 [US2] Implement IRepository + SyncingRepository snapshot method coverage in src/repository/IRepository.ts and src/repository/SyncingRepository.ts
- [X] T027 [US2] Add Create this week plan CTA and snapshot creation flow in src/PlannerScreen.tsx
- [X] T028 [US2] Add draft snapshot item editing flow in src/planner/SnapshotItemEditor.tsx and src/PlannerScreen.tsx
- [X] T029 [US2] Add locked snapshot read-only UX state in src/planner/SnapshotSummary.tsx and src/PlannerScreen.tsx
- [X] T030 [US2] Trigger lockPastWeeklyPlans at lifecycle entry points in src/Mainscreen.tsx
- [X] T031 [US2] Preserve historical boundaries under week-start setting changes in src/weeklyPlanning/weeklyPlanningService.ts and src/PlannerScreen.tsx

**Checkpoint**: US2 fully functional and independently testable.

---

## Phase 5: User Story 3 - Track Weekly Plan vs Actual in My Week (Priority: P2)

**Goal**: User sees no-plan empty state or full compare signals (remaining, pacing, savings, category variance).

**Independent Test**: For known week transactions, verify no-plan state and compare calculations/rendering accuracy.

### Tests for User Story 3 (write first, fail first)

- [X] T032 [P] [US3] Add compare metric/pacing/savings calculation unit tests in src/weeklyPlanning/weeklyPlanningService.test.ts
- [X] T033 [P] [US3] Add My Week empty-state and compare-card tests in src/WeekScreen.test.tsx
- [X] T034 [P] [US3] Add planner-navigation CTA behavior tests in src/Mainscreen.test.tsx

### Implementation for User Story 3

- [X] T035 [US3] Implement compare metrics and pacing status helpers in src/weeklyPlanning/weeklyPlanningService.ts
- [X] T036 [P] [US3] Build My Week no-plan empty state component in src/myWeek/NoWeeklyPlanState.tsx
- [X] T037 [P] [US3] Build comparison cards component in src/myWeek/WeeklyPlanCompareCards.tsx
- [X] T038 [P] [US3] Build per-category variance list component in src/myWeek/WeeklyPlanVarianceList.tsx
- [X] T039 [US3] Integrate weekly plan lookup and compare rendering in src/WeekScreen.tsx
- [X] T040 [US3] Add My Week CTA handoff to Planner tab in src/Mainscreen.tsx and src/WeekScreen.tsx
- [X] T041 [US3] Apply transaction-type inclusion rules for spend/income/savings compare in src/weeklyPlanning/weeklyPlanningService.ts

**Checkpoint**: US3 fully functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, regression protection, and documentation updates across all stories.

- [X] T042 [P] Add regression coverage for existing transaction/account/week-navigation flows in src/Mainscreen.localfirst.test.tsx and src/WeekScreen.test.tsx
- [X] T043 [P] Update architecture notes for weekly planning modules in docs/architecture/frontend.md and docs/architecture/repositories.md
- [X] T044 [P] Update testing strategy notes for weekly planning coverage in docs/coding/testing.md
- [X] T045 Run quickstart validation scenarios from specs/001-weekly-planning-foundation/quickstart.md and capture results in specs/001-weekly-planning-foundation/quickstart.md
- [X] T046 Run full quality gate (`npm run lint` and `npm test`) and fix residual issues in src/** and docs/**

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): Starts immediately
- Foundational (Phase 2): Depends on Setup and blocks all stories
- User Stories (Phases 3-5): Depend on Foundational completion
- Polish (Phase 6): Depends on completion of targeted stories

### User Story Dependencies

- US1 (P1): Starts after Foundational; no dependency on other stories
- US2 (P1): Starts after Foundational; depends functionally on US1 template flow
- US3 (P2): Starts after Foundational; depends functionally on US2 snapshot availability

### Within Each Story

- Tests first and failing before implementation
- Domain logic before repository/UI integration
- UI integration before final story regression checks

## Parallel Opportunities

- Foundational: T009 and T010 can run parallel after T004-T008 are stable
- US1: T011, T012, T013 parallel; T016 and T017 parallel
- US2: T021, T022, T023 parallel; T028 and T029 parallel
- US3: T032, T033, T034 parallel; T036, T037, T038 parallel
- Polish: T042, T043, T044 parallel

## Parallel Example: User Story 1

```bash
# Parallel test authoring (US1)
T011 src/weeklyPlanning/weeklyPlanningService.test.ts
T012 src/repository/DexieRepository.test.ts
T013 src/PlannerScreen.test.tsx

# Parallel UI component implementation (US1)
T016 src/planner/TemplateItemRow.tsx
T017 src/planner/TemplateSummary.tsx
```

## Parallel Example: User Story 2

```bash
# Parallel test authoring (US2)
T021 src/weeklyPlanning/weeklyPlanningService.test.ts
T022 src/repository/DexieRepository.test.ts
T023 src/PlannerScreen.test.tsx

# Parallel UI implementation (US2)
T028 src/planner/SnapshotItemEditor.tsx
T029 src/planner/SnapshotSummary.tsx
```

## Parallel Example: User Story 3

```bash
# Parallel test authoring (US3)
T032 src/weeklyPlanning/weeklyPlanningService.test.ts
T033 src/WeekScreen.test.tsx
T034 src/Mainscreen.test.tsx

# Parallel UI implementation (US3)
T036 src/myWeek/NoWeeklyPlanState.tsx
T037 src/myWeek/WeeklyPlanCompareCards.tsx
T038 src/myWeek/WeeklyPlanVarianceList.tsx
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phases 1-2
2. Complete Phase 3 (US1)
3. Validate US1 independently before advancing

### Incremental Delivery

1. Deliver US1 (template editor + derived totals)
2. Deliver US2 (snapshot creation/edit/lock)
3. Deliver US3 (My Week compare feedback)
4. Finish polish and full regression gates

### Team Parallel Strategy

1. Team completes Setup + Foundational together
2. Then split by story while respecting functional dependencies:
   - Dev A: US1
   - Dev B: US2 preparation/tests, then implementation after US1 baseline
   - Dev C: US3 preparation/tests, then implementation after US2 snapshot baseline
