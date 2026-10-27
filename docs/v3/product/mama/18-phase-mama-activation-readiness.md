# Mama — activation-readiness audit after approved M3.1

Status: **NOT READY FOR ACTIVATION — one clinical-governance blocker remains**.

This audit consolidates:

- M3 core rules: `breast-0.1.2-m3-r2-reviewed-draft` — 15 rules, independent R2 approved, still draft;
- M3.1 under-40 scope: `breast-0.1.3-m3-1-under40-source-verified-draft` — human gate approved, still draft/source-verified;
- canonical Mama decision context: `breast-0.1.5-m3-1-decision-context-draft`.

## What is ready

- 15/15 M3 core rules have two distinct reviewer records and remain immutable/draft;
- all core rules have sourceRefs with governed sources/locators;
- M3.1 under-40 scope is source-backed for SUS, Brasil ampliado and USPSTF;
- hard-exit precedence in <40 is protected by automated safety cases;
- SharedDecision reason semantics are domain-specific without Foundation expansion;
- known high familial risk input contract is hardened;
- Depth Budget remains shallow;
- a canonical Mama decision-context adapter now consumes the engine result plus the M3.1 under-40 scope artifact.

## Blocker AR-01 — M3.1 lacks independent R2 review

The independent R2 approval applied to `breast-0.1.1-m3-r1-draft` / the 15 M3 rules. The final M3.1 implementation did not yet exist at that time.

Therefore the approved M3.1 human gate must not be represented as `reviewed_by_2`.

Required resolution:

- focused independent review of the M3.1 implementation/evidence semantics;
- record verdict using an anonymous reviewer handle under the same governance model as M3 R2;
- if approved, freeze a reviewed M3.1 snapshot without changing clinical semantics.

## AR-02 closed — canonical under-40 provenance integration

The Foundation engine still correctly returns routine `NotApplicable` for average-risk people <40 because no ordinary age rule applies.

The Mama domain now provides `buildMamaDecisionContext()`, which combines the engine evaluation with the M3.1 source-backed under-40 scope artifact.

Safety behavior:

- under-40 routine scope is attached only after `specialRisk`, `priorFinding` and `specificCare` are all complete and `NotApplicable`;
- any active higher-acuity track suppresses routine age closure;
- any incomplete/unknown safety assessment suppresses routine age closure;
- the added sourceRefs remain available for future product/report provenance;
- Foundation remains unchanged.

This closes `under40_canonical_trace_integration_missing` as a technical blocker.

## Not blockers for clinical-content readiness yet

- multi-source hard-exit provenance remains accepted provisionally through R2; reassess before final report/product integration;
- no UI exists yet;
- no Mama report exists yet;
- no deployment exists yet.

Those are later product gates, not reasons to falsify clinical lifecycle now.

## Readiness verdict

`ready = false`

Remaining blocker:

1. `m3_1_independent_r2_review_missing`

No `active` Mama snapshot should be created until this final clinical-governance blocker is closed and the gate is rerun.
