const STEP_IDS = [
  "reference-section",
  "context-section",
  "risk-section",
  "family-section",
  "history-section",
  "exam-section",
  "strategy-section",
  "availability-section",
] as const;

let syncing = false;
let initialized = false;

function element<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function controlValue(id: string): string {
  const control = element<HTMLElement>(id);
  if (!control) return "";
  if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement)
    return control.value;
  return control.querySelector<HTMLInputElement>('input:checked')?.value ?? "";
}

function controlText(id: string): string {
  const control = element<HTMLElement>(id);
  if (!control) return "";
  if (control instanceof HTMLSelectElement)
    return control.selectedOptions[0]?.textContent?.trim() ?? "";
  return control.querySelector<HTMLInputElement>('input:checked')
    ?.closest("label")?.textContent?.trim() ?? "";
}

function inputValue(id: string): string {
  return element<HTMLInputElement>(id)?.value.trim() ?? "";
}

function formatDate(value: string): string {
  return value ? value.split("-").reverse().join("/") : "";
}

function setTextIfChanged(target: HTMLElement | null, text: string): void {
  if (target && target.textContent !== text) target.textContent = text;
}

function humanStepSummary(id: string): string {
  switch (id) {
    case "reference-section": {
      const policy = controlText("policy");
      const age = inputValue("age");
      const date = formatDate(inputValue("as-of"));
      return [policy, age ? `${age} anos` : "", date].filter(Boolean).join(" · ");
    }
    case "context-section": {
      const value = controlValue("screening-context");
      if (value === "yes") return "Rastreamento preventivo confirmado";
      if (value === "no") return "Avaliação fora do contexto preventivo";
      if (value === "unknown") return "Contexto preventivo não confirmado";
      return "";
    }
    case "risk-section": {
      const values = ["prior-crc", "prior-polyp-surveillance", "colonic-ibd", "hereditary-syndrome"].map(controlValue);
      if (values.every(value => value === "no")) return "Nenhuma condição que mude a rota identificada";
      if (values.some(value => value === "yes")) return "Condição que muda a rota identificada";
      if (values.some(value => value === "unknown")) return "Condições avaliadas com informação incompleta";
      return "";
    }
    case "family-section": {
      const value = controlValue("family-history");
      if (value === "no") return "História familiar relevante não relatada";
      if (value === "unknown") return "História familiar desconhecida";
      if (value === "yes") {
        const parts = ["História familiar positiva"];
        const fdr = inputValue("family-fdr");
        const sdr = inputValue("family-sdr");
        const ageBand = controlText("family-age-band");
        const finding = controlText("family-finding");
        if (fdr) parts.push(`${fdr} de 1º grau`);
        if (sdr) parts.push(`${sdr} de 2º grau`);
        if (ageBand && ageBand !== "Não informado") parts.push(ageBand);
        if (finding && finding !== "Não informado") parts.push(finding);
        return parts.join(" · ");
      }
      return "";
    }
    case "history-section": {
      const knowledge = controlValue("history-knowledge");
      if (knowledge === "never_performed") return "Nunca realizou rastreamento (confirmado)";
      if (knowledge === "unknown") return "Histórico de rastreamento desconhecido";
      if (knowledge === "known") {
        const sufficiency = controlValue("history-sufficient");
        if (sufficiency === "yes") return "Histórico disponível e suficiente";
        if (sufficiency === "no") return "Histórico disponível, mas insuficiente";
        if (sufficiency === "unknown") return "Histórico disponível com suficiência desconhecida";
        return "Histórico disponível";
      }
      return "";
    }
    case "exam-section": {
      const count = document.querySelectorAll("#exam-list .exam-card").length;
      if (count === 0) return "Nenhum exame conhecido registrado";
      return `${count} ${count === 1 ? "exame conhecido registrado" : "exames conhecidos registrados"}`;
    }
    case "strategy-section": {
      const value = controlValue("strategy");
      if (value === "fit") return "Estratégia escolhida: FIT";
      if (value === "colonoscopy") return "Estratégia escolhida: colonoscopia";
      return "";
    }
    case "availability-section": {
      const parts: string[] = [];
      const fitWrap = element("availability-fit-wrap");
      const colonoscopyWrap = element("availability-colonoscopy-wrap");
      if (fitWrap && !fitWrap.classList.contains("hidden"))
        parts.push(`FIT: ${controlText("availability-fit")}`);
      if (colonoscopyWrap && !colonoscopyWrap.classList.contains("hidden"))
        parts.push(`Colonoscopia: ${controlText("availability-colonoscopy")}`);
      return parts.join(" · ");
    }
    default:
      return "";
  }
}

function journeySummary(id: string): string {
  switch (id) {
    case "reference-section":
      return "Referencial e pessoa definidos";
    case "context-section":
    case "risk-section":
    case "family-section":
    case "history-section":
    case "exam-section":
    case "strategy-section":
    case "availability-section":
      return humanStepSummary(id);
    default:
      return "";
  }
}

function syncChoiceLabels(): void {
  const userUnknownFields = [
    "screening-context",
    "prior-crc",
    "prior-polyp-surveillance",
    "colonic-ibd",
    "hereditary-syndrome",
    "specialist-care",
    "family-history",
    "history-sufficient",
  ];
  for (const id of userUnknownFields) {
    const radio = document.querySelector<HTMLInputElement>(`#${id} input[value="unknown"]`);
    const label = radio?.closest("label")?.querySelector("span");
    if (label) setTextIfChanged(label, "Não sei");
  }
}

function syncStepSummaries(): void {
  for (const id of STEP_IDS) {
    const section = element<HTMLElement>(id);
    if (!section?.classList.contains("step-complete")) continue;
    setTextIfChanged(section.querySelector<HTMLElement>(".step-summary"), humanStepSummary(id));
  }
}

function syncJourneyPanel(): void {
  const list = element<HTMLUListElement>("journey-summary");
  if (!list) return;
  const summaries = STEP_IDS
    .filter(id => element(id)?.classList.contains("step-complete"))
    .map(journeySummary)
    .filter(Boolean);
  const current = Array.from(list.children).map(item => item.textContent ?? "");
  if (JSON.stringify(current) !== JSON.stringify(summaries)) {
    list.replaceChildren(...summaries.map(text => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }));
  }
  const heading = list.previousElementSibling;
  if (heading instanceof HTMLElement && heading.tagName === "H3")
    heading.hidden = summaries.length === 0;

  const title = element("journey-title");
  if (summaries.length === 0 && element("reference-section")?.classList.contains("step-current"))
    setTextIfChanged(title, "Comece pelo referencial");
}

function syncClinicalCopy(): void {
  const overview = element("clinical-overview");
  if (!overview) return;
  const title = overview.querySelector("h2");
  const message = title?.nextElementSibling;
  if (title?.textContent === "Revisão clínica necessária" && message instanceof HTMLParagraphElement) {
    const suffix = message.textContent?.includes("informações pendentes")
      ? " Há também informações pendentes; consulte os detalhes."
      : "";
    setTextIfChanged(
      message,
      `O Motor não consegue apresentar uma orientação automática segura com as informações e o referencial atuais.${suffix}`,
    );
  }
  for (const summary of overview.querySelectorAll("details > summary")) {
    if (summary.textContent === "Estados de acompanhamento")
      summary.textContent = "Ver orientações disponíveis";
  }
}

function syncHero(): void {
  const reference = element("reference-section");
  const started = Boolean(reference?.classList.contains("step-complete")) ||
    Boolean(document.querySelector(".step-current:not(#reference-section)"));
  document.body.classList.toggle("journey-started", started);
}

function examSummary(card: HTMLElement): string {
  const title = card.querySelector("h3")?.textContent?.trim() ?? "Exame";
  const status = card.querySelector<HTMLElement>('[data-field="status"]');
  const statusText = status instanceof HTMLSelectElement
    ? status.selectedOptions[0]?.textContent?.trim()
    : status?.querySelector<HTMLInputElement>('input:checked')?.closest("label")?.textContent?.trim();
  const date = card.querySelector<HTMLInputElement>('input[data-field="date"]')?.value.trim();
  const result = card.querySelector<HTMLSelectElement>('select[data-field="result"]')?.selectedOptions[0]?.textContent?.trim();
  return [title, statusText, date, result && result !== "Desconhecido" ? result : ""]
    .filter(Boolean).join(" · ");
}

function ensureExamCompact(card: HTMLElement): void {
  let compact = card.querySelector<HTMLElement>(".exam-compact");
  if (!compact) {
    compact = document.createElement("div");
    compact.className = "exam-compact";
    const text = document.createElement("p");
    text.className = "exam-compact-summary";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "exam-edit secondary";
    edit.textContent = "Editar exame";
    edit.addEventListener("click", () => {
      card.classList.remove("exam-card-collapsed");
      syncExamCards();
      const control = card.querySelector<HTMLElement>("input, select, fieldset input");
      control?.focus();
    });
    compact.append(text, edit);
    card.querySelector("header")?.after(compact);
  }
  setTextIfChanged(compact.querySelector<HTMLElement>(".exam-compact-summary"), examSummary(card));
  compact.hidden = !card.classList.contains("exam-card-collapsed");
}

function syncExamCards(): void {
  document.querySelectorAll<HTMLElement>("#exam-list .exam-card").forEach(ensureExamCompact);
}

function collapseExistingExamCards(): void {
  document.querySelectorAll<HTMLElement>("#exam-list .exam-card").forEach(card => {
    card.classList.add("exam-card-collapsed");
    ensureExamCompact(card);
  });
}

function syncPolish(): void {
  if (syncing) return;
  syncing = true;
  try {
    syncChoiceLabels();
    syncStepSummaries();
    syncJourneyPanel();
    syncClinicalCopy();
    syncHero();
    syncExamCards();
  } finally {
    syncing = false;
  }
}

function initialize(): void {
  if (initialized || !document.querySelector(".step-summary")) return;
  initialized = true;

  document.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("#exam-section .edit-step"))
      queueMicrotask(() => { collapseExistingExamCards(); syncPolish(); });
    if (target.closest("#add-fit, #add-colonoscopy"))
      queueMicrotask(() => {
        document.querySelector<HTMLElement>("#exam-list .exam-card:last-child")?.classList.remove("exam-card-collapsed");
        syncPolish();
      });
    queueMicrotask(syncPolish);
  });
  document.addEventListener("input", () => queueMicrotask(syncPolish));
  document.addEventListener("change", () => queueMicrotask(syncPolish));
  document.addEventListener("submit", () => queueMicrotask(syncPolish));

  const observer = new MutationObserver(() => queueMicrotask(syncPolish));
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
  syncPolish();
}

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", () => queueMicrotask(initialize), { once: true });
else queueMicrotask(initialize);

const bootObserver = new MutationObserver(() => {
  if (!initialized && document.querySelector(".step-summary")) initialize();
  if (initialized) bootObserver.disconnect();
});
bootObserver.observe(document.documentElement, { childList: true, subtree: true });
