import { SourceRefSchema, type SourceRef } from "../../model/content";
import { MAMA_SOURCE_IDS } from "./sources";

export const MAMA_M3_1_PROPOSITION_IDS = {
  susUnder40RoutineNotRecommended:
    "breast-prop-m3-1-sus-under40-routine-not-recommended",
  brazilUnder40RoutineNotRecommended:
    "breast-prop-m3-1-brazil-under40-routine-not-recommended",
  uspstfUnder40OutsideRecommendationScope:
    "breast-prop-m3-1-uspstf-under40-outside-recommendation-scope",
} as const;

export type MamaM31EvidenceProposition = Readonly<{
  propositionId: string;
  policyFamily: "sus_oficial" | "br_ampliado" | "internacional";
  statement: string;
  sourceRefs: readonly SourceRef[];
  status: "source_verified";
  translationNote: string;
}>;

function ref(input: Parameters<typeof SourceRefSchema.parse>[0]): SourceRef {
  return SourceRefSchema.parse(input);
}

export const mamaM31EvidencePropositions: readonly MamaM31EvidenceProposition[] = [
  {
    propositionId: MAMA_M3_1_PROPOSITION_IDS.susUnder40RoutineNotRecommended,
    policyFamily: "sus_oficial",
    statement:
      "No contexto assintomático de risco habitual, pessoas com menos de 40 anos não integram a faixa de rastreamento mamográfico rotineiro do SUS; a orientação atual do INCA informa que, fora das faixas/periodicidades recomendadas, o balanço entre riscos e benefícios do rastreamento mamográfico é desfavorável.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.incaEarlyDetection2025,
        locator:
          "seção Detecção precoce/Rastreamento, atualização de 30/09/2025: rotina 50–74 bienal; outras faixas etárias e periodicidades apresentam balanço entre riscos e benefícios desfavorável",
      }),
      ref({
        sourceId: MAMA_SOURCE_IDS.susNt6262025,
        locator:
          "itens 2.2 e 2.4, p. 1: núcleo populacional 50–74 bienal; acesso por demanda explicitado para 40–49 e acima de 74",
      }),
    ],
    status: "source_verified",
    translationNote:
      "M3.1 deve representar <40 como fora do rastreamento rotineiro de risco habitual, sem impedir investigação de sintomas ou caminhos de alto risco.",
  },
  {
    propositionId: MAMA_M3_1_PROPOSITION_IDS.brazilUnder40RoutineNotRecommended,
    policyFamily: "br_ampliado",
    statement:
      "Para risco populacional usual, a diretriz CBR/SBM/FEBRASGO não recomenda rastreamento mamográfico abaixo de 40 anos; estratégias diferenciadas podem começar antes em grupos de alto risco.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.cbrSbmFebrasgo2023,
        locator:
          "p. 210, Considerações sobre as mulheres abaixo de 40 anos: 'Não é recomendado o rastreamento nesse grupo etário'; pp. 209–210 para estratégias diferenciadas de alto risco",
        evidence: {
          gradingSystem: "Categorias A–E da Comissão Nacional de Mamografia",
          gradeVerified: true,
        },
      }),
    ],
    status: "source_verified",
    translationNote:
      "A negativa aplica-se apenas à rotina de risco habitual. Alto risco conhecido continua sendo hard exit para estratégia específica, não inelegibilidade etária simples.",
  },
  {
    propositionId:
      MAMA_M3_1_PROPOSITION_IDS.uspstfUnder40OutsideRecommendationScope,
    policyFamily: "internacional",
    statement:
      "A recomendação USPSTF 2024 para rastreamento de câncer de mama aplica-se a pessoas de risco habitual com 40 anos ou mais; pessoas abaixo de 40 anos ficam fora da população coberta por essa recomendação, sem que isso constitua uma recomendação formal USPSTF contra rastreamento.",
    sourceRefs: [
      ref({
        sourceId: MAMA_SOURCE_IDS.uspstf2024,
        locator:
          "Clinician Summary — To whom does this recommendation apply?: persons assigned female at birth 40 years or older at average risk; Recommendation Summary: biennial mammography ages 40–74",
      }),
    ],
    status: "source_verified",
    translationNote:
      "M3.1 deve preservar 'outside recommendation scope' em vez de fabricar recommend_against ou I statement para <40.",
  },
] as const;

export function mamaM31Proposition(
  propositionId: (typeof MAMA_M3_1_PROPOSITION_IDS)[keyof typeof MAMA_M3_1_PROPOSITION_IDS],
): MamaM31EvidenceProposition {
  const found = mamaM31EvidencePropositions.find(
    (item) => item.propositionId === propositionId,
  );
  if (found === undefined) throw new Error(`Unknown Mama M3.1 proposition: ${propositionId}`);
  return found;
}
