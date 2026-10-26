import { SourceSchema } from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";

/**
 * M2 governed sources for breast-cancer screening.
 *
 * This catalog is evidence/provenance only. It does not activate any clinical
 * rule or policy.
 */
export const MAMA_SOURCE_IDS = {
  susNt6262025: "breast-src-sus-nt626-2025",
  incaEarlyDetection2025: "breast-src-inca-early-detection-2025",
  cnmNote2025: "breast-src-cnm-2025",
  cbrSbmFebrasgo2023: "breast-src-cbr-sbm-febrasgo-2023",
  uspstf2024: "breast-src-uspstf-2024",
} as const;

export const susNt6262025 = SourceSchema.parse({
  sourceId: MAMA_SOURCE_IDS.susNt6262025,
  institution:
    "Ministério da Saúde / SAES / Departamento de Atenção ao Câncer / CGCAN",
  documentTitle: "Nota Técnica nº 626/2025-CGCAN/DECAN/SAES/MS",
  publicationYear: 2025,
  version: "assinada em 22–24/09/2025; publicada em 26/09/2025",
  jurisdiction: "Brasil / SUS",
  documentStatus: "final",
  url: "https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/notas-tecnicas/2025/nota-tecnica-no-626-2025-cgcan-decan-saes-ms.pdf",
  lastVerifiedAt: day("2026-10-26"),
});

export const incaEarlyDetection2025 = SourceSchema.parse({
  sourceId: MAMA_SOURCE_IDS.incaEarlyDetection2025,
  institution: "Instituto Nacional de Câncer (INCA) / Ministério da Saúde",
  documentTitle: "Detecção precoce — câncer de mama",
  publicationYear: 2022,
  version: "página oficial atualizada em 30/09/2025",
  jurisdiction: "Brasil / SUS",
  documentStatus: "final",
  url: "https://www.gov.br/inca/pt-br/assuntos/gestor-e-profissional-de-saude/controle-do-cancer-de-mama/acoes/deteccao-precoce/",
  lastVerifiedAt: day("2026-10-26"),
});

export const cnmNote2025 = SourceSchema.parse({
  sourceId: MAMA_SOURCE_IDS.cnmNote2025,
  institution:
    "Comissão Nacional de Mamografia — CBR / SBM / FEBRASGO",
  documentTitle:
    "Nota Técnica da Comissão Nacional de Mamografia sobre o Rastreamento do Câncer de Mama no Brasil",
  publicationYear: 2025,
  version: "27/01/2025",
  jurisdiction: "Brasil",
  documentStatus: "final",
  url: "https://cbr.org.br/wp-content/uploads/2025/01/Nota-tecnica-da-Comissao-Nacional-de-Mamografia-sobre-o-rastreamento-do-Cancer-de-Mama-no-Brasil.pdf",
  lastVerifiedAt: day("2026-10-26"),
});

export const cbrSbmFebrasgo2023 = SourceSchema.parse({
  sourceId: MAMA_SOURCE_IDS.cbrSbmFebrasgo2023,
  institution:
    "Colégio Brasileiro de Radiologia / Sociedade Brasileira de Mastologia / FEBRASGO",
  documentTitle:
    "Recomendações para o rastreamento do câncer de mama no Brasil",
  publicationYear: 2023,
  version:
    "Radiol Bras. 2023 Jul/Ago;56(4):207–214; DOI 10.1590/0100-3984.2023.0064",
  jurisdiction: "Brasil",
  documentStatus: "final",
  url: "https://cbr.org.br/wp-content/uploads/2023/09/Recomendacoes-do-Colegio.pdf",
  lastVerifiedAt: day("2026-10-26"),
  gradingSystem: "Categorias A–E da Comissão Nacional de Mamografia",
});

export const uspstf2024 = SourceSchema.parse({
  sourceId: MAMA_SOURCE_IDS.uspstf2024,
  institution: "US Preventive Services Task Force (USPSTF)",
  documentTitle: "Breast Cancer: Screening",
  publicationYear: 2024,
  version: "Final Recommendation Statement — 30/04/2024",
  jurisdiction: "United States",
  documentStatus: "final",
  url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening",
  lastVerifiedAt: day("2026-10-26"),
  gradingSystem: "USPSTF letter grades",
});

export const mamaSources = [
  susNt6262025,
  incaEarlyDetection2025,
  cnmNote2025,
  cbrSbmFebrasgo2023,
  uspstf2024,
];
