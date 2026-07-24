# Contract: Repository Weekly Planning

## Scope

Defines repository-level interface expectations for weekly planning entities and operations.

## Interface Additions

### getStandardWeekTemplateByAccountId(accountId)

Input:
- accountId: number

Output:
- Promise resolving to template with items, or undefined when absent.

Behavior:
- Returns only non-deleted template and non-deleted items.
- Enforces one-template-per-account invariant at read boundary.

### upsertStandardWeekTemplate(template, items)

Input:
- template: template header payload (existing or new)
- items: template item payload list

Output:
- Promise resolving to saved template identifier and saved items.

Behavior:
- Performs create-or-update semantics for template header.
- Replaces item set according to provided itemChanges strategy.
- Stamps updatedAt consistently on modified rows.

Validation errors:
- Reject if account reference is missing.
- Reject if any item has invalid bucket_type or amount < 0.

### getWeeklyPlanByAccountAndWeek(accountId, weekStart, weekEnd)

Input:
- accountId: number
- weekStart: Date
- weekEnd: Date

Output:
- Promise resolving to snapshot with items, or undefined when absent.

Behavior:
- Exact week window match.
- Excludes soft-deleted rows.

### createWeeklyPlanFromTemplate(accountId, weekStart, weekEnd)

Input:
- accountId: number
- weekStart: Date
- weekEnd: Date

Output:
- Promise resolving to created snapshot with copied items.

Behavior:
- Requires template existence.
- Copies template items into snapshot items.
- Sets status to draft.
- Persists immutable week boundaries.

Validation errors:
- Reject if template missing.
- Reject if snapshot for same account/week already exists.

### updateWeeklyPlan(weeklyPlanId, changes, itemChanges)

Input:
- weeklyPlanId: number
- changes: partial snapshot header changes
- itemChanges: add/edit/remove mutations for snapshot items

Output:
- Promise resolving when update completes.

Behavior:
- Allowed only when snapshot status is draft.
- Rejects updates on locked snapshots.
- Preserves week_start/week_end immutability.

### lockPastWeeklyPlans(referenceDate)

Input:
- referenceDate: Date

Output:
- Promise resolving to count/list of snapshots transitioned to locked.

Behavior:
- Transitions draft snapshots to locked when week_end < referenceDate.
- Idempotent across repeated invocations for same date.

### listWeeklyPlansByAccount(accountId, options)

Input:
- accountId: number
- options: optional filters (status, date ranges, pagination strategy)

Output:
- Promise resolving to ordered snapshot collection.

Behavior:
- Returns non-deleted snapshots only.
- Supports filters used by Planner history and reporting contexts.

### deleteWeeklyPlan(id)

Input:
- id: number

Output:
- Promise resolving when deletion completes.

Behavior:
- Soft-delete snapshot and child items.
- Preserves tombstone sync metadata.

## Cross-Cutting Contract Rules

- All mutating methods are async and timestamped for sync compatibility.
- All methods preserve syncId identity where records already exist.
- Repository methods remain framework-agnostic and UI-agnostic.
- Errors are deterministic and typed/mapped so UI can show actionable states.
