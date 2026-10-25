import { describe, expect, it } from "vitest";
import {
  colonoscopyScreeningAction,
  diagnosticColonoscopyAfterPositiveFitAction,
  fitScreeningAction,
} from "../../src/clinical/ccr";
import {
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
  presentCcrProduct,
} from "../../src/product/ccr";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const policy = getCcrProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (policy === undefined) throw new Error(`Missing ${family} policy`);
  return policy.policyId;
}

function baseDraft(overrides: Record<string, unknown> = {}) {
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

function actionIds(result: ReturnType<typeof evaluate>) {
  return result.evaluation.plan.actions.map((action) => action.actionId);
}

function presented(input: unknown) {
  return presentCcrProduct(evaluate(input));
}

function sectionStatuses(
  model: ReturnType<typeof presented>,
  sectionId: string,
) {
  return (
    model.sections.find((section) => section.id === sectionId)?.cards.map(
      (card) => card.status,
    ) ?? []
  );
}

describe("CCR Phase 7.3 end-to-end product scenarios", () => {
  it("SUS: 49 years stays outside new routine without a screening action", () => {
    const result = evaluate(baseDraft({ ageYears: 49 }));
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
    expect(
      result.sections
        .find((section) => section.id === "current_followup")
        ?.cards.some((card) => card.track.state.status === "NotApplicable"),
    ).toBe(true);
  });

  it.each([50, 75])(
    "SUS: age %i with confirmed never-screened history reaches FIT action",
    (ageYears) => {
      const result = evaluate(baseDraft({ ageYears }));
      expect(actionIds(result)).toContain(fitScreeningAction.actionId);
      expect(sectionStatuses(presentCcrProduct(result), "do_now")).toContain(
        "Due",
      );
    },
  );

  it("SUS: 76 years does not start a new routine FIT action", () => {
    const result = evaluate(baseDraft({ ageYears: 76 }));
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
  });

  it("SUS: open FIT-positive episode produces diagnostic colonoscopy and no repeat routine FIT", () => {
    const result = evaluate(
      baseDraft({
        historyKnowledge: "known",
        exams: [
          {
            kind: "fit",
            id: "fit-positive",
            status: "performed",
            date: "2026-01-10",
            result: "positive",
          },
        ],
      }),
    );
    expect(actionIds(result)).toContain(
      diagnosticColonoscopyAfterPositiveFitAction.actionId,
    );
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
    expect(sectionStatuses(presentCcrProduct(result), "do_now")).toContain(
      "InFollowUp",
    );
  });

  it("SUS: a later negative FIT does not close an earlier positive FIT", () => {
    const result = evaluate(
      baseDraft({
        historyKnowledge: "known",
        exams: [
          {
            kind: "fit",
            id: "fit-positive",
            status: "performed",
            date: "2025-01-10",
            result: "positive",
          },
          {
            kind: "fit",
            id: "fit-negative-later",
            status: "performed",
            date: "2026-01-10",
            result: "negative",
          },
        ],
      }),
    );
    expect(actionIds(result)).toContain(
      diagnosticColonoscopyAfterPositiveFitAction.actionId,
    );
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
  });

  it("SUS: adequate complete normal post-FIT colonoscopy closes the diagnostic action without inventing a new routine clock", () => {
    const result = evaluate(
      baseDraft({
        historyKnowledge: "known",
        historySufficientForCurrentStatus: "yes",
        exams: [
          {
            kind: "fit",
            id: "fit-positive",
            status: "performed",
            date: "2025-01-10",
            result: "positive",
          },
          {
            kind: "colonoscopy",
            id: "diagnostic-colono",
            status: "performed",
            role: "post_fit_positive",
            date: "2025-02-10",
            result: "normal",
            preparation: "adequate",
            completeness: "complete",
            resolutionInformation: "sufficient",
          },
        ],
      }),
    );
    expect(actionIds(result)).not.toContain(
      diagnosticColonoscopyAfterPositiveFitAction.actionId,
    );
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
    expect(
      sectionStatuses(presentCcrProduct(result), "clinical_review").includes(
        "ClinicalReviewRequired",
      ) ||
        sectionStatuses(
          presentCcrProduct(result),
          "current_followup",
        ).includes("NotApplicable"),
    ).toBe(true);
  });

  it("BA-A: age 47 presents SharedDecision instead of an automatic screening modality", () => {
    const result = evaluate(
      baseDraft({
        policyId: policyId("br_ampliado"),
        ageYears: 47,
      }),
    );
    const model = presentCcrProduct(result);
    expect(sectionStatuses(model, "shared_decision")).toContain(
      "SharedDecision",
    );
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
    expect(actionIds(result)).not.toContain(colonoscopyScreeningAction.actionId);
  });

  it("BA-A: explicit primary-colonoscopy selection at 60 produces the selected strategy only", () => {
    const result = evaluate(
      baseDraft({
        policyId: policyId("br_ampliado"),
        strategySelection: "colonoscopy",
      }),
    );
    expect(actionIds(result)).toContain(colonoscopyScreeningAction.actionId);
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
  });

  it("International: explicit FIT selection at 60 produces annual-strategy FIT action without autonomous colonoscopy", () => {
    const result = evaluate(
      baseDraft({
        policyId: policyId("internacional"),
        strategySelection: "fit",
      }),
    );
    expect(actionIds(result)).toContain(fitScreeningAction.actionId);
    expect(actionIds(result)).not.toContain(colonoscopyScreeningAction.actionId);
  });

  it("International: unknown family history preserves age-based need while withholding a definitive routine modality", () => {
    const result = evaluate(
      baseDraft({
        policyId: policyId("internacional"),
        ageYears: 62,
        familyHistory: "unknown",
        strategySelection: "fit",
      }),
    );
    expect(
      result.sections
        .flatMap((section) => section.cards)
        .some((card) => card.track.state.status === "Due"),
    ).toBe(true);
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
    expect(actionIds(result)).not.toContain(colonoscopyScreeningAction.actionId);
  });

  it("International: selected high-risk family pattern routes to the ACG colonoscopy pathway", () => {
    const result = evaluate(
      baseDraft({
        policyId: policyId("internacional"),
        familyHistory: "yes",
        familyDetails: {
          affectedFdrCount: 1,
          affectedSdrCount: 0,
          youngestDiagnosisAgeBand: "under-60",
          youngestDiagnosisAgeYears: 42,
          findingType: "crc",
        },
        historyKnowledge: "never_performed",
      }),
    );
    expect(actionIds(result)).toContain(colonoscopyScreeningAction.actionId);
    expect(actionIds(result)).not.toContain(fitScreeningAction.actionId);
  });

  it("hard exclusion: prior CRC never falls through to average-risk screening action", () => {
    const model = presented(baseDraft({ priorCrc: "yes" }));
    expect(sectionStatuses(model, "clinical_review")).toContain(
      "ClinicalReviewRequired",
    );
    expect(
      model.sections
        .flatMap((section) => section.cards)
        .flatMap((card) => card.actions)
        .some(
          (action) =>
            action.actionId === fitScreeningAction.actionId ||
            action.actionId === colonoscopyScreeningAction.actionId,
        ),
    ).toBe(false);
  });

  it("care setting: unavailable colonoscopy changes operational route but keeps FIT-positive follow-up", () => {
    const result = evaluate(
      baseDraft({
        historyKnowledge: "known",
        careSetting: { colonoscopy: "unavailable" },
        exams: [
          {
            kind: "fit",
            id: "fit-positive",
            status: "performed",
            date: "2026-01-10",
            result: "positive",
          },
        ],
      }),
    );
    const action = result.evaluation.plan.actions.find(
      (candidate) =>
        candidate.actionId ===
        diagnosticColonoscopyAfterPositiveFitAction.actionId,
    );
    expect(action?.operational).toEqual({
      availability: "unavailable",
      route: "referral",
    });
    expect(
      sectionStatuses(presentCcrProduct(result), "do_now"),
    ).toContain("InFollowUp");
  });

  it("temporal ambiguity: same-day FIT-positive and diagnostic colonoscopy does not infer resolution", () => {
    const model = presented(
      baseDraft({
        historyKnowledge: "known",
        exams: [
          {
            kind: "fit",
            id: "fit-positive",
            status: "performed",
            date: "2026-03-10",
            result: "positive",
          },
          {
            kind: "colonoscopy",
            id: "same-day-colono",
            status: "performed",
            role: "post_fit_positive",
            date: "2026-03-10",
            result: "normal",
            preparation: "adequate",
            completeness: "complete",
            resolutionInformation: "sufficient",
          },
        ],
      }),
    );
    expect(sectionStatuses(model, "missing_information")).toContain(
      "Indeterminate",
    );
  });

  it("invalid raw input safe-fails before any clinical presentation is created", () => {
    const result = evaluateCcrProductDraft({
      policyId: policyId("sus_oficial"),
      asOf: "not-a-date",
    });
    expect(result).toMatchObject({
      ok: false,
      stage: "normalization",
      code: "invalid_form",
      releaseGate: "integration-only-not-authorized-for-real-world-use",
    });
  });
});
