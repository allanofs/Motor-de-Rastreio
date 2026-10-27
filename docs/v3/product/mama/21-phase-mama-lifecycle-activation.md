# Mama — lifecycle activation gate

Status: **CLINICAL CONTENT ACTIVATED / product still not activated**.

Date: 2026-10-27.

## Authorization

After the Mama clinical-content readiness audit reached `ready = true` with no remaining blockers, the project lead explicitly authorized proceeding to the next step, which had been identified in advance as the separate lifecycle-activation gate.

This authorization permits creation of an immutable active clinical-content snapshot and canonical internal candidate entrypoint.

It does **not** authorize merge, deploy, public release, patient-facing use or real-world clinical use.

## Activated artifacts

Core ruleset:

`breast-0.1.7-m3-1-active`

- 15 rules;
- all remain `reviewed_by_2`;
- only `lifecycleStatus` changes from `draft` to `active`;
- rule IDs, sources, sourceRefs, actions, schedules, policies, terminology and governance reviews remain unchanged from `breast-0.1.2-m3-r2-reviewed-draft`.

M3.1 domain snapshot:

`breast-0.1.7-m3-1-domain-active`

- lifecycle promotion of `breast-0.1.6-m3-1-r2-reviewed-draft`;
- reviewed under-40 semantics, sourceRefs, SharedDecision reasons, high-risk familial contract and anonymous R2 governance are preserved unchanged;
- no attempt is made to force this domain-level artifact into Foundation `RuleDefinition`.

Canonical entrypoint:

- `mamaCandidateRuleset`;
- `mamaCandidatePolicies`;
- `mamaCandidateDomainSnapshot`.

Historical draft/R1/R2 snapshots remain available for audit and regression.

## Meaning of `active`

`active` means the clinical content passed the project's evidence, human-review, independent-R2 and explicit lifecycle-governance gates and may be consumed by later internal product-integration work.

It does **not** mean:

- deployed;
- public;
- merged to `main`;
- clinically validated in real patients;
- approved for patient-facing use;
- regulatory authorization;
- authorization to bypass the later product/UI/report/privacy/browser gates.

## Next phase

The next work should be product integration for Mama: Automation Boundary / presentation model / progressive guided interview / report integration, reusing the cross-domain Report Foundation where appropriate.

Those phases must remain isolated from clinical-content semantics and must not introduce new clinical inference in the UI.
