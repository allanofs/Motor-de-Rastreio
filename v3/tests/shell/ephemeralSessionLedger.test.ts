import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { MotorModuleSnapshot } from "../../src/product/shell/contracts";
import type { MotorModuleId } from "../../src/product/shell/navigationHandoff";
import {
  clearMotorEphemeralSessionLedger,
  createMotorEphemeralSessionLedger,
  readMotorEphemeralSessionSnapshot,
  upsertMotorEphemeralSessionSnapshot,
} from "../../src/product/shell/ephemeralSessionLedger";

function snapshot(moduleId: MotorModuleId, title: string): MotorModuleSnapshot<MotorModuleId> {
  return {
    moduleId,
    moduleLabel: moduleId === "ccr" ? "Câncer colorretal" : "Câncer de mama",
    rulesetVersion: `${moduleId}-test`,
    releaseGate: "integration_only",
    policyLabel: "SUS / Brasil",
    boundaryCode: "ROUTINE_CURRENT",
    requiresAttention: false,
    requestedInputCount: 0,
    hasPendingInput: false,
    surface: { title, detail: `Resumo independente de ${moduleId}.` },
  };
}

describe("A7 ephemeral multi-module shallow snapshot ledger", () => {
  it("starts empty, immutable and explicitly tab-ephemeral", () => {
    const ledger = createMotorEphemeralSessionLedger();
    expect(ledger.version).toBe("motor-ephemeral-ledger-v1");
    expect(ledger.lifecycle).toBe("tab_ephemeral");
    expect(ledger.snapshots).toEqual({});
    expect(Object.isFrozen(ledger)).toBe(true);
    expect(Object.isFrozen(ledger.snapshots)).toBe(true);
  });

  it("can retain one shallow snapshot per registered module without combining meaning", () => {
    let ledger = createMotorEphemeralSessionLedger();
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("ccr", "CCR em dia"));
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("mama", "Mama requer revisão"));

    expect(readMotorEphemeralSessionSnapshot(ledger, "ccr")?.surface.title).toBe("CCR em dia");
    expect(readMotorEphemeralSessionSnapshot(ledger, "mama")?.surface.title).toBe("Mama requer revisão");
    expect(Object.keys(ledger.snapshots).sort()).toEqual(["ccr", "mama"]);
    expect(ledger).not.toHaveProperty("overallStatus");
    expect(ledger).not.toHaveProperty("requiresAttention");
  });

  it("replaces only the matching module snapshot", () => {
    let ledger = createMotorEphemeralSessionLedger();
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("ccr", "CCR anterior"));
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("mama", "Mama preservada"));
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("ccr", "CCR atualizada"));

    expect(ledger.snapshots.ccr?.surface.title).toBe("CCR atualizada");
    expect(ledger.snapshots.mama?.surface.title).toBe("Mama preservada");
  });

  it("strips runtime extra properties instead of retaining deep patient data", () => {
    const unsafe = {
      ...snapshot("ccr", "CCR"),
      birthDate: "1980-02-29",
      patientFacts: { symptoms: true },
      surface: { ...snapshot("ccr", "CCR").surface, ruleId: "secret-rule" },
    } as MotorModuleSnapshot<MotorModuleId>;

    const ledger = upsertMotorEphemeralSessionSnapshot(createMotorEphemeralSessionLedger(), unsafe);
    const serialized = JSON.stringify(ledger);
    expect(serialized).not.toContain("birthDate");
    expect(serialized).not.toContain("patientFacts");
    expect(serialized).not.toContain("symptoms");
    expect(serialized).not.toContain("ruleId");
  });

  it("rejects a runtime snapshot for an unregistered module", () => {
    const invalid = { ...snapshot("ccr", "CCR"), moduleId: "other" } as unknown as MotorModuleSnapshot<MotorModuleId>;
    expect(() => upsertMotorEphemeralSessionSnapshot(createMotorEphemeralSessionLedger(), invalid)).toThrow(
      "Unknown MOTOR module snapshot",
    );
  });

  it("drops unexpected ledger keys when producing the next immutable ledger", () => {
    const injected = {
      version: "motor-ephemeral-ledger-v1",
      lifecycle: "tab_ephemeral",
      snapshots: {
        ccr: snapshot("ccr", "CCR"),
        other: { patientFacts: { birthDate: "1980-02-29" } },
      },
    } as unknown as ReturnType<typeof createMotorEphemeralSessionLedger>;

    const next = upsertMotorEphemeralSessionSnapshot(injected, snapshot("mama", "Mama"));
    expect(Object.keys(next.snapshots).sort()).toEqual(["ccr", "mama"]);
    expect(JSON.stringify(next)).not.toContain("patientFacts");
  });

  it("can be explicitly cleared without leaving module snapshots behind", () => {
    const populated = upsertMotorEphemeralSessionSnapshot(
      createMotorEphemeralSessionLedger(),
      snapshot("ccr", "CCR"),
    );
    expect(clearMotorEphemeralSessionLedger(populated as never).snapshots).toEqual({});
  });

  it("defines no persistence, network, URL or browser carrier in A7", () => {
    const source = readFileSync(
      new URL("../../src/product/shell/ephemeralSessionLedger.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon/i);
    expect(source).not.toMatch(/window\.name|location\.(search|hash)|URLSearchParams/i);
    expect(source).not.toMatch(/overallStatus|globalStatus|aggregateRisk|preventiveStatus/i);
  });
});
