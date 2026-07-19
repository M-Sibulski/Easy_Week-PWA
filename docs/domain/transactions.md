# Transactions Domain

## Domain Model (Implemented)
Transaction fields:
- `id` (local numeric key)
- `syncId`
- `value`
- `type`: `Income`, `Expense`, `Transfer`, `Bills`
- `name`
- `account_id`, `account_sync_id`
- `date`
- optional `category`
- optional `to_account_id`, `to_account_sync_id`
- `createdAt`, `updatedAt`, optional `deletedAt`

## Value Sign Rules (Implemented)
Current create/edit logic:
- Income -> stored as positive.
- Expense -> stored as negative.
- Bills:
  - Create flow stores as negative.
  - Edit flow currently uses Expense-only negativity rule, so Bills sign handling in edit path is not explicitly aligned with create path.
- Transfer -> stored as negative on source transaction row.

## Current CRUD Behavior
- Create transaction from bottom-sheet form.
- Inline edit existing transaction row.
- Delete transaction is soft delete (`deletedAt` + `updatedAt`).
- Name defaults:
  - Non-transfer empty name -> `Generic Transaction`
  - Transfer empty name -> `Transfer`

## Transfer Behavior
- Requires source account and destination account.
- Stores both local account IDs and sync IDs when available.
- Account totals in main screen combine:
  - outgoing transactions in account
  - incoming transfers mapped as opposite sign for selected account view

## Import Behavior (Implemented)
- Supports JSON arrays and CSV.
- Parses date/amount and infers type where needed.
- Creates missing transfer accounts by name during import.
- Confirms before importing.
- Skips duplicates using transaction signatures and existing transaction set.

## Future Direction
- Planned-vs-actual transaction attribution to weekly plans.
- Transaction tagging for insights/review domains.

## Approved Standards
- Transfer integrity is a protected invariant for sync conflict handling and future workflow changes.
- Import explanation policy:
  - If duplicate rows appear within the same imported file/account payload, import both rows even if identical.
  - Explain or flag this behavior in import reporting rather than collapsing those rows.
- Import audit behavior should remain explainable through counts or equivalent user-visible reporting.
- Week and day grouping for transactions must follow the shared timezone policy.

## Remaining Open Items
- Confirm intended Bills sign behavior during edit (parity with create flow).
- Define immutable vs mutable fields policy for imported transactions after creation.
- Define transfer modeling strategy if two-row transfer ledgering is later required.
