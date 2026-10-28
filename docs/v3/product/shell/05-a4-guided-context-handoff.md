# A4 — Ephemeral Guided Interview context handoff

Status: **Draft / integration gate**

## Objective

Carry the two A2 global session facts from the Unified MOTOR Shell into the selected Guided Interview without turning the Shell into a clinical engine and without creating durable patient storage.

## Data flow

`Shell form -> single-use same-tab handoff -> selected domain adapter -> local Guided Interview inputs`

Allowed shared facts remain only:

- evaluation date;
- birth date, when voluntarily supplied.

The Shell does not derive age. CCR and Mama independently derive completed age through their A3 domain adapters.

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

## Required gate

A4 must preserve all inherited A0-A3 tests and builds and add checks for single-use consumption, target binding, malformed-envelope safe failure, invalid-date safe failure, unknown propagation and URL/storage boundaries. Real-Chrome validation should confirm Shell -> CCR and Shell -> Mama prefill, carrier clearing after entry, correction remaining local, and no patient facts in the address bar.
