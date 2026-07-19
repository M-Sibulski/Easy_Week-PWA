# EasyWeek Vision

## Current Product (Implemented)
EasyWeek is an offline-first finance PWA focused on weekly money management.

Primary implemented workflow:
1. Record spending and income by transaction.
2. Review a week range with day-grouped entries.
3. Track running totals for an account and for each day in the selected week.

What exists in code today:
- Local data storage in IndexedDB via Dexie.
- Multi-account support (Everyday and Savings).
- Transaction types: Income, Expense, Bills, Transfer.
- Week navigation with configurable week start day.
- JSON/CSV import into transaction history with duplicate skipping.
- PWA install/offline/update support.
- Optional Supabase auth + synchronization path.

## Product Direction (From Project Context)
Planned user loop:
Plan -> Spend -> Compare -> Learn

This loop is currently partially implemented:
- Spend: implemented through transaction capture/edit/delete.
- Learn: partially implemented through category suggestion learning.
- Plan: not implemented as a dedicated weekly planning domain yet.
- Compare: no explicit planned-vs-actual model in current code.

## Future Direction
- Weekly planning as a first-class workflow (separate from transaction logging).
- Weekly dashboard for plan/progress review.
- Planned vs Actual comparison.
- Safe-to-Spend calculation.
- End-of-week review and insights.
- Cloud sync as optional capability while preserving full local operation.
- Additional backend targets (PocketBase self-host option) without changing the local-first UX.

## Non-Negotiable Architecture Constraint
The app must always work locally, regardless of cloud configuration or connectivity.

## Product Scope Standards
- First planning release targets a single user only.
- Compare MVP includes:
	- Planned vs actual totals for active week and selected account.
	- Per-category variance states.
	- Safe-to-Spend summary for the active week.
- Learn/Review MVP includes:
	- Top 3 category variances.
	- One weekly consistency metric.
	- One manual weekly note.
- Safe-to-Spend v1 is defined as:
	- `planned_available_for_week - actual_spend_so_far - committed_upcoming_before_week_end`
	- Transfers between the user's own accounts do not count as spend.
	- Missing mandatory obligation data must produce a needs-data state instead of an optimistic positive result.
