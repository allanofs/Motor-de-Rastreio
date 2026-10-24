import { SourceSchema } from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";
import { ccrPhase6R1Ruleset } from "./reviewedCandidate";

export const CCR_R2_SOURCE_IDS = {
  susOci2025: "crc-src-B12",
  susFitPortaria2026: "crc-src-B13",
  incaCcrProfessionals: "crc-src-B14",
} as const;

/**
 * Reconciled metadata for the OCI source already referenced by the R1
 * candidate. The page was surfaced/updated in 2026, but the PDF itself is the
 * 2nd edition (2025). R2 preparation records the document edition, not the
 * landing-page publication date.
 */
export const susOci2025Reconciled = SourceSchema.parse({
  sourceId: CCR_R2_SOURCE_IDS.susOci2025,
  institution: "Ministério da Saúde / SAES",
  documentTitle:
    "Protocolo de Acesso às Ofertas de Cuidados Integrados na Atenção Especializada em Oncologia",
  publicationYear: 2025,
  version: "2ª edição — 2025",
  jurisdiction: "Brasil / SUS",
  documentStatus: "final",
  url: "https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/view",
  lastVerifiedAt: day("2026-10-24"),
});

/**
 * Normative source for the operational SUS population-screening core.
 * DOU 23/10/2026, Seção 1, pp. 73–74; effects in SUS information systems from
 * the competence following publication.
 */
export const susFitPortaria2026 = SourceSchema.parse({
  sourceId: CCR_R2_SOURCE_IDS.susFitPortaria2026,
  institution: "Ministério da Saúde / Secretaria de Atenção Especializada à Saúde",
  documentTitle: "Portaria SAES/MS nº 5.215, de 22 de outubro de 2026",
  publicationYear: 2026,
  version: "DOU 23/10/2026 — Seção 1, edição 201, pp. 73–74",
  jurisdiction: "Brasil / SUS",
  documentStatus: "final",
  url: "https://www.in.gov.br/web/dou/-/portaria-saes/ms-n-5.215-de-22-de-outubro-de-2026-739944058",
  lastVerifiedAt: day("2026-10-24"),
});

/**
 * Official INCA professional page used only for conservative routing of
 * recognized higher-risk contexts outside the pilot's average-risk pathway.
 */
export const incaCcrProfessionals = SourceSchema.parse({
  sourceId: CCR_R2_SOURCE_IDS.incaCcrProfessionals,
  institution: "Instituto Nacional de Câncer (INCA) / Ministério da Saúde",
  documentTitle: "Câncer de intestino — versão para profissionais de saúde",
  publicationYear: 2022,
  version: "página institucional vigente — verificada em 24/10/2026",
  jurisdiction: "Brasil",
  documentStatus: "final",
  url: "https://www.gov.br/inca/pt-br/assuntos/cancer/tipos/intestino/versao-para-profissionais-de-saude",
  lastVerifiedAt: day("2026-10-24"),
});

const inheritedSources = ccrPhase6R1Ruleset.sources.filter(
  (source) => source.sourceId !== CCR_R2_SOURCE_IDS.susOci2025,
);

export const ccrR2PreparedSources = [
  susOci2025Reconciled,
  susFitPortaria2026,
  incaCcrProfessionals,
  ...inheritedSources,
];
