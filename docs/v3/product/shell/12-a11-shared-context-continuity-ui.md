# A11 — Reuse shared factual context across modules in the same tab journey

Status: **Draft / integration gate**

## Objective

Wire the frozen A10 return contract into Shell, CCR and Mama so global facts already supplied in the current tab journey do not need to be re-entered from scratch before the next module.

The reused facts remain only:

- evaluation/reference date;
- birth date.

Age remains a deterministic module-local derivation.

## Shell behavior

When an A10 return is present, the Shell restores:

- the A7 shallow module ledger;
- the A2 shared factual context.

Opening another module still shows the context dialog, but known values are prefilled. The dialog explicitly says the context was already informed in this session and can be reviewed/corrected before continuing.

This keeps reuse visible and user-correctable rather than silently propagating facts.

## Provenance behavior

If a prefilled value is unchanged, its existing provenance is preserved.

If the evaluation date is changed, the new value becomes `user_supplied`.

If birth date is changed, the new known value is `user_supplied`.

If a previously known birth date is explicitly cleared, it becomes `unknown/not_available`; it is not silently converted to another value.

If an already-unknown birth date remains untouched, its prior unknown reason is preserved.

## Module behavior

CCR and Mama still consume A8 module-bound handoff and derive age only inside their own product boundary.

On explicit `Voltar ao MOTOR`:

- if shared context exists, the module uses A10 to return that same context + shallow ledger + its own shallow snapshot;
- legacy/no-context entry can still fall back to the A8 shallow return.

Neither module inspects another module's ledger entry.

## Privacy and safety

A11 adds no persistence or patient profile. Context exists only in the current page memory and single-use same-tab navigation carrier.

No sex/gender inference, symptoms, risk answers, history, exam data, identifiers, clinical traces, global preventive status, combined risk or cross-module clinical inference is added.

## Gate

A11 is green only if:

- inherited A0-A10 gates remain green;
- Shell restores A10 context + ledger;
- known context values prefill the next dialog;
- context reuse is visibly disclosed and editable;
- unchanged provenance is preserved;
- edited values become user-supplied;
- explicit birth-date clearing becomes unknown/not-available;
- CCR and Mama return through A10 when context exists;
- legacy A8 fallback remains available when context is absent;
- modules do not inspect other ledger entries;
- no persistence/network/URL/aggregation is introduced;
- Shell/Mama browser gates and Foundation gate remain green;
- V2 remains byte-for-byte preserved.

## Next phase after A11

A12 should perform the real-Chrome full journey validation:

`Shell -> CCR -> Shell -> Mama -> Shell`

The gate should verify that the second module receives the same shared dates without re-entry, that both shallow module summaries coexist at the end, and that no combined status is rendered.

No merge, deploy or public release is authorized by A11.
