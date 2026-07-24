<!--
Sync Impact Report
- Version change: template (unversioned) -> 1.0.0
- Modified principles:
	- [PRINCIPLE_1_NAME] -> I. Local-First Data Safety
	- [PRINCIPLE_2_NAME] -> II. Deterministic Money Logic
	- [PRINCIPLE_3_NAME] -> III. Test-Gated Changes (NON-NEGOTIABLE)
	- [PRINCIPLE_4_NAME] -> IV. Pre-Release Agility Over Backward Compatibility
	- [PRINCIPLE_5_NAME] -> V. Open-Source Hygiene by Default
- Added sections:
	- Engineering Standards
	- Workflow and Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- .specify/templates/plan-template.md: ✅ updated
	- .specify/templates/spec-template.md: ✅ updated
	- .specify/templates/tasks-template.md: ✅ updated
	- .specify/templates/commands/*.md: ✅ no files present, nothing to update
	- README.md: ✅ updated
- Deferred TODOs:
	- None
-->

# Easy Week PWA Constitution

## Core Principles

### I. Local-First Data Safety
The app MUST preserve user data integrity in offline-first operation at all times. Any
change affecting Dexie schema, import behavior, account deletion, or transaction
replacement MUST include an explicit data safety review, including rollback or recovery
expectations. Destructive actions MUST require clear user confirmation.

Rationale: This product stores financial data locally; trust depends on preventing silent
data loss or corruption.

### II. Deterministic Money Logic
Financial calculations MUST remain deterministic and traceable. Transaction type rules
for sign normalization, transfers between accounts, and week/day aggregations MUST be
implemented consistently and verified by tests. Business logic utilities SHOULD stay pure
where practical to reduce hidden side effects.

Rationale: Personal finance correctness is the core product value, and subtle math bugs
quickly destroy confidence.

### III. Test-Gated Changes (NON-NEGOTIABLE)
Any behavior-changing work MUST be test-gated. New behavior or bug fixes MUST include
tests that fail before implementation and pass after implementation. Merging work to
main requires passing targeted tests, lint, and type checks.

Rationale: Solo development still needs guardrails; test-gated delivery is the fastest
path to safe iteration.

### IV. Pre-Release Agility Over Backward Compatibility
Until 1.0.0 product release, backward compatibility is NOT required by default.
Breaking changes are allowed when they improve architecture, UX, or correctness,
but each breaking change MUST be documented in release notes and include user-facing
migration guidance when local data shape or behavior changes.

Rationale: The project is not released yet; optimizing for speed and correctness is more
valuable than preserving unstable interfaces.

### V. Open-Source Hygiene by Default
Code and docs MUST be kept publication-ready as if the repository could become public at
any time. Secrets MUST never be committed. Commits SHOULD remain focused and readable,
and README-level documentation MUST be updated when behavior changes materially.

Rationale: Open-source readiness reduces cleanup cost later and improves long-term
maintainability.

## Engineering Standards

- Primary stack remains React + TypeScript + Vite + Dexie + Vitest unless a change is
	justified in the related feature plan.
- New dependencies MUST be justified by clear value and low maintenance risk.
- UX changes affecting critical flows (transaction entry, editing, import, weekly totals)
	MUST include manual validation notes.
- PWA behavior changes MUST consider offline readiness, update prompts, and service worker
	impact.

## Workflow and Quality Gates

- Work starts from a documented feature spec and plan when scope is non-trivial.
- Each feature plan MUST include a Constitution Check section with pass/fail notes for all
	five Core Principles.
- Tasks MUST be grouped by user story and include explicit file paths.
- Before merge to main: tests pass, lint passes, type checks pass, and README/docs are
	updated if user-facing behavior changed.
- Every breaking change in pre-release MUST include a short migration note in the PR or
	release notes.

## Governance

This constitution overrides conflicting informal practices in this repository.

Amendment policy:
- Amendments are made by the project owner.
- Every amendment MUST include: (1) what changed, (2) why, and (3) impacted templates/docs.

Versioning policy for this constitution:
- MAJOR: Removes or fundamentally redefines a core principle or governance rule.
- MINOR: Adds a new principle/section or materially expands mandatory guidance.
- PATCH: Clarifies wording, fixes ambiguity, or makes non-semantic refinements.

Compliance review expectations:
- Plans and tasks MUST explicitly map to constitution gates.
- Reviews MUST block merges when non-negotiable principles are violated.
- Exceptions MUST be documented with rationale and a follow-up correction plan.

**Version**: 1.0.0 | **Ratified**: 2026-07-25 | **Last Amended**: 2026-07-25
