# Phase 0 Research: Weekly Planning Foundation

## Decision 1: Keep planning logic local-first with repository abstraction

- Decision: Implement weekly planning persistence via existing IRepository contract and DexieRepository/SyncingRepository layering.
- Rationale: Preserves architecture consistency, keeps UI decoupled from storage details, and respects local-first behavior requirements.
- Alternatives considered:
  - Direct Dexie access from components: rejected due to weaker boundaries and harder testing.
  - New parallel persistence service bypassing repository: rejected due to duplicated persistence concerns.

## Decision 2: Add four additive planning stores in Dexie schema

- Decision: Add standardWeekTemplates, standardWeekTemplateItems, weeklyPlans, and weeklyPlanItems as additive stores with sync metadata and soft-delete compatibility.
- Rationale: Matches existing normalized patterns while enabling immutable week snapshots and independent line-item updates.
- Alternatives considered:
  - Embed items as JSON arrays in header rows: rejected due to poorer queryability and sync granularity.
  - Reuse transactions table for plans: rejected because planning intent and actuals are separate domains.

## Decision 3: Use explicit snapshot creation only (no auto-generation)

- Decision: Create week snapshots only when user triggers CTA from Planner or My Week empty state.
- Rationale: Aligns with product decisions, avoids accidental plan creation, and keeps user intent explicit.
- Alternatives considered:
  - Auto-create on week navigation: rejected due to surprise writes and ambiguous user intent.
  - Auto-create during app startup: rejected due to hidden side effects and potential stale assumptions.

## Decision 4: Enforce immutable historical week boundaries

- Decision: Persist week_start and week_end on snapshot creation and never recompute historical snapshots from settings changes.
- Rationale: Guarantees historical integrity and deterministic comparisons.
- Alternatives considered:
  - Recompute boundaries dynamically from current settings: rejected because history would drift over time.

## Decision 5: Deterministic planned-vs-actual calculation rules

- Decision: Spending actuals = Expense + Bills; income actuals = Income; transfers excluded from spend; savings progress = transfers into savings accounts.
- Rationale: Keeps calculation intent explicit and traceable to product rules.
- Alternatives considered:
  - Include transfers in spending: rejected because transfer is movement, not spend.
  - Infer savings from net account balance changes: rejected due to noise and lower explainability.

## Decision 6: Snapshot mutability policy with status gate

- Decision: Only draft snapshots are editable; lock snapshots after week end and block updates.
- Rationale: Preserves plan integrity while allowing active-week adjustments.
- Alternatives considered:
  - Keep all snapshots editable forever: rejected due to historical inconsistency.
  - Lock immediately at creation: rejected because it prevents legitimate active-week updates.

## Decision 7: Validation and testing strategy

- Decision: Cover changes with unit tests (calculations/invariants), repository tests (CRUD/indexing/query), and component tests (Planner/My Week states and CTA behavior), plus regression checks for existing flows.
- Rationale: Satisfies constitution requirement for test-gated behavior changes and protects deterministic money logic.
- Alternatives considered:
  - UI-only coverage: rejected because core financial rules require pure domain validation.
  - Repository-only coverage: rejected because CTA/state transitions are user-visible behavior.

## Decision 8: Keep compatibility non-breaking in pre-release

- Decision: Introduce weekly planning as additive functionality without altering current account/transaction contracts.
- Rationale: Enables gradual adoption and avoids migration burden.
- Alternatives considered:
  - Replace existing week views entirely: rejected because it increases rollout risk and regressions.
