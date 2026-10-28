# Unified MOTOR Shell — Architecture A0

Status: **Draft architecture / implementation skeleton**  
Branch: `v3-unified-motor-shell-architecture`  
Base: `v3-mama-report-export`

## 1. Product decision

The MOTOR should be **unified externally and modular internally**.

The user should experience one product surface, while each clinical domain remains an independently governed module with its own:

- acquisition contract;
- clinical rules and resolvers;
- safety precedence;
- automation-boundary derivation;
- presentation details;
- provenance;
- report generation;
- clinical review lifecycle.

This phase does **not** create a universal clinical engine above CCR and Mama.

## 2. What is now legitimately shared

CCR and Mama independently demonstrated the same eight product-level automation-boundary codes:

1. `CANNOT_CONCLUDE_SAFELY`
2. `SPECIFIC_ATTENTION_REQUIRED`
3. `SPECIFIC_CARE_ACTIVE`
4. `MORE_INFORMATION_NEEDED`
5. `SHARED_DECISION`
6. `ROUTINE_DUE`
7. `ROUTINE_CURRENT`
8. `SCREENING_NOT_INDICATED`

The vocabulary is therefore promoted to a **shared product contract** in `src/product/shell/contracts.ts`.

This is deliberately **not Foundation**. The engine states and clinical meaning remain deeper and domain-owned.

## 3. What is explicitly NOT shared

The Shell must not know or derive:

- age thresholds;
- screening intervals;
- FIT/colonoscopy logic;
- mammography logic;
- BI-RADS or any diagnostic interpretation;
- family-history algorithms;
- high-risk definitions;
- raw clinical facts;
- `TrackEvaluation`;
- `DecisionTrace`;
- rule IDs;
- source IDs or evidence locators;
- Mama `decisionContext` internals;
- report provenance internals.

The Shell must also not create a generic `deriveMotorAutomationBoundary()` function. Boundary derivation remains `deriveCcrAutomationBoundary()` and `deriveMamaAutomationBoundary()`.

## 4. Shell-facing contract

A module exports a shallow descriptor and can project its domain presentation into a `MotorModuleSnapshot`.

The snapshot contains only:

- module identity and label;
- ruleset version;
- release gate;
- selected policy label;
- shared boundary code;
- whether the domain reports attention;
- count/presence of pending requested inputs;
- a short shell surface (`title` + `detail`).

No patient-level clinical detail is transported into the Shell snapshot.

## 5. Domain adapters

### CCR

`src/product/ccr/shellAdapter.ts`

CCR uses the shared boundary vocabulary but keeps its existing clinical derivation. Its shell surface uses generic wording for the shared boundary code.

### Mama

`src/product/mama/shellAdapter.ts`

Mama also uses the shared vocabulary, but preserves its domain-reviewed `surface` text. This is essential for cases such as `<40` under the international policy, where `SCREENING_NOT_INDICATED` may need to remain visibly qualified as **outside the formal scope of the recommendation**, rather than be rewritten as a formal recommendation against screening.

## 6. Module registry

`src/product/shell/registry.ts` currently registers:

- `ccr` — Câncer colorretal;
- `mama` — Câncer de mama.

The registry is a product-discovery mechanism, not a clinical dispatcher.

Adding a future module should require:

1. an independently governed clinical/product module;
2. a shell descriptor;
3. an adapter to the shallow snapshot contract;
4. shell architecture tests;
5. no modification of existing module clinical logic unless independently justified.

## 7. Ownership boundary

```text
                         MOTOR SHELL
                discovery / navigation / summary
                           |
             shared shallow product vocabulary
                           |
          +----------------+----------------+
          |                                 |
       CCR module                        Mama module
          |                                 |
 acquisition                         acquisition
 rules/resolvers                     rules/resolvers
 boundary derivation                 boundary derivation
 presentation                        presentation
 provenance/report                   provenance/report
          |                                 |
          +---------------+-----------------+
                          |
                  shell snapshot only
```

The direction is intentionally restrictive: the Shell consumes a projection from each module; it does not reach downward to inspect rules or reconstruct clinical meaning.

## 8. No global clinical aggregation yet

This phase does **not** define a single clinical status such as:

- “preventive care complete”;
- “all screenings up to date”;
- “overall risk low/high”.

Such an aggregate could become clinically misleading when one module is incomplete, out of scope, in specific care, or governed by a different policy family.

A future dashboard may display module cards side by side, but any cross-module aggregation requires its own explicit semantics and safety review.

## 9. Privacy and state

The Shell architecture does not introduce:

- patient persistence;
- shared cross-module patient storage;
- analytics;
- network transmission;
- automatic copying of clinical facts between domains.

Cross-module reuse of facts may be studied later, but only through explicit typed facts and provenance-safe semantics. It is not assumed merely because two modules ask superficially similar questions.

## 10. Release/lifecycle

Both current module descriptors remain `pilot_internal` and expose the existing integration-only release gate through their snapshots.

The existence of a unified Shell contract does not authorize:

- real-world clinical use;
- deployment;
- public release;
- merge to `main`;
- bypass of domain clinical review.

## 11. Gate for A0

Architecture A0 is considered green only if:

- all existing CCR and Mama tests remain green;
- both modules compile against the shared boundary vocabulary;
- shell snapshots from CCR and Mama have the same shallow shape;
- Mama can preserve domain-specific surface nuance;
- the shared Shell contract has no imports from clinical, engine or model layers;
- tests prove no track/rule/provenance/decision-context internals leak into the snapshot;
- V2 remains byte-for-byte preserved.

## 12. Next phase after A0

After A0 is green, the next phase may implement the first **Unified MOTOR Shell UI**:

- one landing surface;
- module cards for CCR and Mama;
- module-level status summaries only when a current module evaluation exists;
- navigation into each existing guided interview;
- no combined clinical inference;
- no shared patient persistence;
- no replacement of the existing domain UIs.
