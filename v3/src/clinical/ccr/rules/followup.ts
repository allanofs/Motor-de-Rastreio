import { RuleDefinitionSchema, type RuleDefinition } from "../../../model/content";
import {
  diagnosticColonoscopyAfterPositiveFitAction,
  offerScreeningStrategyAction,
} from "../actions";
import {
  brazilPostFitClockDecisionSupport,
  inadequateColonoscopyDecisionSupport,
  invalidFitDecisionSupport,
  positiveFitFollowupDecisionSupport,
} from "../decisionSupport";
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

const followupDecisionSupport = [
  positiveFitFollowupDecisionSupport,
  inadequateColonoscopyDecisionSupport,
  invalidFitDecisionSupport,
];

function fitPositiveFollowupRule(args: {
  ruleId: string;
  sourceRefs: Record<string, unknown>[];
  rationale: string;
}): RuleDefinition {
  return draftRule(
    {
      ruleId: args.ruleId,
      topicId: CCR_IDS.topic,
      trackId: CCR_IDS.tracks.fitFollowup,
      clinicalRole: "follow_up",
      stance: "recommend",
      computability: "computable",
      requiredKnownFacts: [],
      population: { facts: [] },
      exclusions: [],
      actions: [diagnosticColonoscopyAfterPositiveFitAction],
      outcome: "InFollowUp",
      decisionSupport: followupDecisionSupport,
      supersedes: [],
      excludes: [],
      guardrails: [
        "A negative FIT never resolves an earlier positive FIT.",
        "Only a diagnostic colonoscopy certainly later than the trigger can resolve the episode automatically.",
        "Incomplete or inadequately prepared colonoscopy does not resolve the positive FIT.",
        "The pilot does not invent a universal deadline after positive FIT or after an inadequate colonoscopy.",
        "Confirmed assumption of care may transition the pathway to HandedOff; referral, order or scheduling alone does not.",
      ],
      sourceRefs: args.sourceRefs,
    },
    args.rationale,
  );
}

export const susFitPositiveFollowupRule = fitPositiveFollowupRule({
  ruleId: "crc.sus.fit-positive.followup",
  sourceRefs: [
    {
      sourceId: CCR_SOURCE_IDS.susOci2026,
      locator:
        "fluxo de rastreamento CCR — FIT como triagem e colonoscopia para avaliação de resultado positivo",
    },
  ],
  rationale:
    "SUS follow-up translation: FIT-positive remains an open diagnostic episode until clinically sufficient resolution or confirmed handoff.",
});

export const baFitPositiveFollowupRule = fitPositiveFollowupRule({
  ruleId: "crc.ba-a.fit-positive.followup",
  sourceRefs: [
    {
      sourceId: CCR_SOURCE_IDS.susOci2026,
      locator:
        "fluxo brasileiro de rastreamento — colonoscopia após FIT positivo",
    },
    {
      sourceId: CCR_SOURCE_IDS.sboc2026,
      locator: "Prevenção e rastreamento — avaliação colonoscópica após teste fecal positivo",
    },
  ],
  rationale:
    "BA-A keeps the Brazilian conservative FIT-positive pathway and does not import foreign timing automatically.",
});

export const internationalFitPositiveFollowupRule = fitPositiveFollowupRule({
  ruleId: "crc.intl.fit-positive.followup",
  sourceRefs: [
    {
      sourceId: CCR_SOURCE_IDS.uspstf2021,
      locator:
        "Recommendation statement — abnormal stool-based screening tests require follow-up colonoscopy",
    },
    {
      sourceId: CCR_SOURCE_IDS.usmstfFit2017,
      locator:
        "Recommendation/summary — when screening FIT is positive, colonoscopy is the recommended subsequent evaluation",
    },
  ],
  rationale:
    "International FIT-positive follow-up using USPSTF population governance and USMSTF FIT-specific follow-up.",
});

function brazilPostFitRouterRule(args: {
  ruleId: string;
  sourceId: string;
  rationale: string;
}): RuleDefinition {
  return draftRule(
    {
      ruleId: args.ruleId,
      topicId: CCR_IDS.topic,
      trackId: CCR_IDS.tracks.postFitRoutine,
      clinicalRole: "technical",
      stance: "recommend",
      computability: "computable",
      requiredKnownFacts: [],
      population: { facts: [] },
      exclusions: [],
      actions: [],
      outcome: "InFollowUp",
      decisionSupport: [brazilPostFitClockDecisionSupport],
      supersedes: [],
      excludes: [],
      guardrails: [
        "This routing rule must be evaluated with the Phase 6.3 post-FIT resolver.",
        "Resolution of a FIT-positive diagnostic episode is separate from defining the next Brazilian routine screening clock.",
      ],
      sourceRefs: [
        {
          sourceId: args.sourceId,
          locator:
            "current Brazilian operational core supports FIT-positive diagnostic colonoscopy; next routine clock after a normal diagnostic colonoscopy remains intentionally unautomated in this pilot",
        },
      ],
    },
    args.rationale,
  );
}

export const susPostFitRoutineRouterRule = brazilPostFitRouterRule({
  ruleId: "crc.sus.post-fit-normal.route",
  sourceId: CCR_SOURCE_IDS.susOci2026,
  rationale:
    "Detect a resolved SUS FIT-positive episode while abstaining from inventing the next routine interval.",
});

export const baPostFitRoutineRouterRule = brazilPostFitRouterRule({
  ruleId: "crc.ba-a.post-fit-normal.route",
  sourceId: CCR_SOURCE_IDS.sboc2026,
  rationale:
    "Detect a resolved BA-A FIT-positive episode while retaining conservative review for the next routine clock.",
});

export const internationalPostFitNormalQ10Rule = draftRule(
  {
    ruleId: "crc.intl.post-fit-normal.q10",
    topicId: CCR_IDS.topic,
    trackId: CCR_IDS.tracks.postFitRoutine,
    clinicalRole: "follow_up",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: [],
    population: { facts: [] },
    exclusions: [],
    actions: [offerScreeningStrategyAction],
    outcome: "Due",
    qualifyingEventSpec: {
      modality: CCR_IDS.modalities.colonoscopyDiagnostic,
      resultCodes: [CCR_IDS.results.colonoscopyNormal],
      requireAdequateQuality: true,
      requireComplete: true,
      requireSufficientResolution: true,
    },
    scheduleSpec: { unit: "years", amount: 10 },
    noQualifyingEventBehavior: { neverPerformed: "indeterminate" },
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "The q10 clock applies only when the diagnostic colonoscopy is a high-quality normal examination in the post-FIT-positive pathway and no later positive FIT remains open.",
      "At the end of the 10-year interval the engine identifies a new screening round; the human still chooses the eligible strategy.",
      "Open FIT-positive follow-up remains actionable regardless of age even when population screening would otherwise stop.",
    ],
    sourceRefs: [
      {
        sourceId: CCR_SOURCE_IDS.usmstfColonoscopy2020,
        locator:
          "normal high-quality colonoscopy — repeat CRC screening in 10 years regardless of indication, except higher-risk populations",
      },
    ],
  },
  "International post-FIT-positive high-quality normal colonoscopy establishes a 10-year screening interval when average-risk conditions remain applicable.",
);

export const susPhase63FollowupRules = [
  susFitPositiveFollowupRule,
  susPostFitRoutineRouterRule,
];

export const baPhase63FollowupRules = [
  baFitPositiveFollowupRule,
  baPostFitRoutineRouterRule,
];

export const internationalPhase63FollowupRules = [
  internationalFitPositiveFollowupRule,
  internationalPostFitNormalQ10Rule,
];

export const ccrPhase63FollowupRules = [
  ...susPhase63FollowupRules,
  ...baPhase63FollowupRules,
  ...internationalPhase63FollowupRules,
];
