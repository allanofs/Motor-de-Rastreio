import { MAMA_IDS } from "../../clinical/mama";
import type { PartialCalendarDate } from "../../model/dates";
import type { ClinicalFact, ExamRecord } from "../../model/patient";
import {
  escapeReportHtml as esc,
  formatReportIsoDate,
  renderPrintableReportDocument,
  renderReportProvenanceHtml,
} from "../reporting";
import type { MamaReportModel } from "./report";

const CONCEPT_LABELS: Record<string, string> = {
  [MAMA_IDS.concepts.screeningContextConfirmed]: "Contexto preventivo",
  [MAMA_IDS.concepts.relevantBreastTissuePresent]: "Tecido mamário relevante",
  [MAMA_IDS.concepts.suspiciousBreastSymptoms]: "Sintoma mamário suspeito",
  [MAMA_IDS.concepts.priorBreastCancer]: "Câncer de mama prévio",
  [MAMA_IDS.concepts.highRiskGeneticContext]: "Contexto genético de alto risco",
  [MAMA_IDS.concepts.knownHighRiskFamilialContext]: "Alto risco familiar já estabelecido",
  [MAMA_IDS.concepts.priorHighRiskChestRadiation]: "Radioterapia torácica prévia de alto risco",
  [MAMA_IDS.concepts.priorHighRiskBreastLesion]: "Lesão mamária prévia de alto risco",
  [MAMA_IDS.concepts.specificBreastCareActive]: "Acompanhamento mamário específico ativo",
  [MAMA_IDS.concepts.historySufficientForCurrentStatus]: "Histórico suficiente para o status atual",
  [MAMA_IDS.concepts.priorMammographyAllowsRoutine]: "Mamografia anterior permite retorno à rotina",
  [MAMA_IDS.concepts.priorMammographyNeedsSpecificAttention]: "Mamografia anterior requer atenção específica",
};

function boundaryCopy(report: MamaReportModel): { label: string; message: string } {
  const code = report.boundary.code;
  if (code === "SHARED_DECISION") {
    if (report.boundary.reasonCode === "insufficient-evidence")
      return {
        label: "Decisão individual",
        message:
          "O referencial considera insuficiente a evidência para uma recomendação populacional automática nesta faixa etária.",
      };
    if (report.boundary.reasonCode === "continuation-conditioned-on-health-horizon")
      return {
        label: "Decisão individual",
        message:
          "A continuidade do rastreamento depende do contexto de saúde e do horizonte de benefício; o Motor não calcula prognóstico nesta versão.",
      };
    return {
      label: "Decisão individual",
      message:
        "O referencial não determina uma recomendação automática neste cenário; riscos, benefícios e preferências precisam ser discutidos.",
    };
  }

  if (code === "SCREENING_NOT_INDICATED") {
    if (report.boundary.reasonCode === "under40-outside-recommendation-scope")
      return {
        label: "Fora do escopo da recomendação",
        message:
          "Neste referencial, a recomendação populacional de risco habitual começa aos 40 anos; não foi inventada uma recomendação formal contra abaixo dessa idade.",
      };
    if (report.boundary.reasonCode === "under40-routine-not-recommended")
      return {
        label: "Rastreamento não indicado",
        message:
          "Neste referencial, mamografia de rastreamento de rotina não é recomendada para este cenário de risco habitual abaixo dos 40 anos.",
      };
  }

  const copy: Record<MamaReportModel["boundary"]["code"], { label: string; message: string }> = {
    ROUTINE_DUE: {
      label: "Rastreamento indicado",
      message:
        "A mamografia de rastreamento está indicada agora segundo o referencial selecionado e o histórico qualificável disponível.",
    },
    ROUTINE_CURRENT: {
      label: "Em dia",
      message:
        "Há mamografia de rastreamento qualificável dentro do intervalo do referencial selecionado.",
    },
    SHARED_DECISION: {
      label: "Decisão individual",
      message: "A próxima etapa depende de decisão individual.",
    },
    MORE_INFORMATION_NEEDED: {
      label: "Próxima informação necessária",
      message: "Falta informação necessária para concluir com segurança.",
    },
    SPECIFIC_ATTENTION_REQUIRED: {
      label: "Atenção específica",
      message:
        "Há uma situação que interrompe o rastreamento de rotina e exige avaliação específica; a investigação subsequente não é automatizada neste módulo.",
    },
    SPECIFIC_CARE_ACTIVE: {
      label: "Em acompanhamento específico",
      message:
        "Já existe cuidado mamário específico ativo; o Motor não reinicia silenciosamente a rotina de rastreamento.",
    },
    SCREENING_NOT_INDICATED: {
      label: "Rastreamento não indicado",
      message:
        "O caminho avaliado não apresenta indicação de rastreamento mamográfico de rotina neste momento.",
    },
    CANNOT_CONCLUDE_SAFELY: {
      label: "Não foi possível concluir com segurança",
      message:
        "A avaliação foi interrompida de forma segura; revise os detalhes técnicos antes de continuar.",
    },
  };
  return copy[code];
}

function presence(value: ClinicalFact["presence"]): string {
  if (value === "yes") return "Sim";
  if (value === "no") return "Não";
  if (value === "unknown") return "Desconhecido";
  return "Não aplicável";
}

function renderFact(fact: ClinicalFact): string {
  const label = CONCEPT_LABELS[fact.conceptId] ?? fact.conceptId;
  return `<li><strong>${esc(label)}:</strong> ${esc(presence(fact.presence))}</li>`;
}

function partialDate(date: PartialCalendarDate | undefined): string {
  if (!date) return "Data não informada";
  if (date.precision === "year") return String(date.year);
  if (date.precision === "month")
    return `${String(date.month).padStart(2, "0")}/${date.year}`;
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
}

function historyValueLabel(value: string): string {
  if (value === "never_performed") return "Nunca realizou (confirmado)";
  if (value === "known") return "Histórico conhecido";
  if (value === "unknown") return "Histórico desconhecido";
  return value;
}

function modality(id: string): string {
  if (id === MAMA_IDS.modalities.mammographyScreening)
    return "Mamografia de rastreamento";
  if (id === MAMA_IDS.modalities.mammographyDiagnostic)
    return "Mamografia diagnóstica";
  return id;
}

function examResult(record: ExamRecord): string {
  if (record.status !== "performed")
    return record.status === "not_performed" ? "Não realizado" : "Status desconhecido";
  if (record.result.status !== "final") {
    if (record.result.status === "pending") return "Pendente";
    if (record.result.status === "invalid") return "Inválido/inconclusivo";
    return "Desconhecido";
  }
  if (record.result.code === MAMA_IDS.results.routineClearing)
    return "Retorno à rotina registrado";
  if (record.result.code === MAMA_IDS.results.attentionRequired)
    return "Atenção específica registrada";
  if (record.result.code === MAMA_IDS.results.indeterminate)
    return "Indeterminado";
  return record.result.code;
}

function renderRecords(report: MamaReportModel): string {
  if (report.inputs.records.length === 0)
    return '<p class="muted">Nenhuma mamografia foi utilizada ou considerada pelos caminhos determinantes.</p>';
  return `<ul>${report.inputs.records
    .map(({ record, used }) => {
      const date = record.status === "performed" ? partialDate(record.date) : "-";
      return `<li><strong>${esc(modality(record.modality))}</strong> - ${esc(date)} - ${esc(examResult(record))}${used ? ' <span class="badge">utilizada</span>' : ' <span class="muted">considerada</span>'}</li>`;
    })
    .join("")}</ul>`;
}

function renderResources(report: MamaReportModel): string {
  const entries = Object.entries(report.inputs.careSettingResources);
  if (entries.length === 0) return "";
  return `<h3>Contexto operacional</h3><ul>${entries
    .map(([id, value]) => {
      const name = id === MAMA_IDS.resources.mammography ? "Mamografia" : id;
      const label =
        value === "available"
          ? "Disponível"
          : value === "unavailable"
            ? "Indisponível"
            : "Desconhecido";
      return `<li><strong>${esc(name)}:</strong> ${esc(label)}</li>`;
    })
    .join("")}</ul>`;
}

function renderActions(report: MamaReportModel): string {
  if (report.primaryActions.length === 0)
    return '<p class="muted">Nenhuma ação profunda foi promovida como recomendação principal neste relatório.</p>';
  return `<ul>${report.primaryActions
    .map(
      (action) =>
        `<li><strong>${esc(action.text)}</strong>${action.operational ? `<div>${esc(action.operational.routeLabel)}</div>` : ""}</li>`,
    )
    .join("")}</ul>`;
}

function renderRationale(report: MamaReportModel): string {
  if (report.rationale.length === 0)
    return '<p class="muted">A conclusão principal foi determinada pelo contexto de decisão governado, não por um único track ativado.</p>';
  return report.rationale
    .map(
      (reason) => `<article class="rationale">
    <h3>${esc(reason.trackLabel)}</h3>
    <p>${esc(reason.summary)}</p>
    ${reason.guardrails.length ? `<details><summary>Limites e condições deste caminho</summary><ul>${reason.guardrails.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></details>` : ""}
  </article>`,
    )
    .join("");
}

function renderDecisionContext(report: MamaReportModel): string {
  if (report.decisionContext === undefined) return "";
  const conclusion =
    report.decisionContext.conclusion === "outside_recommendation_scope"
      ? "Fora do escopo etário da recomendação populacional"
      : "Rastreamento rotineiro não recomendado abaixo de 40 anos";
  return `<article class="rationale">
    <h3>Contexto de decisão etário</h3>
    <p><strong>Conclusão:</strong> ${esc(conclusion)}</p>
    <p>${esc(report.decisionContext.rationale)}</p>
    <details><summary>Guardrails deste fechamento</summary><ul>${report.decisionContext.guardrails.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></details>
  </article>`;
}

export function renderMamaReportHtml(report: MamaReportModel): string {
  const boundary = boundaryCopy(report);
  const facts = report.inputs.factsUsed.length
    ? `<ul>${report.inputs.factsUsed.map(renderFact).join("")}</ul>`
    : '<p class="muted">Nenhum fato clínico adicional precisou ser materialmente utilizado pelos caminhos determinantes.</p>';
  const history = Object.entries(report.inputs.historyKnowledge)
    .map(
      ([topic, value]) =>
        `<li><strong>${esc(topic === MAMA_IDS.topic ? "Rastreamento mamográfico" : topic)}:</strong> ${esc(historyValueLabel(value))}</li>`,
    )
    .join("");
  const unresolved = report.unresolvedInformation.length
    ? `<section><h2>Informações não resolvidas</h2><ul>${report.unresolvedInformation.map((value) => `<li>${esc(value)}</li>`).join("")}</ul></section>`
    : "";
  const activatedRules = [
    ...new Set(report.rationale.flatMap((reason) => reason.activatedRuleIds)),
  ];
  const reasonCode =
    report.boundary.reasonCode === undefined
      ? ""
      : `<p><strong>Razão do Boundary:</strong> <code>${esc(report.boundary.reasonCode)}</code></p>`;

  const bodyHtml = `<div class="warning"><strong>PILOTO LOCAL DE INTEGRAÇÃO.</strong> Este relatório não autoriza uso clínico real, liberação pública ou substituição de julgamento profissional.</div>
<p class="eyebrow">Motor de Rastreio V3</p><h1>Relatório de apoio à decisão - rastreamento de câncer de mama</h1>
<div class="meta"><div><strong>Referencial:</strong><br>${esc(report.policy.label)}</div><div><strong>Data de referência:</strong><br>${esc(formatReportIsoDate(report.asOf))}</div><div><strong>Ruleset:</strong><br>${esc(report.rulesetVersion)}</div><div><strong>Contrato:</strong><br>${esc(report.contractVersion)}</div></div>
<section class="result"><h2>${esc(boundary.label)}</h2><p>${esc(boundary.message)}</p></section>
<section><h2>Por que o Motor chegou a esta conclusão</h2>${renderDecisionContext(report)}${renderRationale(report)}</section>
<section><h2>Próxima ação</h2>${renderActions(report)}</section>
${unresolved}
<section><h2>Dados considerados</h2>${report.inputs.ageYears === undefined ? "" : `<p><strong>Idade:</strong> ${report.inputs.ageYears} anos</p>`}<h3>Fatos clínicos utilizados</h3>${facts}<h3>Conhecimento do histórico</h3>${history ? `<ul>${history}</ul>` : '<p class="muted">Não registrado.</p>'}<h3>Mamografias relevantes</h3>${renderRecords(report)}${renderResources(report)}</section>
<section><h2>Referências utilizadas nesta conclusão</h2>${renderReportProvenanceHtml(report.provenance)}</section>
<section><h2>Rastreabilidade técnica</h2><p><strong>Boundary:</strong> <code>${esc(report.boundary.code)}</code></p>${reasonCode}<p><strong>Carrier de provenance:</strong> <code>${esc(report.boundary.provenanceCarrier)}</code></p><p><strong>Track(s) determinante(s):</strong> ${report.boundary.triggerTrackIds.map((id) => `<code>${esc(id)}</code>`).join(", ") || "-"}</p><p><strong>Regra(s) ativada(s):</strong> ${activatedRules.map((id) => `<code>${esc(id)}</code>`).join(", ") || "-"}</p><p><strong>Release gate:</strong> <code>${esc(report.releaseGate)}</code></p></section>
<footer>Este documento foi gerado localmente a partir da avaliação estruturada e da provenance governada do Motor. Quando o Boundary deriva de tracks, as referências vêm de DecisionTrace.sourceRefs. Quando deriva do fechamento etário M3.1, as referências vêm exclusivamente do DecisionContext revisado. Nenhuma referência foi inferida apenas pelo nome do referencial. O HTML/PDF é uma representação do modelo estruturado, não a fonte de verdade clínica.</footer>`;

  return renderPrintableReportDocument({
    title: "Relatório Mama - Motor de Rastreio V3",
    bodyHtml,
  });
}
