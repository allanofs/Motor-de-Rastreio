import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MOTOR_MODULES } from "../../src/product/shell";

const html = readFileSync(new URL("../../pilot/shell/index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../../pilot/shell/main.ts", import.meta.url), "utf8");

describe("Unified MOTOR Shell A1 UI static invariants", () => {
  it("exposes one landing surface with no patient form fields", () => {
    expect(html).toContain("Cuidado preventivo, em um só lugar.");
    expect(html).not.toMatch(/<form\b/i);
    expect(html).not.toMatch(/<(input|select|textarea)\b/i);
  });

  it("renders module cards from the shared registry rather than hard-coded clinical rules", () => {
    expect(MOTOR_MODULES.map((module) => module.id)).toEqual(["ccr", "mama"]);
    expect(main).toContain("MOTOR_MODULES.map(cardFor)");
    expect(main).not.toMatch(/age\s*[<>]=?/i);
    expect(main).not.toMatch(/mamograf|colonoscop|\bFIT\b/i);
  });

  it("routes only to existing domain pilots", () => {
    expect(main).toContain('ccr: "../ccr/index.html"');
    expect(main).toContain('mama: "../mama/index.html"');
  });

  it("contains no persistence, analytics or network transmission", () => {
    expect(main).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|analytics/i);
  });

  it("does not invent a global preventive status", () => {
    expect(html).not.toMatch(/todos.*em dia|status preventivo global|risco global/i);
    expect(main).not.toMatch(/overall|aggregate|globalStatus/i);
  });
});
