# Mama — Report / Provenance Integration

Status: **GREEN / FROZEN / DRAFT**

Branch: `v3-mama-report-provenance`

This phase integrates Mama with the frozen shared Reporting Foundation R3 without changing clinical rules, the engine, Foundation, Automation Boundary semantics or the Acquisition Contract.

## Deliverables

- `v3/src/product/mama/report.ts`
  - structured Mama report model;
  - export eligibility;
  - stale-evaluation protection;
  - minimal used-input snapshot;
  - exact provenance resolution.
- `v3/src/product/mama/reportRenderer.ts`
  - printable local HTML renderer using the shared A4 report shell.
- `v3/tests/mama/reportProvenance.test.ts`
  - report/provenance carrier and renderer invariants.

## Provenance invariant

The report MUST NOT infer bibliography from a policy name, age range, human-facing recommendation text or module identity.

### Track-based conclusions

For boundaries with `provenanceCarrier = track_trace`, provenance comes only from the determinant track `DecisionTrace.sourceRefs`.

Examples include:

- `ROUTINE_DUE`;
- `ROUTINE_CURRENT`;
- `SPECIFIC_ATTENTION_REQUIRED`;
- `SPECIFIC_CARE_ACTIVE`;
- track-derived `SHARED_DECISION`.

### M3.1 under-40 conclusions

For the reviewed M3.1 average-risk `<40` closure, the engine intentionally has no fabricated age RuleDefinition. The report therefore preserves:

- `provenanceCarrier = decision_context`;
- zero fabricated trigger tracks;
- the exact `MamaDecisionContext.additionalSourceRefs`;
- the reviewed routine-scope conclusion and rationale;
- the safety-track IDs that had to be complete and inactive before age closure could apply.

The report never converts this decision-context artifact into a fake engine rule.

## Used data

The report does not dump the entire acquisition form. It snapshots data materially used or considered by determinant/supporting tracks:

- age when available;
- facts used in trace;
- exam records used or considered;
- relevant history-knowledge state;
- operational resources used by determinant actions.

For decision-context `<40` closure, the supporting safety tracks are used to retain the clinical facts proving that a higher-acuity pathway did not preempt routine age closure.

## Export eligibility

A report is not buildable while the presentation still requests human/operational input or while the Boundary is `MORE_INFORMATION_NEEDED`.

The report is rebuilt from the current draft and compared with the supplied evaluated result. A stale or edited draft cannot silently export a report for an earlier evaluation.

## Renderer

The renderer reuses the shared Reporting Foundation R3 A4 shell and includes:

- policy label;
- reference date;
- ruleset/report contract versions;
- human-facing boundary conclusion;
- rationale;
- primary action when appropriate;
- used data;
- exact governed references and locators;
- technical trace including Boundary, provenance carrier, reason code, determinant tracks/rules and release gate.

The renderer preserves Mama-specific distinctions such as:

- USPSTF `<40` = outside recommendation scope;
- SUS / expanded Brazil `<40` = routine screening not recommended according to the selected referential translation;
- the different reasons behind `SHARED_DECISION`.

## Gate

Final functional code gate before this documentation-only closeout commit:

- schema checks: **62/62**;
- test files: **60/60**;
- tests: **693/693**;
- Mama report/provenance: **8/8**;
- Foundation typecheck: green;
- CCR pilot typecheck: green;
- Mama pilot typecheck: green;
- Foundation build: green;
- CCR pilot build: green;
- Mama pilot build: green;
- V2 byte-for-byte preservation: green;
- inherited real-Chrome Mama browser gate: green.

The first CI attempt failed only because of one unused TypeScript import in the new report file. Removing that import produced the green gate above; no clinical semantics changed.

## Non-goals

This phase does NOT:

- add report/export controls to the Mama UI;
- call `window.print()`;
- persist or transmit report/patient data;
- modify clinical rules/evidence;
- deepen BI-RADS, diagnostic imaging, biopsy, genetics or treatment pathways;
- merge, deploy or authorize real-world clinical use.

## Next phase

Create a separate stacked branch for **Mama browser report export integration**: expose export only after an export-eligible current evaluation, generate the structured report from the exact current draft/evaluation, open the local printable document, hide export immediately after edits, and validate the export flow in DOM tests and real Chrome without storage or network transmission.
