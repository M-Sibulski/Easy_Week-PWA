# Data Model - UI Identity Unification

## Overview
This feature does not change business/domain persistence data. The "data model" here defines governance entities that drive consistent UI composition and validation.

## Entities

### 1. DesignRuleSet
- Purpose: Canonical approved style/token source used by implementation and guard skill.
- Source: `.github/design-system/approved-design-rules.json`
- Fields:
  - `meta.project` (string, required)
  - `meta.version` (integer, required)
  - `meta.lastAuditedOn` (date string, required)
  - `tokens` (object, required)
  - `componentVariants` (object, required)
  - `interactionStates` (object, required)
  - `validationChecklist` (object, required)
- Validation rules:
  - Must include explicit approved utility/token lists for color, spacing, radius, typography, and interactions.
  - Must not contain contradictory variants for the same canonical token.

### 2. UiPatternVariant
- Purpose: Reusable pattern contract consumed by app components.
- Fields:
  - `token` (string, required, unique within category)
  - `classes` (string array, required, non-empty)
  - `usedIn` (string array, optional)
  - `category` (enum: `bottomSheetForm`, `button`, `inputAndSelect`, `cards`, `statusMessage`)
- Validation rules:
  - Class lists use approved utilities or approved semantic classes only.
  - Interaction states for hover/focus/disabled must be explicit when applicable.

### 3. ThemeSurfaceRole
- Purpose: Semantic mapping for neutral surfaces across light/dark mode.
- Fields:
  - `name` (enum: `appBg`, `surface1`, `surface2`, `surface3`, `textPrimary`)
  - `lightValue` (color, required)
  - `darkValue` (color, required)
  - `usageContexts` (string array, required)
- Validation rules:
  - Every role must define values for both themes.
  - Contrast/readability must remain acceptable in all documented usage contexts.

### 4. StatusMessageVariant
- Purpose: Standardized user feedback semantics.
- Fields:
  - `type` (enum: `success`, `error`, `warning`, `info`)
  - `containerStyle` (token/class reference, required)
  - `textStyle` (token/class reference, required)
  - `iconOptional` (boolean, optional)
  - `ariaRole` (enum: `status`, `alert`, required)
- Validation rules:
  - Must be visually distinguishable from other variants.
  - Must retain readability in light and dark themes.

### 5. DesignGuardSkillGuidance
- Purpose: Enforce design governance in AI-assisted coding workflows.
- Source: `.github/skills/design-system-guard/SKILL.md`
- Fields:
  - `triggerScope` (string, required)
  - `sourceOfTruth` (path list, required)
  - `missingRuleProtocol` (structured prompt template, required)
  - `completionReportFields` (string array, required)
  - `documentationSyncRequirement` (boolean, required)
- Validation rules:
  - Guidance must require checking approved rules before code edits.
  - Guidance must define hard-stop flow for missing design tokens.
  - Guidance must include requirement to sync design doc and approved rule set when new rules are added.

## Relationships
- `DesignRuleSet` 1 -> many `UiPatternVariant`
- `ThemeSurfaceRole` supports many `UiPatternVariant`
- `StatusMessageVariant` is a specialized `UiPatternVariant`
- `DesignGuardSkillGuidance` enforces usage of `DesignRuleSet` and `UiPatternVariant`

## State Transitions

### DesignRuleSet lifecycle
1. `Current` -> 2. `Proposed Change` -> 3. `User Approved` -> 4. `Applied` -> 5. `Audited`

Transition guards:
- `Proposed Change` requires identified gap and recommendation.
- `Applied` requires updates to both rules and impacted UI implementation.
- `Audited` requires validation checklist pass and documentation sync.

### Skill guidance lifecycle
1. `Existing Guidance` -> 2. `Extended Guidance Draft` -> 3. `Merged Guidance` -> 4. `Validated by usage`

Transition guards:
- Extension must keep deterministic decision flow.
- Final guidance must include new design documentation sync rule.
