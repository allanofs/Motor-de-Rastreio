import { RuleDefinitionSchema, RulesetSchema, type RuleDefinition } from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";
import { ccrPhase64Resolvers } from "./resolvers/phase64";
import { ccrPhase65Ruleset } from "./ruleset";

export const CCR_R1_REVIEWER = "Allan Ramos Costa" as const;
export const CCR_R1_REVIEWED_AT = day("2026-10-24");
export const CCR_R1_RULESET_VERSION = "crc-0.5.1-phase6-r1-draft" as const;

/**
 * Register the explicit first human review of the executable translation.
 *
 * This is deliberately a governance-only transformation of the audited 6.5
 * clinical candidate. It does not activate rules, change clinical behavior,
 * change policies, sources, terminology or resolvers, and it does not imply
 * independent second review or public-release authorization.
 */
function registerFirstHumanReview(rule: RuleDefinition): RuleDefinition {
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

export const ccrPhase6R1Rules = ccrPhase65Ruleset.rules.map(registerFirstHumanReview);

export const ccrPhase6R1Ruleset = RulesetSchema.parse({
  ...ccrPhase65Ruleset,
  rulesetVersion: CCR_R1_RULESET_VERSION,
  rules: ccrPhase6R1Rules,
});

export const ccrPhase6R1Policies = ccrPhase6R1Ruleset.policies;
export const ccrPhase6R1Resolvers = ccrPhase64Resolvers;
