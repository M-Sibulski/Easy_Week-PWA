# Frontend Architecture

## Technology Stack (Implemented)
- React 19 + TypeScript.
- Vite build system.
- Tailwind CSS utilities.
- Vitest + Testing Library for unit/component tests.

## UI Composition (Implemented)
- `App` / `AppShell`: root shell, theme application, initial sync indicator.
- `Mainscreen`: main orchestration, bottom-tab state, account context, and weekly-plan lock lifecycle.
- `Account`: header, account switch, menu, import, settings, account dialogs.
- `PlannerScreen`: standard-week template editing, current-week snapshot creation, and draft/locked plan states.
- `WeekScreen` + `Day`: weekly date range view, grouped transactions, compare cards, empty-state CTA, and variance list.
- `CreateTransaction` / `Transaction`: create and inline edit/delete transaction flows.
- `BottomNav`: tabs (`planner`, `myWeek`, `accounts`).

## Current Navigation Model
- Single-page tabbed UI; no route-based navigation currently.
- Implemented content:
  - `myWeek`: active weekly finance flow plus planned-vs-actual comparison.
  - `planner`: active weekly planning workflow.
  - `accounts`: placeholder.
- My Week can hand off directly to Planner when the selected account has no weekly snapshot for the visible week.

## Weekly Planning Flow
- Planner uses account-scoped template and snapshot live-query hooks.
- State progression:
  - No template → create reusable standard week line items.
  - Template exists, no snapshot → review totals and explicitly create this week plan.
  - Draft snapshot → edit notes and week-specific item changes.
  - Locked snapshot → read-only historical review.
- Week snapshots preserve their own `week_start` / `week_end` boundaries so later week-start setting changes do not rewrite history.

## State and Data Flow
- Reactive local data reads use Dexie `useLiveQuery` wrappers (`useAccounts`, `useTransactions`, `useSettingsArray`, planning hooks).
- UI components call repository methods for mutations.
- Mutations are optimistic from user perspective because local DB writes happen immediately.
- Weekly comparison metrics are derived in `src/weeklyPlanning/weeklyPlanningService.ts` from snapshot items, transactions, and savings-account metadata.

## Offline and PWA UX
- PWA registration through `vite-plugin-pwa` helpers.
- UI notifications for offline-ready and update-available states.
- Periodic service worker update polling when online.

## Auth UX Status
- Auth context/provider is active in app shell.
- Auth UI component (`AuthScreen`) exists, but main shell currently remains available when signed out.
- Sync attempts are only triggered for authenticated users.

## Future Direction
- Replace Accounts placeholder with dedicated account management screen (if distinct from current overlays).
- Add dedicated compare/review/insights screens.
- Expand planner history/reporting surfaces using existing snapshot list repository methods.

## Frontend Standards
- Navigation policy:
  - Keep bottom tabs as top-level domains.
  - Add route-driven sub-screens inside tabs for non-trivial workflows and diagnostics.
- Accessibility baseline:
  - Full keyboard operability for interactive controls.
  - Visible focus indicators.
  - Semantic labels by default; ARIA only when needed.
  - WCAG AA contrast for text and critical states.
  - Screen-reader announcements for sync states that require attention.
- Error and notification policy:
  - UI maps typed service results to user-facing messages.
  - Technical exceptions flow through centralized error mapping.
  - Local usage must never be blocked by sync or backend status.
