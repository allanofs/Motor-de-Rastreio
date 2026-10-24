import { IdSchema } from "../../model/common";

export const CCR_STRATEGY_VALUES = {
  fit: "fit",
  colonoscopy: "colonoscopy",
} as const;

export const CCR_FAMILY_DETAIL_KEYS = {
  affectedFdrCount: "affected-fdr-count",
  affectedSdrCount: "affected-sdr-count",
  youngestDiagnosisAgeBand: "youngest-diagnosis-age-band",
  youngestDiagnosisAgeYears: "youngest-diagnosis-age-years",
  findingType: "finding-type",
} as const;

export const CCR_FAMILY_VALUES = {
  ageUnder60: "under-60",
  age60OrOlder: "60-or-older",
  ageUnknown: "unknown",
  crc: "crc",
  advancedPolyp: "advanced-polyp",
  polypUnknownType: "polyp-unknown-type",
  findingUnknown: "unknown",
} as const;

export const CCR_IDS = {
  topic: "crc-screening",
  tracks: {
    routine: "crc-routine",
    population: "crc-population",
    fitStrategy: "crc-strategy-fit",
    colonoscopyStrategy: "crc-strategy-colonoscopy",
    fitFollowup: "crc-fit-positive-followup",
    postFitRoutine: "crc-post-fit-routine",
    familyStatus: "crc-family-status",
    familyHighRisk: "crc-family-high-risk",
    familyChoice: "crc-family-strategy-choice",
  },
  modalities: {
    fit: "crc-fit",
    // Legacy generic modality kept for Phase 6.0 technical fixtures and diagnostic colonoscopy whose indication is not established.
    colonoscopy: "crc-colonoscopy",
    colonoscopyScreening: "crc-colonoscopy-screening",
    // This modality is reserved for a diagnostic colonoscopy known to belong to the post-FIT-positive pathway.
    colonoscopyDiagnostic: "crc-colonoscopy-diagnostic",
  },
  results: {
    fitNegative: "negative",
    fitPositive: "positive",
    colonoscopyNormal: "normal",
    colonoscopyPolypOrLesion: "polyp-or-lesion",
    colonoscopyCancer: "cancer",
  },
  concepts: {
    screeningContextConfirmed: "crc-screening-context-confirmed",
    priorCrc: "crc-prior-crc",
    priorPolypSurveillance: "crc-prior-polyp-surveillance",
    colonicIbd: "crc-colonic-ibd",
    hereditarySyndrome: "crc-hereditary-syndrome",
    familyHistoryRelevant: "crc-family-history-relevant",
    familyHistoryUnknown: "crc-family-history-unknown",
    screeningStrategySelection: "crc-screening-strategy-selection",
    historySufficientForCurrentStatus: "crc-history-sufficient-current-status",
    specialistCareAssumed: "crc-specialist-care-assumed",
  },
  resources: {
    fit: "crc-resource-fit",
    colonoscopy: "crc-resource-colonoscopy",
  },
} as const;

const terminologyCandidates = [
  CCR_IDS.topic,
  ...Object.values(CCR_IDS.tracks),
  ...Object.values(CCR_IDS.modalities),
  ...Object.values(CCR_IDS.results),
  ...Object.values(CCR_IDS.concepts),
  ...Object.values(CCR_IDS.resources),
];

export const ccrTerminology = [
  ...new Set(terminologyCandidates.map((id) => IdSchema.parse(id))),
].sort();
