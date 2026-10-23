import { z } from "zod";
import { IdSchema, PresenceSchema, ScalarSchema } from "./common";
import { CalendarDateSchema, CalendarDurationSchema } from "./dates";
export const SourceSchema = z.strictObject({
  sourceId: IdSchema,
  institution: z.string().min(1),
  documentTitle: z.string().min(1),
  publicationYear: z.number().int().min(1).max(9999),
  version: z.string().min(1),
  jurisdiction: z.string().min(1),
  documentStatus: z.enum([
    "final",
    "draft",
    "preliminary",
    "withdrawn",
    "superseded",
  ]),
  url: z.url({ protocol: /^https?$/ }),
  lastVerifiedAt: CalendarDateSchema,
  gradingSystem: z.string().optional(),
  supersededBy: IdSchema.optional(),
});
export type Source = z.infer<typeof SourceSchema>;
export const EvidenceMetadataSchema = z.strictObject({
  gradingSystem: z.string().min(1),
  recommendationStrength: z.string().min(1).optional(),
  evidenceCertainty: z.string().min(1).optional(),
  rawGrade: z.string().min(1).optional(),
  gradeVerified: z.boolean().default(false),
});
export type EvidenceMetadata = z.infer<typeof EvidenceMetadataSchema>;
export const DecisionSupportDefinitionSchema = z.strictObject({
  considerationId: IdSchema,
  text: z.string().min(1),
});
export const ClinicalReviewSchema = z.strictObject({
  reviewer: z.string().min(1),
  reviewedAt: CalendarDateSchema,
});
export const SourceRefSchema = z.strictObject({
  sourceId: IdSchema,
  locator: z.string().min(1),
  evidence: EvidenceMetadataSchema.optional(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;
export const CriteriaSchema = z
  .strictObject({
    minAge: z.number().int().min(0).max(150).optional(),
    maxAge: z.number().int().min(0).max(150).optional(),
    facts: z
      .array(
        z.strictObject({
          conceptId: IdSchema,
          presence: PresenceSchema,
          value: ScalarSchema.optional(),
        }),
      )
      .default([]),
  })
  .refine(
    (c) =>
      c.minAge === undefined || c.maxAge === undefined || c.minAge <= c.maxAge,
    "Reversed age limits",
  );
export type Criteria = z.infer<typeof CriteriaSchema>;
export const ActionDefinitionSchema = z.strictObject({
  actionId: IdSchema,
  kind: z.enum([
    "recommendation",
    "avoid",
    "discussion",
    "information",
    "referral",
  ]),
  text: z.string().min(1),
  resourceId: IdSchema.optional(),
  unavailableRoute: z.enum(["referral", "clinical_review"]).optional(),
});
export type ActionDefinition = z.infer<typeof ActionDefinitionSchema>;
export const QualifyingEventSpecSchema = z.strictObject({
  modality: IdSchema,
  resultCodes: z.array(IdSchema).min(1),
  requireAdequateQuality: z.boolean(),
  requireComplete: z.boolean(),
  requireSufficientResolution: z.boolean(),
});
export type QualifyingEventSpec = z.infer<typeof QualifyingEventSpecSchema>;
export const RuleDefinitionSchema = z
  .strictObject({
    ruleId: IdSchema,
    topicId: IdSchema,
    trackId: IdSchema,
    strategyGroupId: IdSchema.optional(),
    lifecycleStatus: z.enum(["draft", "active", "deprecated", "withdrawn"]),
    reviewStatus: z.enum([
      "unreviewed",
      "source_verified",
      "reviewed_by_1",
      "reviewed_by_2",
    ]),
    clinicalRole: z.enum([
      "screening",
      "diagnostic",
      "follow_up",
      "prevention",
      "technical",
      "monitoring",
      "surveillance",
    ]),
    stance: z.enum([
      "recommend",
      "recommend_against",
      "shared_decision",
      "insufficient_evidence",
      "no_formal_recommendation",
    ]),
    computability: z.enum([
      "computable",
      "partially_computable",
      "clinician_judgment_required",
    ]),
    requiredKnownFacts: z.array(IdSchema),
    population: CriteriaSchema,
    exclusions: z.array(CriteriaSchema),
    actions: z.array(ActionDefinitionSchema),
    outcome: z.enum([
      "NotApplicable",
      "Due",
      "PendingResult",
      "InFollowUp",
      "SharedDecision",
      "ClinicalReviewRequired",
      "HandedOff",
    ]),
    qualifyingEventSpec: QualifyingEventSpecSchema.optional(),
    scheduleSpec: CalendarDurationSchema.optional(),
    noQualifyingEventBehavior: z
      .strictObject({
        neverPerformed: z
          .enum(["indeterminate", "due"])
          .default("indeterminate"),
      })
      .optional(),
    decisionSupport: z.array(DecisionSupportDefinitionSchema).default([]),
    supersedes: z.array(IdSchema),
    excludes: z.array(IdSchema),
    compositionPolicy: z
      .enum([
        "replace",
        "combine_actions",
        "choose_shorter_interval",
        "choose_higher_acuity",
        "manual_conflict",
      ])
      .optional(),
    guardrails: z.array(z.string()),
    sourceRefs: z.array(SourceRefSchema).min(1),
    governance: z.strictObject({
      author: z.string().min(1),
      rationale: z.string().min(1),
      reviews: z.array(ClinicalReviewSchema).default([]),
    }),
  })
  .superRefine((r, ctx) => {
    const reviewers = new Set(
      r.governance.reviews.map((review) => review.reviewer),
    );
    if (
      r.lifecycleStatus === "active" &&
      !["reviewed_by_1", "reviewed_by_2"].includes(r.reviewStatus)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Active rules require clinical interpretation review, not only source verification",
      });
    if (
      (r.reviewStatus === "reviewed_by_1" && reviewers.size < 1) ||
      (r.reviewStatus === "reviewed_by_2" && reviewers.size < 2)
    )
      ctx.addIssue({
        code: "custom",
        message: "Review status requires distinct reviewer records with dates",
      });
    if (reviewers.size !== r.governance.reviews.length)
      ctx.addIssue({
        code: "custom",
        message: "Duplicate reviewer cannot count as multiple reviews",
      });
    if (
      r.noQualifyingEventBehavior !== undefined &&
      (r.scheduleSpec === undefined || r.qualifyingEventSpec === undefined)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "No-qualifier behavior requires a declared history-dependent schedule",
      });
    if (r.scheduleSpec !== undefined && r.outcome !== "Due")
      ctx.addIssue({
        code: "custom",
        message:
          "Routine interval scheduling cannot close another pathway outcome",
      });
    if (r.scheduleSpec !== undefined && r.qualifyingEventSpec === undefined)
      ctx.addIssue({
        code: "custom",
        message: "Schedule requires qualifying event specification",
      });
    const kinds = r.actions.map((a) => a.kind);
    if (
      r.stance === "recommend_against" &&
      kinds.some((k) => k !== "avoid" && k !== "information")
    )
      ctx.addIssue({ code: "custom", message: "Stance/action contradiction" });
    if (
      ["insufficient_evidence", "no_formal_recommendation"].includes(
        r.stance,
      ) &&
      kinds.some((k) => k !== "information" && k !== "discussion")
    )
      ctx.addIssue({
        code: "custom",
        message: "Evidence absence cannot become a recommendation",
      });
    if (
      r.stance === "shared_decision" &&
      kinds.some((k) => k !== "discussion" && k !== "information")
    )
      ctx.addIssue({
        code: "custom",
        message: "Shared decision requires discussion",
      });
  });
export type RuleDefinition = z.infer<typeof RuleDefinitionSchema>;
export const PolicySchema = z.strictObject({
  policyId: IdSchema,
  label: z.string().min(1),
  family: z.enum(["sus_oficial", "br_ampliado", "internacional", "technical"]),
  topicIds: z.array(IdSchema).min(1),
  ruleIds: z.array(IdSchema),
  primaryStrategies: z.array(
    z.strictObject({
      topicId: IdSchema,
      trackId: IdSchema,
      strategyGroupId: IdSchema,
      ruleId: IdSchema,
    }),
  ),
});
export type Policy = z.infer<typeof PolicySchema>;
export const CareSettingContextSchema = z.strictObject({
  resources: z
    .record(IdSchema, z.enum(["available", "unavailable", "unknown"]))
    .default({}),
});
export type CareSettingContext = z.infer<typeof CareSettingContextSchema>;
export function resourceAvailability(
  context: CareSettingContext,
  resourceId: string,
): "available" | "unavailable" | "unknown" {
  return context.resources[resourceId] ?? "unknown";
}
export const RulesetSchema = z.strictObject({
  rulesetVersion: z.string().min(1),
  rules: z.array(RuleDefinitionSchema),
  sources: z.array(SourceSchema),
  policies: z.array(PolicySchema),
  terminology: z.array(IdSchema),
});
export type Ruleset = z.infer<typeof RulesetSchema>;
