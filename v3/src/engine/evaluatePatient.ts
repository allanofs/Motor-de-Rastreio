import { z } from "zod";
import { IdSchema, unique } from "../model/common";
import { CalendarDateSchema } from "../model/dates";
import {
  CareSettingContextSchema,
  parseContent,
  parsePatientDomains,
} from "./input";
import type { Ruleset, Policy, CareSettingContext } from "../model/content";
import type { CalendarDate } from "../model/dates";
import type { Patient } from "../model/patient";
import type {
  ConsultationPlan,
  TopicEvaluation,
  DecisionTrace,
} from "../model/evaluation";
import { semanticIssues } from "./validate";
import { deriveContext, normalizePatient } from "./derive";
import { resolveDomainHistory } from "./resolveHistory";
import { evaluateApplicableRules } from "./evaluateRules";
import { resolveStrategies } from "./resolveStrategies";
import { calculateSchedule } from "./schedule";
import { composeActions, composeStates } from "./composeActions";
import { createTrace, PIPELINE_STAGES } from "./trace";
import {
  computationError,
  emptyEvaluation,
  safeEvaluateTopic,
} from "./safeEvaluate";
import { buildConsultationPlan } from "./buildPlan";
import { contentIssues } from "./validateContent";
const ControlInputSchema = z.strictObject({
  asOf: CalendarDateSchema,
  policyId: IdSchema,
  ruleset: z.unknown(),
  patient: z.unknown(),
  careSetting: z.unknown().optional(),
});
export type EvaluationRequest = {
  patient: unknown;
  asOf: CalendarDate;
  policyId: string;
  ruleset: unknown;
  careSetting?: CareSettingContext;
};
export type EvaluationResult = {
  plan: ConsultationPlan;
  traces: DecisionTrace[];
};
function evaluateTopic(
  topicId: string,
  patient: Patient,
  bundle: Ruleset,
  policy: Policy,
  care: CareSettingContext,
  asOf: CalendarDate,
  trace: DecisionTrace,
  ruleTopics: ReadonlyMap<string, string>,
): TopicEvaluation {
  trace.stages = [...PIPELINE_STAGES.slice(0, 3)];
  const base = emptyEvaluation(topicId, trace);
  const content = contentIssues(bundle, policy, topicId, ruleTopics);
  if (content.length > 0) {
    trace.issues = content;
    return computationError(topicId, trace, "invalid_content");
  }
  const invalid = semanticIssues(patient, asOf, topicId);
  if (invalid.length > 0)
    return {
      ...base,
      pathwayState: {
        status: "Indeterminate",
        reason:
          "Input is contradictory, temporally invalid or requires clarification",
      },
      missingData: invalid,
      trace: { ...trace, issues: invalid, outputs: ["Indeterminate"] },
    };
  const normalized = deriveContext(normalizePatient(patient), asOf);
  const history = resolveDomainHistory(normalized, topicId);
  trace.stages.push(...PIPELINE_STAGES.slice(3, 7));
  const rules = bundle.rules
    .filter((r) => r.topicId === topicId && policy.ruleIds.includes(r.ruleId))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId, "en"));
  trace.rulesEvaluated = rules.map((r) => r.ruleId);
  const evaluated = evaluateApplicableRules(rules, normalized);
  trace.factsUsed = unique([
    ...evaluated.factsUsed,
    ...history.events.map((e) => e.id),
  ]);
  const strategies = resolveStrategies(evaluated.active, policy);
  const active = strategies.active;
  const suppressed = [...evaluated.suppressed, ...strategies.suppressed].sort(
    (a, b) => a.ruleId.localeCompare(b.ruleId, "en"),
  );
  trace.rulesActivated = active.map((r) => r.ruleId);
  trace.rulesSuppressed = suppressed;
  trace.sourceRefs = active
    .flatMap((r) => r.sourceRefs)
    .filter(
      (r, i, list) =>
        list.findIndex(
          (s) => s.sourceId === r.sourceId && s.locator === r.locator,
        ) === i,
    )
    .sort(
      (a, b) =>
        a.sourceId.localeCompare(b.sourceId, "en") ||
        a.locator.localeCompare(b.locator, "en"),
    );
  trace.sourceIds = unique(trace.sourceRefs.map((s) => s.sourceId));
  trace.stages.push("resolve_strategies");
  if (strategies.conflicts.length > 0)
    return {
      ...base,
      activeRuleIds: active.map((r) => r.ruleId),
      suppressedRules: suppressed,
      pathwayState: {
        status: "Conflict",
        ruleIds: strategies.conflicts,
        reason: "Exclusive strategy or content exclusion conflict",
      },
      trace: { ...trace, outputs: ["Conflict"] },
    };
  const composed = composeActions(active, care);
  trace.stages.push("compose_actions");
  const calculated = active.map((r) =>
    calculateSchedule(r, history.events, asOf),
  );
  trace.stages.push("calculate_schedule");
  const missing = unique([
    ...evaluated.missing,
    ...calculated.flatMap((c) => c.missing),
  ]);
  let state = composeStates(
    calculated.map((c) => c.state),
    active,
  );
  if (
    active.length === 0 &&
    rules.some((r) => r.lifecycleStatus === "active") &&
    evaluated.missing.length === 0
  )
    state = {
      status: "NotApplicable",
      reason: "No applicable active rule under this policy",
    };
  if (active.length === 0 && !rules.some((r) => r.lifecycleStatus === "active"))
    state = {
      status: "ClinicalReviewRequired",
      reason: "This policy has no implemented content for the topic",
    };
  if (missing.length > 0)
    state = {
      status: "Indeterminate",
      reason: "Required clinical information or date precision is missing",
    };
  if (composed.conflict)
    state = {
      status: "Conflict",
      ruleIds: active.map((r) => r.ruleId),
      reason: "Incompatible actions without explicit composition",
    };
  const abstain = [
    "ComputationError",
    "Conflict",
    "NotApplicable",
    "ClinicalReviewRequired",
    "Indeterminate",
    "Current",
  ].includes(state.status);
  trace.stages.push(...PIPELINE_STAGES.slice(10));
  trace.outputs = [state.status];
  const selected = active.filter(
    (r) =>
      r.strategyGroupId !== undefined &&
      policy.primaryStrategies[r.strategyGroupId] === r.ruleId,
  );
  const primary = selected.length === 1 ? selected[0]?.ruleId : undefined;
  return {
    ...base,
    completeness:
      missing.length > 0 ||
      ["Indeterminate", "ComputationError"].includes(state.status)
        ? "incomplete"
        : "complete",
    pathwayState: state,
    activeRuleIds: active.map((r) => r.ruleId),
    ...(primary === undefined ? {} : { primaryStrategyRuleId: primary }),
    actions: abstain ? [] : composed.actions,
    missingData: missing,
    guardrails: unique(active.flatMap((r) => r.guardrails)),
    scheduleInformation: calculated.flatMap((c) => c.schedule),
    suppressedRules: suppressed,
    trace,
  };
}
/** No clock, DOM, network, storage or clinical content is available to this engine. */
export function evaluatePatient(input: EvaluationRequest): EvaluationResult {
  // A malformed control envelope has no reliable asOf/topic identity: refuse explicitly at the API boundary.
  const request = ControlInputSchema.parse(input);
  const { bundle, policy, invalidTopics, ruleTopics } = parseContent(
    request.ruleset,
    request.policyId,
  );
  const care = CareSettingContextSchema.safeParse(request.careSetting ?? {});
  const patients = parsePatientDomains(request.patient, policy.topicIds);
  const topics = unique(policy.topicIds).map((topicId) => {
    const trace = createTrace(
      request.asOf,
      policy.policyId,
      bundle.rulesetVersion,
    );
    const patient = patients.get(topicId);
    if (invalidTopics.has(topicId))
      return computationError(topicId, trace, "invalid_domain_content");
    if (patient === undefined || !care.success)
      return computationError(topicId, trace, "invalid_input_schema");
    return safeEvaluateTopic(topicId, trace, () =>
      evaluateTopic(
        topicId,
        patient,
        bundle,
        policy,
        care.data,
        request.asOf,
        trace,
        ruleTopics,
      ),
    );
  });
  return {
    plan: buildConsultationPlan(topics),
    traces: topics.map((t) => t.trace),
  };
}
