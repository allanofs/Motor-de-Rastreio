export const MAMA_SHARED_DECISION_REASONS = {
  outsidePopulationCoreAccessOnDemand:
    "outside-population-core-access-on-demand",
  continuationConditionedOnHealthHorizon:
    "continuation-conditioned-on-health-horizon",
} as const;

export type MamaSharedDecisionReason =
  (typeof MAMA_SHARED_DECISION_REASONS)[keyof typeof MAMA_SHARED_DECISION_REASONS];

/**
 * Mama-specific presentation semantics.
 *
 * These reason codes distinguish clinically different meanings that currently
 * share the Foundation state `SharedDecision`. They deliberately remain in the
 * breast domain until a second independent domain demonstrates a truly generic
 * abstraction.
 */
export const MAMA_SHARED_DECISION_REASON_BY_RULE_ID: Readonly<
  Record<string, MamaSharedDecisionReason>
> = {
  "breast.sus.population.40-49-shared-decision":
    MAMA_SHARED_DECISION_REASONS.outsidePopulationCoreAccessOnDemand,
  "breast.sus.population.75-plus-shared-decision":
    MAMA_SHARED_DECISION_REASONS.outsidePopulationCoreAccessOnDemand,
  "breast.ba.population.75-plus-shared-decision":
    MAMA_SHARED_DECISION_REASONS.continuationConditionedOnHealthHorizon,
};

export function mamaSharedDecisionReason(
  ruleId: string,
): MamaSharedDecisionReason | undefined {
  return MAMA_SHARED_DECISION_REASON_BY_RULE_ID[ruleId];
}
