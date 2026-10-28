import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shellMain = readFileSync(new URL("../../pilot/shell/main.ts", import.meta.url), "utf8");
const ccrBootstrap = readFileSync(new URL("../../pilot/ccr/sharedContextBootstrap.ts", import.meta.url), "utf8");
const mamaBootstrap = readFileSync(new URL("../../pilot/mama/sharedContextBootstrap.ts", import.meta.url), "utf8");
const combinedModules = `${ccrBootstrap}\n${mamaBootstrap}`;

describe("A6 explicit module -> Shell return UI", () => {
  it("consumes exactly one shallow outcome receipt when the Shell loads", () => {
    expect(shellMain).toContain("consumeMotorModuleOutcomeReceipt(window)");
    expect(shellMain).toContain("returnedSnapshot?.moduleId === module.id");
    expect(shellMain).toContain("status.dataset.returnedModuleStatus = module.id");
  });

  it("renders returned status only on the matching independent module card", () => {
    expect(shellMain).toContain("Última avaliação desta sessão");
    expect(shellMain).toContain("returned.surface.title");
    expect(shellMain).toContain("returned.surface.detail");
    expect(shellMain).not.toMatch(/overall|aggregate|globalStatus|todos.*em dia|status preventivo global/i);
  });

  it("requires an explicit return action from both domain pilots", () => {
    expect(ccrBootstrap).toContain('button.textContent = "Voltar ao MOTOR"');
    expect(mamaBootstrap).toContain('button.textContent = "Voltar ao MOTOR"');
    expect(combinedModules).toContain("encodeMotorModuleOutcomeReceipt(snapshot)");
    expect(combinedModules).toContain('window.location.assign("../shell/index.html")');
  });

  it("derives the receipt through each domain adapter instead of the Shell", () => {
    expect(ccrBootstrap).toContain("toCcrMotorModuleSnapshot(presentCcrProduct(evaluated))");
    expect(mamaBootstrap).toContain("toMamaMotorModuleSnapshot(presentMamaProduct(evaluated))");
    expect(shellMain).not.toMatch(/evaluateCcr|evaluateMama|presentCcr|presentMama|toCcrMotor|toMamaMotor/i);
  });

  it("adds no durable persistence, network transmission or URL-carried patient state", () => {
    const all = `${shellMain}\n${combinedModules}`;
    expect(all).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|analytics/i);
    expect(combinedModules).not.toMatch(/location\.(search|hash)|URLSearchParams/i);
  });

  it("does not create a cross-module ledger", () => {
    expect(shellMain).not.toMatch(/ledger|moduleHistory|completedModules|moduleStatuses/i);
    expect(shellMain).toContain("const returnedSnapshot");
  });
});
