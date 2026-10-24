import {
  CCR_ACTIVE_RULESET_VERSION,
  ccrPhase6ActivePolicies,
  ccrPhase6ActiveResolvers,
  ccrPhase6ActiveRuleset,
} from "./activeCandidate";

export const CCR_CANDIDATE_RULESET_VERSION = CCR_ACTIVE_RULESET_VERSION;

/**
 * Canonical Phase 6 clinical-content entrypoint after R1, privacy-preserving R2
 * and explicit project-lead activation authorization.
 *
 * Historical pre-R2, R1 and R2-draft snapshots remain available for audit and
 * regression. All 43 canonical rules are reviewed_by_2 and lifecycle=active.
 *
 * IMPORTANT: content activation is not deployment authorization. Public release,
 * real-world clinical use, patient-facing use, product integration readiness and
 * merge of PR #3 remain separate gates.
 */
export const ccrCandidateRuleset = ccrPhase6ActiveRuleset;
export const ccrCandidatePolicies = ccrPhase6ActivePolicies;
export const ccrCandidateResolvers = ccrPhase6ActiveResolvers;
