# A11 — Reuse shared factual context across modules in the same tab journey

Status: **GREEN / FROZEN / Draft PR**

## Objective

Wire the frozen A10 return contract into Shell, CCR and Mama so global facts already supplied in the current tab journey do not need to be re-entered from scratch before the next module.

The reused facts remain only evaluation/reference date and birth date. Age remains a deterministic module-local derivation.

## Shell behavior

When an A10 return is present, the Shell restores the A7 shallow module ledger and the A2 shared factual context.

Opening another module still shows the context dialog, but known values are prefilled. The dialog explicitly says the context was already informed in this session and can be reviewed/corrected before continuing.

This keeps reuse visible and user-correctable rather than silently propagating facts.

## Provenance behavior

If a prefilled value is unchanged, its existing provenance is preserved. Edited known values become `user_supplied`.

If a previously known birth date is explicitly cleared, it becomes `unknown/not_available`. If an already-unknown birth date remains untouched, its prior unknown reason is preserved.

## Module behavior

CCR and Mama still consume A8 module-bound handoff and derive age only inside their own product boundary.

On explicit `Voltar ao MOTOR`, a module with shared context uses A10 to return that same context + shallow ledger + its own shallow snapshot. Legacy/no-context entry can still fall back to the A8 shallow return.

Neither module inspects another module's ledger entry.

## Privacy and safety

A11 adds no persistence or patient profile. Context exists only in current page memory and the single-use same-tab navigation carrier.

No sex/gender inference, symptoms, risk answers, history, exam data, identifiers, clinical traces, global preventive status, combined risk or cross-module clinical inference is added.

## Final gate

The A11 implementation gate passed at HEAD `4b084f29f1694aea8076563c4d1bf35fa4d455dd` before this documentation-only freeze commit:

- inherited `npm run check`: green;
- A11 prefill/provenance/return tests: green as part of the full suite;
- V2 byte-for-byte preservation: green;
- Shell typecheck/build: green;
- Shell real-Chrome DOM/navigation smoke: green;
- Shell desktop/mobile screenshots + evidence upload: green;
- Mama build: green;
- Mama real-Chrome responsive/keyboard/privacy gate: green on retry;
- Mama local report-export gate: green on retry;
- Mama evidence upload: green.

The first Mama browser attempt failed before page validation because Chrome DevTools did not become reachable within the gate timeout (`fetch failed`). No code change was made; the exact job was rerun and the browser/privacy and report-export gates passed.

## Freeze rule

A11 is frozen as visible, editable reuse of only the authorized shared factual context within one tab journey. Later phases must not broaden shared facts, persist them, infer identity or add cross-module clinical meaning without a new explicit contract and gate.

## Next phase after A11

A12 should perform the real-Chrome full journey validation:

`Shell -> CCR -> Shell -> Mama -> Shell`

The gate should verify that the second module receives the same shared dates without re-entry, that both shallow module summaries coexist at the end, and that no combined status is rendered.

No merge, deploy or public release is authorized by A11.
