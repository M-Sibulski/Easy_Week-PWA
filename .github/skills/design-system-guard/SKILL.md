---
name: design-system-guard
description: Enforce Easy Week's approved design system by validating requested design choices against a structured rule reference before any code generation or edits.
---

Use this Skill for any request that creates or edits UI styles, components, or layout behavior.

Primary reference file:
- .github/design-system/approved-design-rules.json

You must enforce the workflow below in order.

1. Inspect Before Editing
- Read relevant UI files and the design reference file before proposing or writing code.
- Identify all relevant values and patterns for:
  - border radius
  - spacing
  - colours
  - typography
  - shadows
  - breakpoints
  - component variants
  - interaction states

2. Source Of Truth
- Treat approved options in .github/design-system/approved-design-rules.json as the source of truth.
- Never invent, approximate, or silently substitute design values.

3. Preflight Validation
- Before generating code, validate each requested design choice against approved options.
- If all requested choices exist, use the exact approved value/token consistently.

4. Missing Rule Handling (Hard Stop)
- If any requested option does not exist, stop before applying code changes.
- Explain what is missing and ask the user to decide using this exact format:

"[Design property] does not currently have an approved option for [requested use].

Recommended rule: [specific token, value and reason].

Should I:
A. Add the recommended rule
B. Use the closest existing rule: [rule]
C. Add a different rule that you specify?"

- Always include one recommended answer grounded in:
  - closest existing pattern
  - accessibility
  - consistency
  - maintainability

5. After User Selection
- If the user selects A or C, update .github/design-system/approved-design-rules.json first.
- Then apply the code change using the selected approved rule.
- Treat the new rule as approved for future tasks.

6. Scope Protection
- Do not modify unrelated code.
- Do not alter existing approved rules unless explicitly approved.

7. Completion Validation
- Validate for:
  - consistency with approved rules
  - accessibility impact
  - responsive behavior
  - regressions introduced by the change

8. Required Final Report
- Report:
  - files reviewed
  - issues found
  - design rules used
  - new rules added
  - code changed
  - validation results

Implementation notes:
- Prefer named tokens in the reference file where possible.
- If a utility class is the approved option, keep the exact utility class string.
- Keep this Skill reusable and deterministic.