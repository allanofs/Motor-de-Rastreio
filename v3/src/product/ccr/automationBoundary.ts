import { CCR_IDS } from "../../clinical/ccr";
import type { TrackEvaluation } from "../../model/evaluation";
import type { CcrProductSuccess } from "./integration";

export const CCR_AUTOMATION_BOUNDARY_CONTRACT_VERSION = "phaseB.1" as const;

/**
 * Product/domain contract only. These codes are intentionally NOT Foundation
 * states: they compress an already-computed CCR evaluation for a simpler
 * product surface without changing clinical meaning or erasing the original
 * TrackEvaluation/DecisionTrace.
 */
export type CcrAutomationBoundaryCode =
  | "CANNOT_CONCLUDE_SAFELY"
  | "SPECIFIC_ATTENTION_REQUIRED"
  | "SPECIFIC_CARE_ACTIVE"
  | "MORE_INFORMATION_NEEDED"
  | "SHARED_DECISION"
  | "ROUTINE_DUE"
  | "ROUTINE_CURRENT"
  | "SCREENING_NOT_INDICATED";

export type CcrAutomationBoundary = {
  contractVersion: typeof CCR_AUTOMATION_BOUNDARY_CONTRACT_VERSION;
  code: CcrAutomationBoundaryCode;
  /**
   * Tracks whose evaluated state caused this product-level conclusion.
   * Full provenance remains on each track trace; it is not duplicated here.
   */
  triggerTrackIds: string[];
};

function allTracks(result: CcrProductSuccess): TrackEvaluation[] {
  return result.evaluation.plan.topics.flatMap((topic) => topic.tracks);
}

function select(
  tracks: TrackEvaluation[],
  predicate: (track: TrackEvaluation) => boolean,
): TrackEvaluation[] {
  return tracks.filter(predicate);
}

function boundary(
  code: CcrAutomationBoundaryCode,
  tracks: TrackEvaluation[],
): CcrAutomationBoundary {
  return {
    contractVersion: CCR_AUTOMATION_BOUNDARY_CONTRACT_VERSION,
    code,
    triggerTrackIds: [...new Set(tracks.map((track) => track.trackId))],
  };
}

/**
 * Safety precedence for the CCR product surface:
 *
 * 1. technical/semantic safe failure;
 * 2. care already handed off or specific attention that suspends routine;
 * 3. missing information;
 * 4. shared decision / strategy choice;
 * 5. routine screening due;
 * 6. routine current;
 * 7. no routine screening indication in the evaluated path.
 *
 * This function is domain-specific on purpose. It must not be promoted to the
 * Foundation until the same semantics are independently demonstrated in a
 * second domain.
 */
export function deriveCcrAutomationBoundary(
  result: CcrProductSuccess,
): CcrAutomationBoundary {
  const tracks = allTracks(result);

  const unsafe = select(tracks, (track) =>
    ["Conflict", "ComputationError"].includes(track.state.status),
  );
  if (unsafe.length > 0) return boundary("CANNOT_CONCLUDE_SAFELY", unsafe);

  const handedOff = select(
    tracks,
    (track) => track.state.status === "HandedOff",
  );
  if (handedOff.length > 0) return boundary("SPECIFIC_CARE_ACTIVE", handedOff);

  const specificAttention = select(
    tracks,
    (track) =>
      track.state.status === "ClinicalReviewRequired" ||
      track.state.status === "InFollowUp" ||
      (track.trackId === CCR_IDS.tracks.fitFollowup &&
        track.state.status === "PendingResult"),
  );
  if (specificAttention.length > 0)
    return boundary("SPECIFIC_ATTENTION_REQUIRED", specificAttention);

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
    (track) =>
      track.state.status === "SharedDecision" ||
      track.missingData.includes(CCR_IDS.concepts.screeningStrategySelection),
  );
  if (sharedDecision.length > 0)
    return boundary("SHARED_DECISION", sharedDecision);

  const due = select(tracks, (track) => track.state.status === "Due");
  if (due.length > 0) return boundary("ROUTINE_DUE", due);

  const current = select(tracks, (track) => track.state.status === "Current");
  if (current.length > 0) return boundary("ROUTINE_CURRENT", current);

  return boundary("SCREENING_NOT_INDICATED", tracks);
}
