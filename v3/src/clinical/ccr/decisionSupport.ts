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

export const positiveFitFollowupDecisionSupport =
  DecisionSupportDefinitionSchema.parse({
    considerationId: "crc-ds-fit-positive-followup",
    text:
      "FIT positivo abre investigação diagnóstica com colonoscopia. Um FIT negativo posterior não encerra esse episódio.",
  });

export const inadequateColonoscopyDecisionSupport =
  DecisionSupportDefinitionSchema.parse({
    considerationId: "crc-ds-inadequate-colonoscopy",
    text:
      "Colonoscopia incompleta, com preparo inadequado ou informação insuficiente não fecha o episódio de FIT positivo. O piloto não inventa um deadline universal de repetição.",
  });

export const invalidFitDecisionSupport = DecisionSupportDefinitionSchema.parse({
  considerationId: "crc-ds-invalid-fit",
  text:
    "FIT inválido, inconclusivo ou de status desconhecido não equivale a resultado negativo, não ancora intervalo e não recebe prazo universal automático de repetição no piloto.",
});

export const brazilPostFitClockDecisionSupport =
  DecisionSupportDefinitionSchema.parse({
    considerationId: "crc-ds-brazil-post-fit-clock",
    text:
      "Uma colonoscopia diagnóstica normal, completa e adequada pode encerrar a investigação do FIT positivo, mas o próximo relógio de rotina SUS/BA-A permanece deliberadamente não automatizado até fonte brasileira final suficiente.",
  });

export const ccrDecisionSupport = [
  ba45To49DecisionSupport,
  baOver75DecisionSupport,
  uspstf76To85DecisionSupport,
  positiveFitFollowupDecisionSupport,
  inadequateColonoscopyDecisionSupport,
  invalidFitDecisionSupport,
  brazilPostFitClockDecisionSupport,
];
