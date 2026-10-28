# Unified MOTOR Shell — A1 UI Gate

Status: **GREEN / REAL-CHROME VALIDATED / SCREENSHOT INSPECTED / DRAFT**  
Branch: `v3-unified-motor-shell-ui`  
Base: `v3-unified-motor-shell-architecture`

## 1. Product result

A1 implements the first unified external entry surface for the MOTOR while preserving the A0 invariant: **unified externally; modular internally**.

The landing surface shows the currently registered modules:

- Câncer colorretal;
- Câncer de mama.

Each card navigates to the existing independent Guided Interview for that module. The Shell does not collect patient data and does not evaluate clinical rules.

## 2. UI ownership boundary

The unified landing page owns only:

- product identity;
- module discovery;
- module descriptions;
- navigation;
- general explanation of MOTOR safety principles.

It does not own:

- age cutoffs or screening intervals;
- clinical facts;
- FIT, colonoscopy or mammography logic;
- policy interpretation;
- shared patient state;
- cross-module inference;
- a global preventive status.

Cards are rendered from the A0 module registry rather than from duplicated module metadata in the UI.

## 3. Privacy/state

A1 introduces no form fields and no patient state in the Shell. Static tests reject persistence/network primitives in the Shell entry script. No automatic patient-data sharing occurs between CCR and Mama.

## 4. Functional gate

Final A1 implementation gate:

- schema checks: **62/62**;
- test files: **63/63**;
- tests: **710/710**;
- A0 Shell architecture tests: **6/6**;
- new A1 Shell UI tests: **5/5**;
- Foundation typecheck: green;
- CCR pilot typecheck: green;
- Mama pilot typecheck: green;
- Foundation build: green;
- CCR pilot build: green;
- Mama pilot build: green;
- V2 byte-for-byte preserved.

Dedicated A1 Shell gate:

- Shell typecheck: green;
- Shell Vite build: green;
- real Chrome DOM smoke: green;
- both module labels present after JavaScript execution;
- both module navigation links present;
- desktop screenshot generated at 1440×1000;
- mobile screenshot generated at 390×844.

## 5. Visual inspection

The real-Chrome desktop and mobile captures were inspected after the gate.

Desktop:

- clear MOTOR identity and hierarchy;
- CCR and Mama cards have equal visual weight;
- primary actions are visually explicit;
- no clipping or horizontal overflow visible;
- module independence is explained without making the interface feel fragmented.

Mobile:

- headline and explanatory text remain readable;
- layout collapses to one column;
- module content continues below the first viewport as expected;
- no blocking layout defect observed.

## 6. Non-goals / non-authorization

A1 does not introduce a combined clinical evaluation, global status, cross-module fact reuse, persistence, analytics, deployment or public release. Existing domain pilots remain the clinical interaction surfaces.

No merge to `main`, deploy or real-world clinical-use authorization is implied.

## 7. Next candidate phase

A2 may study **shared session context without shared clinical inference**: which facts are truly global and safe to collect once (for example evaluation date or explicitly represented demographics) versus which must remain domain-owned. This requires a new contract/gate before any cross-module reuse is implemented.
