import {
  buildMamaReportModel,
  evaluateMamaProductDraft,
  renderMamaReportHtml,
} from "../../src/product/mama";
import { collectMamaPilotDraft } from "./pilotDraft";

let currentReportHtml: string | undefined;

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`Missing Mama pilot element #${id}`);
  return found as T;
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
  container.className = "form-actions hidden";

  const button = document.createElement("button");
  button.id = "export-report";
  button.type = "button";
  button.className = "secondary";
  button.textContent = "Exportar relatório";

  const status = document.createElement("p");
  status.id = "report-export-status";
  status.className = "helper";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  container.append(button, status);
  element("result-region").after(container);
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
  if (element("result-region").classList.contains("hidden")) return;

  const draft = collectMamaPilotDraft();
  const evaluated = evaluateMamaProductDraft(draft);
  if (!evaluated.ok) return;

  const built = buildMamaReportModel(draft, evaluated);
  if (!built.ok) return;

  currentReportHtml = renderMamaReportHtml(built.report);
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
form.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLButtonElement) clearExportState();
});
form.addEventListener("submit", () => queueMicrotask(refreshExportState));
element("clear-form").addEventListener("click", clearExportState);
