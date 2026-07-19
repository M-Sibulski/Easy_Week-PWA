# Accounts Domain

## Domain Model (Implemented)
Account fields:
- `id` (local numeric key)
- `syncId` (cross-system logical key)
- `name`
- `type`: `Everyday` or `Savings`
- optional `goalValue`
- optional `goalDate`
- `createdAt`, `updatedAt`, optional `deletedAt`

## Current Behavior (Implemented)
- Create account via account dialog.
- Edit account via edit dialog.
- Mark account as main account (stored in settings as local ID + sync ID).
- Delete account uses soft-delete in repository.
- Account deletion flow also marks related outgoing transactions deleted.

### Starter Pack Accounts
On first local initialization/reset, starter data is created:
- Main Account (Everyday)
- Savings (with default goal values)

## Account Selection Behavior
- Active account drives transaction list and total calculations.
- If settings points to missing account, app falls back to the smallest account ID and patches settings.
- If no accounts exist, active account resets to 0 and settings main account fields are cleared.

## Future Direction
- Richer account dashboards and management screens (currently tab is placeholder).
- Potential account grouping and planning context per week.

## Approved Standards
- Account and related workflow behavior must remain fully usable locally without auth.
- Account-affecting multi-step workflows belong in services, not in components or repository internals.
- Transfer-linked records must preserve transfer integrity during conflict handling and sync reconciliation.
- User-facing destructive reset flows must use the coordinated reset policy rather than silent local-only clears.

## Remaining Open Items
- Define account deletion policy for transfer-linked records (`to_account_id` references).
- Define whether account types should expand beyond `Everyday` and `Savings`.
- Define validation rules for account naming uniqueness and constraints.
