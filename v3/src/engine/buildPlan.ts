import type { ConsultationPlan, TopicEvaluation } from "../model/evaluation";
export function buildConsultationPlan(
  topics: TopicEvaluation[],
): ConsultationPlan {
  return {
    topics,
    actions: topics.flatMap((t) => t.actions),
    requiresAttention: topics.some((t) =>
      t.tracks.some(
        (track) => !["Current", "NotApplicable"].includes(track.state.status),
      ),
    ),
  };
}
