import {
  MAMA_ACTIVE_DOMAIN_SNAPSHOT_VERSION,
  MAMA_ACTIVE_RULESET_VERSION,
  mamaM31ActiveSnapshot,
  mamaM3ActivePolicies,
  mamaM3ActiveRuleset,
} from "./activeCandidate";

export const MAMA_CANDIDATE_RULESET_VERSION = MAMA_ACTIVE_RULESET_VERSION;
export const MAMA_CANDIDATE_DOMAIN_SNAPSHOT_VERSION =
  MAMA_ACTIVE_DOMAIN_SNAPSHOT_VERSION;

/**
 * Canonical Mama clinical-content entrypoint after explicit lifecycle
 * activation.
 *
 * Product integration should consume this entrypoint rather than draft/R1/R2
 * historical snapshots. Those historical artifacts remain exported separately
 * for audit and regression.
 *
 * IMPORTANT: content activation authorizes governed internal consumption only.
 * It is not merge, deploy, public release, patient-facing authorization,
 * real-world clinical-use authorization or regulatory validation.
 */
export const mamaCandidateRuleset = mamaM3ActiveRuleset;
export const mamaCandidatePolicies = mamaM3ActivePolicies;
export const mamaCandidateDomainSnapshot = mamaM31ActiveSnapshot;
