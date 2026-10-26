import { CCR_IDS } from "../../clinical/ccr";
import type { ClinicalFact, ExamRecord } from "../../model/patient";
import type { PartialCalendarDate } from "../../model/dates";
import {
  escapeReportHtml as esc,
  formatReportIsoDate,
  renderPrintableReportDocument,
  renderReportProvenanceHtml,
} from "../reporting";
import type { CcrReportModel } from "./report";

const BOUNDARY_COPY: Record<
  CcrReportModel["boundary"]["code"],
  { label: string; message: string }
> = {
  ROUTINE_DUE: { label: "Rastreamento indicado", message: "Há uma ação de rastreamento indicada neste referencial." },
  ROUTINE_CURRENT: { label: "Em dia", message: "O rastreamento está em dia com base no histórico qualificável disponível." },
  SHARED_DECISION: { label: "Decisão individual", message: "A próxima etapa exige discussão e escolha humana; o Motor não escolhe a modalidade autonomamente." },
  MORE_INFORMATION_NEEDED: { label: "Próxima informação necessária", message: "Faltam informações para concluir com segurança esta avaliação." },
  SPECIFIC_ATTENTION_REQUIRED: { label: "Atenção específica", message: "Há uma situação que precisa ser resolvida antes de retornar ao rastreamento de rotina. O rastreamento de rotina fica suspenso neste momento." },
  SPECIFIC_CARE_ACTIVE: { label: "Em acompanhamento específico", message: "Este caminho já saiu do rastreamento de rotina e está sob cuidado específico." },
  SCREENING_NOT_INDICATED: { label: "Rastreamento não indicado", message: "Não há nova ação de rastreamento de rotina indicada neste referencial para os caminhos avaliados." },
  CANNOT_CONCLUDE_SAFELY: { label: "Não foi possível concluir com segurança", message: "A avaliação foi interrompida de forma segura; revise os detalhes técnicos antes de continuar." },
};

const CONCEPT_LABELS: Record<string, string> = {
  [CCR_IDS.concepts.screeningContextConfirmed]: "Contexto preventivo",
  [CCR_IDS.concepts.priorCrc]: "Câncer colorretal prévio",
  [CCR_IDS.concepts.priorPolypSurveillance]: "Pólipo/adenoma prévio com vigilância",
  [CCR_IDS.concepts.colonicIbd]: "Doença inflamatória intestinal colônica",
  [CCR_IDS.concepts.hereditarySyndrome]: "Síndrome hereditária CCR/polipose",
  [CCR_IDS.concepts.familyHistoryRelevant]: "História familiar relevante",
  [CCR_IDS.concepts.screeningStrategySelection]: "Estratégia escolhida",
  [CCR_IDS.concepts.historySufficientForCurrentStatus]: "Histórico suficiente para o status atual",
  [CCR_IDS.concepts.specialistCareAssumed]: "Cuidado específico já assumido",
};

function presence(value: ClinicalFact["presence"]): string {
  if (value === "yes") return "Sim";
  if (value === "no") return "Não";
  if (value === "unknown") return "Desconhecido";
  return "Não aplicável";
}

function factValue(fact: ClinicalFact): string {
  if (fact.presence !== "yes" || !("value" in fact) || fact.value === undefined) return "";
  if (fact.value === "fit") return " - FIT";
  if (fact.value === "colonoscopy") return " - Colonoscopia primária";
  return ` - ${String(fact.value)}`;
}

function renderFact(fact: ClinicalFact): string {
  const label = CONCEPT_LABELS[fact.conceptId] ?? fact.conceptId;
  return `<li><strong>${esc(label)}:</strong> ${esc(presence(fact.presence))}${esc(factValue(fact))}</li>`;
}

function partialDate(date: PartialCalendarDate | undefined): string {
  if (!date) return "Data não informada";
  if (date.precision === "year") return String(date.year);
  if (date.precision === "month") return `${String(date.month).padStart(2, "0")}/${date.year}`;
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
}

function historyTopicLabel(topic: string): string {
  return topic === CCR_IDS.topic ? "Rastreamento colorretal" : topic;
}

function historyValueLabel(value: string): string {
  if (value === "never_performed") return "Nunca realizado (confirmado)";
  if (value === "known") return "Histórico conhecido";
  if (value === "unknown") return "Histórico desconhecido";
  return value;
}

function modality(id: string): string {
  if (id === CCR_IDS.modalities.fit) return "FIT";
  if (id === CCR_IDS.modalities.colonoscopyScreening) return "Colonoscopia de rastreamento";
  if (id === CCR_IDS.modalities.colonoscopyDiagnostic) return "Colonoscopia diagnóstica após FIT positivo";
  if (id === CCR_IDS.modalities.colonoscopy) return "Colonoscopia";
  return id;
}

function examResult(record: ExamRecord): string {
  if (record.status !== "performed") return record.status === "not_performed" ? "Não realizado" : "Status desconhecido";
  if (record.result.status !== "final") {
    if (record.result.status === "pending") return "Pendente";
    if (record.result.status === "invalid") return "Inválido/inconclusivo";
    return "Desconhecido";
  }
  const code = record.result.code;
  if (code === "positive") return "Positivo";
  if (code === "negative") return "Negativo";
  if (code === CCR_IDS.results.colonoscopyNormal) return "Normal";
  if (code === CCR_IDS.results.colonoscopyPolypOrLesion) return "Pólipo/lesão";
  if (code === CCR_IDS.results.colonoscopyCancer) return "Câncer";
  return code;
}

function renderRecords(report: CcrReportModel): string {
  if (report.inputs.records.length === 0)
    return '<p class="muted">Nenhum exame foi utilizado ou considerado pelos tracks determinantes.</p>';
  return `<ul>${report.inputs.records.map(({ record, used }) => {
    const date = record.status === "performed" ? partialDate(record.date) : "-";
    return `<li><strong>${esc(modality(record.modality))}</strong> - ${esc(date)} - ${esc(examResult(record))}${used ? ' <span class="badge">utilizado</span>' : ' <span class="muted">considerado</span>'}</li>`;
  }).join("")}</ul>`;
}

function renderResources(report: CcrReportModel): string {
  const entries = Object.entries(report.inputs.careSettingResources);
  if (entries.length === 0) return "";
  return `<h3>Contexto operacional</h3><ul>${entries.map(([id, value]) => {
    const name = id === CCR_IDS.resources.fit ? "FIT" : id === CCR_IDS.resources.colonoscopy ? "Colonoscopia" : id;
    const label = value === "available" ? "Disponível" : value === "unavailable" ? "Indisponível" : "Desconhecido";
    return `<li><strong>${esc(name)}:</strong> ${esc(label)}</li>`;
  }).join("")}</ul>`;
}

function renderActions(report: CcrReportModel): string {
  if (report.primaryActions.length === 0)
    return '<p class="muted">Nenhuma ação clínica profunda foi promovida como recomendação principal neste relatório.</p>';
  return `<ul>${report.primaryActions.map((action) => `<li><strong>${esc(action.text)}</strong>${action.operational ? `<div>${esc(action.operational.routeLabel)}</div>` : ""}</li>`).join("")}</ul>`;
}

function renderRationale(report: CcrReportModel): string {
  return report.rationale.map((reason) => `<article class="rationale">
    <h3>${esc(reason.trackLabel)}</h3>
    <p>${esc(reason.summary)}</p>
    ${reason.guardrails.length ? `<details><summary>Limites e condições deste caminho</summary><ul>${reason.guardrails.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></details>` : ""}
  </article>`).join("");
}

export function renderCcrReportHtml(report: CcrReportModel): string {
  const boundary = BOUNDARY_COPY[report.boundary.code];
  const facts = report.inputs.factsUsed.length
    ? `<ul>${report.inputs.factsUsed.map(renderFact).join("")}</ul>`
    : '<p class="muted">Nenhum fato clínico adicional precisou ser materialmente utilizado pelos tracks determinantes.</p>';
  const history = Object.entries(report.inputs.historyKnowledge)
    .map(([topic, value]) => `<li><strong>${esc(historyTopicLabel(topic))}:</strong> ${esc(historyValueLabel(value))}</li>`)
    .join("");
  const unresolved = report.unresolvedInformation.length
    ? `<section><h2>Informações não resolvidas</h2><ul>${report.unresolvedInformation.map((value) => `<li>${esc(value)}</li>`).join("")}</ul></section>`
    : "";
  const activatedRules = [...new Set(report.rationale.flatMap((reason) => reason.activatedRuleIds))];

  const bodyHtml = `<div class="warning"><strong>PILOTO LOCAL DE INTEGRAÇÃO.</strong> Este relatório não autoriza uso clínico real, liberação pública ou substituição de julgamento profissional.</div>
<p class="eyebrow">Motor de Rastreio V3</p><h1>Relatório de apoio à decisão - rastreamento de câncer colorretal</h1>
<div class="meta"><div><strong>Referencial:</strong><br>${esc(report.policy.label)}</div><div><strong>Data de referência:</strong><br>${esc(formatReportIsoDate(report.asOf))}</div><div><strong>Ruleset:</strong><br>${esc(report.rulesetVersion)}</div><div><strong>Contrato:</strong><br>${esc(report.contractVersion)}</div></div>
<section class="result"><h2>${esc(boundary.label)}</h2><p>${esc(boundary.message)}</p></section>
<section><h2>Por que o Motor chegou a esta conclusão</h2>${renderRationale(report)}</section>
<section><h2>Próxima ação</h2>${renderActions(report)}</section>
${unresolved}
<section><h2>Dados considerados</h2>${report.inputs.ageYears === undefined ? "" : `<p><strong>Idade:</strong> ${report.inputs.ageYears} anos</p>`}<h3>Fatos clínicos utilizados</h3>${facts}<h3>Conhecimento do histórico</h3>${history ? `<ul>${history}</ul>` : '<p class="muted">Não registrado.</p>'}<h3>Exames relevantes</h3>${renderRecords(report)}${renderResources(report)}</section>
<section><h2>Referências utilizadas nesta conclusão</h2>${renderReportProvenanceHtml(report.provenance)}</section>
<section><h2>Rastreabilidade técnica</h2><p><strong>Boundary:</strong> <code>${esc(report.boundary.code)}</code></p><p><strong>Track(s) determinante(s):</strong> ${report.boundary.triggerTrackIds.map((id) => `<code>${esc(id)}</code>`).join(", ")}</p><p><strong>Regra(s) ativada(s):</strong> ${activatedRules.map((id) => `<code>${esc(id)}</code>`).join(", ") || "-"}</p><p><strong>Release gate:</strong> <code>${esc(report.releaseGate)}</code></p></section>
<footer>Este documento foi gerado localmente a partir da avaliação estruturada e da provenance governada do Motor. As referências derivam de DecisionTrace.sourceRefs e não foram inferidas apenas pelo nome do referencial. O PDF é uma representação do modelo estruturado, não a fonte de verdade clínica.</footer>`;

  return renderPrintableReportDocument({
    title: "Relatório - Motor de Rastreio V3",
    bodyHtml,
  });
}
