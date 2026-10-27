import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import { RuleDefinitionSchema, RulesetSchema } from "../../src/model/content";
import { parseCalendarDate } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  MAMA_HARD_EXIT_CONCEPTS,
  MAMA_IDS,
  MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT,
  MAMA_M3_1_PROPOSITION_IDS,
  MAMA_M3_1_SCOPE_VERSION,
  MAMA_SHARED_DECISION_REASONS,
  MAMA_UNDER40_SCOPE_BY_POLICY,
  mamaBrasilAmpliadoM3DraftPolicy,
  mamaInternationalM3DraftPolicy,
  mamaM31EvidencePropositions,
  mamaM3R2Ruleset,
  mamaSharedDecisionReason,
  mamaSources,
  mamaSusM3DraftPolicy,
  resolveMamaUnder40RoutineScope,
} from "../../src/clinical/mama";

const AS_OF = parseCalendarDate("2026-10-26");

function activeR2PreviewRuleset() {
  const rules = mamaM3R2Ruleset.rules.map((rule) =>
    RuleDefinitionSchema.parse({ ...rule, lifecycleStatus: "active" }),
  );
  return RulesetSchema.parse({
    ...mamaM3R2Ruleset,
    rulesetVersion: "breast-0.1.2-m3-r2-synthetic-active-preview",
    rules,
  });
}

const PREVIEW = activeR2PreviewRuleset();

function fact(
  conceptId: string,
  presence: "yes" | "no" | "unknown" = "no",
) {
  return {
    id: `fact-${conceptId}`,
    conceptId,
    category: "population_context" as const,
    presence,
  };
}

function patient(
  age: number,
  overrides: Record<string, "yes" | "no" | "unknown"> = {},
) {
  const concepts = new Set<string>([
    MAMA_IDS.concepts.screeningContextConfirmed,
    MAMA_IDS.concepts.relevantBreastTissuePresent,
    MAMA_IDS.concepts.historySufficientForCurrentStatus,
    ...MAMA_HARD_EXIT_CONCEPTS,
  ]);
  const facts = [...concepts].map((conceptId) =>
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
  return PatientSchema.parse({
    context: { ageYears: age },
    facts,
    examHistory: [],
    historyKnowledge: { [MAMA_IDS.topic]: "never_performed" },
  });
}

function run(policyId: string, p: ReturnType<typeof patient>) {
  return evaluatePatient({
    patient: p,
    ruleset: PREVIEW,
    asOf: AS_OF,
    policyId,
  });
}

function track(result: ReturnType<typeof run>, trackId: string) {
  const topic = result.plan.topics.find((item) => item.topicId === MAMA_IDS.topic);
  if (topic === undefined) throw new Error("Missing Mama topic");
  const found = topic.tracks.find((item) => item.trackId === trackId);
  if (found === undefined) throw new Error(`Missing Mama track ${trackId}`);
  return found;
}

describe("Mama M3.1 under-40 scope", () => {
  it("keeps all M3.1 scope evidence source-backed and source-verified", () => {
    const knownSourceIds = new Set(mamaSources.map((source) => source.sourceId));
    expect(mamaM31EvidencePropositions).toHaveLength(3);
    expect(new Set(mamaM31EvidencePropositions.map((p) => p.propositionId))).toEqual(
      new Set(Object.values(MAMA_M3_1_PROPOSITION_IDS)),
    );
    for (const proposition of mamaM31EvidencePropositions) {
      expect(proposition.status).toBe("source_verified");
      expect(proposition.sourceRefs.length).toBeGreaterThan(0);
      for (const ref of proposition.sourceRefs) {
        expect(knownSourceIds.has(ref.sourceId)).toBe(true);
        expect(ref.locator.length).toBeGreaterThan(0);
      }
    }
  });

  it("represents under-40 scope faithfully without a universal recommend_against", () => {
    expect(MAMA_M3_1_SCOPE_VERSION).toContain("source-verified-draft");
    expect(resolveMamaUnder40RoutineScope("sus_oficial", 35)?.conclusion).toBe(
      "routine_not_recommended",
    );
    expect(resolveMamaUnder40RoutineScope("br_ampliado", 35)?.conclusion).toBe(
      "routine_not_recommended",
    );
    expect(resolveMamaUnder40RoutineScope("internacional", 35)?.conclusion).toBe(
      "outside_recommendation_scope",
    );
    expect(resolveMamaUnder40RoutineScope("internacional", 40)).toBeNull();
    for (const resolution of Object.values(MAMA_UNDER40_SCOPE_BY_POLICY)) {
      expect(resolution.lifecycleStatus).toBe("draft");
      expect(resolution.reviewStatus).toBe("source_verified");
      expect(resolution.sourceRefs.length).toBeGreaterThan(0);
    }
  });

  it("keeps SharedDecision reason semantics breast-specific", () => {
    expect(
      mamaSharedDecisionReason("breast.sus.population.40-49-shared-decision"),
    ).toBe(MAMA_SHARED_DECISION_REASONS.outsidePopulationCoreAccessOnDemand);
    expect(
      mamaSharedDecisionReason("breast.sus.population.75-plus-shared-decision"),
    ).toBe(MAMA_SHARED_DECISION_REASONS.outsidePopulationCoreAccessOnDemand);
    expect(
      mamaSharedDecisionReason("breast.ba.population.75-plus-shared-decision"),
    ).toBe(
      MAMA_SHARED_DECISION_REASONS.continuationConditionedOnHealthHorizon,
    );
  });

  it("hardens known high familial risk as an externally established state", () => {
    expect(MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT.conceptId).toBe(
      MAMA_IDS.concepts.knownHighRiskFamilialContext,
    );
    expect(
      MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT.mustNotInferFrom.some(
        (text) => text.includes("single first-degree relative"),
      ),
    ).toBe(true);
    expect(
      MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT.calculationsOutsideV1,
    ).toEqual(["Gail", "Tyrer-Cuzick", "BOADICEA"]);
  });

  it("keeps hard exits effective before routine age closure in people under 40", () => {
    const policies = [
      mamaSusM3DraftPolicy.policyId,
      mamaBrasilAmpliadoM3DraftPolicy.policyId,
      mamaInternationalM3DraftPolicy.policyId,
    ];
    const hardExitConcepts = [
      MAMA_IDS.concepts.suspiciousBreastSymptoms,
      MAMA_IDS.concepts.highRiskGeneticContext,
      MAMA_IDS.concepts.knownHighRiskFamilialContext,
      MAMA_IDS.concepts.priorHighRiskChestRadiation,
    ];

    for (const policyId of policies) {
      for (const conceptId of hardExitConcepts) {
        const result = run(policyId, patient(35, { [conceptId]: "yes" }));
        expect(track(result, MAMA_IDS.tracks.specialRisk).state.status).toBe(
          "ClinicalReviewRequired",
        );
        expect(track(result, MAMA_IDS.tracks.routine).state.status).toBe(
          "NotApplicable",
        );
      }
    }
  });

  it("average-risk under-40 remains a routine NotApplicable engine state with domain provenance", () => {
    const cases = [
      { policyId: mamaSusM3DraftPolicy.policyId, family: "sus_oficial" as const },
      {
        policyId: mamaBrasilAmpliadoM3DraftPolicy.policyId,
        family: "br_ampliado" as const,
      },
      {
        policyId: mamaInternationalM3DraftPolicy.policyId,
        family: "internacional" as const,
      },
    ];
    for (const item of cases) {
      const result = run(item.policyId, patient(35));
      expect(track(result, MAMA_IDS.tracks.routine).state.status).toBe(
        "NotApplicable",
      );
      const provenance = resolveMamaUnder40RoutineScope(item.family, 35);
      expect(provenance).not.toBeNull();
      expect(provenance?.sourceRefs.length).toBeGreaterThan(0);
    }
  });
});
