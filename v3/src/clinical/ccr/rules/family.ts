import { RuleDefinitionSchema, type RuleDefinition } from "../../../model/content";
import {
  clinicalReviewAction,
  colonoscopyScreeningAction,
  fitScreeningAction,
  offerScreeningStrategyAction,
} from "../actions";
import { CCR_SOURCE_IDS } from "../sources";
import { CCR_IDS } from "../terminology";

function draftRule(input: Record<string, unknown>, rationale: string): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...input,
    lifecycleStatus: "draft",
    reviewStatus: "source_verified",
    governance: {
      author: "Allan Ramos Costa",
      rationale,
      reviews: [],
    },
  });
}

const familyPositive = {
  conceptId: CCR_IDS.concepts.familyHistoryRelevant,
  presence: "yes" as const,
};

function familyStatusRule(args: {
  ruleId: string;
  sourceId: string;
  locator: string;
  rationale: string;
}): RuleDefinition {
  return draftRule(
    {
      ruleId: args.ruleId,
      topicId: CCR_IDS.topic,
      trackId: CCR_IDS.tracks.familyStatus,
      clinicalRole: "screening",
      stance: "no_formal_recommendation",
      computability: "partially_computable",
      requiredKnownFacts: [CCR_IDS.concepts.familyHistoryRelevant],
      population: { facts: [] },
      exclusions: [],
      actions: [clinicalReviewAction],
      outcome: "ClinicalReviewRequired",
      decisionSupport: [],
      supersedes: [],
      excludes: [],
      guardrails: [
        "Unknown family history is not equivalent to negative family history.",
        "The family-status track may preserve an age-based minimum screening indication while withholding a final strategy until family history is clarified.",
      ],
      sourceRefs: [{ sourceId: args.sourceId, locator: args.locator }],
    },
    args.rationale,
  );
}

export const susFamilyStatusRule = familyStatusRule({
  ruleId: "crc.sus.family-status",
  sourceId: CCR_SOURCE_IDS.susOci2026,
  locator:
    "population screening pathway is limited to the routine Brazilian program; relevant family-history risk is not silently assigned an imported foreign algorithm",
  rationale:
    "SUS family history gate: positive relevant family history exits simple routine automation for clinical review.",
});

export const baFamilyStatusRule = familyStatusRule({
  ruleId: "crc.ba-a.family-status",
  sourceId: CCR_SOURCE_IDS.sboc2026,
  locator:
    "Brazilian screening context plus reviewed BA-A governance: positive family history is not assigned an international algorithm automatically",
  rationale:
    "BA-A family history gate: preserve the conservative Brazilian policy boundary and require review for positive relevant history.",
});

export const internationalFamilyStatusRule = familyStatusRule({
  ruleId: "crc.intl.family-status",
  sourceId: CCR_SOURCE_IDS.acg2021,
  locator:
    "Family History of CRC — ACG 2021 recommendations stratified by number/degree of affected relatives and age at diagnosis",
  rationale:
    "International family status router. Narrow ACG patterns are automated in dedicated family tracks; incomplete/complex histories abstain.",
});

export const internationalFamilyHighRiskQ5Rule = draftRule(
  {
    ruleId: "crc.intl.family-high-risk.colonoscopy-q5",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.familyHighRisk,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: [CCR_IDS.concepts.familyHistoryRelevant],
    population: { facts: [familyPositive] },
    exclusions: [],
    actions: [colonoscopyScreeningAction],
    outcome: "Due",
    qualifyingEventSpec: {
      modality: CCR_IDS.modalities.colonoscopyScreening,
      resultCodes: [CCR_IDS.results.colonoscopyNormal],
      requireAdequateQuality: true,
      requireComplete: true,
      requireSufficientResolution: true,
    },
    scheduleSpec: { unit: "years", amount: 5 },
    noQualifyingEventBehavior: { neverPerformed: "due" },
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "Automated only for the reviewed ACG patterns: one FDR with CRC/advanced polyp diagnosed before 60, or at least two FDRs with CRC/advanced polyps at any age.",
      "Start at age 40 or 10 years before the youngest affected relative, whichever is earlier.",
      "If the patient is younger than 40 and exact relative age is unavailable, abstain instead of inventing the start age.",
      "A diagnostic post-FIT colonoscopy is not silently converted into the q5 family-history clock in this pilot.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.acg2021,
        locator:
          "Family History of CRC — 1 FDR <60 or >=2 FDRs: colonoscopy starting age 40 or 10 years before youngest affected relative; repeat every 5 years",
      },
    ],
  },
  "ACG 2021 high-risk family-history supplement for the International policy only.",
);

export const internationalFamilyChoice40To44Rule = draftRule(
  {
    ruleId: "crc.intl.family-one-fdr-60-plus.choice.40-44",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.familyChoice,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: [CCR_IDS.concepts.familyHistoryRelevant],
    population: { minAge: 40, maxAge: 44, facts: [familyPositive] },
    exclusions: [],
    actions: [offerScreeningStrategyAction],
    outcome: "Due",
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "This choice gate applies only to the narrow ACG pattern of exactly one FDR with CRC/advanced polyp diagnosed at age 60 or older.",
      "The engine must not choose FIT versus colonoscopy on behalf of the clinician/patient.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.acg2021,
        locator:
          "Family History of CRC — 1 FDR age >=60: begin screening at age 40; any average-risk screening modality may be used",
      },
    ],
  },
  "ACG 2021 one-FDR-age-60-plus bridge for ages 40–44 before the USPSTF population threshold begins.",
);

export const internationalFamilyFit40To44Rule = draftRule(
  {
    ruleId: "crc.intl.family-one-fdr-60-plus.fit.40-44",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.fitStrategy,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: [CCR_IDS.concepts.familyHistoryRelevant],
    population: { minAge: 40, maxAge: 44, facts: [familyPositive] },
    exclusions: [],
    actions: [fitScreeningAction],
    outcome: "Due",
    qualifyingEventSpec: {
      modality: CCR_IDS.modalities.fit,
      resultCodes: [CCR_IDS.results.fitNegative],
      requireAdequateQuality: true,
      requireComplete: false,
      requireSufficientResolution: true,
    },
    scheduleSpec: { unit: "years", amount: 1 },
    noQualifyingEventBehavior: { neverPerformed: "due" },
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "Only for exactly one FDR age >=60; after initiation, use average-risk modalities and intervals.",
      "Human strategy selection remains required.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.acg2021,
        locator:
          "Family History of CRC — 1 FDR age >=60: begin at 40; FIT is an acceptable average-risk modality and remains annual",
      },
    ],
  },
  "ACG 2021 annual FIT option for one-FDR-age-60-plus ages 40–44.",
);

export const internationalFamilyColonoscopy40To44Rule = draftRule(
  {
    ruleId: "crc.intl.family-one-fdr-60-plus.colonoscopy.40-44",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.colonoscopyStrategy,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: [CCR_IDS.concepts.familyHistoryRelevant],
    population: { minAge: 40, maxAge: 44, facts: [familyPositive] },
    exclusions: [],
    actions: [colonoscopyScreeningAction],
    outcome: "Due",
    qualifyingEventSpec: {
      modality: CCR_IDS.modalities.colonoscopyScreening,
      resultCodes: [CCR_IDS.results.colonoscopyNormal],
      requireAdequateQuality: true,
      requireComplete: true,
      requireSufficientResolution: true,
    },
    scheduleSpec: { unit: "years", amount: 10 },
    noQualifyingEventBehavior: { neverPerformed: "due" },
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "Only for exactly one FDR age >=60; after initiation, use average-risk modalities and intervals.",
      "Human strategy selection remains required.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.acg2021,
        locator:
          "Family History of CRC — 1 FDR age >=60: begin at 40; colonoscopy is an acceptable average-risk modality and remains every 10 years after a normal high-quality exam",
      },
    ],
  },
  "ACG 2021 q10 colonoscopy option for one-FDR-age-60-plus ages 40–44.",
);

export const susPhase64FamilyRules = [susFamilyStatusRule];
export const baPhase64FamilyRules = [baFamilyStatusRule];
export const internationalPhase64FamilyRules = [
  internationalFamilyStatusRule,
  internationalFamilyHighRiskQ5Rule,
  internationalFamilyChoice40To44Rule,
  internationalFamilyFit40To44Rule,
  internationalFamilyColonoscopy40To44Rule,
];

export const ccrPhase64FamilyRules = [
  ...susPhase64FamilyRules,
  ...baPhase64FamilyRules,
  ...internationalPhase64FamilyRules,
];
