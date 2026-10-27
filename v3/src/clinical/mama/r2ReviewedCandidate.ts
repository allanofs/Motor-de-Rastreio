import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";
import {
  mamaM3R1Policies,
  mamaM3R1Ruleset,
} from "./reviewedCandidate";

/**
 * Public, non-identifying reviewer handle.
 *
 * The independent R2 physician's identity and professional registration are
 * intentionally not stored in this public repository and were not supplied to
 * the software assistant. Under the project's current governance, the project
 * lead attests that this handle represents a real physician distinct from the
 * R1 reviewer who completed an independent clinical review of the M3 R1
 * candidate.
 */
export const MAMA_M3_R2_REVIEWER_PUBLIC_ID =
  "external-physician-r2-private-breast-001" as const;
export const MAMA_M3_R2_REVIEWED_AT = day("2026-10-26");
export const MAMA_M3_R2_RULESET_VERSION =
  "breast-0.1.2-m3-r2-reviewed-draft" as const;

function registerMamaM3SecondHumanReview(
  rule: RuleDefinition,
): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "draft",
    reviewStatus: "reviewed_by_2",
    governance: {
      ...rule.governance,
      reviews: [
        ...rule.governance.reviews,
        {
          reviewer: MAMA_M3_R2_REVIEWER_PUBLIC_ID,
          reviewedAt: MAMA_M3_R2_REVIEWED_AT,
        },
      ],
    },
  });
}

/**
 * Governance-only R2 snapshot.
 *
 * The independent R2 review approved the R1 candidate in full after the
 * reviewer was given the pre-R2 audit points discussed around the Gemini
 * review and their resolution. No mandatory correction to the 15 current M3
 * rules was requested.
 *
 * This DOES NOT close the deliberately open pre-activation work:
 * - M3.1 must resolve the average-risk <40 translation with source-backed
 *   provenance and preserve hard-exit precedence;
 * - Mama-specific SharedDecision reason/presentation semantics remain a
 *   product/domain refinement rather than a Foundation change;
 * - the known-high-risk-familial input contract must remain strict;
 * - provisional multi-source hard-exit provenance must be revisited before
 *   final product/report integration.
 *
 * R2 review does not authorize lifecycle activation, product integration,
 * merge, deploy, public release or real-world clinical use.
 */
export const mamaM3R2Rules = mamaM3R1Ruleset.rules.map(
  registerMamaM3SecondHumanReview,
);

export const mamaM3R2Ruleset = RulesetSchema.parse({
  ...mamaM3R1Ruleset,
  rulesetVersion: MAMA_M3_R2_RULESET_VERSION,
  rules: mamaM3R2Rules,
});

export const mamaM3R2Policies = mamaM3R1Policies;
