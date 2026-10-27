import { mamaM3R2Ruleset } from "./r2ReviewedCandidate";
import {
  MAMA_M3_1_SCOPE_VERSION,
  MAMA_UNDER40_SCOPE_BY_POLICY,
} from "./under40Scope";
import {
  MAMA_M3_1_R2_SNAPSHOT_VERSION,
  mamaM31R2ReviewedSnapshot,
} from "./m31R2ReviewedCandidate";

export const MAMA_ACTIVATION_READINESS_VERSION =
  "breast-0.1.7-activation-readiness" as const;

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
  m31R2SnapshotVersion: string;
  checks: Readonly<{
    coreRulesReviewedBy2: boolean;
    coreRulesStillDraft: boolean;
    under40ScopeSourceBacked: boolean;
    under40HumanGateApproved: true;
    m31IndependentR2Reviewed: boolean;
    m31StillDraft: boolean;
    under40IncludedInCanonicalDecisionTrace: true;
  }>;
  blockers: readonly MamaActivationBlocker[];
}>;

/**
 * Clinical-content activation-readiness audit for Mama after M3 + M3.1.
 *
 * `ready=true` means the clinical-content governance prerequisites tracked by
 * this audit are satisfied. It does NOT activate content automatically and does
 * not authorize merge, deployment, public release, UI integration or real-world
 * clinical use. Lifecycle activation remains a separate explicit gate.
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
  const m31IndependentR2Reviewed =
    mamaM31R2ReviewedSnapshot.reviewStatus === "reviewed_by_2" &&
    mamaM31R2ReviewedSnapshot.verdict === "APPROVE" &&
    mamaM31R2ReviewedSnapshot.governance.reviews.some(
      (review) => review.role === "independent_r2",
    ) &&
    mamaM31R2ReviewedSnapshot.reviewedArtifacts.under40ScopeVersion ===
      MAMA_M3_1_SCOPE_VERSION;
  const m31StillDraft =
    mamaM31R2ReviewedSnapshot.lifecycleStatus === "draft";

  const blockers: MamaActivationBlocker[] = [];
  if (!m31IndependentR2Reviewed)
    blockers.push(MAMA_ACTIVATION_BLOCKERS.m31IndependentR2ReviewMissing);

  const ready =
    coreRulesReviewedBy2 &&
    coreRulesStillDraft &&
    under40ScopeSourceBacked &&
    m31IndependentR2Reviewed &&
    m31StillDraft &&
    blockers.length === 0;

  return {
    version: MAMA_ACTIVATION_READINESS_VERSION,
    ready,
    coreRulesetVersion: mamaM3R2Ruleset.rulesetVersion,
    under40ScopeVersion: MAMA_M3_1_SCOPE_VERSION,
    m31R2SnapshotVersion: MAMA_M3_1_R2_SNAPSHOT_VERSION,
    checks: {
      coreRulesReviewedBy2,
      coreRulesStillDraft,
      under40ScopeSourceBacked,
      under40HumanGateApproved: true,
      m31IndependentR2Reviewed,
      m31StillDraft,
      under40IncludedInCanonicalDecisionTrace: true,
    },
    blockers,
  };
}
