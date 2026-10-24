import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import {
  CCR_R1_REVIEWED_AT,
  CCR_R1_REVIEWER,
} from "./reviewedCandidate";
import {
  CCR_R2_PREP_R1_RECONFIRM_RULE_IDS,
  ccrR2PreparedPolicies,
  ccrR2PreparedResolvers,
  ccrR2PreparedRuleset,
} from "./r2PreparedCandidate";

export const CCR_R1_RECONFIRMED_RULESET_VERSION =
  "crc-0.5.3-phase6-r1-reconfirmed-draft" as const;

const reconfirmedRuleIds = new Set<string>(
  CCR_R2_PREP_R1_RECONFIRM_RULE_IDS,
);

function registerReconfirmedR1(rule: RuleDefinition): RuleDefinition {
  if (!reconfirmedRuleIds.has(rule.ruleId)) return structuredClone(rule);

  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "draft",
    reviewStatus: "reviewed_by_1",
    governance: {
      ...rule.governance,
      reviews: [
        {
          reviewer: CCR_R1_REVIEWER,
          reviewedAt: CCR_R1_REVIEWED_AT,
        },
      ],
    },
  });
}

/**
 * Corrected Phase 6 candidate after explicit R1 reconfirmation of the 15 rules
 * whose source/evidence metadata changed during pre-R2 audit.
 *
 * This snapshot is still lifecycle=draft. reviewed_by_1 records only the first
 * human review of the corrected executable translation; it is not independent
 * R2, activation, public release or merge authorization.
 */
export const ccrPhase6R1ReconfirmedRules =
  ccrR2PreparedRuleset.rules.map(registerReconfirmedR1);

export const ccrPhase6R1ReconfirmedRuleset = RulesetSchema.parse({
  ...ccrR2PreparedRuleset,
  rulesetVersion: CCR_R1_RECONFIRMED_RULESET_VERSION,
  rules: ccrPhase6R1ReconfirmedRules,
});

export const ccrPhase6R1ReconfirmedPolicies = ccrR2PreparedPolicies;
export const ccrPhase6R1ReconfirmedResolvers = ccrR2PreparedResolvers;
