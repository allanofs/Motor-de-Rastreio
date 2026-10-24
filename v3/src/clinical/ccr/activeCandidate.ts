import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import {
  ccrPhase6R2ReviewedPolicies,
  ccrPhase6R2ReviewedResolvers,
  ccrPhase6R2ReviewedRuleset,
} from "./r2ReviewedCandidate";

export const CCR_ACTIVE_RULESET_VERSION =
  "crc-0.5.5-phase6-active" as const;

function activateReviewedRule(rule: RuleDefinition): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "active",
    reviewStatus: "reviewed_by_2",
  });
}

/**
 * Activated clinical-content snapshot.
 *
 * This is a lifecycle-only promotion of the fully R2-reviewed candidate.
 * Clinical logic, evidence metadata, sources, policies, terminology, resolvers,
 * reviewer records and rule identifiers are inherited unchanged from
 * crc-0.5.4-phase6-r2-reviewed-draft.
 *
 * `active` means that the clinical content has passed the project's content
 * governance gate. It does NOT by itself authorize deployment, public release,
 * real-world clinical use, patient-facing use, or merge of PR #3.
 */
export const ccrPhase6ActiveRules =
  ccrPhase6R2ReviewedRuleset.rules.map(activateReviewedRule);

export const ccrPhase6ActiveRuleset = RulesetSchema.parse({
  ...ccrPhase6R2ReviewedRuleset,
  rulesetVersion: CCR_ACTIVE_RULESET_VERSION,
  rules: ccrPhase6ActiveRules,
});

export const ccrPhase6ActivePolicies = ccrPhase6R2ReviewedPolicies;
export const ccrPhase6ActiveResolvers = ccrPhase6R2ReviewedResolvers;
