import {
  CCR_IDS,
  offerScreeningStrategyAction,
} from "../../clinical/ccr";
import type {
  EvaluatedAction,
  PathwayState,
  TrackEvaluation,
} from "../../model/evaluation";
import {
  deriveCcrAutomationBoundary,
  type CcrAutomationBoundary,
} from "./automationBoundary";
import type {
  CcrProductSectionId,
  CcrProductSuccess,
} from "./integration";

export const CCR_PRESENTATION_CONTRACT_VERSION = "phase7.4.1" as const;

const TRACK_LABELS: Record<string, string> = {
  [CCR_IDS.tracks.routine]: "Rastreamento de rotina",
  [CCR_IDS.tracks.population]: "Elegibilidade populacional",
  [CCR_IDS.tracks.fitStrategy]: "Estratégia FIT",
  [CCR_IDS.tracks.colonoscopyStrategy]: "Estratégia colonoscopia",
  [CCR_IDS.tracks.fitFollowup]: "Seguimento de FIT positivo",
  [CCR_IDS.tracks.postFitRoutine]: "Rotina após investigação de FIT positivo",
  [CCR_IDS.tracks.familyStatus]: "História familiar",
  [CCR_IDS.tracks.familyHighRisk]: "História familiar de maior risco",
  [CCR_IDS.tracks.familyChoice]: "Estratégia por história familiar",
  [CCR_IDS.tracks.specialRisk]: "Condição de risco especial",
};

const STATUS_LABELS: Record<PathwayState["status"], string> = {
  Current: "Em dia",
  Due: "Ação indicada",
  NotApplicable: "Sem ação de rotina neste caminho",
  Indeterminate: "Falta informação",
  PendingResult: "Resultado pendente",
  InFollowUp: "Seguimento em andamento",
  SharedDecision: "Decisão compartilhada",
  ClinicalReviewRequired: "Revisão clínica necessária",
  HandedOff: "Cuidado assumido por outro serviço",
  Conflict: "Conflito a resolver",
  ComputationError: "Não foi possível concluir com segurança",
};

export type CcrRequestedInput =
  | "strategy_selection"
  | "fit_availability"
  | "colonoscopy_availability";

export type CcrPresentationAction = {
  actionId: string;
  kind: EvaluatedAction["kind"];
  text: string;
  resourceId?: string;
  operational?: {
    availability: "available" | "unavailable" | "unknown";
    route: "local" | "referral" | "clinical_review" | "clarify_availability";
    routeLabel: string;
  };
};

export type CcrPresentationCard = {
  topicId: string;
  trackId: string;
  trackLabel: string;
  sectionId: CcrProductSectionId;
  status: PathwayState["status"];
  statusLabel: string;
  summary: string;
  actions: CcrPresentationAction[];
  missingData: string[];
  guardrails: string[];
  sourceIds: string[];
  hasActionOutput: boolean;
};

export type CcrPresentationSection = {
  id: CcrProductSectionId;
  label: string;
  cards: CcrPresentationCard[];
};

export type CcrPresentationModel = {
  contractVersion: typeof CCR_PRESENTATION_CONTRACT_VERSION;
  rulesetVersion: string;
  releaseGate: CcrProductSuccess["releaseGate"];
  policy: CcrProductSuccess["policy"];
  requiresAttention: boolean;
  automationBoundary: CcrAutomationBoundary;
  requestedInputs: CcrRequestedInput[];
  sections: CcrPresentationSection[];
};

function summaryForState(state: PathwayState): string {
  switch (state.status) {
    case "Current":
      return "Há cobertura válida neste referencial com base no histórico qualificável disponível.";
    case "Due":
      return "O motor identificou uma ação de rastreamento indicada neste referencial.";
    case "NotApplicable":
    case "Indeterminate":
    case "ClinicalReviewRequired":
    case "Conflict":
      return state.reason;
    case "PendingResult":
      return "Há um resultado pendente antes de concluir este caminho.";
    case "InFollowUp":
      return "Há um seguimento em andamento neste caminho.";
    case "SharedDecision":
      return "A próxima etapa requer decisão compartilhada; o motor não escolhe a estratégia pelo profissional ou paciente.";
    case "HandedOff":
      return "Outro profissional ou serviço já assumiu este caminho de cuidado.";
    case "ComputationError":
      return state.message;
  }
}

function routeLabel(
  route: NonNullable<EvaluatedAction["operational"]>["route"],
): string {
  switch (route) {
    case "local":
      return "Executável no serviço informado";
    case "referral":
      return "Encaminhamento / regulação";
    case "clinical_review":
      return "Revisar alternativa clínica ou operacional";
    case "clarify_availability":
      return "Confirmar disponibilidade antes de operacionalizar";
  }
}

function presentAction(action: EvaluatedAction): CcrPresentationAction {
  return {
    actionId: action.actionId,
    kind: action.kind,
    text: action.text,
    ...(action.resourceId === undefined ? {} : { resourceId: action.resourceId }),
    ...(action.operational === undefined
      ? {}
      : {
          operational: {
            ...action.operational,
            routeLabel: routeLabel(action.operational.route),
          },
        }),
  };
}

function presentTrack(
  topicId: string,
  sectionId: CcrProductSectionId,
  track: TrackEvaluation,
): CcrPresentationCard {
  return {
    topicId,
    trackId: track.trackId,
    trackLabel: TRACK_LABELS[track.trackId] ?? track.trackId,
    sectionId,
    status: track.state.status,
    statusLabel: STATUS_LABELS[track.state.status],
    summary: summaryForState(track.state),
    actions: track.actions.map(presentAction),
    missingData: [...track.missingData],
    guardrails: [...track.guardrails],
    sourceIds: [...track.trace.sourceIds],
    hasActionOutput: track.actions.length > 0,
  };
}

function requestedInputsFor(sections: CcrPresentationSection[]): CcrRequestedInput[] {
  const requests = new Set<CcrRequestedInput>();
  const cards = sections.flatMap((section) => section.cards);

  if (
    cards.some(
      (card) =>
        card.missingData.includes(CCR_IDS.concepts.screeningStrategySelection) ||
        card.actions.some(
          (action) => action.actionId === offerScreeningStrategyAction.actionId,
        ),
    )
  ) {
    requests.add("strategy_selection");
  }

  for (const action of cards.flatMap((card) => card.actions)) {
    if (action.operational?.availability !== "unknown") continue;
    if (action.resourceId === CCR_IDS.resources.fit) requests.add("fit_availability");
    if (action.resourceId === CCR_IDS.resources.colonoscopy)
      requests.add("colonoscopy_availability");
  }

  return [...requests];
}

function prioritizeBoundaryTriggers(
  sections: CcrPresentationSection[],
  automationBoundary: CcrAutomationBoundary,
): CcrPresentationSection[] {
  const triggerIds = new Set(automationBoundary.triggerTrackIds);
  const hasTrigger = (section: CcrPresentationSection) =>
    section.cards.some((card) => triggerIds.has(card.trackId));

  return sections
    .map((section) => ({
      ...section,
      cards: [...section.cards].sort(
        (left, right) =>
          Number(triggerIds.has(right.trackId)) -
          Number(triggerIds.has(left.trackId)),
      ),
    }))
    .sort(
      (left, right) => Number(hasTrigger(right)) - Number(hasTrigger(left)),
    );
}

export function presentCcrProduct(
  result: CcrProductSuccess,
): CcrPresentationModel {
  const automationBoundary = deriveCcrAutomationBoundary(result);
  const rawSections = result.sections.map((section) => ({
    id: section.id,
    label: section.label,
    cards: section.cards.map((card) =>
      presentTrack(card.topicId, section.id, card.track),
    ),
  }));
  const sections = prioritizeBoundaryTriggers(rawSections, automationBoundary);

  return {
    contractVersion: CCR_PRESENTATION_CONTRACT_VERSION,
    rulesetVersion: result.rulesetVersion,
    releaseGate: result.releaseGate,
    policy: result.policy,
    requiresAttention: result.requiresAttention,
    automationBoundary,
    requestedInputs: requestedInputsFor(sections),
    sections,
  };
}