import { describe, expect, it } from "vitest";
import {
  MAMA_CANDIDATE_RULESET_VERSION,
  MAMA_HARD_EXIT_CONCEPTS,
  MAMA_IDS,
} from "../../src/clinical/mama";
import { parseCalendarDate, parsePartialDate } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  deriveMamaAutomationBoundary,
  evaluateMamaProduct,
  getMamaProductPolicyOptions,
  presentMamaProduct,
} from "../../src/product/mama";

const AS_OF = parseCalendarDate("2026-10-27");

type Presence = "yes" | "no" | "unknown";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const option = getMamaProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (option === undefined) throw new Error(`Missing ${family} policy`);
  return option.policyId;
}

function fact(conceptId: string, presence: Presence) {
  return {
    id: `fact-${conceptId}`,
    conceptId,
    category: "population_context" as const,
    presence,
  };
}

function baseFacts(overrides: Record<string, Presence> = {}) {
  const concepts = new Set<string>([
    MAMA_IDS.concepts.screeningContextConfirmed,
    MAMA_IDS.concepts.relevantBreastTissuePresent,
    MAMA_IDS.concepts.historySufficientForCurrentStatus,
    ...MAMA_HARD_EXIT_CONCEPTS,
  ]);
  return [...concepts].map((conceptId) =>
    fact(
      conceptId,
      overrides[conceptId] ??
        (conceptId === MAMA_IDS.concepts.screeningContextConfirmed ||
        conceptId === MAMA_IDS.concepts.relevantBreastTissuePresent ||
        conceptId === MAMA_IDS.concepts.historySufficientForCurrentStatus
          ? "yes"
          : "no"),
    ),
  );
}

function mammogram(date: string) {
  return {
    id: `mammo-${date}`,
    topicId: MAMA_IDS.topic,
    modality: MAMA_IDS.modalities.mammographyScreening,
    status: "performed" as const,
    date: parsePartialDate(date),
    result: {
      status: "final" as const,
      code: MAMA_IDS.results.routineClearing,
    },
    quality: "adequate" as const,
    completeness: "complete" as const,
    resolutionInformation: "sufficient" as const,
  };
}

function patient(args: {
  age: number;
  history?: "known" | "never_performed" | "unknown";
  mammogramDate?: string;
  overrides?: Record<string, Presence>;
}) {
  return PatientSchema.parse({
    context: { ageYears: args.age },
    facts: baseFacts(args.overrides),
    examHistory:
      args.mammogramDate === undefined ? [] : [mammogram(args.mammogramDate)],
    historyKnowledge: {
      [MAMA_IDS.topic]: args.history ?? "never_performed",
    },
  });
}

function evaluate(args: {
  family?: "sus_oficial" | "br_ampliado" | "internacional";
  age?: number;
  history?: "known" | "never_performed" | "unknown";
  mammogramDate?: string;
  overrides?: Record<string, Presence>;
  careSetting?: { resources: Record<string, "available" | "unavailable" | "unknown"> };
}) {
  const result = evaluateMamaProduct({
    patient: patient({
      age: args.age ?? 55,
      ...(args.history === undefined ? {} : { history: args.history }),
      ...(args.mammogramDate === undefined
        ? {}
        : { mammogramDate: args.mammogramDate }),
      ...(args.overrides === undefined ? {} : { overrides: args.overrides }),
    }),
    policyId: policyId(args.family ?? "sus_oficial"),
    asOf: AS_OF,
    ...(args.careSetting === undefined ? {} : { careSetting: args.careSetting }),
  });
  if (!result.ok) throw new Error(result.message);
  return result;
}

describe("Mama product automation boundary", () => {
  it("consumes only the canonical active Mama candidate and exposes clean policy labels", () => {
    const options = getMamaProductPolicyOptions();
    expect(options).toHaveLength(3);
    expect(options.every((option) => !option.label.toLowerCase().includes("draft"))).toBe(true);
    expect(evaluate({}).rulesetVersion).toBe(MAMA_CANDIDATE_RULESET_VERSION);
  });

  it("maps ordinary eligible never-screened SUS care to ROUTINE_DUE", () => {
    const result = evaluate({ age: 55 });
    const boundary = deriveMamaAutomationBoundary(result);
    expect(boundary).toMatchObject({
      contractVersion: "mama-B1",
      code: "ROUTINE_DUE",
      provenanceCarrier: "track_trace",
    });
    expect(boundary.triggerTrackIds).toContain(MAMA_IDS.tracks.routine);
  });

  it("maps a recent qualifying mammogram to ROUTINE_CURRENT", () => {
    const boundary = deriveMamaAutomationBoundary(
      evaluate({ age: 55, history: "known", mammogramDate: "2025-11-10" }),
    );
    expect(boundary.code).toBe("ROUTINE_CURRENT");
    expect(boundary.triggerTrackIds).toContain(MAMA_IDS.tracks.routine);
  });

  it("preserves the different Mama SharedDecision reasons", () => {
    const sus = deriveMamaAutomationBoundary(evaluate({ age: 45 }));
    expect(sus).toMatchObject({
      code: "SHARED_DECISION",
      reasonCode: "outside-population-core-access-on-demand",
    });

    const expanded = deriveMamaAutomationBoundary(
      evaluate({ family: "br_ampliado", age: 76 }),
    );
    expect(expanded).toMatchObject({
      code: "SHARED_DECISION",
      reasonCode: "continuation-conditioned-on-health-horizon",
    });
  });

  it("preserves USPSTF 75+ insufficient evidence without manufacturing a positive recommendation", () => {
    const evaluated = evaluate({ family: "internacional", age: 76 });
    const boundary = deriveMamaAutomationBoundary(evaluated);
    expect(boundary).toMatchObject({
      code: "SHARED_DECISION",
      reasonCode: "insufficient-evidence",
    });
    const presented = presentMamaProduct(evaluated);
    expect(presented.surface.title).toBe("Decisão individual");
    expect(presented.surface.detail.toLowerCase()).toContain("insuficiente");
  });

  it("uses the reviewed decision context for average-risk under-40 closure", () => {
    const evaluated = evaluate({ age: 35 });
    const boundary = deriveMamaAutomationBoundary(evaluated);
    expect(boundary).toMatchObject({
      code: "SCREENING_NOT_INDICATED",
      reasonCode: "under40-routine-not-recommended",
      provenanceCarrier: "decision_context",
      triggerTrackIds: [],
    });
    expect(evaluated.decisionContext?.routineScopeDisposition).toBe("applied");
    expect(evaluated.decisionContext?.additionalSourceRefs.length).toBeGreaterThan(0);
  });

  it("keeps USPSTF under 40 outside recommendation scope rather than labeling it recommend-against", () => {
    const evaluated = evaluate({ family: "internacional", age: 35 });
    const presented = presentMamaProduct(evaluated);
    expect(presented.automationBoundary).toMatchObject({
      code: "SCREENING_NOT_INDICATED",
      reasonCode: "under40-outside-recommendation-scope",
      provenanceCarrier: "decision_context",
    });
    expect(presented.surface.title).toBe("Fora do escopo da recomendação");
  });

  it("puts hard exits above the under-40 age closure", () => {
    const evaluated = evaluate({
      age: 35,
      overrides: { [MAMA_IDS.concepts.highRiskGeneticContext]: "yes" },
    });
    const boundary = deriveMamaAutomationBoundary(evaluated);
    expect(boundary.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(boundary.triggerTrackIds).toContain(MAMA_IDS.tracks.specialRisk);
    expect(evaluated.decisionContext?.routineScopeDisposition).toBe(
      "suppressed_by_safety_track",
    );
  });

  it("maps active breast-specific care to SPECIFIC_CARE_ACTIVE", () => {
    const evaluated = evaluate({
      age: 55,
      overrides: { [MAMA_IDS.concepts.specificBreastCareActive]: "yes" },
    });
    const boundary = deriveMamaAutomationBoundary(evaluated);
    expect(boundary.code).toBe("SPECIFIC_CARE_ACTIVE");
    expect(boundary.triggerTrackIds).toContain(MAMA_IDS.tracks.specificCare);
    expect(presentMamaProduct(evaluated).surface.title).toBe(
      "Em acompanhamento específico",
    );
  });

  it("does not close under 40 when a safety fact is unknown", () => {
    const evaluated = evaluate({
      age: 35,
      overrides: { [MAMA_IDS.concepts.highRiskGeneticContext]: "unknown" },
    });
    const boundary = deriveMamaAutomationBoundary(evaluated);
    expect(boundary.code).toBe("MORE_INFORMATION_NEEDED");
    expect(evaluated.decisionContext?.routineScopeDisposition).toBe(
      "suppressed_by_incomplete_safety_assessment",
    );
  });

  it("asks mammography availability only when an actionable mammography is due", () => {
    const dueUnknown = presentMamaProduct(evaluate({ age: 55 }));
    expect(dueUnknown.requestedInputs).toEqual(["mammography_availability"]);

    const dueAvailable = presentMamaProduct(
      evaluate({
        age: 55,
        careSetting: {
          resources: { [MAMA_IDS.resources.mammography]: "available" },
        },
      }),
    );
    expect(dueAvailable.requestedInputs).toEqual([]);
    const actions = dueAvailable.sections.flatMap((section) =>
      section.cards.flatMap((card) => card.actions),
    );
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resourceId: MAMA_IDS.resources.mammography,
          operational: expect.objectContaining({
            availability: "available",
            route: "local",
          }),
        }),
      ]),
    );

    const current = presentMamaProduct(
      evaluate({ age: 55, history: "known", mammogramDate: "2025-11-10" }),
    );
    expect(current.requestedInputs).toEqual([]);
  });

  it("keeps provenance reachable instead of duplicating citations in the boundary", () => {
    const evaluated = evaluate({
      age: 55,
      overrides: { [MAMA_IDS.concepts.priorBreastCancer]: "yes" },
    });
    const boundary = deriveMamaAutomationBoundary(evaluated);
    expect(boundary.provenanceCarrier).toBe("track_trace");
    for (const trackId of boundary.triggerTrackIds) {
      const track = evaluated.evaluation.plan.topics
        .flatMap((topic) => topic.tracks)
        .find((candidate) => candidate.trackId === trackId);
      expect(track?.trace.sourceRefs.length).toBeGreaterThan(0);
      expect(track?.trace.rulesActivated.length).toBeGreaterThan(0);
    }
    expect("sourceIds" in boundary).toBe(false);
    expect("sourceRefs" in boundary).toBe(false);
  });
});
