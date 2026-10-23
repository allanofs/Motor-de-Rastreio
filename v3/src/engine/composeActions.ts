import type { CareSettingContext, RuleDefinition } from "../model/content";
import { resourceAvailability } from "../model/content";
import type { EvaluatedAction, PathwayState } from "../model/evaluation";
import { unique } from "../model/common";
export function composeStates(
  states: PathwayState[],
  rules: RuleDefinition[],
): PathwayState {
  if (states.some((s) => s.status === "ClinicalReviewRequired"))
    return {
      status: "ClinicalReviewRequired",
      reason: "At least one active rule requires human judgment",
    };
  if (
    rules.some((r) =>
      ["choose_shorter_interval", "choose_higher_acuity"].includes(
        r.compositionPolicy ?? "",
      ),
    )
  )
    return {
      status: "ClinicalReviewRequired",
      reason:
        "Composition requires a domain-specific, reviewed comparator; none is registered in this foundation",
    };
  if (states.some((s) => s.status === "Indeterminate"))
    return {
      status: "Indeterminate",
      reason: "At least one active rule lacks sufficient evidence",
    };
  if (
    new Set(states.map((s) => s.status)).size > 1 ||
    (rules.length > 1 &&
      rules.some((r) => r.compositionPolicy === "manual_conflict"))
  )
    return {
      status: "Conflict",
      ruleIds: rules.map((r) => r.ruleId),
      reason: "Incompatible active outputs without an explicit resolution",
    };
  return (
    states[0] ?? {
      status: "Indeterminate",
      reason: "No evaluable content for this topic",
    }
  );
}
export function composeActions(
  rules: RuleDefinition[],
  careSetting: CareSettingContext,
  scope: { topicId: string; trackId: string },
): { actions: EvaluatedAction[]; conflict: boolean } {
  const map = new Map<string, EvaluatedAction>();
  for (const rule of rules)
    for (const a of rule.actions) {
      const existing = map.get(a.actionId);
      if (existing !== undefined) {
        const {
          ruleIds: _ids,
          operational: _op,
          topicId: _topic,
          trackId: _track,
          ...definition
        } = existing;
        if (JSON.stringify(definition) !== JSON.stringify(a))
          return { actions: [], conflict: true };
        existing.ruleIds = unique([...existing.ruleIds, rule.ruleId]);
        continue;
      }
      const action: EvaluatedAction = {
        ...a,
        ...scope,
        ruleIds: [rule.ruleId],
      };
      if (a.resourceId !== undefined) {
        const availability = resourceAvailability(careSetting, a.resourceId);
        action.operational = {
          availability,
          route:
            availability === "available"
              ? "local"
              : availability === "unknown"
                ? "clarify_availability"
                : (a.unavailableRoute ?? "clinical_review"),
        };
      }
      map.set(a.actionId, action);
    }
  const actions = [...map.values()].sort((a, b) =>
    a.actionId.localeCompare(b.actionId, "en"),
  );
  for (const a of actions)
    for (const b of actions)
      if (
        a.resourceId !== undefined &&
        a.resourceId === b.resourceId &&
        ((a.kind === "avoid" && b.kind === "recommendation") ||
          (b.kind === "avoid" && a.kind === "recommendation"))
      )
        return { actions: [], conflict: true };
  return { actions, conflict: false };
}
