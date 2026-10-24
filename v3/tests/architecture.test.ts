import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import * as foundation from "../src/index";
function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sources(join(directory, entry.name))
      : entry.name.endsWith(".ts")
        ? [join(directory, entry.name)]
        : [],
  );
}
it("imports the public entry point without a browser or UI", () => {
  expect(foundation.evaluatePatient).toBeTypeOf("function");
  expect(Reflect.has(globalThis, "window")).toBe(false);
});
it("keeps model and engine independent of browser, clock, storage, network and Node APIs", () => {
  const forbidden =
    /\b(new\s+Date|Date\.(now|parse|UTC)|(?:window|document)\s*\.|localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|console\.(log|error|warn)|node:)\b/;
  for (const file of sources("src"))
    expect(readFileSync(file, "utf8"), file).not.toMatch(forbidden);
});
it("keeps clinical content outside the frozen engine/model and adds no persistence dependency", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
    dependencies: Record<string, string>;
  };
  expect(Object.keys(pkg.dependencies)).toEqual(["zod"]);
  expect(readdirSync("src")).toContain("clinical");
  for (const file of [...sources("src/model"), ...sources("src/engine")]) {
    const content = readFileSync(file, "utf8");
    expect(content, file).not.toContain("../clinical");
    expect(content, file).not.toContain("/clinical/");
  }
});
