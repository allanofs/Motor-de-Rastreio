# Phase 7.4.3 — Guided Interview Polish

## Scope

Presentation-only refinement of the Phase 7.4.2 guided interview.

This phase does **not** change `v3/src/engine/**`, `v3/src/model/**`, `v3/src/clinical/ccr/**`, policy rules, clinical thresholds, product normalization or the existing requested-input contracts.

The engine still decides **what** information is required. The UI decides only **how** that state is presented.

## Product goals

1. Reduce duplication between the completed-step summaries and the right-side journey panel.
2. Replace literal/raw answer summaries with human-readable presentation summaries without changing semantic values.
3. Keep the current step visually dominant while lowering the visual weight of Edit actions.
4. Use consistent user-facing uncertainty language where the underlying semantic value is the same.
5. Keep the right panel compact, sticky on desktop and free of nested scrolling.
6. Compact the hero after the interview has started.
7. When an existing exam list is reopened for editing, present saved exams compactly until the user explicitly chooses to edit an exam.
8. Improve the wording of genuine `ClinicalReviewRequired` presentation without weakening the safe-failure state.

## Implementation boundary

The polish is isolated in:

- `v3/pilot/ccr/polish.ts`
- `v3/pilot/ccr/polish.css`

The existing Phase 7.4.2 acquisition and evaluation implementation remains the source of semantic state.

The polish layer reads DOM state already produced by the pilot and may:

- rewrite presentation summaries;
- hide an empty “Até aqui” section;
- compact already-saved exam cards when the exam step is explicitly reopened;
- standardize visible labels such as “Não sei”;
- rephrase presentation-only explanatory copy;
- toggle layout classes.

It must not:

- calculate clinical eligibility;
- introduce age cutoffs or policy-specific clinical branching;
- synthesize new requested inputs;
- alter semantic field values;
- select strategy or resource availability;
- suppress a genuine clinical-review state.

## Browser validation remains required

This phase does not certify the UI for real-world use. Phase 7.5 must still validate at minimum:

- rendered hierarchy in a real browser;
- keyboard and focus behavior;
- edit/invalidation behavior;
- SUS, Brasil ampliado and international paths;
- strategy and resource requests;
- responsive layouts;
- privacy/runtime behavior;
- safe-failure presentation.

No merge, deployment or public release is authorized by this phase.
