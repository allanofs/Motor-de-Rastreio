import {
  CCR_R1_RULESET_VERSION,
  ccrPhase6R1Policies,
  ccrPhase6R1Resolvers,
  ccrPhase6R1Ruleset,
} from "./reviewedCandidate";

export const CCR_CANDIDATE_RULESET_VERSION = CCR_R1_RULESET_VERSION;

/**
 * Canonical Phase 6 candidate entrypoint after first human review of the
 * executable translation.
 *
 * Historical 6.1-6.5 exports remain available for regression tests and audit
 * history. Product integration should consume these aliases rather than a
 * phase-specific snapshot. The reviewed candidate is still lifecycle=draft:
 * reviewed_by_1 is not public-release authorization and a second independent
 * clinical review remains required before release.
 */
export const ccrCandidateRuleset = ccrPhase6R1Ruleset;
export const ccrCandidatePolicies = ccrPhase6R1Policies;
export const ccrCandidateResolvers = ccrPhase6R1Resolvers;
