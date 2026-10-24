import {
  CCR_R2_PREP_RULESET_VERSION,
  ccrR2PreparedPolicies,
  ccrR2PreparedResolvers,
  ccrR2PreparedRuleset,
} from "./r2PreparedCandidate";

export const CCR_CANDIDATE_RULESET_VERSION = CCR_R2_PREP_RULESET_VERSION;

/**
 * Canonical Phase 6 candidate entrypoint after the pre-R2 evidence/provenance
 * corrections.
 *
 * Historical 6.1-6.5 and R1 exports remain available for regression/audit.
 * Product integration should consume these aliases rather than a phase-specific
 * snapshot. This candidate is still lifecycle=draft and deliberately contains
 * rules reset to source_verified pending explicit R1 reconfirmation of the
 * metadata/source corrections. It is not reviewed_by_2 and is not a release.
 */
export const ccrCandidateRuleset = ccrR2PreparedRuleset;
export const ccrCandidatePolicies = ccrR2PreparedPolicies;
export const ccrCandidateResolvers = ccrR2PreparedResolvers;
