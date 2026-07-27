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

Dark-Mode Enforcement (Tailwind v4):
- The project uses `@variant dark (.theme-dark &);` in `src/App.css`.
- Use `dark:` utilities for all new dark-mode styling. Do NOT add `.theme-dark` CSS blocks.
- Approved dark-mode blue mappings: `bg-blue-500 dark:bg-blue-800`, `bg-blue-400 dark:bg-blue-700`, `bg-blue-300 dark:bg-blue-600`.
- For neutral surfaces (`bg-gray-*`) in dark mode, use semantic CSS variable utilities via `bg-[var(--ew-surface-N)]`.

SVG Icon Fill:
- **Always** use `fill="currentColor"` on all SVG elements — hardcoded fills are forbidden.
- Set icon colour via `text-*` utility on the SVG or containing element (e.g. `text-gray-50 dark:text-white`).
- **Never** use `fill="#000000ff"` (invisible in dark mode, D-003 defect).
- **Never** use `fill="#c10007"` or other hardcoded fills (D-004/D-005 defects, now fixed).

Hover State Rules:
- **Deprecated**: `hover:bg-green-300` — replaced by `hover:bg-blue-400` (D-007 defect fix).
- Approved hover utilities: `hover:bg-blue-200/400/500/600`, `hover:bg-gray-200`, `hover:bg-red-600`, `hover:bg-slate-100`.

Bottom Sheet Animation:
- Always use `translate-y-full` (100%) for the closed state. Never use `translate-y-100` (100px).
- Use the shared `BottomSheet` primitive from `src/lib/ui/` for all bottom-sheet containers.

Shared Primitives (src/lib/ui/):
- BottomSheet: sliding sheet container with correct animation.
- SheetHeader: centered title with optional left/right icon slot.
- IconButton: standardised icon action button (`btn-icon-blue` pattern).
- SubmitButton: form submit button with checkmark icon.
- FormField: input/select with `field-blue-surface` styling + visible focus ring.
- StatusMessage: four-variant (success/error/warning/info) feedback component.
- Always prefer these primitives over repeating raw utility stacks.

Focus Ring Requirement:
- All keyboard-focusable form inputs MUST include `focus:ring-2 ring-blue-200`.
- This is a mandatory accessibility rule (FR-007).
- Auth inputs already comply; sheet form inputs must use `FormField` to inherit compliance.

Sync Requirement:
- After any token/variant addition to `approved-design-rules.json`, update `docs/design/design-system.md` and this SKILL.md accordingly.

Implementation notes:
- Prefer named tokens in the reference file where possible.
- If a utility class is the approved option, keep the exact utility class string.
- Keep this Skill reusable and deterministic.