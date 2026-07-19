# Coding Standards (Draft)

## Language and Tooling (Implemented)
- TypeScript + React functional components.
- ESLint with:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended
  - `react-hooks` rules
  - `react-refresh` plugin

## Patterns Observed in Codebase
- Local-first data access through repository abstraction.
- Domain types centralized in `types.ts`.
- Async side effects in hooks with cancellation guards in some components.
- Dexie schema migrations versioned in one DB module.
- Soft-delete convention via `deletedAt` timestamps.

## Preferred Implementation Conventions (From Existing Code)
- Keep persistence access behind repository methods.
- Keep sync metadata (`syncId`, timestamps) attached to domain rows.
- Use explicit transaction/account type unions rather than free-form strings.
- Keep tests close to modules (`*.test.ts` / `*.test.tsx`).

## Future Direction
- Expand domain-service layer for weekly plan and comparison logic to reduce UI-level business logic.
- Strengthen typed error handling around repository and sync operations.

## TODO (Architecture Review)
- Define formatter standards (no explicit Prettier policy found).
- Define naming conventions for file/module boundaries (component vs domain service split).
- Define policy for console logging in production paths.
