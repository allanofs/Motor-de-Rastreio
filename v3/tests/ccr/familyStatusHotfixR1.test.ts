import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import { parseCalendarDate as day } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  CCR_H1_FAMILY_STATUS_RULE_IDS,
  ccrPhase6H1FamilyStatusRuleset,
} from "../../src/clinical/ccr/h1FamilyStatusCandidate";
import {
  CCR_H1_R1_REVIEWED_AT,
  CCR_H1_R1_REVIEWER,
  CCR_H1_R1_RULESET_VERSION,
  ccrPhase6H1R1Policies,
  ccrPhase6H1R1Resolvers,
  ccrPhase6H1R1Ruleset,
} from "../../src/clinical/ccr/h1FamilyStatusR1Candidate";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidateRuleset,
} from "../../src/clinical/ccr/candidate";
import {
  CCR_FAMILY_DETAIL_KEYS,
  CCR_FAMILY_VALUES,
  CCR_IDS,
  CCR_STRATEGY_VALUES,
} from "../../src/clinical/ccr/terminology";

const asOf = day("2026-10-25");
const hotfixRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const policy = ccrPhase6H1R1Policies.find((candidate) => candidate.family === family);
  if (policy === undefined) throw new Error(`Missing policy family ${family}`);
  return policy.policyId;
}

function familyFact(presence: "no" | "unknown" | "yes") {
  if (presence !== "yes")
    return {
      id: `family-${presence}`,
      conceptId: CCR_IDS.concepts.familyHistoryRelevant,
      category: "family_history" as const,
      presence,
    };

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
  family: "sus_oficial" | "br_ampliado" | "internacional",
  p: ReturnType<typeof patient>,
) {
  return evaluatePatient({
    patient: p,
    ruleset: ccrPhase6H1R1Ruleset,
    policyId: policyId(family),
    asOf,
    extensions: ccrPhase6H1R1Resolvers,
  });
}

function track(result: ReturnType<typeof run>, trackId: string) {
  const found = result.plan.topics[0]?.tracks.find(
    (candidate) => candidate.trackId === trackId,
  );
  if (found === undefined) throw new Error(`Missing track ${trackId}`);
  return found;
}

describe("Phase 6.H1 R1 governance", () => {
  it("records exactly one explicit R1 review on only the three changed rules", () => {
    expect(CCR_H1_R1_RULESET_VERSION).toBe("crc-0.5.7-phase6-h1-r1-draft");
    expect(CCR_H1_R1_REVIEWER).toBe("Allan Ramos Costa");
    expect(CCR_H1_R1_REVIEWED_AT).toEqual(asOf);

    for (const rule of ccrPhase6H1R1Ruleset.rules) {
      const previous = ccrPhase6H1FamilyStatusRuleset.rules.find(
        (candidate) => candidate.ruleId === rule.ruleId,
      );
      expect(previous).toBeDefined();

      if (hotfixRuleIds.has(rule.ruleId)) {
        expect(rule.lifecycleStatus).toBe("draft");
        expect(rule.reviewStatus).toBe("reviewed_by_1");
        expect(rule.governance.reviews).toEqual([
          { reviewer: CCR_H1_R1_REVIEWER, reviewedAt: CCR_H1_R1_REVIEWED_AT },
        ]);

        const expected = structuredClone(previous!);
        expected.reviewStatus = "reviewed_by_1";
        expected.governance.reviews = [
          { reviewer: CCR_H1_R1_REVIEWER, reviewedAt: CCR_H1_R1_REVIEWED_AT },
        ];
        expect(rule).toEqual(expected);
      } else {
        expect(rule).toEqual(previous);
      }
    }
  });

  it("does not repoint the canonical candidate before R2/activation", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe("crc-0.5.5-phase6-active");
    expect(ccrCandidateRuleset.rulesetVersion).toBe("crc-0.5.5-phase6-active");
  });
});

describe("Phase 6.H1 R1 clinical behavior", () => {
  it("keeps explicit negative family history out of clinical review in all three policies", () => {
    for (const family of ["sus_oficial", "br_ampliado", "internacional"] as const) {
      const p =
        family === "sus_oficial"
          ? patient({ family: "no" })
          : patient({ family: "no", strategy: "fit" });
      expect(track(run(family, p), CCR_IDS.tracks.familyStatus).state.status).toBe(
        "NotApplicable",
      );
    }
  });

  it("preserves unknown != negative", () => {
    for (const family of ["sus_oficial", "br_ampliado", "internacional"] as const) {
      expect(
        track(run(family, patient({ family: "unknown" })), CCR_IDS.tracks.familyStatus)
          .state.status,
      ).toBe("Indeterminate");
    }
  });

  it("preserves positive-family review in SUS/BA-A and International delegation", () => {
    for (const family of ["sus_oficial", "br_ampliado"] as const) {
      expect(
        track(run(family, patient({ family: "yes" })), CCR_IDS.tracks.familyStatus)
          .state.status,
      ).toBe("ClinicalReviewRequired");
    }

    const international = run("internacional", patient({ family: "yes" }));
    expect(track(international, CCR_IDS.tracks.familyStatus).state.status).toBe(
      "NotApplicable",
    );
    expect(track(international, CCR_IDS.tracks.familyHighRisk).state.status).toBe("Due");
  });

  it("preserves BA-A FIT strategy after negative family history", () => {
    const result = run("br_ampliado", patient({ family: "no", strategy: "fit" }));
    expect(track(result, CCR_IDS.tracks.familyStatus).state.status).toBe("NotApplicable");
    expect(track(result, CCR_IDS.tracks.fitStrategy).state.status).toBe("Due");
  });
});
