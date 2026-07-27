# Contract: design-system-guard Skill Guidance Update

## Purpose
Ensure new UI identity guidance is enforced at prompt/workflow level by updating the existing skill `.github/skills/design-system-guard/SKILL.md`.

## Scope
Applies to any UI styling, component variant, dark-mode behavior, token governance, and design-document synchronization task.

## Required Guidance Additions
1. Token pruning/addition synchronization
- Skill must require that when approved rules are pruned or added, both:
  - `.github/design-system/approved-design-rules.json`
  - `docs/design/design-system.md`
  are updated in the same change set.

2. Reusable primitive preference
- Skill must direct agents to prefer shared primitives/variants for repeated patterns instead of copy-pasted utility stacks.

3. Dark mode policy
- Skill must require `dark:` utility usage mapped to existing theme trigger and prohibit adding new legacy global override blocks unless explicitly approved.

4. SVG readability policy
- Skill must require icon/fill readability checks in both themes and disallow fixed fills that become unreadable on primary surfaces.

5. Accessibility policy
- Skill must require visible focus indicators for keyboard-focusable controls and verification of status message semantics.

6. Final report extension
- Skill final report must include:
  - whether skill guidance files were updated
  - whether design docs were synchronized
  - whether dark-mode/SVG/focus checks passed

## Compliance Checks
A UI change request is compliant only if:
- Skill guidance references current approved design rules and design docs.
- Missing-rule handling remains hard-stop before code edits.
- Report includes the extended validation fields above.

## Non-Goals
- No changes to business logic, sync logic, or domain data schema.
- No requirement to migrate unrelated legacy components outside feature scope.
