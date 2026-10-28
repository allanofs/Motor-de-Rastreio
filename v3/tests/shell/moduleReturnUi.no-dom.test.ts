import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shellMain = readFileSync(new URL("../../pilot/shell/main.ts", import.meta.url), "utf8");
const ccrBootstrap = readFileSync(new URL("../../pilot/ccr/sharedContextBootstrap.ts", import.meta.url), "utf8");
const mamaBootstrap = readFileSync(new URL("../../pilot/mama/sharedContextBootstrap.ts", import.meta.url), "utf8");
const combinedModules = `${ccrBootstrap}\n${mamaBootstrap}`;

describe("A6 explicit module -> Shell return UI invariants after A7-A9", () => {
  it("still consumes shallow module outcomes without importing domain clinical logic into Shell", () => {
    expect(shellMain).toContain("consumeMotorTabSessionShellReturn(window)");
    expect(shellMain).toContain("consumeMotorModuleOutcomeReceipt(window)");
    expect(shellMain).toContain("status.dataset.returnedModuleStatus = module.id");
    expect(shellMain).not.toMatch(/evaluateCcr|evaluateMama|presentCcr|presentMama|toCcrMotor|toMamaMotor/i);
  });

  it("renders each returned status only from that module's independent shallow snapshot", () => {
    expect(shellMain).toContain("sessionLedger.snapshots[module.id]");
    expect(shellMain).toContain("Última avaliação desta sessão");
    expect(shellMain).toContain("returned.surface.title");
    expect(shellMain).toContain("returned.surface.detail");
    expect(shellMain).not.toMatch(/overall|aggregate|globalStatus|todos.*em dia|status preventivo global/i);
  });

  it("requires an explicit return action from both domain pilots", () => {
    expect(ccrBootstrap).toContain('button.textContent = "Voltar ao MOTOR"');
    expect(mamaBootstrap).toContain('button.textContent = "Voltar ao MOTOR"');
    expect(ccrBootstrap).toContain("encodeMotorTabSessionShellReturn(sessionLedger, snapshot)");
    expect(mamaBootstrap).toContain("encodeMotorTabSessionShellReturn(sessionLedger, snapshot)");
    expect(combinedModules).toContain('window.location.assign("../shell/index.html")');
  });

  it("still derives each shallow snapshot through its own domain adapter", () => {
    expect(ccrBootstrap).toContain("toCcrMotorModuleSnapshot(presentCcrProduct(evaluated))");
    expect(mamaBootstrap).toContain("toMamaMotorModuleSnapshot(presentMamaProduct(evaluated))");
  });

  it("adds no durable persistence, network transmission or URL-carried patient state", () => {
    const all = `${shellMain}\n${combinedModules}`;
    expect(all).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|analytics/i);
    expect(combinedModules).not.toMatch(/location\.(search|hash)|URLSearchParams/i);
  });

  it("permits only the explicitly authorized shallow session ledger, never aggregate clinical state", () => {
    expect(shellMain).toContain("sessionLedger");
    expect(shellMain).not.toMatch(/overallStatus|globalStatus|aggregateRisk|preventiveStatus|priorityScore/i);
    expect(combinedModules).not.toMatch(/overallStatus|globalStatus|aggregateRisk|preventiveStatus|priorityScore/i);
  });
});
