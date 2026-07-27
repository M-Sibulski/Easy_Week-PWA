# Contract: Design System Governance

## Purpose
Define enforceable rules for introducing, pruning, and consuming approved design tokens and reusable UI variants in Easy Week PWA.

## Producers and Consumers
- Producer: UI feature implementation work that changes styles/components
- Consumers:
  - App UI components in `src/`
  - Human-readable design reference in `docs/design/design-system.md`
  - Skill workflow in `.github/skills/design-system-guard/SKILL.md`

## Inputs
- Source of truth token file: `.github/design-system/approved-design-rules.json`
- Existing UI component/style files under `src/`

## Required Outputs
- Updated approved token/variant rules where needed
- Updated impacted UI files using only approved rules
- Updated human-readable design reference
- Validation summary showing consistency/accessibility/responsive/regression checks

## Invariants
1. No ad-hoc visual values are introduced when an approved token exists.
2. Missing-rule requests must follow explicit user decision flow before code edits.
3. Theme behavior must remain readable and coherent in both light and dark modes.
4. Repeated class stacks must be represented by reusable variant/component patterns.
5. Scoped bug fixes tied to consistency must be resolved in the same feature delivery.

## Change Protocol
1. Inspect request and current rule set.
2. Validate requested values against approved rules.
3. If missing rule:
   - Stop edits.
   - Present recommended token and alternatives.
   - Apply only after user selection.
4. Update rule set first when adding/changing approved rules.
5. Update UI implementation second.
6. Update design documentation and skill guidance third.
7. Run validations and publish summary.

## Verification Contract
A change set is considered compliant only if all are true:
- Approved rule set updated (or unchanged with rationale)
- UI implementation updated with approved values
- Design docs synchronized
- Skill guidance synchronized
- Test and manual QA checks pass for the impacted scope
