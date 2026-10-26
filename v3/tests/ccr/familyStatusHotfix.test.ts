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
  ccrPhase6ActiveResolvers,
  ccrPhase6ActiveRuleset,
} from "../../src/clinical/ccr/activeCandidate";
import {
  CCR_H1_FAMILY_STATUS_RULE_IDS,
  CCR_H1_FAMILY_STATUS_RULESET_VERSION,
  ccrPhase6H1FamilyStatusPolicies,
  ccrPhase6H1FamilyStatusResolvers,
  ccrPhase6H1FamilyStatusRuleset,
} from "../../src/clinical/ccr/h1FamilyStatusCandidate";
import {
  CCR_FAMILY_DETAIL_KEYS,
  CCR_FAMILY_VALUES,
  CCR_IDS,
  CCR_STRATEGY_VALUES,
} from "../../src/clinical/ccr/terminology";

const asOf = day("2026-10-25");
const previewReviewer = "phase6-h1-test-preview-only-not-a-clinical-review";
const hotfixRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const policy = ccrPhase6H1FamilyStatusPolicies.find(
    (candidate) => candidate.family === family,
  );
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

function activateHotfixPreview(rule: RuleDefinition): RuleDefinition {
  if (!hotfixRuleIds.has(rule.ruleId)) return structuredClone(rule);
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "active",
    reviewStatus: "reviewed_by_1",
    governance: {
      ...rule.governance,
      reviews: [{ reviewer: previewReviewer, reviewedAt: asOf }],
    },
  });
}

function previewRuleset(): Ruleset {
  return RulesetSchema.parse({
    ...ccrPhase6H1FamilyStatusRuleset,
    rules: ccrPhase6H1FamilyStatusRuleset.rules.map(activateHotfixPreview),
  });
}

function run(
  ruleset: Ruleset,
  family: "sus_oficial" | "br_ampliado" | "internacional",
  p: ReturnType<typeof patient>,
  resolvers = ccrPhase6H1FamilyStatusResolvers,
) {
  return evaluatePatient({
    patient: p,
    ruleset,
    policyId: policyId(family),
    asOf,
    extensions: resolvers,
  });
}

function track(result: ReturnType<typeof run>, trackId: string) {
  const found = result.plan.topics[0]?.tracks.find(
    (candidate) => candidate.trackId === trackId,
  );
  if (found === undefined) throw new Error(`Missing track ${trackId}`);
  return found;
}

describe("Phase 6.H1 family-status hotfix candidate governance", () => {
  it("preserves the active snapshot and resets only the three changed rules for re-review", () => {
    expect(CCR_H1_FAMILY_STATUS_RULESET_VERSION).toBe(
      "crc-0.5.6-phase6-h1-family-status-draft",
    );

    const changed = ccrPhase6H1FamilyStatusRuleset.rules.filter((rule) =>
      hotfixRuleIds.has(rule.ruleId),
    );
    expect(changed.map((rule) => rule.ruleId).sort()).toEqual(
      [...CCR_H1_FAMILY_STATUS_RULE_IDS].sort(),
    );
    for (const rule of changed) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("source_verified");
      expect(rule.computability).toBe("computable");
      expect(rule.stance).toBe("recommend");
      expect(rule.actions).toEqual([]);
      expect(rule.outcome).toBe("NotApplicable");
      expect(rule.governance.reviews).toEqual([]);

      const previous = ccrPhase6ActiveRuleset.rules.find(
        (candidate) => candidate.ruleId === rule.ruleId,
      );
      expect(previous).toBeDefined();
      expect(rule.sourceRefs).toEqual(previous?.sourceRefs);
    }

    const unchangedIds = ccrPhase6ActiveRuleset.rules
      .filter((rule) => !hotfixRuleIds.has(rule.ruleId))
      .map((rule) => rule.ruleId);
    for (const ruleId of unchangedIds) {
      expect(
        ccrPhase6H1FamilyStatusRuleset.rules.find((rule) => rule.ruleId === ruleId),
      ).toEqual(ccrPhase6ActiveRuleset.rules.find((rule) => rule.ruleId === ruleId));
    }
  });
});

describe("Phase 6.H1 family-status behavior preview", () => {
  const hotfix = previewRuleset();

  it("reproduces the active-snapshot defect and removes spurious review for explicit negative family history", () => {
    for (const family of ["sus_oficial", "br_ampliado", "internacional"] as const) {
      const p =
        family === "sus_oficial"
          ? patient({ family: "no" })
          : patient({ family: "no", strategy: "fit" });
      const before = run(
        ccrPhase6ActiveRuleset,
        family,
        p,
        ccrPhase6ActiveResolvers,
      );
      expect(track(before, CCR_IDS.tracks.familyStatus).state.status).toBe(
        "ClinicalReviewRequired",
      );

      const after = run(hotfix, family, p);
      expect(track(after, CCR_IDS.tracks.familyStatus).state.status).toBe(
        "NotApplicable",
      );
    }
  });

  it("keeps unknown family history distinct from negative and asks for clarification", () => {
    for (const family of ["sus_oficial", "br_ampliado", "internacional"] as const) {
      const result = run(hotfix, family, patient({ family: "unknown" }));
      const status = track(result, CCR_IDS.tracks.familyStatus);
      expect(status.state.status).toBe("Indeterminate");
      expect(
        status.missingData.some((item) =>
          item.endsWith(CCR_IDS.concepts.familyHistoryRelevant),
        ),
      ).toBe(true);
    }
  });

  it("preserves conservative ClinicalReviewRequired for positive relevant family history in SUS and BA-A", () => {
    for (const family of ["sus_oficial", "br_ampliado"] as const) {
      const result = run(hotfix, family, patient({ family: "yes" }));
      expect(track(result, CCR_IDS.tracks.familyStatus).state.status).toBe(
        "ClinicalReviewRequired",
      );
    }
  });

  it("delegates a narrow International high-risk pattern instead of emitting a generic family-status review", () => {
    const result = run(
      hotfix,
      "internacional",
      patient({ family: "yes" }),
    );
    expect(track(result, CCR_IDS.tracks.familyStatus).state.status).toBe(
      "NotApplicable",
    );
    expect(track(result, CCR_IDS.tracks.familyHighRisk).state.status).toBe("Due");
  });

  it("does not disturb BA-A FIT strategy behavior after explicit negative family history", () => {
    const result = run(
      hotfix,
      "br_ampliado",
      patient({ family: "no", strategy: "fit" }),
    );
    expect(track(result, CCR_IDS.tracks.familyStatus).state.status).toBe(
      "NotApplicable",
    );
    expect(track(result, CCR_IDS.tracks.fitStrategy).state.status).toBe("Due");
  });
});
