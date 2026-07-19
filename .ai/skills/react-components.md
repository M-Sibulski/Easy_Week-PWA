# Skill: React Components

## Purpose
Build React components that are thin, predictable, and aligned with local-first and service-oriented architecture.

## When to use
- Creating or editing .tsx components.
- Building new weekly planning and dashboard screens.
- Refactoring component logic into services.

## Rules
- Keep components focused on rendering and interaction state.
- Move business rules to services.
- Never access storage directly from React. Use services and repository abstractions.
- Keep transient UI state local with hooks.
- Keep cross-cutting state in context only when needed (auth is current example).
- Follow naming style used in project: PascalCase for component files and functions.

## Step-by-step workflow
1. Define component props and state shape.
2. Identify logic that is domain/business logic and extract to service functions.
3. Use event handlers to call service APIs.
4. Keep formatting/conversion helpers in dedicated utility modules.
5. Add accessibility roles and stable selectors when tests need them.
6. Add component tests for key user interactions.

## Checklist
- [ ] Component does not import db.ts or backend client.
- [ ] Business transformations are outside component body.
- [ ] Props and state types are explicit.
- [ ] User flows remain usable offline.
- [ ] Tests cover interaction behavior.

## Common mistakes
- Large component functions that combine persistence, math, and UI transitions.
- Running async data mutations directly in render paths.
- Inconsistent naming or prop typing.
- Missing cancellation guards for async effects.

## Related documentation
- [UI Architecture ADR](../../docs/decisions/ADR-008-ui-architecture.md)
- [State Management ADR](../../docs/decisions/ADR-007-state-management.md)
- [Frontend Architecture](../../docs/architecture/frontend.md)
- [Main Screen](../../src/Mainscreen.tsx)
- [Week Screen](../../src/WeekScreen.tsx)
