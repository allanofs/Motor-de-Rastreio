import { z } from "zod";
import { IdSchema, PresenceSchema, ScalarSchema } from "./common";
import { PartialCalendarDateSchema } from "./dates";
const factBase = {
  id: IdSchema,
  conceptId: IdSchema,
  topicId: IdSchema,
  category: z.enum([
    "condition",
    "symptom",
    "medication",
    "exposure",
    "family_history",
    "population_context",
  ]),
  effectiveDate: PartialCalendarDateSchema.optional(),
  clinicalStatus: z.enum(["active", "resolved", "unknown"]).optional(),
  origin: z.enum(["reported", "documented", "observed", "unknown"]).optional(),
};
export const ClinicalFactSchema = z.discriminatedUnion("presence", [
  z.strictObject({
    ...factBase,
    presence: z.literal("yes"),
    value: ScalarSchema.optional(),
    details: z.record(IdSchema, ScalarSchema).optional(),
  }),
  z.strictObject({
    ...factBase,
    presence: z.enum(["no", "unknown", "not_applicable"]),
  }),
]);
export type ClinicalFact = z.infer<typeof ClinicalFactSchema>;
const examBase = { id: IdSchema, topicId: IdSchema, modality: IdSchema };
export const ExamRecordSchema = z.discriminatedUnion("status", [
  z.strictObject({
    ...examBase,
    status: z.literal("performed"),
    date: PartialCalendarDateSchema.optional(),
    result: z.discriminatedUnion("status", [
      z.strictObject({ status: z.literal("final"), code: IdSchema }),
      z.strictObject({ status: z.enum(["pending", "unknown", "invalid"]) }),
    ]),
    quality: z.enum(["adequate", "inadequate", "unknown"]).default("unknown"),
    completeness: z
      .enum(["complete", "incomplete", "unknown", "not_applicable"])
      .default("unknown"),
    resolutionInformation: z
      .enum(["sufficient", "insufficient", "unknown"])
      .default("unknown"),
  }),
  z.strictObject({ ...examBase, status: z.enum(["not_performed", "unknown"]) }),
]);
export type ExamRecord = z.infer<typeof ExamRecordSchema>;
export const PatientContextSchema = z.strictObject({
  ageYears: z.number().int().min(0).max(150).optional(),
  birthDate: PartialCalendarDateSchema.optional(),
  anatomy: z.record(IdSchema, PresenceSchema).optional(),
  functionalContext: z
    .discriminatedUnion("status", [
      z.strictObject({ status: z.literal("assessed"), value: IdSchema }),
      z.strictObject({ status: z.enum(["unknown", "not_applicable"]) }),
    ])
    .optional(),
});
export type PatientContext = z.infer<typeof PatientContextSchema>;
export const PatientSchema = z.strictObject({
  context: PatientContextSchema,
  facts: z.array(ClinicalFactSchema),
  examHistory: z.array(ExamRecordSchema),
  historyKnowledge: z.record(
    IdSchema,
    z.enum(["known", "never_performed", "unknown"]),
  ),
});
export type Patient = z.infer<typeof PatientSchema>;
