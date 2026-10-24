import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
  type SourceRef,
} from "../../model/content";
import {
  ccrPhase6R1Resolvers,
  ccrPhase6R1Ruleset,
} from "./reviewedCandidate";
import {
  CCR_R2_SOURCE_IDS,
  ccrR2PreparedSources,
} from "./r2Sources";

export const CCR_R2_PREP_RULESET_VERSION =
  "crc-0.5.2-phase6-r2-prep-draft" as const;

/**
 * These rules changed after the recorded R1 review. They are deliberately
 * reset to source_verified until the human R1 reviewer explicitly reconfirms
 * the corrected evidence metadata/source provenance.
 */
export const CCR_R2_PREP_R1_RECONFIRM_RULE_IDS = [
  "crc.sus.routine.under-50",
  "crc.sus.routine.fit.50-75",
  "crc.sus.routine.76-plus",
  "crc.sus.fit-positive.followup",
  "crc.sus.post-fit-normal.route",
  "crc.sus.family-status",
  "crc.sus.special-risk.prior-crc",
  "crc.sus.special-risk.prior-polyp-surveillance",
  "crc.sus.special-risk.colonic-ibd",
  "crc.sus.special-risk.hereditary-syndrome",
  "crc.ba-a.fit-positive.followup",
  "crc.intl.strategy.fit.45-49-grade-b",
  "crc.intl.strategy.fit.50-75-grade-a",
  "crc.intl.strategy.colonoscopy.45-49-grade-b",
  "crc.intl.strategy.colonoscopy.50-75-grade-a",
] as const;

const rulesNeedingR1Reconfirmation = new Set<string>(
  CCR_R2_PREP_R1_RECONFIRM_RULE_IDS,
);

const correctedSourceRefs = new Map<string, SourceRef[]>([
  [
    "crc.sus.routine.under-50",
    [
      {
        sourceId: CCR_R2_SOURCE_IDS.susFitPortaria2026,
        locator:
          "Anexo I, procedimento 02.14.01.032-5 — idade mínima 50 anos para o FIT de rastreamento",
      },
    ],
  ],
  [
    "crc.sus.routine.fit.50-75",
    [
      {
        sourceId: CCR_R2_SOURCE_IDS.susFitPortaria2026,
        locator:
          "Anexo I, procedimento 02.14.01.032-5 — FIT destinado exclusivamente ao rastreamento bienal de homens e mulheres assintomáticos de 50 a 75 anos",
      },
    ],
  ],
  [
    "crc.sus.routine.76-plus",
    [
      {
        sourceId: CCR_R2_SOURCE_IDS.susFitPortaria2026,
        locator:
          "Anexo I, procedimento 02.14.01.032-5 — idade máxima 75 anos para o FIT de rastreamento",
      },
    ],
  ],
  [
    "crc.sus.family-status",
    [
      {
        sourceId: CCR_R2_SOURCE_IDS.incaCcrProfessionals,
        locator:
          "Rastreamento — história familiar de câncer colorretal e suspeita de Lynch/PAF devem ser avaliadas em serviço especializado de genética e gastroenterologia",
      },
    ],
  ],
  [
    "crc.sus.special-risk.prior-crc",
    [
      {
        sourceId: CCR_R2_SOURCE_IDS.incaCcrProfessionals,
        locator:
          "Rastreamento — história pessoal de câncer de intestino integra contexto de maior risco e não deve ser tratada como rotina average-risk",
      },
    ],
  ],
  [
    "crc.sus.special-risk.prior-polyp-surveillance",
    [
      {
        sourceId: CCR_R2_SOURCE_IDS.incaCcrProfessionals,
        locator:
          "Rastreamento — pólipos são lesões precursoras removíveis por endoscopia; achado/história relevante não deve ser devolvido silenciosamente à rotina average-risk",
      },
      {
        sourceId: CCR_R2_SOURCE_IDS.susOci2025,
        locator:
          "Câncer colorretal — história natural descreve progressão a partir de pólipos adenomatosos e o protocolo é de avaliação diagnóstica, não de rotina average-risk",
      },
    ],
  ],
  [
    "crc.sus.special-risk.colonic-ibd",
    [
      {
        sourceId: CCR_R2_SOURCE_IDS.incaCcrProfessionals,
        locator:
          "Rastreamento — doença inflamatória intestinal é contexto de alto risco que exige abordagem distinta da rotina average-risk",
      },
    ],
  ],
  [
    "crc.sus.special-risk.hereditary-syndrome",
    [
      {
        sourceId: CCR_R2_SOURCE_IDS.incaCcrProfessionals,
        locator:
          "Rastreamento — síndromes genéticas como Lynch e PAF integram alto risco; protocolo de encaminhamento orienta serviço especializado",
      },
    ],
  ],
]);

const internationalStrategyRuleIds = new Set([
  "crc.intl.strategy.fit.45-49-grade-b",
  "crc.intl.strategy.fit.50-75-grade-a",
  "crc.intl.strategy.colonoscopy.45-49-grade-b",
  "crc.intl.strategy.colonoscopy.50-75-grade-a",
]);

function removeModalitySpecificUspstfGrade(
  sourceRefs: readonly SourceRef[],
): SourceRef[] {
  return sourceRefs.map((ref) => {
    if (ref.sourceId !== "crc-src-I01") return structuredClone(ref);
    return {
      sourceId: ref.sourceId,
      locator: ref.locator,
    };
  });
}

function prepareRuleForR2(rule: RuleDefinition): RuleDefinition {
  let sourceRefs = correctedSourceRefs.has(rule.ruleId)
    ? structuredClone(correctedSourceRefs.get(rule.ruleId)!)
    : structuredClone(rule.sourceRefs);

  if (internationalStrategyRuleIds.has(rule.ruleId)) {
    sourceRefs = removeModalitySpecificUspstfGrade(sourceRefs);
  }

  if (!rulesNeedingR1Reconfirmation.has(rule.ruleId)) {
    return RuleDefinitionSchema.parse({ ...rule, sourceRefs });
  }

  return RuleDefinitionSchema.parse({
    ...rule,
    sourceRefs,
    lifecycleStatus: "draft",
    reviewStatus: "source_verified",
    governance: {
      ...rule.governance,
      reviews: [],
    },
  });
}

export const ccrR2PreparedRules = ccrPhase6R1Ruleset.rules.map(prepareRuleForR2);

export const ccrR2PreparedRuleset = RulesetSchema.parse({
  ...ccrPhase6R1Ruleset,
  rulesetVersion: CCR_R2_PREP_RULESET_VERSION,
  rules: ccrR2PreparedRules,
  sources: ccrR2PreparedSources,
});

export const ccrR2PreparedPolicies = ccrR2PreparedRuleset.policies;
export const ccrR2PreparedResolvers = ccrPhase6R1Resolvers;
