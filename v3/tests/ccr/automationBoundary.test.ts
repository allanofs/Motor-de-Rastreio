import { describe, expect, it } from "vitest";
import { CCR_IDS } from "../../src/clinical/ccr";
import {
  deriveCcrAutomationBoundary,
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
} from "../../src/product/ccr";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const option = getCcrProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (option === undefined) throw new Error(`Missing ${family} policy`);
  return option.policyId;
}

function draft(overrides: Record<string, unknown> = {}) {
  return {
    policyId: policyId("sus_oficial"),
    asOf: "2026-10-24",
    ageYears: 60,
    screeningContext: "yes",
    priorCrc: "no",
    priorPolypSurveillance: "no",
    colonicIbd: "no",
    hereditarySyndrome: "no",
    familyHistory: "no",
    historyKnowledge: "never_performed",
    historySufficientForCurrentStatus: "not_asked",
    strategySelection: "unselected",
    specialistCareAssumed: "no",
    exams: [],
    careSetting: {},
    ...overrides,
  };
}

function evaluate(input: unknown) {
  const result = evaluateCcrProductDraft(input);
  if (!result.ok) {
    throw new Error(
      "issues" in result ? result.issues.join("\n") : result.message,
    );
  }
  return result;
}

function boundary(input: unknown) {
  return deriveCcrAutomationBoundary(evaluate(input));
}

function fit(id: string, date: string, result: "positive" | "negative") {
  return {
    kind: "fit",
    id,
    status: "performed",
    date,
    result,
  };
}

describe("CCR Phase B automation boundary", () => {
  it("maps ordinary eligible never-screened care to ROUTINE_DUE", () => {
    const result = boundary(draft());
    expect(result).toMatchObject({
      contractVersion: "phaseB.1",
      code: "ROUTINE_DUE",
    });
    expect(result.triggerTrackIds.length).toBeGreaterThan(0);
  });

  it("does not turn the governed H1 negative-family path into specific attention", () => {
    const result = boundary(draft({ familyHistory: "no" }));
    expect(result.code).toBe("ROUTINE_DUE");
    expect(result.triggerTrackIds).not.toContain(CCR_IDS.tracks.familyStatus);
  });

  it("maps a hard exclusion to SPECIFIC_ATTENTION_REQUIRED instead of routine screening", () => {
    const result = boundary(draft({ priorCrc: "yes" }));
    expect(result.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(result.triggerTrackIds).toContain(CCR_IDS.tracks.specialRisk);
  });

  it("maps an open FIT-positive episode to SPECIFIC_ATTENTION_REQUIRED", () => {
    const result = boundary(
      draft({
        historyKnowledge: "known",
        exams: [fit("fit-positive", "2026-01-10", "positive")],
      }),
    );
    expect(result.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(result.triggerTrackIds).toContain(CCR_IDS.tracks.fitFollowup);
  });

  it("remains stopped after a later negative FIT instead of silently returning to routine", () => {
    const result = boundary(
      draft({
        historyKnowledge: "known",
        exams: [
          fit("fit-positive", "2025-01-10", "positive"),
          fit("fit-negative-later", "2026-01-10", "negative"),
        ],
      }),
    );
    expect(result.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(result.triggerTrackIds).toContain(CCR_IDS.tracks.fitFollowup);
  });

  it("does not let local colonoscopy availability change the clinical boundary of an open FIT-positive episode", () => {
    const common = {
      historyKnowledge: "known",
      exams: [fit("fit-positive", "2026-01-10", "positive")],
    };
    const available = boundary(
      draft({ ...common, careSetting: { colonoscopy: "available" } }),
    );
    const unavailable = boundary(
      draft({ ...common, careSetting: { colonoscopy: "unavailable" } }),
    );
    expect(available.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(unavailable.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(unavailable.triggerTrackIds).toEqual(available.triggerTrackIds);
  });

  it("puts missing clinical information above an otherwise age-based routine need", () => {
    const result = boundary(
      draft({
        policyId: policyId("internacional"),
        ageYears: 62,
        familyHistory: "unknown",
        strategySelection: "fit",
      }),
    );
    expect(result.code).toBe("MORE_INFORMATION_NEEDED");
    expect(result.triggerTrackIds).toContain(CCR_IDS.tracks.familyStatus);
  });

  it("preserves genuine shared decision instead of manufacturing a modality", () => {
    const result = boundary(
      draft({
        policyId: policyId("br_ampliado"),
        ageYears: 47,
      }),
    );
    expect(result.code).toBe("SHARED_DECISION");
  });

  it("represents an age path without a new routine action as SCREENING_NOT_INDICATED", () => {
    const result = boundary(draft({ ageYears: 76 }));
    expect(result.code).toBe("SCREENING_NOT_INDICATED");
  });

  it("keeps provenance reachable through every trigger track instead of duplicating it in the boundary", () => {
    const evaluated = evaluate(
      draft({
        historyKnowledge: "known",
        exams: [fit("fit-positive", "2026-01-10", "positive")],
      }),
    );
    const result = deriveCcrAutomationBoundary(evaluated);
    const tracks = evaluated.evaluation.plan.topics.flatMap((topic) => topic.tracks);

    for (const trackId of result.triggerTrackIds) {
      const track = tracks.find((candidate) => candidate.trackId === trackId);
      expect(track).toBeDefined();
      expect(track?.trace.sourceIds.length).toBeGreaterThan(0);
      expect(track?.trace.rulesActivated.length).toBeGreaterThan(0);
    }
    expect("sourceIds" in result).toBe(false);
    expect("ruleIds" in result).toBe(false);
  });
});
