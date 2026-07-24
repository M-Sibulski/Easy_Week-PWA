# Skill: Refactoring

## Purpose
Refactor safely while preserving behavior, especially in finance logic, repository contracts, and local-first workflows.

## When to use
- Cleaning up large components.
- Moving business logic to services.
- Standardizing inconsistent patterns across modules.

## Rules
- Keep behavior unchanged unless change is explicitly requested.
- Refactor in small, test-backed steps.
- Preserve repository contract compatibility during migrations.
- Avoid broad formatting-only changes mixed with architecture refactors.
- Document inconsistencies and standard target.

## Step-by-step workflow
1. Capture baseline behavior with tests.
2. Identify one boundary to improve: component, service, repository, or calculation module.
3. Extract pure functions first.
4. Extract service orchestration next.
5. Replace direct data access with repository/service dependencies.
6. Run and adjust tests after each step.
7. Update docs with standardization outcome.

## Checklist
- [ ] Existing behavior remains intact.
- [ ] New boundaries are clear and typed.
- [ ] Components are thinner after refactor.
- [ ] No direct storage access remains in React for touched areas.
- [ ] Tests cover extracted logic.

## Common mistakes
- Big-bang rewrites without incremental verification.
- Refactoring and feature changes in one commit.
- Leaving duplicate old and new logic paths.
- Forgetting to update docs and ADR notes.

## Related documentation
- [Coding Standards](../../docs/coding/coding-standards.md)
- [State Management ADR](../../docs/decisions/ADR-007-state-management.md)
- [Repository Pattern ADR](../../docs/decisions/ADR-002-repository-pattern.md)
- [Main Screen](../../src/Mainscreen.tsx)
- [Create Transaction](../../src/CreateTransaction.tsx)
