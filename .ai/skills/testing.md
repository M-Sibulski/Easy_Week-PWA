# Skill: Testing

## Purpose
Apply this repository's Vitest and Testing Library style to maintain confidence in local-first finance behavior.

## When to use
- Any code change.
- Especially repository, sync, calculation, and transaction workflow updates.

## Rules
- Use Vitest with clear describe and it blocks.
- Keep tests close to modules using *.test.ts or *.test.tsx naming.
- Mock boundaries, not implementation details where possible.
- Use fake-indexeddb compatible patterns for IndexedDB behavior.
- Add unit tests for finance and pure calculations by default.
- Preserve regression coverage for local-first and sync behavior.
- Any sync/conflict logic change requires at least one convergence-oriented test scenario.
- Keep timezone-sensitive fixtures deterministic.

## Step-by-step workflow
1. Identify risk areas and affected modules.
2. Add or update unit tests first for logic modules.
3. Add component tests for user-visible behavior changes.
4. Mock repository, db, or backend clients as needed.
5. Run test suite and inspect failures by behavior.
6. Update snapshots or assertions only when behavior change is intentional.

## Checklist
- [ ] Finance logic has direct unit coverage.
- [ ] Repository mutations and tombstones are tested.
- [ ] Sync merge behavior is tested for LWW ties and ordering.
- [ ] Component interaction tests cover main user flow changes.
- [ ] Existing tests remain green.
- [ ] Coverage does not reduce below the project floor.

## Common mistakes
- Testing implementation internals instead of outcomes.
- Missing tests for transfers or deleted rows.
- Not testing both signed-in and local-only paths.
- Over-mocking to the point behavior is no longer meaningful.

## Related documentation
- [Testing Strategy](../../docs/coding/testing.md)
- [Testing Strategy ADR](../../docs/decisions/ADR-009-testing-strategy.md)
- [Vitest Config](../../vite.config.ts)
- [Repository Tests](../../src/repository/DexieRepository.test.ts)
- [Sync Tests](../../src/sync/syncService.test.ts)
