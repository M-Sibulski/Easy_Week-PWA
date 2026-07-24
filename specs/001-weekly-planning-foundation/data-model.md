# Data Model: Weekly Planning Foundation

## Overview

This feature introduces four new planning entities that are account-scoped and local-first compatible with sync metadata.

## Entity: StandardWeekTemplate

Purpose: Reusable weekly plan template for one account.

Fields:
- id: number (local primary key)
- syncId: string (cross-device identity)
- account_id: number (FK-like reference to Accounts.id)
- account_sync_id: string (sync-safe account identity)
- week_starting_day_snapshot: number (0-6 from settings at template update time)
- name: string (optional display label, default Standard Week)
- notes: string | undefined
- createdAt: Date
- updatedAt: Date
- deletedAt: Date | undefined

Validation rules:
- Exactly one active template per account in v1.
- account_id/account_sync_id must refer to existing account.
- name may be empty/omitted; default behavior applies.

Relationships:
- 1 StandardWeekTemplate -> many StandardWeekTemplateItem.

## Entity: StandardWeekTemplateItem

Purpose: Line-item allocation in reusable template.

Fields:
- id: number
- syncId: string
- template_id: number (reference to StandardWeekTemplate.id)
- category: string (free text)
- bucket_type: income | fixed_expense | variable_expense | savings
- amount: number
- createdAt: Date
- updatedAt: Date
- deletedAt: Date | undefined

Validation rules:
- bucket_type must be one of allowed enum values.
- amount must be >= 0.
- category must be non-empty after trim.

Relationships:
- Many StandardWeekTemplateItem -> 1 StandardWeekTemplate.

## Entity: WeeklyPlanSnapshot

Purpose: Week-specific frozen planning record created from template by explicit action.

Fields:
- id: number
- syncId: string
- account_id: number
- account_sync_id: string
- template_id: number | null (v1 expects non-null)
- week_start: Date
- week_end: Date
- status: draft | locked
- notes: string | undefined
- createdAt: Date
- updatedAt: Date
- deletedAt: Date | undefined

Validation rules:
- One active snapshot per account for the same week_start/week_end window.
- week_start <= week_end.
- status transitions allowed: draft -> locked only.
- Snapshot week boundaries are immutable once created.

Relationships:
- 1 WeeklyPlanSnapshot -> many WeeklyPlanSnapshotItem.
- Many WeeklyPlanSnapshot -> 1 StandardWeekTemplate (v1 non-null relation).

State transitions:
- draft: editable during active week.
- locked: immutable; reached after week end via lifecycle lock process.

## Entity: WeeklyPlanSnapshotItem

Purpose: Frozen line-item allocation for a specific week.

Fields:
- id: number
- syncId: string
- weekly_plan_id: number (reference to WeeklyPlanSnapshot.id)
- category: string
- bucket_type: income | fixed_expense | variable_expense | savings
- amount: number
- createdAt: Date
- updatedAt: Date
- deletedAt: Date | undefined

Validation rules:
- Same validation as template items (bucket enum, non-negative amount, non-empty category).
- Item updates are allowed only when parent snapshot status is draft.

Relationships:
- Many WeeklyPlanSnapshotItem -> 1 WeeklyPlanSnapshot.

## Derived Views and Formulas

For template and snapshot entities:
- planned_income = sum(amount where bucket_type = income)
- planned_fixed_expenses = sum(amount where bucket_type = fixed_expense)
- planned_variable_expenses = sum(amount where bucket_type = variable_expense)
- planned_savings = sum(amount where bucket_type = savings)
- planned_total_spend = planned_fixed_expenses + planned_variable_expenses
- planned_net_margin = planned_income - planned_fixed_expenses - planned_variable_expenses - planned_savings

Weekly planned-vs-actual comparison:
- actual_spending = sum(Expense + Bills transactions in week window)
- actual_income = sum(Income transactions in week window)
- actual_savings_progress = sum(Transfer values where destination account type = Savings)
- spending_remaining = planned_total_spend - actual_spending
- savings_gap = planned_savings - actual_savings_progress
- pacing_target_to_date = planned_total_spend * elapsed_week_ratio
- pacing_delta = actual_spending - pacing_target_to_date

## Indexing and Query Access Patterns

Required indexes for planning tables:
- account_id
- account_sync_id
- week_start + week_end (snapshot lookup)
- status
- syncId

Primary query patterns:
- Get template by account.
- Upsert template + items by account.
- Get snapshot by account + week window.
- List snapshots by account sorted by week_start.
- Lock past snapshots by reference date.
