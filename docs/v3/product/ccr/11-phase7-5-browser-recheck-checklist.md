# Phase 7.5 — Final browser recheck checklist

Use this checklist after pulling the latest `v3-ccr-product-boundary` branch.

## 1. Issue #10 — journey summary

Reproduce an upstream edit that hides the exam step after at least one exam had previously been registered.

Expected:

- the result becomes stale immediately;
- the hidden exam step is removed from `Até aqui` immediately;
- no stale `1 exame conhecido registrado` line remains while the exam step is outside the active route.

## 2. Issue #9 — technical ordering after hard exclusion

Use a hard route-changing condition (for example prior CRC) and expand `Detalhes técnicos`.

Expected:

- primary surface remains `Atenção específica`;
- the technical section/card that actually triggered the Boundary (special-risk / clinical-review path) appears before downstream non-trigger indeterminate tracks;
- downstream tracks remain available for audit; they are not deleted.

## 3. Keyboard/focus

Using only the keyboard:

- Tab moves through visible controls in a sensible order;
- Shift+Tab reverses the order;
- native radio groups respond to arrow keys;
- Space selects the focused radio/button;
- Enter activates buttons/forms where expected;
- focus ring is clearly visible;
- `Editar` moves focus into the edited step;
- `Concluir edição` leaves focus on the next useful control or Evaluate;
- add/remove exam keeps focus in a useful place;
- evaluation moves focus to the result panel;
- `Responder agora` moves focus to the requested strategy/resource control;
- `Detalhes técnicos` opens/closes from the keyboard;
- no focus trap occurs.

## 4. Responsive

Inspect approximately:

- desktop: 1440 px;
- tablet/narrow desktop: 768 px;
- mobile: 390 px.

Expected:

- desktop uses two-column form/result layout;
- below the tablet breakpoint, panels stack into one column;
- at mobile width, form/result grids collapse to one column;
- no horizontal overflow;
- radio/button labels wrap without clipping;
- sticky release banner does not cover active content;
- technical details remain readable.

## 5. Runtime privacy

Browser DevTools -> Application:

- Local Storage: no patient data;
- Session Storage: no patient data;
- IndexedDB: no patient data.

Browser DevTools -> Network during ordinary interaction:

- no analytics calls;
- no patient-data requests to external services;
- only local/static development traffic expected.

## Completion

If all five blocks pass, document the real-browser confirmation and Phase 7.5 can proceed to closure. If a defect appears, capture one screenshot plus the exact step that produced it.