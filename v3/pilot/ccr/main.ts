import {
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
  presentCcrProduct,
  type CcrPresentationCard,
  type CcrRequestedInput,
} from "../../src/product/ccr";
import { collectCcrPilotDraft } from "./pilotDraft";

type FitUiExam = {
  kind: "fit";
  id: string;
  status: "performed" | "not_performed" | "unknown";
  date?: string;
  result?: "positive" | "negative" | "pending" | "invalid" | "unknown";
};

type ColonoscopyUiExam = {
  kind: "colonoscopy";
  id: string;
  status: "performed" | "not_performed" | "unknown";
  role: "screening" | "post_fit_positive" | "other_or_unknown";
  date?: string;
  result?: "normal" | "polyp_or_lesion" | "cancer" | "pending" | "unknown";
  preparation?: "adequate" | "inadequate" | "unknown";
  completeness?: "complete" | "incomplete" | "unknown";
  resolutionInformation?: "sufficient" | "insufficient" | "unknown";
};

type UiExam = FitUiExam | ColonoscopyUiExam;

const HARD_RISK_IDS = [
  "prior-crc",
  "prior-polyp-surveillance",
  "colonic-ibd",
  "hereditary-syndrome",
] as const;

const exams: UiExam[] = [];
const requestedInputs = new Set<CcrRequestedInput>();
let nextExamId = 1;
let editingStep: string | undefined;
let examsReviewed = false;
let explicitEditing = false;

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`Missing pilot element #${id}`);
  return found as T;
}

function selectValue(id: string): string {
  return element<HTMLSelectElement>(id).value;
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

function option(value: string, text: string): HTMLOptionElement {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = text;
  return item;
}

function answerSelect(id: string, labelText: string): HTMLElement {
  const label = document.createElement("label");
  label.textContent = labelText;
  const select = document.createElement("select");
  select.id = id;
  select.append(
    option("not_asked", "Selecione…"),
    option("no", "Não"),
    option("yes", "Sim"),
    option("unknown", "Incerto / não sei"),
  );
  label.append(select);
  return label;
}

/** A presentation-only replacement: option values remain unchanged. */
function makeChoices(select: HTMLSelectElement): void {
  const label = select.parentElement;
  if (label?.tagName !== "LABEL") return;
  const group = document.createElement("fieldset");
  group.id = select.id;
  group.className = "choice-group";
  for (const [key, value] of Object.entries(select.dataset)) group.dataset[key] = value;
  const legend = document.createElement("legend");
  legend.textContent = Array.from(label.childNodes)
    .filter(node => node !== select).map(node => node.textContent).join("").trim();
  group.append(legend);
  const initial = select.value;
  const choices = document.createElement("div");
  choices.className = "choice-options";
  for (const item of Array.from(select.options)) {
    if (["", "not_asked", "unselected"].includes(item.value)) continue;
    const choice = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = select.id || `${select.dataset.examId}-${select.dataset.field}`;
    radio.value = item.value;
    radio.checked = item.value === initial;
    const text = document.createElement("span");
    text.textContent = item.textContent;
    choice.append(radio, text);
    choices.append(choice);
  }
  group.append(choices);
  // The existing draft collector reads semantic values; it never reads display labels.
  Object.defineProperty(group, "value", {
    get: () => group.querySelector<HTMLInputElement>("input:checked")?.value
      ?? (Array.from(select.options).some(item => item.value === "not_asked") ? "not_asked" : initial),
    set: (value: string) => group.querySelectorAll<HTMLInputElement>("input").forEach(radio => { radio.checked = radio.value === value; }),
  });
  const wrap = document.createElement("div");
  wrap.id = label.id;
  wrap.className = label.className;
  wrap.append(group);
  label.replaceWith(wrap);
}

function initializeChoices(): void {
  for (const id of ["screening-context", ...HARD_RISK_IDS, "specialist-care", "family-history", "history-sufficient", "strategy", "availability-fit", "availability-colonoscopy"]) {
    makeChoices(element<HTMLSelectElement>(id));
  }
}

function focusControl(control: HTMLElement | undefined): void {
  if (!control) return;
  (control.querySelector<HTMLElement>("input:checked")
    ?? control.querySelector<HTMLElement>("input, select, button") ?? control).focus();
}

function initializeRiskFields(): void {
  const container = element<HTMLDivElement>("risk-fields");
  container.replaceChildren(
    answerSelect("prior-crc", "Câncer colorretal prévio?"),
    answerSelect(
      "prior-polyp-surveillance",
      "Pólipo/adenoma prévio que exige vigilância?",
    ),
    answerSelect("colonic-ibd", "Doença inflamatória intestinal colônica relevante?"),
    answerSelect(
      "hereditary-syndrome",
      "Síndrome hereditária CCR/polipose conhecida ou suspeita?",
    ),
  );
}

function initializePolicies(): void {
  const policySelect = element<HTMLSelectElement>("policy");
  for (const policy of getCcrProductPolicyOptions()) {
    policySelect.append(option(policy.policyId, policy.label));
  }
}

function selectedPolicy() {
  const selected = selectValue("policy");
  return getCcrProductPolicyOptions().find((policy) => policy.policyId === selected);
}

function selectedPolicyFamily(): string | undefined {
  return selectedPolicy()?.family;
}

function setSectionVisible(id: string, visible: boolean): void {
  const section = element<HTMLElement>(id);
  section.classList.toggle("hidden", !visible);
  section.setAttribute("aria-hidden", String(!visible));
}

function baselineComplete(): boolean {
  return (
    selectValue("policy") !== "" &&
    inputValue("as-of") !== "" &&
    optionalNumber("age") !== undefined
  );
}

function hardRiskPositive(): boolean {
  return HARD_RISK_IDS.some((id) => selectValue(id) === "yes");
}

function allHardRisksAnswered(): boolean {
  return HARD_RISK_IDS.every((id) => selectValue(id) !== "not_asked");
}

function familyDetailsReady(): boolean {
  if (selectValue("family-history") !== "yes") return true;
  return (
    optionalNumber("family-fdr") !== undefined &&
    optionalNumber("family-sdr") !== undefined &&
    selectValue("family-age-band") !== "" &&
    selectValue("family-finding") !== ""
  );
}

function canEvaluateCurrentPath(): boolean {
  if (!baselineComplete()) return false;
  const context = selectValue("screening-context");
  if (context === "not_asked") return false;
  if (context !== "yes") return true;
  if (!allHardRisksAnswered()) return false;
  if (hardRiskPositive()) return true;
  const family = selectValue("family-history");
  if (family === "not_asked") return false;
  if (!familyDetailsReady()) return false;
  return selectValue("history-knowledge") !== "not_asked";
}

function clearAdaptiveInputs(): void {
  requestedInputs.clear();
  element<HTMLSelectElement>("strategy").value = "unselected";
  element<HTMLSelectElement>("availability-fit").value = "";
  element<HTMLSelectElement>("availability-colonoscopy").value = "";
}

function updateJourneyPanel(): void {
  const title = element("journey-title");
  const next = element("journey-next");
  const list = element<HTMLUListElement>("journey-summary");
  const eligible = STEP_IDS.filter(id => !element(id).classList.contains("hidden"));
  const current = editingStep ?? eligible.find(id => !stepComplete(id));
  list.replaceChildren(...eligible.filter(id => stepComplete(id)).map(id => {
    const item = document.createElement("li"); item.textContent = stepSummary(id); return item;
  }));
  const prompts: Record<string, string> = {
    "reference-section": "Escolha o referencial, a data de referência e informe a idade.",
    "context-section": "Confirme se esta avaliação é de rastreamento preventivo.",
    "risk-section": "Informe as condições que mudam a rota de cuidado.",
    "family-section": "Informe a história familiar e os detalhes solicitados, se houver.",
    "history-section": "Informe o conhecimento do histórico e a suficiência dos dados conhecidos.",
    "exam-section": "Registre somente exames conhecidos. Ao terminar, conclua o registro de exames.",
    "strategy-section": "Selecione a estratégia solicitada pelo Motor e atualize a avaliação.",
    "availability-section": "Confirme somente a disponibilidade do recurso solicitado pelo Motor.",
  };
  title.textContent = current === "strategy-section" ? "Escolha necessária"
    : current === "availability-section" ? "Disponibilidade de recurso necessária"
    : current ? "Próxima informação necessária" : "Pronto para avaliar";
  next.textContent = current ? prompts[current] ?? "Revise os dados desta etapa."
    : "Atualize a avaliação para obter a orientação do Motor com os dados informados.";
}

function updateProgressiveDisclosure(): void {
  const baseline = baselineComplete();
  const context = selectValue("screening-context");
  const riskPositive = context === "yes" && hardRiskPositive();
  const risksDone = context === "yes" && allHardRisksAnswered();
  const family = selectValue("family-history");
  const familyReady = family !== "not_asked" && familyDetailsReady();
  const historyVisible = risksDone && !riskPositive && familyReady;
  const historyKnown =
    historyVisible && selectValue("history-knowledge") === "known";

  setSectionVisible("context-section", baseline);
  setSectionVisible("risk-section", baseline && context === "yes");
  element("specialist-care-wrap").classList.toggle("hidden", !riskPositive);
  setSectionVisible("family-section", risksDone && !riskPositive);

  const familyBox = element<HTMLDivElement>("family-details");
  const familyYes = risksDone && !riskPositive && family === "yes";
  familyBox.classList.toggle("hidden", !familyYes);
  familyBox.setAttribute("aria-hidden", String(!familyYes));

  setSectionVisible("history-section", historyVisible);
  element("history-sufficient-wrap").classList.toggle("hidden", !historyKnown);
  setSectionVisible("exam-section", historyKnown);

  const strategyAllowed = selectedPolicyFamily() !== "sus_oficial";
  const strategyVisible =
    strategyAllowed &&
    (requestedInputs.has("strategy_selection") ||
      selectValue("strategy") !== "unselected");
  setSectionVisible("strategy-section", strategyVisible);
  if (!strategyAllowed)
    element<HTMLSelectElement>("strategy").value = "unselected";

  const fitAvailabilityVisible =
    requestedInputs.has("fit_availability") ||
    selectValue("availability-fit") !== "";
  const colonoscopyAvailabilityVisible =
    requestedInputs.has("colonoscopy_availability") ||
    selectValue("availability-colonoscopy") !== "";
  element("availability-fit-wrap").classList.toggle(
    "hidden",
    !fitAvailabilityVisible,
  );
  element("availability-colonoscopy-wrap").classList.toggle(
    "hidden",
    !colonoscopyAvailabilityVisible,
  );
  setSectionVisible(
    "availability-section",
    fitAvailabilityVisible || colonoscopyAvailabilityVisible,
  );

  element("form-actions").classList.toggle("hidden", !canEvaluateCurrentPath());
  element<HTMLButtonElement>("evaluate-button").textContent =
    requestedInputs.size > 0 ? "Atualizar avaliação" : "Avaliar rastreamento";
  updateJourneyPanel();
  updateGuidedInterview();
}

const STEP_IDS = ["reference-section", "context-section", "risk-section", "family-section", "history-section", "exam-section", "strategy-section", "availability-section"] as const;

function stepComplete(id: string): boolean {
  // Completion of input acquisition only, never a clinical conclusion.
  switch (id) {
    case "reference-section": return baselineComplete();
    case "context-section": return selectValue("screening-context") !== "not_asked";
    case "risk-section": return allHardRisksAnswered() && (!hardRiskPositive() || selectValue("specialist-care") !== "not_asked");
    case "family-section": return selectValue("family-history") !== "not_asked" && familyDetailsReady();
    case "history-section": return selectValue("history-knowledge") !== "not_asked" && (selectValue("history-knowledge") !== "known" || selectValue("history-sufficient") !== "not_asked");
    case "exam-section": return examsReviewed;
    case "strategy-section": return selectValue("strategy") !== "unselected";
    case "availability-section": return ["availability-fit", "availability-colonoscopy"].every(field => element(`${field}-wrap`).classList.contains("hidden") || selectValue(field) !== "");
    default: return false;
  }
}

function stepSummary(id: string): string {
  const selectedText = (field: string) => {
    const control = element<HTMLElement>(field);
    if (control instanceof HTMLSelectElement) return control.selectedOptions[0]?.textContent ?? "";
    return control.querySelector<HTMLInputElement>("input:checked")?.parentElement?.textContent?.trim() ?? "";
  };
  switch (id) {
    case "reference-section": return `${selectedPolicy()?.label ?? ""} · ${inputValue("age")} anos · ${inputValue("as-of").split("-").reverse().join("/")}`;
    case "context-section": return selectedText("screening-context");
    case "risk-section": return HARD_RISK_IDS.map((field, index) => `${["Câncer prévio", "Pólipos", "Doença inflamatória", "Síndrome hereditária"][index]}: ${selectedText(field)}`).join(" · ");
    case "family-section": return `${selectedText("family-history")}${selectValue("family-history") === "yes" ? ` · 1º grau: ${inputValue("family-fdr")} · 2º grau: ${inputValue("family-sdr")} · ${selectedText("family-age-band")} · ${selectedText("family-finding")}` : ""}`;
    case "history-section": return `${selectedText("history-knowledge")}${selectValue("history-knowledge") === "known" ? ` · Suficiência: ${selectedText("history-sufficient")}` : ""}`;
    case "exam-section": return `${exams.length} exame(s) registrado(s)`;
    case "strategy-section": return selectedText("strategy");
    case "availability-section": return ["availability-fit", "availability-colonoscopy"].filter(field => !element(`${field}-wrap`).classList.contains("hidden")).map(field => `${field === "availability-fit" ? "FIT" : "Colonoscopia"}: ${selectedText(field)}`).join(" · ");
    default: return "";
  }
}

function initializeGuidedInterview(): void {
  for (const id of STEP_IDS) {
    const section = element(id);
    const heading = section.querySelector<HTMLElement>(".section-heading")!;
    const body = document.createElement("div"); body.className = "step-body"; body.id = `${id}-body`;
    for (const child of Array.from(section.children)) if (child !== heading) body.append(child);
    const summary = document.createElement("p"); summary.className = "step-summary";
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "edit-step";
    edit.textContent = "Editar"; edit.setAttribute("aria-controls", body.id);
    edit.setAttribute("aria-label", `Editar ${heading.querySelector("h2")?.textContent}`);
    edit.addEventListener("click", () => {
      editingStep = id; explicitEditing = true; updateGuidedInterview(); updateJourneyPanel();
      focusControl(body.querySelector<HTMLElement>("fieldset, select, input, button") ?? undefined);
    });
    const finishEdit = document.createElement("button");
    finishEdit.type = "button"; finishEdit.className = "secondary finish-edit";
    finishEdit.textContent = "Concluir edição"; finishEdit.hidden = true;
    finishEdit.addEventListener("click", () => {
      explicitEditing = false; editingStep = undefined;
      updateProgressiveDisclosure();
      const activeBody = document.querySelector<HTMLElement>(".step-current .step-body");
      if (activeBody) focusControl(activeBody.querySelector<HTMLElement>("fieldset, select, input, button") ?? undefined);
      else element("evaluate-button").focus();
    });
    body.append(finishEdit);
    heading.append(edit); section.append(summary, body);
  }
  const done = document.createElement("button"); done.type = "button"; done.className = "secondary";
  done.id = "finish-exams"; done.textContent = "Concluir registro de exames";
  done.addEventListener("click", () => { examsReviewed = true; editingStep = undefined; updateGuidedInterview(); updateJourneyPanel(); element("evaluate-button").focus(); });
  element("exam-section-body").append(done);
}

function updateGuidedInterview(): void {
  const eligible = STEP_IDS.filter(id => !element(id).classList.contains("hidden"));
  if (editingStep && !eligible.includes(editingStep as typeof STEP_IDS[number])) editingStep = undefined;
  const current = editingStep ?? eligible.find(id => !stepComplete(id));
  let reachedCurrent = false;
  let focusedContentClosed = false;
  for (const id of STEP_IDS) {
    const section = element(id);
    const active = id === current;
    const complete = stepComplete(id);
    const future = !active && (reachedCurrent || (!complete && current !== undefined));
    section.classList.toggle("guided-future", future);
    section.classList.toggle("step-current", active);
    section.classList.toggle("step-complete", complete && !active);
    const body = section.querySelector<HTMLElement>(".step-body")!;
    if (!active && body.contains(document.activeElement)) focusedContentClosed = true;
    body.hidden = !active;
    const summary = section.querySelector<HTMLElement>(".step-summary")!;
    summary.hidden = active || !complete; summary.textContent = complete ? stepSummary(id) : "";
    const edit = section.querySelector<HTMLButtonElement>(".edit-step")!;
    section.querySelector<HTMLButtonElement>(".finish-edit")!.hidden = !(active && explicitEditing);
    edit.hidden = active || !complete; edit.setAttribute("aria-expanded", String(active));
    const marker = section.querySelector<HTMLElement>(".step")!;
    marker.textContent = complete && !active ? "✓" : "→";
    if (active) section.setAttribute("aria-current", "step");
    else section.removeAttribute("aria-current");
    if (active) reachedCurrent = true;
  }
  if (focusedContentClosed) {
    if (current) focusControl(element(`${current}-body`).querySelector<HTMLElement>("fieldset, select, input, button") ?? undefined);
    else if (!element("form-actions").classList.contains("hidden")) element("evaluate-button").focus();
  }
}

function makeFitExam(): FitUiExam {
  return {
    kind: "fit",
    id: `ui-fit-${nextExamId++}`,
    status: "performed",
    result: "unknown",
  };
}

function makeColonoscopyExam(): ColonoscopyUiExam {
  return {
    kind: "colonoscopy",
    id: `ui-colonoscopy-${nextExamId++}`,
    status: "performed",
    role: "other_or_unknown",
    result: "unknown",
    preparation: "unknown",
    completeness: "unknown",
    resolutionInformation: "unknown",
  };
}

function selectHtml(
  field: string,
  examId: string,
  current: string,
  options: readonly [string, string][],
): string {
  const html = options
    .map(
      ([value, label]) =>
        `<option value="${value}"${value === current ? " selected" : ""}>${label}</option>`,
    )
    .join("");
  return `<select data-exam-id="${examId}" data-field="${field}">${html}</select>`;
}

function renderExamList(): void {
  const list = element<HTMLDivElement>("exam-list");
  list.replaceChildren();

  for (const exam of exams) {
    const card = document.createElement("article");
    card.className = "exam-card";
    card.dataset.examId = exam.id;

    if (exam.kind === "fit") {
      card.innerHTML = `
        <header><h3>FIT</h3><button type="button" class="danger" data-remove="${exam.id}">Remover</button></header>
        <div class="exam-fields">
          <label>Status ${selectHtml("status", exam.id, exam.status, [["performed","Realizado"],["not_performed","Não realizado"],["unknown","Desconhecido"]])}</label>
          <label>Data/precisão <input data-exam-id="${exam.id}" data-field="date" type="text" placeholder="AAAA, AAAA-MM ou AAAA-MM-DD" /></label>
          <label>Resultado ${selectHtml("result", exam.id, exam.result ?? "unknown", [["unknown","Desconhecido"],["pending","Pendente"],["invalid","Inválido/inconclusivo"],["negative","Negativo"],["positive","Positivo"]])}</label>
        </div>`;
    } else {
      card.innerHTML = `
        <header><h3>Colonoscopia</h3><button type="button" class="danger" data-remove="${exam.id}">Remover</button></header>
        <div class="exam-fields">
          <label>Status ${selectHtml("status", exam.id, exam.status, [["performed","Realizada"],["not_performed","Não realizada"],["unknown","Desconhecido"]])}</label>
          <label>Papel ${selectHtml("role", exam.id, exam.role, [["other_or_unknown","Outro / desconhecido"],["screening","Rastreamento primário"],["post_fit_positive","Diagnóstica após FIT positivo"]])}</label>
          <label>Data/precisão <input data-exam-id="${exam.id}" data-field="date" type="text" placeholder="AAAA, AAAA-MM ou AAAA-MM-DD" /></label>
          <label>Resultado ${selectHtml("result", exam.id, exam.result ?? "unknown", [["unknown","Desconhecido"],["pending","Pendente"],["normal","Normal"],["polyp_or_lesion","Pólipo / lesão"],["cancer","Câncer"]])}</label>
          <label>Preparo ${selectHtml("preparation", exam.id, exam.preparation ?? "unknown", [["unknown","Desconhecido"],["adequate","Adequado"],["inadequate","Inadequado"]])}</label>
          <label>Exame completo? ${selectHtml("completeness", exam.id, exam.completeness ?? "unknown", [["unknown","Desconhecido"],["complete","Completo"],["incomplete","Incompleto"]])}</label>
          <label>Informação suficiente para resolução? ${selectHtml("resolutionInformation", exam.id, exam.resolutionInformation ?? "unknown", [["unknown","Desconhecido"],["sufficient","Suficiente"],["insufficient","Insuficiente"]])}</label>
        </div>`;
    }

    const dateInput = card.querySelector<HTMLInputElement>(
      'input[data-field="date"]',
    );
    if (dateInput !== null) dateInput.value = exam.date ?? "";
    card.querySelectorAll<HTMLSelectElement>('select[data-field="status"], select[data-field="preparation"], select[data-field="completeness"], select[data-field="resolutionInformation"]').forEach(makeChoices);
    updateExamDisclosure(card, exam);
    list.append(card);
  }

  list
    .querySelectorAll<HTMLButtonElement>("button[data-remove]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.remove;
        const index = exams.findIndex((exam) => exam.id === id);
        if (index >= 0) exams.splice(index, 1);
        renderExamList();
        clearAdaptiveInputs();
        invalidateResults(false);
        updateProgressiveDisclosure();
        const remaining = list.querySelectorAll<HTMLButtonElement>(
          "button[data-remove]",
        );
        (remaining[Math.min(index, remaining.length - 1)] ?? element("add-fit")).focus();
      });
    });

  list
    .querySelectorAll<HTMLElement & { value: string }>(
      "[data-exam-id][data-field]",
    )
    .forEach((control) => {
      const saveExam = () => {
        const id = control.dataset.examId;
        const field = control.dataset.field;
        const exam = exams.find((candidate) => candidate.id === id);
        if (exam === undefined || field === undefined) return;
        const value = control.value;
        if (field === "date") {
          if (value === "") delete exam.date;
          else exam.date = value;
        } else {
          Object.assign(exam, { [field]: value });
          if (field === "status")
            updateExamDisclosure(control.closest("article")!, exam);
        }
      };
      control.addEventListener("input", saveExam);
      control.addEventListener("change", saveExam);
    });
}

function updateExamDisclosure(card: HTMLElement, exam: UiExam): void {
  card.querySelectorAll<HTMLElement>("[data-field]").forEach((control) => {
    if (control.dataset.field === "status") return;
    control
      .closest(".exam-fields > label, .exam-fields > div")
      ?.classList.toggle("hidden", exam.status !== "performed");
  });
}

function invalidateResults(clearRequests = true): void {
  const hadOutput =
    !element("result-state").classList.contains("hidden") ||
    !element("error-state").classList.contains("hidden");
  if (clearRequests) requestedInputs.clear();
  clearResults();
  if (hadOutput) element("clinical-overview").replaceChildren();
  if (hadOutput)
    element("result-notice").textContent =
      "Dados alterados. Avalie novamente para atualizar o resultado.";
}

function clearResults(): void {
  element("clinical-overview").replaceChildren();
  element("result-sections").replaceChildren();
  element("empty-state").classList.remove("hidden");
  element("error-state").classList.add("hidden");
  element("result-state").classList.add("hidden");
  element("followup-request").classList.add("hidden");
}

function showError(title: string, issues: string[]): void {
  element("empty-state").classList.add("hidden");
  element("result-state").classList.add("hidden");
  element("followup-request").classList.add("hidden");
  const target = element<HTMLDivElement>("error-state");
  target.classList.remove("hidden");
  target.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = title;
  const list = document.createElement("ul");
  for (const issue of issues) {
    const item = document.createElement("li");
    item.textContent = issue;
    list.append(item);
  }
  const explanation = document.createElement("p");
  explanation.textContent = "Verifique os dados informados antes de tentar novamente.";
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Detalhes técnicos do erro";
  details.append(summary, list);
  target.append(heading, explanation, details);
}

function renderAction(card: CcrPresentationCard, container: HTMLElement): void {
  for (const action of card.actions) {
    const box = document.createElement("div");
    box.className = "action-box";
    const kind = document.createElement("span");
    kind.className = "action-kind";
    kind.textContent = action.kind;
    const text = document.createElement("div");
    text.textContent = action.text;
    box.append(kind, text);
    if (action.operational !== undefined) {
      const operational = document.createElement("div");
      operational.className = "operational-note";
      operational.textContent = action.operational.routeLabel;
      box.append(operational);
    }
    container.append(box);
  }
}

function renderAudit(card: CcrPresentationCard, container: HTMLElement): void {
  const items = [
    ...card.missingData.map((value) => `Falta: ${value}`),
    ...card.guardrails.map((value) => `Guardrail: ${value}`),
    ...card.sourceIds.map((value) => `Fonte: ${value}`),
  ];
  if (items.length === 0) return;
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Auditoria e segurança";
  const list = document.createElement("ul");
  list.className = "audit-list";
  for (const value of items) {
    const item = document.createElement("li");
    item.textContent = value;
    list.append(item);
  }
  details.append(summary, list);
  container.append(details);
}

function renderCard(card: CcrPresentationCard): HTMLElement {
  const article = document.createElement("article");
  article.className = "result-card";
  article.dataset.status = card.status;

  const top = document.createElement("div");
  top.className = "card-topline";
  const heading = document.createElement("h3");
  heading.textContent = card.trackLabel;
  const pill = document.createElement("span");
  pill.className = "status-pill";
  pill.textContent = card.statusLabel;
  top.append(heading, pill);

  const summary = document.createElement("p");
  summary.textContent = card.summary;
  article.append(top, summary);
  renderAction(card, article);
  renderAudit(card, article);
  return article;
}

function renderOverview(model: ReturnType<typeof presentCcrProduct>): void {
  const target = element("clinical-overview");
  target.replaceChildren();
  const cards = model.sections.flatMap(section => section.cards);
  const title = document.createElement("h2");
  const message = document.createElement("p");

  // Pending human/resource inputs stay above the final automation boundary.
  if (model.requestedInputs.includes("strategy_selection")) {
    title.textContent = "Escolha necessária";
    message.textContent = "Selecione a estratégia solicitada para continuar a avaliação.";
  } else if (model.requestedInputs.length > 0) {
    title.textContent = "Disponibilidade de recurso necessária";
    message.textContent = model.requestedInputs.includes("fit_availability")
      ? "Precisamos confirmar a disponibilidade do FIT."
      : "Precisamos confirmar a disponibilidade da colonoscopia.";
  } else {
    switch (model.automationBoundary.code) {
      case "CANNOT_CONCLUDE_SAFELY":
        title.textContent = "Não foi possível concluir com segurança";
        message.textContent = "Confira os detalhes técnicos antes de continuar.";
        break;
      case "SPECIFIC_ATTENTION_REQUIRED":
        title.textContent = "Atenção específica";
        message.textContent = "Há uma situação que precisa ser resolvida antes de retornar ao rastreamento de rotina. O rastreamento de rotina fica suspenso neste momento.";
        break;
      case "SPECIFIC_CARE_ACTIVE":
        title.textContent = "Em acompanhamento específico";
        message.textContent = "Este caminho já saiu do rastreamento de rotina e está sob cuidado específico.";
        break;
      case "MORE_INFORMATION_NEEDED":
        title.textContent = "Próxima informação necessária";
        message.textContent = "Faltam informações para concluir com segurança esta avaliação.";
        break;
      case "SHARED_DECISION":
        title.textContent = "Decisão individual";
        message.textContent = "A próxima etapa exige discussão e escolha humana; o Motor não escolhe a modalidade autonomamente.";
        break;
      case "ROUTINE_DUE":
        title.textContent = "Rastreamento indicado";
        message.textContent = "Há uma ação de rastreamento indicada neste referencial.";
        break;
      case "ROUTINE_CURRENT":
        title.textContent = "Em dia";
        message.textContent = "O rastreamento está em dia com base no histórico qualificável disponível.";
        break;
      case "SCREENING_NOT_INDICATED":
        title.textContent = "Rastreamento não indicado";
        message.textContent = "Não há nova ação de rastreamento de rotina indicada neste referencial para os caminhos avaliados.";
        break;
    }
  }
  target.append(title, message);

  const statuses = document.createElement("ul");
  const labels = new Set(cards.map(card => card.statusLabel));
  // Internal states remain available as a secondary audit view.
  for (const label of labels) {
    const item = document.createElement("li"); item.textContent = label; statuses.append(item);
  }
  const statusDetails = document.createElement("details");
  const statusSummary = document.createElement("summary");
  statusSummary.textContent = "Estados de acompanhamento";
  statusDetails.append(statusSummary, statuses);
  target.append(statusDetails);

  const showPrimaryActions = model.requestedInputs.length > 0 ||
    model.automationBoundary.code === "ROUTINE_DUE" ||
    model.automationBoundary.code === "SHARED_DECISION";
  if (!showPrimaryActions) return;

  const seen = new Set<string>();
  for (const card of cards) {
    const actions = card.actions.filter(action => {
      const key = JSON.stringify([action.actionId, action.text, action.operational]);
      if (seen.has(key)) return false; seen.add(key); return true;
    });
    // Clinical text is transported verbatim only when the boundary allows it on the primary surface.
    for (const action of actions) {
      const box = document.createElement("div"); box.className = "primary-guidance";
      const text = document.createElement("p"); text.textContent = action.text; box.append(text);
      if (action.operational) {
        const route = document.createElement("p"); route.textContent = action.operational.routeLabel; box.append(route);
      }
      target.append(box);
    }
  }
}

function firstRequestedControl(): HTMLElement | undefined {
  if (requestedInputs.has("strategy_selection")) return element("strategy");
  if (requestedInputs.has("fit_availability")) return element("availability-fit");
  if (requestedInputs.has("colonoscopy_availability"))
    return element("availability-colonoscopy");
  return undefined;
}

function renderFollowupRequest(): void {
  const target = element<HTMLDivElement>("followup-request");
  target.replaceChildren();
  if (requestedInputs.size === 0) {
    target.classList.add("hidden");
    return;
  }

  target.classList.remove("hidden");
  const title = document.createElement("strong");
  const text = document.createElement("p");
  if (requestedInputs.has("strategy_selection")) {
    title.textContent = "Escolha necessária: estratégia";
    text.textContent =
      "O Motor não escolhe a modalidade autonomamente. Registre a escolha humana e atualize a avaliação.";
  } else {
    title.textContent =
      "Disponibilidade de recurso necessária";
    text.textContent =
      "A indicação clínica já foi calculada. Informe apenas a disponibilidade solicitada para definir a rota operacional.";
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.textContent = "Responder agora";
  button.addEventListener("click", () => {
    const control = firstRequestedControl();
    control?.scrollIntoView({ behavior: "smooth", block: "center" });
    const section = control?.closest<HTMLElement>(".form-section");
    if (section) editingStep = section.id;
    updateGuidedInterview();
    focusControl(control);
  });
  target.append(title, text, button);
}

function renderSuccess(
  evaluated: Extract<ReturnType<typeof evaluateCcrProductDraft>, { ok: true }>,
): void {
  const model = presentCcrProduct(evaluated);
  requestedInputs.clear();
  for (const request of model.requestedInputs) requestedInputs.add(request);
  updateProgressiveDisclosure();

  element("empty-state").classList.add("hidden");
  element("error-state").classList.add("hidden");
  element("result-state").classList.remove("hidden");
  element("result-policy").textContent = model.policy.label;
  element("result-version").textContent = model.rulesetVersion;
  element("ruleset-version").textContent = model.rulesetVersion;
  renderFollowupRequest();
  renderOverview(model);

  const target = element<HTMLDivElement>("result-sections");
  target.replaceChildren();
  for (const section of model.sections) {
    if (section.cards.length === 0) continue;
    const wrapper = document.createElement("section");
    wrapper.className = "result-section";
    const heading = document.createElement("h2");
    heading.textContent = section.label;
    wrapper.append(heading, ...section.cards.map(renderCard));
    target.append(wrapper);
  }
}

function evaluateForm(event: SubmitEvent): void {
  event.preventDefault();
  // Enter during acquisition is a request to advance, not a clinical failure.
  if (!canEvaluateCurrentPath()) {
    invalidateResults(false);
    updateProgressiveDisclosure();
    const current = document.querySelector<HTMLElement>(".step-current .step-body");
    if (current) focusControl(current.querySelector<HTMLElement>("fieldset, select, input, button") ?? undefined);
    return;
  }
  const result = evaluateCcrProductDraft(collectCcrPilotDraft());
  if (!result.ok) {
    requestedInputs.clear();
    updateProgressiveDisclosure();
    if ("issues" in result)
      showError("Revise os dados de entrada", result.issues);
    else showError("Avaliação interrompida com segurança", [result.message]);
    element("result-panel").focus();
    return;
  }
  examsReviewed = true;
  explicitEditing = false;
  editingStep = undefined;
  renderSuccess(result);
  element("result-notice").textContent =
    requestedInputs.size > 0
      ? "Avaliação calculada. Há uma próxima informação solicitada abaixo."
      : "Avaliação atualizada.";
  element("result-panel").focus();
}

function resetPilot(): void {
  element<HTMLFormElement>("screening-form").reset();
  element("screening-form").querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => { radio.checked = false; });
  exams.splice(0, exams.length);
  requestedInputs.clear();
  nextExamId = 1;
  examsReviewed = false;
  explicitEditing = false;
  editingStep = undefined;
  renderExamList();
  clearResults();
  element("result-notice").textContent =
    "Formulário limpo. Comece pelo referencial.";
  element("ruleset-version").textContent = "crc-0.5.9-phase6-h1-active";
  updateProgressiveDisclosure();
  element("policy").focus();
}

initializeRiskFields();
initializePolicies();
initializeChoices();
initializeGuidedInterview();
renderExamList();
element("ruleset-version").textContent = "crc-0.5.9-phase6-h1-active";
updateProgressiveDisclosure();

element<HTMLButtonElement>("add-fit").addEventListener("click", () => {
  editingStep = "exam-section";
  examsReviewed = false;
  exams.push(makeFitExam());
  renderExamList();
  clearAdaptiveInputs();
  invalidateResults(false);
  updateProgressiveDisclosure();
  focusControl(element("exam-list").lastElementChild?.querySelector<HTMLElement>("fieldset, select") ?? undefined);
});
element<HTMLButtonElement>("add-colonoscopy").addEventListener("click", () => {
  editingStep = "exam-section";
  examsReviewed = false;
  exams.push(makeColonoscopyExam());
  renderExamList();
  clearAdaptiveInputs();
  invalidateResults(false);
  updateProgressiveDisclosure();
  focusControl(element("exam-list").lastElementChild?.querySelector<HTMLElement>("fieldset, select") ?? undefined);
});
element<HTMLButtonElement>("clear-form").addEventListener("click", resetPilot);
element<HTMLFormElement>("screening-form").addEventListener("submit", evaluateForm);

const form = element<HTMLFormElement>("screening-form");
function handleMutation(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest("#exam-section")) examsReviewed = false;
  const adaptive = target.closest("#strategy-section, #availability-section");
  if (adaptive === null) clearAdaptiveInputs();
  else if (target.closest("#strategy-section") !== null) {
    element<HTMLSelectElement>("availability-fit").value = "";
    element<HTMLSelectElement>("availability-colonoscopy").value = "";
  }
  const section = target.closest<HTMLElement>(".form-section");
  if (section) editingStep = section.id;
  if (!explicitEditing && event.type === "change" && section && stepComplete(section.id)) editingStep = undefined;
  invalidateResults(false);
  updateProgressiveDisclosure();
}
form.addEventListener("input", handleMutation);
form.addEventListener("change", handleMutation);
