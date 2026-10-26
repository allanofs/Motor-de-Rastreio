# Mama — M3 R2 independent clinical review packet

Status: **prepared; independent R2 not yet performed**.

Ruleset under review: `breast-0.1.1-m3-r1-draft`.

This packet is for an independent second clinical review. It does not authorize activation.

## Reviewer independence requirement

The R2 reviewer should independently assess the clinical translation and should not merely confirm the R1 reviewer. The review record must identify the reviewer or a governed pseudonymous handle and the review date.

## What to review

### A. Population/routine translation

1. **SUS 40–49** — represented as `SharedDecision`, not automatic `Due`.
2. **SUS 50–74** — screening mammography every 2 years; a valid routine-clearing screening mammogram anchors the interval.
3. **SUS 75+** — represented as `SharedDecision`, not automatic `Due`.
4. **Brasil ampliado 40–74** — annual screening mammography.
5. **Brasil ampliado 75+** — `SharedDecision`; no automatic `Due` without governed prognostic context.
6. **USPSTF 40–74** — biennial screening mammography.
7. **USPSTF 75+** — insufficient evidence / abstention; no positive mammography recommendation.

### B. Hard exits / Boundary of Automation

Review that these conditions correctly stop average-risk routine automation without creating deep diagnostic/treatment management:

- suspicious breast symptoms;
- prior breast cancer;
- known high-risk genetic context;
- known high-risk familial context;
- prior high-risk chest radiation;
- prior high-risk breast lesion;
- unresolved prior mammography attention state;
- active specific breast care.

Confirm specifically that common first-degree family history alone is **not** automatically treated as high-risk familial context.

### C. Prior mammography / temporal semantics

Confirm:

- screening mammography and diagnostic mammography are not interchangeable;
- only explicit `routine-clearing` screening mammography with adequate quality/completeness/resolution may anchor routine interval;
- `attention-required` and `indeterminate` do not silently restart routine screening;
- raw BI-RADS is not interpreted by M3;
- the interval belongs to the selected policy, not to the exam record itself.

### D. Depth Budget

Confirm M3 should **not** automate:

- BI-RADS management tree;
- diagnostic US/MRI selection;
- biopsy decisions;
- genetics workup;
- treatment;
- post-treatment surveillance;
- Gail/Tyrer-Cuzick/BOADICEA risk calculation.

## Deliberately open issues — do not silently close

### M3-01 — age <40

There is no explicit executable `<40` routine rule yet. R1 deliberately refused to invent a `recommend_against` stance without an explicit source-backed translation and policy-specific provenance.

R2 should answer one of:

- **APPROVE GAP OPEN** — safe to keep M3.1 mandatory before activation;
- **REQUEST M3.1 TRANSLATION** — specify the source-backed translation needed;
- **CLINICAL OBJECTION** — explain why the current omission is unsafe even as a draft.

### Multi-source provenance of common hard exits

Some common safety rules aggregate sourceRefs from more than one referential family. This avoids duplicating up to 24 near-identical rules during draft development.

R2 should answer one of:

- **ACCEPT PROVISIONALLY** until Mama report/product integration;
- **REQUIRE POLICY-SPECIFIC RULES BEFORE R2 PROMOTION**;
- **REQUIRE POLICY-SPECIFIC PRESENTATION ONLY**, keeping common executable rules.

## Golden behavior to verify conceptually

1. SUS age 55, never screened -> `Due`.
2. Recent routine-clearing screening mammogram -> `Current` when within selected policy interval.
3. Same prior mammogram may be `Due` under Brasil ampliado and `Current` under USPSTF.
4. SUS age 45 -> `SharedDecision`.
5. Brasil ampliado age 76 -> `SharedDecision`.
6. USPSTF age 76 -> insufficient-evidence abstention; no screening recommendation action.
7. Known high familial risk -> exits routine without a risk calculator.
8. Unresolved prior abnormal/attention-required mammography -> blocks silent return to routine.
9. Diagnostic mammography -> never anchors routine screening.
10. Active specific care -> routine automation stops; future product may present `Em acompanhamento específico` based on the dedicated track rather than falsifying engine stance.

## Required R2 response format

The reviewer should return:

- overall verdict: **APPROVE / APPROVE WITH CORRECTIONS / REJECT**;
- comments for each section A–D;
- explicit answer on M3-01 (<40);
- explicit answer on multi-source provenance;
- list of mandatory corrections, if any;
- confirmation that no deep diagnostic-management tree is being implicitly authorized.

## Promotion rule after R2

Even an R2 approval does **not** automatically activate Mama.

After independent R2:

1. apply any required corrections in a new immutable snapshot;
2. rerun full automated gate;
3. confirm M3.1 / <40 requirement is resolved before activation readiness;
4. only then consider a `reviewed_by_2` candidate;
5. activation must remain a separate explicit human gate.
