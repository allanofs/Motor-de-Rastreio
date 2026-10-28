# A8 — Same-tab transport for shared context + shallow module ledger

Status: **GREEN / FROZEN / Draft PR**

## Objective

Define a single-use same-tab transport protocol that can carry:

1. the frozen A4 shared factual context to the selected module; and
2. the frozen A7 shallow multi-module ledger as opaque product-continuity state.

On return, the protocol may add/replace only the current module's shallow snapshot before returning the ledger to the Shell.

A8 is contract-only. It does not yet wire the pilot pages to this new transport and does not change visible UI.

## Composition instead of new clinical parsing

A8 composes previously frozen contracts rather than inventing new clinical structures:

- A4 `MotorNavigationHandoff` validates/sanitizes the shared context;
- A5 `MotorModuleOutcomeReceipt` validates/sanitizes each shallow snapshot;
- A7 `MotorEphemeralSessionLedger` owns independent per-module replacement.

The A8 envelope carries nested outputs of those contracts. This keeps the transport layer shallow and avoids a second interpretation of clinical meaning.

## Module-bound handoff

The Shell may encode:

- target module (`ccr` or `mama`);
- sanitized A4 context handoff;
- zero, one or two sanitized A5 shallow snapshot receipts.

The shared A8 consumer validates the target, consumes the nested A4 context and reconstructs the A7 ledger from nested A5 receipts.

Duplicate receipts for the same module are rejected as ambiguous state.

## Shell-bound return

The shared A8 return encoder receives:

- the opaque A7 ledger carried through the current page; and
- the current module's own `MotorModuleSnapshot`.

It uses the A7 upsert rule to replace only that module's entry and encodes the resulting shallow ledger for the Shell.

The clinical module does not inspect, compare or derive meaning from other modules' snapshots.

## Single-use carrier semantics

A8 uses a dedicated MOTOR-prefixed envelope compatible with same-tab `window.name` transport.

Rules:

- unrelated `window.name` content is preserved;
- a recognized MOTOR A8 envelope is cleared before parsing;
- malformed or target-mismatched MOTOR envelopes fail closed;
- no query string or URL fragment is used;
- no durable browser storage is introduced.

The browser wiring itself remains a later integration step.

## Privacy boundary

A8 must not introduce:

- raw clinical facts beyond the already-frozen A4 context (`evaluationDate`, `birthDate`);
- age in the Shell;
- symptoms/risk answers/history/exam details;
- rule/source IDs or traces;
- report provenance internals;
- patient identifiers;
- timestamps for clinical prioritization;
- persistence, backend or analytics;
- global preventive status or aggregate risk.

Runtime extras in context or snapshots are removed by composition through the frozen A4/A5 contracts before transport.

## Clinical blindness rule

The transport lives under `src/product/shell` and does not import CCR or Mama evaluators, presenters, rules or clinical adapters.

Later pilot integration may pass the ledger through module bootstrap code, but the domain's clinical logic must remain blind to other modules' entries.

## Final gate

The A8 implementation gate passed at HEAD `40a1f7d8b7c50c4cb9859af88f1fbdb3193a88e0` before this documentation-only freeze commit:

- inherited `npm run check`: green;
- A8 transport tests: green as part of the full suite;
- V2 byte-for-byte preservation: green;
- Shell TypeScript typecheck: green;
- Shell Vite build: green;
- real-Chrome DOM/navigation smoke: green;
- desktop/mobile screenshot capture: green;
- Shell evidence upload: green.

The gate covers sanitized context + ledger round-trip, current-module-only replacement, target/malformed safe failure, unrelated carrier preservation, duplicate receipt rejection, runtime-extra stripping, shared-infrastructure isolation and absence of persistence/network/URL/aggregate status.

## Freeze rule

A8 is frozen as the only authorized same-tab carrier for combined shared context + shallow ledger continuity. Later phases must not broaden its payload, add durable storage, identifiers, cross-module inference or global preventive status without a new explicit architecture/privacy contract and gate.

## Next phase after A8

A9 may wire the pilot pages to the new session transport and render multiple independent returned module statuses in the Shell.

A9 must not add a combined status, score, priority order or persistence. It is only continuity of already-authorized shallow per-module states within the same tab journey.

No merge, deploy or public release is authorized by A8.
