# A7 — Ephemeral multi-module shallow snapshot ledger

Status: **GREEN / FROZEN / Draft PR**

## Objective

Define whether Unified MOTOR may remember more than one module result during the same tab session without becoming a patient record, a clinical aggregator or a persistent dashboard.

A7 answers **yes, but only for the existing shallow `MotorModuleSnapshot` projections and only under an explicitly ephemeral lifecycle**.

A7 is contract-only. It does not yet transport the ledger between pages and does not change the Shell UI.

## Product meaning

The ledger is a product-continuity structure, not a clinical state model.

It may hold at most one current shallow snapshot for each registered module:

- `ccr`;
- `mama`.

Each entry keeps exactly the meaning already authorized by A0/A5. Storing two entries side by side does not create a third, combined clinical conclusion.

## Lifecycle

The ledger declares `lifecycle: tab_ephemeral`.

For A7 this means:

- in-memory value only;
- no persistence API;
- no browser carrier yet;
- no URL/query/fragment state;
- no backend;
- no analytics;
- no patient identifier;
- no longitudinal record.

A later phase must explicitly define and gate any same-tab transport needed to carry the ledger across Shell/module page navigation.

## Allowed content

Only `MotorModuleSnapshot` entries already authorized for the Shell:

- module identity/label;
- ruleset version;
- release gate;
- policy label;
- shared automation-boundary code;
- attention flag;
- pending-input count/presence;
- short reviewed Shell surface.

Runtime extra properties are stripped when a snapshot enters the ledger.

## Forbidden content

The ledger must not contain:

- shared raw facts such as birth date or evaluation date;
- age;
- symptoms or risk answers;
- screening history;
- exam/result details;
- FIT/colonoscopy/mammography details;
- rule IDs, source IDs, `TrackEvaluation` or `DecisionTrace`;
- report provenance internals;
- Mama decision-context internals;
- any patient identifier;
- timestamps used to create clinical priority;
- global preventive status;
- aggregate risk;
- cross-module recommendation or priority.

## Update semantics

`upsertMotorEphemeralSessionSnapshot()` replaces only the entry whose `moduleId` matches the incoming shallow snapshot.

Updating CCR must not alter Mama. Updating Mama must not alter CCR.

Unknown module IDs are rejected. Unexpected ledger keys are not propagated when a new ledger value is produced.

The ledger can be explicitly cleared back to an empty immutable value.

## No aggregation rule

The presence of multiple snapshots must never be interpreted by the Shell as:

- "prevenção em dia";
- "todos os rastreamentos completos";
- overall risk;
- a single attention score;
- a clinical priority order;
- eligibility for another module;
- evidence that one module modifies another.

The Shell may eventually display independent module states side by side, but each remains a separate domain projection.

## Final gate

The A7 implementation gate passed at HEAD `b6abba4976d7aa3ed302d33090a07a2cc272df2b` before this documentation-only freeze commit:

- inherited `npm run check`: green;
- A7 ledger tests: green as part of the full suite;
- V2 byte-for-byte preservation: green;
- Shell TypeScript typecheck: green;
- Shell Vite build: green;
- real-Chrome DOM/navigation smoke: green;
- desktop/mobile screenshot capture: green;
- Shell evidence upload: green.

The gate specifically covers immutability, independent per-module replacement, strict registered-module scope, runtime extra-field stripping, removal of unexpected ledger keys, explicit clearing, no browser carrier/persistence/network/URL mechanism in A7, and absence of aggregate/global preventive state.

## Freeze rule

A7 is frozen as a pure product-continuity ledger contract. Later phases must not add raw patient facts, persistence, identifiers, timestamps for clinical priority, cross-module inference or global preventive status without a new explicit architecture/privacy contract and gate.

## Next phase after A7

A8 may define a same-tab transport protocol that carries this shallow ledger across Shell -> module -> Shell navigation.

A8 must keep clinical modules blind to the meaning of other modules' snapshots: ledger pass-through must be handled by shared product/navigation infrastructure, not by CCR or Mama clinical logic.

No persistence, merge, deploy or public release is authorized by A7.
