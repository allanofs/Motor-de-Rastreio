import { RuleDefinitionSchema, type RuleDefinition } from "../../../model/content";
import {
  colonoscopyScreeningAction,
  fitScreeningAction,
  offerScreeningStrategyAction,
} from "../actions";
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

const screeningColonoscopyQualifier = {
  modality: CCR_IDS.modalities.colonoscopyScreening,
  resultCodes: [CCR_IDS.results.colonoscopyNormal],
  requireAdequateQuality: true,
  requireComplete: true,
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

export const baStrategyChoice50To75Rule = draftRule(
  {
    ruleId: "crc.ba-a.strategy-choice.50-75",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.routine,
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
      "FIT is the BA-A default presentation, but the engine must not silently choose between FIT and primary colonoscopy.",
      "If current screening coverage already exists, strategy selection must not trigger redundant screening.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.sboc2026,
        locator: "seção Prevenção e rastreamento, pp. 4-6 — métodos e intervalos de rastreamento",
      },
    ],
  },
  "Phase 6.2 choice gate for BA-A ages 50–75: FIT is default presentation and colonoscopy is an eligible human-selected alternative.",
);

export const baFitStrategyRule = draftRule(
  {
    ruleId: "crc.ba-a.strategy.fit.50-75",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.fitStrategy,
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
      "The human strategy selection controls the next screening action; it does not erase valid colonoscopy coverage.",
      "Only a final valid negative FIT anchors the BA-A FIT interval.",
      "Open FIT-positive follow-up is not implemented in Phase 6.2 and must gate promotion of this rule.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.sboc2026,
        locator: "seção Prevenção e rastreamento, pp. 4-6 — FIT; BA-A reviewed interval fixed at 2 years",
      },
    ],
  },
  "BA-A selected FIT strategy, biennial after a valid negative FIT.",
);

export const baColonoscopyStrategyRule = draftRule(
  {
    ruleId: "crc.ba-a.strategy.colonoscopy.50-75",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.colonoscopyStrategy,
    clinicalRole: "screening",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: routineKnownFacts,
    population: { minAge: 50, maxAge: 75, facts: [screeningContextFact] },
    exclusions: hardExclusions,
    actions: [colonoscopyScreeningAction],
    outcome: "Due",
    qualifyingEventSpec: screeningColonoscopyQualifier,
    scheduleSpec: { unit: "years", amount: 10 },
    noQualifyingEventBehavior: { neverPerformed: "due" },
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "This rule applies only to primary screening colonoscopy, not diagnostic colonoscopy after FIT-positive.",
      "Changing future strategy does not erase current FIT coverage.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.sboc2026,
        locator: "seção Prevenção e rastreamento, pp. 4-6 — colonoscopia como método; intervalo de 10 anos após exame negativo",
      },
    ],
  },
  "BA-A human-selected primary screening colonoscopy strategy every 10 years after a high-quality normal examination.",
);

function internationalFitRule(args: {
  ruleId: string;
  minAge: number;
  maxAge: number;
  grade: "A" | "B";
}): RuleDefinition {
  return draftRule(
    {
      ruleId: args.ruleId,
      topicId: CCR_IDS.topic,
      trackId: CCR_IDS.tracks.fitStrategy,
      clinicalRole: "screening",
      stance: "recommend",
      computability: "computable",
      requiredKnownFacts: routineKnownFacts,
      population: {
        minAge: args.minAge,
        maxAge: args.maxAge,
        facts: [screeningContextFact],
      },
      exclusions: hardExclusions,
      actions: [fitScreeningAction],
      outcome: "Due",
      qualifyingEventSpec: fitQualifier,
      scheduleSpec: { unit: "years", amount: 1 },
      noQualifyingEventBehavior: { neverPerformed: "due" },
      decisionSupport: [],
      supersedes: [],
      excludes: [],
      guardrails: [
        "FIT is one eligible strategy; the human selection controls the next screening action.",
        "Current colonoscopy coverage must suppress redundant FIT even if FIT is selected for a future round.",
      ],
      sourceRefs: [
        {
          sourceId: CCR_SOURCE_IDS.uspstf2021,
          locator: `Clinician Summary / screening intervals — ages ${args.minAge}-${args.maxAge}, annual FIT`,
          evidence: {
            gradingSystem: "USPSTF letter grades",
            recommendationStrength: `Grade ${args.grade}`,
            rawGrade: args.grade,
            gradeVerified: true,
          },
        },
      ],
    },
    `International USPSTF-governed annual FIT strategy for ages ${args.minAge}-${args.maxAge}.`,
  );
}

function internationalColonoscopyRule(args: {
  ruleId: string;
  minAge: number;
  maxAge: number;
  grade: "A" | "B";
}): RuleDefinition {
  return draftRule(
    {
      ruleId: args.ruleId,
      topicId: CCR_IDS.topic,
      trackId: CCR_IDS.tracks.colonoscopyStrategy,
      clinicalRole: "screening",
      stance: "recommend",
      computability: "computable",
      requiredKnownFacts: routineKnownFacts,
      population: {
        minAge: args.minAge,
        maxAge: args.maxAge,
        facts: [screeningContextFact],
      },
      exclusions: hardExclusions,
      actions: [colonoscopyScreeningAction],
      outcome: "Due",
      qualifyingEventSpec: screeningColonoscopyQualifier,
      scheduleSpec: { unit: "years", amount: 10 },
      noQualifyingEventBehavior: { neverPerformed: "due" },
      decisionSupport: [],
      supersedes: [],
      excludes: [],
      guardrails: [
        "This Phase 6.2 rule covers primary screening colonoscopy; diagnostic post-FIT-positive colonoscopy is handled longitudinally later.",
        "Current FIT coverage must suppress redundant primary colonoscopy even if colonoscopy is selected for a future round.",
      ],
      sourceRefs: [
        {
          sourceId: CCR_SOURCE_IDS.uspstf2021,
          locator: `Clinician Summary / screening intervals — ages ${args.minAge}-${args.maxAge}, colonoscopy every 10 years`,
          evidence: {
            gradingSystem: "USPSTF letter grades",
            recommendationStrength: `Grade ${args.grade}`,
            rawGrade: args.grade,
            gradeVerified: true,
          },
        },
        {
          sourceId: CCR_SOURCE_IDS.usmstf2020,
          locator: "normal high-quality colonoscopy — repeat CRC screening in 10 years; higher-risk exceptions excluded",
        },
      ],
    },
    `International USPSTF-governed primary colonoscopy strategy for ages ${args.minAge}-${args.maxAge}.`,
  );
}

export const internationalFit45To49Rule = internationalFitRule({
  ruleId: "crc.intl.strategy.fit.45-49-grade-b",
  minAge: 45,
  maxAge: 49,
  grade: "B",
});

export const internationalFit50To75Rule = internationalFitRule({
  ruleId: "crc.intl.strategy.fit.50-75-grade-a",
  minAge: 50,
  maxAge: 75,
  grade: "A",
});

export const internationalColonoscopy45To49Rule = internationalColonoscopyRule({
  ruleId: "crc.intl.strategy.colonoscopy.45-49-grade-b",
  minAge: 45,
  maxAge: 49,
  grade: "B",
});

export const internationalColonoscopy50To75Rule = internationalColonoscopyRule({
  ruleId: "crc.intl.strategy.colonoscopy.50-75-grade-a",
  minAge: 50,
  maxAge: 75,
  grade: "A",
});

export const brasilAmpliadoStrategyRules = [
  baStrategyChoice50To75Rule,
  baFitStrategyRule,
  baColonoscopyStrategyRule,
];

export const internationalStrategyRules = [
  internationalFit45To49Rule,
  internationalFit50To75Rule,
  internationalColonoscopy45To49Rule,
  internationalColonoscopy50To75Rule,
];

export const ccrPhase62StrategyRules = [
  ...brasilAmpliadoStrategyRules,
  ...internationalStrategyRules,
];
