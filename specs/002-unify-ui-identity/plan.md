# Implementation Plan: UI Identity Unification

**Branch**: `[002-unify-ui-identity]` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-unify-ui-identity/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Feature TODO Map

| Phase | Status | Tasks |
|-------|--------|-------|
| Phase 1: Setup | ✅ Complete | T001–T004 |
| Phase 2: Foundational Primitives | ✅ Complete | T005–T019 |
| Phase 3: US1 – Consistent Visual Language | ✅ Complete | T020–T029 |
| Phase 4: US2 – Readable Theming | ✅ Complete | T030–T040 |
| Phase 5: US3 – Predictable Feedback | ✅ Complete | T041–T052 |
| Phase 6: Polish | ✅ Complete | T053–T058 |

## Pre-Closeout Quality Gate — PASS ✅

Recorded: 2026-07-27

| Check | Status |
|---|---|
| All 58 tasks in tasks.md marked `[X]` | ✅ PASS |
| Lint (`npm run lint`) | ✅ PASS — 0 errors, 0 warnings |
| Tests (`npm test`) | ✅ PASS — 189/189 tests passing |
| Build (`npm run build`) | ✅ PASS — clean production build |
| Design docs synced (design-system.md v3) | ✅ PASS |
| Governance rules synced (approved-design-rules.json v3) | ✅ PASS |
| Skill guidance updated (SKILL.md) | ✅ PASS |
| README updated with UI identity section | ✅ PASS |

## Summary

Unify the app visual identity around the approved blue-centric design system by removing ad-hoc styling, introducing reusable UI primitives, migrating dark mode to Tailwind v4 `dark:` utilities mapped to existing `.theme-dark` behavior, and resolving known visual defects. Deliverables include updated design governance docs and explicit skill-level guidance in `.github/skills/design-system-guard/SKILL.md` to enforce the new rules on future UI changes.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9 + React 19

**Primary Dependencies**: React, Tailwind CSS v4, Vite, Dexie

**Storage**: Local IndexedDB via Dexie (unchanged)

**Testing**: Vitest + Testing Library + existing component/unit suite

**Target Platform**: Responsive PWA in modern desktop/mobile browsers

**Project Type**: Frontend web app (single-project React PWA)

**Performance Goals**: Preserve current interaction responsiveness for form/sheet transitions and maintain smooth visual state changes (no user-perceived regressions)

**Constraints**: Maintain offline-first behavior; no data model changes; no business logic regressions; no unauthorized design token introduction

**Scale/Scope**: Core app screens plus auth, reusable UI primitives under `src/lib/ui/`, design token governance JSON, and design-system skill documentation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Local-First Data Safety**: PASS. No Dexie schema/import/delete semantics changed. Recovery risk is visual-only; existing destructive confirmations remain unchanged.
- **Deterministic Money Logic**: PASS. No money math or aggregation logic changes in scope.
- **Test-Gated Changes**: PASS with condition. Behavior-adjacent UI updates will be covered by existing and extended component tests; run `npm test`, lint, and type checks before merge.
- **Pre-Release Breaking Changes**: PASS. No breaking data/API behavior. UI styling changes are non-breaking.
- **Open-Source Hygiene**: PASS. Update docs (`docs/design/design-system.md`) and skill guidance (`.github/skills/design-system-guard/SKILL.md`) as part of deliverables.

## Post-Design Constitution Re-Check

- **Local-First Data Safety**: PASS. Artifacts preserve no-touch policy for local data and sync logic.
- **Deterministic Money Logic**: PASS. Contracts and model isolate scope to presentation/governance.
- **Test-Gated Changes**: PASS. Quickstart defines required regression and visual validation runs.
- **Pre-Release Breaking Changes**: PASS. Migration notes not required.
- **Open-Source Hygiene**: PASS. Design governance and skill documentation explicitly included.

## Project Structure

### Documentation (this feature)

```text
specs/002-unify-ui-identity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── design-system-governance.md
│   └── design-system-guard-skill-contract.md
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── App.css
├── App.tsx
├── Mainscreen.tsx
├── WeekScreen.tsx
├── Day.tsx
├── Transaction.tsx
├── BottomNav.tsx
├── Account.tsx
├── CreateAccount.tsx
├── CreateTransaction.tsx
├── EditAccount.tsx
├── SettingsScreen.tsx
├── PWABadge.tsx
├── WeekNavigation.tsx
├── auth/
│   └── AuthScreen.tsx
└── lib/
  └── ui/

.github/
├── design-system/
│   └── approved-design-rules.json
└── skills/
  └── design-system-guard/
    └── SKILL.md

docs/
└── design/
  └── design-system.md
```

**Structure Decision**: Use the existing single-project frontend structure. Introduce shared primitives in `src/lib/ui/`, update governance in `.github/design-system/approved-design-rules.json`, and codify new guidance in `.github/skills/design-system-guard/SKILL.md` plus `docs/design/design-system.md`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
