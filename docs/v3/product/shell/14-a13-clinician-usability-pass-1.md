# A13 — Clinician usability pass 1

Status: **Draft / direct clinician feedback**

## Source of change

The first hands-on clinician review of the integrated A12 pilot identified four presentation issues:

1. the Shell hero title was visually oversized;
2. the `O que você quer revisar?` heading was also oversized;
3. Mama's safety questions were too vertically dispersed and required unnecessary scrolling;
4. Mama had the preferred visual language, while CCR looked like a different product.

A13 addresses only those observations. It does not change clinical logic, question semantics, rules, policies, derivations or shared-session contracts.

## Changes

### Shell

The main hero scale is reduced from the A1 display treatment to a more restrained product heading. The module-section heading is also reduced. Hero/section vertical spacing is tightened slightly so module discovery appears sooner.

### Mama

The seven tri-state safety questions are grouped into a two-column desktop grid with tighter card/button spacing. Below 700 px they return to one column and retain touch-friendly controls.

The question text, answer values, unknown semantics and progression logic are unchanged.

### CCR

CCR receives a presentation-only visual convergence layer based on the Mama pilot's design language:

- same neutral surface/border/shadow family;
- same burgundy accent family;
- 18 px card language;
- step sections read as individual cards rather than one large form slab;
- choice controls, focus treatment, buttons and result surface are visually harmonized.

The existing CCR DOM IDs, progressive interview behavior, result panel and clinical logic are preserved.

## Guardrails

A13 must not:

- change any clinical question or answer value;
- change policy selection or interpretation;
- change age/date derivation;
- change rules, intervals, risk handling or exam semantics;
- add persistence, analytics, network calls or patient identity;
- change A2-A12 shared-session contracts;
- merge, deploy or publish the pilot.

## Gate

A13 is green only if:

- the new presentation-only tests pass;
- inherited Foundation checks remain green;
- Shell browser screenshots show the reduced hierarchy;
- Mama browser screenshots/gates remain green with compact safety layout;
- the integrated A12 full-journey gate remains green after CCR visual convergence;
- V2 remains byte-for-byte preserved.

## Usability loop

A13 should remain a usability branch while the clinician continues testing. Additional feedback from the same hands-on pass should be accumulated here when it is presentation-only and low-risk, rather than prematurely freezing the UX after one observation set.
