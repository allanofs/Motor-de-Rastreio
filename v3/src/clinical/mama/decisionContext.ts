import type { SourceRef } from "../../model/content";
import type { EvaluationResult } from "../../engine/evaluatePatient";
import { MAMA_IDS } from "./terminology";
import {
  resolveMamaUnder40RoutineScope,
  type MamaPolicyFamily,
  type MamaUnder40ScopeResolution,
} from "./under40Scope";

export const MAMA_DECISION_CONTEXT_VERSION =
  "breast-0.1.5-m3-1-decision-context-draft" as const;

const SAFETY_TRACK_IDS = [
  MAMA_IDS.tracks.specialRisk,
  MAMA_IDS.tracks.priorFinding,
  MAMA_IDS.tracks.specificCare,
] as const;

export type MamaRoutineScopeDisposition =
  | "applied"
  | "not_applicable_age"
  | "suppressed_by_safety_track"
  | "suppressed_by_incomplete_safety_assessment";

export type MamaDecisionContext = Readonly<{
  version: typeof MAMA_DECISION_CONTEXT_VERSION;
  policyFamily: MamaPolicyFamily;
  ageYears: number;
  routineScopeDisposition: MamaRoutineScopeDisposition;
  routineScope: MamaUnder40ScopeResolution | null;
  additionalSourceRefs: readonly SourceRef[];
  safetyTrackIds: readonly string[];
}>;

function mamaTopic(result: EvaluationResult) {
  return result.plan.topics.find((topic) => topic.topicId === MAMA_IDS.topic);
}

/**
 * Canonical Mama domain context layered on top of the Foundation engine result.
 *
 * The Foundation remains unchanged. M3.1 under-40 provenance is attached only
 * when the safety tracks are completely evaluated and all are NotApplicable.
 * Any active higher-acuity pathway or incomplete safety assessment suppresses
 * routine age closure.
 */
export function buildMamaDecisionContext(args: {
  evaluation: EvaluationResult;
  policyFamily: MamaPolicyFamily;
  ageYears: number;
}): MamaDecisionContext {
  if (!Number.isFinite(args.ageYears) || args.ageYears < 0)
    throw new Error("Invalid age for Mama decision context");

  const topic = mamaTopic(args.evaluation);
  if (topic === undefined)
    throw new Error("Mama topic is missing from evaluation result");

  const safetyTracks = SAFETY_TRACK_IDS.map((trackId) => {
    const track = topic.tracks.find((item) => item.trackId === trackId);
    if (track === undefined)
      throw new Error(`Missing Mama safety track ${trackId}`);
    return track;
  });

  const safetyAssessmentIncomplete = safetyTracks.some(
    (track) =>
      track.completeness !== "complete" ||
      ["Indeterminate", "ComputationError", "Conflict"].includes(
        track.state.status,
      ),
  );

  if (safetyAssessmentIncomplete) {
    return {
      version: MAMA_DECISION_CONTEXT_VERSION,
      policyFamily: args.policyFamily,
      ageYears: args.ageYears,
      routineScopeDisposition: "suppressed_by_incomplete_safety_assessment",
      routineScope: null,
      additionalSourceRefs: [],
      safetyTrackIds: SAFETY_TRACK_IDS,
    };
  }

  const higherAcuityPresent = safetyTracks.some(
    (track) => track.state.status !== "NotApplicable",
  );

  if (higherAcuityPresent) {
    return {
      version: MAMA_DECISION_CONTEXT_VERSION,
      policyFamily: args.policyFamily,
      ageYears: args.ageYears,
      routineScopeDisposition: "suppressed_by_safety_track",
      routineScope: null,
      additionalSourceRefs: [],
      safetyTrackIds: SAFETY_TRACK_IDS,
    };
  }

  const routineScope = resolveMamaUnder40RoutineScope(
    args.policyFamily,
    args.ageYears,
  );

  if (routineScope === null) {
    return {
      version: MAMA_DECISION_CONTEXT_VERSION,
      policyFamily: args.policyFamily,
      ageYears: args.ageYears,
      routineScopeDisposition: "not_applicable_age",
      routineScope: null,
      additionalSourceRefs: [],
      safetyTrackIds: SAFETY_TRACK_IDS,
    };
  }

  return {
    version: MAMA_DECISION_CONTEXT_VERSION,
    policyFamily: args.policyFamily,
    ageYears: args.ageYears,
    routineScopeDisposition: "applied",
    routineScope,
    additionalSourceRefs: routineScope.sourceRefs,
    safetyTrackIds: SAFETY_TRACK_IDS,
  };
}
