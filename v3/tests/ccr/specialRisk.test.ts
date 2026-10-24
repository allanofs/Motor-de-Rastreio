import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
  type Ruleset,
} from "../../src/model/content";
import { parseCalendarDate as day } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  brasilAmpliadoPhase65Policy,
  ccrPhase64Resolvers,
  ccrPhase65Ruleset,
  internationalPhase65Policy,
  susPhase65Policy,
} from "../../src/clinical/ccr";
import { CCR_IDS } from "../../src/clinical/ccr/terminology";

const asOf = day("2026-10-24");

const baseFacts = [
  {
    id: "scope",
    conceptId: CCR_IDS.concepts.screeningContextConfirmed,
    category: "population_context" as const,
    presence: "yes" as const,
  },
  {
    id: "no-prior-crc",
    conceptId: CCR_IDS.concepts.priorCrc,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "no-polyp-surveillance",
    conceptId: CCR_IDS.concepts.priorPolypSurveillance,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "no-ibd",
    conceptId: CCR_IDS.concepts.colonicIbd,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "no-hereditary",
    conceptId: CCR_IDS.concepts.hereditarySyndrome,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "family-none",
    conceptId: CCR_IDS.concepts.familyHistoryRelevant,
    category: "family_history" as const,
    presence: "no" as const,
  },
  {
    id: "history-sufficient",
    conceptId: CCR_IDS.concepts.historySufficientForCurrentStatus,
    category: "population_context" as const,
    presence: "yes" as const,
  },
];

function withPositive(conceptId: string) {
  return baseFacts.map((fact) =>
    fact.conceptId === conceptId
      ? { ...fact, id: `${conceptId}-yes`, presence: "yes" as const }
      : fact,
  );
}

function patient(conceptId: string) {
  return PatientSchema.parse({
    context: { ageYears: 60 },
    facts: withPositive(conceptId),
    examHistory: [],
    historyKnowledge: { [CCR_IDS.topic]: "known" },
  });
}

function testPromote(rule: RuleDefinition): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "active",
    reviewStatus: "reviewed_by_1",
    governance: {
      ...rule.governance,
      reviews: [
        {
          reviewer: "phase6.5-special-risk-test-only-not-a-clinical-review",
          reviewedAt: asOf,
        },
      ],
    },
  });
}

function previewRuleset(policyId: string): Ruleset {
  const policy = ccrPhase65Ruleset.policies.find((item) => item.policyId === policyId);
  if (policy === undefined) throw new Error(`Unknown policy ${policyId}`);
  const selected = new Set(policy.ruleIds);
  return RulesetSchema.parse({
    ...ccrPhase65Ruleset,
    rules: ccrPhase65Ruleset.rules.map((rule) =>
      selected.has(rule.ruleId) ? testPromote(rule) : rule,
    ),
  });
}

function run(policyId: string, conceptId: string) {
  return evaluatePatient({
    patient: patient(conceptId),
    ruleset: previewRuleset(policyId),
    policyId,
    asOf,
    extensions: ccrPhase64Resolvers,
  });
}

function specialRiskTrack(result: ReturnType<typeof run>) {
  const track = result.plan.topics[0]?.tracks.find(
    (item) => item.trackId === CCR_IDS.tracks.specialRisk,
  );
  if (track === undefined) throw new Error("Missing special-risk track");
  return track;
}

const policies = [
  susPhase65Policy.policyId,
  brasilAmpliadoPhase65Policy.policyId,
  internationalPhase65Policy.policyId,
];

const hardExclusions = [
  CCR_IDS.concepts.priorCrc,
  CCR_IDS.concepts.priorPolypSurveillance,
  CCR_IDS.concepts.colonicIbd,
  CCR_IDS.concepts.hereditarySyndrome,
];

const riskCases = policies.flatMap((policyId) =>
  hardExclusions.map((conceptId) => [policyId, conceptId] as const),
);

describe("CCR Phase 6.5 special-risk correction", () => {
  it("keeps the Phase 6.5 bundle valid and every production translation draft/source_verified", () => {
    expect(ccrPhase65Ruleset.rulesetVersion).toBe("crc-0.5.0-phase6.5-draft");
    expect(
      ccrPhase65Ruleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "draft" &&
          rule.reviewStatus === "source_verified" &&
          rule.governance.reviews.length === 0,
      ),
    ).toBe(true);
  });

  it.each(policies)("uses only policy-local source families for hard exclusions under %s", (policyId) => {
    const result = run(policyId, CCR_IDS.concepts.priorCrc);
    const track = specialRiskTrack(result);
    const sourceIds = track.trace.sourceIds;
    if (policyId === susPhase65Policy.policyId) expect(sourceIds).toEqual(["crc-src-B12"]);
    if (policyId === brasilAmpliadoPhase65Policy.policyId) expect(sourceIds).toEqual(["crc-src-S01"]);
    if (policyId === internationalPhase65Policy.policyId) expect(sourceIds).toEqual(["crc-src-I01"]);
  });

  it.each(riskCases)(
    "routes %s / %s to ClinicalReviewRequired instead of simple NotApplicable",
    (policyId, conceptId) => {
      const result = run(policyId, conceptId);
      const special = specialRiskTrack(result);
      expect(special.state.status).toBe("ClinicalReviewRequired");
      expect(
        result.plan.topics.flatMap((topic) =>
          topic.tracks.flatMap((track) => track.actions.map((action) => action.actionId)),
        ),
      ).not.toContain("crc-action-fit-screening");
      expect(special.state.status).not.toBe("HandedOff");
    },
  );
});
