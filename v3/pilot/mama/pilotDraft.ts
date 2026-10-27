import type { MamaProductDraft } from "../../src/product/mama";
import { mamaPilotMammographies } from "./pilotMammographyState";

type Answer = "yes" | "no" | "unknown" | "not_asked";
type HistoryKnowledge = "known" | "never_performed" | "unknown" | "not_asked";
type Availability = "available" | "unavailable" | "unknown";

type SemanticControl = HTMLElement & { value?: string };

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`Missing Mama pilot element #${id}`);
  return found as T;
}

function semanticValue(id: string): string {
  const control = element<SemanticControl>(id);
  if (typeof control.value === "string") return control.value;
  return control.querySelector<HTMLInputElement>("input:checked")?.value ?? "";
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

function visible(id: string): boolean {
  const node = element(id);
  return !node.classList.contains("hidden") && !node.hidden;
}

function answer(sectionId: string, controlId: string): Answer {
  return (visible(sectionId) ? semanticValue(controlId) || "not_asked" : "not_asked") as Answer;
}

/**
 * Serializes only visible/reached acquisition controls into MamaProductDraft.
 * Hidden future questions remain `not_asked`; no clinical inference occurs here.
 */
export function collectMamaPilotDraft(): MamaProductDraft {
  const careSetting: { mammography?: Availability } = {};
  if (visible("availability-section")) {
    const availability = semanticValue("mammography-availability");
    if (availability !== "") careSetting.mammography = availability as Availability;
  }

  const historyKnowledge = (visible("history-section")
    ? semanticValue("history-knowledge") || "not_asked"
    : "not_asked") as HistoryKnowledge;

  return {
    policyId: semanticValue("policy"),
    asOf: inputValue("as-of"),
    ...(optionalNumber("age") === undefined
      ? {}
      : { ageYears: optionalNumber("age") }),

    screeningContext: answer("context-section", "screening-context"),
    relevantBreastTissuePresent: answer(
      "context-section",
      "relevant-breast-tissue",
    ),

    suspiciousBreastSymptoms: answer(
      "safety-section",
      "suspicious-symptoms",
    ),
    priorBreastCancer: answer("safety-section", "prior-breast-cancer"),
    highRiskGeneticContext: answer("safety-section", "high-risk-genetic"),
    knownHighRiskFamilialContext: answer(
      "safety-section",
      "known-high-risk-familial",
    ),
    priorHighRiskChestRadiation: answer(
      "safety-section",
      "high-risk-chest-radiation",
    ),
    priorHighRiskBreastLesion: answer(
      "safety-section",
      "high-risk-lesion",
    ),
    specificBreastCareActive: answer(
      "safety-section",
      "specific-care-active",
    ),

    historyKnowledge,
    historySufficientForCurrentStatus: answer(
      "history-detail-wrap",
      "history-sufficient",
    ),
    priorMammographyAllowsRoutine: answer(
      "history-detail-wrap",
      "prior-mammography-allows-routine",
    ),
    priorMammographyNeedsSpecificAttention: answer(
      "history-detail-wrap",
      "prior-mammography-needs-attention",
    ),
    mammographies: visible("exam-section")
      ? structuredClone(mamaPilotMammographies)
      : [],
    careSetting,
  };
}
