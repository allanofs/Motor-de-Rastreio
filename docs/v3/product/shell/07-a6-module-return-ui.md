# A6 — Explicit module return to Unified MOTOR Shell

Status: **Draft / integration gate**

## Objective

Wire the frozen A5 shallow outcome receipt into the pilot experience:

`Shell -> selected module -> current module evaluation -> explicit "Voltar ao MOTOR" -> Shell card for that same module`

A6 must improve continuity without creating a patient dashboard, cross-module inference or persistent history.

## Domain ownership

CCR and Mama remain responsible for their own evaluation and their own `MotorModuleSnapshot` projection. The Shell never imports or calls CCR/Mama evaluators, presenters or adapters.

The return action re-evaluates the current visible module draft through the existing product pipeline at the moment the user explicitly asks to return. If the domain cannot produce a valid current evaluation, no receipt is written and navigation does not occur.

## Shell behavior

On load, the Shell consumes at most one A5 outcome receipt. The receipt is single-use and cleared by the A5 contract.

If a valid receipt exists:

- only the matching module card receives the returned status;
- the card shows the reviewed shallow surface title/detail and policy label;
- its action becomes "Revisar avaliação";
- the other module remains unchanged;
- no combined status is calculated.

If there is no valid receipt, the Shell behaves exactly as before.

## Ephemeral semantics

A6 deliberately does not maintain a cross-module ledger. The returned snapshot exists only in the current Shell page instance after the single-use receipt is consumed. Navigating into another module does not preserve the previous module result for later aggregation.

This limitation is intentional: persistence or a multi-module session ledger would require a separate architecture/privacy contract.

## Privacy and safety boundaries

A6 adds no:

- raw patient facts to the return payload;
- URL query or fragment state;
- localStorage/sessionStorage/IndexedDB/cookies;
- backend or network transmission;
- analytics or patient identifier;
- global preventive status;
- overall risk calculation;
- module priority ordering;
- CCR <-> Mama clinical inference.

## Gate

A6 is green only if:

- inherited A0-A5 tests remain green;
- CCR and Mama each expose an explicit return action only within their result region;
- each return action derives its receipt through that domain's existing evaluator/presenter/adapter;
- the Shell consumes the receipt but imports no domain clinical evaluator/presenter/adapter;
- only the matching card renders the returned status;
- no cross-module ledger or global status is introduced;
- Shell typecheck/build and real-Chrome smoke remain green;
- affected domain build/browser gates remain green;
- V2 remains byte-for-byte preserved.

## Non-goals

No merge, deploy or public release. No persistence. No multi-module dashboard history. No clinical-rule changes. No report-provenance changes. No authorization for real-world clinical use.
