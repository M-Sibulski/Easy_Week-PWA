# UI Principles (Draft)

## Current UI Direction (Observed)
- Mobile-first single-column shell with constrained desktop width.
- Blue/gray visual palette across primary surfaces.
- Overlay/bottom-sheet forms for create/edit/settings flows.
- Bottom tab navigation for top-level modes.
- Dense transactional list with inline edit affordances.

## Interaction Principles Already Reflected in Code
- Fast entry for transactions (quick add button, keyboard Enter progression).
- Immediate local updates after user actions.
- Inline feedback for import progress and sync state.
- Non-blocking cloud sync; local use remains available.

## Accessibility and UX Notes (Current)
- Basic ARIA labels/test IDs exist on key controls.
- Keyboard progression implemented for create-transaction form.
- No documented cross-app accessibility standard was found.

## Future Direction
- Distinct visual language for Plan / Spend / Compare / Learn stages.
- Dedicated screens for planner, dashboard, and end-of-week review.
- Improved system messaging for sync conflicts/failures and retry actions.

## UI Standards
- Accessibility baseline:
	- Full keyboard operability.
	- Visible focus styles on every focusable control.
	- WCAG AA contrast for text and critical states.
	- Screen-reader announcement for important sync and action-required status changes.
- Sync messaging:
	- Compact global sync status may auto-hide after a short idle period.
	- Detailed diagnostics belong in a dedicated details view.
- Responsive behavior:
	- Preserve mobile-first priority while defining stable layouts for future dashboard screens.
