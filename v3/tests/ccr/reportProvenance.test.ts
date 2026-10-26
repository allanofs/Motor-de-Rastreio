import { describe, expect, it } from "vitest";
import {
  buildCcrReportModel,
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
  resolveCcrReportProvenance,
} from "../../src/product/ccr";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const option = getCcrProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (option === undefined) throw new Error(`Missing ${family} policy`);
  return option.policyId;
}

function baseDraft(overrides: Record<string, unknown> = {}) {
  return {
    policyId: policyId("sus_oficial"),
    asOf: "2026-10-26",
    ageYears: 57,
    screeningContext: "yes",
    priorCrc: "no",
    priorPolypSurveillance: "no",
    colonicIbd: "no",
    hereditarySyndrome: "no",
    familyHistory: "no",
    historyKnowledge: "never_performed",
    historySufficientForCurrentStatus: "not_asked",
    strategySelection: "unselected",
    specialistCareAssumed: "no",
    exams: [],
    careSetting: { fit: "available" },
    ...overrides,
  };
}

function evaluate(draft: unknown) {
  const result = evaluateCcrProductDraft(draft);
  if (!result.ok) {
    throw new Error(
      "issues" in result ? result.issues.join("\n") : result.message,
    );
  }
  return result;
}

describe("CCR Report & Evidence Provenance R0", () => {
  it("builds a final routine report from governed trace sourceRefs and source catalog", () => {
    const draft = baseDraft();
    const result = evaluate(draft);
    const built = buildCcrReportModel(draft, result);

    expect(built.ok).toBe(true);
    if (!built.ok) return;

    expect(built.report.contractVersion).toBe("report-r0.1");
    expect(built.report.boundary.code).toBe("ROUTINE_DUE");
    expect(built.report.rulesetVersion).toBe("crc-0.5.9-phase6-h1-active");
    expect(built.report.policy.family).toBe("sus_oficial");
    expect(built.report.primaryActions.length).toBeGreaterThan(0);
    expect(built.report.primaryActions[0]?.text).toMatch(/FIT/i);
    expect(built.report.inputs.careSettingResources).not.toEqual({});

    expect(built.report.provenance.status).toBe("complete");
    expect(built.report.provenance.sources.length).toBeGreaterThan(0);
    for (const source of built.report.provenance.sources) {
      expect(source.institution.length).toBeGreaterThan(0);
      expect(source.documentTitle.length).toBeGreaterThan(0);
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.references.length).toBeGreaterThan(0);
      expect(source.references.every((ref) => ref.locator.length > 0)).toBe(true);
    }
  });

  it("keeps deep FIT-positive management out of primary report actions after the boundary stops automation", () => {
    const draft = baseDraft({
      historyKnowledge: "known",
      historySufficientForCurrentStatus: "yes",
      exams: [
        {
          kind: "fit",
          id: "fit-positive",
          status: "performed",
          date: "2026-01-10",
          result: "positive",
        },
      ],
      careSetting: { colonoscopy: "available" },
    });
    const result = evaluate(draft);
    const built = buildCcrReportModel(draft, result);

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.report.boundary.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(built.report.primaryActions).toEqual([]);
    expect(built.report.provenance.sources.length).toBeGreaterThan(0);
    expect(built.report.inputs.records.some(({ used }) => used)).toBe(true);
  });

  it("refuses report export while the product is still waiting for a human strategy choice", () => {
    const draft = baseDraft({
      policyId: policyId("br_ampliado"),
      careSetting: {},
    });
    const result = evaluate(draft);
    const built = buildCcrReportModel(draft, result);

    expect(built).toMatchObject({ ok: false, code: "pending_input" });
  });

  it("detects when report inputs do not correspond to the evaluated result", () => {
    const evaluatedDraft = baseDraft();
    const result = evaluate(evaluatedDraft);
    const changedDraft = { ...evaluatedDraft, asOf: "2026-10-25" };
    const built = buildCcrReportModel(changedDraft, result);

    expect(built).toMatchObject({
      ok: false,
      code: "evaluation_input_mismatch",
    });
  });

  it("reports missing governed source metadata instead of fabricating a citation", () => {
    const provenance = resolveCcrReportProvenance(
      [{ sourceId: "missing-source", locator: "section 1" }],
      [],
    );

    expect(provenance).toEqual({
      status: "incomplete",
      sources: [],
      unresolved: [
        {
          sourceId: "missing-source",
          locator: "section 1",
          reason: "source_not_found_in_governed_catalog",
        },
      ],
    });
  });
});
