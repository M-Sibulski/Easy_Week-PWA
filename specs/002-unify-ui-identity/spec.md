# Feature Specification: UI Identity Unification

**Feature Branch**: `[002-unify-ui-identity]`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Make styling more consistent and create a better UI identity, based on the provided style simplification and identity unification plan."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Consistent Visual Language Across Core Screens (Priority: P1)

As a regular app user, I want all major screens to follow one clear visual identity so the app feels cohesive and predictable while I manage weekly plans, accounts, and transactions.

**Why this priority**: Inconsistent styling across primary flows weakens trust and increases cognitive load in a finance app. Consistency directly improves usability and confidence.

**Independent Test**: Can be fully tested by navigating all core screens and confirming they use one unified visual style for color, spacing, icon controls, status feedback, and form treatment.

**Acceptance Scenarios**:

1. **Given** a user navigates between main workflow screens, **When** they view headers, forms, actions, and status feedback, **Then** those elements follow a consistent visual system and interaction behavior.
2. **Given** a user opens any account or transaction editing flow, **When** they compare controls across flows, **Then** equivalent actions look and behave consistently.

---

### User Story 2 - Readable and Reliable Theming (Priority: P2)

As a user who switches themes, I want all screens and icons to remain readable and visually correct in both light and dark modes so I can use the app comfortably in any environment.

**Why this priority**: Theme inconsistency and unreadable elements create functional defects and reduce accessibility.

**Independent Test**: Can be fully tested by toggling theme and verifying readability, contrast, icon visibility, and background surface behavior across all major screens.

**Acceptance Scenarios**:

1. **Given** the app is viewed in light mode and dark mode, **When** a user traverses the same workflows in each mode, **Then** text, icons, and key surfaces remain readable and visually coherent.
2. **Given** icon-based controls are displayed on primary action surfaces, **When** theme changes, **Then** icon visibility remains clear and no controls become visually hidden.

---

### User Story 3 - Predictable Feedback and Form Interaction (Priority: P3)

As a user completing forms and actions, I want consistent button behavior, visible focus states, and standardized success or error messages so I can understand what is happening and recover quickly from mistakes.

**Why this priority**: Clear interaction feedback and keyboard focus visibility are critical for accessibility and completion rates.

**Independent Test**: Can be fully tested by completing form and action flows using mouse and keyboard and confirming interaction states and feedback are consistent.

**Acceptance Scenarios**:

1. **Given** a user tabs through form controls, **When** focus moves across inputs and actions, **Then** each focusable field shows a clear visible focus state.
2. **Given** an operation succeeds or fails, **When** the app displays feedback, **Then** status messages follow consistent semantics and visual differentiation.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when a user opens legacy views that previously used one-off styles and custom overrides?
- How does the app handle very long text labels or validation messages without breaking layout consistency?
- What happens when a control is visible but disabled due to validation state?
- How does the app preserve readability when theme changes occur while overlays or form sheets are open?
- What happens when icon-only actions are displayed on visually similar backgrounds?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST provide one unified visual identity across primary user-facing screens, including navigation, forms, overlays, and feedback states.
- **FR-002**: The system MUST define and apply a single approved set of reusable visual tokens and interaction patterns for recurring UI elements.
- **FR-003**: The system MUST provide reusable UI building blocks for recurring interaction patterns so equivalent actions and layouts are presented consistently across flows.
- **FR-004**: The system MUST ensure all primary workflows remain fully readable and visually coherent in both light and dark themes.
- **FR-005**: The system MUST ensure icon-based actions remain visible and semantically clear in all supported themes.
- **FR-006**: The system MUST provide standardized status messaging patterns for success, error, warning, and informational states.
- **FR-007**: The system MUST provide clearly visible focus indicators for all keyboard-focusable form inputs and primary actions.
- **FR-008**: The system MUST resolve known visual defects that currently produce inconsistent, confusing, or inaccessible interaction states.
- **FR-009**: The system MUST align authentication views with the same overall visual identity used in the main app experience.
- **FR-010**: The system MUST provide human-readable design documentation that explains approved visual rules, component variants, and usage intent.
- **FR-011**: The system MUST prevent introduction of new ad-hoc visual styles that conflict with the approved visual system.

### Canonical Defect List and Task Traceability

The following list is the canonical scoped defect set for **FR-008** and **SC-002**. A defect is considered resolved only when all mapped tasks are complete and validation passes.

| Defect ID | Defect Description | User Impact | Mapped Task IDs |
|-----------|--------------------|-------------|-----------------|
| D-001 | Bottom-sheet hidden state uses `translate-y-100` instead of full off-canvas translation behavior in sheet flows. | Sheets can close/open inconsistently and feel broken. | T047, T048, T049 |
| D-002 | Edit-account delete icon uses an invisible or low-contrast hover treatment on blue surfaces. | Dangerous action affordance is unclear and hard to perceive. | T050 |
| D-003 | PWA badge close/interaction hover uses green instead of the approved blue interaction pattern. | Interaction language is inconsistent with app identity. | T051 |
| D-004 | Dead `md:max-w-2xl` utility remains in day-card layout path without active value. | Creates maintenance noise and can confuse layout intent. | T052 |
| D-005 | Week navigation arrows use fixed fill values that become unreadable across theme contexts. | Navigation affordance can lose visibility in light/dark combinations. | T038 |
| D-006 | Transaction icon fill treatment is not theme-safe and can become visually conflicting on primary surfaces. | Icon semantics and readability degrade in themed contexts. | T039 |
| D-007 | Legacy dark-mode override strategy remains where utility-based themed styling should be canonical. | Theme behavior is brittle, hard to audit, and inconsistent across screens. | T033, T034, T035, T036, T037, T040 |

Traceability note: `specs/002-unify-ui-identity/tasks.md` is the execution source for these task IDs.

### Compatibility & Migration Impact *(mandatory)*

- **Breaking Change**: No
- **Impact Surface**: UI behavior and visual presentation across core screens, overlays, theme behavior, and user feedback patterns
- **User Migration Needed**: No

### Key Entities *(include if feature involves data)*

- **Design Rule Set**: Canonical list of approved visual tokens and interaction patterns used to enforce consistency.
- **UI Pattern Variant**: Named, reusable representation of a recurring interaction element (for example icon actions, submit actions, form fields, status states, and sheet headers).
- **Theme Surface Role**: Semantic definition for primary, secondary, and accent surfaces that maps to both light and dark modes.
- **Status Message Type**: Classification of feedback states (success, error, warning, info) with consistent user-facing semantics.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% of defined core screens pass visual consistency review against the approved design rule set in both themes.
- **SC-002**: 0 known critical visual defects remain from the scoped bug list after implementation and verification.
- **SC-003**: 100% of form fields in scoped user flows present a visible keyboard focus indicator.
- **SC-004**: 100% of scoped success, error, warning, and informational states use standardized status message variants.
- **SC-005**: At least 90% of scoped recurring interaction patterns are represented through reusable UI pattern variants rather than one-off styling.
- **SC-006**: Authentication screens are rated visually consistent with the main app identity in design review sign-off.

### Scoped Screen List (for SC-001 and SC-002)

The following screen/surface list defines the required review scope for visual consistency and defect resolution success criteria:

- App shell (`src/App.tsx`)
- Main screen (`src/Mainscreen.tsx`)
- Week screen (`src/WeekScreen.tsx`)
- Day card/surface (`src/Day.tsx`)
- Transaction surface (`src/Transaction.tsx`)
- Bottom navigation (`src/BottomNav.tsx`)
- Account screen (`src/Account.tsx`)
- Create Account bottom sheet (`src/CreateAccount.tsx`)
- Create Transaction bottom sheet (`src/CreateTransaction.tsx`)
- Edit Account bottom sheet (`src/EditAccount.tsx`)
- Settings bottom sheet (`src/SettingsScreen.tsx`)
- Authentication screen (`src/auth/AuthScreen.tsx`)
- Week navigation controls (`src/WeekNavigation.tsx`)
- PWA badge interaction surface (`src/PWABadge.tsx`)

## Assumptions

- The current visual identity direction remains blue-monochrome and should be strengthened rather than replaced.
- The scope is limited to styling consistency, interaction consistency, and visual bug fixes; business logic and data models are unchanged.
- Existing user workflows and navigation structure are preserved unless visual consistency requires minor presentational adjustment.
- Existing test suites remain the baseline validation mechanism for behavioral regressions, with supplemental visual QA for theme and accessibility outcomes.
- A single human-readable design reference will be maintained as the source of truth for approved visual rules and component variants.
