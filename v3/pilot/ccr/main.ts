import {
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
  presentCcrProduct,
  type CcrPresentationCard,
} from "../../src/product/ccr";

type Answer = "yes" | "no" | "unknown" | "not_asked";
type Availability = "available" | "unavailable" | "unknown";

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

const exams: UiExam[] = [];
let nextExamId = 1;

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
    option("not_asked", "Não perguntado"),
    option("no", "Não"),
    option("yes", "Sim"),
    option("unknown", "Incerto / não sei"),
  );
  label.append(select);
  return label;
}

function initializeRiskFields(): void {
  const container = element<HTMLDivElement>("risk-fields");
  container.replaceChildren(
    answerSelect("prior-crc", "Câncer colorretal prévio?"),
    answerSelect(
      "prior-polyp-surveillance",
      "Pólipo/adenoma prévio que exige surveillance?",
    ),
    answerSelect("colonic-ibd", "Doença inflamatória intestinal colônica relevante?"),
    answerSelect("hereditary-syndrome", "Síndrome hereditária CCR/polipose conhecida ou suspeita?"),
    answerSelect("specialist-care", "Outro profissional/serviço já assumiu este caminho de cuidado?"),
  );
}

function initializePolicies(): void {
  const policySelect = element<HTMLSelectElement>("policy");
  for (const policy of getCcrProductPolicyOptions()) {
    policySelect.append(option(policy.policyId, policy.label));
  }
  policySelect.addEventListener("change", updateStrategyVisibility);
}

function selectedPolicyFamily(): string | undefined {
  const selected = selectValue("policy");
  return getCcrProductPolicyOptions().find((policy) => policy.policyId === selected)
    ?.family;
}

function updateStrategyVisibility(): void {
  const section = element<HTMLElement>("strategy-section");
  const strategy = element<HTMLSelectElement>("strategy");
  const hide = selectedPolicyFamily() === "sus_oficial" || selectValue("policy") === "";
  section.classList.toggle("hidden", hide);
  if (hide) strategy.value = "unselected";
}

function updateConditionalFields(): void {
  const familyYes = selectValue("family-history") === "yes";
  const familyBox = element<HTMLDivElement>("family-details");
  familyBox.classList.toggle("hidden", !familyYes);
  familyBox.setAttribute("aria-hidden", String(!familyYes));

  const historyKnown = selectValue("history-knowledge") === "known";
  element<HTMLElement>("history-sufficient-wrap").classList.toggle(
    "hidden",
    !historyKnown,
  );
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
          <label>Data/precisão <input data-exam-id="${exam.id}" data-field="date" type="text" placeholder="AAAA, AAAA-MM ou AAAA-MM-DD" value="${exam.date ?? ""}" /></label>
          <label>Resultado ${selectHtml("result", exam.id, exam.result ?? "unknown", [["unknown","Desconhecido"],["pending","Pendente"],["invalid","Inválido/inconclusivo"],["negative","Negativo"],["positive","Positivo"]])}</label>
        </div>`;
    } else {
      card.innerHTML = `
        <header><h3>Colonoscopia</h3><button type="button" class="danger" data-remove="${exam.id}">Remover</button></header>
        <div class="exam-fields">
          <label>Status ${selectHtml("status", exam.id, exam.status, [["performed","Realizada"],["not_performed","Não realizada"],["unknown","Desconhecido"]])}</label>
          <label>Papel ${selectHtml("role", exam.id, exam.role, [["other_or_unknown","Outro / desconhecido"],["screening","Rastreamento primário"],["post_fit_positive","Diagnóstica após FIT positivo"]])}</label>
          <label>Data/precisão <input data-exam-id="${exam.id}" data-field="date" type="text" placeholder="AAAA, AAAA-MM ou AAAA-MM-DD" value="${exam.date ?? ""}" /></label>
          <label>Resultado ${selectHtml("result", exam.id, exam.result ?? "unknown", [["unknown","Desconhecido"],["pending","Pendente"],["normal","Normal"],["polyp_or_lesion","Pólipo / lesão"],["cancer","Câncer"]])}</label>
          <label>Preparo ${selectHtml("preparation", exam.id, exam.preparation ?? "unknown", [["unknown","Desconhecido"],["adequate","Adequado"],["inadequate","Inadequado"]])}</label>
          <label>Exame completo? ${selectHtml("completeness", exam.id, exam.completeness ?? "unknown", [["unknown","Desconhecido"],["complete","Completo"],["incomplete","Incompleto"]])}</label>
          <label>Informação suficiente para resolução? ${selectHtml("resolutionInformation", exam.id, exam.resolutionInformation ?? "unknown", [["unknown","Desconhecido"],["sufficient","Suficiente"],["insufficient","Insuficiente"]])}</label>
        </div>`;
    }

    list.append(card);
  }

  list.querySelectorAll<HTMLButtonElement>("button[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.remove;
      const index = exams.findIndex((exam) => exam.id === id);
      if (index >= 0) exams.splice(index, 1);
      renderExamList();
    });
  });

  list.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-exam-id][data-field]").forEach((control) => {
    control.addEventListener("change", () => {
      const id = control.dataset.examId;
      const field = control.dataset.field;
      const exam = exams.find((candidate) => candidate.id === id);
      if (exam === undefined || field === undefined) return;
      const value = control.value;
      if (field === "date") {
        if (value === "") delete exam.date;
        else exam.date = value;
        return;
      }
      Object.assign(exam, { [field]: value });
    });
  });
}

function collectFamilyDetails(): Record<string, unknown> | undefined {
  if (selectValue("family-history") !== "yes") return undefined;
  const details: Record<string, unknown> = {};
  const fdr = optionalNumber("family-fdr");
  const sdr = optionalNumber("family-sdr");
  const exactAge = optionalNumber("family-age-years");
  const ageBand = selectValue("family-age-band");
  const finding = selectValue("family-finding");
  if (fdr !== undefined) details.affectedFdrCount = fdr;
  if (sdr !== undefined) details.affectedSdrCount = sdr;
  if (exactAge !== undefined) details.youngestDiagnosisAgeYears = exactAge;
  if (ageBand !== "") details.youngestDiagnosisAgeBand = ageBand;
  if (finding !== "") details.findingType = finding;
  return Object.keys(details).length === 0 ? undefined : details;
}

function collectDraft(): Record<string, unknown> {
  const age = optionalNumber("age");
  const familyDetails = collectFamilyDetails();
  const careSetting: Record<string, Availability> = {};
  const fitAvailability = selectValue("availability-fit");
  const colonoscopyAvailability = selectValue("availability-colonoscopy");
  if (fitAvailability !== "") careSetting.fit = fitAvailability as Availability;
  if (colonoscopyAvailability !== "")
    careSetting.colonoscopy = colonoscopyAvailability as Availability;

  return {
    policyId: selectValue("policy"),
    asOf: inputValue("as-of"),
    ...(age === undefined ? {} : { ageYears: age }),
    screeningContext: selectValue("screening-context") as Answer,
    priorCrc: selectValue("prior-crc") as Answer,
    priorPolypSurveillance: selectValue("prior-polyp-surveillance") as Answer,
    colonicIbd: selectValue("colonic-ibd") as Answer,
    hereditarySyndrome: selectValue("hereditary-syndrome") as Answer,
    familyHistory: selectValue("family-history") as Answer,
    ...(familyDetails === undefined ? {} : { familyDetails }),
    historyKnowledge: selectValue("history-knowledge"),
    historySufficientForCurrentStatus: selectValue("history-sufficient"),
    strategySelection: selectValue("strategy"),
    specialistCareAssumed: selectValue("specialist-care") as Answer,
    exams: structuredClone(exams),
    careSetting,
  };
}

function clearResults(): void {
  element("empty-state").classList.remove("hidden");
  element("error-state").classList.add("hidden");
  element("result-state").classList.add("hidden");
}

function showError(title: string, issues: string[]): void {
  element("empty-state").classList.add("hidden");
  element("result-state").classList.add("hidden");
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
  target.append(heading, list);
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

function renderSuccess(evaluated: Extract<ReturnType<typeof evaluateCcrProductDraft>, { ok: true }>): void {
  const model = presentCcrProduct(evaluated);
  element("empty-state").classList.add("hidden");
  element("error-state").classList.add("hidden");
  element("result-state").classList.remove("hidden");
  element("result-policy").textContent = model.policy.label;
  element("result-version").textContent = model.rulesetVersion;
  element("ruleset-version").textContent = model.rulesetVersion;

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
  const result = evaluateCcrProductDraft(collectDraft());
  if (!result.ok) {
    if ("issues" in result) showError("Revise os dados de entrada", result.issues);
    else showError("Avaliação interrompida com segurança", [result.message]);
    return;
  }
  renderSuccess(result);
}

function resetPilot(): void {
  element<HTMLFormElement>("screening-form").reset();
  exams.splice(0, exams.length);
  nextExamId = 1;
  renderExamList();
  updateConditionalFields();
  updateStrategyVisibility();
  clearResults();
  element("ruleset-version").textContent = "crc-0.5.5-phase6-active";
}

initializeRiskFields();
initializePolicies();
renderExamList();
updateConditionalFields();
updateStrategyVisibility();
element("ruleset-version").textContent = "crc-0.5.5-phase6-active";

element<HTMLSelectElement>("family-history").addEventListener(
  "change",
  updateConditionalFields,
);
element<HTMLSelectElement>("history-knowledge").addEventListener(
  "change",
  updateConditionalFields,
);
element<HTMLButtonElement>("add-fit").addEventListener("click", () => {
  exams.push(makeFitExam());
  renderExamList();
});
element<HTMLButtonElement>("add-colonoscopy").addEventListener("click", () => {
  exams.push(makeColonoscopyExam());
  renderExamList();
});
element<HTMLButtonElement>("clear-form").addEventListener("click", resetPilot);
element<HTMLFormElement>("screening-form").addEventListener("submit", evaluateForm);
