import { expect, it } from "vitest";
import {
  PatientSchema,
  ClinicalFactSchema,
  ExamRecordSchema,
} from "../src/model/patient";
import {
  CareSettingContextSchema,
  RuleDefinitionSchema,
  SourceSchema,
  resourceAvailability,
} from "../src/model/content";
import { PathwayStateSchema } from "../src/model/evaluation";
import { patient, rule, source } from "./fixtures";
it("keeps date of birth optional", () =>
  expect(PatientSchema.parse(patient).context.birthDate).toBeUndefined());
it.each([-1, 1.5, 151, NaN, Infinity])("rejects invalid age %s", (age) =>
  expect(
    PatientSchema.safeParse({ ...patient, context: { ageYears: age } }).success,
  ).toBe(false),
);
it("refuses coerced strings as age", () =>
  expect(
    PatientSchema.safeParse({ ...patient, context: { ageYears: "40" } })
      .success,
  ).toBe(false));
it("keeps not asked distinct from unknown", () => {
  expect(PatientSchema.parse(patient).context.anatomy).toBeUndefined();
  expect(
    ClinicalFactSchema.safeParse({
      id: "f",
      conceptId: "c",
      topicId: "t",
      category: "condition",
      presence: "not_asked",
    }).success,
  ).toBe(false);
});
it("rejects ambiguous boolean presence", () =>
  expect(
    ClinicalFactSchema.safeParse({
      id: "f",
      conceptId: "c",
      topicId: "t",
      category: "condition",
      presence: false,
    }).success,
  ).toBe(false));
it("rejects details on absent facts", () =>
  expect(
    ClinicalFactSchema.safeParse({
      id: "f",
      conceptId: "c",
      topicId: "t",
      category: "condition",
      presence: "no",
      details: { hidden: "x" },
    }).success,
  ).toBe(false));
it("never turns unknown exam into a final result", () =>
  expect(
    ExamRecordSchema.safeParse({
      id: "e",
      topicId: "t",
      modality: "m",
      status: "unknown",
      result: { status: "final", code: "x" },
    }).success,
  ).toBe(false));
it("defaults only service availability to unknown", () =>
  expect(
    resourceAvailability(CareSettingContextSchema.parse({}), "resource"),
  ).toBe("unknown"));
it("requires source locator, stance and computability", () => {
  for (const key of ["sourceRefs", "stance", "computability"]) {
    const copy: Record<string, unknown> = { ...rule };
    delete copy[key];
    expect(RuleDefinitionSchema.safeParse(copy).success).toBe(false);
  }
});
it("separates lifecycle and review from test status", () =>
  expect(
    RuleDefinitionSchema.safeParse({ ...rule, reviewStatus: "tests_passing" })
      .success,
  ).toBe(false));
it("requires positive Current anchor", () =>
  expect(PathwayStateSchema.safeParse({ status: "Current" }).success).toBe(
    false,
  ));
it("does not turn insufficient evidence into avoid", () =>
  expect(
    RuleDefinitionSchema.safeParse({
      ...rule,
      stance: "insufficient_evidence",
      actions: [{ actionId: "avoid", kind: "avoid", text: "no" }],
    }).success,
  ).toBe(false));
it("requires qualifying spec before scheduling", () =>
  expect(
    RuleDefinitionSchema.safeParse({
      ...rule,
      scheduleSpec: { unit: "years", amount: 1 },
    }).success,
  ).toBe(false));
it("rejects extra fields including patient identifiers", () => {
  expect(
    PatientSchema.safeParse({ ...patient, name: "Identified person" }).success,
  ).toBe(false);
  expect(SourceSchema.safeParse({ ...source, other: 1 }).success).toBe(false);
});
it("does not let routine scheduling close another pathway", () =>
  expect(
    RuleDefinitionSchema.safeParse({
      ...rule,
      outcome: "InFollowUp",
      qualifyingEventSpec: {
        modality: "technical",
        resultCodes: ["accepted"],
        requireAdequateQuality: false,
        requireComplete: false,
        requireSufficientResolution: false,
      },
      scheduleSpec: { unit: "years", amount: 1 },
    }).success,
  ).toBe(false));
it.each(["javascript:alert(1)", "file:///etc/passwd", "ftp://example.invalid"])(
  "rejects non-web source URL %s",
  (url) =>
    expect(SourceSchema.safeParse({ ...source, url }).success).toBe(false),
);
