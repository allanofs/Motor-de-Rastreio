# A4 — Ephemeral Guided Interview context handoff

Status: **GREEN / FROZEN / Draft PR**

## Objective

Carry the two A2 global session facts from the Unified MOTOR Shell into the selected Guided Interview without turning the Shell into a clinical engine and without creating durable patient storage.

## Data flow

`Shell module selection -> progressive context form -> single-use same-tab handoff -> selected domain adapter -> local Guided Interview inputs`

Allowed shared facts remain only:

- evaluation date;
- birth date, when voluntarily supplied.

The Shell does not derive age. CCR and Mama independently derive completed age through their A3 domain adapters.

The context form is progressively disclosed only after the user chooses a module; the initial landing surface remains free of patient-input fields.

## Carrier and lifecycle

A4 uses `window.name` only as a transient navigation envelope because the pilots are separate static pages. The envelope:

1. is written immediately before same-tab navigation;
2. is not placed in query parameters or URL fragments;
3. is not written to localStorage, sessionStorage, IndexedDB, cookies or a backend;
4. is cleared before parsing/projection on the destination page;
5. is target-bound (`ccr` or `mama`) and rejected if delivered to the wrong module;
6. fails closed for malformed versions, facts or dates.

Unrelated pre-existing `window.name` content is not touched. A MOTOR-prefixed envelope is always cleared on attempted consumption, including malformed or mismatched envelopes.

## Correction semantics

The handoff is one-way. Once the destination module consumes it, the prefilled `asOf` and `ageYears` become ordinary module-local inputs. A user may correct them locally. Corrections do not write back to the Shell and do not propagate to another domain.

Returning to the Shell may restore its form through normal browser in-memory navigation behavior, but A4 does not create storage to guarantee restoration.

## Explicit non-goals

A4 does not:

- share policy selection, screening history, symptoms, risk answers, exams, availability or results;
- create CCR <-> Mama communication;
- create module -> Shell write-back;
- persist patient data;
- encode patient facts in URLs;
- add analytics, identifiers or network transmission;
- alter clinical rules or evidence;
- infer anatomy, sex/gender, risk, eligibility or screening status from birth date;
- authorize clinical or public use.

## Final gate

A4 preserved the inherited A0-A3 boundaries and passed the integration gate at HEAD `86d2c1bb21c599509ff8208f4bbfc746a53b53d8` before this documentation-only freeze commit:

- Foundation workflow: green;
- V2 byte-for-byte preservation: green;
- Mama browser gate: green;
- Unified MOTOR Shell browser gate: green;
- Shell TypeScript typecheck: green;
- Shell Vite build: green;
- real-Chrome DOM/navigation lifecycle: green;
- desktop/mobile evidence capture: green;
- single-use and target-bound handoff tests: green;
- malformed/invalid context safe failure: green;
- no patient facts in URL or durable browser storage: preserved.

The first A4 browser run exposed a TypeScript DOM typing incompatibility for the birthday autocomplete value. The implementation was corrected without weakening the contract, and the rerun passed.

## Freeze rule

A4 is frozen as the first validated one-way Shell-to-module context transport. Later phases must not broaden the shared fact set, add persistence, introduce module-to-Shell write-back, or create cross-module clinical inference without a new explicit contract and gate.
