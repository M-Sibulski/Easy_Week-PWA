# Skill: Repository Pattern

## Purpose
Apply and enforce repository abstraction so storage and backend choices stay swappable.

## When to use
- Designing persistence APIs.
- Adding another backend implementation such as SupabaseRepository or PocketBaseRepository.
- Refactoring storage access out of UI.

## Rules
- React must depend on services or repository contracts, never direct storage APIs.
- IRepository is the contract boundary for data operations.
- Repositories persist and retrieve data only. No feature-level business decisions.
- Keep backend-specific mapping isolated in adapter/service modules.
- Plan for multiple implementations: LocalRepository, SupabaseRepository, PocketBaseRepository.

## Step-by-step workflow
1. Model required operations in IRepository.
2. Implement in LocalRepository style (current DexieRepository).
3. Add decorator/composition behavior for sync or telemetry.
4. Implement backend adapters behind the same contract.
5. Add contract-focused tests per implementation.
6. Wire active implementation in repository composition entrypoint.

## Checklist
- [ ] Contract methods are backend-neutral.
- [ ] No UI file imports db or supabase client directly.
- [ ] Local implementation remains full-featured offline.
- [ ] Adapter differences are hidden from callers.
- [ ] Tests validate equal behavior across implementations.

## Common mistakes
- Letting React import db from db.ts (currently present in useAppData and should be standardized away over time).
- Coupling contract to one backend schema.
- Storing UI-specific computed values in repository rows.
- Putting retry/sync orchestration inside each repository method.

## Related documentation
- [Repository Layer](../../docs/architecture/repositories.md)
- [Repository Pattern ADR](../../docs/decisions/ADR-002-repository-pattern.md)
- [Backend Abstraction ADR](../../docs/decisions/ADR-003-backend-abstraction.md)
- [Sync Strategy ADR](../../docs/decisions/ADR-004-sync-strategy.md)
- [Current Contract](../../src/repository/IRepository.ts)
