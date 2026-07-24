# Skill: Services

## Purpose
Place business logic in service modules so React components stay thin and repositories stay persistence-only.

## When to use
- Adding feature rules, orchestration, or domain workflows.
- Implementing Weekly Plans, Planned vs Actual, Safe to Spend, Insights.
- Encapsulating multi-repository operations.

## Rules
- Services own business decisions and workflows.
- Services can call repositories and pure calculation modules.
- Services should avoid direct UI concerns.
- Services should be deterministic when possible and side-effect aware when needed.
- Keep backend-specific calls behind repository or dedicated backend adapter services.
- Services return typed domain outcomes for expected failures such as validation issues, conflict review needed, or duplicate-explanation states.

## Step-by-step workflow
1. Write a service function signature based on domain language.
2. Inject needed repository interfaces, not concrete classes.
3. Compose pure calculation helpers and repository calls.
4. Return typed results suitable for UI rendering.
5. Add focused unit tests with mocked repositories.
6. Integrate service in component layer.

## Checklist
- [ ] Service function has explicit input/output types.
- [ ] Repository access is abstracted through interfaces.
- [ ] No React imports in service module.
- [ ] Domain errors are handled consistently.
- [ ] Unit tests verify core branches.
- [ ] Multi-step user actions are orchestrated here rather than in components.

## Common mistakes
- Keeping business logic in component effects.
- Writing services that directly mutate UI state.
- Coupling service code to one backend vendor.
- Mixing persistence details with domain math.

## Related documentation
- [System Architecture](../../docs/architecture/architecture.md)
- [State Management ADR](../../docs/decisions/ADR-007-state-management.md)
- [Backend Architecture](../../docs/architecture/backend.md)
- [Roadmap](../../docs/product/roadmap.md)
