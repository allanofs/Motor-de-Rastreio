import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shellMain = readFileSync(new URL("../../pilot/shell/main.ts", import.meta.url), "utf8");
const ccrBootstrap = readFileSync(new URL("../../pilot/ccr/sharedContextBootstrap.ts", import.meta.url), "utf8");
const mamaBootstrap = readFileSync(new URL("../../pilot/mama/sharedContextBootstrap.ts", import.meta.url), "utf8");
const moduleBootstraps = `${ccrBootstrap}\n${mamaBootstrap}`;

describe("A11 reusable shared factual context in same-tab journey", () => {
  it("restores both shared context and shallow ledger from the A10 return", () => {
    expect(shellMain).toContain("consumeMotorTabJourneyShellReturn(window)");
    expect(shellMain).toContain("journeyReturn?.context");
    expect(shellMain).toContain("journeyReturn?.ledger");
  });

  it("prefills the next context dialog from already-known session facts", () => {
    expect(shellMain).toContain('sessionContext?.evaluationDate.status === "known"');
    expect(shellMain).toContain("evaluation.value = sessionContext.evaluationDate.value");
    expect(shellMain).toContain('sessionContext?.birthDate.status === "known"');
    expect(shellMain).toContain("sessionContext.birthDate.value");
    expect(shellMain).toContain("Contexto já informado nesta sessão");
    expect(shellMain).toContain("dialog.dataset.reusedContext");
  });

  it("preserves provenance for unchanged facts and marks edits as user supplied", () => {
    expect(shellMain).toContain("previousEvaluation.source");
    expect(shellMain).toContain('"user_supplied" as const');
    expect(shellMain).toContain("previousBirth");
    expect(shellMain).toContain('unknownMotorSharedFact(birthDateEdited ? "not_available" : "not_asked")');
  });

  it("updates only explicit shared factual context before the next A8 module handoff", () => {
    expect(shellMain).toContain("sessionContext = context");
    expect(shellMain).toContain("encodeMotorTabSessionModuleHandoff(pendingModule, context, sessionLedger)");
    expect(shellMain).not.toMatch(/ageYears\s*:/i);
  });

  it("returns context from both modules through A10 when context is available", () => {
    expect(ccrBootstrap).toContain('encodeMotorTabJourneyShellReturn("ccr", context, sessionLedger, snapshot)');
    expect(mamaBootstrap).toContain('encodeMotorTabJourneyShellReturn("mama", context, sessionLedger, snapshot)');
    expect(moduleBootstraps).toContain("context === undefined");
    expect(moduleBootstraps).toContain("encodeMotorTabSessionShellReturn(sessionLedger, snapshot)");
  });

  it("keeps the shared context factual, ephemeral and non-aggregating", () => {
    const all = `${shellMain}\n${moduleBootstraps}`;
    expect(all).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|analytics/i);
    expect(all).not.toMatch(/location\.(search|hash)|URLSearchParams/i);
    expect(all).not.toMatch(/overallStatus|globalStatus|aggregateRisk|preventiveStatus|priorityScore/i);
    expect(moduleBootstraps).not.toMatch(/sessionLedger\.snapshots|ledger\.snapshots|readMotorEphemeralSessionSnapshot/i);
  });
});
