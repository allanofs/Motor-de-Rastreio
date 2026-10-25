# Phase 7.5 — Browser validation

## Status

Started. **Partially validated; not complete.**

This phase records real-browser observations after Phase 7.4.3. It does not mark the pilot as clinically validated or authorized for real-world use.

## Validated in real browser so far

Screenshots and direct interaction confirmed:

- the pilot is clickable and interactive after the Phase 7.4.3 runtime fix;
- the initial referential dropdown opens normally;
- the initial screen no longer shows an empty `Até aqui` block after the polish layer initializes;
- the hero/header compacts after the guided journey starts;
- completed steps remain collapsed and show human-readable summaries;
- the current step remains visually dominant;
- future steps stay hidden until the existing product contract reveals them;
- SUS can progress to a Motor-requested FIT availability step without showing resource availability prematurely;
- the FIT availability step renders as a real requested input with `Disponível`, `Indisponível` and `Desconhecido` choices;
- the right panel shows the requested resource state and governed action before operationalization;
- technical details remain separately disclosed.

## Runtime defect found and fixed during browser validation

The first Phase 7.4.3 browser attempt rendered but became effectively unresponsive to clicks.

Cause isolated to the polish layer observing DOM mutations that could be caused by its own presentation synchronization, creating a self-reinforcing microtask/mutation loop in the real browser.

Fix:

- removed the self-observing `MutationObserver` from `polish.ts`;
- polish synchronization now responds to actual UI events (`click`, `input`, `change`, `submit`) and explicit queued synchronization;
- no clinical evaluation logic was changed.

Fix HEAD:

`489e9ee1e35a4f69cb9fa00e542c42ebc66201bf`

GitHub Actions for this HEAD completed successfully.

## Visual/product observations from the current browser pass

### Confirmed improvements

1. Completed-step summaries are materially easier to scan.
   - Example: `Nenhuma condição que mude a rota identificada` replaces four raw negative fields.
2. The compact hero substantially improves vertical density after acquisition starts.
3. The current requested resource step is visually clear and remains separate from the clinical result panel.
4. The result panel has one page scroll and no nested result scroll.
5. Technical trace remains available without dominating the main clinical surface.

### Remaining observations to inspect

The following are **not yet defects**; they are items for the remaining browser audit:

- the resource-request state currently appears both in the follow-up callout and as the main overview title; assess whether this is useful reinforcement or unnecessary duplication;
- governed action text can contain wording that is technically correct but more formal than the surrounding UI; do not rewrite clinical semantics merely for style;
- raw English diagnostic/technical text remains visible inside `Detalhes técnicos`; this is acceptable for the current technical disclosure contract, but should be reviewed before a public-facing product surface;
- genuine `ClinicalReviewRequired` tracks may coexist with an available governed action in technical details; the remaining audit must verify that the primary surface never misrepresents this combination;
- long technical details create a tall page when expanded, but do not create nested scrolling.

## Remaining mandatory browser checks

Phase 7.5 is not complete until the following are exercised in a real browser.

### Flow coverage

- SUS average-risk path through final FIT availability response;
- Brasil ampliado path where `strategy_selection` is requested;
- International/USPSTF path where strategy is requested;
- FIT availability and colonoscopy availability separately;
- hard exclusion / genuine clinical-review route;
- unknown family history / indeterminate route;
- prior FIT-positive follow-up route;
- edit an earlier completed step and confirm downstream invalidation/reconstruction;
- add, edit, collapse and remove FIT and colonoscopy records.

### Keyboard and focus

Verify with real keyboard:

- Tab and Shift+Tab order;
- Enter/Space on buttons and radio controls;
- arrow-key behavior for native radio groups;
- visible focus on all interactive controls;
- focus after automatic step transitions;
- focus after Edit / Finish editing;
- focus after add/remove exam;
- focus after evaluation and after requested-input follow-up;
- no focus trap in collapsed or hidden content.

### Responsive layouts

Inspect at approximately:

- 1440 px desktop;
- 768 px tablet/narrow desktop;
- 390 px mobile.

Check wrapping, panel order, control width, banner height, sticky behavior and readability.

### Runtime privacy

Using browser developer tools where practical, verify that normal use of the pilot does not introduce:

- patient persistence in localStorage/sessionStorage/indexedDB;
- analytics calls;
- unintended patient-data network transmission.

## Report export dependency

The future `Exportar relatório` / evidence-provenance phase remains gated on Phase 7.5 stabilization.

The report must reference the specific governed source/guideline provenance that supported the evaluated result, not a bibliography inferred from the selected policy label.

## Completion rule

Do not mark Phase 7.5 complete based only on DOM tests, screenshots or successful CI.

Completion requires a documented real-browser pass of the mandatory flow, keyboard, responsive and runtime-privacy checks above, with defects either fixed or explicitly accepted/documented.
