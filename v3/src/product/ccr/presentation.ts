import { CCR_IDS } from "../../clinical/ccr";
import type {
  EvaluatedAction,
  PathwayState,
  TrackEvaluation,
} from "../../model/evaluation";
import type {
  CcrProductSectionId,
  CcrProductSuccess,
} from "./integration";

export const CCR_PRESENTATION_CONTRACT_VERSION = "phase7.2" as const;

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

export type CcrPresentationAction = {
  actionId: string;
  kind: EvaluatedAction["kind"];
  text: string;
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
  hasAutomaticAction: boolean;
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

function routeLabel(route: NonNullable<EvaluatedAction["operational"]>["route"]): string {
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
    // Deliberately preserve the governed clinical wording verbatim.
    text: action.text,
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
    hasAutomaticAction: track.actions.length > 0,
  };
}

export function presentCcrProduct(
  result: CcrProductSuccess,
): CcrPresentationModel {
  return {
    contractVersion: CCR_PRESENTATION_CONTRACT_VERSION,
    rulesetVersion: result.rulesetVersion,
    releaseGate: result.releaseGate,
    policy: result.policy,
    requiresAttention: result.requiresAttention,
    sections: result.sections.map((section) => ({
      id: section.id,
      label: section.label,
      cards: section.cards.map((card) =>
        presentTrack(card.topicId, section.id, card.track),
      ),
    })),
  };
}
