import { DecisionSupportDefinitionSchema } from "../../model/content";

export const ba45To49DecisionSupport = DecisionSupportDefinitionSchema.parse({
  considerationId: "crc-ds-ba-45-49",
  text:
    "Na curadoria Brasil ampliado BA-A, 45–49 anos não vira rotina automática: discutir benefícios, danos, preferência e contexto clínico.",
});

export const baOver75DecisionSupport = DecisionSupportDefinitionSchema.parse({
  considerationId: "crc-ds-ba-over-75",
  text:
    "Acima de 75 anos, a policy BA-A não prolonga rastreamento automaticamente; a decisão deve ser individualizada.",
});

export const uspstf76To85DecisionSupport = DecisionSupportDefinitionSchema.parse({
  considerationId: "crc-ds-uspstf-76-85",
  text:
    "Entre 76 e 85 anos, considerar saúde geral, histórico prévio de rastreamento e preferências; não usar um cálculo automático de expectativa de vida.",
});

export const ccrDecisionSupport = [
  ba45To49DecisionSupport,
  baOver75DecisionSupport,
  uspstf76To85DecisionSupport,
];
