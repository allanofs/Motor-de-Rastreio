import {
  CCR_R1_RECONFIRMED_RULESET_VERSION,
  ccrPhase6R1ReconfirmedPolicies,
  ccrPhase6R1ReconfirmedResolvers,
  ccrPhase6R1ReconfirmedRuleset,
} from "./r1ReconfirmedCandidate";

export const CCR_CANDIDATE_RULESET_VERSION =
  CCR_R1_RECONFIRMED_RULESET_VERSION;

/**
 * Canonical Phase 6 candidate entrypoint after explicit R1 reconfirmation of
 * the pre-R2 evidence/provenance corrections.
 *
 * Historical 6.1-6.5, original R1 and pre-R2 snapshots remain available for
 * regression/audit. Product integration should consume these aliases rather
 * than a phase-specific snapshot. All 43 rules are reviewed_by_1 and remain
 * lifecycle=draft. Independent physician R2, activation, release and merge are
 * separate later gates.
 */
export const ccrCandidateRuleset = ccrPhase6R1ReconfirmedRuleset;
export const ccrCandidatePolicies = ccrPhase6R1ReconfirmedPolicies;
export const ccrCandidateResolvers = ccrPhase6R1ReconfirmedResolvers;
