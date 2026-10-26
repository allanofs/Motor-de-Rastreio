import { SourceRefSchema, type SourceRef } from "../../model/content";
import { MAMA_SOURCE_IDS } from "./sources";

export type MamaEvidenceStatus =
  | "source_verified"
  | "translation_pending"
  | "scope_limitation";

export type MamaEvidenceProposition = Readonly<{
  propositionId: string;
  policyFamilies: readonly ("sus_oficial" | "br_ampliado" | "internacional")[];
  statement: string;
  sourceRefs: readonly SourceRef[];
  status: MamaEvidenceStatus;
  translationNote?: string;
}>;

function ref(input: Parameters<typeof SourceRefSchema.parse>[0]): SourceRef {
  return SourceRefSchema.parse(input);
}

export const MAMA_PROPOSITION_IDS = {
  susRoutine5074Biennial: "breast-prop-sus-routine-50-74-biennial",
  susOnDemandOutsideCore: "breast-prop-sus-on-demand-outside-core",
  susSymptomsAreDiagnostic: "breast-prop-sus-symptoms-diagnostic",
  susHighRiskIndividualized: "breast-prop-sus-high-risk-individualized",
  susCurrentGuidanceSupersedesPrior: "breast-prop-sus-current-supersedes-prior",
  brazilAnnual4074: "breast-prop-brazil-annual-40-74",
  brazil75Individualized: "breast-prop-brazil-75-individualized",
  brazilSpecialRiskOutsideRoutine: "breast-prop-brazil-special-risk-outside-routine",
  brazilDbtSupportedButOutOfV1: "breast-prop-brazil-dbt-scope-limitation",
  uspstfRoutine4074Biennial: "breast-prop-uspstf-routine-40-74-biennial",
  uspstf75InsufficientEvidence: "breast-prop-uspstf-75-insufficient-evidence",
  uspstfPopulationScope: "breast-prop-uspstf-population-scope",
  uspstfDbtPrimaryModality: "breast-prop-uspstf-dbt-primary-modality",
  uspstfDenseSupplementalInsufficient:
    "breast-prop-uspstf-dense-supplemental-insufficient",
  abnormalScreenNeedsFollowup: "breast-prop-abnormal-screen-needs-followup",
  anatomyAwareInclusion: "breast-prop-anatomy-aware-inclusion",
} as const;

export const mamaEvidencePropositions: readonly MamaEvidenceProposition[] = [
  {
    propositionId: MAMA_PROPOSITION_IDS.susRoutine5074Biennial,
    policyFamilies: ["sus_oficial"],
    statement:
      "O rastreamento mamográfico populacional do SUS é orientado dos 50 aos 74 anos, com periodicidade bienal.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.susNt6262025,
        locator: "item 2.2, p. 1",
      }),
      ref({
        sourceId: MAMA_SOURCE_IDS.incaEarlyDetection2025,
        locator:
          "seção Rastreamento, atualização de setembro de 2025: 50–74 anos, uma vez a cada dois anos",
      }),
    ],
    status: "source_verified",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.susOnDemandOutsideCore,
    policyFamilies: ["sus_oficial"],
    statement:
      "Pessoas assintomáticas de 40–49 anos e acima de 74 anos podem acessar mamografia de rastreamento por demanda, com orientação profissional sobre riscos e benefícios, sem equivaler ao núcleo do rastreamento populacional.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.susNt6262025,
        locator: "item 2.4, p. 1",
      }),
    ],
    status: "translation_pending",
    translationNote:
      "M3 deve preservar como decisão individual/compartilhada, não como rastreamento populacional automático.",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.susSymptomsAreDiagnostic,
    policyFamilies: ["sus_oficial"],
    statement:
      "Mamografia de rastreamento se aplica ao contexto assintomático; sinais e sintomas suspeitos pertencem à investigação diagnóstica e exigem saída da rotina.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.susNt6262025,
        locator: "itens 2.1 e 2.6–2.16, pp. 1–2",
      }),
    ],
    status: "source_verified",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.susHighRiskIndividualized,
    policyFamilies: ["sus_oficial"],
    statement:
      "Contextos de alto risco hereditário/genético e radioterapia torácica de alto risco exigem acompanhamento individualizado, fora da rotina populacional simples.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.incaEarlyDetection2025,
        locator:
          "seção Rastreamento: alto risco, acompanhamento individualizado; parágrafos sobre mutações BRCA/outros genes e radioterapia supra-diafragmática",
      }),
    ],
    status: "source_verified",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.susCurrentGuidanceSupersedesPrior,
    policyFamilies: ["sus_oficial"],
    statement:
      "A Nota Técnica 626/2025 deve orientar o cenário atual até novas diretrizes e torna sem efeito recomendações anteriores com orientação distinta.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.susNt6262025,
        locator: "item 3.1, p. 2",
      }),
    ],
    status: "source_verified",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.brazilAnnual4074,
    policyFamilies: ["br_ampliado"],
    statement:
      "A Comissão Nacional de Mamografia (CBR/SBM/FEBRASGO) recomenda rastreamento mamográfico anual dos 40 aos 74 anos.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.cnmNote2025,
        locator: "p. 1, parágrafo inicial; p. 5, Recomendação da Comissão Nacional de Mamografia",
      }),
      ref({
        sourceId: MAMA_SOURCE_IDS.cbrSbmFebrasgo2023,
        locator: "p. 208, Rastreamento das mulheres com risco populacional usual — Mamografia",
        evidence: {
          gradingSystem: "Categorias A–E da Comissão Nacional de Mamografia",
          recommendationStrength: "forte a favor",
          evidenceCertainty: "alta qualidade",
          rawGrade: "Categoria A",
          gradeVerified: true,
        },
      }),
    ],
    status: "source_verified",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.brazil75Individualized,
    policyFamilies: ["br_ampliado"],
    statement:
      "A partir dos 75 anos, a continuidade do rastreamento é individualizada conforme saúde geral, comorbidades e expectativa de vida; a diretriz de 2023 usa expectativa de vida de pelo menos sete anos.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.cnmNote2025,
        locator: "p. 1, parágrafo inicial; pp. 4–5, Recomendação da Comissão Nacional de Mamografia",
      }),
      ref({
        sourceId: MAMA_SOURCE_IDS.cbrSbmFebrasgo2023,
        locator: "p. 208, Rastreamento das mulheres com risco populacional usual — Mamografia",
        evidence: {
          gradingSystem: "Categorias A–E da Comissão Nacional de Mamografia",
          recommendationStrength: "a favor por consenso",
          evidenceCertainty: "consenso de especialistas",
          rawGrade: "Categoria D",
          gradeVerified: true,
        },
      }),
    ],
    status: "translation_pending",
    translationNote:
      "Mama V1 não possui estimador validado de expectativa de vida; M3 não deve automatizar Due em 75+ sem um contexto prognóstico governado.",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.brazilSpecialRiskOutsideRoutine,
    policyFamilies: ["br_ampliado"],
    statement:
      "Mutações patogênicas/forte risco familiar, radioterapia torácica precoce, lesões mamárias de alto risco e história pessoal de câncer pertencem a estratégias diferenciadas e não devem ser tratados como rotina average-risk simples.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.cbrSbmFebrasgo2023,
        locator:
          "pp. 209–210, seções de lesões de alto risco, câncer prévio, radioterapia torácica e mutação genética/forte história familiar",
      }),
    ],
    status: "translation_pending",
    translationNote:
      "A M1 representa mutação genética, radioterapia, lesão de alto risco e câncer prévio, mas ainda não possui conceito separado para alto risco familiar sem mutação conhecida.",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.brazilDbtSupportedButOutOfV1,
    policyFamilies: ["br_ampliado"],
    statement:
      "Tomossíntese em associação à mamografia pode ser considerada no rastreamento quando disponível, mas Mama V1 não a expõe como estratégia separada.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.cbrSbmFebrasgo2023,
        locator: "p. 208, Rastreamento de risco populacional usual — Tomossíntese",
        evidence: {
          gradingSystem: "Categorias A–E da Comissão Nacional de Mamografia",
          recommendationStrength: "forte a favor",
          evidenceCertainty: "moderada qualidade",
          rawGrade: "Categoria B",
          gradeVerified: true,
        },
      }),
    ],
    status: "scope_limitation",
    translationNote:
      "V1 mantém mamografia como modalidade de rotina única; eventual normalização de DBT deverá ser explícita e não inferida pela UI.",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.uspstfRoutine4074Biennial,
    policyFamilies: ["internacional"],
    statement:
      "A USPSTF recomenda mamografia de rastreamento bienal dos 40 aos 74 anos.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.uspstf2024,
        locator: "Recommendation Summary; Clinician Summary — What does the USPSTF recommend?",
        evidence: {
          gradingSystem: "USPSTF letter grades",
          recommendationStrength: "recommend",
          evidenceCertainty: "moderate certainty of moderate net benefit",
          rawGrade: "B",
          gradeVerified: true,
        },
      }),
    ],
    status: "source_verified",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.uspstf75InsufficientEvidence,
    policyFamilies: ["internacional"],
    statement:
      "Para 75 anos ou mais, a USPSTF considera insuficiente a evidência para avaliar o balanço de benefícios e danos da mamografia de rastreamento.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.uspstf2024,
        locator: "Recommendation Summary; Clinician Summary — Women 75 years or older",
        evidence: {
          gradingSystem: "USPSTF letter grades",
          recommendationStrength: "insufficient evidence",
          rawGrade: "I statement",
          gradeVerified: true,
        },
      }),
    ],
    status: "translation_pending",
    translationNote:
      "M3 deve preservar a insuficiência de evidência; não converter em recomendação positiva automática.",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.uspstfPopulationScope,
    policyFamilies: ["internacional"],
    statement:
      "A recomendação USPSTF inclui risco habitual e fatores como parente de primeiro grau com câncer de mama ou mamas densas, mas exclui síndrome/mutação genética de alto risco, radioterapia torácica em idade jovem, câncer de mama prévio e lesão mamária de alto risco.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.uspstf2024,
        locator: "Clinician Summary — To whom does this recommendation apply?; Practice Considerations — Patient Population Under Consideration",
      }),
    ],
    status: "source_verified",
    translationNote:
      "História familiar comum não pode ser promovida automaticamente a hard exit; o hard exit exige contexto de alto risco conhecido.",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.uspstfDbtPrimaryModality,
    policyFamilies: ["internacional"],
    statement:
      "Mamografia digital e tomossíntese mamária digital são modalidades mamográficas primárias eficazes segundo a USPSTF.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.uspstf2024,
        locator: "Practice Considerations — Screening Tests; Clinician Summary — How to implement this recommendation?",
      }),
    ],
    status: "scope_limitation",
    translationNote:
      "DBT permanece fora da estratégia separada V1; isso é limite de produto, não afirmação de ineficácia.",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.uspstfDenseSupplementalInsufficient,
    policyFamilies: ["internacional"],
    statement:
      "Em pessoas com mamas densas e mamografia negativa, a USPSTF considera insuficiente a evidência para recomendar a favor ou contra ultrassom ou ressonância suplementar.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.uspstf2024,
        locator: "Recommendation Summary — Women with dense breasts; Practice Considerations",
        evidence: {
          gradingSystem: "USPSTF letter grades",
          recommendationStrength: "insufficient evidence",
          rawGrade: "I statement",
          gradeVerified: true,
        },
      }),
    ],
    status: "source_verified",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.abnormalScreenNeedsFollowup,
    policyFamilies: ["sus_oficial", "br_ampliado", "internacional"],
    statement:
      "Um achado de rastreamento que não permite retorno simples à rotina exige avaliação/seguimento específico e não deve iniciar silenciosamente um novo relógio de rastreamento.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.incaEarlyDetection2025,
        locator:
          "definição de rastreamento/detecção precoce e necessidade de investigação de resultados anormais",
      }),
      ref({
        sourceId: MAMA_SOURCE_IDS.uspstf2024,
        locator: "Pathway to Benefit — abnormal screening mammography findings require appropriate follow-up evaluation",
      }),
    ],
    status: "source_verified",
    translationNote:
      "Mama V1 usa a classificação explícita routine-clearing/attention-required/indeterminate e não interpreta BI-RADS bruto.",
  },
  {
    propositionId: MAMA_PROPOSITION_IDS.anatomyAwareInclusion,
    policyFamilies: ["sus_oficial"],
    statement:
      "A orientação brasileira atual inclui homens trans e pessoas não-binárias designadas mulheres ao nascer que mantêm as mamas; a modelagem do Motor representa anatomia relevante explicitamente em vez de inferi-la da identidade de gênero.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.incaEarlyDetection2025,
        locator: "seção Rastreamento, nota de inclusão após recomendação 50–74 anos",
      }),
    ],
    status: "source_verified",
  },
];

export const MAMA_M2_MODEL_GAPS = [
  {
    gapId: "breast-gap-high-risk-familial-context",
    description:
      "M1 possui breast-high-risk-genetic-context, mas a fonte brasileira também trata forte história familiar/risco vitalício >=20% como via especial mesmo sem mutação conhecida.",
    disposition:
      "Não sobrecarregar o conceito genético. Avaliar em gate humano M2 se M1 deve ganhar conceito separado de alto risco familiar conhecido antes de M3.",
  },
  {
    gapId: "breast-gap-brazil-expanded-scope-label",
    description:
      "A diretriz brasileira de 2023 inclui imagem suplementar em alguns contextos, enquanto Mama V1 implementará apenas o núcleo mamográfico de rotina e saídas seguras.",
    disposition:
      "O produto/relatório deve explicitar que a policy Brasil ampliado V1 cobre o núcleo de rastreamento mamográfico, não toda a diretriz de imagem suplementar.",
  },
] as const;
