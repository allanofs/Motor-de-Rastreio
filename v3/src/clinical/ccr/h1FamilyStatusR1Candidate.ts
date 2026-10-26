import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";
import {
  CCR_H1_FAMILY_STATUS_RULE_IDS,
  ccrPhase6H1FamilyStatusPolicies,
  ccrPhase6H1FamilyStatusResolvers,
  ccrPhase6H1FamilyStatusRuleset,
} from "./h1FamilyStatusCandidate";

export const CCR_H1_R1_REVIEWER = "Allan Ramos Costa" as const;
export const CCR_H1_R1_REVIEWED_AT = day("2026-10-25");
export const CCR_H1_R1_RULESET_VERSION =
  "crc-0.5.7-phase6-h1-r1-draft" as const;

const reviewedRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

function registerH1R1(rule: RuleDefinition): RuleDefinition {
  if (!reviewedRuleIds.has(rule.ruleId)) return structuredClone(rule);

  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "draft",
    reviewStatus: "reviewed_by_1",
    governance: {
      ...rule.governance,
      reviews: [
        {
          reviewer: CCR_H1_R1_REVIEWER,
          reviewedAt: CCR_H1_R1_REVIEWED_AT,
        },
      ],
    },
  });
}

/**
 * Phase 6.H1 candidate after explicit R1 approval of the three changed
 * family-status executable translations.
 *
 * R1 approval was given by Allan Ramos Costa on 2026-10-25 for:
 * - crc.sus.family-status
 * - crc.ba-a.family-status
 * - crc.intl.family-status
 *
 * The documented semantic caveat remains: `stance: recommend` is a technical
 * resolver-safe scaffold sentinel only. The three base rules have no generic
 * actions and a generic NotApplicable outcome; final clinical classification is
 * delegated to the governed Phase 6.4 familyStatusResolver64.
 *
 * This snapshot remains lifecycle=draft for the changed rules and is NOT
 * canonical, active, merged, deployed or authorized for real-world use.
 * Independent R2 review remains mandatory before any promotion.
 */
export const ccrPhase6H1R1Rules =
  ccrPhase6H1FamilyStatusRuleset.rules.map(registerH1R1);

export const ccrPhase6H1R1Ruleset = RulesetSchema.parse({
  ...ccrPhase6H1FamilyStatusRuleset,
  rulesetVersion: CCR_H1_R1_RULESET_VERSION,
  rules: ccrPhase6H1R1Rules,
});

export const ccrPhase6H1R1Policies = ccrPhase6H1FamilyStatusPolicies;
export const ccrPhase6H1R1Resolvers = ccrPhase6H1FamilyStatusResolvers;
