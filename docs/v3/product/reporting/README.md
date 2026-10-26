# Report Foundation R3

Status: **implemented and technically frozen on Draft PR #12**.

This phase extracts only report infrastructure already proven by the CCR R0–R2 implementation. The validated CCR report remains the behavioral reference.

## Reusable infrastructure

`v3/src/product/reporting/` now owns:

- `model.ts` — cross-module report envelope and action/rationale primitives;
- `provenance.ts` — governed resolution of `DecisionTrace.sourceRefs` against a module-supplied source catalog;
- `eligibility.ts` — generic export-completeness gate; the module still owns its boundary vocabulary;
- `html.ts` — HTML escaping, human ISO-date formatting, governed source rendering and the proven local A4 shell;
- `index.ts` — public exports.

The package is also exported from `v3/src/product/index.ts` so a future clinical module can consume it without importing CCR internals.

## Module responsibilities that remain local

The shared layer deliberately does **not** own:

- clinical input snapshots;
- clinical facts, modalities or concept labels;
- screening-specific actions or rationale;
- rule evaluation;
- which source references are emitted by a decision trace;
- which boundary codes a module considers incomplete;
- patient identifiers;
- browser persistence or network transport.

CCR remains responsible for all clinical meaning in:

- `v3/src/product/ccr/report.ts`;
- `v3/src/product/ccr/reportRenderer.ts`.

Those files now adapt the proven CCR behavior to the shared report foundation instead of duplicating infrastructure.

## Portability contract for the next module

A future module should:

1. evaluate its own clinical/product state;
2. decide its own Boundary of Automation and requested inputs;
3. call `assessReportExportEligibility(...)`, supplying its own incomplete boundary codes;
4. select its determining tracks;
5. pass only their governed `sourceRefs` plus that module's source catalog to `resolveReportProvenance(...)`;
6. construct its own clinical input snapshot and module-specific rationale;
7. use `StructuredReportModel<...>` as the report envelope;
8. render module-specific clinical content with the shared safe HTML/A4 helpers.

The shared layer must never infer a guideline from the referential label or invent a missing citation.

## Deliberately not extracted in R3

The local browser/window export controller remains in the CCR pilot for now. There is only one proven browser consumer, so extracting that code before a second module exists would be speculative abstraction. The second module should first reuse the report foundation; browser-export duplication can then be assessed with two real consumers.

## Final automated gate

Head validated before this documentation commit: `32abb64792db3e2987416adcb51dc8ec6916419a`.

- schema checks: **62/62**;
- test files: **43/43**;
- tests: **581/581**;
- Report Foundation R3: **4/4**;
- CCR report provenance: **6/6**;
- CCR report renderer: **3/3**;
- CCR pilot report export: **4/4**;
- CCR pilot interactions: **34/34**;
- Foundation typecheck: passed;
- CCR pilot typecheck: passed;
- Foundation build: passed;
- CCR pilot build: passed;
- V2 byte-for-byte preservation: passed.

## Constraints still in force

- no clinical-rule changes;
- no engine/model changes;
- no merge to `main`;
- no deploy or public release;
- no authorization for real-world clinical use;
- no patient/report persistence introduced;
- no analytics or patient-data network transport;
- no speculative generic clinical ontology.
