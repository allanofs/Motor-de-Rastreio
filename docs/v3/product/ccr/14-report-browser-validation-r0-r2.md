# CCR Report & Evidence Provenance — R0–R2 browser validation

Date: 2026-10-26

Status: **browser-validated for the routine export path; R0–R2 technically frozen after maintenance refactor**.

This document records only what was actually demonstrated in the real browser plus the automated guarantees. It does not imply clinical-use authorization, deployment or public release.

## Real-browser evidence supplied

### 1. Final routine BA-A / FIT path

Observed in the pilot:

- referential: `CCR — Brasil ampliado BA-A`;
- age: 57 years;
- preventive screening context confirmed;
- no route-changing condition reported;
- no relevant family history reported;
- never screened, confirmed;
- strategy selected: FIT;
- FIT availability: available;
- final primary state: **Rastreamento indicado**;
- governed action visible: offer FIT according to selected policy/strategy;
- operational route visible: executable in the informed service;
- **Exportar relatório** visible only after the final exportable state.

### 2. Human-readable report preview

Observed in the exported local report:

- Motor V3 report heading;
- policy/referential;
- reference date;
- ruleset version;
- report contract `report-r0.1`;
- final conclusion `Rastreamento indicado`;
- section **Por que o Motor chegou a esta conclusão**;
- next action;
- inputs considered;
- operational context;
- **Referências utilizadas nesta conclusão**;
- governed source title, institution, year/version, jurisdiction, source ID, official URL and exact locator;
- technical traceability with Boundary, determining track, activated rule and release gate.

The user explicitly confirmed that the report/print presentation was visually correct, including the A4-oriented output.

### 3. Non-exportable incomplete state

Observed in the real browser:

- SUS / Brasil oficial path with insufficient information;
- primary state: **Próxima informação necessária**;
- no export control displayed.

This confirms that an unfinished clinical-information state is not presented as a final reportable evaluation.

### 4. Non-exportable resource-pending state

Observed in the FIT-positive path:

- a diagnostic colonoscopy action existed in the deeper product path;
- the Motor requested colonoscopy resource availability;
- primary state: **Disponibilidade de recurso necessária**;
- availability still unresolved/unknown;
- no final export control displayed at that stage.

This confirms that the UI does not bypass the Motor's requested operational input.

## Important limitation of the browser evidence

A final, fully resolved **Atenção específica** report was not visually captured in the supplied browser screenshots during this validation turn.

That behavior remains covered by automated tests:

- `pilotUiSpecificAttention.test.js` verifies the final primary surface boundary;
- `reportRenderer.test.ts` verifies that deep FIT-positive management is not promoted as the report's primary action in `SPECIFIC_ATTENTION_REQUIRED`;
- provenance/rationale remain available through the report contract.

This is therefore a targeted optional future browser spot-check, not a reason to reopen the routine R0–R2 implementation.

## Maintenance refactor completed after visual validation

The browser-validated behavior was preserved while eliminating duplicate form serialization.

### Shared draft serializer

`v3/pilot/ccr/pilotDraft.ts`

Both evaluation and report export use `collectCcrPilotDraft(...)`.

### Authoritative exam state

`v3/pilot/ccr/pilotExamState.ts`

- exam state remains memory-only;
- `main.ts` mutates the authoritative collection;
- report export receives a defensive `snapshotPilotExams()`;
- no clinical inference is performed by this state layer.

This avoids reconstructing longitudinal exam semantics from rendered HTML and prevents evaluation/export divergence.

### Human report polish

The report renderer now presents:

- reference date in `DD/MM/YYYY` on the human surface;
- `Rastreamento colorretal` instead of the raw topic ID;
- `Nunca realizado (confirmado)` instead of `never_performed` on the human surface.

Technical IDs remain available only where they belong in the traceability layer.

## Final automated gate after refactor

Head: `6fa2dc9bbca393e333c0f0f1cad4b9a6e2f3088f`

- schema checks: **62/62**;
- test files: **42/42 passed**;
- tests: **577/577 passed**;
- `pilotUiInteraction.test.js`: **34/34 passed**, including longitudinal FIT/colonoscopy cases;
- `pilotDraftSerializer.test.ts`: **2/2 passed**;
- `reportProvenance.test.ts`: **6/6 passed**;
- `reportRenderer.test.ts`: **3/3 passed**;
- `pilotUiReportExport.test.js`: **4/4 passed**;
- `pilotUiAccessibilityPrivacy.test.js`: **7/7 passed**;
- Foundation typecheck: passed;
- CCR pilot typecheck: passed;
- Foundation build: passed;
- CCR pilot build: passed;
- V2 byte-for-byte preservation: passed.

## Frozen R0–R2 architecture

```text
Guided interview
    ↓
shared pilot draft serializer + authoritative exam snapshot
    ↓
CCR product evaluation
    ↓
Boundary of Automation
    ↓
determining tracks
    ↓
DecisionTrace.sourceRefs
    ↓
governed source catalog
    ↓
structured report model
    ↓
human-readable A4 renderer
    ↓
local browser export / Save as PDF
```

## Constraints still in force

- no merge to `main`;
- no deploy;
- no public release;
- no authorization for real-world clinical use;
- no clinical-rule changes in this phase;
- no patient direct identifiers introduced;
- no patient/report persistence;
- no analytics or patient-data network transport;
- PDF/HTML is a representation of the structured report model, not the clinical source of truth.
