import { CCR_FAMILY_DETAIL_KEYS, CCR_IDS } from "../../clinical/ccr";
import type { ClinicalFact, ExamRecord } from "../../model/patient";
import type { PartialCalendarDate } from "../../model/dates";
import type { CcrReportModel } from "./report";

const BOUNDARY_COPY: Record<
  CcrReportModel["boundary"]["code"],
  { label: string; message: string }
> = {
  ROUTINE_DUE: {
    label: "Rastreamento indicado",
    message: "Há uma ação de rastreamento indicada neste referencial.",
  },
  ROUTINE_CURRENT: {
    label: "Em dia",
    message: "O rastreamento está em dia com base no histórico qualificável disponível.",
  },
  SHARED_DECISION: {
    label: "Decisão individual",
    message: "A próxima etapa exige discussão e escolha humana; o Motor não escolhe a modalidade autonomamente.",
  },
  MORE_INFORMATION_NEEDED: {
    label: "Próxima informação necessária",
    message: "Faltam informações para concluir com segurança esta avaliação.",
  },
  SPECIFIC_ATTENTION_REQUIRED: {
    label: "Atenção específica",
    message: "Há uma situação que precisa ser resolvida antes de retornar ao rastreamento de rotina. O rastreamento de rotina fica suspenso neste momento.",
  },
  SPECIFIC_CARE_ACTIVE: {
    label: "Em acompanhamento específico",
    message: "Este caminho já saiu do rastreamento de rotina e está sob cuidado específico.",
  },
  SCREENING_NOT_INDICATED: {
    label: "Rastreamento não indicado",
    message: "Não há nova ação de rastreamento de rotina indicada neste referencial para os caminhos avaliados.",
  },
  CANNOT_CONCLUDE_SAFELY: {
    label: "Não foi possível concluir com segurança",
    message: "A avaliação foi interrompida de forma segura; revise as informações e os detalhes técnicos antes de continuar.",
  },
};

const CONCEPT_LABELS: Record<string, string> = {
  [CCR_IDS.concepts.screeningContextConfirmed]: "Contexto preventivo",
  [CCR_IDS.concepts.priorCrc]: "Câncer colorretal prévio",
  [CCR_IDS.concepts.priorPolypSurveillance]: "Pólipo/adenoma prévio com vigilância",
  [CCR_IDS.concepts.colonicIbd]: "Doença inflamatória intestinal colônica",
  [CCR_IDS.concepts.hereditarySyndrome]: "Síndrome hereditária CCR/polipose",
  [CCR_IDS.concepts.familyHistoryRelevant]: "História familiar relevante",
  [CCR_IDS.concepts.screeningStrategySelection]: "Estratégia de rastreamento escolhida",
  [CCR_IDS.concepts.historySufficientForCurrentStatus]: "Histórico suficiente para o status atual",
  [CCR_IDS.concepts.specialistCareAssumed]: "Cuidado específico já assumido",
};

const DETAIL_LABELS: Record<string, string> = {
  [CCR_FAMILY_DETAIL_KEYS.affectedFdrCount]: "Familiares de 1º grau afetados",
  [CCR_FAMILY_DETAIL_KEYS.affectedSdrCount]: "Familiares de 2º grau afetados",
  [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand]: "Faixa etária do diagnóstico mais jovem",
  [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeYears]: "Idade do diagnóstico mais jovem",
  [CCR_FAMILY_DETAIL_KEYS.findingType]: "Achado familiar",
};

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function presenceLabel(value: ClinicalFact["presence"]): string {
  switch (value) {
    case "yes": return "Sim";
    case "no": return "Não";
    case "unknown": return "Desconhecido";
    case "not_applicable": return "Não aplicável";
  }
}

function strategyValue(value: unknown): string {
  if (value === "fit") return "FIT";
  if (value === "colonoscopy") return "Colonoscopia primária";
  return String(value ?? "");
}

function detailValue(key: string, value: unknown): string {
  if (key === CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand) {
    if (value === "under-60") return "< 60 anos";
    if (value === "60-or-older") return "≥ 60 anos";
    if (value === "unknown") return "Desconhecida";
  }
  if (key === CCR_FAMILY_DETAIL_KEYS.findingType) {
    if (value === "crc") return "Câncer colorretal";
    if (value === "advanced-polyp") return "Pólipo avançado";
    if (value === "polyp-unknown-type") return "Pólipo de tipo desconhecido";
    if (value === "unknown") return "Desconhecido";
  }
  return String(value);
}

function renderFact(fact: ClinicalFact): string {
  const label = CONCEPT_LABELS[fact.conceptId] ?? fact.conceptId;
  const value = fact.presence === "yes" && "value" in fact && fact.value !== undefined
    ? ` - ${strategyValue(fact.value)}`
    : "";
  const details = fact.presence === "yes" && "details" in fact && fact.details
    ? `<ul class="sublist">${Object.entries(fact.details)
        .map(([key, entry]) => `<li><strong>${escapeHtml(DETAIL_LABELS[key] ?? key)}:</strong> ${escapeHtml(detailValue(key, entry))}</li>`)
        .join("")}</ul>`
    : "";
  return `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(presenceLabel(fact.presence))}${escapeHtml(value)}${details}</li>`;
}

function partialDateLabel(date: PartialCalendarDate | undefined): string {
  if (!date) return "Data não informada";
  if (date.precision === "year") return String(date.year);
  if (date.precision === "month")
    return `${String(date.month).padStart(2, "0")}/${date.year}`;
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
}

function modalityLabel(modality: string): string {
  if (modality === CCR_IDS.modalities.fit) return "FIT";
  if (modality === CCR_IDS.modalities.colonoscopyScreening) return "Colonoscopia de rastreamento";
  if (modality === CCR_IDS.modalities.colonoscopyDiagnostic) return "Colonoscopia diagnóstica após FIT positivo";
  if (modality === CCR_IDS.modalities.colonoscopy) return "Colonoscopia";
  return modality;
}

function resultLabel(record: ExamRecord): string {
  if (record.status !== "performed")
    return record.status === "not_performed" ? "Não realizado" : "Status desconhecido";
  if (record.result.status === "final") {
    const code = record.result.code;
    if (code === "positive") return "Positivo";
    if (code === "negative") return "Negativo";
    if (code === CCR_IDS.results.colonoscopyNormal) return "Normal";
    if (code === CCR_IDS.results.colonoscopyPolypOrLesion) return "Pólipo/lesão";
    if (code === CCR_IDS.results.colonoscopyCancer) return "Câncer";
    return code;
  }
  if (record.result.status === "pending") return "Pendente";
  if (record.result.status === "invalid") return "Inválido/inconclusivo";
  return "Desconhecido";
}

function renderRecord(record: ExamRecord, used: boolean): string {
  const date = record.status === "performed" ? partialDateLabel(record.date) : "-";
  return `<li><strong>${escapeHtml(modalityLabel(record.modality))}</strong> - ${escapeHtml(date)} - ${escapeHtml(resultLabel(record))}${used ? " <span class=\"badge\">utilizado na conclusão</span>" : " <span class=\"muted\">considerado</span>"}</li>`;
}

function historyKnowledgeLabel(value: string): string {
  if (value === "known") return "Histórico conhecido";
  if (value === "never_performed") return "Nunca realizou rastreamento (confirmado)";
  if (value === "unknown") return "Histórico desconhecido";
  return value;
}

function resourceLabel(resourceId: string): string {
  if (resourceId === CCR_IDS.resources.fit) return "FIT";
  if (resourceId === CCR_IDS.resources.colonoscopy) return "Colonoscopia";
  return resourceId;
}

function availabilityLabel(value: string): string {
  if (value === "available") return "Disponível";
  if (value === "unavailable") return "Indisponível";
  if (value === "unknown") return "Desconhecido";
  return value;
}

function renderInputs(report: CcrReportModel): string {
  const facts = report.inputs.factsUsed.length
    ? `<ul>${report.inputs.factsUsed.map(renderFact).join("")}</ul>`
    : `<p class="muted">Nenhum fato clínico adicional precisou ser materialmente utilizado pelos tracks que determinaram esta conclusão.</p>`;

  const records = report.inputs.records.length
    ? `<ul>${report.inputs.records.map(({ record, used }) => renderRecord(record, used)).join("")}</ul>`
    : `<p class="muted">Nenhum exame conhecido foi utilizado ou considerado pelos tracks determinantes.</p>`;

  const history = Object.entries(report.inputs.historyKnowledge)
    .map(([topic, value]) => `<li><strong>${escapeHtml(topic)}:</strong> ${escapeHtml(historyKnowledgeLabel(value))}</li>`)
    .join("");

  const resources = Object.entries(report.inputs.careSettingResources)
    .map(([resourceId, value]) => `<li><strong>${escapeHtml(resourceLabel(resourceId))}:</strong> ${escapeHtml(availabilityLabel(value))}</li>`)
    .join("");

  return `
    <section>
      <h2>Dados considerados</h2>
      ${report.inputs.ageYears === undefined ? "" : `<p><strong>Idade:</strong> ${report.inputs.ageYears} anos</p>`}
      <h3>Fatos clínicos utilizados</h3>
      ${facts}
      <h3>Conhecimento do histórico</h3>
      ${history ? `<ul>${history}</ul>` : `<p class="muted">Não registrado.</p>`}
      <h3>Exames relevantes</h3>
      ${records}
      ${resources ? `<h3>Contexto operacional que afetou a rota</h3><ul>${resources}</ul>` : ""}
    </section>`;
}

function renderActions(report: CcrReportModel): string {
  if (report.primaryActions.length === 0) {
    return `<p class="muted">Nenhuma ação clínica profunda foi promovida como recomendação principal neste relatório. Consulte a conclusão acima e, quando aplicável, a equipe responsável pelo cuidado específico.</p>`;
  }
  return `<ul class="actions">${report.primaryActions.map((action) => `
    <li>
      <strong>${escapeHtml(action.text)}</strong>
      ${action.operational ? `<div>${escapeHtml(action.operational.routeLabel)}</div>` : ""}
    </li>`).join("")}</ul>`;
}

function renderSources(report: CcrReportModel): string {
  const sources = report.provenance.sources.map((source, index) => `
    <article class="source">
      <h3>${index + 1}. ${escapeHtml(source.documentTitle)}</h3>
      <p><strong>Instituição:</strong> ${escapeHtml(source.institution)}</p>
      <p><strong>Ano / versão:</strong> ${escapeHtml(source.publicationYear)} - ${escapeHtml(source.version)}</p>
      <p><strong>Jurisdição:</strong> ${escapeHtml(source.jurisdiction)}</p>
      <p><strong>Identificador interno:</strong> <code>${escapeHtml(source.sourceId)}</code></p>
      <p><strong>Fonte oficial:</strong> <a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a></p>
      <p><strong>Localizador(es) utilizado(s):</strong></p>
      <ul>${source.references.map((ref) => `<li>${escapeHtml(ref.locator)}${ref.evidence ? ` - ${escapeHtml(ref.evidence.gradingSystem)}${ref.evidence.rawGrade ? `; grau ${escapeHtml(ref.evidence.rawGrade)}` : ""}` : ""}</li>`).join("")}</ul>
    </article>`).join("");

  const incomplete = report.provenance.status === "incomplete"
    ? `<div class="warning"><strong>Rastreabilidade bibliográfica incompleta.</strong> ${report.provenance.unresolved.map((item) => `${escapeHtml(item.sourceId)} (${escapeHtml(item.locator)})`).join("; ")}. Nenhuma referência ausente foi inventada.</div>`
    : "";

  return `${incomplete}${sources || `<p class="muted">Nenhuma fonte governada foi resolvida para esta conclusão.</p>`}`;
}

export function renderCcrReportHtml(report: CcrReportModel): string {
  const boundary = BOUNDARY_COPY[report.boundary.code];
  const missing = report.unresolvedInformation.length
    ? `<section><h2>Informações ainda não resolvidas</h2><ul>${report.unresolvedInformation.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul></section>`
    : "";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Relatório - Motor de Rastreio V3</title>
<style>
  :root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #eef1f6; }
  .toolbar { position: sticky; top: 0; z-index: 5; display: flex; justify-content: center; padding: 12px; background: #172033; }
  .toolbar button { border: 0; border-radius: 8px; padding: 10px 16px; font: inherit; font-weight: 750; cursor: pointer; background: white; color: #172033; }
  .page { width: min(210mm, calc(100% - 24px)); min-height: 297mm; margin: 16px auto; background: white; padding: 18mm 16mm; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
  .eyebrow { text-transform: uppercase; letter-spacing: .08em; font-size: 10px; font-weight: 800; color: #5269aa; }
  h1 { font-size: 25px; margin: 4px 0 4px; }
  h2 { font-size: 17px; margin: 24px 0 10px; border-bottom: 1px solid #dfe4ee; padding-bottom: 6px; }
  h3 { font-size: 13px; margin: 14px 0 6px; }
  p, li { font-size: 12px; line-height: 1.55; }
  ul { padding-left: 20px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; margin: 18px 0; padding: 12px; border: 1px solid #dfe4ee; border-radius: 10px; background: #f7f9fc; }
  .meta div { font-size: 11px; }
  .result { border-left: 5px solid #304c9b; padding: 12px 14px; background: #f5f7fc; border-radius: 8px; }
  .result h2 { border: 0; margin: 0 0 6px; padding: 0; font-size: 20px; }
  .warning { margin: 12px 0; padding: 10px 12px; border: 1px solid #e2bf55; background: #fff4cc; border-radius: 8px; font-size: 11px; line-height: 1.5; }
  .muted { color: #626c80; }
  .badge { display: inline-block; margin-left: 6px; padding: 2px 6px; border-radius: 999px; background: #edf7f1; color: #205f43; font-size: 9px; font-weight: 750; }
  .sublist { margin-top: 4px; }
  .actions li { margin-bottom: 8px; }
  .source { page-break-inside: avoid; border: 1px solid #dfe4ee; border-radius: 8px; padding: 10px 12px; margin: 10px 0; }
  .source p { margin: 4px 0; }
  a { color: #304c9b; overflow-wrap: anywhere; }
  code { font-size: 10px; overflow-wrap: anywhere; }
  footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #dfe4ee; color: #6b7486; font-size: 9px; line-height: 1.5; }
  @page { size: A4; margin: 12mm; }
  @media print {
    body { background: white; }
    .toolbar { display: none !important; }
    .page { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
    a { color: black; text-decoration: none; }
  }
  @media (max-width: 650px) {
    .page { padding: 24px 18px; }
    .meta { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="toolbar"><button type="button" onclick="window.print()">Imprimir / salvar como PDF</button></div>
<main class="page">
  <div class="warning"><strong>PILOTO LOCAL DE INTEGRAÇÃO.</strong> Este relatório não autoriza uso clínico real, liberação pública ou substituição de julgamento profissional.</div>
  <p class="eyebrow">Motor de Rastreio V3</p>
  <h1>Relatório de apoio à decisão - rastreamento de câncer colorretal</h1>
  <div class="meta">
    <div><strong>Referencial:</strong><br>${escapeHtml(report.policy.label)}</div>
    <div><strong>Data de referência:</strong><br>${escapeHtml(report.asOf)}</div>
    <div><strong>Ruleset:</strong><br>${escapeHtml(report.rulesetVersion)}</div>
    <div><strong>Contrato do relatório:</strong><br>${escapeHtml(report.contractVersion)}</div>
  </div>
  <section class="result">
    <h2>${escapeHtml(boundary.label)}</h2>
    <p>${escapeHtml(boundary.message)}</p>
  </section>
  <section>
    <h2>Próxima ação</h2>
    ${renderActions(report)}
  </section>
  ${missing}
  ${renderInputs(report)}
  <section>
    <h2>Referências utilizadas nesta conclusão</h2>
    ${renderSources(report)}
  </section>
  <section>
    <h2>Rastreabilidade técnica</h2>
    <p><strong>Boundary:</strong> <code>${escapeHtml(report.boundary.code)}</code></p>
    <p><strong>Track(s) determinante(s):</strong> ${report.boundary.triggerTrackIds.map((id) => `<code>${escapeHtml(id)}</code>`).join(", ")}</p>
    <p><strong>Release gate:</strong> <code>${escapeHtml(report.releaseGate)}</code></p>
  </section>
  <footer>
    Este documento foi gerado localmente a partir da avaliação estruturada e da provenance governada do Motor. As referências acima derivam de `DecisionTrace.sourceRefs`; não foram inferidas apenas pelo nome do referencial. O PDF é uma representação do modelo estruturado, não a fonte de verdade clínica.
  </footer>
</main>
</body>
</html>`;
}
