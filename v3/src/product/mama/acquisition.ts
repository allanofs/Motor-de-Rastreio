import { z } from "zod";
import {
  MAMA_CANDIDATE_RULESET_VERSION,
  MAMA_IDS,
} from "../../clinical/mama";
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
  MAMA_PRODUCT_RELEASE_GATE,
  evaluateMamaProduct,
  getMamaProductPolicyOptions,
  type MamaProductResult,
} from "./integration";

const UiAnswerSchema = z.enum(["yes", "no", "unknown", "not_asked"]);
const HistoryKnowledgeDraftSchema = z.enum([
  "known",
  "never_performed",
  "unknown",
  "not_asked",
]);
const AvailabilitySchema = z.enum(["available", "unavailable", "unknown"]);

const MammographyDraftSchema = z.strictObject({
  kind: z.literal("mammography"),
  id: IdSchema,
  role: z.enum(["screening", "diagnostic"]),
  date: z.string().optional(),
  disposition: z.enum([
    "routine_return",
    "specific_attention",
    "indeterminate",
    "pending",
    "unknown",
  ]),
  quality: z.enum(["adequate", "inadequate", "unknown"]).default("unknown"),
  completeness: z.enum(["complete", "incomplete", "unknown"]).default("unknown"),
  resolutionInformation: z
    .enum(["sufficient", "insufficient", "unknown"])
    .default("unknown"),
});

/**
 * UI-facing acquisition contract for the first Mama product surface.
 *
 * `not_asked` means progressive acquisition has not reached that question yet.
 * `unknown` is a real user/clinical answer and must reach the engine as unknown.
 *
 * The contract intentionally contains NO generic family-history details and NO
 * risk-calculator inputs. `knownHighRiskFamilialContext=yes` means that high
 * familial risk was already established externally; the UI/normalizer must not
 * derive it from relatives, ages or counts.
 */
export const MamaProductDraftSchema = z
  .strictObject({
    policyId: IdSchema,
    asOf: z.string(),
    ageYears: z.number().int().min(0).max(150).optional(),

    screeningContext: UiAnswerSchema.default("not_asked"),
    relevantBreastTissuePresent: UiAnswerSchema.default("not_asked"),

    suspiciousBreastSymptoms: UiAnswerSchema.default("not_asked"),
    priorBreastCancer: UiAnswerSchema.default("not_asked"),
    highRiskGeneticContext: UiAnswerSchema.default("not_asked"),
    knownHighRiskFamilialContext: UiAnswerSchema.default("not_asked"),
    priorHighRiskChestRadiation: UiAnswerSchema.default("not_asked"),
    priorHighRiskBreastLesion: UiAnswerSchema.default("not_asked"),
    specificBreastCareActive: UiAnswerSchema.default("not_asked"),

    historyKnowledge: HistoryKnowledgeDraftSchema.default("not_asked"),
    historySufficientForCurrentStatus: UiAnswerSchema.default("not_asked"),
    priorMammographyAllowsRoutine: UiAnswerSchema.default("not_asked"),
    priorMammographyNeedsSpecificAttention:
      UiAnswerSchema.default("not_asked"),
    mammographies: z.array(MammographyDraftSchema).default([]),

    careSetting: z
      .strictObject({ mammography: AvailabilitySchema.optional() })
      .default({}),
  })
  .superRefine((draft, ctx) => {
    if (draft.mammographies.length > 0 && draft.historyKnowledge !== "known") {
      ctx.addIssue({
        code: "custom",
        path: ["historyKnowledge"],
        message: "mammography records require historyKnowledge=known",
      });
    }

    if (
      draft.historyKnowledge === "never_performed" &&
      draft.mammographies.length > 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["mammographies"],
        message: "never_performed cannot coexist with mammography records",
      });
    }

    if (
      draft.historyKnowledge === "never_performed" &&
      (draft.priorMammographyAllowsRoutine === "yes" ||
        draft.priorMammographyNeedsSpecificAttention === "yes")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["historyKnowledge"],
        message:
          "never_performed cannot coexist with a positive prior-mammography status",
      });
    }

    if (
      draft.priorMammographyAllowsRoutine === "yes" &&
      draft.priorMammographyNeedsSpecificAttention === "yes"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["priorMammographyNeedsSpecificAttention"],
        message:
          "current routine clearance and unresolved specific attention cannot both be yes",
      });
    }
  });

export type MamaProductDraft = z.infer<typeof MamaProductDraftSchema>;

export type MamaNormalizedProductInput = {
  patient: Patient;
  policyId: string;
  asOf: CalendarDate;
  careSetting: CareSettingContext;
};

export type MamaProductNormalizationFailure = {
  ok: false;
  stage: "normalization";
  rulesetVersion: string;
  releaseGate: typeof MAMA_PRODUCT_RELEASE_GATE;
  code: "invalid_form";
  issues: string[];
};

export type MamaProductNormalizationResult =
  | { ok: true; value: MamaNormalizedProductInput }
  | MamaProductNormalizationFailure;

export type MamaProductDraftEvaluationResult =
  | MamaProductResult
  | MamaProductNormalizationFailure;

function issue(path: string, message: string): string {
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

function historySufficiencyFacts(draft: MamaProductDraft): ClinicalFact[] {
  if (draft.historyKnowledge === "never_performed")
    return factFromAnswer(
      "ui-breast-history-sufficient",
      MAMA_IDS.concepts.historySufficientForCurrentStatus,
      "population_context",
      "yes",
    );

  if (draft.historyKnowledge === "unknown")
    return factFromAnswer(
      "ui-breast-history-sufficient",
      MAMA_IDS.concepts.historySufficientForCurrentStatus,
      "population_context",
      "unknown",
    );

  if (draft.historyKnowledge !== "known") return [];
  return factFromAnswer(
    "ui-breast-history-sufficient",
    MAMA_IDS.concepts.historySufficientForCurrentStatus,
    "population_context",
    draft.historySufficientForCurrentStatus,
  );
}

function priorMammographyStatusFacts(draft: MamaProductDraft): ClinicalFact[] {
  if (draft.historyKnowledge === "never_performed")
    return [
      ...factFromAnswer(
        "ui-breast-prior-mammography-allows-routine",
        MAMA_IDS.concepts.priorMammographyAllowsRoutine,
        "population_context",
        "no",
      ),
      ...factFromAnswer(
        "ui-breast-prior-mammography-needs-attention",
        MAMA_IDS.concepts.priorMammographyNeedsSpecificAttention,
        "population_context",
        "no",
      ),
    ];

  return [
    ...factFromAnswer(
      "ui-breast-prior-mammography-allows-routine",
      MAMA_IDS.concepts.priorMammographyAllowsRoutine,
      "population_context",
      draft.priorMammographyAllowsRoutine,
    ),
    ...factFromAnswer(
      "ui-breast-prior-mammography-needs-attention",
      MAMA_IDS.concepts.priorMammographyNeedsSpecificAttention,
      "population_context",
      draft.priorMammographyNeedsSpecificAttention,
    ),
  ];
}

function normalizeMammography(
  draft: z.infer<typeof MammographyDraftSchema>,
): ExamRecord {
  const modality =
    draft.role === "screening"
      ? MAMA_IDS.modalities.mammographyScreening
      : MAMA_IDS.modalities.mammographyDiagnostic;

  const result: ExamRecord extends infer _ ? unknown : never = undefined;
  void result;

  const normalizedResult =
    draft.disposition === "routine_return"
      ? { status: "final" as const, code: MAMA_IDS.results.routineClearing }
      : draft.disposition === "specific_attention"
        ? {
            status: "final" as const,
            code: MAMA_IDS.results.attentionRequired,
          }
        : draft.disposition === "indeterminate"
          ? { status: "final" as const, code: MAMA_IDS.results.indeterminate }
          : draft.disposition === "pending"
            ? { status: "pending" as const }
            : { status: "unknown" as const };

  return {
    id: draft.id,
    topicId: MAMA_IDS.topic,
    modality,
    status: "performed",
    ...(draft.date === undefined ? {} : { date: parsePartialDate(draft.date) }),
    result: normalizedResult,
    quality: draft.quality,
    completeness: draft.completeness,
    resolutionInformation: draft.resolutionInformation,
  };
}

function normalizedHistoryKnowledge(
  draft: MamaProductDraft,
): Record<string, "known" | "never_performed" | "unknown"> {
  if (draft.historyKnowledge === "not_asked") return {};
  return { [MAMA_IDS.topic]: draft.historyKnowledge };
}

export function normalizeMamaProductDraft(
  input: unknown,
): MamaProductNormalizationResult {
  const parsed = MamaProductDraftSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      stage: "normalization",
      rulesetVersion: MAMA_CANDIDATE_RULESET_VERSION,
      releaseGate: MAMA_PRODUCT_RELEASE_GATE,
      code: "invalid_form",
      issues: parsed.error.issues.map((entry) =>
        issue(entry.path.join("."), entry.message),
      ),
    };

  const draft = parsed.data;
  const policy = getMamaProductPolicyOptions().find(
    (candidate) => candidate.policyId === draft.policyId,
  );
  if (policy === undefined)
    return {
      ok: false,
      stage: "normalization",
      rulesetVersion: MAMA_CANDIDATE_RULESET_VERSION,
      releaseGate: MAMA_PRODUCT_RELEASE_GATE,
      code: "invalid_form",
      issues: ["policyId: referencial clínico não reconhecido"],
    };

  try {
    const facts: ClinicalFact[] = [
      ...factFromAnswer(
        "ui-breast-screening-context",
        MAMA_IDS.concepts.screeningContextConfirmed,
        "population_context",
        draft.screeningContext,
      ),
      ...factFromAnswer(
        "ui-breast-relevant-tissue",
        MAMA_IDS.concepts.relevantBreastTissuePresent,
        "population_context",
        draft.relevantBreastTissuePresent,
      ),
      ...factFromAnswer(
        "ui-breast-suspicious-symptoms",
        MAMA_IDS.concepts.suspiciousBreastSymptoms,
        "symptom",
        draft.suspiciousBreastSymptoms,
      ),
      ...factFromAnswer(
        "ui-breast-prior-cancer",
        MAMA_IDS.concepts.priorBreastCancer,
        "condition",
        draft.priorBreastCancer,
      ),
      ...factFromAnswer(
        "ui-breast-high-risk-genetic",
        MAMA_IDS.concepts.highRiskGeneticContext,
        "condition",
        draft.highRiskGeneticContext,
      ),
      ...factFromAnswer(
        "ui-breast-known-high-risk-familial",
        MAMA_IDS.concepts.knownHighRiskFamilialContext,
        "family_history",
        draft.knownHighRiskFamilialContext,
      ),
      ...factFromAnswer(
        "ui-breast-high-risk-chest-radiation",
        MAMA_IDS.concepts.priorHighRiskChestRadiation,
        "exposure",
        draft.priorHighRiskChestRadiation,
      ),
      ...factFromAnswer(
        "ui-breast-high-risk-lesion",
        MAMA_IDS.concepts.priorHighRiskBreastLesion,
        "condition",
        draft.priorHighRiskBreastLesion,
      ),
      ...factFromAnswer(
        "ui-breast-specific-care-active",
        MAMA_IDS.concepts.specificBreastCareActive,
        "population_context",
        draft.specificBreastCareActive,
      ),
      ...historySufficiencyFacts(draft),
      ...priorMammographyStatusFacts(draft),
    ];

    const patient = PatientSchema.parse({
      context: {
        ...(draft.ageYears === undefined ? {} : { ageYears: draft.ageYears }),
      },
      facts,
      examHistory: draft.mammographies.map(normalizeMammography),
      historyKnowledge: normalizedHistoryKnowledge(draft),
    });

    const resources: Record<
      string,
      "available" | "unavailable" | "unknown"
    > = {};
    if (draft.careSetting.mammography !== undefined)
      resources[MAMA_IDS.resources.mammography] = draft.careSetting.mammography;

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
      rulesetVersion: MAMA_CANDIDATE_RULESET_VERSION,
      releaseGate: MAMA_PRODUCT_RELEASE_GATE,
      code: "invalid_form",
      issues: [
        error instanceof Error
          ? error.message
          : "Entrada de Mama não pôde ser normalizada com segurança",
      ],
    };
  }
}

export function evaluateMamaProductDraft(
  input: unknown,
): MamaProductDraftEvaluationResult {
  const normalized = normalizeMamaProductDraft(input);
  if (!normalized.ok) return normalized;
  return evaluateMamaProduct(normalized.value);
}
