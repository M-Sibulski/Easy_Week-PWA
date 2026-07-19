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

## TODO (Architecture Review)
- Define explicit product-level success metrics for weekly planning outcomes.
- Define which user personas are in scope first (single user only vs household/shared planning).
- Define the minimum viable "Compare" and "Learn" screens for first weekly planning release.
