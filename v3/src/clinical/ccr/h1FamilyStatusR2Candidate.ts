import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";
import {
  CCR_H1_FAMILY_STATUS_RULE_IDS,
} from "./h1FamilyStatusCandidate";
import {
  ccrPhase6H1R1Policies,
  ccrPhase6H1R1Resolvers,
  ccrPhase6H1R1Ruleset,
} from "./h1FamilyStatusR1Candidate";

export const CCR_H1_R2_REVIEWER_PUBLIC_ID =
  "external-physician-r2-private-001" as const;
export const CCR_H1_R2_REVIEWED_AT = day("2026-10-25");
export const CCR_H1_R2_RULESET_VERSION =
  "crc-0.5.8-phase6-h1-r2-reviewed-draft" as const;

const reviewedRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

function registerH1R2(rule: RuleDefinition): RuleDefinition {
  if (!reviewedRuleIds.has(rule.ruleId)) return structuredClone(rule);

  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "draft",
    reviewStatus: "reviewed_by_2",
    governance: {
      ...rule.governance,
      reviews: [
        ...rule.governance.reviews,
        {
          reviewer: CCR_H1_R2_REVIEWER_PUBLIC_ID,
          reviewedAt: CCR_H1_R2_REVIEWED_AT,
        },
      ],
    },
  });
}

/**
 * Phase 6.H1 governance snapshot after independent R2 approval of the three
 * corrected family-status translations.
 *
 * The external physician is represented by the same non-identifying public
 * governance handle used in the prior Phase 6 R2. The project lead attests
 * that this is a real physician distinct from the R1 reviewer and that the
 * three H1 corrections were approved integrally.
 *
 * This promotion changes governance only for the three H1 rules: they remain
 * lifecycle=draft and receive reviewed_by_2 plus the second review record.
 * Clinical behavior, sourceRefs, policies, terminology, resolvers, engine and
 * model are unchanged from crc-0.5.7-phase6-h1-r1-draft.
 *
 * R2 approval does NOT authorize activation, merge, deploy, public release or
 * real-world clinical use. Activation/readiness remains a separate gate.
 */
export const ccrPhase6H1R2Rules =
  ccrPhase6H1R1Ruleset.rules.map(registerH1R2);

export const ccrPhase6H1R2Ruleset = RulesetSchema.parse({
  ...ccrPhase6H1R1Ruleset,
  rulesetVersion: CCR_H1_R2_RULESET_VERSION,
  rules: ccrPhase6H1R2Rules,
});

export const ccrPhase6H1R2Policies = ccrPhase6H1R1Policies;
export const ccrPhase6H1R2Resolvers = ccrPhase6H1R1Resolvers;
