import {
  MAMA_IDS,
  mamaSharedDecisionReason,
  type MamaSharedDecisionReason,
} from "../../clinical/mama";
import type { TrackEvaluation } from "../../model/evaluation";
import type { MamaProductSuccess } from "./integration";

export const MAMA_AUTOMATION_BOUNDARY_CONTRACT_VERSION = "mama-B1" as const;

export type MamaAutomationBoundaryCode =
  | "CANNOT_CONCLUDE_SAFELY"
  | "SPECIFIC_ATTENTION_REQUIRED"
  | "SPECIFIC_CARE_ACTIVE"
  | "MORE_INFORMATION_NEEDED"
  | "SHARED_DECISION"
  | "ROUTINE_DUE"
  | "ROUTINE_CURRENT"
  | "SCREENING_NOT_INDICATED";

export type MamaAutomationBoundaryReasonCode =
  | MamaSharedDecisionReason
  | "insufficient-evidence"
  | "under40-routine-not-recommended"
  | "under40-outside-recommendation-scope";

export type MamaAutomationBoundary = {
  contractVersion: typeof MAMA_AUTOMATION_BOUNDARY_CONTRACT_VERSION;
  code: MamaAutomationBoundaryCode;
  triggerTrackIds: string[];
  provenanceCarrier: "track_trace" | "decision_context" | "none";
  reasonCode?: MamaAutomationBoundaryReasonCode;
};

function allTracks(result: MamaProductSuccess): TrackEvaluation[] {
  return result.evaluation.plan.topics.flatMap((topic) => topic.tracks);
}

function select(
  tracks: TrackEvaluation[],
  predicate: (track: TrackEvaluation) => boolean,
): TrackEvaluation[] {
  return tracks.filter(predicate);
}

function boundary(
  code: MamaAutomationBoundaryCode,
  tracks: TrackEvaluation[],
  options: {
    provenanceCarrier?: MamaAutomationBoundary["provenanceCarrier"];
    reasonCode?: MamaAutomationBoundaryReasonCode;
  } = {},
): MamaAutomationBoundary {
  return {
    contractVersion: MAMA_AUTOMATION_BOUNDARY_CONTRACT_VERSION,
    code,
    triggerTrackIds: [...new Set(tracks.map((track) => track.trackId))],
    provenanceCarrier:
      options.provenanceCarrier ?? (tracks.length > 0 ? "track_trace" : "none"),
    ...(options.reasonCode === undefined
      ? {}
      : { reasonCode: options.reasonCode }),
  };
}

function sharedDecisionReason(
  tracks: TrackEvaluation[],
): MamaSharedDecisionReason | undefined {
  for (const ruleId of tracks.flatMap((track) => track.activeRuleIds)) {
    const reason = mamaSharedDecisionReason(ruleId);
    if (reason !== undefined) return reason;
  }
  return undefined;
}

/**
 * Mama product safety precedence.
 *
 * M3.1 adds one deliberate difference from CCR: average-risk <40 closure is a
 * reviewed domain decision-context artifact rather than an engine RuleDefinition.
 * The product boundary may therefore use `decisionContext` only after the
 * clinical adapter has proved that safety tracks are complete and inactive.
 */
export function deriveMamaAutomationBoundary(
  result: MamaProductSuccess,
): MamaAutomationBoundary {
  const tracks = allTracks(result);

  const unsafe = select(tracks, (track) =>
    ["Conflict", "ComputationError"].includes(track.state.status),
  );
  if (unsafe.length > 0) return boundary("CANNOT_CONCLUDE_SAFELY", unsafe);

  const specificCare = select(
    tracks,
    (track) =>
      track.trackId === MAMA_IDS.tracks.specificCare &&
      ["ClinicalReviewRequired", "InFollowUp", "HandedOff"].includes(
        track.state.status,
      ),
  );
  if (specificCare.length > 0)
    return boundary("SPECIFIC_CARE_ACTIVE", specificCare);

  const specificAttention = select(
    tracks,
    (track) =>
      (track.trackId === MAMA_IDS.tracks.specialRisk ||
        track.trackId === MAMA_IDS.tracks.priorFinding) &&
      ["ClinicalReviewRequired", "InFollowUp", "HandedOff"].includes(
        track.state.status,
      ),
  );
  if (specificAttention.length > 0)
    return boundary("SPECIFIC_ATTENTION_REQUIRED", specificAttention);

  const insufficientEvidence = select(
    tracks,
    (track) =>
      track.trackId === MAMA_IDS.tracks.population &&
      track.state.status === "ClinicalReviewRequired",
  );
  if (insufficientEvidence.length > 0)
    return boundary("SHARED_DECISION", insufficientEvidence, {
      reasonCode: "insufficient-evidence",
    });

  const unknownClinicalReview = select(
    tracks,
    (track) => track.state.status === "ClinicalReviewRequired",
  );
  if (unknownClinicalReview.length > 0)
    return boundary("CANNOT_CONCLUDE_SAFELY", unknownClinicalReview);

  const missingInformation = select(
    tracks,
    (track) =>
      track.state.status === "Indeterminate" ||
      track.state.status === "PendingResult",
  );
  if (missingInformation.length > 0)
    return boundary("MORE_INFORMATION_NEEDED", missingInformation);

  const sharedDecision = select(
    tracks,
    (track) => track.state.status === "SharedDecision",
  );
  if (sharedDecision.length > 0) {
    const reasonCode = sharedDecisionReason(sharedDecision);
    return boundary(
      "SHARED_DECISION",
      sharedDecision,
      reasonCode === undefined ? {} : { reasonCode },
    );
  }

  const due = select(tracks, (track) => track.state.status === "Due");
  if (due.length > 0) return boundary("ROUTINE_DUE", due);

  const current = select(tracks, (track) => track.state.status === "Current");
  if (current.length > 0) return boundary("ROUTINE_CURRENT", current);

  if (result.decisionContext?.routineScopeDisposition === "applied") {
    return boundary("SCREENING_NOT_INDICATED", [], {
      provenanceCarrier: "decision_context",
      reasonCode:
        result.decisionContext.routineScope?.conclusion ===
        "outside_recommendation_scope"
          ? "under40-outside-recommendation-scope"
          : "under40-routine-not-recommended",
    });
  }

  return boundary("SCREENING_NOT_INDICATED", tracks, {
    provenanceCarrier: "track_trace",
  });
}
