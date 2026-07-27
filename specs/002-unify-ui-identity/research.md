# Phase 0 Research - UI Identity Unification

## Decision 1: Keep blue-monochrome identity and remove conflicting accent patterns
- Decision: Preserve blue as the primary visual identity and remove outlier interaction colors from shared controls where they do not express semantic state.
- Rationale: A single identity reduces cognitive load and improves trust in a finance workflow.
- Alternatives considered:
  - Introduce a new multi-accent palette now. Rejected because it expands scope and governance complexity.
  - Keep mixed blue/slate/green hover styles. Rejected because it perpetuates inconsistency.

## Decision 2: Use shared UI primitives for repeated patterns
- Decision: Implement reusable primitives for bottom sheet container, sheet header layout, icon actions, submit actions, form fields, and status messages.
- Rationale: Current copy-pasted utility stacks increase drift and bug risk; shared primitives centralize behavior and improve consistency.
- Alternatives considered:
  - Keep utility-only duplication and rely on reviews. Rejected due to high drift risk.
  - Move all style logic into large CSS classes only. Rejected because it weakens composability and clarity in React components.

## Decision 3: Migrate dark mode to Tailwind v4 variant mapped to existing theme trigger
- Decision: Add `@variant dark (.theme-dark &);` and migrate legacy `.theme-dark` overrides to `dark:` utilities.
- Rationale: Maintains existing theme toggle behavior while moving to maintainable utility-based dark styling.
- Alternatives considered:
  - Continue with global CSS override blocks. Rejected due to brittle selector coupling.
  - Replace theme trigger architecture entirely. Rejected as unnecessary scope expansion.

## Decision 4: Introduce semantic surface variables for neutral backgrounds
- Decision: Define semantic neutral/surface variables for theme-specific gray layers and consume them consistently.
- Rationale: Semantic variables communicate intent and reduce future override complexity.
- Alternatives considered:
  - Keep hard-coded RGB overrides. Rejected because values are harder to reason about and audit.

## Decision 5: Align authentication screens to core identity
- Decision: Rework auth views so they visually belong to the same design language as the main app.
- Rationale: Auth currently appears as a separate product due to distinct slate/white treatment.
- Alternatives considered:
  - Keep auth styling separate. Rejected because it breaks identity continuity.
  - Partial alignment only (buttons only). Rejected due to limited impact.

## Decision 6: Standardize status feedback into explicit variants
- Decision: Use one shared status-message variant model: success, error, warning, info.
- Rationale: Unified semantics improve readability, accessibility, and predictability.
- Alternatives considered:
  - Keep per-screen ad-hoc feedback styles. Rejected due to inconsistency and QA overhead.

## Decision 7: Document governance in both human docs and enforcement skill
- Decision: Update human-readable design guidance and codify enforcement steps in `.github/skills/design-system-guard/SKILL.md`.
- Rationale: JSON token lists alone are not enough; future work needs procedural guardrails at prompt/workflow level.
- Alternatives considered:
  - Document in design doc only. Rejected because enforcement would remain manual.
  - Put guidance in skill only. Rejected because stakeholders also need human-readable reference.

## Decision 8: Resolve known visual bugs in-scope
- Decision: Include the identified visual defects (sheet translation class, invisible hover, inconsistent hover color, dead breakpoint utility, SVG readability issues) in this feature.
- Rationale: They are direct blockers to consistency and should be fixed during consolidation.
- Alternatives considered:
  - Defer bugs to separate issue. Rejected because defects are tightly coupled with styling unification work.

## Best-Practice Notes Applied
- Prefer semantic design tokens and reusable variants over one-off class stacks.
- Preserve behavior while refactoring presentation layers; avoid coupling style work to business logic changes.
- Ensure keyboard focus visibility in all form interactions.
- Validate theme readability for text and iconography in both light and dark modes.
- Keep governance artifact updates atomic with code changes to prevent drift.
