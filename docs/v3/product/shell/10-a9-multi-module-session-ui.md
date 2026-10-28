# A9 — Multi-module same-tab continuity UI

Status: **Draft / integration gate**

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

The bootstrap must not inspect `ledger.snapshots`, compare modules or derive cross-domain meaning.

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

Even when both cards have summaries, A9 must not show or derive:

- global preventive status;
- "all screening complete";
- overall risk;
- a combined attention score;
- priority ranking between CCR and Mama;
- eligibility in one module from the other module's result.

The user sees two independent module summaries, not one synthetic clinical conclusion.

## Gate

A9 is green only if:

- inherited A0-A8 gates remain green;
- Shell consumes A8 return into an A7 ledger;
- Shell sends the current ledger with the next A8 module handoff;
- CCR and Mama bootstraps consume A8 and keep the ledger opaque;
- both bootstraps return through A8 with only their own derived shallow snapshot;
- Shell renders each card from its own ledger entry;
- A6 explicit return behavior remains intact;
- no aggregate/global status is introduced;
- no persistence/network/URL state is introduced;
- Shell, CCR and Mama builds/browser gates remain green where triggered;
- V2 remains byte-for-byte preserved.

## Next phase after A9

After A9, the next useful work should focus on product validation of this full two-module journey in real Chrome, including a scripted CCR -> Shell -> Mama -> Shell scenario and screenshot evidence showing both independent summaries together.

That validation must not require merge, deploy or public release.
