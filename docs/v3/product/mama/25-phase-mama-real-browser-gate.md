# Mama — Real-browser gate

Status: **GREEN / INSPECTED / DRAFT PR**.

This phase validates the first Mama Guided Interview in a real Chromium browser without deployment. The production build is served only on `127.0.0.1` inside GitHub Actions and driven through the Chrome DevTools Protocol.

It does not change clinical rules, evidence, lifecycle governance, Automation Boundary semantics, acquisition normalization, Foundation, engine or model.

## Reproducible browser harness

The dedicated workflow `.github/workflows/v3-mama-browser-gate.yml`:

1. installs the repository dependencies with `npm ci`;
2. builds the Mama pilot;
3. confirms that the runner has real Google Chrome;
4. serves the built pilot locally on `127.0.0.1`;
5. drives Chrome through `v3/scripts/mama-browser-gate.mjs`;
6. uploads browser evidence as an Actions artifact.

No Playwright, Puppeteer or new package dependency is added to the project.

## Automated real-Chrome checks

Final passing run validates:

- desktop viewport: 1440×900;
- no desktop horizontal overflow;
- intended two-column desktop layout;
- keyboard focus from policy to the native date control and, after traversing Chrome's internal date subcontrols, to age;
- governed SUS routine flow reaches `Rastreamento indicado` through the real product/presentation path;
- mammography availability is exposed only after the governed product requests it;
- mobile viewport: 390×844;
- no mobile horizontal overflow;
- journey/workspace stack vertically on mobile;
- no external HTTP(S) requests from the pilot;
- no runtime exceptions;
- no `console.error` events.

The native date control required an important harness correction: Chrome keeps `document.activeElement` on the date input while Tab traverses its internal day/month/year controls. The gate therefore requires eventual forward traversal to the age input rather than incorrectly assuming a single Tab leaves the date field.

## Final machine evidence

The passing report recorded:

- desktop `scrollWidth = 1440` at `innerWidth = 1440` before the completed flow;
- completed-flow `scrollWidth = 1425` at `innerWidth = 1440`;
- desktop journey width 300 px and workspace width 824 px;
- keyboard sequence `policy -> as-of -> as-of -> as-of -> as-of -> age`;
- governed result `Rastreamento indicado`;
- availability section visible and no UI error;
- mobile `scrollWidth = 390` at `innerWidth = 390`;
- mobile journey/workspace widths 358 px and stacked layout;
- 5 browser network requests, all local;
- 0 external requests;
- 0 runtime errors;
- 0 console errors.

## Screenshot inspection

The Actions artifact contains:

- `mama-desktop.png`;
- `mama-mobile.png`;
- `report.json`.

The screenshots were inspected after the passing browser run.

### Visual finding and correction

The first passing screenshot exposed a presentation inconsistency when the optional Mamografias step was skipped:

- the ordered journey list visually renumbered Disponibilidade as step 5;
- the actual card correctly remained `Etapa 6`.

This did not change clinical behavior, but could confuse the user. The journey panel now uses static visual numbering tied to the six acquisition stages, so a skipped optional step remains visibly skipped:

`1 Referencial -> 2 Contexto -> 3 Segurança -> 4 Histórico -> 6 Disponibilidade`.

The corrected desktop and mobile screenshots were generated and inspected on the final browser-gate commit. No horizontal clipping or blocking visual defect was observed in those two target viewports.

## Accessibility scope

This gate covers real-browser keyboard traversal, responsive layout and the existing structural accessibility tests. It is not a substitute for a future manual screen-reader audit with assistive technology.

## Privacy boundary

The real browser generated no external HTTP(S) request. The pilot continues to use ephemeral in-memory state only and introduces no persistence, analytics or patient-data transmission.

## Final governance status

- real Chromium gate: **PASS**;
- desktop screenshot: inspected;
- mobile screenshot: inspected;
- keyboard traversal: **PASS**;
- runtime privacy: **PASS**;
- general V3 Foundation CI on the final UI/browser-gate code: **PASS**;
- clinical rules/evidence: unchanged;
- Automation Boundary / acquisition semantics: unchanged;
- no merge;
- no deploy;
- no public release;
- no real-world clinical-use authorization.

The next product phase should be separate: **Mama report/provenance integration using the already-frozen shared Reporting Foundation R3**.
