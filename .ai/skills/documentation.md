# Skill: Documentation

## Purpose
Keep architecture and domain documentation aligned with actual code and planned direction.

## When to use
- After changes to architecture, persistence, sync, auth, testing, or roadmap priorities.
- When introducing inconsistencies or standardization decisions.

## Rules
- Document what exists today separately from future direction.
- Prefer updating existing docs over creating duplicate guidance.
- Link decisions to ADRs.
- Record known inconsistencies and chosen standardization path.
- Keep terminology aligned with domain docs and repository contracts.
- Treat accepted ADRs as the authoritative source when architecture guidance conflicts.
- If a docs/skill conflict is found during a local agent flow, ask the user for a solution with a recommendation, then fix the conflict.

## Step-by-step workflow
1. Identify impacted docs and ADRs.
2. Update Current Implementation sections with concrete evidence.
3. Update Future Direction if the long-term target changed.
4. Add Open Questions when decisions are pending.
5. Cross-link architecture, domain, and testing docs.
6. Verify links and terminology consistency.

## Checklist
- [ ] Current vs future is clearly separated.
- [ ] ADR status is accurate.
- [ ] Roadmap and architecture docs do not conflict.
- [ ] Naming is consistent across docs and code.
- [ ] New feature docs include testing implications.
- [ ] Skill guidance does not contradict ADRs or architecture/product docs.

## Common mistakes
- Writing aspirational docs as if already implemented.
- Failing to update ADR status after implementation.
- Duplicating rules across many files without a source of truth.
- Omitting migration notes for schema or contract changes.

## Related documentation
- [Architecture Index](../../docs/architecture/architecture.md)
- [Coding Standards](../../docs/coding/coding-standards.md)
- [Roadmap](../../docs/product/roadmap.md)
- [Vision](../../docs/product/vision.md)
- [ADR Folder](../../docs/decisions)
