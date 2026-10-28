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
  consumeMotorTabSessionModuleHandoff,
  consumeMotorTabSessionShellReturn,
  encodeMotorTabSessionModuleHandoff,
  encodeMotorTabSessionShellReturn,
} from "../../src/product/shell/tabSessionTransport";

const PREFIX = "__MOTOR_TAB_SESSION__:";

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
    evaluationDate: knownMotorSharedFact(motorIsoDate("2026-10-28"), "user_supplied"),
    birthDate: knownMotorSharedFact(motorIsoDate("1980-02-29"), "user_supplied"),
  });
}

describe("A8 same-tab shallow ledger transport", () => {
  it("round-trips shared context plus two independent shallow snapshots to a selected module", () => {
    let ledger = createMotorEphemeralSessionLedger();
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("ccr", "CCR em dia"));
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("mama", "Mama revisar"));
    const port = { name: encodeMotorTabSessionModuleHandoff("mama", context(), ledger) };

    const received = consumeMotorTabSessionModuleHandoff(port, "mama");
    expect(received?.context.evaluationDate.status).toBe("known");
    expect(received?.ledger.snapshots.ccr?.surface.title).toBe("CCR em dia");
    expect(received?.ledger.snapshots.mama?.surface.title).toBe("Mama revisar");
    expect(port.name).toBe("");
  });

  it("returns to Shell by replacing only the current module snapshot", () => {
    let ledger = createMotorEphemeralSessionLedger();
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("ccr", "CCR preservada"));
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot("mama", "Mama anterior"));
    const port = { name: encodeMotorTabSessionShellReturn(ledger, snapshot("mama", "Mama atualizada")) };

    const returned = consumeMotorTabSessionShellReturn(port);
    expect(returned?.snapshots.ccr?.surface.title).toBe("CCR preservada");
    expect(returned?.snapshots.mama?.surface.title).toBe("Mama atualizada");
    expect(port.name).toBe("");
  });

  it("fails closed and clears a MOTOR session envelope addressed to another module", () => {
    const port = {
      name: encodeMotorTabSessionModuleHandoff("ccr", context(), createMotorEphemeralSessionLedger()),
    };
    expect(consumeMotorTabSessionModuleHandoff(port, "mama")).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("preserves unrelated window.name content", () => {
    const port = { name: "host-owned-value" };
    expect(consumeMotorTabSessionModuleHandoff(port, "ccr")).toBeUndefined();
    expect(port.name).toBe("host-owned-value");
    expect(consumeMotorTabSessionShellReturn(port)).toBeUndefined();
    expect(port.name).toBe("host-owned-value");
  });

  it("rejects duplicate module receipts instead of resolving ambiguous ledger state", () => {
    const encoded = encodeMotorTabSessionModuleHandoff(
      "ccr",
      context(),
      upsertMotorEphemeralSessionSnapshot(createMotorEphemeralSessionLedger(), snapshot("ccr", "CCR")),
    );
    const envelope = JSON.parse(encoded.slice(PREFIX.length)) as { ledgerReceipts: string[] };
    envelope.ledgerReceipts.push(envelope.ledgerReceipts[0] as string);
    const port = { name: `${PREFIX}${JSON.stringify(envelope)}` };
    expect(consumeMotorTabSessionModuleHandoff(port, "ccr")).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("sanitizes runtime extras before placing context or snapshots in the carrier", () => {
    const unsafeContext = {
      ...context(),
      patientFacts: { symptoms: true },
    } as ReturnType<typeof context>;
    const unsafeSnapshot = {
      ...snapshot("ccr", "CCR"),
      rawHistory: { colonoscopy: "secret" },
      surface: { ...snapshot("ccr", "CCR").surface, ruleId: "rule-secret" },
    } as MotorModuleSnapshot<MotorModuleId>;
    const ledger = upsertMotorEphemeralSessionSnapshot(createMotorEphemeralSessionLedger(), unsafeSnapshot);
    const encoded = encodeMotorTabSessionModuleHandoff("ccr", unsafeContext, ledger);

    expect(encoded).not.toContain("patientFacts");
    expect(encoded).not.toContain("symptoms");
    expect(encoded).not.toContain("rawHistory");
    expect(encoded).not.toContain("colonoscopy");
    expect(encoded).not.toContain("rule-secret");
  });

  it("rejects malformed MOTOR session envelopes and clears them", () => {
    const port = { name: `${PREFIX}{bad-json` };
    expect(consumeMotorTabSessionShellReturn(port)).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("keeps transport in shared product infrastructure with no durable or URL carrier", () => {
    const source = readFileSync(
      new URL("../../src/product/shell/tabSessionTransport.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toMatch(/product\/ccr|product\/mama|evaluateCcr|evaluateMama|presentCcr|presentMama/i);
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon/i);
    expect(source).not.toMatch(/location\.(search|hash)|URLSearchParams/i);
    expect(source).not.toMatch(/overallStatus|globalStatus|aggregateRisk|preventiveStatus/i);
  });
});
