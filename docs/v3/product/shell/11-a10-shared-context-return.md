# A10 — Preserve shared factual context on module -> Shell return

Status: **Draft / architecture gate**

## Why A10 exists

A9 successfully preserves multiple shallow module summaries across one tab journey, but the A8 Shell-return envelope intentionally returns only the shallow ledger. That means `evaluationDate` and `birthDate` are no longer available when the Shell opens the next module, forcing the user to enter the same global facts again.

That is inconsistent with the product goal of a unified MOTOR in which explicit global facts can be reused while clinical interpretation remains module-local.

A10 fixes the continuity contract without adding persistence.

## Objective

Define a new single-use module -> Shell return envelope that carries:

- the same sanitized A2 shared factual context already received by the current module;
- the A8 shallow session return containing the current A7 ledger plus the current module's own shallow snapshot;
- the source module identity only for validation of the nested context and snapshot.

A10 is contract-only. Visible UI reuse belongs to the next integration phase.

## Composition

A10 does not create new patient facts or clinical parsers.

It composes:

- A4 navigation handoff to sanitize/validate `evaluationDate` and `birthDate`;
- A8 Shell return to sanitize/validate the shallow multi-module ledger;
- the source module ID to ensure the returned current snapshot belongs to the module that is returning.

If source module and current snapshot disagree, encoding is rejected.

## Lifecycle

The shared context remains:

- explicit;
- immutable;
- known/unknown aware;
- provenance-preserving;
- same-tab ephemeral;
- non-persistent.

Returning the context to the Shell does not create a patient profile or longitudinal record. It only allows the next navigation in the same tab journey to reuse facts already supplied in that journey.

## Privacy boundary

A10 adds no:

- sex/gender inference;
- age field in the Shell context;
- symptoms, risks, screening history or exam data;
- patient identifier;
- rule/source IDs or traces;
- report provenance internals;
- timestamps for clinical priority;
- localStorage/sessionStorage/IndexedDB/cookies;
- URL query/fragment state;
- backend, analytics or network transmission;
- global preventive status or cross-module clinical inference.

Runtime extra properties are removed by the frozen A4/A8 contracts before transport.

## Gate

A10 is green only if:

- inherited A0-A9 gates remain green;
- context + shallow ledger round-trip together to the Shell;
- an existing other-module snapshot is preserved while the current module is replaced;
- source-module/current-snapshot mismatch is rejected;
- runtime extra context/snapshot fields are absent from the carrier;
- malformed recognized envelopes fail closed and clear;
- unrelated `window.name` is preserved;
- no persistence/network/URL/aggregation is introduced;
- V2 remains byte-for-byte preserved.

## Next phase after A10

A11 may wire this return into Shell/CCR/Mama bootstraps. The Shell should prefill the next module's context dialog from the returned shared facts and allow explicit correction before navigation.

A11 must preserve provenance when a value is unchanged and mark an edited value as user-supplied. It must not silently derive or write clinical facts back into shared context.

No merge, deploy or public release is authorized by A10.
