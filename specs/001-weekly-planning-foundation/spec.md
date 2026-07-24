# Feature Specification: Weekly Planning Foundation

**Feature Branch**: `[001-weekly-planning-foundation]`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Specify weekly planning feature using the md file as a fewture guide."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Define Standard Week Plan (Priority: P1)

As an account owner, I can create and maintain one reusable standard weekly plan for my account using category allocations across income, fixed expenses, variable expenses, and savings.

**Why this priority**: This is the foundation of weekly planning. Without a reusable template, users cannot create meaningful week plans.

**Independent Test**: Can be fully tested by creating an account-level standard week with multiple line items, saving it, re-opening it, and verifying all values persist correctly.

**Acceptance Scenarios**:

1. **Given** an account with no existing standard week template, **When** the user opens Planner, adds line items with category, bucket, and amount, and saves, **Then** one standard week template is stored for that account with all entered items.
2. **Given** an account with an existing standard week template, **When** the user updates, adds, or removes template line items and saves, **Then** the updated template is used for future week plan creation only.
3. **Given** a template with line items, **When** the user reviews the summary preview, **Then** derived totals are shown by bucket plus a net planned weekly margin.

---

### User Story 2 - Create and Manage Weekly Snapshot (Priority: P1)

As an account owner, I can explicitly create this week’s plan snapshot from my standard week template, edit it while the week is active, and rely on automatic locking after week end.

**Why this priority**: The weekly snapshot is the operational plan users compare against real spending. It turns template intent into week-specific commitments.

**Independent Test**: Can be fully tested by creating a snapshot for the current week, editing its line items during the active week, moving the reference date past week end, and confirming it becomes non-editable.

**Acceptance Scenarios**:

1. **Given** an account with a standard week template and no current-week snapshot, **When** the user selects "Create this week’s plan", **Then** a week-specific snapshot is created with concrete week boundaries and copied line items.
2. **Given** an active-week snapshot in draft status, **When** the user edits notes or line items, **Then** changes are saved successfully.
3. **Given** a snapshot whose week has ended, **When** the user attempts to edit it, **Then** editing is blocked because the snapshot is locked.

---

### User Story 3 - Track Weekly Plan vs Actual in My Week (Priority: P2)

As an account owner, I can see how my current week actuals compare to plan, including remaining full-week budget, pacing versus elapsed week, savings progress, and category variance.

**Why this priority**: Comparison feedback is the core behavioral value after plan creation, but depends on stories 1 and 2 being available.

**Independent Test**: Can be fully tested by loading a week with known transactions and transfers, then verifying the compare view signals and per-category variance output.

**Acceptance Scenarios**:

1. **Given** no snapshot exists for the selected account and week, **When** the user opens My Week, **Then** an empty compare state appears with a clear call-to-action to create the week plan in Planner.
2. **Given** a snapshot exists for the selected week, **When** actual transactions are present, **Then** My Week shows full-week remaining, pacing status, savings progress, and per-category variance.
3. **Given** transaction types include Expense, Bills, Income, and Transfer, **When** comparison metrics are calculated, **Then** spending includes Expense and Bills only, income includes Income only, and transfers are excluded from spending.

---

### Edge Cases

- What happens when a user tries to create this week’s snapshot but no standard week template exists for the selected account? Send user to template creation.
- How does the system handle template edits made after a weekly snapshot has already been created? Snapshot is locked, change template for future weeks.
- How does the system behave when the user changes week-start settings after historical snapshots already exist? 
- What happens when planned savings exists but no transfer into a savings account is recorded in that week? 
- How are zero-value or negative-value line item amounts handled during template or snapshot editing?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support one standard week template per account.
- **FR-002**: Users MUST be able to add, edit, and remove template line items containing category label, bucket type, and amount.
- **FR-003**: System MUST reuse free-text category labeling behavior consistent with transaction category entry patterns.
- **FR-004**: System MUST derive template totals by bucket type (income, fixed expense, variable expense, savings) and derive total planned spend as fixed plus variable.
- **FR-005**: System MUST allow users to explicitly create a weekly plan snapshot for a selected account and week from the standard template.
- **FR-006**: System MUST store concrete week start and week end boundaries on each created snapshot.
- **FR-007**: System MUST copy template line items into the snapshot at creation time so historical snapshots remain unchanged when template content changes later.
- **FR-008**: System MUST allow editing snapshot content only while snapshot status is draft and its week is active.
- **FR-009**: System MUST lock snapshots after week end and prevent further user edits.
- **FR-010**: System MUST not automatically carry over unspent or overspent values between weeks.
- **FR-011**: System MUST show a Planner call-to-action to create the current week snapshot when one does not exist.
- **FR-012**: System MUST show a My Week empty compare state with call-to-action when no snapshot exists for the selected account/week.
- **FR-013**: System MUST calculate planned-versus-actual spending using Expense and Bills as spending, Income as income, and excluding Transfer from spending.
- **FR-014**: System MUST calculate weekly savings progress by comparing planned savings against transfers into savings accounts during the week.
- **FR-015**: System MUST provide week feedback signals including full-week remaining, elapsed-week pacing status, and per-category variance.
- **FR-016**: System MUST preserve existing transaction, account, week navigation, and date grouping behaviors after introducing weekly planning.
- **FR-017**: System MUST ensure that changing week-start settings applies only to future snapshots and does not modify historical snapshot boundaries.

### Compatibility & Migration Impact *(mandatory)*

- **Breaking Change**: No
- **Impact Surface**: Planner and My Week user flows, locally stored planning records, week comparison behavior, and repository/service contracts related to planning data.
- **User Migration Needed**: No
- **Migration Notes**: Existing users continue using current account and transaction flows. Weekly planning data starts empty and can be adopted progressively without converting prior records.

### Key Entities *(include if feature involves data)*

- **Standard Week Template**: Account-level reusable weekly allocation definition with optional metadata and captured week-start context at time of save.
- **Standard Week Template Item**: Template line allocation containing free-text category, bucket type, and planned amount.
- **Weekly Plan Snapshot**: Week-specific frozen copy of template allocations with explicit week boundaries and lifecycle status (draft or locked).
- **Weekly Plan Snapshot Item**: Snapshot line allocation used for weekly comparisons and variance reporting.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of users who open Planner with a selected account can create and save a standard week template in under 5 minutes.
- **SC-002**: At least 95% of attempts to create a current-week snapshot from an existing template complete successfully on first attempt.
- **SC-003**: In test scenarios with predefined transaction sets, weekly comparison outputs (remaining, pacing, savings, category variance) match expected results with 100% correctness.
- **SC-004**: 100% of snapshots for past weeks are non-editable after week end in validation scenarios.
- **SC-005**: Existing core flows (account management, transaction entry/editing, week navigation) maintain current pass rates with no regression failures attributable to weekly planning changes.

## Assumptions

- Users already have at least one account and can select an account context before planning.
- Weekly planning v1 is intentionally single-template-per-account and does not support multiple named templates.
- Users create weekly snapshots manually; no automatic weekly snapshot generation is expected in this phase.
- Savings progress is interpreted using transfers into accounts designated as savings accounts.
- Existing date and week-navigation logic remains the canonical source for determining active and past week windows.
- Historical snapshots are treated as records of intent for their creation week and are not retroactively updated by later configuration changes.
