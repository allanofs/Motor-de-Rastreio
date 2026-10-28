# A6 — Explicit module return to Unified MOTOR Shell

Status: **GREEN / FROZEN / Draft PR**

## Objective

Wire the frozen A5 shallow outcome receipt into the pilot experience:

`Shell -> selected module -> current module evaluation -> explicit "Voltar ao MOTOR" -> Shell card for that same module`

A6 improves continuity without creating a patient dashboard, cross-module inference or persistent history.

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

This limitation is intentional: persistence or a multi-module session ledger requires a separate architecture/privacy contract.

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

## Final gate

The A6 implementation gate passed at HEAD `50e3ecc745506bff7cb6c46df79b90ecb6a61bb8` before this documentation-only freeze commit:

- inherited `npm run check`: green;
- A6 Shell/domain boundary tests: green as part of the full suite;
- V2 byte-for-byte preservation: green;
- Shell TypeScript typecheck: green;
- Shell Vite build: green;
- Shell real-Chrome DOM/navigation smoke: green;
- Shell desktop/mobile screenshot capture: green;
- Shell evidence upload: green;
- Mama pilot build: green;
- Mama real-Chrome responsive/keyboard/privacy gate: green on retry;
- Mama real-Chrome local report-export gate: green on retry;
- Mama browser evidence upload: green.

The first Mama browser attempt failed before page validation because the Chrome DevTools endpoint did not become reachable within the gate timeout (`fetch failed`). No code change was made for that infrastructure-only failure. The exact job was rerun and the responsive/keyboard/privacy and report-export gates both passed.

## Freeze rule

A6 is frozen as an ephemeral one-module-at-a-time return experience. Later phases must not introduce a multi-module ledger, persistence, global preventive status, cross-module clinical inference or broader return payload without a new explicit architecture/privacy contract and gate.

## Next architectural decision

The next meaningful product step is no longer a simple UI continuation. A multi-module session view would require deciding whether the MOTOR should retain more than one shallow module snapshot during the same tab session. That decision should be handled as a separate architecture phase before implementation.

## Non-goals

No merge, deploy or public release. No persistence. No multi-module dashboard history. No clinical-rule changes. No report-provenance changes. No authorization for real-world clinical use.
