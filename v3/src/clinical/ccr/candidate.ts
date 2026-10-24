import { ccrPhase65Policies } from "./policies";
import { ccrPhase64Resolvers } from "./resolvers/phase64";
import { ccrPhase65Ruleset } from "./ruleset";

export const CCR_CANDIDATE_RULESET_VERSION = "crc-0.5.0-phase6.5-draft" as const;

/**
 * Canonical Phase 6 candidate entrypoint.
 *
 * Older phase exports remain available for regression tests and audit history,
 * but product integration should consume this alias until a later reviewed
 * candidate explicitly replaces it.
 */
export const ccrCandidateRuleset = ccrPhase65Ruleset;
export const ccrCandidatePolicies = ccrPhase65Policies;
export const ccrCandidateResolvers = ccrPhase64Resolvers;
