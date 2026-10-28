import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { MotorModuleSnapshot } from "../../src/product/shell/contracts";
import {
  createMotorEphemeralSessionLedger,
  upsertMotorEphemeralSessionSnapshot,
} from "../../src/product/shell/ephemeralSessionLedger";
import type { MotorModuleId } from "../../src/product/shell/navigationHandoff";
import {
  createMotorSharedSessionContext,
  knownMotorSharedFact,
  motorIsoDate,
} from "../../src/product/shell/sessionContext";
import {
  consumeMotorTabJourneyShellReturn,
  encodeMotorTabJourneyShellReturn,
} from "../../src/product/shell/tabJourneyReturn";

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

function context() {
  return createMotorSharedSessionContext({
    evaluationDate: knownMotorSharedFact(motorIsoDate("2026-10-28"), "system_clock"),
    birthDate: knownMotorSharedFact(motorIsoDate("1960-01-01"), "user_supplied"),
  });
}

describe("A10 shared factual context continuity on module -> Shell return", () => {
  it("round-trips the same sanitized shared context with the updated shallow ledger", () => {
    const ledger = upsertMotorEphemeralSessionSnapshot(
      createMotorEphemeralSessionLedger(),
      snapshot("ccr", "CCR preservada"),
    );
    const port = {
      name: encodeMotorTabJourneyShellReturn("mama", context(), ledger, snapshot("mama", "Mama atualizada")),
    };
    const returned = consumeMotorTabJourneyShellReturn(port);

    expect(returned?.sourceModule).toBe("mama");
    expect(returned?.context).toEqual(context());
    expect(returned?.ledger.snapshots.ccr?.surface.title).toBe("CCR preservada");
    expect(returned?.ledger.snapshots.mama?.surface.title).toBe("Mama atualizada");
    expect(port.name).toBe("");
  });

  it("rejects a source module that does not match the current snapshot", () => {
    expect(() =>
      encodeMotorTabJourneyShellReturn(
        "ccr",
        context(),
        createMotorEphemeralSessionLedger(),
        snapshot("mama", "Mama"),
      ),
    ).toThrow("source does not match snapshot module");
  });

  it("sanitizes runtime extras from shared context and shallow snapshot before transport", () => {
    const unsafeContext = { ...context(), patientId: "123", symptoms: true } as ReturnType<typeof context>;
    const unsafeSnapshot = {
      ...snapshot("ccr", "CCR"),
      rawHistory: { fit: "positive" },
      surface: { ...snapshot("ccr", "CCR").surface, ruleId: "secret" },
    } as MotorModuleSnapshot<MotorModuleId>;
    const encoded = encodeMotorTabJourneyShellReturn(
      "ccr",
      unsafeContext,
      createMotorEphemeralSessionLedger(),
      unsafeSnapshot,
    );

    expect(encoded).not.toContain("patientId");
    expect(encoded).not.toContain("symptoms");
    expect(encoded).not.toContain("rawHistory");
    expect(encoded).not.toContain("positive");
    expect(encoded).not.toContain("ruleId");
  });

  it("fails closed and clears malformed recognized journey returns", () => {
    const port = { name: "__MOTOR_TAB_JOURNEY_RETURN__:{bad-json" };
    expect(consumeMotorTabJourneyShellReturn(port)).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("preserves unrelated window.name content", () => {
    const port = { name: "host-owned-value" };
    expect(consumeMotorTabJourneyShellReturn(port)).toBeUndefined();
    expect(port.name).toBe("host-owned-value");
  });

  it("adds no new raw facts, persistence, network, URL state or clinical aggregation", () => {
    const source = readFileSync(
      new URL("../../src/product/shell/tabJourneyReturn.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon/i);
    expect(source).not.toMatch(/location\.(search|hash)|URLSearchParams/i);
    expect(source).not.toMatch(/overallStatus|globalStatus|aggregateRisk|preventiveStatus|priorityScore/i);
    expect(source).not.toMatch(/product\/ccr|product\/mama|evaluateCcr|evaluateMama|presentCcr|presentMama/i);
  });
});
