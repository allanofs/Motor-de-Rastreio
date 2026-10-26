# Report Foundation R3

Status: **active, Draft-only**.

This phase extracts only report infrastructure already proven by the CCR R0–R2 implementation. The validated CCR report remains the behavioral reference.

## Scope

Reusable infrastructure:

- governed evidence/provenance resolution;
- report model primitives that are not clinically specific;
- safe HTML/A4 utilities already proven in the CCR renderer.

Module-specific responsibilities remain outside this package:

- clinical input snapshots;
- clinical labels and rationale;
- screening-specific actions;
- clinical rules and source selection;
- product-specific export eligibility decisions.

## Constraints

- no clinical-rule changes;
- no engine/model changes;
- no merge to `main`;
- no deploy or public release;
- no patient persistence or network transport;
- no speculative generic clinical ontology.
