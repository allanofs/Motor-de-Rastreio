# Mama — M3.1 focused independent R2 review packet

Purpose: focused independent review of the **new M3.1 translation only**. This does not reopen the already approved 15-rule M3 core unless the reviewer identifies a direct contradiction.

## Reviewer anonymity

Use the same governance principle as prior R2:

- do not store name, CRM, institution or specialty in the public repository;
- the project lead keeps identity verification outside the repository;
- record only a non-identifying public handle if approval is later registered;
- the reviewer must be a real clinician distinct from the R1 reviewer.

## Material under review

1. `v3/src/clinical/mama/m3_1Evidence.ts`
2. `v3/src/clinical/mama/under40Scope.ts`
3. `v3/src/clinical/mama/decisionSemantics.ts`
4. `v3/src/clinical/mama/inputContracts.ts`
5. `v3/tests/mama/m3_1Under40.test.ts`
6. `docs/v3/product/mama/15-phase-m3-1-under40.md`
7. `docs/v3/product/mama/17-phase-m3-1-human-gate.md`
8. `docs/v3/product/mama/18-phase-mama-activation-readiness.md`

## Questions requiring an explicit verdict

### A. Under-40 average-risk semantics

A1. SUS: approve `routine_not_recommended` for asymptomatic average-risk <40 with the supplied sourceRefs/rationale?

A2. Brasil ampliado: approve `routine_not_recommended` for asymptomatic usual-risk <40 with the supplied sourceRefs/rationale?

A3. USPSTF: approve `outside_recommendation_scope` rather than inventing `recommend_against` for <40?

### B. Hard-exit precedence

Approve that suspicious symptoms, prior breast cancer, established high-risk genetic/familial context, high-risk chest radiation, prior high-risk lesion, unresolved prior abnormal finding and active specific care must override routine-age closure in a person <40?

### C. SharedDecision reason semantics

Approve the distinction:

- SUS 40–49 / 75+: `outside-population-core-access-on-demand`;
- Brasil ampliado 75+: `continuation-conditioned-on-health-horizon`;

without promoting a new generic Foundation field at this stage?

### D. High familial-risk input contract

Approve that `breast-known-high-risk-familial-context = yes` means risk was already established by an appropriate external assessment and must not be inferred from generic positive family history or a single first-degree relative in isolation?

### E. Depth Budget

Confirm that M3.1 still does **not** authorize BI-RADS interpretation, US/MRI/biopsy/genetic-management/treatment trees, or Gail/Tyrer-Cuzick/BOADICEA calculations.

## Requested response format

```text
Verdict:
APPROVE
or
APPROVE WITH CORRECTIONS
or
REJECT

A. Under-40 semantics:
SUS: ...
Brasil ampliado: ...
USPSTF: ...

B. Hard-exit precedence:
...

C. SharedDecision semantics:
...

D. High familial-risk contract:
...

E. Depth Budget:
...

Mandatory corrections:
...

Confirmation:
No deep diagnostic/management tree is being authorized.
```

## Important

Approval here still does not activate Mama. After an independent M3.1 R2 verdict, the project must close the canonical under-40 trace/provenance integration blocker and rerun activation readiness before any lifecycle promotion to `active`.
