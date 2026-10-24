import {
  CCR_R2_REVIEWED_RULESET_VERSION,
  ccrPhase6R2ReviewedPolicies,
  ccrPhase6R2ReviewedResolvers,
  ccrPhase6R2ReviewedRuleset,
} from "./r2ReviewedCandidate";

export const CCR_CANDIDATE_RULESET_VERSION =
  CCR_R2_REVIEWED_RULESET_VERSION;

/**
 * Canonical Phase 6 candidate entrypoint after R1 and private external physician
 * R2 review.
 *
 * The R2 reviewer is represented in the public repository only by a stable,
 * non-identifying handle; the project lead attests that this handle represents
 * a physician distinct from the R1 reviewer. Historical snapshots remain
 * available for regression/audit. All 43 rules are reviewed_by_2 but remain
 * lifecycle=draft. Activation, public release and merge are separate later
 * gates.
 */
export const ccrCandidateRuleset = ccrPhase6R2ReviewedRuleset;
export const ccrCandidatePolicies = ccrPhase6R2ReviewedPolicies;
export const ccrCandidateResolvers = ccrPhase6R2ReviewedResolvers;
