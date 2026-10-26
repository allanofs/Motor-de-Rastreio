import { ActionDefinitionSchema } from "../../model/content";
import { MAMA_IDS } from "./terminology";

export const mammographyScreeningAction = ActionDefinitionSchema.parse({
  actionId: "breast-action-screening-mammography",
  kind: "recommendation",
  text: "Oferecer mamografia de rastreamento conforme o referencial selecionado.",
  resourceId: MAMA_IDS.resources.mammography,
  unavailableRoute: "clinical_review",
});

export const breastSharedDecisionAction = ActionDefinitionSchema.parse({
  actionId: "breast-action-shared-decision",
  kind: "discussion",
  text:
    "Realizar decisão individual sobre rastreamento de câncer de mama conforme o referencial selecionado e o contexto clínico.",
});

export const breastInsufficientEvidenceAction = ActionDefinitionSchema.parse({
  actionId: "breast-action-insufficient-evidence",
  kind: "information",
  text:
    "O referencial selecionado considera insuficiente a evidência para uma recomendação populacional automática nesta faixa etária.",
});

export const breastSpecificAttentionAction = ActionDefinitionSchema.parse({
  actionId: "breast-action-specific-attention",
  kind: "information",
  text:
    "Há uma situação que exige avaliação específica fora do rastreamento de rotina; o Motor suspende a automação da rotina neste momento.",
});

export const breastSpecificCareActiveAction = ActionDefinitionSchema.parse({
  actionId: "breast-action-specific-care-active",
  kind: "information",
  text:
    "Há cuidado mamário específico já ativo; o Motor não reinicia o rastreamento de rotina silenciosamente.",
});

export const mamaActions = [
  mammographyScreeningAction,
  breastSharedDecisionAction,
  breastInsufficientEvidenceAction,
  breastSpecificAttentionAction,
  breastSpecificCareActiveAction,
];
