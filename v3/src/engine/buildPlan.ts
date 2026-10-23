import type { ConsultationPlan, TopicEvaluation } from "../model/evaluation";
export function buildConsultationPlan(
  topics: TopicEvaluation[],
): ConsultationPlan {
  return {
    topics,
    actions: topics.flatMap((t) => t.actions),
    requiresAttention: topics.some(
      (t) => !["Current", "NotApplicable"].includes(t.pathwayState.status),
    ),
  };
}
