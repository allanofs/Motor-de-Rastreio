import type { UiExam } from "./pilotExamState";

type Answer = "yes" | "no" | "unknown" | "not_asked";
type Availability = "available" | "unavailable" | "unknown";

type PilotControl = HTMLElement & { value?: string };

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`Missing pilot element #${id}`);
  return found as T;
}

function semanticValue(control: PilotControl): string {
  if (typeof control.value === "string") return control.value;
  return control.querySelector<HTMLInputElement>('input:checked')?.value ?? "";
}

function controlValue(id: string): string {
  return semanticValue(element<PilotControl>(id));
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

/**
 * Serializes current pilot controls plus the authoritative in-memory exam snapshot
 * into the existing CCR product-draft contract. No clinical inference occurs here.
 */
export function collectCcrPilotDraft(
  exams: readonly UiExam[] = [],
): Record<string, unknown> {
  const age = optionalNumber("age");
  const riskVisible = visible("risk-section");
  const familyVisible = visible("family-section");
  const historyVisible = visible("history-section");
  const examVisible = visible("exam-section");
  const strategyVisible = visible("strategy-section");
  const familyDetails = collectFamilyDetails();
  const careSetting: Record<string, Availability> = {};

  if (!element("availability-fit-wrap").classList.contains("hidden")) {
    const fit = controlValue("availability-fit");
    if (fit !== "") careSetting.fit = fit as Availability;
  }
  if (!element("availability-colonoscopy-wrap").classList.contains("hidden")) {
    const colonoscopy = controlValue("availability-colonoscopy");
    if (colonoscopy !== "")
      careSetting.colonoscopy = colonoscopy as Availability;
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
    colonicIbd: (riskVisible
      ? controlValue("colonic-ibd")
      : "not_asked") as Answer,
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
      historyVisible &&
      !element("history-sufficient-wrap").classList.contains("hidden")
        ? controlValue("history-sufficient")
        : "not_asked",
    strategySelection: strategyVisible
      ? controlValue("strategy")
      : "unselected",
    specialistCareAssumed: (!element("specialist-care-wrap").classList.contains(
      "hidden",
    )
      ? controlValue("specialist-care")
      : "not_asked") as Answer,
    exams: examVisible ? structuredClone(exams) : [],
    careSetting,
  };
}
