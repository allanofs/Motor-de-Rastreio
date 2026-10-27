import { describe, expect, it } from "vitest";
import { MAMA_IDS } from "../../src/clinical/mama";
import {
  deriveMamaAutomationBoundary,
  evaluateMamaProductDraft,
  getMamaProductPolicyOptions,
  normalizeMamaProductDraft,
  presentMamaProduct,
} from "../../src/product/mama";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const option = getMamaProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (option === undefined) throw new Error(`Missing ${family} policy`);
  return option.policyId;
}

function baseDraft(overrides: Record<string, unknown> = {}) {
  return {
    policyId: policyId("sus_oficial"),
    asOf: "2026-10-27",
    ageYears: 55,
    screeningContext: "yes",
    relevantBreastTissuePresent: "yes",
    suspiciousBreastSymptoms: "no",
    priorBreastCancer: "no",
    highRiskGeneticContext: "no",
    knownHighRiskFamilialContext: "no",
    priorHighRiskChestRadiation: "no",
    priorHighRiskBreastLesion: "no",
    specificBreastCareActive: "no",
    historyKnowledge: "never_performed",
    careSetting: {},
    ...overrides,
  };
}

function evaluate(overrides: Record<string, unknown> = {}) {
  const result = evaluateMamaProductDraft(baseDraft(overrides));
  if (!result.ok)
    throw new Error("issues" in result ? result.issues.join("\n") : result.message);
  return result;
}

function factByConcept(
  facts: readonly { conceptId: string; presence: string }[],
  conceptId: string,
) {
  return facts.find((fact) => fact.conceptId === conceptId);
}

describe("Mama product acquisition / normalization contract", () => {
  it("rejects generic family-history and risk-calculator fields instead of inferring high risk", () => {
    for (const extra of [
      { familyHistory: "yes" },
      { affectedFdrCount: 2 },
      { gailScore: 25 },
      { tyrerCuzickLifetimeRisk: 30 },
      { boadiceaRisk: 28 },
    ]) {
      const result = normalizeMamaProductDraft(baseDraft(extra));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe("invalid_form");
    }
  });

  it("maps known high familial risk only from the explicit externally-established input", () => {
    const normalized = normalizeMamaProductDraft(
      baseDraft({ knownHighRiskFamilialContext: "yes" }),
    );
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(
      factByConcept(
        normalized.value.patient.facts,
        MAMA_IDS.concepts.knownHighRiskFamilialContext,
      ),
    ).toMatchObject({ presence: "yes", category: "family_history" });
  });

  it("keeps not_asked distinct from a real unknown clinical answer", () => {
    const notAsked = normalizeMamaProductDraft({
      ...baseDraft(),
      highRiskGeneticContext: "not_asked",
    });
    const unknown = normalizeMamaProductDraft({
      ...baseDraft(),
      highRiskGeneticContext: "unknown",
    });
    expect(notAsked.ok).toBe(true);
    expect(unknown.ok).toBe(true);
    if (!notAsked.ok || !unknown.ok) return;

    expect(
      factByConcept(
        notAsked.value.patient.facts,
        MAMA_IDS.concepts.highRiskGeneticContext,
      ),
    ).toBeUndefined();
    expect(
      factByConcept(
        unknown.value.patient.facts,
        MAMA_IDS.concepts.highRiskGeneticContext,
      ),
    ).toMatchObject({ presence: "unknown" });
  });

  it("treats never_performed as known absence of a prior mammography anchor, not missing history", () => {
    const normalized = normalizeMamaProductDraft(baseDraft());
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;

    expect(normalized.value.patient.historyKnowledge[MAMA_IDS.topic]).toBe(
      "never_performed",
    );
    expect(normalized.value.patient.examHistory).toEqual([]);
    expect(
      factByConcept(
        normalized.value.patient.facts,
        MAMA_IDS.concepts.historySufficientForCurrentStatus,
      ),
    ).toMatchObject({ presence: "yes" });
    expect(
      factByConcept(
        normalized.value.patient.facts,
        MAMA_IDS.concepts.priorMammographyNeedsSpecificAttention,
      ),
    ).toMatchObject({ presence: "no" });
  });

  it("normalizes an explicitly qualified screening mammogram without interpreting BI-RADS", () => {
    const normalized = normalizeMamaProductDraft(
      baseDraft({
        historyKnowledge: "known",
        historySufficientForCurrentStatus: "yes",
        priorMammographyAllowsRoutine: "yes",
        priorMammographyNeedsSpecificAttention: "no",
        mammographies: [
          {
            kind: "mammography",
            id: "mammo-1",
            role: "screening",
            date: "2025-11-10",
            disposition: "routine_return",
            quality: "adequate",
            completeness: "complete",
            resolutionInformation: "sufficient",
          },
        ],
      }),
    );
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;

    expect(normalized.value.patient.examHistory[0]).toMatchObject({
      modality: MAMA_IDS.modalities.mammographyScreening,
      result: { status: "final", code: MAMA_IDS.results.routineClearing },
      quality: "adequate",
      completeness: "complete",
      resolutionInformation: "sufficient",
    });
  });

  it("never lets a diagnostic mammogram become a routine interval anchor", () => {
    const result = evaluate({
      historyKnowledge: "known",
      historySufficientForCurrentStatus: "yes",
      priorMammographyAllowsRoutine: "yes",
      priorMammographyNeedsSpecificAttention: "no",
      mammographies: [
        {
          kind: "mammography",
          id: "diagnostic-mammo",
          role: "diagnostic",
          date: "2026-03-10",
          disposition: "routine_return",
          quality: "adequate",
          completeness: "complete",
          resolutionInformation: "sufficient",
        },
      ],
    });
    expect(deriveMamaAutomationBoundary(result).code).toBe(
      "MORE_INFORMATION_NEEDED",
    );
  });

  it("maps an explicitly unresolved prior mammography state to specific attention", () => {
    const result = evaluate({
      historyKnowledge: "known",
      historySufficientForCurrentStatus: "yes",
      priorMammographyAllowsRoutine: "no",
      priorMammographyNeedsSpecificAttention: "yes",
    });
    expect(deriveMamaAutomationBoundary(result)).toMatchObject({
      code: "SPECIFIC_ATTENTION_REQUIRED",
      triggerTrackIds: expect.arrayContaining([MAMA_IDS.tracks.priorFinding]),
    });
  });

  it("rejects contradictory mammography-history states before engine evaluation", () => {
    const withExam = normalizeMamaProductDraft(
      baseDraft({
        historyKnowledge: "never_performed",
        mammographies: [
          {
            kind: "mammography",
            id: "impossible-mammo",
            role: "screening",
            disposition: "unknown",
          },
        ],
      }),
    );
    expect(withExam.ok).toBe(false);

    const conflictingStatus = normalizeMamaProductDraft(
      baseDraft({
        historyKnowledge: "known",
        priorMammographyAllowsRoutine: "yes",
        priorMammographyNeedsSpecificAttention: "yes",
      }),
    );
    expect(conflictingStatus.ok).toBe(false);
  });

  it("produces an ordinary SUS ROUTINE_DUE result from the simple never-performed path", () => {
    const result = evaluate();
    expect(deriveMamaAutomationBoundary(result).code).toBe("ROUTINE_DUE");
    expect(presentMamaProduct(result).requestedInputs).toEqual([
      "mammography_availability",
    ]);
  });

  it("preserves hard-exit precedence for under-40 input acquired through the draft contract", () => {
    const result = evaluate({
      ageYears: 35,
      highRiskGeneticContext: "yes",
    });
    expect(deriveMamaAutomationBoundary(result).code).toBe(
      "SPECIFIC_ATTENTION_REQUIRED",
    );
    expect(result.decisionContext?.routineScopeDisposition).toBe(
      "suppressed_by_safety_track",
    );
  });

  it("preserves a real unknown safety answer as MORE_INFORMATION_NEEDED", () => {
    const result = evaluate({ highRiskGeneticContext: "unknown" });
    expect(deriveMamaAutomationBoundary(result).code).toBe(
      "MORE_INFORMATION_NEEDED",
    );
  });

  it("maps mammography availability only into CareSettingContext operational data", () => {
    const normalized = normalizeMamaProductDraft(
      baseDraft({ careSetting: { mammography: "available" } }),
    );
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(normalized.value.careSetting.resources).toEqual({
      [MAMA_IDS.resources.mammography]: "available",
    });

    const presented = presentMamaProduct(evaluate({
      careSetting: { mammography: "available" },
    }));
    expect(presented.automationBoundary.code).toBe("ROUTINE_DUE");
    expect(presented.requestedInputs).toEqual([]);
  });
});
