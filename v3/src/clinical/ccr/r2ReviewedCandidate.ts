import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";
import {
  ccrPhase6R1ReconfirmedPolicies,
  ccrPhase6R1ReconfirmedResolvers,
  ccrPhase6R1ReconfirmedRuleset,
} from "./r1ReconfirmedCandidate";

/**
 * Public, non-identifying reviewer handle.
 *
 * The external physician's identity and professional registration are
 * intentionally not stored in this public repository and were not supplied to
 * the software assistant. Under the project's current governance, the project
 * lead attests that this handle represents a real physician distinct from the
 * R1 reviewer who completed an independent clinical review of all 43 rules.
 */
export const CCR_R2_REVIEWER_PUBLIC_ID =
  "external-physician-r2-private-001" as const;
export const CCR_R2_REVIEWED_AT = day("2026-10-24");
export const CCR_R2_REVIEWED_RULESET_VERSION =
  "crc-0.5.4-phase6-r2-reviewed-draft" as const;

function registerSecondHumanReview(rule: RuleDefinition): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "draft",
    reviewStatus: "reviewed_by_2",
    governance: {
      ...rule.governance,
      reviews: [
        ...rule.governance.reviews,
        {
          reviewer: CCR_R2_REVIEWER_PUBLIC_ID,
          reviewedAt: CCR_R2_REVIEWED_AT,
        },
      ],
    },
  });
}

/**
 * Governance-only R2 snapshot.
 *
 * Clinical fields, evidence metadata, sources, policies and resolvers are
 * inherited unchanged from the R1-reconfirmed candidate. The only rule-level
 * changes are reviewStatus and the addition of the second reviewer record.
 * Rules deliberately remain lifecycle=draft: R2 review does not authorize
 * activation, public release or merge.
 */
export const ccrPhase6R2ReviewedRules =
  ccrPhase6R1ReconfirmedRuleset.rules.map(registerSecondHumanReview);

export const ccrPhase6R2ReviewedRuleset = RulesetSchema.parse({
  ...ccrPhase6R1ReconfirmedRuleset,
  rulesetVersion: CCR_R2_REVIEWED_RULESET_VERSION,
  rules: ccrPhase6R2ReviewedRules,
});

export const ccrPhase6R2ReviewedPolicies = ccrPhase6R1ReconfirmedPolicies;
export const ccrPhase6R2ReviewedResolvers = ccrPhase6R1ReconfirmedResolvers;
