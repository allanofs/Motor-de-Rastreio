# Unified MOTOR Shell — A0 Gate

Status: **GREEN / FROZEN / DRAFT**  
Branch: `v3-unified-motor-shell-architecture`  
PR: #23

## Functional gate

Final A0 implementation gate:

- schema checks: **62/62**;
- test files: **62/62**;
- tests: **705/705**;
- new Shell architecture tests: **6/6**;
- Foundation typecheck: green;
- CCR pilot typecheck: green;
- Mama pilot typecheck: green;
- Foundation build: green;
- CCR pilot build: green;
- Mama pilot build: green;
- V2 byte-for-byte preserved;
- inherited Mama real-Chrome responsive/keyboard/privacy gate: green;
- inherited Mama real-Chrome local report-export gate: green.

## What A0 proved

1. CCR and Mama can share the eight product-level automation-boundary codes without sharing clinical derivation.
2. Both modules can project to the same shallow `MotorModuleSnapshot` shape.
3. The Shell contract has no clinical/engine/model imports.
4. Deep internals do not leak upward: no tracks, rule IDs, source IDs, provenance carrier, decision context or evaluation object in the snapshot.
5. Mama can preserve reviewed domain-specific surface nuance instead of being flattened by generic Shell language.
6. Existing domain tests and browser behavior remain unchanged.

## Frozen architecture invariant

**Unified externally; modular internally.**

The Shell owns discovery, navigation and shallow module summaries. Clinical modules own acquisition, evaluation, Boundary derivation, detailed presentation, provenance and reporting.

There is no generic clinical dispatcher and no `deriveMotorAutomationBoundary()`.

## Non-authorization

A0 does not authorize merge, deployment, public release or real-world clinical use.

## Next phase

A1 may implement the first Unified MOTOR Shell UI as a separate stacked Draft branch:

- one landing surface;
- CCR and Mama module cards;
- module launch/navigation;
- optional current shallow snapshot display;
- no global clinical status;
- no shared patient persistence;
- no cross-module clinical inference;
- existing domain pilots preserved as independent module experiences.
