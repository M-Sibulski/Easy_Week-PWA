# Skill: Implement Feature

## Purpose
Deliver a new feature in Easy Week without breaking local-first behavior, repository boundaries, or finance correctness.

## When to use
- Adding any user-facing feature in src.
- Implementing roadmap items like Weekly Plans, Weekly Dashboard, Safe to Spend, Planned vs Actual, End-of-week Review, Insights.
- Extending cloud sync or auth behavior.

## Rules
- Keep local-first as default. Local behavior must work when backend is unavailable.
- Treat Weekly Planning as the primary product direction.
- Use repository abstractions for persistence. Do not read or write Dexie or Supabase directly from React components.
- Place business logic in service modules, not UI components.
- Keep financial calculations pure and test them with unit tests.
- Preserve sync metadata fields: syncId, createdAt, updatedAt, deletedAt.
- Prefer extending existing contracts before introducing ad-hoc data access.

## Step-by-step workflow
1. Read domain and architecture docs relevant to the feature.
2. Confirm whether this is current behavior or future-direction scaffolding only.
3. Define data changes in types and repository contracts first.
4. Implement service-layer logic for business rules and calculations.
5. Implement repository changes or adapter extensions.
6. Connect React components to services and repository calls.
7. Add or update tests: pure logic unit tests first, then component/integration tests.
8. Validate no regression in weekly statement flow and account totals.
9. Update docs and ADRs if architecture assumptions changed.

## Checklist
- [ ] Feature works offline without cloud configuration.
- [ ] No direct storage access from React components.
- [ ] Repository contract reflects new persistence needs.
- [ ] Service layer contains business decisions.
- [ ] Finance math is pure and unit tested.
- [ ] Tests pass with existing Vitest setup.
- [ ] Domain docs and roadmap notes are updated.

## Common mistakes
- Mixing UI state and business rules in one component.
- Writing directly to db in component code.
- Adding backend-specific logic where contracts should be backend-neutral.
- Skipping tests for value-sign and transfer correctness.
- Implementing planned architecture decisions as if already complete.

## Related documentation
- [System Architecture](../../docs/architecture/architecture.md)
- [Repository Layer](../../docs/architecture/repositories.md)
- [Roadmap](../../docs/product/roadmap.md)
- [Local First ADR](../../docs/decisions/ADR-001-local-first.md)
- [Testing Strategy ADR](../../docs/decisions/ADR-009-testing-strategy.md)
