import {
  evaluateMamaProductDraft,
  getMamaProductPolicyOptions,
  presentMamaProduct,
  type MamaPresentationModel,
} from "../../src/product/mama";
import { collectMamaPilotDraft } from "./pilotDraft";
import {
  mamaPilotMammographies,
  type MamaUiMammography,
} from "./pilotMammographyState";

const SAFETY_QUESTIONS = [
  ["suspicious-symptoms", "Há sintoma mamário suspeito ou que esteja motivando investigação?"],
  ["prior-breast-cancer", "Há diagnóstico prévio de câncer de mama?"],
  ["high-risk-genetic", "Há síndrome ou variante genética de alto risco já conhecida?"],
  [
    "known-high-risk-familial",
    "Já houve classificação formal de alto risco familiar para câncer de mama?",
  ],
  [
    "high-risk-chest-radiation",
    "Há histórico conhecido de radioterapia torácica considerada de alto risco?",
  ],
  ["high-risk-lesion", "Há lesão mamária prévia já classificada como de alto risco?"],
  ["specific-care-active", "Já existe acompanhamento mamário específico ativo?"],
] as const;

const STEP_IDS = [
  "reference-section",
  "context-section",
  "safety-section",
  "history-section",
  "exam-section",
  "availability-section",
] as const;

type StepId = (typeof STEP_IDS)[number];

let nextMammographyId = 1;
let mammographiesReviewed = false;
let editingStep: StepId | undefined;
let latestPresentation: MamaPresentationModel | undefined;

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`Missing Mama pilot element #${id}`);
  return found as T;
}

function semanticValue(id: string): string {
  const node = element<HTMLElement & { value?: string }>(id);
  if (typeof node.value === "string") return node.value;
  return node.querySelector<HTMLInputElement>("input:checked")?.value ?? "";
}

function inputValue(id: string): string {
  return element<HTMLInputElement>(id).value.trim();
}

function optionalNumber(id: string): number | undefined {
  const raw = inputValue(id);
  if (raw === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function option(value: string, label: string): HTMLOptionElement {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function answerFieldset(id: string, question: string, helper?: string): HTMLFieldSetElement {
  const group = document.createElement("fieldset");
  group.id = id;
  group.className = "choice-group";
  const legend = document.createElement("legend");
  legend.textContent = question;
  group.append(legend);
  if (helper !== undefined) {
    const note = document.createElement("p");
    note.className = "helper";
    note.textContent = helper;
    group.append(note);
  }
  const choices = document.createElement("div");
  choices.className = "choice-options";
  for (const [value, label] of [
    ["yes", "Sim"],
    ["no", "Não"],
    ["unknown", "Não sei"],
  ] as const) {
    const choice = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = id;
    radio.value = value;
    const text = document.createElement("span");
    text.textContent = label;
    choice.append(radio, text);
    choices.append(choice);
  }
  group.append(choices);
  return group;
}

function initializeSafetyQuestions(): void {
  const container = element("safety-questions");
  container.replaceChildren(
    ...SAFETY_QUESTIONS.map(([id, question]) =>
      answerFieldset(
        id,
        question,
        id === "known-high-risk-familial"
          ? "Responda “Sim” apenas se esse alto risco já tiver sido estabelecido externamente. O Motor não calcula risco familiar nesta versão."
          : undefined,
      ),
    ),
  );
}

function initializePolicies(): void {
  const policy = element<HTMLSelectElement>("policy");
  for (const item of getMamaProductPolicyOptions())
    policy.append(option(item.policyId, item.label));
}

function setSectionVisible(id: StepId, visible: boolean): void {
  const section = element(id);
  section.classList.toggle("hidden", !visible);
  section.setAttribute("aria-hidden", String(!visible));
}

function sectionVisible(id: StepId): boolean {
  return !element(id).classList.contains("hidden");
}

function baselineComplete(): boolean {
  return (
    semanticValue("policy") !== "" &&
    inputValue("as-of") !== "" &&
    optionalNumber("age") !== undefined
  );
}

function contextComplete(): boolean {
  return (
    semanticValue("screening-context") !== "" &&
    semanticValue("relevant-breast-tissue") !== ""
  );
}

function safetyComplete(): boolean {
  return SAFETY_QUESTIONS.every(([id]) => semanticValue(id) !== "");
}

function historyDetailsComplete(): boolean {
  return (
    semanticValue("history-sufficient") !== "" &&
    semanticValue("prior-mammography-allows-routine") !== "" &&
    semanticValue("prior-mammography-needs-attention") !== ""
  );
}

function historyComplete(): boolean {
  const knowledge = semanticValue("history-knowledge");
  if (knowledge === "") return false;
  return knowledge !== "known" || historyDetailsComplete();
}

function availabilityComplete(): boolean {
  return semanticValue("mammography-availability") !== "";
}

function stepComplete(id: StepId): boolean {
  switch (id) {
    case "reference-section":
      return baselineComplete();
    case "context-section":
      return contextComplete();
    case "safety-section":
      return safetyComplete();
    case "history-section":
      return historyComplete();
    case "exam-section":
      return mammographiesReviewed;
    case "availability-section":
      return availabilityComplete();
  }
}

function radioLabel(id: string): string {
  return (
    element(id).querySelector<HTMLInputElement>("input:checked")?.parentElement
      ?.textContent?.trim() ?? ""
  );
}

function stepSummary(id: StepId): string {
  switch (id) {
    case "reference-section": {
      const policy = element<HTMLSelectElement>("policy");
      return `${policy.selectedOptions[0]?.textContent ?? ""} · ${inputValue("age")} anos · ${inputValue("as-of").split("-").reverse().join("/")}`;
    }
    case "context-section":
      return `Rastreamento: ${radioLabel("screening-context")} · Tecido mamário relevante: ${radioLabel("relevant-breast-tissue")}`;
    case "safety-section": {
      const positives = SAFETY_QUESTIONS.filter(([id]) => semanticValue(id) === "yes");
      const unknowns = SAFETY_QUESTIONS.filter(([id]) => semanticValue(id) === "unknown");
      if (positives.length > 0) return `${positives.length} situação(ões) marcada(s) como presente(s)`;
      if (unknowns.length > 0) return `${unknowns.length} resposta(s) “não sei”`;
      return "Nenhuma situação marcada como presente";
    }
    case "history-section": {
      const knowledge = semanticValue("history-knowledge");
      if (knowledge !== "known") return radioLabel("history-knowledge");
      return `Histórico conhecido · Suficiência: ${radioLabel("history-sufficient")}`;
    }
    case "exam-section":
      return `${mamaPilotMammographies.length} mamografia(s) registrada(s)`;
    case "availability-section":
      return radioLabel("mammography-availability");
  }
}

function initializeGuidedCards(): void {
  for (const id of STEP_IDS) {
    const section = element(id);
    const heading = section.querySelector<HTMLElement>(".section-heading");
    if (heading === null) continue;
    const body = document.createElement("div");
    body.className = "step-content";
    body.id = `${id}-content`;
    for (const child of Array.from(section.children))
      if (child !== heading) body.append(child);
    const summary = document.createElement("p");
    summary.className = "step-summary helper";
    summary.hidden = true;
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "secondary edit-step";
    edit.hidden = true;
    edit.addEventListener("click", () => {
      editingStep = editingStep === id ? undefined : id;
      updateJourney();
      if (editingStep === id)
        body.querySelector<HTMLElement>("input, select, button")?.focus();
    });
    heading.append(edit);
    section.append(summary, body);
  }
}

function updateGuidedCards(current: StepId | undefined): void {
  for (const id of STEP_IDS) {
    const section = element(id);
    if (!sectionVisible(id)) continue;
    const complete = stepComplete(id);
    const active = editingStep === id || (editingStep === undefined && current === id);
    const body = section.querySelector<HTMLElement>(".step-content");
    const summary = section.querySelector<HTMLElement>(".step-summary");
    const edit = section.querySelector<HTMLButtonElement>(".edit-step");
    if (body === null || summary === null || edit === null) continue;
    body.hidden = complete && !active;
    summary.hidden = !complete || active;
    summary.textContent = complete ? stepSummary(id) : "";
    edit.hidden = !complete;
    edit.textContent = editingStep === id ? "Concluir edição" : "Editar";
    edit.setAttribute("aria-expanded", String(active));
    section.classList.toggle("step-complete", complete && !active);
    if (active) section.setAttribute("aria-current", "step");
    else section.removeAttribute("aria-current");
  }
}

function clearError(): void {
  const error = element("error-state");
  error.classList.add("hidden");
  error.textContent = "";
}

function showError(messages: string[]): void {
  const error = element("error-state");
  error.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = "Revise os dados informados.";
  const list = document.createElement("ul");
  for (const message of messages) {
    const item = document.createElement("li");
    item.textContent = message;
    list.append(item);
  }
  error.append(title, list);
  error.classList.remove("hidden");
}

function evaluateCurrentDraft(): MamaPresentationModel | undefined {
  clearError();
  const result = evaluateMamaProductDraft(collectMamaPilotDraft());
  if (!result.ok) {
    if ("stage" in result) showError(result.issues);
    else showError([result.message]);
    return undefined;
  }
  return presentMamaProduct(result);
}

function clearResult(): void {
  latestPresentation = undefined;
  element("result-region").classList.add("hidden");
  element("result-title").textContent = "";
  element("result-detail").textContent = "";
  element("followup-request").textContent = "";
  element("result-actions").replaceChildren();
  element("technical-content").replaceChildren();
}

function renderPresentation(model: MamaPresentationModel): void {
  latestPresentation = model;
  element("result-title").textContent = model.surface.title;
  element("result-detail").textContent = model.surface.detail;
  element("followup-request").textContent = model.requestedInputs.includes(
    "mammography_availability",
  )
    ? "Para operacionalizar a mamografia indicada, informe a disponibilidade local."
    : "";

  const actionsContainer = element("result-actions");
  actionsContainer.replaceChildren();
  const seenActions = new Set<string>();
  for (const action of model.sections.flatMap((section) =>
    section.cards.flatMap((card) => card.actions),
  )) {
    if (seenActions.has(action.actionId)) continue;
    seenActions.add(action.actionId);
    const box = document.createElement("div");
    box.className = "action-box";
    const text = document.createElement("p");
    text.textContent = action.text;
    box.append(text);
    if (action.operational !== undefined) {
      const note = document.createElement("small");
      note.textContent = action.operational.routeLabel;
      box.append(note);
    }
    actionsContainer.append(box);
  }

  const technical = element("technical-content");
  technical.replaceChildren();
  for (const section of model.sections.filter((item) => item.cards.length > 0)) {
    const sectionNode = document.createElement("section");
    sectionNode.className = "technical-section";
    const heading = document.createElement("h3");
    heading.textContent = section.label;
    sectionNode.append(heading);
    for (const card of section.cards) {
      const cardNode = document.createElement("article");
      cardNode.className = "technical-card";
      cardNode.dataset.status = card.status;
      const cardHeading = document.createElement("h4");
      cardHeading.textContent = `${card.trackLabel} — ${card.statusLabel}`;
      const summary = document.createElement("p");
      summary.textContent = card.summary;
      cardNode.append(cardHeading, summary);
      if (card.missingData.length > 0) {
        const missing = document.createElement("p");
        missing.textContent = `Dados faltantes: ${card.missingData.join(", ")}`;
        cardNode.append(missing);
      }
      if (card.sourceIds.length > 0) {
        const sources = document.createElement("p");
        sources.textContent = `Fontes rastreáveis: ${card.sourceIds.join(", ")}`;
        cardNode.append(sources);
      }
      sectionNode.append(cardNode);
    }
    technical.append(sectionNode);
  }

  element("result-region").classList.remove("hidden");
}

function setChoiceGroupVisible(id: string, visible: boolean): void {
  const node = element(id);
  node.classList.toggle("hidden", !visible);
  node.setAttribute("aria-hidden", String(!visible));
}

function currentAcquisitionStep(): StepId | undefined {
  return STEP_IDS.find((id) => sectionVisible(id) && !stepComplete(id));
}

function setJourneyStatus(current: StepId | undefined): void {
  for (const id of STEP_IDS) {
    const item = document.querySelector<HTMLElement>(`[data-journey-step="${id}"]`);
    if (item === null) continue;
    item.classList.toggle("hidden", !sectionVisible(id));
    item.classList.toggle("current", id === current);
    item.classList.toggle("complete", sectionVisible(id) && stepComplete(id));
  }

  const prompts: Record<StepId, string> = {
    "reference-section": "Escolha o referencial, a data e informe a idade.",
    "context-section": "Confirme o contexto preventivo e a anatomia relevante.",
    "safety-section": "Responda às situações que podem retirar da rotina.",
    "history-section": "Informe o que é conhecido sobre mamografias anteriores.",
    "exam-section": "Registre mamografias conhecidas e conclua o histórico.",
    "availability-section": "Informe somente a disponibilidade do recurso solicitado.",
  };
  element("journey-title").textContent = current
    ? "Próxima informação necessária"
    : latestPresentation
      ? "Avaliação atualizada"
      : "Comece pelo contexto";
  element("journey-next").textContent = current
    ? prompts[current]
    : latestPresentation?.surface.detail ??
      "Escolha o referencial, a data e informe a idade.";
}

function updateProgressiveDisclosure(): void {
  const baseline = baselineComplete();
  setSectionVisible("context-section", baseline);
  setSectionVisible("safety-section", false);
  setSectionVisible("history-section", false);
  setSectionVisible("exam-section", false);
  setSectionVisible("availability-section", false);
  setChoiceGroupVisible("history-detail-wrap", false);
  element("form-actions").classList.add("hidden");

  if (!baseline || !contextComplete()) {
    clearResult();
    updateGuidedCards(currentAcquisitionStep());
    setJourneyStatus(currentAcquisitionStep());
    return;
  }

  let presentation = evaluateCurrentDraft();
  if (presentation === undefined) {
    clearResult();
    updateGuidedCards(currentAcquisitionStep());
    setJourneyStatus(currentAcquisitionStep());
    return;
  }
  renderPresentation(presentation);

  if (presentation.automationBoundary.code === "MORE_INFORMATION_NEEDED") {
    setSectionVisible("safety-section", true);
  }

  if (sectionVisible("safety-section") && safetyComplete()) {
    presentation = evaluateCurrentDraft();
    if (presentation !== undefined) renderPresentation(presentation);
    if (presentation?.automationBoundary.code === "MORE_INFORMATION_NEEDED")
      setSectionVisible("history-section", true);
  }

  if (sectionVisible("history-section")) {
    const historyKnowledge = semanticValue("history-knowledge");
    const known = historyKnowledge === "known";
    setChoiceGroupVisible("history-detail-wrap", known);

    if (historyComplete()) {
      presentation = evaluateCurrentDraft();
      if (presentation !== undefined) renderPresentation(presentation);
      if (
        known &&
        presentation?.automationBoundary.code === "MORE_INFORMATION_NEEDED"
      )
        setSectionVisible("exam-section", true);
    }
  }

  if (sectionVisible("exam-section") && mammographiesReviewed) {
    presentation = evaluateCurrentDraft();
    if (presentation !== undefined) renderPresentation(presentation);
  }

  if (
    latestPresentation?.requestedInputs.includes("mammography_availability") ===
    true
  ) {
    setSectionVisible("availability-section", true);
    if (availabilityComplete()) {
      presentation = evaluateCurrentDraft();
      if (presentation !== undefined) renderPresentation(presentation);
    }
  }

  const canExplicitlyUpdate =
    sectionVisible("availability-section")
      ? availabilityComplete()
      : sectionVisible("exam-section")
        ? mammographiesReviewed
        : sectionVisible("history-section")
          ? historyComplete()
          : sectionVisible("safety-section")
            ? safetyComplete()
            : contextComplete();
  element("form-actions").classList.toggle("hidden", !canExplicitlyUpdate);

  const current = currentAcquisitionStep();
  updateGuidedCards(current);
  setJourneyStatus(current);
}

function createSelect(
  current: string,
  choices: readonly (readonly [string, string])[],
): HTMLSelectElement {
  const select = document.createElement("select");
  for (const [value, label] of choices) {
    const item = option(value, label);
    item.selected = value === current;
    select.append(item);
  }
  return select;
}

function updateMammographyFromControl(
  mammography: MamaUiMammography,
  field: keyof MamaUiMammography,
  value: string,
): void {
  if (field === "date") {
    if (value === "") delete mammography.date;
    else mammography.date = value;
    return;
  }
  Object.assign(mammography, { [field]: value });
}

function renderMammographies(): void {
  const list = element("mammography-list");
  list.replaceChildren();

  for (const mammography of mamaPilotMammographies) {
    const card = document.createElement("article");
    card.className = "exam-card";
    card.dataset.mammographyId = mammography.id;

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent =
      mammography.role === "screening"
        ? "Mamografia de rastreamento"
        : "Mamografia diagnóstica";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "Remover";
    remove.addEventListener("click", () => {
      const index = mamaPilotMammographies.findIndex(
        (item) => item.id === mammography.id,
      );
      if (index >= 0) mamaPilotMammographies.splice(index, 1);
      mammographiesReviewed = false;
      renderMammographies();
      updateJourney();
    });
    header.append(title, remove);

    const fields = document.createElement("div");
    fields.className = "exam-fields";
    const definitions: Array<{
      label: string;
      field: keyof MamaUiMammography;
      control: HTMLInputElement | HTMLSelectElement;
    }> = [];

    const role = createSelect(mammography.role, [
      ["screening", "Rastreamento"],
      ["diagnostic", "Diagnóstica"],
    ]);
    definitions.push({ label: "Papel do exame", field: "role", control: role });

    const date = document.createElement("input");
    date.type = "text";
    date.placeholder = "AAAA, AAAA-MM ou AAAA-MM-DD";
    date.value = mammography.date ?? "";
    definitions.push({ label: "Data / precisão conhecida", field: "date", control: date });

    const disposition = createSelect(mammography.disposition, [
      ["unknown", "Desconhecido"],
      ["routine_return", "Permitiu retorno à rotina"],
      ["specific_attention", "Exige atenção específica"],
      ["indeterminate", "Indeterminado"],
      ["pending", "Pendente"],
    ]);
    definitions.push({ label: "Disposição conhecida", field: "disposition", control: disposition });

    const quality = createSelect(mammography.quality, [
      ["unknown", "Desconhecida"],
      ["adequate", "Adequada"],
      ["inadequate", "Inadequada"],
    ]);
    definitions.push({ label: "Qualidade", field: "quality", control: quality });

    const completeness = createSelect(mammography.completeness, [
      ["unknown", "Desconhecida"],
      ["complete", "Completa"],
      ["incomplete", "Incompleta"],
    ]);
    definitions.push({ label: "Completude", field: "completeness", control: completeness });

    const resolution = createSelect(mammography.resolutionInformation, [
      ["unknown", "Desconhecida"],
      ["sufficient", "Suficiente"],
      ["insufficient", "Insuficiente"],
    ]);
    definitions.push({
      label: "Informação suficiente para resolução",
      field: "resolutionInformation",
      control: resolution,
    });

    for (const definition of definitions) {
      const label = document.createElement("label");
      label.textContent = definition.label;
      definition.control.dataset.mammographyId = mammography.id;
      definition.control.dataset.field = definition.field;
      const save = () => {
        updateMammographyFromControl(
          mammography,
          definition.field,
          definition.control.value,
        );
        mammographiesReviewed = false;
        if (definition.field === "role") renderMammographies();
        updateJourney();
      };
      definition.control.addEventListener("input", save);
      definition.control.addEventListener("change", save);
      label.append(definition.control);
      fields.append(label);
    }

    card.append(header, fields);
    list.append(card);
  }
}

function makeMammography(role: "screening" | "diagnostic"): MamaUiMammography {
  return {
    kind: "mammography",
    id: `ui-mammography-${nextMammographyId++}`,
    role,
    disposition: "unknown",
    quality: "unknown",
    completeness: "unknown",
    resolutionInformation: "unknown",
  };
}

function addMammography(role: "screening" | "diagnostic"): void {
  mamaPilotMammographies.push(makeMammography(role));
  mammographiesReviewed = false;
  renderMammographies();
  updateJourney();
  element("mammography-list").lastElementChild
    ?.querySelector<HTMLElement>("input, select, button")
    ?.focus();
}

function clearAll(): void {
  element<HTMLFormElement>("screening-form").reset();
  mamaPilotMammographies.splice(0);
  nextMammographyId = 1;
  mammographiesReviewed = false;
  editingStep = undefined;
  renderMammographies();
  clearError();
  clearResult();
  setSectionVisible("context-section", false);
  setSectionVisible("safety-section", false);
  setSectionVisible("history-section", false);
  setSectionVisible("exam-section", false);
  setSectionVisible("availability-section", false);
  setChoiceGroupVisible("history-detail-wrap", false);
  element("form-actions").classList.add("hidden");
  updateGuidedCards("reference-section");
  setJourneyStatus("reference-section");
  element<HTMLSelectElement>("policy").focus();
}

function updateJourney(): void {
  clearError();
  updateProgressiveDisclosure();
}

initializeSafetyQuestions();
initializePolicies();
initializeGuidedCards();
renderMammographies();

const form = element<HTMLFormElement>("screening-form");
form.addEventListener("input", () => updateJourney());
form.addEventListener("change", () => updateJourney());
form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateJourney();
  if (!element("result-region").classList.contains("hidden"))
    element("result-title").focus({ preventScroll: true });
});

element("add-screening-mammography").addEventListener("click", () =>
  addMammography("screening"),
);
element("add-diagnostic-mammography").addEventListener("click", () =>
  addMammography("diagnostic"),
);
element("finish-mammographies").addEventListener("click", () => {
  mammographiesReviewed = true;
  editingStep = undefined;
  updateJourney();
  element("result-title").focus({ preventScroll: true });
});
element("clear-form").addEventListener("click", clearAll);

// Make the live result heading programmatically focusable without changing tab order.
element("result-title").setAttribute("tabindex", "-1");
updateJourney();
