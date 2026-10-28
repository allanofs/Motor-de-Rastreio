# Unified MOTOR Shell — A3 module context consumption

Status: **implementation candidate / stacked on A2**.

## Goal

Allow domain product layers to consume selected Shell-owned facts without moving clinical derivation into the Shell or creating cross-module inference.

Product principle remains: **unified externally; modular clinically**.

## Direction of data flow

A3 permits only:

`Shell shared session facts -> domain-local projection`

There is no write-back from CCR or Mama to shared session context. There is no CCR -> Mama or Mama -> CCR path.

## Facts consumed

Only the A2 facts are admitted:

- evaluation date;
- birth date.

Each domain independently projects:

- `asOf` from the shared evaluation date;
- completed `ageYears` from shared birth date + evaluation date.

The Shell itself does not derive age.

## Provenance and unknown state

A known `asOf` remains explicitly sourced from `shared.evaluationDate`.

Derived age declares both inputs as sources. If birth date or evaluation date is unknown, the domain projection remains unavailable with the original unknown reason represented in the failure reason. A future birth date fails safely as `invalid_shared_date_relation`.

## Explicit non-goals

A3 does not:

- select or interpret a policy;
- evaluate eligibility;
- classify risk;
- derive screening intervals;
- evaluate FIT, colonoscopy or mammography;
- copy module answers into shared state;
- create a global preventive status;
- persist patient data;
- create a patient/session identifier;
- add backend, analytics or network transmission;
- connect the Shell UI to clinical evaluation automatically;
- modify CCR or Mama clinical rules.

## User correction

The shared facts remain the source facts. A corrected shared birth/evaluation date produces a new domain projection when explicitly projected again; A3 stores no derived age and therefore has no stale shared derived value to reconcile.

## UI boundary

A3 is deliberately product-contract only. The existing CCR and Mama Guided Interview UIs are not changed to auto-fill from Shell state in this phase. UI/session wiring, if pursued, requires a separate gate so navigation lifecycle and correction behavior can be tested in real Chrome without weakening privacy or domain isolation.

## Gate

A3 must keep all inherited A0-A2 gates green and add tests proving:

1. independent CCR and Mama projections;
2. provenance for shared inputs;
3. explicit unknown propagation;
4. safe failure for invalid date relation;
5. no write-back to Shell context;
6. no policy/eligibility/risk/screening-status leakage into the projection.

No merge, deploy, public release or real-world clinical-use authorization is implied.
