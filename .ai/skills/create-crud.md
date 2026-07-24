# Skill: Create CRUD

## Purpose
Implement consistent CRUD behavior for Accounts, Transactions, Category Suggestions, Settings, and future Weekly Planning entities.

## When to use
- Adding CRUD for a new entity.
- Extending existing repository methods.
- Building forms and edit flows in React.

## Rules
- Define entity shape in types.ts first.
- Add CRUD operations to IRepository before touching UI.
- Keep repository methods responsible for persistence only.
- Use soft-delete where sync tombstones are needed.
- Stamp sync and timestamp fields in repository logic.
- Keep transfer and sign normalization logic outside persistence internals.
- Put user-facing multi-entity workflows behind services, not direct component-to-repository orchestration.

## Step-by-step workflow
1. Add or extend domain types.
2. Add IRepository methods grouped by entity.
3. Implement methods in DexieRepository.
4. Update SyncingRepository behavior for mutating methods.
5. Add tests in repository test files.
6. Add service functions for business rules if needed.
7. Connect component event handlers to service or repository calls.
8. Verify behavior in component tests.

## Checklist
- [ ] Types are explicit and use existing union patterns.
- [ ] IRepository and implementations stay in sync.
- [ ] Soft-delete semantics are preserved where required.
- [ ] Mutations schedule sync via decorator layer.
- [ ] UI does not bypass repository layer.
- [ ] CRUD tests cover success and edge cases.
- [ ] Reset/clear behavior is reconciled with sync policy before exposing it to users.

## Common mistakes
- Adding a method to one repository implementation but not all.
- Hard-deleting records that should remain as tombstones.
- Returning deleted rows from user-facing reads.
- Injecting business transformations into low-level persistence methods.

## Related documentation
- [Repository Layer](../../docs/architecture/repositories.md)
- [Repository Pattern ADR](../../docs/decisions/ADR-002-repository-pattern.md)
- [Offline Storage ADR](../../docs/decisions/ADR-006-offline-storage.md)
- [Accounts Domain](../../docs/domain/accounts.md)
- [Transactions Domain](../../docs/domain/transactions.md)
