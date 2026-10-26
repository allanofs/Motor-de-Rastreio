import {
  CCR_H1_ACTIVE_RULESET_VERSION,
  ccrPhase6H1ActivePolicies,
  ccrPhase6H1ActiveResolvers,
  ccrPhase6H1ActiveRuleset,
} from "./h1FamilyStatusActiveCandidate";

export const CCR_CANDIDATE_RULESET_VERSION = CCR_H1_ACTIVE_RULESET_VERSION;

/**
 * Canonical CCR clinical-content entrypoint after governed H1 activation.
 *
 * The three family-status corrections passed R1, independent R2 and a separate
 * activation/readiness gate before this canonical repoint. Historical Phase 6,
 * H1 draft, R1 and R2 snapshots remain available for audit and regression.
 *
 * All 43 canonical rules are reviewed_by_2 and lifecycle=active.
 *
 * IMPORTANT: content activation authorizes consumption by product integration
 * only. It is not merge, deploy, public release, patient-facing authorization,
 * real-world clinical-use authorization or regulatory validation.
 */
export const ccrCandidateRuleset = ccrPhase6H1ActiveRuleset;
export const ccrCandidatePolicies = ccrPhase6H1ActivePolicies;
export const ccrCandidateResolvers = ccrPhase6H1ActiveResolvers;
