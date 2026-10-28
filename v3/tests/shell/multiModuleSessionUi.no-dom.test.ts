import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shellMain = readFileSync(new URL("../../pilot/shell/main.ts", import.meta.url), "utf8");
const ccrBootstrap = readFileSync(new URL("../../pilot/ccr/sharedContextBootstrap.ts", import.meta.url), "utf8");
const mamaBootstrap = readFileSync(new URL("../../pilot/mama/sharedContextBootstrap.ts", import.meta.url), "utf8");
const moduleBootstraps = `${ccrBootstrap}\n${mamaBootstrap}`;

describe("A9 multi-module same-tab continuity UI", () => {
  it("loads the A8 Shell return into an ephemeral A7 ledger", () => {
    expect(shellMain).toContain("consumeMotorTabSessionShellReturn(window)");
    expect(shellMain).toContain("createMotorEphemeralSessionLedger()");
    expect(shellMain).toContain("sessionLedger.snapshots[module.id]");
  });

  it("carries the current shallow ledger with the next explicit module navigation", () => {
    expect(shellMain).toContain("encodeMotorTabSessionModuleHandoff(pendingModule, context, sessionLedger)");
    expect(shellMain).not.toMatch(/ledger.*localStorage|ledger.*sessionStorage/i);
  });

  it("lets both module bootstraps pass the ledger through without inspecting another module", () => {
    expect(ccrBootstrap).toContain('consumeMotorTabSessionModuleHandoff(window, "ccr")');
    expect(mamaBootstrap).toContain('consumeMotorTabSessionModuleHandoff(window, "mama")');
    expect(ccrBootstrap).toContain("tabSession?.ledger ?? createMotorEphemeralSessionLedger()");
    expect(mamaBootstrap).toContain("tabSession?.ledger ?? createMotorEphemeralSessionLedger()");
    expect(moduleBootstraps).not.toMatch(/sessionLedger\.snapshots|ledger\.snapshots|readMotorEphemeralSessionSnapshot/i);
  });

  it("returns the opaque ledger plus only the current module's own shallow snapshot", () => {
    expect(ccrBootstrap).toContain("encodeMotorTabSessionShellReturn(sessionLedger, snapshot)");
    expect(mamaBootstrap).toContain("encodeMotorTabSessionShellReturn(sessionLedger, snapshot)");
    expect(ccrBootstrap).toContain("toCcrMotorModuleSnapshot");
    expect(mamaBootstrap).toContain("toMamaMotorModuleSnapshot");
  });

  it("can display CCR and Mama independently but never computes a combined preventive state", () => {
    expect(shellMain).toContain("MOTOR_MODULES.map(cardFor)");
    expect(shellMain).toContain("Última avaliação desta sessão");
    expect(shellMain).not.toMatch(/overallStatus|globalStatus|aggregateRisk|preventiveStatus|priorityScore/i);
    expect(shellMain).not.toMatch(/todos.*em dia|prevenção.*em dia/i);
  });

  it("keeps the journey ephemeral and local to the same tab", () => {
    const all = `${shellMain}\n${moduleBootstraps}`;
    expect(all).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|analytics/i);
    expect(all).not.toMatch(/location\.(search|hash)|URLSearchParams/i);
    expect(all).toContain("window.name");
  });
});
