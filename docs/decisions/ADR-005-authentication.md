# ADR-005 Authentication

## Status
Implemented

## Context
Cloud sync requires user identity, but local usage must remain available without sign-in.

## Decision
Use optional Supabase auth context and flows without gating the local app shell.

## Consequences
- Users can operate the app locally while signed out.
- Signed-in users can use cloud sync.
- Auth UX policy for future feature gating is still open.

## Current Implementation
- Auth context defaults and capability surface are in [src/auth/AuthContext.ts](../../src/auth/AuthContext.ts).
- Session restore and auth actions are in [src/auth/AuthProvider.tsx](../../src/auth/AuthProvider.tsx).
- Auth screen implementation is in [src/auth/AuthScreen.tsx](../../src/auth/AuthScreen.tsx).
- Signed-out app shell behavior is validated in [src/App.test.tsx](../../src/App.test.tsx).

## Future Direction
- Strengthen auth and session requirements as backend maturity increases, as noted in [docs/architecture/backend.md](../architecture/backend.md).

## Standards Added After Initial Adoption
- Authentication must not gate core local-first weekly flows by default.
- Sync and cloud-backed capability may require authentication, but failure to authenticate must not block local use.
- Auth-related failure and recovery messaging should align with the shared non-blocking status and error-handling model.
