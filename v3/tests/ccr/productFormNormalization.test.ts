import { describe, expect, it } from "vitest";
import {
  CCR_FAMILY_DETAIL_KEYS,
  CCR_IDS,
  CCR_STRATEGY_VALUES,
} from "../../src/clinical/ccr";
import {
  getCcrProductPolicyOptions,
  normalizeCcrProductDraft,
  evaluateCcrProductDraft,
} from "../../src/product/ccr";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const policy = getCcrProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (policy === undefined) throw new Error(`Missing ${family} policy`);
  return policy.policyId;
}

const requiredKnownAnswers = {
  screeningContext: "yes" as const,
  priorCrc: "no" as const,
  priorPolypSurveillance: "no" as const,
  colonicIbd: "no" as const,
  hereditarySyndrome: "no" as const,
};

function draft(overrides: Record<string, unknown> = {}) {
  return {
    policyId: policyId("sus_oficial"),
    asOf: "2026-10-24",
    ageYears: 60,
    ...requiredKnownAnswers,
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

function expectNormalized(input: unknown) {
  const result = normalizeCcrProductDraft(input);
  if (!result.ok) throw new Error(result.issues.join("\n"));
  return result.value;
}

describe("CCR Phase 7.1 product form normalization", () => {
  it.each(["no", "unknown", "not_asked"] as const)(
    "drops stale family-detail values when familyHistory=%s",
    (familyHistory) => {
      const normalized = expectNormalized(
        draft({
          familyHistory,
          familyDetails: {
            affectedFdrCount: 2,
            affectedSdrCount: 4,
            youngestDiagnosisAgeBand: "under-60",
            youngestDiagnosisAgeYears: 41,
            findingType: "crc",
          },
        }),
      );

      const family = normalized.patient.facts.find(
        (fact) => fact.conceptId === CCR_IDS.concepts.familyHistoryRelevant,
      );

      if (familyHistory === "not_asked") {
        expect(family).toBeUndefined();
      } else {
        expect(family?.presence).toBe(familyHistory);
        expect("details" in (family ?? {})).toBe(false);
      }
      expect(JSON.stringify(normalized.patient)).not.toContain(
        CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeYears,
      );
    },
  );

  it("preserves granular family details only when the positive branch is active", () => {
    const normalized = expectNormalized(
      draft({
        policyId: policyId("internacional"),
        familyHistory: "yes",
        familyDetails: {
          affectedFdrCount: 1,
          affectedSdrCount: 0,
          youngestDiagnosisAgeBand: "under-60",
          youngestDiagnosisAgeYears: 42,
          findingType: "crc",
        },
      }),
    );

    const family = normalized.patient.facts.find(
      (fact) => fact.conceptId === CCR_IDS.concepts.familyHistoryRelevant,
    );
    expect(family?.presence).toBe("yes");
    if (family?.presence !== "yes") throw new Error("Family fact not positive");
    expect(family.details).toMatchObject({
      [CCR_FAMILY_DETAIL_KEYS.affectedFdrCount]: 1,
      [CCR_FAMILY_DETAIL_KEYS.affectedSdrCount]: 0,
      [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand]: "under-60",
      [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeYears]: 42,
      [CCR_FAMILY_DETAIL_KEYS.findingType]: "crc",
    });
  });

  it("drops stale strategy selection under SUS", () => {
    const normalized = expectNormalized(
      draft({ strategySelection: "colonoscopy" }),
    );
    expect(
      normalized.patient.facts.some(
        (fact) =>
          fact.conceptId === CCR_IDS.concepts.screeningStrategySelection,
      ),
    ).toBe(false);
  });

  it.each([
    ["br_ampliado", "fit"],
    ["internacional", "colonoscopy"],
  ] as const)(
    "preserves explicit human strategy under %s",
    (family, selection) => {
      const normalized = expectNormalized(
        draft({
          policyId: policyId(family),
          strategySelection: selection,
        }),
      );
      const fact = normalized.patient.facts.find(
        (candidate) =>
          candidate.conceptId === CCR_IDS.concepts.screeningStrategySelection,
      );
      expect(fact?.presence).toBe("yes");
      if (fact?.presence !== "yes") throw new Error("Strategy fact missing");
      expect(fact.value).toBe(
        selection === "fit"
          ? CCR_STRATEGY_VALUES.fit
          : CCR_STRATEGY_VALUES.colonoscopy,
      );
    },
  );

  it("omits not_asked facts instead of converting them to false or unknown", () => {
    const normalized = expectNormalized(
      draft({
        priorCrc: "not_asked",
        colonicIbd: "not_asked",
        specialistCareAssumed: "not_asked",
      }),
    );
    const concepts = new Set(
      normalized.patient.facts.map((fact) => fact.conceptId),
    );
    expect(concepts.has(CCR_IDS.concepts.priorCrc)).toBe(false);
    expect(concepts.has(CCR_IDS.concepts.colonicIbd)).toBe(false);
    expect(concepts.has(CCR_IDS.concepts.specialistCareAssumed)).toBe(false);
  });

  it("omits topic historyKnowledge when the UI has not asked it yet", () => {
    const normalized = expectNormalized(
      draft({ historyKnowledge: "not_asked" }),
    );
    expect(normalized.patient.historyKnowledge[CCR_IDS.topic]).toBeUndefined();
  });

  it("drops stale history-sufficiency answer unless historyKnowledge=known", () => {
    const never = expectNormalized(
      draft({
        historyKnowledge: "never_performed",
        historySufficientForCurrentStatus: "yes",
      }),
    );
    expect(
      never.patient.facts.some(
        (fact) =>
          fact.conceptId === CCR_IDS.concepts.historySufficientForCurrentStatus,
      ),
    ).toBe(false);

    const known = expectNormalized(
      draft({
        historyKnowledge: "known",
        historySufficientForCurrentStatus: "yes",
      }),
    );
    expect(
      known.patient.facts.some(
        (fact) =>
          fact.conceptId === CCR_IDS.concepts.historySufficientForCurrentStatus &&
          fact.presence === "yes",
      ),
    ).toBe(true);
  });

  it("strips performed-only stale values from a not-performed FIT", () => {
    const normalized = expectNormalized(
      draft({
        historyKnowledge: "known",
        exams: [
          {
            kind: "fit",
            id: "fit-not-performed",
            status: "not_performed",
            date: "2026-01-01",
            result: "positive",
          },
        ],
      }),
    );
    expect(normalized.patient.examHistory[0]).toEqual({
      id: "fit-not-performed",
      topicId: CCR_IDS.topic,
      modality: CCR_IDS.modalities.fit,
      status: "not_performed",
    });
  });

  it("strips performed-only stale values from an unknown colonoscopy", () => {
    const normalized = expectNormalized(
      draft({
        historyKnowledge: "known",
        exams: [
          {
            kind: "colonoscopy",
            id: "colono-unknown",
            status: "unknown",
            role: "post_fit_positive",
            date: "2025-01-01",
            result: "cancer",
            preparation: "adequate",
            completeness: "complete",
            resolutionInformation: "sufficient",
          },
        ],
      }),
    );
    expect(normalized.patient.examHistory[0]).toEqual({
      id: "colono-unknown",
      topicId: CCR_IDS.topic,
      modality: CCR_IDS.modalities.colonoscopyDiagnostic,
      status: "unknown",
    });
  });

  it.each([
    ["screening", CCR_IDS.modalities.colonoscopyScreening],
    ["post_fit_positive", CCR_IDS.modalities.colonoscopyDiagnostic],
    ["other_or_unknown", CCR_IDS.modalities.colonoscopy],
  ] as const)("maps colonoscopy role %s to the correct modality", (role, modality) => {
    const normalized = expectNormalized(
      draft({
        historyKnowledge: "known",
        exams: [
          {
            kind: "colonoscopy",
            id: `colono-${role}`,
            status: "performed",
            role,
            date: "2025-03",
            result: "normal",
            preparation: "adequate",
            completeness: "complete",
            resolutionInformation: "sufficient",
          },
        ],
      }),
    );
    expect(normalized.patient.examHistory[0]?.modality).toBe(modality);
    expect(
      normalized.patient.examHistory[0]?.status === "performed" &&
        normalized.patient.examHistory[0].date,
    ).toEqual({ year: 2025, month: 3 });
  });

  it("keeps Care Setting outside Patient and maps only canonical resource IDs", () => {
    const normalized = expectNormalized(
      draft({
        careSetting: { fit: "unavailable", colonoscopy: "available" },
      }),
    );
    expect(normalized.careSetting.resources).toEqual({
      [CCR_IDS.resources.fit]: "unavailable",
      [CCR_IDS.resources.colonoscopy]: "available",
    });
    expect(JSON.stringify(normalized.patient)).not.toContain(
      CCR_IDS.resources.fit,
    );
  });

  it("safe-fails invalid calendar input during normalization", () => {
    const result = normalizeCcrProductDraft(draft({ asOf: "2026-02-30" }));
    expect(result).toMatchObject({
      ok: false,
      stage: "normalization",
      code: "invalid_form",
      rulesetVersion: "crc-0.5.5-phase6-active",
    });
  });

  it("flows a valid raw SUS draft through normalization and the canonical engine", () => {
    const result = evaluateCcrProductDraft(draft());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected successful product evaluation");
    expect(result.rulesetVersion).toBe("crc-0.5.5-phase6-active");
    expect(
      result.sections
        .find((section) => section.id === "do_now")
        ?.cards.some((card) => card.track.state.status === "Due"),
    ).toBe(true);
    expect(
      result.evaluation.plan.actions.map((action) => action.actionId),
    ).toContain("crc-action-fit-screening");
  });
});
