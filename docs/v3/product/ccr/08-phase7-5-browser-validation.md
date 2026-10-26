# Phase 7.5 — Browser validation

## Status

Started. **Substantially validated; not complete.**

This phase records real-browser observations after Phase 7.4.3 and the Phase B automation-boundary demonstration. It does not mark the pilot as clinically validated or authorized for real-world use.

Current browser-validation branch:

`v3-ccr-product-boundary`

Current ruleset visibly confirmed in the browser:

`crc-0.5.9-phase6-h1-active`

## Validated in real browser

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
- technical details remain separately disclosed;
- the active product/browser path is using `crc-0.5.9-phase6-h1-active`.

### H1 original blocker — confirmed resolved end-to-end

Real-browser scenario:

- referential: SUS / Brasil oficial;
- age: 57;
- preventive context confirmed;
- conditions that change the route: all negative;
- family history: explicitly negative;
- screening history: never performed, confirmed;
- FIT availability: available.

Observed final primary surface:

**Rastreamento indicado**

Observed guidance:

`Oferecer FIT de rastreamento conforme a política e a estratégia selecionadas.`

Operational route:

`Executável no serviço informado`

The old spurious family-history review is no longer promoted to the primary result. Issue #5 was therefore closed after real-browser confirmation.

### FIT-positive continuity + automation boundary — confirmed

Real-browser scenario:

- SUS / Brasil oficial;
- age: 57;
- preventive context;
- hard exclusions negative;
- family history negative;
- known screening history;
- one known FIT with positive result.

Observed first result:

**Disponibilidade de recurso necessária**

The product requests only colonoscopy availability after the Motor has produced the FIT-positive follow-up action. The primary surface at this intermediate step still exposes the governed action because the product is waiting for the operational input.

After `Colonoscopia = Disponível`, observed final primary surface:

**Atenção específica**

Observed primary explanation:

`Há uma situação que precisa ser resolvida antes de retornar ao rastreamento de rotina. O rastreamento de rotina fica suspenso neste momento.`

The deep diagnostic colonoscopy action is no longer promoted as primary guidance after the boundary is resolved. It remains visible inside `Detalhes técnicos`, under the FIT-positive follow-up track, with operational routing preserved.

This confirms the intended Phase B distinction:

**Motor profundo preservado internally; product surface stops at the automation boundary.**

### Hard exclusion / route-changing condition — primary boundary confirmed

Real-browser scenarios were exercised in:

- SUS / Brasil oficial;
- Brasil ampliado BA-A.

With a condition that changes the route identified, the guided interview stops downstream average-risk acquisition and the primary result is:

**Atenção específica**

Family/history/exam acquisition is not shown as a required continuation on the left-side guided journey.

This confirms that a hard exclusion has precedence over routine screening on the primary product surface.

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

## New browser observation — Issue #9

Hard-exclusion testing exposed a presentation/audit inconsistency that is separate from the H1 clinical blocker.

When `Detalhes técnicos` is expanded after a hard exclusion, a downstream card may still appear as:

- `História familiar`;
- `Falta informação` / `Indeterminate`;
- raw technical message `Required clinical information or date precision is missing`.

This does **not** alter the correct primary result (`Atenção específica`) and downstream family acquisition remains hidden in the guided interview. It is therefore not currently classified as a clinical blocker.

Tracked separately as:

**Issue #9 — `[Phase 7.5] Hard exclusion leaves downstream family missing-state in technical details`**

Do not patch Foundation or clinical rules merely to hide this card. First determine whether the deep CCR benchmark intentionally evaluates the downstream family track after a hard exclusion. If it does, prefer presentation prioritization/de-emphasis using product-boundary metadata while preserving the complete trace.

## Visual/product observations

### Confirmed improvements

1. Completed-step summaries are materially easier to scan.
2. The compact hero substantially improves vertical density after acquisition starts.
3. The current requested resource step is visually clear and remains separate from the clinical result panel.
4. The result panel has one page scroll and no nested result scroll.
5. Technical trace remains available without dominating the main clinical surface.
6. `Rastreamento indicado` now provides a materially clearer routine endpoint than generic `Avaliação concluída`.
7. `Atenção específica` successfully prevents a deep CCR follow-up protocol from becoming the primary product surface.
8. Hard exclusions stop the visible average-risk acquisition journey rather than asking irrelevant downstream questions.

### Remaining observations to inspect

The following are not all defects; they remain audit items:

- the resource-request state appears both in the follow-up callout and as the main overview title; assess whether this is useful reinforcement or unnecessary duplication;
- governed action text can contain wording that is technically correct but more formal than the surrounding UI; do not rewrite clinical semantics merely for style;
- raw English diagnostic/technical text remains visible inside `Detalhes técnicos`; acceptable for the current internal pilot, but should be localized before a public-facing surface;
- Issue #9: downstream non-trigger technical tracks may compete visually with the track that actually caused `Atenção específica`;
- long technical details create a tall page when expanded, but do not create nested scrolling.

## Remaining mandatory browser checks

Phase 7.5 is not complete until the following are exercised or re-exercised on the current Phase B branch.

### Flow coverage

Completed on current branch:

- SUS average-risk path through final FIT availability response ✅
- FIT availability ✅
- colonoscopy availability after FIT-positive follow-up ✅
- hard exclusion / route-changing condition primary boundary ✅
- prior FIT-positive follow-up through final `Atenção específica` ✅

Still required:

- Brasil ampliado average-risk path where `strategy_selection` is requested, then only the selected resource availability;
- International/USPSTF path where strategy is requested;
- unknown family history / indeterminate route;
- edit an earlier completed step and confirm downstream invalidation/reconstruction on the current branch;
- add, edit, collapse and remove FIT and colonoscopy records in real browser;
- inspect Issue #9 semantics/presentation before Phase 7.5 closure.

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

The automation-boundary work adds an additional report requirement: the report must distinguish the **product-level boundary conclusion** from deeper internal technical tracks. A report for `Atenção específica` must not silently promote hidden deep-management details into the patient/product-level recommendation while still preserving traceability for audit.

## Completion rule

Do not mark Phase 7.5 complete based only on DOM tests, screenshots or successful CI.

Completion requires a documented real-browser pass of the remaining flow, keyboard, responsive and runtime-privacy checks above, with defects either fixed or explicitly accepted/documented.
