# Report & Evidence Export — Product Requirement

## Status

Product requirement recorded during Phase 7.4.3.

This document defines a future implementation phase. It does **not** claim that report export is already implemented.

## Goal

The Motor must be able to export a human-readable report of an evaluation while preserving traceability to the exact clinical referential and evidence source(s) that supported the displayed decision.

The report must answer, without requiring access to source code:

> Why did the Motor present this orientation, and which guideline/referential supports it?

## Core principle

The UI must not manufacture citations from the selected policy label.

Required architecture:

```text
clinical rule / governed decision
        ↓
evidence provenance metadata
        ↓
engine/product result
        ↓
sources actually used by that result
        ↓
report presentation
```

A report must therefore cite the evidence attached to the decision that was actually evaluated, rather than printing a generic bibliography for the CCR module.

## Minimum report content

### Evaluation metadata

- evaluation date/reference date;
- selected clinical referential;
- ruleset/version identifier;
- population facts actually considered by the evaluation;
- relevant known screening history and exams;
- resource context only when it affected the operational route.

### Result

- final state or recommendation shown by the Motor;
- governed next action(s), transported without changing clinical meaning;
- when applicable, explicit indication that the Motor abstained and that clinical review is required;
- relevant limitations or unresolved information.

### Evidence provenance

For every source that materially supports the reported orientation, the report should be able to render, when available:

- full source/guideline title;
- issuing organization;
- publication year and/or guideline version;
- stable source identifier used by the Motor;
- official URL and/or DOI;
- section, recommendation, table, page or other locator when captured in the evidence metadata;
- version/incorporation date used by the ruleset, when governed;
- evidence/source notes necessary to explain scope or limitations.

The report must distinguish:

1. **Referential selected** — e.g. SUS/Brasil oficial, Brasil ampliado, international.
2. **Source document(s)** — the guideline/manual/recommendation actually supporting the decision.
3. **Specific locator(s)** — section/table/recommendation/page when available.

## Decision-specific bibliography

The exported report should preferentially include only sources that were actually used by the evaluated output.

It must not silently substitute:

- every source known to the module;
- a source inferred only from the policy name;
- a generic guideline citation unrelated to the particular action shown.

If provenance is insufficient to generate an accurate bibliographic citation, the export must say so explicitly rather than fabricate completeness.

## Proposed user-facing flow

```text
guided interview
      ↓
Motor evaluates
      ↓
result / clinical-review state
      ↓
Exportar relatório
      ↓
PDF first
```

The export action should be available for both:

- completed evaluations; and
- genuine clinical-review/abstention states, where the report must clearly state that no automatic recommendation was produced.

## Initial output format

First target: **PDF**.

The report representation should be structured so that future outputs can include:

- print/HTML;
- machine-readable audit JSON;
- other governed document formats.

PDF presentation must not become the source of truth for provenance. It is a rendering of structured evaluation and evidence data.

## Privacy boundary

The initial implementation should preserve the current privacy model:

- no patient persistence;
- no analytics;
- no transmission solely to generate the report;
- client-side/local generation where technically viable;
- do not introduce name, CPF, record number or other direct identifiers merely because a report exists.

Any future patient-identification feature requires an explicit product/privacy decision separate from report export.

## Safety requirements

The report must not imply authorization for clinical use while the pilot remains integration-only.

It must preserve:

- release/pilot warning appropriate to the environment;
- ruleset version;
- clinical-review/abstention semantics;
- uncertainty and missing-information semantics;
- distinction between clinical recommendation and operational alternative;
- evidence provenance without citation fabrication.

## Implementation gate

Report export should be implemented only after Phase 7.5 browser validation has stabilized the evaluation/result surface.

Before report export is considered complete, the project must verify that the evidence/provenance model can resolve enough structured metadata for trustworthy bibliographic output. If current `sourceIds` are only internal identifiers, a governed resolver/catalog must be specified rather than hard-coding bibliography in the UI.

## Acceptance criteria for the future export phase

A successful implementation must demonstrate at least:

1. a completed evaluation can generate a PDF locally;
2. the PDF includes the selected referential and ruleset version;
3. the PDF includes the result and governed next action without semantic rewriting;
4. the PDF includes the specific source(s) supporting that result;
5. each rendered citation is resolved from governed evidence metadata, not UI conditionals;
6. a clinical-review state exports as clinical review, not as a recommendation;
7. editing inputs and re-evaluating changes the report provenance accordingly;
8. no patient data is persisted or transmitted as a side effect of export;
9. missing bibliographic metadata fails transparently instead of being invented.
