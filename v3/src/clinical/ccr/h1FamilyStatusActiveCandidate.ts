import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import {
  CCR_H1_FAMILY_STATUS_RULE_IDS,
} from "./h1FamilyStatusCandidate";
import {
  ccrPhase6H1R2Policies,
  ccrPhase6H1R2Resolvers,
  ccrPhase6H1R2Ruleset,
} from "./h1FamilyStatusR2Candidate";

export const CCR_H1_ACTIVE_RULESET_VERSION =
  "crc-0.5.9-phase6-h1-active" as const;

const activatedRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

function activateH1Rule(rule: RuleDefinition): RuleDefinition {
  if (!activatedRuleIds.has(rule.ruleId)) return structuredClone(rule);

  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "active",
    reviewStatus: "reviewed_by_2",
  });
}

/**
 * Phase 6.H1 activated clinical-content snapshot.
 *
 * This is a lifecycle-only promotion of the three independently R2-reviewed
 * family-status corrections. The other 40 rules are inherited unchanged from
 * the previously active Phase 6 snapshot carried through the H1 candidate.
 *
 * Clinical logic, evidence metadata, sourceRefs, policies, terminology,
 * resolvers and reviewer records are unchanged from
 * crc-0.5.8-phase6-h1-r2-reviewed-draft.
 *
 * `active` authorizes consumption by the product integration layer only. It
 * does NOT authorize merge, deploy, public release, patient-facing use,
 * real-world clinical use or regulatory claims.
 */
export const ccrPhase6H1ActiveRules =
  ccrPhase6H1R2Ruleset.rules.map(activateH1Rule);

export const ccrPhase6H1ActiveRuleset = RulesetSchema.parse({
  ...ccrPhase6H1R2Ruleset,
  rulesetVersion: CCR_H1_ACTIVE_RULESET_VERSION,
  rules: ccrPhase6H1ActiveRules,
});

export const ccrPhase6H1ActivePolicies = ccrPhase6H1R2Policies;
export const ccrPhase6H1ActiveResolvers = ccrPhase6H1R2Resolvers;
