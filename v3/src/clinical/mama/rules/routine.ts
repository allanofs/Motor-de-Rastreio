import type { RuleDefinition } from "../../../model/content";
import {
  breastInsufficientEvidenceAction,
  breastSharedDecisionAction,
  mammographyScreeningAction,
} from "../actions";
import { MAMA_HARD_EXIT_CONCEPTS } from "../domain";
import { MAMA_PROPOSITION_IDS } from "../evidence";
import { mamaDraftRule, sourceRefsFor } from "../ruleSupport";
import { MAMA_IDS } from "../terminology";

const contextFacts = [
  { conceptId: MAMA_IDS.concepts.screeningContextConfirmed, presence: "yes" as const },
  { conceptId: MAMA_IDS.concepts.relevantBreastTissuePresent, presence: "yes" as const },
];

const hardExclusions = MAMA_HARD_EXIT_CONCEPTS.map((conceptId) => ({
  facts: [{ conceptId, presence: "yes" as const }],
}));

const hardExitKnownFacts = [...MAMA_HARD_EXIT_CONCEPTS];

const routineRequiredKnownFacts = [
  MAMA_IDS.concepts.screeningContextConfirmed,
  MAMA_IDS.concepts.relevantBreastTissuePresent,
  MAMA_IDS.concepts.historySufficientForCurrentStatus,
  ...hardExitKnownFacts,
];

const populationRequiredKnownFacts = [
  MAMA_IDS.concepts.screeningContextConfirmed,
  MAMA_IDS.concepts.relevantBreastTissuePresent,
  ...hardExitKnownFacts,
];

const mammographyQualifier = {
  modality: MAMA_IDS.modalities.mammographyScreening,
  resultCodes: [MAMA_IDS.results.routineClearing],
  requireAdequateQuality: true,
  requireComplete: true,
  requireSufficientResolution: true,
};

function routineRule(args: {
  ruleId: string;
  minAge: number;
  maxAge: number;
  intervalYears: number;
  propositionId:
    | typeof MAMA_PROPOSITION_IDS.susRoutine5074Biennial
    | typeof MAMA_PROPOSITION_IDS.brazilAnnual4074
    | typeof MAMA_PROPOSITION_IDS.uspstfRoutine4074Biennial;
  rationale: string;
}): RuleDefinition {
  return mamaDraftRule(
    {
      ruleId: args.ruleId,
      topicId: MAMA_IDS.topic,
      trackId: MAMA_IDS.tracks.routine,
      clinicalRole: "screening",
      stance: "recommend",
      computability: "computable",
      requiredKnownFacts: routineRequiredKnownFacts,
      population: {
        minAge: args.minAge,
        maxAge: args.maxAge,
        facts: contextFacts,
      },
      exclusions: hardExclusions,
      actions: [mammographyScreeningAction],
      outcome: "Due",
      qualifyingEventSpec: mammographyQualifier,
      scheduleSpec: { unit: "years", amount: args.intervalYears },
      noQualifyingEventBehavior: { neverPerformed: "due" },
      decisionSupport: [],
      supersedes: [],
      excludes: [],
      guardrails: [
        "Only an explicitly classified routine-clearing screening mammogram may anchor the routine interval.",
        "Diagnostic mammography, attention-required findings and indeterminate results never silently restart the routine clock.",
        "This rule is draft/source_verified and must not be activated before clinical R1/R2 review.",
      ],
      sourceRefs: sourceRefsFor(args.propositionId),
    },
    args.rationale,
  );
}

function sharedDecisionAgeRule(args: {
  ruleId: string;
  minAge: number;
  maxAge?: number;
  propositionId:
    | typeof MAMA_PROPOSITION_IDS.susOnDemandOutsideCore
    | typeof MAMA_PROPOSITION_IDS.brazil75Individualized;
  rationale: string;
}): RuleDefinition {
  return mamaDraftRule(
    {
      ruleId: args.ruleId,
      topicId: MAMA_IDS.topic,
      trackId: MAMA_IDS.tracks.population,
      clinicalRole: "screening",
      stance: "shared_decision",
      computability: "computable",
      requiredKnownFacts: populationRequiredKnownFacts,
      population: {
        minAge: args.minAge,
        ...(args.maxAge === undefined ? {} : { maxAge: args.maxAge }),
        facts: contextFacts,
      },
      exclusions: hardExclusions,
      actions: [breastSharedDecisionAction],
      outcome: "SharedDecision",
      decisionSupport: [],
      supersedes: [],
      excludes: [],
      guardrails: [
        "The computable output is the need for an individualized/shared decision, not the final clinical choice.",
        "Do not convert this individualized band into automatic routine Due.",
        "An already-open specific breast-care pathway remains outside this population rule.",
      ],
      sourceRefs: sourceRefsFor(args.propositionId),
    },
    args.rationale,
  );
}

export const susSharedDecision40To49Rule = sharedDecisionAgeRule({
  ruleId: "breast.sus.population.40-49-shared-decision",
  minAge: 40,
  maxAge: 49,
  propositionId: MAMA_PROPOSITION_IDS.susOnDemandOutsideCore,
  rationale:
    "M3 translation of SUS on-demand access outside the population core: ages 40–49 remain individualized rather than automatic population Due.",
});

export const susRoutine50To74Rule = routineRule({
  ruleId: "breast.sus.routine.mammography.50-74-biennial",
  minAge: 50,
  maxAge: 74,
  intervalYears: 2,
  propositionId: MAMA_PROPOSITION_IDS.susRoutine5074Biennial,
  rationale:
    "M3 translation of the current SUS 50–74 biennial population mammography recommendation.",
});

export const susSharedDecision75PlusRule = sharedDecisionAgeRule({
  ruleId: "breast.sus.population.75-plus-shared-decision",
  minAge: 75,
  propositionId: MAMA_PROPOSITION_IDS.susOnDemandOutsideCore,
  rationale:
    "M3 translation of SUS access above age 74 as individualized/on-demand rather than automatic population Due.",
});

export const brasilAmpliadoRoutine40To74Rule = routineRule({
  ruleId: "breast.ba.routine.mammography.40-74-annual",
  minAge: 40,
  maxAge: 74,
  intervalYears: 1,
  propositionId: MAMA_PROPOSITION_IDS.brazilAnnual4074,
  rationale:
    "M3 translation of the CBR/SBM/FEBRASGO annual mammography recommendation for ages 40–74 in the V1 mammography core.",
});

export const brasilAmpliadoSharedDecision75PlusRule = sharedDecisionAgeRule({
  ruleId: "breast.ba.population.75-plus-shared-decision",
  minAge: 75,
  propositionId: MAMA_PROPOSITION_IDS.brazil75Individualized,
  rationale:
    "M3 preserves 75+ as individualized because V1 has no governed life-expectancy computation.",
});

export const internationalRoutine40To74Rule = routineRule({
  ruleId: "breast.intl.routine.mammography.40-74-biennial",
  minAge: 40,
  maxAge: 74,
  intervalYears: 2,
  propositionId: MAMA_PROPOSITION_IDS.uspstfRoutine4074Biennial,
  rationale:
    "M3 translation of USPSTF 2024 Grade B biennial mammography for ages 40–74.",
});

export const internationalInsufficientEvidence75PlusRule = mamaDraftRule(
  {
    ruleId: "breast.intl.population.75-plus-insufficient-evidence",
    topicId: MAMA_IDS.topic,
    trackId: MAMA_IDS.tracks.population,
    clinicalRole: "screening",
    stance: "insufficient_evidence",
    computability: "clinician_judgment_required",
    requiredKnownFacts: populationRequiredKnownFacts,
    population: { minAge: 75, facts: contextFacts },
    exclusions: hardExclusions,
    actions: [breastInsufficientEvidenceAction],
    outcome: "ClinicalReviewRequired",
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "Preserve the USPSTF I statement; do not relabel this as a positive recommendation or automatic SharedDecision recommendation.",
      "Do not emit a routine mammography recommendation action from this rule.",
    ],
    sourceRefs: sourceRefsFor(MAMA_PROPOSITION_IDS.uspstf75InsufficientEvidence),
  },
  "M3 preserves the USPSTF 75+ I statement as clinical review/abstention rather than inventing a recommendation.",
);

export const susM3RoutineRules = [
  susSharedDecision40To49Rule,
  susRoutine50To74Rule,
  susSharedDecision75PlusRule,
];

export const brasilAmpliadoM3RoutineRules = [
  brasilAmpliadoRoutine40To74Rule,
  brasilAmpliadoSharedDecision75PlusRule,
];

export const internationalM3RoutineRules = [
  internationalRoutine40To74Rule,
  internationalInsufficientEvidence75PlusRule,
];
