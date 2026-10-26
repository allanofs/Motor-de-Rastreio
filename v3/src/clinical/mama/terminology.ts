import { IdSchema } from "../../model/common";

/**
 * Breast screening terminology for the M1 representability layer.
 *
 * M1 deliberately defines vocabulary only. It does not encode executable
 * clinical rules, age thresholds, intervals, BI-RADS management, or risk
 * calculations.
 */
export const MAMA_IDS = {
  topic: "breast-cancer-screening",
  tracks: {
    routine: "breast-routine-screening",
    population: "breast-population-status",
    priorFinding: "breast-prior-finding-status",
    specialRisk: "breast-special-risk-status",
    specificCare: "breast-specific-care-status",
  },
  modalities: {
    mammographyScreening: "breast-mammography-screening",
    mammographyDiagnostic: "breast-mammography-diagnostic",
  },
  results: {
    routineClearing: "routine-clearing",
    attentionRequired: "attention-required",
    indeterminate: "indeterminate",
  },
  concepts: {
    screeningContextConfirmed: "breast-screening-context-confirmed",
    relevantBreastTissuePresent: "breast-relevant-tissue-present",
    suspiciousBreastSymptoms: "breast-suspicious-symptoms",
    priorBreastCancer: "breast-prior-cancer",
    highRiskGeneticContext: "breast-high-risk-genetic-context",
    priorHighRiskChestRadiation: "breast-prior-high-risk-chest-radiation",
    priorHighRiskBreastLesion: "breast-prior-high-risk-lesion",
    specificBreastCareActive: "breast-specific-care-active",
    historySufficientForCurrentStatus: "breast-history-sufficient-current-status",
    priorMammographyAllowsRoutine: "breast-prior-mammography-allows-routine",
    priorMammographyNeedsSpecificAttention:
      "breast-prior-mammography-needs-specific-attention",
  },
  resources: {
    mammography: "breast-resource-mammography",
  },
} as const;

const terminologyCandidates = [
  MAMA_IDS.topic,
  ...Object.values(MAMA_IDS.tracks),
  ...Object.values(MAMA_IDS.modalities),
  ...Object.values(MAMA_IDS.results),
  ...Object.values(MAMA_IDS.concepts),
  ...Object.values(MAMA_IDS.resources),
];

export const mamaTerminology = [
  ...new Set(terminologyCandidates.map((id) => IdSchema.parse(id))),
].sort();
