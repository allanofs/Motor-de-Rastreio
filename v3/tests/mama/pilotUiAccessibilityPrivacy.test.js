// @vitest-environment happy-dom
// Structural checks only; real-browser keyboard/screen-reader inspection remains a later gate.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";

const shell = readFileSync(
  new NodeURL("../../pilot/mama/index.html", import.meta.url),
  "utf8",
);
const mainSource = readFileSync(
  new NodeURL("../../pilot/mama/main.ts", import.meta.url),
  "utf8",
);
const draftSource = readFileSync(
  new NodeURL("../../pilot/mama/pilotDraft.ts", import.meta.url),
  "utf8",
);
const reportSource = readFileSync(
  new NodeURL("../../pilot/mama/reportUi.ts", import.meta.url),
  "utf8",
);

function el(selector) {
  const node = document.querySelector(selector);
  if (!node) throw new Error(`Missing ${selector}`);
  return node;
}

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = shell
    .match(/<body>([\s\S]*)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, "");
  await import("../../pilot/mama/main");
});

describe("Mama pilot accessibility structure", () => {
  it("uses semantic fieldsets and legends for choice questions", () => {
    const groups = [...document.querySelectorAll("fieldset.choice-group")];
    expect(groups.length).toBeGreaterThan(10);
    expect(groups.every((group) => group.querySelector("legend") !== null)).toBe(
      true,
    );
  });

  it("exposes live result and assertive error regions", () => {
    expect(el("#result-region").getAttribute("aria-live")).toBe("polite");
    expect(el("#error-state").getAttribute("role")).toBe("alert");
    expect(el("#error-state").getAttribute("aria-live")).toBe("assertive");
  });

  it("keeps the result heading programmatically focusable without adding it to tab order", () => {
    expect(el("#result-title").getAttribute("tabindex")).toBe("-1");
  });

  it("does not ask sex or gender as a proxy for relevant anatomy", () => {
    expect(document.querySelector('[name="sex"]')).toBeNull();
    expect(document.querySelector('[name="gender"]')).toBeNull();
    expect(el("#relevant-breast-tissue").textContent.toLowerCase()).toContain(
      "tecido mamário",
    );
  });
});

describe("Mama pilot privacy and implementation boundary", () => {
  it("contains no persistence, analytics or network APIs in pilot code", () => {
    const source = `${mainSource}\n${draftSource}\n${reportSource}`;
    for (const forbidden of [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "MutationObserver",
      "navigator.sendBeacon",
      "XMLHttpRequest",
      "fetch(",
    ])
      expect(source).not.toContain(forbidden);
  });

  it("contains no clinical age cutoffs or guideline interval constants in UI code", () => {
    const source = `${mainSource}\n${draftSource}\n${reportSource}`;
    expect(source).not.toMatch(/age\s*[<>]=?\s*(40|50|74|75)/i);
    expect(source).not.toMatch(/(12|24)\s*months?/i);
    expect(source).not.toMatch(/biennial|annual mammograph/i);
  });

  it("has no form submission target or patient persistence declaration", () => {
    expect(el("#screening-form").getAttribute("action")).toBeNull();
    expect(document.body.textContent.toLowerCase()).toContain(
      "não há armazenamento",
    );
  });
});
