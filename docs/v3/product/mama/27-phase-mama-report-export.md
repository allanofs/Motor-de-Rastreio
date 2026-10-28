# Mama — Local Browser Report Export

Status: **GREEN / REAL-CHROME VALIDATED / SCREENSHOT INSPECTED / DRAFT**

Branch: `v3-mama-report-export`

This phase connects the green/frozen Mama structured report/provenance model to the Guided Interview without adding persistence, transmission, deploy or public release.

## User flow

The export control is intentionally conservative:

1. the Guided Interview reaches a governed result;
2. any requested input must be completed;
3. the user explicitly confirms the current state with `Atualizar avaliação`;
4. the report is rebuilt from the exact current draft and current evaluation;
5. only then is `Exportar relatório` exposed;
6. clicking export opens a local printable document in a new tab;
7. any subsequent edit immediately invalidates and hides export until the current evaluation is confirmed again.

The report model itself also rejects stale draft/evaluation mismatches.

## Privacy and isolation

The export controller:

- uses no `localStorage`;
- uses no `sessionStorage`;
- uses no IndexedDB;
- performs no `fetch` / XHR / beacon / analytics;
- sends no patient/report data to a server;
- clears `window.opener` on the printable tab;
- builds the printable HTML entirely in memory from governed local data.

The existing privacy test now scans `reportUi.ts` as well as the main acquisition UI.

## Automated DOM gate

The Mama report export UI tests cover:

- export hidden while mammography availability is still requested;
- export visible only for the exact current export-eligible evaluation;
- immediate invalidation after edits;
- local `<40` DecisionContext report preserving `decision_context` provenance;
- no export for `MORE_INFORMATION_NEEDED`;
- exportable `SPECIFIC_ATTENTION_REQUIRED` without deep management automation;
- blocked-popup feedback.

At the functional gate:

- schema checks: **62/62**;
- test files: **61/61**;
- tests: **699/699**;
- Mama local report export UI: **6/6**;
- Mama report/provenance model: **8/8**;
- all Foundation/CCR/Mama typechecks and builds: green;
- V2 byte-for-byte preservation: green.

## Real Chrome export gate

A dedicated supplemental harness (`v3/scripts/mama-report-export-browser-gate.mjs`) runs after the existing Mama browser gate.

It verifies in real Chrome:

- export is hidden before requested availability is answered;
- export remains hidden until explicit current-evaluation submit;
- export appears after a valid submit;
- trusted user-like click opens a separate local report tab;
- report title and heading are correct;
- governed result `Rastreamento indicado` is present;
- exact provenance section is present;
- `track_trace` carrier is present for the tested routine-due path;
- print/save-as-PDF control is present;
- `window.opener === null`;
- report page has no horizontal overflow;
- report loads no external resources;
- main pilot makes no external requests;
- no runtime exceptions;
- no `console.error`;
- any edit after export immediately hides the export control.

Passing machine evidence included:

- printable report `scrollWidth 1085 / innerWidth 1100`;
- zero external loaded report resources;
- zero external main-page requests;
- zero runtime exceptions;
- zero console errors.

## Visual inspection

The real-Chrome artifact includes `mama-report.png`. The screenshot was inspected after the passing gate.

Observed layout:

- centered A4-like report surface;
- visible `Imprimir / salvar como PDF` control;
- clear pilot warning;
- clear primary conclusion;
- readable rationale and next action;
- used clinical facts/history/resource context shown separately;
- governed source documents and locators visibly rendered;
- technical Boundary / provenance carrier / tracks / activated rules / release gate retained at the end;
- no blocking clipping or horizontal overflow observed.

## Gate-development corrections

Two harness-only failures occurred while building this phase:

1. the first attempt tried to click the off-screen `Atualizar avaliação` button by viewport coordinates; the UI was correct, so the general browser gate was restored unchanged and export validation was separated into its own harness using `requestSubmit()` for confirmation;
2. the first supplemental export run had a cooked-template regular-expression syntax error in the inspection code; it was replaced with URL parsing.

Neither failure required changing clinical rules, report semantics, Boundary, Acquisition Contract or the Guided Interview clinical behavior.

## Non-goals

This phase does NOT:

- persist a report;
- upload or email a report;
- generate server-side PDF;
- merge to main;
- deploy or publish the V3;
- authorize real-world clinical use.

## Next architectural step

With CCR and Mama now independently possessing governed product surfaces and local report/export capabilities, the next product architecture phase can begin designing the **unified MOTOR shell**: one external experience with domain modules remaining independent internally.
