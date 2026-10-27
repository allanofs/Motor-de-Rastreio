# Mama — Product Input / Acquisition Contract

Status: **GREEN / TECHNICALLY FROZEN / DRAFT PR**.

This phase defines how a future Guided Interview may collect simple user-facing answers and normalize them into the governed `Patient`, `ExamRecord` and `CareSettingContext` structures consumed by the active Mama product integration.

It does not change clinical rules, evidence, lifecycle governance, Automation Boundary semantics, Foundation, engine or model.

## Architecture boundary

The intended flow is:

```text
Guided Interview UI
  -> MamaProductDraft
  -> normalizeMamaProductDraft()
  -> Patient + CareSettingContext
  -> evaluateMamaProduct()
  -> Mama Automation Boundary
  -> Mama Presentation Model
```

The UI collects and serializes answers. It does not decide clinical meaning.

## `not_asked` versus `unknown`

These values are deliberately different.

- `not_asked`: progressive acquisition has not reached that question; the corresponding fact is omitted.
- `unknown`: the question was reached and the answer is genuinely unknown; an explicit `presence: unknown` fact reaches the engine.

The UI must never convert a hidden/unasked control into `no`.

## Context / anatomy

The draft contract separately acquires:

- screening context confirmed;
- relevant breast tissue present.

The product must not infer anatomy from sex, gender identity or demographic labels.

## Hard exits

The draft contract can explicitly acquire:

- suspicious breast symptoms;
- prior breast cancer;
- known high-risk genetic context;
- known high-risk familial context;
- prior high-risk chest radiation;
- prior high-risk breast lesion;
- specific breast care already active;
- unresolved prior-mammography attention status.

These are direct answer-to-concept mappings. The normalizer does not calculate risk.

## Familial-risk contract

`knownHighRiskFamilialContext=yes` means that high familial breast-cancer risk has already been established externally by an appropriate clinical/risk assessment.

The draft schema intentionally contains no generic `familyHistory`, relative counts, diagnosis-age rules or risk-score inputs.

The strict schema rejects extra fields such as generic family-history details or Gail/Tyrer-Cuzick/BOADICEA score inputs instead of silently converting them into high risk.

## Mammography history

History knowledge is one of:

- `known`;
- `never_performed`;
- `unknown`;
- `not_asked`.

`never_performed` is a real knowledge state, not missing data. For the limited screening-history question it normalizes to:

- history sufficient for current status = yes;
- prior mammography allows routine = no;
- prior mammography needs specific attention = no;
- no exam records.

A known mammography record must explicitly state:

- role: screening or diagnostic;
- optional date;
- high-level disposition: routine return, specific attention, indeterminate, pending or unknown;
- quality;
- completeness;
- resolution information.

No raw BI-RADS category is required or interpreted.

A diagnostic mammogram remains a diagnostic modality even if the acquired disposition says routine return. It therefore cannot become a qualifying screening-interval anchor.

The current high-level status `priorMammographyNeedsSpecificAttention` is acquired explicitly and is not reconstructed by scanning historical BI-RADS categories.

## Contradiction guards

Normalization rejects, before engine evaluation:

- mammography records when `historyKnowledge` is not `known`;
- `never_performed` combined with a positive prior-mammography status;
- simultaneous `priorMammographyAllowsRoutine=yes` and `priorMammographyNeedsSpecificAttention=yes`.

## Operational availability

The only V1 operational resource is mammography.

`careSetting.mammography` maps only to `CareSettingContext.resources[breast-resource-mammography]`.

It does not change clinical eligibility or the Automation Boundary. It only allows later product presentation to determine the operational route when mammography is already clinically due.

## Suggested Guided Interview acquisition order

The future UI should use progressive disclosure approximately as follows:

1. referential + age;
2. screening context / relevant anatomy;
3. suspicious symptoms and active specific care;
4. special-risk hard exits;
5. mammography-history knowledge;
6. only if history is known: current prior-finding status and qualifying mammography details;
7. only if mammography is actually due: local mammography availability.

This is an acquisition order, not a new clinical decision algorithm. The final requested-next-input behavior should continue to be driven by the product result/presentation rather than duplicated in UI conditionals.

## Automated invariants

The acquisition suite proves:

- strict rejection of ungoverned family/risk fields;
- explicit-only familial high-risk mapping;
- `not_asked` != `unknown`;
- correct `never_performed` semantics;
- screening versus diagnostic mammography separation;
- prior unresolved finding -> specific attention;
- contradiction rejection before engine evaluation;
- ordinary due path normalization;
- under-40 hard-exit precedence preserved;
- unknown safety answer -> more information needed;
- mammography availability remains operational only.

## Final gate

- schema checks: **62/62**;
- test files: **57/57**;
- tests: **665/665**;
- Mama acquisition / normalization: **12/12**;
- Foundation typecheck: green;
- CCR pilot typecheck: green;
- Foundation build: green;
- CCR pilot build: green;
- V2 byte-for-byte preserved.

## Non-goals / still not authorized

- no generic family-history risk calculation;
- no Gail/Tyrer-Cuzick/BOADICEA;
- no BI-RADS interpretation;
- no ultrasound/MRI/biopsy tree;
- no Foundation/engine/model changes;
- no UI implementation yet;
- no storage, analytics or network transmission;
- no merge/deploy/public release/clinical-use authorization.

## Next phase

Build the **Mama Guided Interview UI** in a separate stacked branch. The UI must serialize only into `MamaProductDraft`, use progressive disclosure, preserve `not_asked` for hidden controls, and render only the governed Mama presentation result rather than implementing clinical conditions itself.
