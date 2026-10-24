import { z } from "zod";
import {
  CCR_FAMILY_DETAIL_KEYS,
  CCR_IDS,
  CCR_STRATEGY_VALUES,
} from "../../clinical/ccr";
import { IdSchema } from "../../model/common";
import {
  CareSettingContextSchema,
  type CareSettingContext,
} from "../../model/content";
import {
  parseCalendarDate,
  parsePartialDate,
  type CalendarDate,
} from "../../model/dates";
import {
  PatientSchema,
  type ClinicalFact,
  type ExamRecord,
  type Patient,
} from "../../model/patient";
import {
  CCR_PRODUCT_RELEASE_GATE,
  evaluateCcrProduct,
  getCcrProductPolicyOptions,
  type CcrProductResult,
} from "./integration";
import { CCR_CANDIDATE_RULESET_VERSION } from "../../clinical/ccr";

const UiAnswerSchema = z.enum(["yes", "no", "unknown", "not_asked"]);
const HistoryKnowledgeDraftSchema = z.enum([
  "known",
  "never_performed",
  "unknown",
  "not_asked",
]);
const AvailabilitySchema = z.enum(["available", "unavailable", "unknown"]);

const FamilyDetailsSchema = z.strictObject({
  affectedFdrCount: z.number().int().min(0).max(20).optional(),
  affectedSdrCount: z.number().int().min(0).max(20).optional(),
  youngestDiagnosisAgeBand: z
    .enum(["under-60", "60-or-older", "unknown"])
    .optional(),
  youngestDiagnosisAgeYears: z.number().int().min(0).max(120).optional(),
  findingType: z
    .enum(["crc", "advanced-polyp", "polyp-unknown-type", "unknown"])
    .optional(),
});

const FitDraftSchema = z.strictObject({
  kind: z.literal("fit"),
  id: IdSchema,
  status: z.enum(["performed", "not_performed", "unknown"]),
  date: z.string().optional(),
  result: z
    .enum(["positive", "negative", "pending", "invalid", "unknown"])
    .optional(),
});

const ColonoscopyDraftSchema = z.strictObject({
  kind: z.literal("colonoscopy"),
  id: IdSchema,
  status: z.enum(["performed", "not_performed", "unknown"]),
  role: z
    .enum(["screening", "post_fit_positive", "other_or_unknown"])
    .default("other_or_unknown"),
  date: z.string().optional(),
  result: z
    .enum(["normal", "polyp_or_lesion", "cancer", "pending", "unknown"])
    .optional(),
  preparation: z.enum(["adequate", "inadequate", "unknown"]).optional(),
  completeness: z.enum(["complete", "incomplete", "unknown"]).optional(),
  resolutionInformation: z
    .enum(["sufficient", "insufficient", "unknown"])
    .optional(),
});

export const CcrProductDraftSchema = z.strictObject({
  policyId: IdSchema,
  asOf: z.string(),
  ageYears: z.number().int().min(0).max(150).optional(),
  screeningContext: UiAnswerSchema.default("not_asked"),
  priorCrc: UiAnswerSchema.default("not_asked"),
  priorPolypSurveillance: UiAnswerSchema.default("not_asked"),
  colonicIbd: UiAnswerSchema.default("not_asked"),
  hereditarySyndrome: UiAnswerSchema.default("not_asked"),
  familyHistory: UiAnswerSchema.default("not_asked"),
  familyDetails: FamilyDetailsSchema.optional(),
  historyKnowledge: HistoryKnowledgeDraftSchema.default("not_asked"),
  historySufficientForCurrentStatus: UiAnswerSchema.default("not_asked"),
  strategySelection: z
    .enum(["fit", "colonoscopy", "unselected"])
    .default("unselected"),
  specialistCareAssumed: UiAnswerSchema.default("not_asked"),
  exams: z.array(z.discriminatedUnion("kind", [FitDraftSchema, ColonoscopyDraftSchema])).default([]),
  careSetting: z
    .strictObject({
      fit: AvailabilitySchema.optional(),
      colonoscopy: AvailabilitySchema.optional(),
    })
    .default({}),
});

export type CcrProductDraft = z.infer<typeof CcrProductDraftSchema>;

export type CcrNormalizedProductInput = {
  patient: Patient;
  policyId: string;
  asOf: CalendarDate;
  careSetting: CareSettingContext;
};

export type CcrProductNormalizationFailure = {
  ok: false;
  stage: "normalization";
  rulesetVersion: string;
  releaseGate: typeof CCR_PRODUCT_RELEASE_GATE;
  code: "invalid_form";
  issues: string[];
};

export type CcrProductNormalizationResult =
  | { ok: true; value: CcrNormalizedProductInput }
  | CcrProductNormalizationFailure;

export type CcrProductDraftEvaluationResult =
  | CcrProductResult
  | CcrProductNormalizationFailure;

function issue(path: string, message: string) {
  return path.length > 0 ? `${path}: ${message}` : message;
}

function factFromAnswer(
  id: string,
  conceptId: string,
  category: ClinicalFact["category"],
  answer: "yes" | "no" | "unknown" | "not_asked",
): ClinicalFact[] {
  if (answer === "not_asked") return [];
  return [
    {
      id,
      conceptId,
      category,
      presence: answer,
    } as ClinicalFact,
  ];
}

function familyFact(draft: CcrProductDraft): ClinicalFact[] {
  if (draft.familyHistory === "not_asked") return [];
  if (draft.familyHistory !== "yes")
    return [
      {
        id: "ui-crc-family-history",
        conceptId: CCR_IDS.concepts.familyHistoryRelevant,
        category: "family_history",
        presence: draft.familyHistory,
      } as ClinicalFact,
    ];

  const details = draft.familyDetails;
  const normalizedDetails: Record<string, string | number | boolean> = {};
  if (details?.affectedFdrCount !== undefined)
    normalizedDetails[CCR_FAMILY_DETAIL_KEYS.affectedFdrCount] =
      details.affectedFdrCount;
  if (details?.affectedSdrCount !== undefined)
    normalizedDetails[CCR_FAMILY_DETAIL_KEYS.affectedSdrCount] =
      details.affectedSdrCount;
  if (details?.youngestDiagnosisAgeBand !== undefined)
    normalizedDetails[CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand] =
      details.youngestDiagnosisAgeBand;
  if (details?.youngestDiagnosisAgeYears !== undefined)
    normalizedDetails[CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeYears] =
      details.youngestDiagnosisAgeYears;
  if (details?.findingType !== undefined)
    normalizedDetails[CCR_FAMILY_DETAIL_KEYS.findingType] = details.findingType;

  return [
    {
      id: "ui-crc-family-history",
      conceptId: CCR_IDS.concepts.familyHistoryRelevant,
      category: "family_history",
      presence: "yes",
      ...(Object.keys(normalizedDetails).length === 0
        ? {}
        : { details: normalizedDetails }),
    },
  ];
}

function strategyFact(draft: CcrProductDraft): ClinicalFact[] {
  const policy = getCcrProductPolicyOptions().find(
    (candidate) => candidate.policyId === draft.policyId,
  );
  if (
    policy === undefined ||
    policy.family === "sus_oficial" ||
    draft.strategySelection === "unselected"
  )
    return [];

  return [
    {
      id: "ui-crc-strategy-selection",
      conceptId: CCR_IDS.concepts.screeningStrategySelection,
      category: "population_context",
      presence: "yes",
      value:
        draft.strategySelection === "fit"
          ? CCR_STRATEGY_VALUES.fit
          : CCR_STRATEGY_VALUES.colonoscopy,
    },
  ];
}

function historySufficiencyFact(draft: CcrProductDraft): ClinicalFact[] {
  if (
    draft.historyKnowledge !== "known" ||
    draft.historySufficientForCurrentStatus === "not_asked"
  )
    return [];

  return factFromAnswer(
    "ui-crc-history-sufficient",
    CCR_IDS.concepts.historySufficientForCurrentStatus,
    "population_context",
    draft.historySufficientForCurrentStatus,
  );
}

function parseOptionalPartialDate(value: string | undefined) {
  return value === undefined ? undefined : parsePartialDate(value);
}

function normalizeFit(
  draft: z.infer<typeof FitDraftSchema>,
): ExamRecord {
  if (draft.status !== "performed")
    return {
      id: draft.id,
      topicId: CCR_IDS.topic,
      modality: CCR_IDS.modalities.fit,
      status: draft.status,
    };

  const result = draft.result ?? "unknown";
  return {
    id: draft.id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.fit,
    status: "performed",
    ...(draft.date === undefined
      ? {}
      : { date: parseOptionalPartialDate(draft.date) }),
    result:
      result === "positive" || result === "negative"
        ? { status: "final", code: result }
        : { status: result },
    quality:
      result === "positive" || result === "negative" ? "adequate" : "unknown",
    completeness: "not_applicable",
    resolutionInformation:
      result === "positive" || result === "negative"
        ? "sufficient"
        : "unknown",
  };
}

function normalizeColonoscopy(
  draft: z.infer<typeof ColonoscopyDraftSchema>,
): ExamRecord {
  const modality =
    draft.role === "screening"
      ? CCR_IDS.modalities.colonoscopyScreening
      : draft.role === "post_fit_positive"
        ? CCR_IDS.modalities.colonoscopyDiagnostic
        : CCR_IDS.modalities.colonoscopy;

  if (draft.status !== "performed")
    return {
      id: draft.id,
      topicId: CCR_IDS.topic,
      modality,
      status: draft.status,
    };

  const result = draft.result ?? "unknown";
  const normalizedResult =
    result === "normal"
      ? { status: "final" as const, code: CCR_IDS.results.colonoscopyNormal }
      : result === "polyp_or_lesion"
        ? {
            status: "final" as const,
            code: CCR_IDS.results.colonoscopyPolypOrLesion,
          }
        : result === "cancer"
          ? {
              status: "final" as const,
              code: CCR_IDS.results.colonoscopyCancer,
            }
          : { status: result as "pending" | "unknown" };

  return {
    id: draft.id,
    topicId: CCR_IDS.topic,
    modality,
    status: "performed",
    ...(draft.date === undefined
      ? {}
      : { date: parseOptionalPartialDate(draft.date) }),
    result: normalizedResult,
    quality: draft.preparation ?? "unknown",
    completeness: draft.completeness ?? "unknown",
    resolutionInformation: draft.resolutionInformation ?? "unknown",
  };
}

function normalizeExams(draft: CcrProductDraft): ExamRecord[] {
  return draft.exams.map((exam) =>
    exam.kind === "fit" ? normalizeFit(exam) : normalizeColonoscopy(exam),
  );
}

export function normalizeCcrProductDraft(
  input: unknown,
): CcrProductNormalizationResult {
  const parsed = CcrProductDraftSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      stage: "normalization",
      rulesetVersion: CCR_CANDIDATE_RULESET_VERSION,
      releaseGate: CCR_PRODUCT_RELEASE_GATE,
      code: "invalid_form",
      issues: parsed.error.issues.map((entry) =>
        issue(entry.path.join("."), entry.message),
      ),
    };

  const draft = parsed.data;
  const policy = getCcrProductPolicyOptions().find(
    (candidate) => candidate.policyId === draft.policyId,
  );
  if (policy === undefined)
    return {
      ok: false,
      stage: "normalization",
      rulesetVersion: CCR_CANDIDATE_RULESET_VERSION,
      releaseGate: CCR_PRODUCT_RELEASE_GATE,
      code: "invalid_form",
      issues: ["policyId: referencial clínico não reconhecido"],
    };

  try {
    const facts: ClinicalFact[] = [
      ...factFromAnswer(
        "ui-crc-screening-context",
        CCR_IDS.concepts.screeningContextConfirmed,
        "population_context",
        draft.screeningContext,
      ),
      ...factFromAnswer(
        "ui-crc-prior-crc",
        CCR_IDS.concepts.priorCrc,
        "condition",
        draft.priorCrc,
      ),
      ...factFromAnswer(
        "ui-crc-prior-polyp-surveillance",
        CCR_IDS.concepts.priorPolypSurveillance,
        "condition",
        draft.priorPolypSurveillance,
      ),
      ...factFromAnswer(
        "ui-crc-colonic-ibd",
        CCR_IDS.concepts.colonicIbd,
        "condition",
        draft.colonicIbd,
      ),
      ...factFromAnswer(
        "ui-crc-hereditary-syndrome",
        CCR_IDS.concepts.hereditarySyndrome,
        "condition",
        draft.hereditarySyndrome,
      ),
      ...familyFact(draft),
      ...strategyFact(draft),
      ...historySufficiencyFact(draft),
      ...factFromAnswer(
        "ui-crc-specialist-care-assumed",
        CCR_IDS.concepts.specialistCareAssumed,
        "population_context",
        draft.specialistCareAssumed,
      ),
    ];

    const historyKnowledge: Record<string, "known" | "never_performed" | "unknown"> = {};
    if (draft.historyKnowledge !== "not_asked")
      historyKnowledge[CCR_IDS.topic] = draft.historyKnowledge;

    const patient = PatientSchema.parse({
      context: {
        ...(draft.ageYears === undefined ? {} : { ageYears: draft.ageYears }),
      },
      facts,
      examHistory: normalizeExams(draft),
      historyKnowledge,
    });

    const resources: Record<string, "available" | "unavailable" | "unknown"> = {};
    if (draft.careSetting.fit !== undefined)
      resources[CCR_IDS.resources.fit] = draft.careSetting.fit;
    if (draft.careSetting.colonoscopy !== undefined)
      resources[CCR_IDS.resources.colonoscopy] = draft.careSetting.colonoscopy;

    return {
      ok: true,
      value: {
        patient,
        policyId: draft.policyId,
        asOf: parseCalendarDate(draft.asOf),
        careSetting: CareSettingContextSchema.parse({ resources }),
      },
    };
  } catch (error) {
    return {
      ok: false,
      stage: "normalization",
      rulesetVersion: CCR_CANDIDATE_RULESET_VERSION,
      releaseGate: CCR_PRODUCT_RELEASE_GATE,
      code: "invalid_form",
      issues: [
        error instanceof Error
          ? error.message
          : "Entrada não pôde ser normalizada com segurança",
      ],
    };
  }
}

export function evaluateCcrProductDraft(
  input: unknown,
): CcrProductDraftEvaluationResult {
  const normalized = normalizeCcrProductDraft(input);
  if (!normalized.ok) return normalized;
  return evaluateCcrProduct(normalized.value);
}
