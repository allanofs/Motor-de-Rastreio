import { mamaM3R2Ruleset } from "./r2ReviewedCandidate";
import {
  MAMA_M3_1_SCOPE_VERSION,
  MAMA_UNDER40_SCOPE_BY_POLICY,
} from "./under40Scope";

export const MAMA_ACTIVATION_READINESS_VERSION =
  "breast-0.1.5-activation-readiness" as const;

export const MAMA_ACTIVATION_BLOCKERS = {
  m31IndependentR2ReviewMissing: "m3_1_independent_r2_review_missing",
  under40CanonicalTraceIntegrationMissing:
    "under40_canonical_trace_integration_missing",
} as const;

export type MamaActivationBlocker =
  (typeof MAMA_ACTIVATION_BLOCKERS)[keyof typeof MAMA_ACTIVATION_BLOCKERS];

export type MamaActivationReadiness = Readonly<{
  version: typeof MAMA_ACTIVATION_READINESS_VERSION;
  ready: boolean;
  coreRulesetVersion: string;
  under40ScopeVersion: string;
  checks: Readonly<{
    coreRulesReviewedBy2: boolean;
    coreRulesStillDraft: boolean;
    under40ScopeSourceBacked: boolean;
    under40HumanGateApproved: true;
    m31IndependentR2Reviewed: false;
    under40IncludedInCanonicalDecisionTrace: true;
  }>;
  blockers: readonly MamaActivationBlocker[];
}>;

/**
 * Clinical-content activation-readiness audit for Mama after the approved M3.1
 * human gate and canonical Mama decision-context integration.
 *
 * The technical under-40 provenance integration blocker is closed: the Mama
 * decision context consumes the Foundation result plus the M3.1 source-backed
 * scope artifact and suppresses routine closure whenever safety tracks are
 * active or incomplete.
 *
 * Readiness intentionally remains false until the final M3.1 implementation
 * receives genuinely independent R2 review.
 *
 * This function must not activate content automatically.
 */
export function assessMamaActivationReadiness(): MamaActivationReadiness {
  const coreRulesReviewedBy2 = mamaM3R2Ruleset.rules.every(
    (rule) =>
      rule.reviewStatus === "reviewed_by_2" &&
      rule.governance.reviews.length >= 2,
  );
  const coreRulesStillDraft = mamaM3R2Ruleset.rules.every(
    (rule) => rule.lifecycleStatus === "draft",
  );
  const under40ScopeSourceBacked = Object.values(
    MAMA_UNDER40_SCOPE_BY_POLICY,
  ).every(
    (resolution) =>
      resolution.lifecycleStatus === "draft" &&
      resolution.reviewStatus === "source_verified" &&
      resolution.sourceRefs.length > 0 &&
      resolution.sourceRefs.every((ref) => ref.locator.trim().length > 0),
  );

  const blockers: MamaActivationBlocker[] = [
    MAMA_ACTIVATION_BLOCKERS.m31IndependentR2ReviewMissing,
  ];

  return {
    version: MAMA_ACTIVATION_READINESS_VERSION,
    ready: false,
    coreRulesetVersion: mamaM3R2Ruleset.rulesetVersion,
    under40ScopeVersion: MAMA_M3_1_SCOPE_VERSION,
    checks: {
      coreRulesReviewedBy2,
      coreRulesStillDraft,
      under40ScopeSourceBacked,
      under40HumanGateApproved: true,
      m31IndependentR2Reviewed: false,
      under40IncludedInCanonicalDecisionTrace: true,
    },
    blockers,
  };
}
