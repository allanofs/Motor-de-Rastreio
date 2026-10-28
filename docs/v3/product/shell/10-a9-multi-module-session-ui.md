# A9 — Multi-module same-tab continuity UI

Status: **GREEN / FROZEN / Draft PR**

## Objective

Wire the frozen A8 same-tab transport into the pilot journey so the Unified MOTOR Shell can retain and display independent shallow results for both CCR and Mama during one continuous tab journey.

Target flow:

`Shell -> CCR -> Shell with CCR summary -> Mama -> Shell with CCR + Mama summaries`

The two summaries remain clinically independent. A9 does not create a combined preventive conclusion.

## Shell behavior

On load, the Shell:

1. consumes an A8 Shell-return envelope when present;
2. otherwise starts with an empty A7 ledger;
3. retains A6 legacy single-outcome compatibility as a fallback;
4. renders each card from `sessionLedger.snapshots[module.id]` only;
5. labels a module with a returned snapshot as `Revisar avaliação`;
6. leaves modules without a snapshot as `Iniciar avaliação`.

When the user opens a module, the Shell places the current shallow ledger together with the A4 shared factual context into the A8 single-use handoff.

## Module bootstrap behavior

CCR and Mama shared bootstrap code may:

- consume the A8 handoff for its own target;
- keep the returned ledger as an opaque pass-through value;
- use only the shared context projection belonging to that domain;
- derive the current domain's own shallow snapshot through its existing evaluator/presenter/adapter;
- call the shared A8 return encoder with the opaque ledger + current snapshot.

The bootstrap does not inspect `ledger.snapshots`, compare modules or derive cross-domain meaning.

## Compatibility

A9 keeps narrow compatibility with the earlier A4/A5 carriers:

- a module can still consume an A4 context handoff if no A8 handoff exists;
- the Shell can still consume one legacy A5 outcome receipt if no A8 Shell-return ledger exists.

Compatibility does not authorize broader payloads or persistence.

## Privacy and lifecycle

The journey remains same-tab and ephemeral:

- no localStorage/sessionStorage/IndexedDB/cookies;
- no URL query or fragment state;
- no backend;
- no analytics;
- no patient identifier;
- no longitudinal record.

The `window.name` channel is only a single-use navigation carrier. A8 consumes recognized envelopes on arrival. The Shell page holds the reconstructed shallow ledger only in memory until the next navigation.

## No aggregation rule

Even when both cards have summaries, A9 does not show or derive:

- global preventive status;
- "all screening complete";
- overall risk;
- a combined attention score;
- priority ranking between CCR and Mama;
- eligibility in one module from the other module's result.

The user sees two independent module summaries, not one synthetic clinical conclusion.

## Final gate

The A9 implementation gate passed at HEAD `1981e968ef02e7874774d18a27a8acb84d27b539` before this documentation-only freeze commit:

- inherited `npm run check`: green;
- A9 multi-module continuity tests: green as part of the full suite;
- V2 byte-for-byte preservation: green;
- Shell typecheck/build: green;
- Shell real-Chrome DOM/navigation smoke: green;
- Shell desktop/mobile screenshots + evidence upload: green;
- Mama pilot build: green;
- Mama real-Chrome responsive/keyboard/privacy gate: green;
- Mama real-Chrome local report-export gate: green;
- Mama browser evidence upload: green;
- Foundation gate continues to cover CCR pilot typecheck/build.

## Freeze rule

A9 is frozen as same-tab, multi-module continuity of shallow independent summaries. Later phases must not add persistence, patient identity, cross-module clinical inference, combined status/score or broader payloads without a new explicit architecture/privacy contract and gate.

## Next phase after A9

A10 should validate the full two-module journey in real Chrome with a scripted CCR -> Shell -> Mama -> Shell scenario and screenshot evidence showing both independent summaries together.

That validation must not require merge, deploy or public release.
