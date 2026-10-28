import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import {
  MOTOR_AUTOMATION_BOUNDARY_CODES,
  MOTOR_MODULES,
  defaultMotorBoundarySurface,
} from "../../src/product/shell";
import {
  CCR_MOTOR_MODULE,
  toCcrMotorModuleSnapshot,
  type CcrPresentationModel,
} from "../../src/product/ccr";
import {
  MAMA_MOTOR_MODULE,
  toMamaMotorModuleSnapshot,
  type MamaPresentationModel,
} from "../../src/product/mama";

function fakeCcrPresentation(
  code: CcrPresentationModel["automationBoundary"]["code"],
): CcrPresentationModel {
  return {
    contractVersion: "phase7.4.1",
    rulesetVersion: "crc-test",
    releaseGate: "integration-only-not-authorized-for-real-world-use",
    policy: { policyId: "ccr-policy", label: "CCR policy", family: "test" },
    requiresAttention: code === "SPECIFIC_ATTENTION_REQUIRED",
    automationBoundary: {
      contractVersion: "phaseB.1",
      code,
      triggerTrackIds: ["internal-ccr-track"],
    },
    requestedInputs: [],
    sections: [],
  };
}

function fakeMamaPresentation(
  code: MamaPresentationModel["automationBoundary"]["code"],
  surface = defaultMotorBoundarySurface(code),
): MamaPresentationModel {
  return {
    contractVersion: "mama-P1",
    rulesetVersion: "mama-test",
    releaseGate: "integration-only-not-authorized-for-real-world-use",
    policy: {
      policyId: "mama-policy",
      label: "Mama policy",
      family: "internacional",
    },
    requiresAttention: code === "SPECIFIC_ATTENTION_REQUIRED",
    automationBoundary: {
      contractVersion: "mama-B1",
      code,
      triggerTrackIds: ["internal-mama-track"],
      provenanceCarrier: "track_trace",
    },
    surface,
    requestedInputs: [],
    sections: [],
    decisionContext: null,
  };
}

describe("Unified MOTOR shell architecture", () => {
  it("shares only the eight proven automation-boundary codes", () => {
    expect(MOTOR_AUTOMATION_BOUNDARY_CODES).toEqual([
      "CANNOT_CONCLUDE_SAFELY",
      "SPECIFIC_ATTENTION_REQUIRED",
      "SPECIFIC_CARE_ACTIVE",
      "MORE_INFORMATION_NEEDED",
      "SHARED_DECISION",
      "ROUTINE_DUE",
      "ROUTINE_CURRENT",
      "SCREENING_NOT_INDICATED",
    ]);
  });

  it("registers CCR and Mama as independent installed modules", () => {
    expect(MOTOR_MODULES.map((module) => module.id)).toEqual(["ccr", "mama"]);
    expect(CCR_MOTOR_MODULE.lifecycle).toBe("pilot_internal");
    expect(MAMA_MOTOR_MODULE.lifecycle).toBe("pilot_internal");
    expect(CCR_MOTOR_MODULE.capabilities).toContain("local_report_export");
    expect(MAMA_MOTOR_MODULE.capabilities).toContain("local_report_export");
  });

  it("projects both domains into the same shallow shell snapshot shape", () => {
    const ccr = toCcrMotorModuleSnapshot(fakeCcrPresentation("ROUTINE_DUE"));
    const mama = toMamaMotorModuleSnapshot(fakeMamaPresentation("ROUTINE_DUE"));

    expect(Object.keys(ccr).sort()).toEqual(Object.keys(mama).sort());
    expect(ccr.boundaryCode).toBe("ROUTINE_DUE");
    expect(mama.boundaryCode).toBe("ROUTINE_DUE");
    expect(ccr.surface.title).toBe("Rastreamento indicado");
    expect(mama.surface.title).toBe("Rastreamento indicado");
  });

  it("does not leak tracks, rules, evidence carriers or decision-context internals into the shell snapshot", () => {
    const snapshot = toMamaMotorModuleSnapshot(
      fakeMamaPresentation("SCREENING_NOT_INDICATED", {
        title: "Fora do escopo da recomendação",
        detail: "Nuance revisada do módulo Mama.",
      }),
    );

    expect(snapshot.surface.title).toBe("Fora do escopo da recomendação");
    const serialized = JSON.stringify(snapshot);
    for (const forbidden of [
      "triggerTrackIds",
      "decisionContext",
      "provenanceCarrier",
      "reasonCode",
      "activeRuleIds",
      "sourceIds",
      "sections",
      "evaluation",
    ])
      expect(serialized).not.toContain(forbidden);
  });

  it("keeps boundary derivation domain-specific while sharing the vocabulary type", () => {
    const ccrBoundary = readFileSync(
      new NodeURL("../../src/product/ccr/automationBoundary.ts", import.meta.url),
      "utf8",
    );
    const mamaBoundary = readFileSync(
      new NodeURL("../../src/product/mama/automationBoundary.ts", import.meta.url),
      "utf8",
    );

    expect(ccrBoundary).toContain("deriveCcrAutomationBoundary");
    expect(mamaBoundary).toContain("deriveMamaAutomationBoundary");
    expect(ccrBoundary).toContain("MotorAutomationBoundaryCode");
    expect(mamaBoundary).toContain("MotorAutomationBoundaryCode");
    expect(ccrBoundary).not.toContain("deriveMotorAutomationBoundary");
    expect(mamaBoundary).not.toContain("deriveMotorAutomationBoundary");
  });

  it("keeps the shared shell contract clinically agnostic", () => {
    const contracts = readFileSync(
      new NodeURL("../../src/product/shell/contracts.ts", import.meta.url),
      "utf8",
    );

    for (const forbiddenImport of [
      "../../clinical",
      "../../engine",
      "../../model",
      "CCR_IDS",
      "MAMA_IDS",
      "FIT",
      "BI-RADS",
      "mammography",
      "colonoscopy",
    ])
      expect(contracts).not.toContain(forbiddenImport);
  });
});
