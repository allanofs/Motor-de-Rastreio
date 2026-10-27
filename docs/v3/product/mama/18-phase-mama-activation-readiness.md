# Mama — activation-readiness audit after approved M3.1

Status: **NOT READY FOR ACTIVATION — blockers explicit**.

This audit consolidates:

- M3 core rules: `breast-0.1.2-m3-r2-reviewed-draft` — 15 rules, independent R2 approved, still draft;
- M3.1 under-40 scope: `breast-0.1.3-m3-1-under40-source-verified-draft` — human gate approved, still draft/source-verified.

## What is ready

- 15/15 M3 core rules have two distinct reviewer records and remain immutable/draft;
- all core rules have sourceRefs with governed sources/locators;
- M3.1 under-40 scope is source-backed for SUS, Brasil ampliado and USPSTF;
- hard-exit precedence in <40 is protected by automated safety cases;
- SharedDecision reason semantics are domain-specific without Foundation expansion;
- known high familial risk input contract is hardened;
- Depth Budget remains shallow.

## Blocker AR-01 — M3.1 lacks independent R2 review

The independent R2 approval applied to `breast-0.1.1-m3-r1-draft` / the 15 M3 rules. The final M3.1 implementation did not yet exist at that time.

Therefore the approved M3.1 human gate must not be represented as `reviewed_by_2`.

Required resolution:

- focused independent review of the M3.1 implementation/evidence semantics;
- record verdict using an anonymous reviewer handle under the same governance model as M3 R2;
- if approved, freeze a reviewed M3.1 snapshot without changing clinical semantics.

## Blocker AR-02 — under-40 provenance is not yet in a canonical decision trace

The Foundation engine correctly returns routine `NotApplicable` for average-risk people <40 because no age rule applies. M3.1 separately resolves the policy-specific meaning and sourceRefs through `resolveMamaUnder40RoutineScope()`.

This is safe for the current draft, but it means a future canonical Mama result/report could lose the M3.1 rationale/provenance unless product/domain integration explicitly consumes this artifact.

Required resolution before a canonical active candidate:

- define a reviewed Mama candidate evaluation adapter or product boundary that consumes the engine result plus the M3.1 under-40 scope artifact;
- ensure hard exits dominate routine age closure;
- ensure the resulting trace/report can answer why <40 is outside routine screening and cite the correct policy source;
- do not modify Foundation solely to make this work.

## Not blockers for clinical-content readiness yet

- multi-source hard-exit provenance remains accepted provisionally through R2; reassess before final report/product integration;
- no UI exists yet;
- no Mama report exists yet;
- no deployment exists yet.

Those are later product gates, not reasons to falsify clinical lifecycle now.

## Readiness verdict

`ready = false`

Blockers:

1. `m3_1_independent_r2_review_missing`
2. `under40_canonical_trace_integration_missing`

No `active` Mama snapshot should be created until both are closed in governed, tested form.
