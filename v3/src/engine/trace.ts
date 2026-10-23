import type { CalendarDate } from "../model/dates";
import type { DecisionTrace } from "../model/evaluation";
export const ENGINE_VERSION = "3.0.0-alpha.2";
export const PIPELINE_STAGES = [
  "sanitize_prune",
  "schema_validation",
  "semantic_validation",
  "normalize_patient",
  "derive_context",
  "resolve_domain_history",
  "evaluate_rules",
  "resolve_strategies",
  "compose_actions",
  "calculate_schedule",
  "topic_evaluation",
  "build_plan",
  "decision_trace",
] as const;
export function createTrace(
  asOf: CalendarDate,
  policyId: string,
  rulesetVersion: string,
): DecisionTrace {
  return {
    engineVersion: ENGINE_VERSION,
    rulesetVersion,
    policyId,
    asOf,
    factsUsed: [],
    rulesEvaluated: [],
    rulesActivated: [],
    rulesSuppressed: [],
    outputs: [],
    sourceIds: [],
    sourceRefs: [],
    extensions: [],
    stages: [],
    issues: [],
  };
}
