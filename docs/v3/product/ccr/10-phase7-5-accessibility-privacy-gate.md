# Phase 7.5 — Accessibility, focus, responsive and privacy gate

## Status

Automated structural gate: **GREEN**.

Real-browser confirmation remains required for native keyboard navigation, exact tab order, responsive rendering and runtime browser-storage/network inspection.

## Automated coverage added

`v3/tests/ccr/pilotUiAccessibilityPrivacy.test.js`

The gate verifies:

- choice controls are native `input[type="radio"]` elements grouped by a stable `name` inside `fieldset` + `legend`;
- no custom `keydown` interception replaces native radio keyboard semantics;
- the result panel is programmatically focusable with `tabindex="-1"` and carries an accessible label;
- result notices use `role="status"` + `aria-live="polite"`;
- technical disclosure uses native `details` / `summary`;
- explicit focus transfer exists after evaluation, requested follow-up, edit/finish and exam add/remove flows;
- CSS provides visible `:focus-visible` / `:focus-within` treatment;
- CSS includes responsive breakpoints at 980 px and 640 px, 16 px mobile form controls and 44 px minimum touch targets;
- pilot source does not use `localStorage`, `sessionStorage`, `indexedDB`, `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon` or common analytics calls;
- visible pilot copy states that exam data remain only in memory for the current session;
- the page keeps `autocomplete="off"` and `robots=noindex,nofollow`.

## Issue #10 automated correction

The transient stale `Até aqui` exam count was traced to `polish.ts` rebuilding the journey summary from every `.step-complete` section even when that step had become hidden after upstream invalidation.

Correction:

- journey polish now includes only completed steps that are still visible and not `guided-future`;
- no MutationObserver was reintroduced;
- no clinical/model/engine code changed.

Regression:

- a completed exam step is shown in `Até aqui` while it is valid;
- after upstream history changes hide the exam step, the exam-count summary disappears immediately.

Issue #10 should remain open until this behavior is rechecked once in a real browser.

## Issue #9 presentation decision

The deep CCR evaluation intentionally retains non-trigger tracks for audit. The product boundary already identifies which tracks actually caused the product-level conclusion through `automationBoundary.triggerTrackIds`.

To preserve complete trace while reducing audit noise:

- technical presentation now prioritizes sections/cards containing boundary-trigger tracks;
- non-trigger tracks remain present and auditable;
- no clinical rule, resolver, Foundation state or trace is suppressed.

For a hard exclusion, the special-risk trigger therefore appears before downstream indeterminate family-history state in technical presentation.

Issue #9 should remain open until the new ordering is confirmed in a real browser; the downstream family track is intentionally not deleted.

## Current automated gate

At HEAD prior to this documentation-only commit:

- schema checks: **62/62**;
- full test suite: **561/561** across **38/38** files;
- accessibility/privacy structural gate: **6/6**;
- presentation-boundary prioritization: **3/3**;
- pilot polish regression suite: **6/6**;
- Foundation typecheck: green;
- CCR pilot typecheck: green;
- Foundation build: green;
- CCR pilot build: green;
- V2 byte-for-byte preservation: green.

## Remaining real-browser checks

### Keyboard/focus

Confirm with physical keyboard:

- Tab and Shift+Tab proceed through visible controls in a sensible order;
- arrow keys move within native radio groups;
- Space selects the focused radio/button as expected;
- Enter activates buttons/forms appropriately;
- focus remains visible;
- focus does not become trapped;
- focus after Edit / Concluir edição, add/remove exam and evaluation remains sensible.

### Responsive

Inspect approximately:

- 1440 px desktop;
- 768 px tablet/narrow desktop;
- 390 px mobile.

Confirm panel order, wrapping, banner height, button/radio widths, technical disclosure readability and absence of horizontal overflow.

### Runtime privacy

In browser DevTools, confirm during ordinary use:

- Application -> Local Storage: no patient data;
- Application -> Session Storage: no patient data;
- Application -> IndexedDB: no patient database;
- Network: no analytics or patient-data requests beyond local Vite/static development traffic.

## Completion rule

The automated gate materially reduces risk but does **not** replace real-browser validation. Phase 7.5 remains open until the remaining keyboard/responsive/runtime-privacy checks and real-browser confirmations for Issues #9/#10 are documented.