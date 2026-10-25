import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PRODUCT_FILES = [
  "../../src/product/ccr/integration.ts",
  "../../src/product/ccr/form.ts",
  "../../src/product/ccr/presentation.ts",
] as const;

function read(relative: (typeof PRODUCT_FILES)[number]) {
  return readFileSync(new URL(relative, import.meta.url), "utf8");
}

describe("CCR Phase 7 product privacy/architecture boundary", () => {
  it("contains no browser persistence, URL-state, network, analytics or logging primitive", () => {
    const forbidden = [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "document.cookie",
      "window.location",
      "history.pushState",
      "history.replaceState",
      "URLSearchParams",
      "fetch(",
      "XMLHttpRequest",
      "navigator.sendBeacon",
      "console.log",
      "console.info",
      "console.warn",
      "console.error",
      "analytics",
    ];

    for (const file of PRODUCT_FILES) {
      const source = read(file);
      for (const token of forbidden) {
        expect(source, `${file} contains ${token}`).not.toContain(token);
      }
    }
  });

  it("keeps direct engine evaluation confined to the integration adapter", () => {
    expect(read("../../src/product/ccr/integration.ts")).toContain(
      "evaluatePatient",
    );
    expect(read("../../src/product/ccr/form.ts")).not.toContain(
      "evaluatePatient",
    );
    expect(read("../../src/product/ccr/presentation.ts")).not.toContain(
      "evaluatePatient",
    );
  });

  it("keeps the form normalizer and presentation layer free of direct ruleset selection", () => {
    for (const file of [
      "../../src/product/ccr/form.ts",
      "../../src/product/ccr/presentation.ts",
    ] as const) {
      const source = read(file);
      expect(source).not.toContain("ccrPhase6ActiveRuleset");
      expect(source).not.toContain("ccrPhase65Ruleset");
      expect(source).not.toContain("RulesetSchema");
    }
  });
});
