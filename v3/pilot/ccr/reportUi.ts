import {
  buildCcrReportModel,
  evaluateCcrProductDraft,
  renderCcrReportHtml,
} from "../../src/product/ccr";

type Answer = "yes" | "no" | "unknown" | "not_asked";
type Availability = "available" | "unavailable" | "unknown";

type PilotControl = HTMLElement & { value?: string };

type PilotExam = Record<string, unknown> & {
  kind: "fit" | "colonoscopy";
  id: string;
};

let currentReportHtml: string | undefined;

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`Missing pilot element #${id}`);
  return found as T;
}

function controlValue(id: string): string {
  const control = element<PilotControl>(id);
  if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement)
    return control.value;
  return control.querySelector<HTMLInputElement>('input:checked')?.value ?? "";
}

function inputValue(id: string): string {
  return element<HTMLInputElement>(id).value.trim();
}

function optionalNumber(id: string): number | undefined {
  const value = inputValue(id);
  if (value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function visible(id: string): boolean {
  return !element(id).classList.contains("hidden");
}

function readExamControl(card: HTMLElement, field: string): string {
  const control = card.querySelector<PilotControl>(`[data-field="${field}"]`);
  if (!control) return "";
  if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement)
    return control.value;
  return control.querySelector<HTMLInputElement>('input:checked')?.value ?? "";
}

function collectExam(card: HTMLElement): PilotExam | undefined {
  const id = card.dataset.examId;
  if (!id) return undefined;
  const heading = card.querySelector("h3")?.textContent?.trim();
  const kind = heading === "FIT" ? "fit" : heading === "Colonoscopia" ? "colonoscopy" : undefined;
  if (!kind) return undefined;

  const status = readExamControl(card, "status") || "unknown";
  const date = readExamControl(card, "date");
  const result = readExamControl(card, "result") || "unknown";

  if (kind === "fit") {
    return {
      kind,
      id,
      status,
      ...(date ? { date } : {}),
      result,
    };
  }

  return {
    kind,
    id,
    status,
    role: readExamControl(card, "role") || "other_or_unknown",
    ...(date ? { date } : {}),
    result,
    preparation: readExamControl(card, "preparation") || "unknown",
    completeness: readExamControl(card, "completeness") || "unknown",
    resolutionInformation:
      readExamControl(card, "resolutionInformation") || "unknown",
  };
}

function collectExams(): PilotExam[] {
  if (!visible("exam-section")) return [];
  return Array.from(document.querySelectorAll<HTMLElement>("#exam-list .exam-card"))
    .map(collectExam)
    .filter((exam): exam is PilotExam => exam !== undefined);
}

function collectFamilyDetails(): Record<string, unknown> | undefined {
  if (!visible("family-section") || controlValue("family-history") !== "yes")
    return undefined;
  const details: Record<string, unknown> = {};
  const fdr = optionalNumber("family-fdr");
  const sdr = optionalNumber("family-sdr");
  const exactAge = optionalNumber("family-age-years");
  const ageBand = controlValue("family-age-band");
  const finding = controlValue("family-finding");
  if (fdr !== undefined) details.affectedFdrCount = fdr;
  if (sdr !== undefined) details.affectedSdrCount = sdr;
  if (exactAge !== undefined) details.youngestDiagnosisAgeYears = exactAge;
  if (ageBand !== "") details.youngestDiagnosisAgeBand = ageBand;
  if (finding !== "") details.findingType = finding;
  return Object.keys(details).length === 0 ? undefined : details;
}

function collectPilotDraft(): Record<string, unknown> {
  const age = optionalNumber("age");
  const riskVisible = visible("risk-section");
  const familyVisible = visible("family-section");
  const historyVisible = visible("history-section");
  const strategyVisible = visible("strategy-section");
  const familyDetails = collectFamilyDetails();
  const careSetting: Record<string, Availability> = {};

  if (!element("availability-fit-wrap").classList.contains("hidden")) {
    const fit = controlValue("availability-fit");
    if (fit !== "") careSetting.fit = fit as Availability;
  }
  if (!element("availability-colonoscopy-wrap").classList.contains("hidden")) {
    const colonoscopy = controlValue("availability-colonoscopy");
    if (colonoscopy !== "") careSetting.colonoscopy = colonoscopy as Availability;
  }

  return {
    policyId: controlValue("policy"),
    asOf: inputValue("as-of"),
    ...(age === undefined ? {} : { ageYears: age }),
    screeningContext: controlValue("screening-context") as Answer,
    priorCrc: (riskVisible ? controlValue("prior-crc") : "not_asked") as Answer,
    priorPolypSurveillance: (riskVisible
      ? controlValue("prior-polyp-surveillance")
      : "not_asked") as Answer,
    colonicIbd: (riskVisible ? controlValue("colonic-ibd") : "not_asked") as Answer,
    hereditarySyndrome: (riskVisible
      ? controlValue("hereditary-syndrome")
      : "not_asked") as Answer,
    familyHistory: (familyVisible
      ? controlValue("family-history")
      : "not_asked") as Answer,
    ...(familyDetails === undefined ? {} : { familyDetails }),
    historyKnowledge: historyVisible
      ? controlValue("history-knowledge")
      : "not_asked",
    historySufficientForCurrentStatus:
      historyVisible && !element("history-sufficient-wrap").classList.contains("hidden")
        ? controlValue("history-sufficient")
        : "not_asked",
    strategySelection: strategyVisible ? controlValue("strategy") : "unselected",
    specialistCareAssumed: (!element("specialist-care-wrap").classList.contains("hidden")
      ? controlValue("specialist-care")
      : "not_asked") as Answer,
    exams: collectExams(),
    careSetting,
  };
}

function ensureExportControls(): {
  container: HTMLDivElement;
  button: HTMLButtonElement;
  status: HTMLParagraphElement;
} {
  const existing = document.getElementById("report-export");
  if (existing) {
    return {
      container: existing as HTMLDivElement,
      button: element<HTMLButtonElement>("export-report"),
      status: element<HTMLParagraphElement>("report-export-status"),
    };
  }

  const container = document.createElement("div");
  container.id = "report-export";
  container.className = "inline-actions hidden";
  const button = document.createElement("button");
  button.id = "export-report";
  button.type = "button";
  button.className = "secondary";
  button.textContent = "Exportar relatório";
  const status = document.createElement("p");
  status.id = "report-export-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  container.append(button, status);
  element("clinical-overview").after(container);
  return { container, button, status };
}

const exportControls = ensureExportControls();

function clearExportState(): void {
  currentReportHtml = undefined;
  exportControls.container.classList.add("hidden");
  exportControls.status.textContent = "";
}

function refreshExportState(): void {
  clearExportState();
  if (element("result-state").classList.contains("hidden")) return;

  const draft = collectPilotDraft();
  const evaluated = evaluateCcrProductDraft(draft);
  if (!evaluated.ok) return;
  const built = buildCcrReportModel(draft, evaluated);
  if (!built.ok) return;

  currentReportHtml = renderCcrReportHtml(built.report);
  exportControls.container.classList.remove("hidden");
}

function openPrintableReport(): void {
  if (!currentReportHtml) return;
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    exportControls.status.textContent =
      "O navegador bloqueou a nova aba. Permita pop-ups para abrir o relatório.";
    return;
  }
  reportWindow.opener = null;
  reportWindow.document.open();
  reportWindow.document.write(currentReportHtml);
  reportWindow.document.close();
  reportWindow.document
    .getElementById("print-report")
    ?.addEventListener("click", () => reportWindow.print());
  reportWindow.focus();
  exportControls.status.textContent =
    "Relatório aberto localmente em nova aba. Use “Imprimir / salvar como PDF”.";
}

exportControls.button.addEventListener("click", openPrintableReport);

const form = element<HTMLFormElement>("screening-form");
form.addEventListener("input", clearExportState);
form.addEventListener("change", clearExportState);
form.addEventListener("reset", clearExportState);
form.addEventListener("submit", () => queueMicrotask(refreshExportState));
element("clear-form").addEventListener("click", clearExportState);
