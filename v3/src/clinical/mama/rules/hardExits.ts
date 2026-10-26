import type { RuleDefinition, SourceRef } from "../../../model/content";
import {
  breastSpecificAttentionAction,
  breastSpecificCareActiveAction,
} from "../actions";
import { MAMA_PROPOSITION_IDS } from "../evidence";
import { mamaDraftRule, sourceRefsFor } from "../ruleSupport";
import { MAMA_IDS } from "../terminology";

function mergeRefs(...groups: SourceRef[][]): SourceRef[] {
  const byKey = new Map<string, SourceRef>();
  for (const group of groups) {
    for (const ref of group) byKey.set(`${ref.sourceId}::${ref.locator}`, ref);
  }
  return [...byKey.values()];
}

const crossPolicySpecialRiskRefs = mergeRefs(
  sourceRefsFor(MAMA_PROPOSITION_IDS.susHighRiskIndividualized),
  sourceRefsFor(MAMA_PROPOSITION_IDS.brazilSpecialRiskOutsideRoutine),
  sourceRefsFor(MAMA_PROPOSITION_IDS.uspstfPopulationScope),
);

function specificAttentionRule(args: {
  ruleId: string;
  conceptId: string;
  trackId?: string;
  sourceRefs: SourceRef[];
  rationale: string;
  guardrails?: string[];
}): RuleDefinition {
  return mamaDraftRule(
    {
      ruleId: args.ruleId,
      topicId: MAMA_IDS.topic,
      trackId: args.trackId ?? MAMA_IDS.tracks.specialRisk,
      clinicalRole: "screening",
      stance: "no_formal_recommendation",
      computability: "computable",
      requiredKnownFacts: [args.conceptId],
      population: {
        facts: [{ conceptId: args.conceptId, presence: "yes" as const }],
      },
      exclusions: [],
      actions: [breastSpecificAttentionAction],
      outcome: "ClinicalReviewRequired",
      decisionSupport: [],
      supersedes: [],
      excludes: [],
      guardrails: [
        "This rule stops routine-screening automation; it does not prescribe diagnostic imaging, biopsy, genetics or treatment.",
        ...(args.guardrails ?? []),
      ],
      sourceRefs: args.sourceRefs,
    },
    args.rationale,
  );
}

export const suspiciousSymptomsRule = specificAttentionRule({
  ruleId: "breast.common.hard-exit.suspicious-symptoms",
  conceptId: MAMA_IDS.concepts.suspiciousBreastSymptoms,
  sourceRefs: mergeRefs(
    sourceRefsFor(MAMA_PROPOSITION_IDS.susSymptomsAreDiagnostic),
    sourceRefsFor(MAMA_PROPOSITION_IDS.uspstfPopulationScope),
  ),
  rationale:
    "M3 safety translation: suspicious symptoms are outside routine screening automation and require specific assessment.",
  guardrails: [
    "The Brazilian expanded-policy symptom boundary remains a product/domain safety boundary; M3 does not claim this rule implements a complete diagnostic guideline.",
  ],
});

export const priorBreastCancerRule = specificAttentionRule({
  ruleId: "breast.common.hard-exit.prior-breast-cancer",
  conceptId: MAMA_IDS.concepts.priorBreastCancer,
  sourceRefs: crossPolicySpecialRiskRefs,
  rationale:
    "M3 translation: prior breast cancer is outside average-risk routine screening and requires a specific surveillance/care pathway.",
});

export const highRiskGeneticContextRule = specificAttentionRule({
  ruleId: "breast.common.hard-exit.high-risk-genetic-context",
  conceptId: MAMA_IDS.concepts.highRiskGeneticContext,
  sourceRefs: crossPolicySpecialRiskRefs,
  rationale:
    "M3 translation: known high-risk genetic context exits the average-risk routine pathway without automating genetics or MRI protocols.",
});

export const knownHighRiskFamilialContextRule = specificAttentionRule({
  ruleId: "breast.common.hard-exit.known-high-risk-familial-context",
  conceptId: MAMA_IDS.concepts.knownHighRiskFamilialContext,
  sourceRefs: mergeRefs(
    sourceRefsFor(MAMA_PROPOSITION_IDS.brazilSpecialRiskOutsideRoutine),
    sourceRefsFor(MAMA_PROPOSITION_IDS.uspstfPopulationScope),
  ),
  rationale:
    "M3 implements approved gap M2-01: only already-established high familial risk exits routine; the Motor does not calculate Gail/Tyrer-Cuzick/BOADICEA risk in V1.",
  guardrails: [
    "Do not set this concept merely because any first-degree family history is present; USPSTF includes common first-degree family history within its routine recommendation scope.",
  ],
});

export const priorHighRiskChestRadiationRule = specificAttentionRule({
  ruleId: "breast.common.hard-exit.high-risk-chest-radiation",
  conceptId: MAMA_IDS.concepts.priorHighRiskChestRadiation,
  sourceRefs: crossPolicySpecialRiskRefs,
  rationale:
    "M3 translation: high-risk prior chest radiation exits average-risk routine screening.",
});

export const priorHighRiskBreastLesionRule = specificAttentionRule({
  ruleId: "breast.common.hard-exit.prior-high-risk-lesion",
  conceptId: MAMA_IDS.concepts.priorHighRiskBreastLesion,
  sourceRefs: crossPolicySpecialRiskRefs,
  rationale:
    "M3 translation: a prior high-risk breast lesion requires a specific pathway outside the V1 routine-screening module.",
});

export const priorMammographyAttentionRule = specificAttentionRule({
  ruleId: "breast.common.hard-exit.prior-mammography-attention-required",
  conceptId: MAMA_IDS.concepts.priorMammographyNeedsSpecificAttention,
  trackId: MAMA_IDS.tracks.priorFinding,
  sourceRefs: sourceRefsFor(MAMA_PROPOSITION_IDS.abnormalScreenNeedsFollowup),
  rationale:
    "M3 translation: a prior screening finding that has not been explicitly cleared for routine return blocks a new routine screening clock.",
  guardrails: [
    "M3 consumes only the explicit attention-required abstraction; it does not infer this state from raw BI-RADS categories.",
  ],
});

export const specificBreastCareActiveRule = mamaDraftRule(
  {
    ruleId: "breast.common.specific-care.active",
    topicId: MAMA_IDS.topic,
    trackId: MAMA_IDS.tracks.specificCare,
    clinicalRole: "follow_up",
    stance: "no_formal_recommendation",
    computability: "computable",
    requiredKnownFacts: [MAMA_IDS.concepts.specificBreastCareActive],
    population: {
      facts: [
        {
          conceptId: MAMA_IDS.concepts.specificBreastCareActive,
          presence: "yes",
        },
      ],
    },
    exclusions: [],
    actions: [breastSpecificCareActiveAction],
    outcome: "InFollowUp",
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [
      "Active specific breast care prevents silent restart of routine screening.",
      "This state does not encode the specialist management plan.",
    ],
    sourceRefs: sourceRefsFor(MAMA_PROPOSITION_IDS.abnormalScreenNeedsFollowup),
  },
  "M3 representational rule: active breast-specific care remains outside routine-screening automation.",
);

export const mamaM3HardExitRules = [
  suspiciousSymptomsRule,
  priorBreastCancerRule,
  highRiskGeneticContextRule,
  knownHighRiskFamilialContextRule,
  priorHighRiskChestRadiationRule,
  priorHighRiskBreastLesionRule,
  priorMammographyAttentionRule,
  specificBreastCareActiveRule,
];
