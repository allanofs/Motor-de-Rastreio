import { IdSchema } from "../../model/common";

export const CCR_STRATEGY_VALUES = {
  fit: "fit",
  colonoscopy: "colonoscopy",
} as const;

export const CCR_IDS = {
  topic: "crc-screening",
  tracks: {
    routine: "crc-routine",
    population: "crc-population",
    fitStrategy: "crc-strategy-fit",
    colonoscopyStrategy: "crc-strategy-colonoscopy",
  },
  modalities: {
    fit: "crc-fit",
    // Legacy generic modality kept for Phase 6.0 technical fixtures only.
    colonoscopy: "crc-colonoscopy",
    colonoscopyScreening: "crc-colonoscopy-screening",
    colonoscopyDiagnostic: "crc-colonoscopy-diagnostic",
  },
  results: {
    fitNegative: "negative",
    fitPositive: "positive",
    colonoscopyNormal: "normal",
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
