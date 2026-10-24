import { SourceSchema } from "../../model/content";
import { parseCalendarDate as day } from "../../model/dates";

export const CCR_SOURCE_IDS = {
  susOci2026: "crc-src-B12",
  sboc2026: "crc-src-S01",
  uspstf2021: "crc-src-I01",
  acg2021: "crc-src-I03",
  usmstfFit2017: "crc-src-I04",
  usmstfColonoscopy2020: "crc-src-I05",
} as const;

export const susOci2026 = SourceSchema.parse({
  sourceId: CCR_SOURCE_IDS.susOci2026,
  institution: "Ministério da Saúde / SAES",
  documentTitle:
    "Protocolo de Acesso às Ofertas de Cuidados Integrados na Atenção Especializada em Oncologia",
  publicationYear: 2026,
  version: "publicado em 27/08/2026",
  jurisdiction: "Brasil / SUS",
  documentStatus: "final",
  url: "https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/view",
  lastVerifiedAt: day("2026-10-24"),
});

export const sboc2026 = SourceSchema.parse({
  sourceId: CCR_SOURCE_IDS.sboc2026,
  institution: "Sociedade Brasileira de Oncologia Clínica (SBOC)",
  documentTitle: "Diretrizes SBOC 2026 — Cólon: doença localizada",
  publicationYear: 2026,
  version: "v6 FINAL",
  jurisdiction: "Brasil",
  documentStatus: "final",
  url: "https://sboc.org.br/wp-content/uploads/2026/04/Diretrizes-SBOC-2026-C%E2%94%9C%E2%94%82lon-doen%E2%94%9Coa-localizada-v6-VERS%E2%94%9CaO-FINAL.pdf",
  lastVerifiedAt: day("2026-10-24"),
});

export const uspstf2021 = SourceSchema.parse({
  sourceId: CCR_SOURCE_IDS.uspstf2021,
  institution: "US Preventive Services Task Force (USPSTF)",
  documentTitle: "Colorectal Cancer: Screening",
  publicationYear: 2021,
  version: "Final Recommendation Statement — 18/05/2021",
  jurisdiction: "United States",
  documentStatus: "final",
  url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening",
  lastVerifiedAt: day("2026-10-24"),
  gradingSystem: "USPSTF letter grades",
});

export const acg2021 = SourceSchema.parse({
  sourceId: CCR_SOURCE_IDS.acg2021,
  institution: "American College of Gastroenterology (ACG)",
  documentTitle: "ACG Clinical Guidelines: Colorectal Cancer Screening 2021",
  publicationYear: 2021,
  version: "Am J Gastroenterol. 2021;116(3):458-479",
  jurisdiction: "United States",
  documentStatus: "final",
  url: "https://doi.org/10.14309/ajg.0000000000001122",
  lastVerifiedAt: day("2026-10-24"),
});

export const usmstfFit2017 = SourceSchema.parse({
  sourceId: CCR_SOURCE_IDS.usmstfFit2017,
  institution: "US Multi-Society Task Force on Colorectal Cancer",
  documentTitle:
    "Recommendations on fecal immunochemical testing to screen for colorectal neoplasia",
  publicationYear: 2017,
  version: "Consensus statement 2017",
  jurisdiction: "United States",
  documentStatus: "final",
  url: "https://www.asge.org/home/resources/publications/guidelines/fecal-immunochemical-testing-for-colorectal-neoplasia",
  lastVerifiedAt: day("2026-10-24"),
});

export const usmstfColonoscopy2020 = SourceSchema.parse({
  sourceId: CCR_SOURCE_IDS.usmstfColonoscopy2020,
  institution: "US Multi-Society Task Force on Colorectal Cancer",
  documentTitle:
    "Recommendations for Follow-Up After Colonoscopy and Polypectomy: A Consensus Update",
  publicationYear: 2020,
  version: "Consensus update 2020",
  jurisdiction: "United States",
  documentStatus: "final",
  url: "https://www.asge.org/home/resources/publications/guidelines/recommendations-for-follow-up-after-colonoscopy-and-polypectomy-a-consensus-update-by-the-us-multi-society-task-force-on-colorectal-cancer",
  lastVerifiedAt: day("2026-10-24"),
});

export const ccrSources = [
  susOci2026,
  sboc2026,
  uspstf2021,
  acg2021,
  usmstfFit2017,
  usmstfColonoscopy2020,
];
