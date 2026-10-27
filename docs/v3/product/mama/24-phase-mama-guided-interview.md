# Mama — Guided Interview UI

Status: **FUNCTIONAL UI GREEN / DRAFT PR / REAL-BROWSER VISUAL+A11Y GATE PENDING**.

This phase implements the first interactive Mama pilot on top of the previously frozen acquisition, product-boundary and clinical layers.

It does **not** add clinical rules or policy logic to the frontend.

## Architecture

```text
UI controls
  -> collectMamaPilotDraft()
  -> MamaProductDraft
  -> normalizeMamaProductDraft()
  -> evaluateMamaProduct()
  -> Mama Automation Boundary
  -> Mama Presentation Model
  -> rendered result
```

The interface never interprets guideline age bands, screening intervals or risk thresholds itself.

## Guided acquisition

The current journey is:

1. referential + reference date + age;
2. screening context + relevant breast anatomy;
3. safety / hard-exit facts;
4. mammography-history knowledge;
5. known mammography records only when needed;
6. mammography availability only when explicitly requested by the governed presentation model.

The frontend evaluates the governed product between acquisition stages. If the Automation Boundary already resolves to a higher-acuity or final state, downstream routine questions are not opened merely because they exist in the form.

## Progressive disclosure

Initially only the referential/age step is exposed.

Completed steps stay visible as compact summaries and can be reopened for editing. Editing upstream data immediately recalculates the product result and removes downstream resource questions that are no longer relevant.

`not_asked` and `unknown` remain distinct:

- hidden/unreached controls serialize as `not_asked`;
- an explicit “Não sei” serializes as `unknown` and reaches the clinical engine as uncertainty.

## Safety behavior covered by DOM tests

The UI tests verify at minimum:

- ordinary progressive disclosure;
- hard exit stops routine acquisition;
- hard-exit precedence below age 40;
- ordinary SUS under-40 closure only after safety information is available;
- USPSTF 75+ remains an evidence-insufficient individual decision;
- never-performed history can lead to a due pathway;
- mammography availability is asked only when the presentation requests it;
- explicit unknown safety information remains unresolved;
- diagnostic mammography never becomes a screening-interval anchor;
- a qualifying recent screening mammography can surface `Em dia`;
- contradictory history is rejected by the normalizer instead of guessed by UI;
- stale resource requests disappear after an edited hard exit changes the Boundary;
- no generic family-history/risk-score controls are introduced;
- no raw BI-RADS category acquisition is introduced.

A deliberately conservative behavior was preserved after the first CI run: a diagnostic mammogram that allowed later routine return does **not** prove screening coverage and therefore may remain `Próxima informação necessária`; the UI test does not force that scenario into `Rastreamento indicado` merely to close the form.

## Accessibility structure

Automated structural checks verify:

- native `fieldset` + `legend` groups for choice questions;
- polite live result region;
- assertive error region;
- programmatically focusable result heading without adding it to normal tab order;
- no sex/gender control used as a proxy for relevant breast anatomy.

These checks do not replace browser/assistive-technology inspection.

## Privacy boundary

The pilot adds no:

- localStorage;
- sessionStorage;
- IndexedDB;
- analytics;
- fetch/XHR/sendBeacon;
- patient-data persistence or transmission.

Mammography draft records exist only in ephemeral in-memory page state.

## Build / gate integration

The repository now includes:

- `vite.mama-pilot.config.ts`;
- `tsconfig.mama-pilot.json`;
- `npm run dev:mama-pilot`;
- `npm run typecheck:mama-pilot`;
- `npm run build:mama-pilot`.

The main `npm run check` now validates both CCR and Mama pilot typechecks/builds.

## Final functional gate

At the final code HEAD before this documentation commit:

- schema checks: **62/62**;
- test files: **59/59**;
- tests: **685/685**;
- Mama Guided Interview interaction/safety tests: **13/13**;
- Mama accessibility/privacy structural tests: **7/7**;
- Mama acquisition contract tests: **12/12**;
- Mama product Boundary tests: preserved green;
- Foundation typecheck: green;
- CCR pilot typecheck: green;
- Mama pilot typecheck: green;
- Foundation build: green;
- CCR pilot build: green;
- Mama pilot build: green;
- V2 byte-for-byte preserved.

The first CI failure was a test expectation that incorrectly required a diagnostic mammogram to imply `ROUTINE_DUE`. Clinical behavior was not changed; the test was corrected to assert the actual invariant: diagnostic mammography does not establish routine screening coverage.

## Not yet authorized

- no report/export for Mama;
- no merge to `main`;
- no deployment/public release;
- no patient-facing or real-world clinical use;
- no claim of completed browser visual/accessibility validation.

## Next gate

The next gate is **real-browser UI validation and polish**:

- desktop and mobile responsive inspection;
- keyboard-only traversal and focus behavior;
- progressive-disclosure visibility in a real browser;
- stale-result behavior after edits;
- contrast/readability and label wrapping;
- runtime privacy/network inspection.

Only after that gate should the Mama UI be considered equivalent in product maturity to the previously validated CCR pilot surface.
