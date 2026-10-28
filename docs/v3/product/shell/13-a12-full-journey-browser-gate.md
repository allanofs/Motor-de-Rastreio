# A12 — Real-Chrome full two-module journey validation

Status: **GREEN / FROZEN / Draft PR**

## Objective

Validate the complete Unified MOTOR same-tab journey in a real Chromium browser:

`Shell -> CCR -> Shell -> Mama -> Shell`

A12 changes no clinical rules and adds no product persistence. It adds an integrated multi-page pilot build plus an automated browser gate and evidence artifacts.

## Scenario

The scripted gate uses fixed synthetic shared facts:

- evaluation date: `2026-10-28`;
- birth date: `1960-01-01`.

The values are test fixtures only and do not represent a real patient. The scenario uses a simple context path so the gate tests product continuity rather than the correctness of a particular clinical recommendation.

## Validated journey

### First Shell -> CCR

The gate supplies the synthetic evaluation date and birth date once. CCR receives the evaluation date, derives age locally as 66 years, produces a valid shallow module snapshot and returns through explicit `Voltar ao MOTOR`.

### After CCR return

Only the CCR card has a returned summary; Mama remains without a returned summary; the single-use carrier is cleared.

### Shell -> Mama

The context dialog reports reuse, with `2026-10-28` and `1960-01-01` already prefilled. The gate submits those values without re-entering or changing them. Mama receives the same evaluation date, derives age locally and returns its own shallow snapshot.

### Final Shell

Both independent module summaries coexist and both cards are independently `Revisar avaliação`. No combined/global preventive conclusion is rendered.

The final browser evidence also confirms:

- `window.name` consumed;
- localStorage length `0`;
- sessionStorage length `0`;
- no query/fragment patient/session state in the URL;
- no unexpected external network request;
- no runtime errors;
- no console errors.

## Evidence

Final workflow run: `40718327595`.

Artifact: `motor-full-journey-evidence`, ID `12827894337`, retained until `2026-11-11`.

The artifact contains:

- `after-ccr-return.png`;
- `final-two-module-desktop.png`;
- `final-two-module-mobile.png`;
- `journey-evidence.json`.

The JSON evidence records `reused: true` for the second context dialog and the same evaluation/birth dates. It records both final independent summaries, both `Revisar avaliação` actions, empty browser storage, cleared carrier, zero external requests and zero browser errors.

## Integrated build

A dedicated Vite multi-page configuration serves Shell, CCR and Mama under one local preview origin solely for browser validation. The configuration pre-transforms the domain bootstrap scripts so Vite bundles the same shared-context bootstrap used by the individual pilot builds.

This is not a deployment configuration and does not authorize public release.

## Debugging note

Two earlier A12 attempts failed in the new test harness, not in clinical logic:

1. the first integrated build did not bundle the domain shared-context bootstrap, so the A8 carrier remained unconsumed;
2. after bootstrap bundling was fixed, the script initially treated progressive choice fieldsets as native selects.

The harness was corrected to bundle the bootstraps during Vite pre-transform and drive either native controls or semantic radio fieldsets. The final real-Chrome run passed end to end.

## Final gate

At implementation HEAD `78a210a507f1a96dba7f82b939b0024908322cf2` before this documentation-only freeze commit:

- full real-Chrome two-module journey: green;
- integrated multi-page build: green;
- evidence upload: green;
- inherited Foundation `npm run check`: green;
- V2 byte-for-byte preservation: green.

A11's already-green Shell and Mama browser gates remain the inherited product-level browser gates for the unchanged UI code.

## Freeze rule

A12 is frozen as browser validation evidence only. It does not authorize persistence, patient identity, analytics, combined clinical status, merge, deploy or public release.

## Next architectural point

The unified two-module journey is now proven end to end in real Chrome. The next work should be chosen deliberately rather than automatically expanding shared state. Good candidates are UX refinement of the returned module summaries, accessibility/keyboard validation of the full integrated journey, or adding a new clinical module through the same frozen Shell contracts.
