# Unified MOTOR Shell — A2 Shared Session Context

Status: **IMPLEMENTED / CONTRACT-ONLY / DRAFT**  
Branch: `v3-unified-motor-shared-session-context`  
Base: `v3-unified-motor-shell-ui`

## 1. Purpose

A2 introduces a typed, ephemeral shared session context for facts that are genuinely global to the person/session, while preserving the architectural invariant:

**unified externally; modular clinically.**

A2 is deliberately contract-only. CCR and Mama do not consume this shared context yet.

## 2. Facts admitted in A2

Only two facts are admitted:

- evaluation date;
- birth date.

Both are factual inputs, not clinical interpretations.

Evaluation date may come from an explicit user entry or the local session clock. Birth date may only be marked as user supplied when known.

Unknown state is explicit and represented as one of:

- `not_asked`;
- `declined`;
- `not_available`.

A2 does not coerce unknown into a guessed value.

## 3. Explicitly excluded from A2

The shared context does not contain or derive:

- age;
- screening eligibility;
- screening intervals;
- risk classification;
- policy interpretation;
- module answers;
- FIT, colonoscopy or mammography state;
- track/rule/source IDs;
- automation boundaries;
- module snapshots;
- a global preventive status;
- cross-module clinical inference.

Sex/gender-related facts are intentionally deferred because their representation and clinical use require explicit product/clinical governance rather than opportunistic reuse.

## 4. Lifecycle and privacy

The A2 contract is marked `ephemeral`.

A2 adds no:

- persistence;
- localStorage/sessionStorage;
- IndexedDB;
- backend;
- analytics;
- network transmission;
- patient account;
- longitudinal profile.

There is no shared session identifier in the contract.

## 5. Date semantics

Dates use an ISO calendar representation (`YYYY-MM-DD`) and are runtime-validated as real calendar dates. The shared layer does not calculate age.

If a domain later needs age, the domain integration contract must define how it uses birth date and evaluation date without moving clinical eligibility logic into the Shell.

## 6. Immutability

The shared context and each fact record are frozen when created. Modules must treat the context as read-only input.

A later module integration must not mutate the global fact store as a side effect of domain evaluation.

## 7. A2 gate

A2 is considered structurally green only if:

- Foundation checks remain green;
- V2 remains byte-for-byte preserved;
- A0/A1 behavior remains green;
- the new context tests pass;
- explicit unknown is preserved;
- invalid dates are rejected;
- the context is immutable;
- serialized context contains no module-specific or derived clinical state.

## 8. Non-goals

A2 does not:

- change CCR or Mama clinical rules;
- inject shared facts into either Guided Interview;
- prefill module forms;
- eliminate repeated questions yet;
- merge module histories;
- create a patient profile;
- create a longitudinal record;
- deploy or authorize clinical use.

## 9. Next candidate phase

A3 may study **one-way, explicit module consumption** of selected shared facts.

A3 must answer, independently for each domain:

1. which shared fact the domain accepts;
2. how provenance is preserved;
3. how a user can override/correct it;
4. how unknown remains unknown;
5. whether the domain needs the raw fact or a deterministic non-clinical projection;
6. how domain clinical derivation remains fully local;
7. how no module writes derived facts back into shared context.

No A3 integration should be implemented until those contracts are explicit and separately tested.
