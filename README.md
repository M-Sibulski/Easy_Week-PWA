# Easy Week PWA

Easy Week is a React + TypeScript Progressive Web App (PWA) for tracking personal finances in a week-oriented workflow. Data is stored locally in the browser with IndexedDB (via Dexie), so the app can work offline and does not require a backend for core usage.

## What The App Does

- Manage multiple accounts (Everyday and Savings).
- Track transactions as Income, Expense, Bills, or Transfer.
- Navigate finances week-by-week and view running daily totals.
- Edit and delete transactions directly from the transaction list.
- Import transaction history from JSON or CSV into an account.
- Run as an installable PWA with offline caching and update prompts.

## Main Features

### Accounts

- Create and edit accounts.
- Mark an account as the main account.
- Optional savings metadata:
	- goal value
	- goal date
- Delete account support (includes cleanup of related transactions where account_id matches).

### Transactions

- Create transaction with:
	- name
	- type
	- value
	- date
	- category
- Transfer type supports source and destination accounts.
- Transaction amounts are internally normalized:
	- Income is positive
	- Expense and Bills are negative
	- Transfer out is stored as negative in source account
- Inline transaction editing and deletion.

### Weekly Statement View

- Automatic grouping by day in the currently selected week.
- Configurable week start day stored in settings.
- Back and forward week navigation.
- Running cumulative total shown per day card.

### Import

- Import from JSON or CSV from the account menu.
- CSV is converted to JSON in-browser before parsing.
- Import replaces all transactions for the selected account (with confirmation).

### PWA Behavior

- Service worker registration via `vite-plugin-pwa`.
- Offline readiness toast.
- Update-available toast with one-click refresh.
- Periodic service worker update checks while online.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS (via `@tailwindcss/vite`)
- Dexie + IndexedDB
- Workbox (through `vite-plugin-pwa`)
- Vitest + Testing Library
- ESLint

## Project Structure

Key files and folders:

- `src/App.tsx`: root layout and viewport handling.
- `src/Mainscreen.tsx`: app orchestration (accounts, settings, transactions).
- `src/WeekScreen.tsx`: weekly aggregation and navigation.
- `src/Account.tsx`: account switcher and account menu overlays.
- `src/CreateTransaction.tsx`: new transaction bottom sheet.
- `src/Transaction.tsx`: transaction row + inline edit form.
- `src/CreateAccount.tsx`: account creation overlay.
- `src/EditAccount.tsx`: account editing/deletion overlay.
- `src/JsonImport.ts`: import pipeline for CSV/JSON.
- `src/dateConversions.ts`: date formatting and week calculations.
- `src/PWABadge.tsx`: install/update/offline toast behavior.
- `src/registerPeriodicSync.ts`: periodic SW update check.
- `db.ts`: Dexie database schema and table registration.
- `types.ts`: domain types and enum-like constants.
- `vite.config.ts`: Vite, test, and PWA configuration.
- `netlify.toml`: SPA and PWA-safe redirect rules.

## Local Development

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Scripts

- `npm run dev`: start Vite dev server.
- `npm run build`: type-check and production build.
- `npm run build:dev`: development-mode build.
- `npm run build:prod`: production-mode build.
- `npm run preview`: preview built app.
- `npm run lint`: lint source files.
- `npm run test`: run tests with coverage and typecheck.
- `npm run test:dev`: run Vitest in interactive watch mode.

## Data Model

### Accounts

```ts
{
	id: number,
	name: string,
	type: "Everyday" | "Savings",
	goalValue?: number,
	goalDate?: Date,
	dateCreated: Date
}
```

### Transactions

```ts
{
	id: number,
	value: number,
	type: "Income" | "Expense" | "Transfer" | "Bills",
	name: string,
	account_id: number,
	date: Date,
	category?: string,
	to_account_id?: number
}
```

### Settings

```ts
{
	id: number,
	dark: boolean,
	main_account_id: number,
	week_starting_day: number
}
```

## Import Format

The import parser accepts either:

- JSON array of transaction-like objects, or
- CSV with a header row matching transaction keys.

Typical fields expected in imported records:

- `name`
- `type`
- `value`
- `date`
- `category`
- `to_account_id` (for transfers)

During import:

- `account_id` is overwritten with the currently selected account.
- `value` is converted to number.
- `date` is converted to `Date`.

## Testing

The project includes test coverage for core UI and utility modules, including:

- App bootstrap and rendering
- Main screen behavior
- Account creation/editing
- Transaction creation/editing
- Date conversion utilities
- Import utility
- PWA badge behavior

Run all tests with:

```bash
npm run test
```

Coverage HTML output is generated under `coverage/`.

## PWA Configuration Notes

Configured in `vite.config.ts` using `vite-plugin-pwa`:

- `registerType: autoUpdate`
- custom web manifest metadata
- Workbox cache cleanup enabled
- dev service worker enabled
- dev warning suppression enabled for temporary dev-dist glob scans

## Deployment

This project contains Netlify redirect rules in `netlify.toml` to ensure:

- service worker file is served directly (`/sw.js`)
- manifest is served directly (`/manifest.webmanifest`)
- all non-file routes fall back to `/index.html` for SPA routing

General deployment flow:

1. Build the app with `npm run build`.
2. Deploy the generated `dist/` directory.
3. Ensure host preserves service worker and manifest routes.

## Browser Storage And Privacy

- App data is stored locally in IndexedDB.
- No backend API is required for core functionality.
- Uninstalling site data or clearing browser storage removes local app data.

## Known Implementation Notes

- Initial launch seeds default accounts and settings if none exist.
- Transfer display includes validation warnings if referenced accounts are missing.
- Some legacy fields exist in Dexie schema comments/index definitions and can be refactored in a future migration.

## License

See `LICENSE`.
