import { ActionDefinitionSchema } from "../../model/content";
import { CCR_IDS } from "./terminology";

export const fitScreeningAction = ActionDefinitionSchema.parse({
  actionId: "crc-action-fit-screening",
  kind: "recommendation",
  text: "Oferecer FIT de rastreamento conforme a política selecionada.",
  resourceId: CCR_IDS.resources.fit,
  unavailableRoute: "clinical_review",
});

export const offerScreeningStrategyAction = ActionDefinitionSchema.parse({
  actionId: "crc-action-offer-screening-strategy",
  kind: "recommendation",
  text:
    "Oferecer rastreamento de câncer colorretal e selecionar uma estratégia elegível com o paciente.",
});

export const sharedDecisionAction = ActionDefinitionSchema.parse({
  actionId: "crc-action-shared-decision",
  kind: "discussion",
  text:
    "Realizar decisão compartilhada sobre rastreamento, considerando o referencial selecionado e o contexto clínico.",
});

export const clinicalReviewAction = ActionDefinitionSchema.parse({
  actionId: "crc-action-clinical-review",
  kind: "discussion",
  text:
    "Revisar individualmente a indicação de rastreamento; não prolongar a rotina de forma automática.",
});

export const outsideRoutineInfoAction = ActionDefinitionSchema.parse({
  actionId: "crc-action-outside-routine-info",
  kind: "information",
  text:
    "Fora da faixa etária de rotina desta policy. Esta regra não encerra follow-up diagnóstico já aberto nem substitui avaliação clínica.",
});

export const avoidRoutineAfter85Action = ActionDefinitionSchema.parse({
  actionId: "crc-action-avoid-routine-after-85",
  kind: "avoid",
  text:
    "Não oferecer rastreamento colorretal de rotina após 85 anos apenas por indicação populacional average-risk; follow-up diagnóstico aberto permanece fora desta regra.",
});

export const ccrActions = [
  fitScreeningAction,
  offerScreeningStrategyAction,
  sharedDecisionAction,
  clinicalReviewAction,
  outsideRoutineInfoAction,
  avoidRoutineAfter85Action,
];
