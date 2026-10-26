import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";
import { mamaM3DraftRuleset } from "./ruleset";

export const MAMA_M3_R1_REVIEWER = "Allan Ramos Costa" as const;
export const MAMA_M3_R1_REVIEWED_AT = day("2026-10-26");
export const MAMA_M3_R1_RULESET_VERSION = "breast-0.1.1-m3-r1-draft" as const;

/**
 * Governance-only registration of the explicitly approved first human review.
 *
 * This transformation MUST NOT alter clinical semantics, policies, sources,
 * terminology, sourceRefs, actions, schedules or lifecycle activation.
 * The <40 gap and provisional multi-source hard-exit provenance remain open
 * exactly as approved at the R1 gate.
 */
function registerMamaM3FirstHumanReview(
  rule: RuleDefinition,
): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "draft",
    reviewStatus: "reviewed_by_1",
    governance: {
      ...rule.governance,
      reviews: [
        {
          reviewer: MAMA_M3_R1_REVIEWER,
          reviewedAt: MAMA_M3_R1_REVIEWED_AT,
        },
      ],
    },
  });
}

export const mamaM3R1Rules = mamaM3DraftRuleset.rules.map(
  registerMamaM3FirstHumanReview,
);

export const mamaM3R1Ruleset = RulesetSchema.parse({
  ...mamaM3DraftRuleset,
  rulesetVersion: MAMA_M3_R1_RULESET_VERSION,
  rules: mamaM3R1Rules,
});

export const mamaM3R1Policies = mamaM3R1Ruleset.policies;
