# Weekly Planning Implementation Plan

Created: 2026-07-25

## Scope
Implement weekly planning foundation plus initial creation UX, based on agreed product decisions from the design interview.

## Final Decisions Taken

1. Plan object model: Use both a reusable standard-week template and week-specific snapshots.
2. Account scope: One weekly plan per account.
3. Category model: Reuse the same free-text category labels used by transactions.
4. Carry-over: No automatic carry-over between weeks.
5. Snapshot mutability: Snapshot editable during active week, locked after week end.
6. Plan totals modeling: Totals derived from line items (category + bucket + amount), not manually entered separate totals.
7. Mid-week feedback model: Show both full-week remaining and elapsed-week pacing.
8. Snapshot creation timing: User-triggered creation only (explicit action from Planner/empty state).
9. Template count: One standard-week template per account in v1.
10. Planned-vs-actual inclusion: Expense/Bills count for spending, Income counts for income, Transfer excluded from spend.
11. Savings tracking: Planned savings is measured by actual transfers into savings accounts; if planned 300 and transferred 200, user is 100 behind savings goal.
12. Week-start setting changes: Existing snapshots keep original week boundaries; only future snapshots use new week-start setting.
13. Template edits over time: Existing snapshots remain unchanged; only future snapshots use updated template.
14. No-plan behavior in My Week: Show empty state with CTA to create this week's plan from template.
15. Status model v1: Minimal statuses `draft` and `locked`; derive active/completed labels from date window.

## Domain Model (v1)

### StandardWeekTemplate
One per account.

Fields:
- id
- syncId
- account_id
- account_sync_id
- week_starting_day_snapshot
- name (optional, default: Standard Week)
- notes (optional)
- createdAt
- updatedAt
- deletedAt (optional)

### StandardWeekTemplateItem
Line items for template allocations.

Fields:
- id
- syncId
- template_id
- category
- bucket_type (`income`, `fixed_expense`, `variable_expense`, `savings`)
- amount
- createdAt
- updatedAt
- deletedAt (optional)

Notes:
- Variable expenses can be represented by one chunky line item like "Expenses Allowance".

### WeeklyPlanSnapshot
Week-specific plan generated from template by explicit user action.

Fields:
- id
- syncId
- account_id
- account_sync_id
- template_id (nullable only if snapshot is manually created without template in future; v1 uses template)
- week_start
- week_end
- status (`draft` | `locked`)
- notes (optional)
- createdAt
- updatedAt
- deletedAt (optional)

### WeeklyPlanSnapshotItem
Frozen item allocations for a specific week.

Fields:
- id
- syncId
- weekly_plan_id
- category
- bucket_type (`income`, `fixed_expense`, `variable_expense`, `savings`)
- amount
- createdAt
- updatedAt
- deletedAt (optional)

## Calculation Rules (v1)

### Summary Totals (derived)
For template and snapshot:
- planned_income = sum(items where bucket_type = income)
- planned_fixed_expenses = sum(items where bucket_type = fixed_expense)
- planned_variable_expenses = sum(items where bucket_type = variable_expense)
- planned_savings = sum(items where bucket_type = savings)
- planned_total_spend = fixed + variable

### Planned vs Actual
- Spending actuals include transaction types `Expense` and `Bills` only.
- Income actuals include transaction type `Income`.
- Transfers are excluded from spend comparison.
- Savings progress is computed from transfers into savings accounts during the week.

### Feedback Signals
- Full-week signal: compare full-week planned totals vs current actual totals.
- Pacing signal: compare current actual spending vs elapsed proportion of planned weekly spend.
- Savings signal: planned savings vs transferred-to-savings actual.

### Week Boundary Policy
- Snapshot stores concrete `week_start` and `week_end` at creation time.
- Later changes to settings.week_starting_day do not mutate historical snapshots.

## UX Plan (Epics 1-2)

### Planner tab v1 flow
1. Show standard-week template editor for selected account.
2. If current week snapshot is missing, show CTA: Create this week's plan from standard week.
3. After creation, show snapshot summary and editable line items (while week is active).
4. Auto-lock snapshot after week end.

### My Week integration v1
1. If no snapshot for selected account/week, show empty compare state with CTA to Planner creation.
2. If snapshot exists, show:
   - Full-week remaining vs plan
   - Pacing (ahead/on-track/behind)
   - Savings progress (planned vs transferred)
   - Per-category variance rows

### Create Weekly Plan UI (Epic 2)
- Template editor screen/components:
  - Add/edit/remove item rows
  - Bucket selector per row
  - Category input (free-text)
  - Amount input
- Summary preview before save:
  - Derived totals by bucket
  - Net weekly planned margin (income - fixed - variable - savings)
  - Validation warnings for obviously inconsistent plans

## Repository and Service Plan

### IRepository additions
- getStandardWeekTemplateByAccountId(accountId)
- upsertStandardWeekTemplate(template, items)
- getWeeklyPlanByAccountAndWeek(accountId, weekStart, weekEnd)
- createWeeklyPlanFromTemplate(accountId, weekStart, weekEnd)
- updateWeeklyPlan(weeklyPlanId, changes, itemChanges)
- lockPastWeeklyPlans(referenceDate)
- listWeeklyPlansByAccount(accountId, options)
- deleteWeeklyPlan(id)

### Service layer (pure domain logic + orchestration)
Create weekly-planning service module to:
- validate template and snapshot invariants
- build snapshots from template
- compute compare metrics and status labels
- enforce mutability policy (`draft` editable, `locked` immutable)

## Database and Migration Plan

1. Add Dexie version with new stores:
- standardWeekTemplates
- standardWeekTemplateItems
- weeklyPlans
- weeklyPlanItems

2. Add indexes for:
- account_id
- account_sync_id
- week_start + week_end
- status
- syncId

3. Follow existing forward-only migration approach and backfill safe defaults where needed.

## Testing Plan

### Unit tests
- Template and snapshot validation rules
- Derived totals by bucket
- Planned-vs-actual calculations
- Pacing calculations across week progression
- Savings tracking via transfer-to-savings detection
- Lock behavior after week end

### Repository tests
- CRUD for templates and snapshots
- Query by account + week range
- Soft-delete behavior consistency
- Timestamp stamping and syncId generation

### Component tests
- Planner empty and populated states
- Create snapshot CTA behavior
- Summary preview correctness
- My Week no-plan empty state and with-plan comparison cards

### Regression tests
- Existing transaction/account flows unchanged
- Week navigation and date grouping unaffected

## Implementation Sequence

### Phase A: Domain and persistence foundation
1. Extend types and constants.
2. Add Dexie schema version and repository methods.
3. Add service module with core calculation functions.
4. Add unit and repository tests.

### Phase B: Planner creation UX
1. Replace Planner placeholder with template editor shell.
2. Add category/bucket/amount line item inputs.
3. Add derived summary preview and save flow.
4. Add current-week snapshot creation CTA.
5. Add component tests.

### Phase C: My Week compare integration
1. Add no-plan empty state + CTA.
2. Add compare cards (remaining, pacing, savings).
3. Add per-category variance list.
4. Add lock-on-week-end orchestration in lifecycle entry points.
5. Add tests for compare rendering and status labels.

## Acceptance Mapping to Epics

### Epic 1.1 Domain model
Satisfied by explicit template + snapshot entities, account linkage, category allocations, boundary policy, and no-carry-over rule.

### Epic 1.2 Database schema
Satisfied by four-table model (template header/items and weekly header/items), timestamps, status, and compatibility with reporting.

### Epic 1.3 Repository/service
Satisfied by CRUD/query/lock/list methods and dedicated calculation service with tests.

### Epic 2.4-2.6 Creation UX
Satisfied by Planner editor, category allocations, and summary preview-before-save plus explicit snapshot creation action.

## Non-Goals for v1
- Multiple templates per account.
- Automatic weekly snapshot creation.
- Retroactive mutation of historical snapshots.
- Automatic carry-over of unspent/overspent values.
- Shared strict category master catalog.

## Risks and Mitigations

1. Category inconsistency from free-text labels.
   - Mitigation: reuse suggestion learning and add light normalization in planning inputs.
2. Savings detection ambiguity for transfers.
   - Mitigation: classify savings transfer as transfer into account type `Savings`.
3. Date boundary regressions.
   - Mitigation: deterministic week fixtures and policy tests for week-start changes.

## Definition of Done (v1)
- User can define one standard week per account with categorized allocations.
- User can explicitly create current week snapshot from template.
- User can view full-week, pacing, and savings feedback in week context.
- Past weeks become locked after week end.
- All new logic covered by tests and existing flows remain green.
