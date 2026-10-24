import { RuleDefinitionSchema, type RuleDefinition } from "../../../model/content";
import {
  clinicalReviewAction,
  fitScreeningAction,
  offerScreeningStrategyAction,
  outsideRoutineInfoAction,
  avoidRoutineAfter85Action,
  sharedDecisionAction,
} from "../actions";
import {
  ba45To49DecisionSupport,
  baOver75DecisionSupport,
  uspstf76To85DecisionSupport,
} from "../decisionSupport";
import { CCR_SOURCE_IDS } from "../sources";
import { CCR_IDS } from "../terminology";

const hardExclusionConcepts = [
  CCR_IDS.concepts.priorCrc,
  CCR_IDS.concepts.priorPolypSurveillance,
  CCR_IDS.concepts.colonicIbd,
  CCR_IDS.concepts.hereditarySyndrome,
];

const screeningContextFact = {
  conceptId: CCR_IDS.concepts.screeningContextConfirmed,
  presence: "yes" as const,
};

const hardExclusions = hardExclusionConcepts.map((conceptId) => ({
  facts: [{ conceptId, presence: "yes" as const }],
}));

const routineKnownFacts = [
  CCR_IDS.concepts.screeningContextConfirmed,
  ...hardExclusionConcepts,
];

const fitQualifier = {
  modality: CCR_IDS.modalities.fit,
  resultCodes: [CCR_IDS.results.fitNegative],
  requireAdequateQuality: true,
  requireComplete: false,
  requireSufficientResolution: true,
};

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

function outsideAgeRule(args: {
  ruleId: string;
  trackId: string;
  minAge?: number;
  maxAge?: number;
  sourceId: string;
  locator: string;
  rationale: string;
}): RuleDefinition {
  return draftRule(
    {
      ruleId: args.ruleId,
      topicId: CCR_IDS.topic,
      trackId: args.trackId,
      clinicalRole: "screening",
      stance: "no_formal_recommendation",
      computability: "computable",
      requiredKnownFacts: [CCR_IDS.concepts.screeningContextConfirmed],
      population: {
        ...(args.minAge === undefined ? {} : { minAge: args.minAge }),
        ...(args.maxAge === undefined ? {} : { maxAge: args.maxAge }),
        facts: [screeningContextFact],
      },
      exclusions: [],
      actions: [outsideRoutineInfoAction],
      outcome: "NotApplicable",
      decisionSupport: [],
      supersedes: [],
      excludes: [],
      guardrails: [
        "This age-bound routine rule does not close or erase an already-open diagnostic follow-up pathway.",
      ],
      sourceRefs: [{ sourceId: args.sourceId, locator: args.locator }],
    },
    args.rationale,
  );
}

export const susBelow50Rule = outsideAgeRule({
  ruleId: "crc.sus.routine.under-50",
  trackId: CCR_IDS.tracks.routine,
  maxAge: 49,
  sourceId: CCR_SOURCE_IDS.susOci2026,
  locator: "pp. 17-18 — faixa populacional de rastreamento CCR 50–75 anos",
  rationale: "Phase 6.1 translation of the reviewed SUS lower age boundary.",
});

export const susFit50To75Rule = draftRule(
  {
    ruleId: "crc.sus.routine.fit.50-75",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.routine,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: routineKnownFacts,
    population: { minAge: 50, maxAge: 75, facts: [screeningContextFact] },
    exclusions: hardExclusions,
    actions: [fitScreeningAction],
    outcome: "Due",
    qualifyingEventSpec: fitQualifier,
    scheduleSpec: { unit: "years", amount: 2 },
    noQualifyingEventBehavior: { neverPerformed: "due" },
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "Only a final valid negative FIT may anchor the routine interval.",
      "Do not promote this draft before family-history and open-FIT-positive gates are composed and reviewed.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.susOci2026,
        locator: "pp. 17-18 — FIT bienal em pessoas de 50–75 anos",
      },
    ],
  },
  "Phase 6.1 translation of the reviewed SUS 50–75 biennial FIT routine. Kept draft until code-level clinical review.",
);

export const susOver75Rule = outsideAgeRule({
  ruleId: "crc.sus.routine.76-plus",
  trackId: CCR_IDS.tracks.routine,
  minAge: 76,
  sourceId: CCR_SOURCE_IDS.susOci2026,
  locator: "pp. 17-18 — faixa populacional de rastreamento CCR 50–75 anos",
  rationale: "Phase 6.1 translation of the reviewed SUS upper age boundary; open follow-up remains separate.",
});

export const baBelow45Rule = outsideAgeRule({
  ruleId: "crc.ba-a.routine.under-45",
  trackId: CCR_IDS.tracks.routine,
  maxAge: 44,
  sourceId: CCR_SOURCE_IDS.sboc2026,
  locator: "seção Prevenção e rastreamento, pp. 4-6",
  rationale: "Phase 6.1 translation of the reviewed BA-A lower boundary.",
});

export const ba45To49Rule = draftRule(
  {
    ruleId: "crc.ba-a.routine.45-49-shared-decision",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.routine,
    clinicalRole: "screening",
    stance: "shared_decision",
    computability: "computable",
    requiredKnownFacts: routineKnownFacts,
    population: { minAge: 45, maxAge: 49, facts: [screeningContextFact] },
    exclusions: hardExclusions,
    actions: [sharedDecisionAction],
    outcome: "SharedDecision",
    decisionSupport: [ba45To49DecisionSupport],
    supersedes: [],
    excludes: [],
    guardrails: ["Do not convert BA-A ages 45–49 into automatic routine Due."],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.sboc2026,
        locator: "seção Prevenção e rastreamento, pp. 4-6",
      },
    ],
  },
  "BA-A deliberately models ages 45–49 as shared decision/review rather than automatic routine screening.",
);

export const baFit50To75Rule = draftRule(
  {
    ruleId: "crc.ba-a.routine.fit.50-75",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.routine,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: routineKnownFacts,
    population: { minAge: 50, maxAge: 75, facts: [screeningContextFact] },
    exclusions: hardExclusions,
    actions: [fitScreeningAction],
    outcome: "Due",
    qualifyingEventSpec: fitQualifier,
    scheduleSpec: { unit: "years", amount: 2 },
    noQualifyingEventBehavior: { neverPerformed: "due" },
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "BA-A fixes the default FIT interval at 2 years as a reviewed curatorial choice within the Brazilian source range.",
      "Do not promote this draft before alternative colonoscopy strategy, family-history and open-FIT-positive gates are composed and reviewed.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.sboc2026,
        locator: "seção Prevenção e rastreamento, pp. 4-6 — métodos e intervalos de rastreamento",
      },
    ],
  },
  "Phase 6.1 translation of the reviewed conservative BA-A default: biennial FIT for ages 50–75.",
);

export const baOver75Rule = draftRule(
  {
    ruleId: "crc.ba-a.routine.76-plus-review",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.routine,
    clinicalRole: "screening",
    stance: "shared_decision",
    computability: "clinician_judgment_required",
    requiredKnownFacts: [CCR_IDS.concepts.screeningContextConfirmed],
    population: { minAge: 76, facts: [screeningContextFact] },
    exclusions: [],
    actions: [clinicalReviewAction],
    outcome: "ClinicalReviewRequired",
    decisionSupport: [baOver75DecisionSupport],
    supersedes: [],
    excludes: [],
    guardrails: ["Do not automatically extend BA-A routine screening beyond age 75."],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.sboc2026,
        locator: "seção Prevenção e rastreamento, pp. 4-6; curadoria BA-A pós-revisão",
      },
    ],
  },
  "Reviewed BA-A policy requires individualized review beyond 75 rather than automatic extension.",
);

export const internationalBelow45Rule = outsideAgeRule({
  ruleId: "crc.intl.population.under-45",
  trackId: CCR_IDS.tracks.population,
  maxAge: 44,
  sourceId: CCR_SOURCE_IDS.uspstf2021,
  locator: "Clinician Summary / Starting and Stopping Ages — screening recommendation begins at 45 years",
  rationale: "Phase 6.1 translation of the USPSTF lower population boundary.",
});

export const international45To49Rule = draftRule(
  {
    ruleId: "crc.intl.population.45-49-grade-b",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.population,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: routineKnownFacts,
    population: { minAge: 45, maxAge: 49, facts: [screeningContextFact] },
    exclusions: hardExclusions,
    actions: [offerScreeningStrategyAction],
    outcome: "Due",
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "Phase 6.1 population-governor draft: do not promote before strategy selection and current-coverage composition are implemented in Phase 6.2.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.uspstf2021,
        locator: "Clinician Summary — adults 45–49 years",
        evidence: {
          gradingSystem: "USPSTF letter grades",
          recommendationStrength: "Grade B",
          rawGrade: "B",
          gradeVerified: true,
        },
      },
    ],
  },
  "USPSTF population governor for ages 45–49; strategy/history composition is intentionally deferred to Phase 6.2.",
);

export const international50To75Rule = draftRule(
  {
    ruleId: "crc.intl.population.50-75-grade-a",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.population,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: routineKnownFacts,
    population: { minAge: 50, maxAge: 75, facts: [screeningContextFact] },
    exclusions: hardExclusions,
    actions: [offerScreeningStrategyAction],
    outcome: "Due",
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "Phase 6.1 population-governor draft: do not promote before strategy selection and current-coverage composition are implemented in Phase 6.2.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.uspstf2021,
        locator: "Clinician Summary — adults 50–75 years",
        evidence: {
          gradingSystem: "USPSTF letter grades",
          recommendationStrength: "Grade A",
          rawGrade: "A",
          gradeVerified: true,
        },
      },
    ],
  },
  "USPSTF population governor for ages 50–75; strategy/history composition is intentionally deferred to Phase 6.2.",
);

export const international76To85Rule = draftRule(
  {
    ruleId: "crc.intl.population.76-85-grade-c",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.population,
    clinicalRole: "screening",
    stance: "shared_decision",
    computability: "computable",
    requiredKnownFacts: routineKnownFacts,
    population: { minAge: 76, maxAge: 85, facts: [screeningContextFact] },
    exclusions: hardExclusions,
    actions: [sharedDecisionAction],
    outcome: "SharedDecision",
    decisionSupport: [uspstf76To85DecisionSupport],
    supersedes: [],
    excludes: [],
    guardrails: ["Never convert ages 76–85 into automatic Due solely because screening history is absent."],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.uspstf2021,
        locator: "Clinician Summary — selectively screen adults 76–85 years",
        evidence: {
          gradingSystem: "USPSTF letter grades",
          recommendationStrength: "Grade C",
          rawGrade: "C",
          gradeVerified: true,
        },
      },
    ],
  },
  "USPSTF Grade C is represented as a computable need for shared decision, not an automatic screening order.",
);

export const internationalOver85Rule = draftRule(
  {
    ruleId: "crc.intl.population.86-plus",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.population,
    clinicalRole: "screening",
    stance: "recommend_against",
    computability: "computable",
    requiredKnownFacts: [CCR_IDS.concepts.screeningContextConfirmed],
    population: { minAge: 86, facts: [screeningContextFact] },
    exclusions: [],
    actions: [avoidRoutineAfter85Action],
    outcome: "NotApplicable",
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "USPSTF does not assign a Grade D here; do not invent one.",
      "This routine rule never cancels investigation of an already-open abnormal screening test.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.uspstf2021,
        locator: "Starting and Stopping Ages — screening should be discontinued after age 85",
      },
    ],
  },
  "USPSTF stopping-age text is represented without inventing a letter grade.",
);

export const susRoutineRules = [susBelow50Rule, susFit50To75Rule, susOver75Rule];
export const brasilAmpliadoRoutineRules = [
  baBelow45Rule,
  ba45To49Rule,
  baFit50To75Rule,
  baOver75Rule,
];
export const internationalPopulationRules = [
  internationalBelow45Rule,
  international45To49Rule,
  international50To75Rule,
  international76To85Rule,
  internationalOver85Rule,
];

export const ccrPhase61Rules = [
  ...susRoutineRules,
  ...brasilAmpliadoRoutineRules,
  ...internationalPopulationRules,
];
