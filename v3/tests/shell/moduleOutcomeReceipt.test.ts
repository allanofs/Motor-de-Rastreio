import { describe, expect, it } from "vitest";
import type { MotorModuleSnapshot } from "../../src/product/shell/contracts";
import type { MotorModuleId } from "../../src/product/shell/navigationHandoff";
import {
  consumeMotorModuleOutcomeReceipt,
  encodeMotorModuleOutcomeReceipt,
} from "../../src/product/shell/moduleOutcomeReceipt";

function snapshot(): MotorModuleSnapshot<MotorModuleId> {
  return {
    moduleId: "ccr",
    moduleLabel: "Câncer colorretal",
    rulesetVersion: "crc-test",
    releaseGate: "integration_only",
    policyLabel: "SUS / Brasil",
    boundaryCode: "ROUTINE_CURRENT",
    requiresAttention: false,
    requestedInputCount: 0,
    hasPendingInput: false,
    surface: {
      title: "Em dia",
      detail: "O rastreamento está em dia com base no histórico qualificável disponível.",
    },
  };
}

describe("A5 shallow module outcome receipt", () => {
  it("round-trips a reviewed shallow snapshot and clears the carrier", () => {
    const port = { name: encodeMotorModuleOutcomeReceipt(snapshot()) };
    expect(consumeMotorModuleOutcomeReceipt(port)).toEqual(snapshot());
    expect(port.name).toBe("");
  });

  it("does not erase unrelated window.name content", () => {
    const port = { name: "unrelated-host-value" };
    expect(consumeMotorModuleOutcomeReceipt(port)).toBeUndefined();
    expect(port.name).toBe("unrelated-host-value");
  });

  it("fails closed and clears malformed MOTOR outcome payloads", () => {
    const port = { name: "__MOTOR_OUTCOME__:{bad-json" };
    expect(consumeMotorModuleOutcomeReceipt(port)).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("rejects unknown modules and unknown boundary vocabulary", () => {
    const encoded = encodeMotorModuleOutcomeReceipt(snapshot());
    const wrongModule = { name: encoded.replace('"moduleId":"ccr"', '"moduleId":"other"') };
    const wrongBoundary = { name: encoded.replace('"boundaryCode":"ROUTINE_CURRENT"', '"boundaryCode":"GLOBAL_OK"') };
    expect(consumeMotorModuleOutcomeReceipt(wrongModule)).toBeUndefined();
    expect(consumeMotorModuleOutcomeReceipt(wrongBoundary)).toBeUndefined();
  });

  it("rejects inconsistent pending-input metadata", () => {
    const encoded = encodeMotorModuleOutcomeReceipt(snapshot());
    const port = { name: encoded.replace('"hasPendingInput":false', '"hasPendingInput":true') };
    expect(consumeMotorModuleOutcomeReceipt(port)).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("rejects extra envelope or snapshot fields instead of carrying deep data", () => {
    const encoded = encodeMotorModuleOutcomeReceipt(snapshot());
    const extraSnapshot = {
      name: encoded.replace('"surface":{', '"patientFact":{"birthDate":"1980-02-29"},"surface":{'),
    };
    expect(consumeMotorModuleOutcomeReceipt(extraSnapshot)).toBeUndefined();
    expect(extraSnapshot.name).toBe("");
  });

  it("sanitizes runtime extra properties when encoding", () => {
    const unsafe = {
      ...snapshot(),
      patientFact: { birthDate: "1980-02-29" },
      surface: { ...snapshot().surface, ruleId: "secret-rule" },
    } as MotorModuleSnapshot<MotorModuleId>;
    const encoded = encodeMotorModuleOutcomeReceipt(unsafe);
    expect(encoded).not.toContain("patientFact");
    expect(encoded).not.toContain("birthDate");
    expect(encoded).not.toContain("ruleId");
  });

  it("never places the outcome in a URL-shaped carrier", () => {
    const encoded = encodeMotorModuleOutcomeReceipt(snapshot());
    expect(encoded.startsWith("__MOTOR_OUTCOME__:")).toBe(true);
    expect(encoded).not.toContain("?");
    expect(encoded).not.toContain("#");
  });
});
