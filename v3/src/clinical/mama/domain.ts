import { MAMA_IDS } from "./terminology";

/**
 * M1 domain contract for breast screening.
 *
 * These collections define representability and ownership boundaries only.
 * They are not executable clinical logic.
 */
export const MAMA_ROUTINE_REQUIRED_CONCEPTS = [
  MAMA_IDS.concepts.screeningContextConfirmed,
  MAMA_IDS.concepts.relevantBreastTissuePresent,
  MAMA_IDS.concepts.historySufficientForCurrentStatus,
] as const;

export const MAMA_HARD_EXIT_CONCEPTS = [
  MAMA_IDS.concepts.suspiciousBreastSymptoms,
  MAMA_IDS.concepts.priorBreastCancer,
  MAMA_IDS.concepts.highRiskGeneticContext,
  MAMA_IDS.concepts.priorHighRiskChestRadiation,
  MAMA_IDS.concepts.priorHighRiskBreastLesion,
  MAMA_IDS.concepts.specificBreastCareActive,
  MAMA_IDS.concepts.priorMammographyNeedsSpecificAttention,
] as const;

export const MAMA_ROUTINE_MODALITIES = [
  MAMA_IDS.modalities.mammographyScreening,
] as const;

export const MAMA_NON_ROUTINE_MODALITIES = [
  MAMA_IDS.modalities.mammographyDiagnostic,
] as const;

export const MAMA_ROUTINE_RESULT_CLASSES = [
  MAMA_IDS.results.routineClearing,
  MAMA_IDS.results.attentionRequired,
  MAMA_IDS.results.indeterminate,
] as const;

/**
 * M1 intentionally keeps the first release to a single operational resource.
 * DBT, ultrasound, MRI and biopsy are not represented as routine resources yet.
 */
export const MAMA_ROUTINE_RESOURCES = [MAMA_IDS.resources.mammography] as const;

/**
 * Tracks are intentionally coarse to enforce the approved Depth Budget.
 * No BI-RADS-specific or diagnostic-management track exists in M1.
 */
export const MAMA_TRACKS = [
  MAMA_IDS.tracks.routine,
  MAMA_IDS.tracks.population,
  MAMA_IDS.tracks.priorFinding,
  MAMA_IDS.tracks.specialRisk,
  MAMA_IDS.tracks.specificCare,
] as const;
