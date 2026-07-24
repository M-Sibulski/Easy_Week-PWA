# Contract: UI Weekly Planning

## Scope

Defines expected user-facing states and interactions for Planner and My Week weekly planning behavior.

## Planner Contract

### State A: No template for selected account

Required UI:
- Empty template state with call-to-action to create standard week template.
- Inputs for category, bucket, and amount line items.

Action outcomes:
- Save creates account template and returns to editable populated state.

### State B: Template exists, no current-week snapshot

Required UI:
- Template editor with persisted line items.
- Summary preview showing derived totals and net margin.
- CTA to create this week plan from standard template.

Action outcomes:
- Create CTA produces one draft snapshot for current week and opens snapshot view.

### State C: Current-week snapshot exists and draft

Required UI:
- Snapshot totals and line items visible.
- Editing enabled for notes and item changes.

Action outcomes:
- Save persists changes and updates compare-ready metrics.

### State D: Snapshot locked

Required UI:
- Snapshot visible in read-only mode.
- Any edit action disabled with clear reason (week ended / plan locked).

## My Week Contract

### State E: No snapshot for selected account/week

Required UI:
- Empty compare state.
- CTA to go to Planner and create week plan.

### State F: Snapshot exists for selected account/week

Required UI:
- Full-week remaining vs plan.
- Pacing status (ahead/on-track/behind) based on elapsed week ratio.
- Savings progress (planned vs transferred into savings accounts).
- Per-category variance list.

## Data Mapping Rules

- Spending comparisons include Expense and Bills transaction types only.
- Income comparisons include Income transaction type only.
- Transfer is excluded from spending and used only for savings progress when destination account is Savings.

## UX Reliability Rules

- Snapshot creation must be explicit and idempotent (no duplicate snapshot for same account/week).
- Historical snapshot displays must never change when template or week-start setting changes later.
- Planner and My Week must degrade gracefully when planning data is absent.
