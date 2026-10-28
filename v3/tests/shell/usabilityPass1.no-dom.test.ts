import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shellCss = readFileSync(new URL("../../pilot/shell/styles.css", import.meta.url), "utf8");
const mamaCss = readFileSync(new URL("../../pilot/mama/usability.css", import.meta.url), "utf8");
const mamaHtml = readFileSync(new URL("../../pilot/mama/index.html", import.meta.url), "utf8");
const ccrPolish = readFileSync(new URL("../../pilot/ccr/polish.css", import.meta.url), "utf8");
const ccrConvergence = readFileSync(new URL("../../pilot/ccr/mama-inspired.css", import.meta.url), "utf8");

describe("A13 clinician usability pass 1", () => {
  it("reduces the Shell hero and module-section heading scale", () => {
    expect(shellCss).toContain("clamp(2.45rem,4.5vw,4.2rem)");
    expect(shellCss).toContain("clamp(1.5rem,2.2vw,2rem)");
    expect(shellCss).not.toContain("clamp(2.7rem,6vw,5.6rem)");
  });

  it("loads the Mama compact usability layer", () => {
    expect(mamaHtml).toContain('href="./usability.css"');
    expect(mamaCss).toContain("#safety-questions");
    expect(mamaCss).toContain("repeat(2, minmax(0, 1fr))");
    expect(mamaCss).toContain("@media (max-width: 700px)");
  });

  it("converges CCR on Mama visual tokens without changing clinical markup", () => {
    expect(ccrPolish).toContain('@import url("./mama-inspired.css")');
    expect(ccrConvergence).toContain("--a13-accent: #7b325f");
    expect(ccrConvergence).toContain(".form-section,");
    expect(ccrConvergence).toContain("border-radius: 18px");
    expect(ccrConvergence).toContain(".choice-options label:has(input:checked)");
  });

  it("keeps the pass presentation-only", () => {
    const css = `${shellCss}\n${mamaCss}\n${ccrPolish}\n${ccrConvergence}`;
    expect(css).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon/i);
    expect(css).not.toMatch(/eligib|interval|mammograph|colonoscopy|fitPositive|riskScore|ruleId/i);
  });
});
