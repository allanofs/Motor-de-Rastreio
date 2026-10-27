import { MAMA_IDS } from "../../clinical/mama";
import type {
  EvaluatedAction,
  PathwayState,
  TrackEvaluation,
} from "../../model/evaluation";
import {
  deriveMamaAutomationBoundary,
  type MamaAutomationBoundary,
} from "./automationBoundary";
import type {
  MamaProductSectionId,
  MamaProductSuccess,
} from "./integration";

export const MAMA_PRESENTATION_CONTRACT_VERSION = "mama-P1" as const;

const TRACK_LABELS: Record<string, string> = {
  [MAMA_IDS.tracks.routine]: "Rastreamento de rotina",
  [MAMA_IDS.tracks.population]: "Faixa etária / referencial",
  [MAMA_IDS.tracks.priorFinding]: "Mamografia anterior",
  [MAMA_IDS.tracks.specialRisk]: "Condição de risco especial",
  [MAMA_IDS.tracks.specificCare]: "Acompanhamento específico",
};

const STATUS_LABELS: Record<PathwayState["status"], string> = {
  Current: "Em dia",
  Due: "Ação indicada",
  NotApplicable: "Sem ação de rotina neste caminho",
  Indeterminate: "Falta informação",
  PendingResult: "Resultado pendente",
  InFollowUp: "Seguimento em andamento",
  SharedDecision: "Decisão individual",
  ClinicalReviewRequired: "Atenção específica",
  HandedOff: "Cuidado específico ativo",
  Conflict: "Conflito a resolver",
  ComputationError: "Não foi possível concluir com segurança",
};

export type MamaRequestedInput = "mammography_availability";

export type MamaPresentationAction = {
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

export type MamaPresentationCard = {
  topicId: string;
  trackId: string;
  trackLabel: string;
  sectionId: MamaProductSectionId;
  status: PathwayState["status"];
  statusLabel: string;
  summary: string;
  actions: MamaPresentationAction[];
  missingData: string[];
  guardrails: string[];
  sourceIds: string[];
  hasActionOutput: boolean;
};

export type MamaPresentationSection = {
  id: MamaProductSectionId;
  label: string;
  cards: MamaPresentationCard[];
};

export type MamaBoundarySurface = {
  title: string;
  detail: string;
};

export type MamaPresentationModel = {
  contractVersion: typeof MAMA_PRESENTATION_CONTRACT_VERSION;
  rulesetVersion: string;
  releaseGate: MamaProductSuccess["releaseGate"];
  policy: MamaProductSuccess["policy"];
  requiresAttention: boolean;
  automationBoundary: MamaAutomationBoundary;
  surface: MamaBoundarySurface;
  requestedInputs: MamaRequestedInput[];
  sections: MamaPresentationSection[];
  decisionContext: MamaProductSuccess["decisionContext"];
};

function summaryForState(state: PathwayState): string {
  switch (state.status) {
    case "Current":
      return "Há cobertura válida neste referencial com base no histórico mamográfico qualificável disponível.";
    case "Due":
      return "O Motor identificou mamografia de rastreamento indicada neste referencial.";
    case "NotApplicable":
    case "Indeterminate":
    case "ClinicalReviewRequired":
    case "Conflict":
      return state.reason;
    case "PendingResult":
      return "Há um resultado pendente antes de concluir este caminho.";
    case "InFollowUp":
      return "Há seguimento específico em andamento neste caminho.";
    case "SharedDecision":
      return "A próxima etapa exige decisão individual; o Motor não substitui a decisão clínica compartilhada.";
    case "HandedOff":
      return "O cuidado mamário específico já está sendo conduzido fora da rotina de rastreamento.";
    case "ComputationError":
      return state.message;
  }
}

function routeLabel(
  route: NonNullable<EvaluatedAction["operational"]>["route"],
): string {
  switch (route) {
    case "local":
      return "Disponível no serviço informado";
    case "referral":
      return "Encaminhamento / regulação";
    case "clinical_review":
      return "Revisar alternativa clínica ou operacional";
    case "clarify_availability":
      return "Confirmar disponibilidade antes de operacionalizar";
  }
}

function presentAction(action: EvaluatedAction): MamaPresentationAction {
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
  sectionId: MamaProductSectionId,
  track: TrackEvaluation,
): MamaPresentationCard {
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

function requestedInputsFor(
  sections: MamaPresentationSection[],
): MamaRequestedInput[] {
  const actions = sections.flatMap((section) =>
    section.cards.flatMap((card) => card.actions),
  );
  return actions.some(
    (action) =>
      action.resourceId === MAMA_IDS.resources.mammography &&
      action.operational?.availability === "unknown",
  )
    ? ["mammography_availability"]
    : [];
}

function prioritizeBoundaryTriggers(
  sections: MamaPresentationSection[],
  automationBoundary: MamaAutomationBoundary,
): MamaPresentationSection[] {
  const triggerIds = new Set(automationBoundary.triggerTrackIds);
  if (triggerIds.size === 0) return sections;
  const hasTrigger = (section: MamaPresentationSection) =>
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

function surfaceForBoundary(
  boundary: MamaAutomationBoundary,
): MamaBoundarySurface {
  switch (boundary.code) {
    case "CANNOT_CONCLUDE_SAFELY":
      return {
        title: "Não foi possível concluir com segurança",
        detail: "Há conflito, erro ou uma situação de revisão clínica não mapeada com segurança para a superfície do Motor.",
      };
    case "SPECIFIC_ATTENTION_REQUIRED":
      return {
        title: "Atenção específica",
        detail: "Há uma situação que interrompe o rastreamento de rotina e exige avaliação específica; o Motor não automatiza a investigação subsequente.",
      };
    case "SPECIFIC_CARE_ACTIVE":
      return {
        title: "Em acompanhamento específico",
        detail: "Já existe cuidado mamário específico ativo; o Motor não reinicia a rotina silenciosamente.",
      };
    case "MORE_INFORMATION_NEEDED":
      return {
        title: "Próxima informação necessária",
        detail: "Falta informação clínica ou histórica necessária para concluir com segurança.",
      };
    case "SHARED_DECISION":
      if (boundary.reasonCode === "insufficient-evidence")
        return {
          title: "Decisão individual",
          detail: "O referencial selecionado considera insuficiente a evidência para uma recomendação populacional automática nesta faixa etária.",
        };
      if (
        boundary.reasonCode === "continuation-conditioned-on-health-horizon"
      )
        return {
          title: "Decisão individual",
          detail: "A continuidade do rastreamento depende do contexto de saúde e do horizonte de benefício; o Motor não calcula prognóstico nesta versão.",
        };
      return {
        title: "Decisão individual",
        detail: "O referencial não determina uma recomendação automática neste cenário; riscos, benefícios e preferências precisam ser discutidos.",
      };
    case "ROUTINE_DUE":
      return {
        title: "Rastreamento indicado",
        detail: "A mamografia de rastreamento está indicada agora segundo o referencial selecionado e o histórico qualificável disponível.",
      };
    case "ROUTINE_CURRENT":
      return {
        title: "Em dia",
        detail: "Há mamografia de rastreamento qualificável dentro do intervalo do referencial selecionado.",
      };
    case "SCREENING_NOT_INDICATED":
      if (boundary.reasonCode === "under40-outside-recommendation-scope")
        return {
          title: "Fora do escopo da recomendação",
          detail: "Neste referencial, a recomendação populacional de risco habitual começa aos 40 anos; o Motor não inventa uma recomendação formal contra abaixo dessa idade.",
        };
      if (boundary.reasonCode === "under40-routine-not-recommended")
        return {
          title: "Rastreamento não indicado",
          detail: "Neste referencial, mamografia de rastreamento de rotina não é recomendada para este cenário de risco habitual abaixo dos 40 anos.",
        };
      return {
        title: "Rastreamento não indicado",
        detail: "O caminho avaliado não apresenta indicação de rastreamento mamográfico de rotina neste momento.",
      };
  }
}

export function presentMamaProduct(
  result: MamaProductSuccess,
): MamaPresentationModel {
  const automationBoundary = deriveMamaAutomationBoundary(result);
  const rawSections = result.sections.map((section) => ({
    id: section.id,
    label: section.label,
    cards: section.cards.map((card) =>
      presentTrack(card.topicId, section.id, card.track),
    ),
  }));
  const sections = prioritizeBoundaryTriggers(rawSections, automationBoundary);

  return {
    contractVersion: MAMA_PRESENTATION_CONTRACT_VERSION,
    rulesetVersion: result.rulesetVersion,
    releaseGate: result.releaseGate,
    policy: result.policy,
    requiresAttention: result.requiresAttention,
    automationBoundary,
    surface: surfaceForBoundary(automationBoundary),
    requestedInputs: requestedInputsFor(sections),
    sections,
    decisionContext: result.decisionContext,
  };
}
