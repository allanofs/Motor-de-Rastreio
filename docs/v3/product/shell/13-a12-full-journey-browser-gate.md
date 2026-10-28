# A12 — Real-Chrome full two-module journey validation

Status: **Draft / browser validation gate**

## Objective

Validate the complete Unified MOTOR same-tab journey in a real Chromium browser:

`Shell -> CCR -> Shell -> Mama -> Shell`

A12 changes no clinical rules and adds no product persistence. It adds an integrated multi-page pilot build plus an automated browser gate and evidence artifacts.

## Scenario

The scripted gate uses fixed synthetic shared facts:

- evaluation date: `2026-10-28`;
- birth date: `1960-01-01`.

The values are test fixtures only and do not represent a real patient.

The scenario deliberately chooses a simple non-routine screening context in each module so the gate tests product continuity rather than a particular clinical recommendation.

## Required assertions

### First Shell -> CCR

- Shell opens the shared-context dialog;
- synthetic evaluation date and birth date are supplied once;
- CCR receives the evaluation date;
- CCR derives age locally from birth date + evaluation date;
- CCR produces a valid shallow module snapshot;
- explicit `Voltar ao MOTOR` returns to Shell.

### After CCR return

- only the CCR card has a returned summary;
- Mama remains without a returned summary;
- the single-use carrier is cleared.

### Shell -> Mama

- the context dialog explicitly reports reuse;
- evaluation date and birth date are already prefilled;
- the gate submits them without re-entering or changing them;
- Mama receives the same evaluation date;
- Mama derives age locally;
- Mama produces its own valid shallow snapshot;
- explicit `Voltar ao MOTOR` returns to Shell.

### Final Shell

- CCR summary remains present;
- Mama summary is present;
- both cards are independently revisable;
- no combined/global preventive conclusion is rendered;
- `window.name` has been consumed;
- localStorage and sessionStorage remain empty;
- URL contains no query/fragment patient/session state;
- no unexpected external network request occurs;
- no browser runtime/console errors occur.

## Evidence

The workflow uploads:

- screenshot after CCR return;
- final desktop screenshot with both module summaries;
- final mobile screenshot;
- JSON evidence containing reuse checks, final independent summaries, storage/carrier checks and browser error/network findings.

## Integrated build

A dedicated Vite multi-page configuration serves Shell, CCR and Mama under one local preview origin solely for browser validation. This is not a deployment configuration and does not authorize public release.

## Gate

A12 is green only if the full real-Chrome scenario passes and inherited Foundation/Shell/Mama gates remain green.

No merge, deploy, analytics, persistence, patient identity or public release is authorized by A12.
