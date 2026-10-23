import type { DecisionTrace, TopicEvaluation } from "../model/evaluation";
import { TopicEvaluationSchema } from "../model/evaluation";
export function emptyEvaluation(
  topicId: string,
  trace: DecisionTrace,
): TopicEvaluation {
  return {
    topicId,
    completeness: "incomplete",
    pathwayState: {
      status: "Indeterminate",
      reason: "Evaluation not completed",
    },
    activeRuleIds: [],
    actions: [],
    missingData: [],
    guardrails: [],
    scheduleInformation: [],
    suppressedRules: [],
    trace,
  };
}
export function computationError(
  topicId: string,
  trace: DecisionTrace,
  code: string,
): TopicEvaluation {
  // Do not leak exceptions, raw input, stack traces or sensitive values to logs or output.
  return {
    ...emptyEvaluation(topicId, trace),
    pathwayState: {
      status: "ComputationError",
      code,
      message:
        "Não foi possível avaliar este domínio com segurança. Revisão necessária.",
    },
    guardrails: [
      "Falha técnica explícita; nenhuma recomendação automática emitida.",
    ],
    trace: {
      ...trace,
      outputs: ["ComputationError"],
      issues: [...trace.issues, code],
    },
  };
}
export function safeEvaluateTopic(
  topicId: string,
  trace: DecisionTrace,
  evaluate: () => TopicEvaluation,
): TopicEvaluation {
  try {
    return TopicEvaluationSchema.parse(evaluate());
  } catch {
    return computationError(topicId, trace, "domain_evaluation_failed");
  }
}
