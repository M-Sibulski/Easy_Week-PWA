# Tasks: UI Identity Unification

**Input**: Design documents from `/specs/002-unify-ui-identity/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required for this feature because it includes behavior-changing UI refactors and bug fixes under constitution test gates.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare governance sources, component folder structure, and shared style entry points.

- [X] T001 Create shared UI folder and index exports in src/lib/ui/index.ts
- [X] T002 Add feature-level TODO map for UI identity work in specs/002-unify-ui-identity/plan.md
- [X] T003 [P] Add design-system documentation scaffold and sections in docs/design/design-system.md
- [X] T004 [P] Update design rule metadata/versioning baseline in .github/design-system/approved-design-rules.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish reusable primitives and governance enforcement required by all user stories.

**⚠️ CRITICAL**: No user story work starts before this phase completes.

**Red-Green Rule (mandatory in this phase)**: For each behavior-changing primitive, write tests first, confirm failure (red), then implement, then confirm pass (green).

- [X] T005 Add failing test (red) for BottomSheet open/close translation behavior in src/lib/ui/BottomSheet.test.tsx
- [X] T006 [P] Add failing test (red) for SheetHeader slot layout behavior in src/lib/ui/SheetHeader.test.tsx
- [X] T007 [P] Add failing test (red) for IconButton variants and semantics in src/lib/ui/IconButton.test.tsx
- [X] T008 [P] Add failing test (red) for SubmitButton variant behavior in src/lib/ui/SubmitButton.test.tsx
- [X] T009 [P] Add failing test (red) for FormField focus-ring visibility behavior in src/lib/ui/FormField.test.tsx
- [X] T010 [P] Add failing test (red) for StatusMessage variants and semantics in src/lib/ui/StatusMessage.test.tsx
- [X] T011 Implement BottomSheet primitive and make T005 pass (green) in src/lib/ui/BottomSheet.tsx
- [X] T012 [P] Implement SheetHeader primitive and make T006 pass (green) in src/lib/ui/SheetHeader.tsx
- [X] T013 [P] Implement IconButton primitive and make T007 pass (green) in src/lib/ui/IconButton.tsx
- [X] T014 [P] Implement SubmitButton primitive and make T008 pass (green) in src/lib/ui/SubmitButton.tsx
- [X] T015 [P] Implement FormField primitive and make T009 pass (green) in src/lib/ui/FormField.tsx
- [X] T016 [P] Implement StatusMessage primitive and make T010 pass (green) in src/lib/ui/StatusMessage.tsx
- [X] T017 Add shared primitive exports and typing surface in src/lib/ui/index.ts
- [X] T018 Update skill guidance with required sync, dark-mode, SVG, and accessibility checks in .github/skills/design-system-guard/SKILL.md
- [X] T019 Sync governance rules baseline to include planned primitive variants/tokens in .github/design-system/approved-design-rules.json

**Checkpoint**: Shared primitives and governance guardrails are ready for story implementation.

---

## Phase 3: User Story 1 - Consistent Visual Language Across Core Screens (Priority: P1) 🎯 MVP

**Goal**: Users experience one cohesive visual language across main flows and auth.

**Independent Test**: Navigate main screens plus auth and verify consistent action, form, header, and feedback patterns.

### Tests for User Story 1

- [X] T020 [P] [US1] Add regression tests for bottom-sheet form structure consistency in src/CreateAccount.test.tsx
- [X] T021 [P] [US1] Add regression tests for transaction sheet structure consistency in src/CreateTransaction.test.tsx
- [X] T022 [P] [US1] Add regression tests for edit/settings sheet consistency in src/EditAccount.test.tsx
- [X] T023 [P] [US1] Add auth visual-structure consistency assertions in src/auth/AuthScreen.test.tsx

### Implementation for User Story 1

- [X] T024 [US1] Migrate CreateAccount sheet to BottomSheet, SheetHeader, FormField, and SubmitButton in src/CreateAccount.tsx
- [X] T025 [US1] Migrate CreateTransaction sheet to BottomSheet, SheetHeader, FormField, and SubmitButton in src/CreateTransaction.tsx
- [X] T026 [US1] Migrate EditAccount sheet to BottomSheet, SheetHeader, FormField, SubmitButton, and IconButton in src/EditAccount.tsx
- [X] T027 [US1] Migrate settings action sheet to BottomSheet, SheetHeader, and IconButton in src/SettingsScreen.tsx
- [X] T028 [US1] Align auth palette and controls with shared primitives in src/auth/AuthScreen.tsx
- [X] T029 [US1] Remove stale utility combinations replaced by primitives in src/App.css

**Checkpoint**: Core screens and auth share one visual language and are independently testable.

---

## Phase 4: User Story 2 - Readable and Reliable Theming (Priority: P2)

**Goal**: Light/dark theme rendering remains readable and consistent across core flows.

**Independent Test**: Toggle themes and validate text, icons, and neutral surfaces across all scoped screens.

### Tests for User Story 2

- [X] T030 [P] [US2] Add theme-mode rendering assertions for app shell and navigation in src/App.test.tsx
- [X] T031 [P] [US2] Add dark-mode readability checks for week/day rendering in src/WeekScreen.test.tsx
- [X] T032 [P] [US2] Add icon-visibility assertions for transaction row affordances in src/Transaction.test.tsx

### Implementation for User Story 2

- [X] T033 [US2] Add Tailwind dark variant mapping and semantic surface variables in src/App.css
- [X] T034 [US2] Replace legacy .theme-dark override usage with dark: utilities in src/App.tsx
- [X] T035 [US2] Migrate screen-level theme styles to dark: utilities in src/Mainscreen.tsx
- [X] T036 [US2] Migrate week/day/transaction visual surfaces to dark: utilities in src/WeekScreen.tsx
- [X] T037 [US2] Migrate bottom navigation and account surfaces to dark: utilities in src/BottomNav.tsx
- [X] T038 [US2] Fix SVG fill handling for readability in both themes in src/WeekNavigation.tsx
- [X] T039 [US2] Fix SVG fill handling for readability in both themes in src/Transaction.tsx
- [X] T040 [US2] Remove obsolete legacy dark override blocks after migration in src/App.css

**Checkpoint**: Theme behavior is coherent and readable in both modes without legacy override blocks.

---

## Phase 5: User Story 3 - Predictable Feedback and Form Interaction (Priority: P3)

**Goal**: Status messages, focus indicators, and interaction states are consistent and accessible.

**Independent Test**: Complete form and action flows with keyboard and pointer; verify standardized feedback and focus visibility.

**Traceability**: Defect tasks T047-T052 implement the canonical defect list defined in `specs/002-unify-ui-identity/spec.md` under "Canonical Defect List and Task Traceability".

### Tests for User Story 3

- [ ] T041 [P] [US3] Add focus-ring visibility tests for form inputs in src/CreateAccount.test.tsx
- [ ] T042 [P] [US3] Add standardized status-message behavior tests for account flows in src/Account.test.tsx
- [ ] T043 [P] [US3] Add hover/interaction regression assertions for PWA badge and settings actions in src/PWABadge.test.tsx

### Implementation for User Story 3

- [ ] T044 [US3] Replace ad-hoc status feedback with StatusMessage variants in src/App.tsx
- [ ] T045 [US3] Replace ad-hoc status feedback with StatusMessage variants in src/Account.tsx
- [ ] T046 [US3] Standardize focus-ring treatment for shared form controls in src/lib/ui/FormField.tsx
- [ ] T047 [US3] Fix bottom-sheet translation bug by replacing translate-y-100 usage through BottomSheet integration in src/CreateAccount.tsx
- [ ] T048 [US3] Fix bottom-sheet translation bug by replacing translate-y-100 usage through BottomSheet integration in src/EditAccount.tsx
- [ ] T049 [US3] Fix bottom-sheet translation bug by replacing translate-y-100 usage through BottomSheet integration in src/SettingsScreen.tsx
- [ ] T050 [US3] Fix invisible delete hover state to approved blue pattern in src/EditAccount.tsx
- [ ] T051 [US3] Fix PWA badge hover color to approved blue pattern in src/PWABadge.tsx
- [ ] T052 [US3] Remove dead md:max-w-2xl usage in src/Day.tsx

**Checkpoint**: Feedback semantics and focus behavior are consistent; scoped interaction bugs are resolved.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final governance sync, validation, and quality closure across all stories.

- [ ] T053 [P] Sync final approved token/variant inventory with implementation state in .github/design-system/approved-design-rules.json
- [ ] T054 [P] Publish final human-readable design guidance and variant table in docs/design/design-system.md
- [ ] T055 [P] Finalize skill guidance wording to match shipped governance rules in .github/skills/design-system-guard/SKILL.md
- [ ] T056 Update README with user-facing UI identity, theming, and governance guidance changes in README.md
- [ ] T057 Run full quickstart validation checklist and record outcomes in specs/002-unify-ui-identity/quickstart.md
- [ ] T058 Run pre-closeout quality gate (README updated, lint/test/build pass, docs+skill+rules sync confirmed) and capture pass status in specs/002-unify-ui-identity/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): can start immediately.
- Foundational (Phase 2): depends on Setup; blocks all user stories.
- User Stories (Phases 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on completion of all targeted stories.

### User Story Dependencies

- US1 (P1): starts after Phase 2; forms MVP baseline.
- US2 (P2): starts after Phase 2; can run after or alongside late US1 tasks if file conflicts are managed.
- US3 (P3): starts after Phase 2; depends on primitives and intersects files touched by US1.

### Within Each User Story

- Write tests first and ensure they fail before implementation.
- Migrate/rework implementation after test scaffolding.
- Re-run story-specific tests before moving to next story.

## Parallel Opportunities

- Phase 1: T003 and T004 can run in parallel.
- Phase 2: T006-T010 (test authoring) can run in parallel, then T012-T016 (implementations) can run in parallel after red failures are captured.
- US1 tests T020-T023 can run in parallel.
- US2 tests T030-T032 can run in parallel.
- US3 tests T041-T043 can run in parallel.
- Polish docs/governance tasks T053-T055 can run in parallel before final validation.

## Parallel Example: User Story 1

```bash
# Parallel test authoring
T020 src/CreateAccount.test.tsx
T021 src/CreateTransaction.test.tsx
T022 src/EditAccount.test.tsx
T023 src/auth/AuthScreen.test.tsx

# Parallel implementation once shared primitives are ready
T024 src/CreateAccount.tsx
T025 src/CreateTransaction.tsx
T028 src/auth/AuthScreen.tsx
```

## Parallel Example: User Story 2

```bash
# Parallel test authoring
T030 src/App.test.tsx
T031 src/WeekScreen.test.tsx
T032 src/Transaction.test.tsx

# Parallel UI migrations with conflict-aware sequencing
T035 src/Mainscreen.tsx
T036 src/WeekScreen.tsx
T037 src/BottomNav.tsx
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 migrations for bottom-sheet flows and auth alignment.
3. Validate US1 independently via tests and manual walkthrough.

### Incremental Delivery

1. Deliver US1 (cohesive baseline).
2. Deliver US2 (dark-mode and readability reliability).
3. Deliver US3 (interaction/focus/feedback consistency + bug fixes).
4. Run Phase 6 final governance/doc/test/README closure.

### Quality Gates

- Run `npm run lint`, `npm test`, and `npm run build` before closing Phase 6.
- Verify docs and skill updates stay synchronized with approved rule JSON.
- Verify README updates are present and accurate for user-facing changes.
- Confirm no unrelated business logic or storage changes are introduced.
