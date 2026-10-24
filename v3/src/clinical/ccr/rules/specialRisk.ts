import { RuleDefinitionSchema, type RuleDefinition } from "../../../model/content";
import { clinicalReviewAction } from "../actions";
import { CCR_SOURCE_IDS } from "../sources";
import { CCR_IDS } from "../terminology";

const SPECIAL_RISK_CONCEPTS = [
  {
    suffix: "prior-crc",
    conceptId: CCR_IDS.concepts.priorCrc,
    rationale: "Prior colorectal cancer exits average-risk screening and requires individualized/specialized follow-up.",
  },
  {
    suffix: "prior-polyp-surveillance",
    conceptId: CCR_IDS.concepts.priorPolypSurveillance,
    rationale: "Prior relevant polyp/adenoma requiring surveillance exits the average-risk screening pilot.",
  },
  {
    suffix: "colonic-ibd",
    conceptId: CCR_IDS.concepts.colonicIbd,
    rationale: "Relevant colonic inflammatory bowel disease exits average-risk screening and requires a specialized pathway.",
  },
  {
    suffix: "hereditary-syndrome",
    conceptId: CCR_IDS.concepts.hereditarySyndrome,
    rationale: "Known or suspected hereditary colorectal cancer/polyposis syndrome exits the average-risk pilot.",
  },
] as const;

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

function buildPolicyRules(args: {
  prefix: "sus" | "ba-a" | "intl";
  sourceId: string;
  locator: string;
}): RuleDefinition[] {
  return SPECIAL_RISK_CONCEPTS.map((item) =>
    draftRule(
      {
        ruleId: `crc.${args.prefix}.special-risk.${item.suffix}`,
        topicId: CCR_IDS.topic,
        trackId: CCR_IDS.tracks.specialRisk,
        clinicalRole: "screening",
        stance: "recommend",
        computability: "clinician_judgment_required",
        requiredKnownFacts: [item.conceptId],
        population: {
          facts: [{ conceptId: item.conceptId, presence: "yes" }],
        },
        exclusions: [],
        actions: [clinicalReviewAction],
        outcome: "ClinicalReviewRequired",
        decisionSupport: [],
        supersedes: [],
        excludes: [],
        guardrails: [
          "This track prevents a hard exclusion from being represented as simple NotApplicable only.",
          "Do not automatically return the patient to average-risk routine screening.",
          "Diagnosis/risk status alone does not prove HandedOff; confirmed assumption of care remains a separate fact.",
        ],
        sourceRefs: [{ sourceId: args.sourceId, locator: args.locator }],
      },
      item.rationale,
    ),
  );
}

export const susPhase65SpecialRiskRules = buildPolicyRules({
  prefix: "sus",
  sourceId: CCR_SOURCE_IDS.susOci2026,
  locator:
    "escopo do rastreamento populacional e necessidade de encaminhar condições fora da rotina average-risk para avaliação clínica/especializada",
});

export const baPhase65SpecialRiskRules = buildPolicyRules({
  prefix: "ba-a",
  sourceId: CCR_SOURCE_IDS.sboc2026,
  locator:
    "Prevenção e rastreamento — população de risco habitual versus condições que exigem avaliação/surveillance específica",
});

export const internationalPhase65SpecialRiskRules = buildPolicyRules({
  prefix: "intl",
  sourceId: CCR_SOURCE_IDS.uspstf2021,
  locator:
    "Patient Population Under Consideration — average-risk recommendation excludes prior CRC/adenomatous polyps, IBD and known genetic syndromes",
});

export const ccrPhase65SpecialRiskRules = [
  ...susPhase65SpecialRiskRules,
  ...baPhase65SpecialRiskRules,
  ...internationalPhase65SpecialRiskRules,
];
