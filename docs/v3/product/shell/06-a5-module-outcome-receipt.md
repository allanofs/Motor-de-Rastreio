# A5 — Shallow module outcome receipt contract

Status: **Draft / architecture gate**

## Objective

Define the first safe module -> Shell return contract without turning the Unified MOTOR Shell into a clinical aggregator and without carrying raw patient facts back out of a domain.

A5 is intentionally contract-first. It does **not** yet add a "Voltar ao MOTOR" button or render returned module status in the Shell UI.

## Product rationale

A0 already defined `MotorModuleSnapshot` as the only reviewed shallow projection that the Shell may consume. A1 created the unified landing surface. A2-A4 created the opposite direction: a minimal, ephemeral Shell -> selected-module context handoff.

The next product capability is to let a completed/current domain evaluation eventually return its already-reviewed shallow snapshot to the Shell. That must happen without exporting the domain's clinical internals.

## Allowed return payload

A5 permits only the existing `MotorModuleSnapshot` fields:

- module identity and label;
- ruleset version;
- release gate;
- selected policy label;
- shared automation-boundary code;
- attention flag;
- pending-input count/presence;
- reviewed short Shell surface (`title` + `detail`).

The receipt does not add new clinical meaning. Each module remains solely responsible for deriving its own snapshot through its existing domain adapter.

## Forbidden return payload

The receipt must not contain:

- birth date, age or evaluation date;
- symptoms or risk answers;
- screening history;
- exam/result data;
- FIT, colonoscopy or mammography details;
- rule IDs or source IDs;
- `TrackEvaluation` or `DecisionTrace`;
- report provenance internals;
- Mama `decisionContext` internals;
- raw patient facts of any kind;
- cross-module status or global preventive status.

Runtime extra properties are stripped on encoding, and unexpected fields are rejected on consumption.

## Carrier semantics

The pure A5 contract uses a dedicated MOTOR-prefixed single-use envelope compatible with the same-tab `window.name` boundary already validated in A4.

Rules:

1. target is always `shell`;
2. only `ccr` and `mama` module IDs are accepted;
3. only the shared reviewed boundary vocabulary is accepted;
4. malformed MOTOR outcome envelopes fail closed and are cleared;
5. unrelated pre-existing `window.name` content is preserved;
6. no URL/query/fragment transport;
7. no localStorage, sessionStorage, IndexedDB, cookies or backend is introduced.

A5 defines the transport contract only. Browser wiring belongs to a later integration phase.

## No aggregation

Receiving a module snapshot does not authorize the Shell to infer:

- "prevenção em dia" globally;
- "todos os rastreamentos completos";
- overall risk;
- priority between modules;
- eligibility in another module;
- any cross-domain clinical conclusion.

A future Shell UI may display module cards side by side, but each card must remain an independent domain projection.

## Gate

A5 is green only if:

- all inherited A0-A4 tests/builds remain green;
- valid shallow snapshots round-trip through the receipt contract;
- the carrier is single-use for MOTOR outcome envelopes;
- unrelated `window.name` values are preserved;
- malformed envelopes fail closed;
- unknown module IDs and boundary codes are rejected;
- inconsistent pending-input metadata is rejected;
- runtime extra properties are stripped during encoding;
- unexpected/deep fields are rejected during consumption;
- no patient facts are introduced into URLs or durable storage;
- V2 remains byte-for-byte preserved.

## Next phase after A5

Only after this contract is green may a later phase wire an explicit module -> Shell return action and render the returned snapshot on the corresponding module card. That integration must remain ephemeral and module-local in meaning; persistence, a cross-module session ledger and global preventive aggregation remain separate decisions requiring their own contracts.
