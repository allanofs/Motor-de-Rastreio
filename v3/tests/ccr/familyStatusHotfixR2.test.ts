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
  CCR_H1_FAMILY_STATUS_RULE_IDS,
} from "../../src/clinical/ccr/h1FamilyStatusCandidate";
import {
  CCR_H1_R1_REVIEWER,
  ccrPhase6H1R1Ruleset,
} from "../../src/clinical/ccr/h1FamilyStatusR1Candidate";
import {
  CCR_H1_R2_REVIEWED_AT,
  CCR_H1_R2_REVIEWER_PUBLIC_ID,
  CCR_H1_R2_RULESET_VERSION,
  ccrPhase6H1R2Policies,
  ccrPhase6H1R2Resolvers,
  ccrPhase6H1R2Ruleset,
} from "../../src/clinical/ccr/h1FamilyStatusR2Candidate";
import {
  CCR_FAMILY_DETAIL_KEYS,
  CCR_FAMILY_VALUES,
  CCR_IDS,
  CCR_STRATEGY_VALUES,
} from "../../src/clinical/ccr/terminology";

const asOf = day("2026-10-25");
const hotfixRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

function stripReviewGovernance(rule: RuleDefinition) {
  const { reviewStatus: _reviewStatus, governance, ...clinicalRule } = rule;
  const { reviews: _reviews, ...governanceWithoutReviews } = governance;
  return { ...clinicalRule, governance: governanceWithoutReviews };
}

function activateH1Preview(rule: RuleDefinition): RuleDefinition {
  if (!hotfixRuleIds.has(rule.ruleId)) return structuredClone(rule);
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "active",
  });
}

function previewRuleset(): Ruleset {
  return RulesetSchema.parse({
    ...ccrPhase6H1R2Ruleset,
    rules: ccrPhase6H1R2Ruleset.rules.map(activateH1Preview),
  });
}

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const policy = ccrPhase6H1R2Policies.find((candidate) => candidate.family === family);
  if (policy === undefined) throw new Error(`Missing policy family ${family}`);
  return policy.policyId;
}

function familyFact(presence: "no" | "unknown" | "yes") {
  if (presence !== "yes") {
    return {
      id: `family-${presence}`,
      conceptId: CCR_IDS.concepts.familyHistoryRelevant,
      category: "family_history" as const,
      presence,
    };
  }

  return {
    id: "family-positive-high-risk",
    conceptId: CCR_IDS.concepts.familyHistoryRelevant,
    category: "family_history" as const,
    presence: "yes" as const,
    details: {
      [CCR_FAMILY_DETAIL_KEYS.affectedFdrCount]: 1,
      [CCR_FAMILY_DETAIL_KEYS.affectedSdrCount]: 0,
      [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand]:
        CCR_FAMILY_VALUES.ageUnder60,
      [CCR_FAMILY_DETAIL_KEYS.findingType]: CCR_FAMILY_VALUES.crc,
    },
  };
}

function patient(input: {
  family: "no" | "unknown" | "yes";
  strategy?: "fit" | "colonoscopy";
}) {
  return PatientSchema.parse({
    context: { ageYears: 55 },
    facts: [
      {
        id: "screening-context",
        conceptId: CCR_IDS.concepts.screeningContextConfirmed,
        category: "population_context",
        presence: "yes",
      },
      {
        id: "no-prior-crc",
        conceptId: CCR_IDS.concepts.priorCrc,
        category: "condition",
        presence: "no",
      },
      {
        id: "no-prior-polyp",
        conceptId: CCR_IDS.concepts.priorPolypSurveillance,
        category: "condition",
        presence: "no",
      },
      {
        id: "no-ibd",
        conceptId: CCR_IDS.concepts.colonicIbd,
        category: "condition",
        presence: "no",
      },
      {
        id: "no-hereditary-syndrome",
        conceptId: CCR_IDS.concepts.hereditarySyndrome,
        category: "condition",
        presence: "no",
      },
      familyFact(input.family),
      ...(input.strategy === undefined
        ? []
        : [
            {
              id: `strategy-${input.strategy}`,
              conceptId: CCR_IDS.concepts.screeningStrategySelection,
              category: "population_context" as const,
              presence: "yes" as const,
              value:
                input.strategy === "fit"
                  ? CCR_STRATEGY_VALUES.fit
                  : CCR_STRATEGY_VALUES.colonoscopy,
            },
          ]),
    ],
    examHistory: [],
    historyKnowledge: { [CCR_IDS.topic]: "never_performed" },
  });
}

function run(
  ruleset: Ruleset,
  family: "sus_oficial" | "br_ampliado" | "internacional",
  p: ReturnType<typeof patient>,
) {
  return evaluatePatient({
    patient: p,
    ruleset,
    policyId: policyId(family),
    asOf,
    extensions: ccrPhase6H1R2Resolvers,
  });
}

function track(result: ReturnType<typeof run>, trackId: string) {
  const found = result.plan.topics[0]?.tracks.find(
    (candidate) => candidate.trackId === trackId,
  );
  if (found === undefined) throw new Error(`Missing track ${trackId}`);
  return found;
}

describe("Phase 6.H1 R2 governance-only promotion", () => {
  it("records the same privacy-preserving independent R2 handle on only the three changed rules", () => {
    expect(CCR_H1_R2_RULESET_VERSION).toBe(
      "crc-0.5.8-phase6-h1-r2-reviewed-draft",
    );
    expect(CCR_H1_R2_REVIEWER_PUBLIC_ID).toBe(
      "external-physician-r2-private-001",
    );
    expect(CCR_H1_R2_REVIEWED_AT).toEqual(asOf);

    for (const rule of ccrPhase6H1R2Ruleset.rules) {
      const before = ccrPhase6H1R1Ruleset.rules.find(
        (candidate) => candidate.ruleId === rule.ruleId,
      );
      expect(before).toBeDefined();

      if (hotfixRuleIds.has(rule.ruleId)) {
        expect(rule.lifecycleStatus).toBe("draft");
        expect(rule.reviewStatus).toBe("reviewed_by_2");
        expect(rule.governance.reviews).toHaveLength(2);
        expect(rule.governance.reviews[0]?.reviewer).toBe(CCR_H1_R1_REVIEWER);
        expect(rule.governance.reviews[1]?.reviewer).toBe(
          CCR_H1_R2_REVIEWER_PUBLIC_ID,
        );
        expect(rule.governance.reviews[0]?.reviewer).not.toBe(
          rule.governance.reviews[1]?.reviewer,
        );
        expect(stripReviewGovernance(rule)).toEqual(stripReviewGovernance(before!));
      } else {
        expect(rule).toEqual(before);
      }
    }
  });

  it("preserves the R2 snapshot as draft audit history after later activation", () => {
    for (const rule of ccrPhase6H1R2Ruleset.rules.filter((candidate) =>
      hotfixRuleIds.has(candidate.ruleId),
    )) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("reviewed_by_2");
      expect(rule.governance.reviews).toHaveLength(2);
    }
  });

  it("preserves policies, resolvers, sources and terminology across the R2 governance step", () => {
    expect(ccrPhase6H1R2Ruleset.policies).toEqual(ccrPhase6H1R1Ruleset.policies);
    expect(ccrPhase6H1R2Ruleset.sources).toEqual(ccrPhase6H1R1Ruleset.sources);
    expect(ccrPhase6H1R2Ruleset.terminology).toEqual(
      ccrPhase6H1R1Ruleset.terminology,
    );
  });
});

describe("Phase 6.H1 R2 behavior preview", () => {
  const preview = previewRuleset();

  it("keeps negative family history out of clinical review and unknown distinct from negative", () => {
    for (const family of ["sus_oficial", "br_ampliado", "internacional"] as const) {
      const negative =
        family === "sus_oficial"
          ? patient({ family: "no" })
          : patient({ family: "no", strategy: "fit" });
      expect(track(run(preview, family, negative), CCR_IDS.tracks.familyStatus).state.status).toBe(
        "NotApplicable",
      );
      expect(
        track(run(preview, family, patient({ family: "unknown" })), CCR_IDS.tracks.familyStatus)
          .state.status,
      ).toBe("Indeterminate");
    }
  });

  it("preserves positive-family review in SUS/BA-A and International delegation", () => {
    for (const family of ["sus_oficial", "br_ampliado"] as const) {
      expect(
        track(run(preview, family, patient({ family: "yes" })), CCR_IDS.tracks.familyStatus)
          .state.status,
      ).toBe("ClinicalReviewRequired");
    }

    const international = run(preview, "internacional", patient({ family: "yes" }));
    expect(track(international, CCR_IDS.tracks.familyStatus).state.status).toBe(
      "NotApplicable",
    );
    expect(track(international, CCR_IDS.tracks.familyHighRisk).state.status).toBe("Due");
  });

  it("preserves BA-A FIT strategy after negative family history", () => {
    const result = run(
      preview,
      "br_ampliado",
      patient({ family: "no", strategy: "fit" }),
    );
    expect(track(result, CCR_IDS.tracks.familyStatus).state.status).toBe(
      "NotApplicable",
    );
    expect(track(result, CCR_IDS.tracks.fitStrategy).state.status).toBe("Due");
  });
});
