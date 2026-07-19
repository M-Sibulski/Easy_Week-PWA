# EasyWeek Roadmap (Draft)

## Status Legend
- Implemented: present in current codebase.
- In Progress: partial implementation present.
- Planned: described direction, not implemented.

## Roadmap Snapshot

### Phase 0 - Current Baseline (Implemented)
- Offline-first local app shell.
- Account and transaction management.
- Weekly statement view with running totals.
- Import pipeline for JSON/CSV with duplicate detection.
- Repository abstraction with Dexie implementation.
- Optional Supabase sync path with last-write-wins conflict choice.

### Phase 1 - Weekly Planning Foundation (Planned)
- Weekly plan domain model (planned income/spending buckets).
- Planner screen replacing current placeholder tab.
- Link weekly plan to selected account and week range.

### Phase 2 - Compare and Guidance (Planned)
- Planned vs Actual comparison for the active week.
- Safe-to-Spend calculation.
- Weekly dashboard summary cards and trend snapshots.

### Phase 3 - End-of-Week Learning (Planned)
- End-of-week review flow.
- Insight generation from transactions and plan adherence.
- Lightweight recommendations informed by category trends.

### Phase 4 - Optional Cloud Backends (In Progress / Planned)
- Supabase sync hardening and operational readiness.
- PocketBase backend adapter (self-host option).
- Multi-backend strategy via repository/sync abstractions.

## Current Evidence in Code
- Planner and Accounts tabs are placeholders labeled "Coming soon".
- Sync is queued and optional; local app remains usable while signed out.
- Auth UI component exists but is not currently routed as the primary app shell.

## Release Standards
- Local-only complete milestone requires:
	- Full offline operation for core weekly flows without auth.
	- No local data loss across reload/crash for core operations.
	- Deterministic tests for money math, week boundaries, and critical CRUD flows.
- Cloud-sync optional milestone requires:
	- Sync failures do not block local use.
	- Durable outbox, retry policy, and terminal-error handling are implemented.
	- Conflict policy and sync status UX are implemented and tested.
- Schema evolution standard:
	- New weekly planning tables use versioned, forward-only, recoverable migrations.
