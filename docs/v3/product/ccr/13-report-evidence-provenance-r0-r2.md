# Report & Evidence Provenance — R0–R2

## Status

Implementation candidate on branch `v3-ccr-report-provenance`, stacked on the Phase 7.5-validated product boundary.

This work remains integration-only. It does not authorize clinical use, public release, deployment, or merge into `main`.

## Product objective

Allow a user to export a human-readable report only after the Motor has reached an exportable final product conclusion, while preserving exact evidence provenance.

The report must answer, without requiring code inspection:

1. What did the Motor conclude?
2. Why did it reach that conclusion?
3. What information materially contributed to it?
4. What action, if any, is promoted at the approved Boundary of Automation?
5. Which governed source(s) support the determining track(s)?
6. Where in each source is the relevant recommendation located?
7. Which ruleset and product contract produced the report?

## Non-goals

This phase does not:

- add patient name, CPF, medical-record number, or other direct identifiers;
- persist patient/report data;
- transmit report/patient data to a server;
- add analytics;
- change clinical rules;
- promote report concepts to Foundation;
- turn the deep CCR benchmark into a full downstream management protocol on the primary product surface.

## Architecture

The evidence chain is:

`automationBoundary -> triggerTrackIds -> TrackEvaluation -> DecisionTrace.sourceRefs -> governed ruleset source catalog -> report provenance`

The report is therefore derived from the evaluation that occurred. It does not infer bibliography from the selected referential label.

## R0 — structured report contract

File: `v3/src/product/ccr/report.ts`

Contract: `report-r0.1`.

The model contains:

- release gate;
- ruleset version;
- selected policy/referential;
- reference date;
- final automation boundary and determining track IDs;
- explicit human-readable rationale for each determining track;
- activated rule IDs and guardrails for technical traceability;
- facts materially used by the determining tracks;
- exam records used or considered;
- history-knowledge state;
- resource availability only when operationally relevant;
- primary actions only when the approved product Boundary permits them;
- unresolved information;
- resolved source metadata and exact locators;
- explicit unresolved provenance entries when a source ID cannot be resolved.

### Verified evaluation binding

`buildCcrReportModel(draft, evaluated)` does not trust a stale evaluated object blindly.

It:

1. normalizes the current draft;
2. recalculates the product from the current draft;
3. verifies that no strategy/resource input is still requested;
4. blocks `MORE_INFORMATION_NEEDED` as not yet exportable;
5. fingerprints the recalculated evaluation plan and compares it with the supplied evaluation;
6. only then builds the report from the verified recalculation.

This prevents a report from silently representing an older clinical state after an input change.

## Export eligibility

Export is blocked for:

- invalid form/input;
- pending human strategy choice;
- pending resource availability;
- `MORE_INFORMATION_NEEDED`;
- mismatch between current input and evaluated result.

Export can be generated for final product conclusions, including:

- routine screening due/current/not indicated;
- final shared-decision state when no additional requested input remains;
- `SPECIFIC_ATTENTION_REQUIRED`;
- `SPECIFIC_CARE_ACTIVE`;
- safe final abstention states when representable by the report contract.

For `SPECIFIC_ATTENTION_REQUIRED` / `SPECIFIC_CARE_ACTIVE`, deep CCR management is not promoted as a primary report action merely because it remains available in the internal benchmark.

## Primary action rule

Primary actions are collected only from presentation cards whose `trackId` belongs to the Boundary `triggerTrackIds`.

This prevents unrelated/non-determining tracks from contributing a promoted action to the exported report.

## Rationale

Each determining track contributes a report rationale containing:

- track ID;
- human track label;
- track status;
- presentation summary;
- activated rule IDs;
- guardrails.

The printable report renders the section:

**Por que o Motor chegou a esta conclusão**

Rule IDs remain in technical traceability rather than being used as the primary human explanation.

## Provenance resolution

`resolveCcrReportProvenance()` resolves structured `DecisionTrace.sourceRefs` against the governed CCR ruleset source catalog.

Resolved source output includes:

- `sourceId`;
- institution;
- document title;
- publication year;
- version;
- jurisdiction;
- official URL;
- exact locator(s);
- evidence metadata when present.

If a `sourceId` does not resolve, provenance becomes `incomplete` and the unresolved source/locator is displayed explicitly. The system does not fabricate a citation.

## R1 — printable renderer

File: `v3/src/product/ccr/reportRenderer.ts`.

The renderer is pure and browser-agnostic. `src/**` contains no `window`/`document` API.

It generates escaped HTML designed for:

- A4 printing;
- browser print preview;
- local “Save as PDF”;
- responsive preview on smaller screens.

The report contains:

- pilot/no-clinical-use warning;
- referential;
- reference date;
- ruleset and report-contract version;
- product conclusion;
- explicit rationale;
- promoted next action when allowed;
- inputs/exams/resources relevant to determining tracks;
- decision-specific references and locators;
- technical Boundary/track/rule/release-gate traceability.

Dynamic values are HTML-escaped before rendering.

## R2 — pilot export controller

File: `v3/pilot/ccr/reportUi.ts`.

The controller:

- serializes the current pilot form into the existing CCR product-draft contract;
- recalculates the product;
- calls `buildCcrReportModel`;
- only reveals **Exportar relatório** if the builder confirms an exportable state;
- keeps generated report HTML only in memory;
- invalidates/hides export immediately on input/change/reset;
- opens a blank local browser tab and writes the printable document;
- attaches the print button in the browser-only pilot layer;
- relies on the browser native print dialog for “Salvar como PDF”.

No external PDF library, storage, analytics, fetch, XHR, WebSocket, or patient-data transport is introduced.

### Current maintainability note

`reportUi.ts` currently serializes the same pilot form contract that `main.ts` collects for evaluation. This duplicates UI-to-draft mapping, not clinical logic.

For the pilot this is protected by end-to-end export tests and verified-evaluation binding. After real-browser report validation, consider extracting a shared pilot draft serializer so evaluation and report export consume one UI serialization function.

Do not perform that refactor before the report flow is stable unless a real defect appears.

## Automated coverage

Dedicated tests include:

- governed source title/URL/locator in report provenance;
- rationale derived only from Boundary trigger tracks;
- activated rules present in determining rationale where expected;
- FIT-positive specific-attention does not promote deep diagnostic management as a primary report action;
- pending strategy/resource blocks export;
- missing clinical information blocks export;
- current-input/evaluated-result mismatch is rejected;
- unresolved source metadata is surfaced rather than fabricated;
- A4 renderer contains rationale and provenance;
- HTML escaping;
- export-button lifecycle;
- export invalidation after edits;
- privacy gate includes the new report controller.

## Browser validation gate

Before considering R0–R2 stable, validate in a real browser:

1. SUS average-risk final result -> `Exportar relatório` appears -> preview contains result, rationale, FIT action, source title, official URL and locator -> print preview can save A4 PDF.
2. FIT-positive + colonoscopy availability -> `Atenção específica` -> report exports but does not promote the deep diagnostic colonoscopy instruction as its primary action; rationale/source provenance remain present.
3. Pending BA-A strategy/resource and `Próxima informação necessária` -> no export button.
4. After an exportable result, edit any upstream input -> export button disappears immediately until re-evaluation.
5. DevTools -> no local/session storage or IndexedDB patient/report persistence; no external network/analytics transport introduced by export.

## Next step after browser validation

If R0–R2 pass the real-browser gate, freeze this report contract and decide whether to:

- extract the shared pilot draft serializer as a maintainability refactor; and/or
- generalize the report/provenance pattern only after the next screening domain demonstrates the same need.

Do not promote CCR-specific report semantics to Foundation prematurely.
