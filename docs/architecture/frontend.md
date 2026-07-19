# Frontend Architecture

## Technology Stack (Implemented)
- React 19 + TypeScript.
- Vite build system.
- Tailwind CSS utilities.
- Vitest + Testing Library for unit/component tests.

## UI Composition (Implemented)
- `App` / `AppShell`: root shell, theme application, initial sync indicator.
- `Mainscreen`: main orchestration and tab state.
- `Account`: header, account switch, menu, import, settings, account dialogs.
- `WeekScreen` + `Day`: weekly date range view with grouped transactions and running totals.
- `CreateTransaction` / `Transaction`: create and inline edit/delete transaction flows.
- `BottomNav`: tabs (`planner`, `myWeek`, `accounts`).

## Current Navigation Model
- Single-page tabbed UI; no route-based navigation currently.
- Implemented content:
  - `myWeek`: active weekly finance flow.
  - `planner`: placeholder.
  - `accounts`: placeholder.

## State and Data Flow
- Reactive local data reads use Dexie `useLiveQuery` wrappers (`useAccounts`, `useTransactions`, `useSettingsArray`).
- UI components call repository methods for mutations.
- Mutations are optimistic from user perspective because local DB writes happen immediately.

## Offline and PWA UX
- PWA registration through `vite-plugin-pwa` helpers.
- UI notifications for offline-ready and update-available states.
- Periodic service worker update polling when online.

## Auth UX Status
- Auth context/provider is active in app shell.
- Auth UI component (`AuthScreen`) exists, but main shell currently remains available when signed out.
- Sync attempts are only triggered for authenticated users.

## Future Direction
- Replace Planner placeholder with full weekly planning interfaces.
- Replace Accounts placeholder with dedicated account management screen (if distinct from current overlays).
- Add dedicated compare/review/insights screens.

## TODO (Architecture Review)
- Define whether future features continue in tab model or move to route-driven navigation.
- Define accessibility baselines (keyboard flow exists in some forms, but no documented global standard yet).
- Define error handling and user notification standards beyond console logging and inline toasts.
