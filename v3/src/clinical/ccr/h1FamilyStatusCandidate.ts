import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import {
  ccrPhase6ActivePolicies,
  ccrPhase6ActiveResolvers,
  ccrPhase6ActiveRuleset,
} from "./activeCandidate";

export const CCR_H1_FAMILY_STATUS_RULESET_VERSION =
  "crc-0.5.6-phase6-h1-family-status-draft" as const;

export const CCR_H1_FAMILY_STATUS_RULE_IDS = [
  "crc.sus.family-status",
  "crc.ba-a.family-status",
  "crc.intl.family-status",
] as const;

const familyStatusRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

function neutralizeFamilyStatusScaffold(rule: RuleDefinition): RuleDefinition {
  if (!familyStatusRuleIds.has(rule.ruleId)) return structuredClone(rule);

  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "draft",
    reviewStatus: "source_verified",
    computability: "computable",
    stance: "recommend",
    actions: [],
    outcome: "NotApplicable",
    governance: {
      ...rule.governance,
      rationale:
        `${rule.governance.rationale} H1 correction: the executable base rule is a neutral resolver scaffold. It is marked computable with no generic actions because the Foundation converts partially-computable/no-formal-recommendation rules into abstention before DomainResolver execution. Final family-status classification is delegated to the governed Phase 6.4 resolver so negative, unknown, positive and complex histories remain distinct.`,
      reviews: [],
    },
  });
}

/**
 * Phase 6.H1 clinical hotfix candidate.
 *
 * The active crc-0.5.5 snapshot is intentionally left immutable. The three
 * family-status rules are reset to draft/source_verified and converted to a
 * resolver-safe neutral scaffold so the existing familyStatusResolver64 can
 * classify:
 * - negative history -> NotApplicable;
 * - unknown/incomplete -> Indeterminate;
 * - positive SUS/BA-A -> ClinicalReviewRequired;
 * - narrow International patterns -> delegated to dedicated family tracks;
 * - complex histories -> ClinicalReviewRequired.
 *
 * `stance: recommend` here does not itself emit a recommendation: the scaffold
 * has no actions and an explicit NotApplicable generic outcome. It is a narrow
 * compatibility mechanism for the current Foundation pipeline, whose
 * `partially_computable` / `no_formal_recommendation` semantics abstain before
 * a DomainResolver can run.
 *
 * This candidate is NOT canonical and must not be activated until the changed
 * clinical translations pass the project's human re-review/governance gate.
 */
export const ccrPhase6H1FamilyStatusRules =
  ccrPhase6ActiveRuleset.rules.map(neutralizeFamilyStatusScaffold);

export const ccrPhase6H1FamilyStatusRuleset = RulesetSchema.parse({
  ...ccrPhase6ActiveRuleset,
  rulesetVersion: CCR_H1_FAMILY_STATUS_RULESET_VERSION,
  rules: ccrPhase6H1FamilyStatusRules,
});

export const ccrPhase6H1FamilyStatusPolicies = ccrPhase6ActivePolicies;
export const ccrPhase6H1FamilyStatusResolvers = ccrPhase6ActiveResolvers;
