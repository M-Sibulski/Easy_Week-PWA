# Quickstart Validation - UI Identity Unification

## Goal
Validate that UI identity unification is complete, consistent, and regression-safe across light/dark mode, shared patterns, and auth alignment.

## Prerequisites
- Node.js and npm available
- Dependencies installed (`npm i`)
- Feature branch checked out: `002-unify-ui-identity`

## Setup
1. Install dependencies (if needed):
```bash
npm i
```
2. Start the app:
```bash
npm run dev
```
3. Keep a second terminal for tests.

## Automated Validation
1. Run lint:
```bash
npm run lint
```
Expected outcome: no lint errors in touched files.

2. Run test suite:
```bash
npm test
```
Expected outcome: all existing and updated tests pass.

3. Run production build:
```bash
npm run build
```
Expected outcome: successful build with no type errors.

## Manual Validation Scenarios

### Scenario A: Shared pattern consistency (P1)
1. Open the four bottom-sheet flows:
- Create account
- Create transaction
- Edit account
- Settings
2. Validate matching structure and behavior for headers, icon actions, submit actions, form fields, and status messages.
Expected outcome: equivalent controls look and behave consistently.

### Scenario B: Dark mode readability (P2)
1. Toggle between light and dark themes using the existing app mechanism.
2. Navigate App -> Main screen -> Week screen -> Day -> Transaction -> Bottom nav -> Account.
3. Check text contrast, neutral surfaces, and icon visibility.
Expected outcome: no unreadable text/icons and no black/red SVG artifacts on conflicting backgrounds.

### Scenario C: Auth alignment (P1/P3)
1. Open auth screen(s).
2. Compare palette, spacing, and component behavior against main app patterns.
3. Test focus visibility by keyboard tab navigation.
Expected outcome: auth views feel part of same identity and show visible focus states.

### Scenario D: Known defect regression checks
1. Verify bottom-sheet close/open translation behavior.
2. Verify delete icon hover state remains visible.
3. Verify PWA badge hover color follows approved palette.
4. Confirm removal of dead/unused breakpoint utility has no layout side effects.
Expected outcome: all listed visual defects are resolved.

## Governance Validation
1. Confirm `.github/design-system/approved-design-rules.json` reflects final token/variant set.
2. Confirm `docs/design/design-system.md` reflects final guidance and component variant table.
3. Confirm `.github/skills/design-system-guard/SKILL.md` includes new guidance requirements from contracts.
Expected outcome: rules, docs, and skill guidance are synchronized.

## References
- Feature spec: `spec.md`
- Research decisions: `research.md`
- Data model: `data-model.md`
- Governance contracts:
  - `contracts/design-system-governance.md`
  - `contracts/design-system-guard-skill-contract.md`
