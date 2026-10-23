import type {
  DecisionTrace,
  TopicEvaluation,
  TrackEvaluation,
} from "../model/evaluation";
import {
  TopicEvaluationSchema,
  TrackEvaluationSchema,
} from "../model/evaluation";
import { PIPELINE_STAGES } from "./trace";
import { unique } from "../model/common";
export function emptyTrack(
  trackId: string,
  trace: DecisionTrace,
): TrackEvaluation {
  return {
    trackId,
    completeness: "incomplete",
    state: { status: "Indeterminate", reason: "Evaluation not completed" },
    activeRuleIds: [],
    actions: [],
    decisionSupport: [],
    missingData: [],
    guardrails: [],
    scheduleInformation: [],
    suppressedRules: [],
    trace,
  };
}
export function assembleTopic(
  topicId: string,
  tracks: TrackEvaluation[],
  baseTrace: DecisionTrace,
): TopicEvaluation {
  const suppressed = tracks.flatMap((t) => t.suppressedRules);
  const refs = tracks
    .flatMap((t) => t.trace.sourceRefs)
    .filter(
      (ref, i, all) =>
        all.findIndex(
          (other) => JSON.stringify(other) === JSON.stringify(ref),
        ) === i,
    );
  return {
    topicId,
    tracks,
    completeness: tracks.some((t) => t.completeness === "incomplete")
      ? "incomplete"
      : "complete",
    activeRuleIds: unique(tracks.flatMap((t) => t.activeRuleIds)),
    actions: tracks.flatMap((t) => t.actions),
    missingData: unique(tracks.flatMap((t) => t.missingData)),
    guardrails: unique(tracks.flatMap((t) => t.guardrails)),
    scheduleInformation: tracks.flatMap((t) => t.scheduleInformation),
    suppressedRules: suppressed,
    trace: {
      ...baseTrace,
      factsUsed: unique(tracks.flatMap((t) => t.trace.factsUsed)),
      recordsUsed: unique(tracks.flatMap((t) => t.trace.recordsUsed)),
      recordsConsidered: unique(tracks.flatMap((t) => t.trace.recordsConsidered)),
      rulesEvaluated: unique(tracks.flatMap((t) => t.trace.rulesEvaluated)),
      rulesActivated: unique(tracks.flatMap((t) => t.activeRuleIds)),
      rulesSuppressed: suppressed,
      sourceIds: unique(refs.map((ref) => ref.sourceId)),
      sourceRefs: refs,
      extensions: tracks.flatMap((t) => t.trace.extensions),
      stages: PIPELINE_STAGES.filter((stage) =>
        tracks.some((t) => t.trace.stages.includes(stage)),
      ),
      issues: unique(tracks.flatMap((t) => t.trace.issues)),
      outputs: tracks.map((t) => `${t.trackId}:${t.state.status}`),
    },
  };
}
export function failedTrack(
  trackId: string,
  trace: DecisionTrace,
  code: string,
): TrackEvaluation {
  return {
    ...emptyTrack(trackId, trace),
    state: {
      status: "ComputationError",
      code,
      message:
        "Não foi possível avaliar este track com segurança. Revisão necessária.",
    },
    guardrails: [
      "Falha técnica explícita; nenhuma recomendação automática emitida neste track.",
    ],
    trace: {
      ...trace,
      recordsUsed: [],
      outputs: ["ComputationError"],
      issues: [...trace.issues, code],
    },
  };
}
export function computationError(
  topicId: string,
  trace: DecisionTrace,
  code: string,
): TopicEvaluation {
  return assembleTopic(
    topicId,
    [failedTrack("domain-status", trace, code)],
    trace,
  );
}
export function safeEvaluateTrack(
  trackId: string,
  trace: DecisionTrace,
  evaluate: () => TrackEvaluation,
): TrackEvaluation {
  try {
    return TrackEvaluationSchema.parse(evaluate());
  } catch {
    return failedTrack(trackId, trace, "track_evaluation_failed");
  }
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
