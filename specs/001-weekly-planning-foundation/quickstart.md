# Quickstart: Validate Weekly Planning Foundation

## Goal

Validate end-to-end weekly planning behavior from template creation through My Week comparison and snapshot locking.

## Prerequisites

- Repository dependencies installed.
- Existing app can run locally.
- At least one account exists in local data.

## Setup

1. Start app in development mode.
2. Ensure selected account context is set.
3. Ensure week navigation is on current week.

Suggested commands:
- npm run dev
- npm test

## Scenario 1: Create standard week template

1. Open Planner with selected account.
2. Add multiple line items across income, fixed_expense, variable_expense, savings.
3. Save template.
4. Reopen Planner.

Expected outcome:
- Template and all line items persist.
- Derived totals and net planned margin render consistently.

References:
- Data entities: data-model.md
- UI behavior: contracts/ui-weekly-planning.md

## Scenario 2: Create current-week snapshot from template

1. From Planner, trigger Create this week plan CTA.
2. Verify snapshot appears for current week with copied items.
3. Edit one line item while week is active and save.

Expected outcome:
- Snapshot is created once for account/week window.
- Snapshot edits persist while status is draft.
- Template remains unchanged by snapshot edits.

References:
- Repository semantics: contracts/repository-weekly-planning.md

## Scenario 3: My Week comparison output

1. Ensure snapshot exists for selected account/week.
2. Add test transactions:
   - Expense and Bills entries
   - Income entry
   - Transfer into a Savings account
3. Open My Week comparison section.

Expected outcome:
- Spending uses Expense + Bills only.
- Income uses Income only.
- Transfer excluded from spending.
- Savings progress reflects transfer into Savings account.
- Remaining, pacing, and per-category variance values render.

## Scenario 4: Lock behavior after week end

1. Move to a week that has ended or simulate reference date > week_end.
2. Trigger lock lifecycle path.
3. Reopen past snapshot and attempt edit.

Expected outcome:
- Snapshot status transitions to locked.
- Edits are blocked for locked snapshot.

## Validation Test Matrix

- Unit tests:
  - Derived totals by bucket
  - Planned-vs-actual formulas
  - Pacing calculation over elapsed week ratios
  - Savings transfer detection
  - Status transition draft -> locked
- Repository tests:
  - Template/snapshot CRUD
  - account + week lookup
  - soft-delete/timestamps/syncId behavior
- Component tests:
  - Planner empty/populated states
  - create snapshot CTA
  - My Week empty and compare states
- Regression tests:
  - account flows, transaction flows, week navigation/date grouping unchanged

## Exit Criteria

- All targeted tests pass.
- No regressions in existing financial flows.
- Weekly planning behavior matches specification acceptance scenarios.


## Validation Results

- 2026-07-27: `npm run lint` ✅
- 2026-07-27: `npm test` ✅
- Automated coverage now validates template creation, snapshot creation/edit/lock, My Week empty/compare states, and existing week-navigation regressions.
- Manual `npm run dev` walkthrough was not executed in this environment; quickstart scenarios are covered by the automated suite added for this feature.
