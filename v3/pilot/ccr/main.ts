import {
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
  presentCcrProduct,
  type CcrPresentationCard,
  type CcrRequestedInput,
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

const HARD_RISK_IDS = [
  "prior-crc",
  "prior-polyp-surveillance",
  "colonic-ibd",
  "hereditary-syndrome",
] as const;

const exams: UiExam[] = [];
const requestedInputs = new Set<CcrRequestedInput>();
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
    option("not_asked", "Selecione…"),
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

function journeyItems(): string[] {
  const items: string[] = [];
  const policy = selectedPolicy();
  if (policy !== undefined) items.push(`Referencial: ${policy.label}`);
  const age = optionalNumber("age");
  if (age !== undefined) items.push(`Idade: ${age} anos`);
  const context = selectValue("screening-context");
  if (context === "yes") items.push("Contexto preventivo confirmado");
  if (context === "no") items.push("Contexto não preventivo informado");
  if (context === "unknown") items.push("Contexto preventivo incerto");
  if (context === "yes" && hardRiskPositive())
    items.push("Condição especial informada");
  if (context === "yes" && allHardRisksAnswered() && !hardRiskPositive())
    items.push("Condições especiais verificadas");
  const family = selectValue("family-history");
  if (family === "no") items.push("História familiar negativa informada");
  if (family === "unknown") items.push("História familiar desconhecida");
  if (family === "yes" && familyDetailsReady())
    items.push("História familiar positiva detalhada");
  const history = selectValue("history-knowledge");
  if (history === "never_performed")
    items.push("Nunca realizou rastreamento confirmado");
  if (history === "unknown") items.push("Histórico de rastreamento desconhecido");
  if (history === "known") items.push("Histórico de rastreamento conhecido");
  return items;
}

function updateJourneyPanel(): void {
  const title = element("journey-title");
  const next = element("journey-next");
  const list = element<HTMLUListElement>("journey-summary");
  list.replaceChildren(
    ...journeyItems().map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }),
  );

  if (!baselineComplete()) {
    title.textContent = "Comece pelo referencial";
    next.textContent =
      "Escolha o referencial, a data de referência e informe a idade.";
    return;
  }

  const context = selectValue("screening-context");
  if (context === "not_asked") {
    title.textContent = "Confirme o contexto da avaliação";
    next.textContent =
      "A próxima pergunta verifica se este módulo preventivo é o caminho correto.";
    return;
  }
  if (context !== "yes") {
    title.textContent = "O Motor já pode se posicionar sobre o escopo";
    next.textContent =
      "Avalie agora; perguntas de rastreamento average-risk não serão abertas desnecessariamente.";
    return;
  }
  if (!allHardRisksAnswered()) {
    title.textContent = hardRiskPositive()
      ? "Complete apenas o bloco de condições especiais"
      : "Verifique as condições que mudam a rota";
    next.textContent = hardRiskPositive()
      ? "Uma condição especial já foi informada. Complete somente as demais condições deste bloco; história familiar e rotina average-risk permanecerão fechadas."
      : "Responda às quatro condições antes de abrir a história familiar.";
    return;
  }
  if (hardRiskPositive()) {
    title.textContent = "Condição especial informada";
    next.textContent =
      "Avalie agora. O formulário não continuará coletando dados average-risk sem necessidade.";
    return;
  }

  const family = selectValue("family-history");
  if (family === "not_asked") {
    title.textContent = "Informe a história familiar";
    next.textContent = "Só serão pedidos detalhes se a resposta for positiva.";
    return;
  }
  if (!familyDetailsReady()) {
    title.textContent = "Detalhe apenas a história familiar positiva";
    next.textContent =
      "Informe parentes afetados, faixa etária do diagnóstico mais jovem e tipo de achado.";
    return;
  }

  const history = selectValue("history-knowledge");
  if (history === "not_asked") {
    title.textContent = "Informe o conhecimento do histórico";
    next.textContent =
      "Exames anteriores só serão abertos quando o histórico for conhecido.";
    return;
  }

  if (requestedInputs.has("strategy_selection")) {
    title.textContent = "O Motor precisa de uma escolha humana";
    next.textContent = "Escolha a estratégia solicitada e atualize a avaliação.";
    return;
  }
  if (
    requestedInputs.has("fit_availability") ||
    requestedInputs.has("colonoscopy_availability")
  ) {
    title.textContent = "A decisão clínica já foi calculada";
    next.textContent =
      "Informe somente a disponibilidade do recurso solicitado para definir a rota operacional.";
    return;
  }

  title.textContent =
    history === "known" ? "Revise os exames conhecidos e avalie" : "Pronto para avaliar";
  next.textContent =
    history === "known"
      ? "Adicione apenas os exames que realmente conhece; depois execute a avaliação."
      : "O Motor já tem os dados necessários para esta etapa.";
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
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "[data-exam-id][data-field]",
    )
    .forEach((control) => {
      control.addEventListener("change", () => {
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
      });
    });
}

function updateExamDisclosure(card: HTMLElement, exam: UiExam): void {
  card.querySelectorAll<HTMLElement>("[data-field]").forEach((control) => {
    if (control.dataset.field === "status") return;
    control
      .closest("label")
      ?.classList.toggle("hidden", exam.status !== "performed");
  });
}

function invalidateResults(clearRequests = true): void {
  const hadOutput =
    !element("result-state").classList.contains("hidden") ||
    !element("error-state").classList.contains("hidden");
  if (clearRequests) requestedInputs.clear();
  clearResults();
  if (hadOutput)
    element("result-notice").textContent =
      "Dados alterados. Avalie novamente para atualizar o resultado.";
}

function collectFamilyDetails(): Record<string, unknown> | undefined {
  if (
    element("family-section").classList.contains("hidden") ||
    selectValue("family-history") !== "yes"
  )
    return undefined;
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
  const riskVisible = !element("risk-section").classList.contains("hidden");
  const familyVisible = !element("family-section").classList.contains("hidden");
  const historyVisible = !element("history-section").classList.contains("hidden");
  const examVisible = !element("exam-section").classList.contains("hidden");
  const strategyVisible = !element("strategy-section").classList.contains("hidden");
  const familyDetails = collectFamilyDetails();
  const careSetting: Record<string, Availability> = {};

  if (!element("availability-fit-wrap").classList.contains("hidden")) {
    const fitAvailability = selectValue("availability-fit");
    if (fitAvailability !== "")
      careSetting.fit = fitAvailability as Availability;
  }
  if (!element("availability-colonoscopy-wrap").classList.contains("hidden")) {
    const colonoscopyAvailability = selectValue("availability-colonoscopy");
    if (colonoscopyAvailability !== "")
      careSetting.colonoscopy = colonoscopyAvailability as Availability;
  }

  return {
    policyId: selectValue("policy"),
    asOf: inputValue("as-of"),
    ...(age === undefined ? {} : { ageYears: age }),
    screeningContext: selectValue("screening-context") as Answer,
    priorCrc: (riskVisible ? selectValue("prior-crc") : "not_asked") as Answer,
    priorPolypSurveillance: (riskVisible
      ? selectValue("prior-polyp-surveillance")
      : "not_asked") as Answer,
    colonicIbd: (riskVisible ? selectValue("colonic-ibd") : "not_asked") as Answer,
    hereditarySyndrome: (riskVisible
      ? selectValue("hereditary-syndrome")
      : "not_asked") as Answer,
    familyHistory: (familyVisible
      ? selectValue("family-history")
      : "not_asked") as Answer,
    ...(familyDetails === undefined ? {} : { familyDetails }),
    historyKnowledge: historyVisible
      ? selectValue("history-knowledge")
      : "not_asked",
    historySufficientForCurrentStatus:
      historyVisible &&
      !element("history-sufficient-wrap").classList.contains("hidden")
        ? selectValue("history-sufficient")
        : "not_asked",
    strategySelection: strategyVisible
      ? selectValue("strategy")
      : "unselected",
    specialistCareAssumed: (!element("specialist-care-wrap").classList.contains(
      "hidden",
    )
      ? selectValue("specialist-care")
      : "not_asked") as Answer,
    exams: examVisible ? structuredClone(exams) : [],
    careSetting,
  };
}

function clearResults(): void {
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
    title.textContent = "Próxima informação necessária: escolha de estratégia";
    text.textContent =
      "O Motor não escolhe a modalidade autonomamente. Registre a escolha humana e atualize a avaliação.";
  } else {
    title.textContent =
      "Próxima informação necessária: disponibilidade do recurso";
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
    control?.focus();
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
    requestedInputs.clear();
    updateProgressiveDisclosure();
    if ("issues" in result)
      showError("Revise os dados de entrada", result.issues);
    else showError("Avaliação interrompida com segurança", [result.message]);
    element("result-panel").focus();
    return;
  }
  renderSuccess(result);
  element("result-notice").textContent =
    requestedInputs.size > 0
      ? "Avaliação calculada. Há uma próxima informação solicitada abaixo."
      : "Avaliação atualizada.";
  element("result-panel").focus();
}

function resetPilot(): void {
  element<HTMLFormElement>("screening-form").reset();
  exams.splice(0, exams.length);
  requestedInputs.clear();
  nextExamId = 1;
  renderExamList();
  clearResults();
  element("result-notice").textContent =
    "Formulário limpo. Comece pelo referencial.";
  element("ruleset-version").textContent = "crc-0.5.5-phase6-active";
  updateProgressiveDisclosure();
  element("policy").focus();
}

initializeRiskFields();
initializePolicies();
renderExamList();
element("ruleset-version").textContent = "crc-0.5.5-phase6-active";
updateProgressiveDisclosure();

element<HTMLButtonElement>("add-fit").addEventListener("click", () => {
  exams.push(makeFitExam());
  renderExamList();
  clearAdaptiveInputs();
  invalidateResults(false);
  updateProgressiveDisclosure();
  element("exam-list")
    .lastElementChild?.querySelector<HTMLSelectElement>("select")
    ?.focus();
});
element<HTMLButtonElement>("add-colonoscopy").addEventListener("click", () => {
  exams.push(makeColonoscopyExam());
  renderExamList();
  clearAdaptiveInputs();
  invalidateResults(false);
  updateProgressiveDisclosure();
  element("exam-list")
    .lastElementChild?.querySelector<HTMLSelectElement>("select")
    ?.focus();
});
element<HTMLButtonElement>("clear-form").addEventListener("click", resetPilot);
element<HTMLFormElement>("screening-form").addEventListener("submit", evaluateForm);

const form = element<HTMLFormElement>("screening-form");
function handleMutation(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const adaptive = target.closest("#strategy-section, #availability-section");
  if (adaptive === null) clearAdaptiveInputs();
  else if (target.closest("#strategy-section") !== null) {
    element<HTMLSelectElement>("availability-fit").value = "";
    element<HTMLSelectElement>("availability-colonoscopy").value = "";
  }
  invalidateResults(false);
  updateProgressiveDisclosure();
}
form.addEventListener("input", handleMutation);
form.addEventListener("change", handleMutation);
