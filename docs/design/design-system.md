# Easy Week PWA — Design System

**Version**: 3.0 | **Updated**: 2026-07-27 | **Feature**: 002-unify-ui-identity

> Source of truth for approved visual tokens, interaction patterns, and component variants.
> Implementation rule file: [.github/design-system/approved-design-rules.json](../../.github/design-system/approved-design-rules.json)

---

## Identity

Easy Week uses a **blue-monochrome** identity. One blue palette anchors all primary surfaces, actions, and forms. Neutral gray tones provide contrast and background hierarchy. No ad-hoc accent colours are introduced outside this palette.

---

## Theme Architecture

### Dark Mode

Dark mode is controlled by the `.theme-dark` class on the app root element.

**Tailwind v4 variant declaration** (in `src/App.css`):
```css
@variant dark (.theme-dark &);
```

This means `dark:` utilities respond to `.theme-dark` on any ancestor, not the OS preference. Use `dark:` utilities for all dark-mode styling. **Do not** add new `.theme-dark { ... }` CSS override blocks.

### Blue surface dark mappings

| Light class | Dark utility |
|---|---|
| `bg-blue-500` | `dark:bg-blue-800` |
| `bg-blue-400` | `dark:bg-blue-700` |
| `bg-blue-300` | `dark:bg-blue-600` |
| `hover:bg-blue-600` | `dark:hover:bg-blue-900` |
| `hover:bg-blue-500` | `dark:hover:bg-blue-800` |
| `hover:bg-blue-400` | `dark:hover:bg-blue-700` |
| `hover:bg-blue-200` | `dark:hover:bg-blue-500` |

### Neutral surface dark mappings

| Light class | Dark value |
|---|---|
| `bg-gray-50` | `dark:bg-[rgb(30,41,75)]` |
| `bg-gray-100` | `dark:bg-[rgb(38,53,94)]` |
| `bg-gray-200` | `dark:bg-[rgb(45,62,109)]` |
| `bg-gray-300` | `dark:bg-[rgb(20,31,55)]` |

Semantic CSS variables for neutral surfaces are defined in `App.css`:
- `--ew-surface-50`, `--ew-surface-100`, `--ew-surface-200`, `--ew-surface-300`

---

## Shared UI Primitives

All reusable interaction patterns are available from `src/lib/ui/`.

```ts
import { BottomSheet, SheetHeader, IconButton, SubmitButton, FormField, StatusMessage } from './lib/ui';
```

### BottomSheet

Sliding sheet container for forms and action overlays.

```tsx
<BottomSheet open={open} ref={sheetRef}>
  {/* children */}
</BottomSheet>
```

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls visibility and slide-in/out state |
| `ref` | `RefObject<HTMLDivElement>` | Forward ref for click-outside detection |
| `data-testid` | `string` | Test targeting |

> **Defect D-001 fix**: Uses `translate-y-full` (100%) for the off-canvas state — **never** `translate-y-100` (100px).

---

### SheetHeader

Centred title row with optional left/right icon slots.

```tsx
<SheetHeader
  title="New Account"
  leftSlot={<IconButton onClick={handleClear} aria-label="Clear">...</IconButton>}
  rightSlot={<IconButton onClick={handleClose} role="close" aria-label="Close">...</IconButton>}
/>
```

---

### IconButton

Standard icon action button. Applies the `btn-icon-blue` pattern.

```tsx
<IconButton onClick={handler} aria-label="Close sheet">
  <svg>...</svg>
</IconButton>
```

| Prop | Type | Description |
|---|---|---|
| `onClick` | `MouseEventHandler` | Click handler |
| `aria-label` | `string` | Accessible label (required when icon-only) |
| `variant` | `'primary' \| 'danger'` | Visual variant (both use blue hover currently) |
| `role` | `string` | Semantic role override (e.g. `"close"`) |

---

### SubmitButton

Form submit button with checkmark icon.

```tsx
<SubmitButton data-testid="submit" />
```

Renders `type="submit"` by default. Accepts all standard button attributes.

---

### FormField

Input or select with standardised `field-blue-surface` styling and a **mandatory visible focus ring**.

```tsx
{/* Input */}
<FormField
  type="text"
  placeholder="Name"
  value={name}
  onChange={e => setName(e.target.value)}
  data-testid="name-input"
/>

{/* Select */}
<FormField as="select" value={type} onChange={e => setType(e.target.value)}>
  <option value="Savings">Savings</option>
</FormField>
```

> **Accessibility**: The `focus:ring-2 ring-blue-200` focus ring is non-negotiable for keyboard users (FR-007).

---

### StatusMessage

Semantic feedback component with four variants.

```tsx
<StatusMessage variant="success">Account saved.</StatusMessage>
<StatusMessage variant="error">Something went wrong.</StatusMessage>
<StatusMessage variant="warning">Check your connection.</StatusMessage>
<StatusMessage variant="info">Syncing in progress.</StatusMessage>
```

| Variant | Background | Text | Border |
|---|---|---|---|
| `success` | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| `error` | `bg-red-50` | `text-red-700` | `border-red-200` |
| `warning` | `bg-amber-50` | `text-amber-800` | `border-amber-300` |
| `info` | `bg-blue-400/70` | `text-white` | `border-white/30` |

---

## SVG Icons

All SVG icons **must** use `fill="currentColor"` so they adapt to the active text colour in both light and dark themes.

```tsx
// ✅ Correct — adapts to theme via text color
<button className="text-gray-900 dark:text-gray-50">
  <svg fill="currentColor">...</svg>
</button>

// ❌ Wrong — hardcoded fill is invisible in dark mode (D-003/D-004 defects)
<svg fill="#000000ff">...</svg>
```

Set the icon colour via a Tailwind `text-*` class on the containing element or the SVG itself. Use `dark:text-*` for dark-mode overrides.

- **Defects fixed**: D-003 (`WeekNavigation` `fill="#000000ff"`), D-004 (`Transaction` alert icon), D-005 (`Transaction` action icons)

---

## Bottom Sheet Animation

Always use `translate-y-full` for the off-canvas (closed) state.

```tsx
// ✅ Correct
className={open ? 'translate-y-0' : 'translate-y-full'}

// ❌ Wrong — translate-y-100 moves element only 100px, not fully off-screen
className={open ? 'translate-y-0' : 'translate-y-100'}
```

Use the `BottomSheet` primitive to avoid this error entirely.

---

## Focus Rings

All keyboard-focusable form inputs **must** include `focus:ring-2 ring-blue-200`. Use `FormField` to inherit this automatically.

Auth inputs already comply via the `field-auth` pattern.

---

## Approved Colour Utilities

| Category | Approved utilities |
|---|---|
| **Blue surfaces** | `bg-blue-500`, `bg-blue-400`, `bg-blue-300`, `bg-blue-400/70` |
| **Neutral surfaces** | `bg-gray-50`, `bg-gray-100`, `bg-gray-200`, `bg-gray-300` |
| **Semantic surfaces** | `bg-emerald-50`, `bg-red-50`, `bg-amber-50`, `bg-amber-100` |
| **Auth surfaces** | `bg-white`, `bg-slate-100` |
| **Overlay** | `bg-slate-900/75` |
| **Hover** | `hover:bg-blue-200`, `hover:bg-blue-400`, `hover:bg-blue-500`, `hover:bg-blue-600`, `hover:bg-gray-200`, `hover:bg-red-600`, `hover:bg-slate-100` |
| **Deprecated** | ~~`hover:bg-green-300`~~ — replaced by `hover:bg-blue-400` (D-007 fix) |
| **Text** | `text-white`, `text-gray-700`, `text-red-700`, `text-green-700`, `text-amber-800`, `text-emerald-700`, `text-slate-900`, `text-slate-700`, `text-slate-600`, `text-blue-600` |

---

## Governance

- Any new design value must be reviewed against [approved-design-rules.json](../../.github/design-system/approved-design-rules.json) before use.
- Missing rules require an explicit decision following the `design-system-guard` skill workflow.
- Update this document and the skill guidance in [SKILL.md](../../.github/skills/design-system-guard/SKILL.md) whenever approved rules change.
