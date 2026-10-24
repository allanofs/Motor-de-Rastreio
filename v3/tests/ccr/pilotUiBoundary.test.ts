import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(relative: string) {
  return readFileSync(new URL(relative, import.meta.url), "utf8");
}

describe("CCR Phase 7.4 non-deployed reference pilot UI", () => {
  it("consumes only the product integration surface, not clinical/engine/model internals", () => {
    const source = read("../../pilot/ccr/main.ts");
    expect(source).toContain('from "../../src/product/ccr"');
    expect(source).not.toContain("src/clinical/ccr");
    expect(source).not.toContain("src/engine/");
    expect(source).not.toContain("src/model/");
  });

  it("contains no patient persistence, URL state, network, analytics or logging primitive", () => {
    const source = read("../../pilot/ccr/main.ts");
    for (const forbidden of [
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
    ]) {
      expect(source, `pilot contains ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("shows an explicit non-release warning in the static shell", () => {
    const html = read("../../pilot/ccr/index.html");
    expect(html).toContain("NÃO AUTORIZADO PARA USO CLÍNICO REAL OU LIBERAÇÃO PÚBLICA");
    expect(html).toContain('meta name="robots" content="noindex,nofollow"');
    expect(html).not.toContain("<form action=");
  });

  it("keeps the pilot build isolated from the Foundation library build", () => {
    const config = read("../../vite.ccr-pilot.config.ts");
    const packageJson = read("../../package.json");
    expect(config).toContain('root: "pilot/ccr"');
    expect(config).toContain('outDir: "../../dist-ccr-pilot"');
    expect(packageJson).toContain('"typecheck:ccr-pilot"');
    expect(packageJson).toContain('"build:ccr-pilot"');
  });
});
