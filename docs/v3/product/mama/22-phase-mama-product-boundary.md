# Mama — Product Integration: Automation Boundary + Presentation Model

Status: **GREEN / TECHNICALLY FROZEN / DRAFT PR**.

This phase consumes the canonical active Mama clinical candidate and compresses the deep evaluation into a product-facing contract. It does not change clinical rules, evidence, Foundation, engine, model, lifecycle governance, or the approved Depth Budget.

## Inputs

Clinical content:

- ruleset: `breast-0.1.7-m3-1-active`;
- active M3.1 domain snapshot: `breast-0.1.7-m3-1-domain-active`;
- canonical exports: `mamaCandidateRuleset`, `mamaCandidatePolicies`, `mamaCandidateDomainSnapshot`.

Product evaluation is exposed through `evaluateMamaProduct()` and retains the full underlying engine evaluation.

## Product Boundary

Contract: `mama-B1`.

Boundary codes:

1. `CANNOT_CONCLUDE_SAFELY`
2. `SPECIFIC_ATTENTION_REQUIRED`
3. `SPECIFIC_CARE_ACTIVE`
4. `MORE_INFORMATION_NEEDED`
5. `SHARED_DECISION`
6. `ROUTINE_DUE`
7. `ROUTINE_CURRENT`
8. `SCREENING_NOT_INDICATED`

These names match the product vocabulary already proven in CCR, but the implementation remains domain-specific in this phase. No shared Foundation abstraction is introduced here.

## Safety precedence

The Mama Boundary applies the following precedence:

1. conflict/computation failure;
2. specific breast care already active;
3. special-risk or unresolved-prior-finding hard exit;
4. missing/pending clinical information;
5. USPSTF 75+ insufficient-evidence state;
6. any otherwise-unmapped clinical review requirement;
7. ordinary shared/individual decision;
8. routine screening due;
9. routine screening current;
10. reviewed M3.1 under-40 routine scope;
11. no routine indication in the evaluated path.

The missing-information step deliberately precedes the USPSTF insufficient-evidence presentation. A 75+ person with an unknown safety fact must therefore request clarification before the product surfaces the population-level evidence uncertainty.

## Under-40 contract

Average-risk under-40 closure is not inferred from UI state and is not manufactured from the absence of an age rule.

The Boundary consumes `MamaDecisionContext`, which attaches the reviewed M3.1 scope only after safety tracks are complete and inactive.

For under 40:

- SUS: `SCREENING_NOT_INDICATED` + `under40-routine-not-recommended`;
- Brasil ampliado: `SCREENING_NOT_INDICATED` + `under40-routine-not-recommended`;
- USPSTF: `SCREENING_NOT_INDICATED` + `under40-outside-recommendation-scope`.

`provenanceCarrier = decision_context` identifies that provenance comes from the M3.1 domain artifact rather than a trigger-track trace.

Hard exits and incomplete safety information suppress age closure.

## SharedDecision reason semantics

`reasonCode` preserves clinically meaningful distinctions without adding a generic Foundation concept:

- `outside-population-core-access-on-demand` — SUS 40–49 and 75+;
- `continuation-conditioned-on-health-horizon` — Brasil ampliado 75+;
- `insufficient-evidence` — USPSTF 75+.

The high-level code remains `SHARED_DECISION`, while presentation text preserves the normative distinction. In particular, `insufficient-evidence` is never presented as a positive screening recommendation.

## Presentation model

Contract: `mama-P1`.

The product model provides the final human surface so a future UI does not need to reinterpret clinical states.

Primary labels include:

- `Rastreamento indicado`;
- `Em dia`;
- `Decisão individual`;
- `Atenção específica`;
- `Em acompanhamento específico`;
- `Próxima informação necessária`;
- `Rastreamento não indicado`;
- `Fora do escopo da recomendação`;
- `Não foi possível concluir com segurança`.

Technical sections/cards and original trace/provenance remain available underneath the compressed surface.

## Operational availability

Mamography availability is product-operational context, not a clinical eligibility rule.

The product asks `mammography_availability` only when:

- a mammography action is actually due; and
- availability remains unknown.

Known availability changes the operational route, not the clinical Boundary.

## Provenance

The Boundary does not duplicate sources or rules.

For ordinary track-driven outcomes, provenance remains reachable through the determining `TrackEvaluation.trace`.

For reviewed under-40 closure, provenance remains in `MamaDecisionContext.additionalSourceRefs`.

This distinction is explicit through `provenanceCarrier`.

## Gate

Final code gate before this documentation commit:

- schema checks: **62/62**;
- test files: **56/56**;
- tests: **653/653**;
- Mama product Boundary/presentation: **12/12**;
- Mama safety-precedence regression: **1/1**;
- Foundation typecheck: green;
- CCR pilot typecheck: green;
- Foundation build: green;
- CCR pilot build: green;
- V2 byte-for-byte preserved.

The initial CI failure in this phase was limited to TypeScript `exactOptionalPropertyTypes` handling in new product/test code and was corrected without changing clinical semantics. A manual safety review also identified and corrected ordering so missing safety information precedes the USPSTF 75+ insufficient-evidence surface.

## Non-goals / still not authorized

- no clinical-rule changes;
- no Foundation/engine/model changes;
- no UI implementation;
- no report implementation;
- no BI-RADS diagnostic-management tree;
- no Gail/Tyrer-Cuzick/BOADICEA implementation;
- no merge to `main`;
- no deploy/public release;
- no patient-facing or real-world clinical-use authorization.

## Next phase

The next product phase should define the **Mama input-normalization / acquisition contract** before building a Guided Interview UI. That keeps UI responsibility limited to collecting and presenting data rather than creating clinical meaning.
