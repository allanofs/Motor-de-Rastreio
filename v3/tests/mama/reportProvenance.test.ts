import { describe, expect, it } from "vitest";
import { MAMA_IDS } from "../../src/clinical/mama";
import {
  buildMamaReportModel,
  evaluateMamaProductDraft,
  getMamaProductPolicyOptions,
  renderMamaReportHtml,
} from "../../src/product/mama";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const option = getMamaProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (option === undefined) throw new Error(`Missing ${family} policy`);
  return option.policyId;
}

function baseDraft(overrides: Record<string, unknown> = {}) {
  return {
    policyId: policyId("sus_oficial"),
    asOf: "2026-10-27",
    ageYears: 55,
    screeningContext: "yes",
    relevantBreastTissuePresent: "yes",
    suspiciousBreastSymptoms: "no",
    priorBreastCancer: "no",
    highRiskGeneticContext: "no",
    knownHighRiskFamilialContext: "no",
    priorHighRiskChestRadiation: "no",
    priorHighRiskBreastLesion: "no",
    specificBreastCareActive: "no",
    historyKnowledge: "never_performed",
    careSetting: {},
    ...overrides,
  };
}

function evaluated(draft: unknown) {
  const result = evaluateMamaProductDraft(draft);
  if (!result.ok)
    throw new Error("issues" in result ? result.issues.join("\n") : result.message);
  return result;
}

function report(draft: unknown) {
  const result = buildMamaReportModel(draft, evaluated(draft));
  if (!result.ok) throw new Error(`${result.code}: ${result.message}`);
  return result.report;
}

describe("Mama structured report / provenance", () => {
  it("blocks export while a due mammography still needs operational availability", () => {
    const draft = baseDraft();
    const result = buildMamaReportModel(draft, evaluated(draft));
    expect(result).toMatchObject({ ok: false, code: "pending_input" });
  });

  it("builds a ROUTINE_DUE report from track trace with exact governed provenance", () => {
    const draft = baseDraft({ careSetting: { mammography: "available" } });
    const result = report(draft);

    expect(result.contractVersion).toBe("mama-report-r0.1");
    expect(result.boundary).toMatchObject({
      code: "ROUTINE_DUE",
      provenanceCarrier: "track_trace",
    });
    expect(result.boundary.triggerTrackIds).toContain(MAMA_IDS.tracks.routine);
    expect(result.provenance.status).toBe("complete");
    expect(result.provenance.sources.length).toBeGreaterThan(0);
    expect(result.provenance.unresolved).toEqual([]);
    expect(result.primaryActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resourceId: MAMA_IDS.resources.mammography,
          operational: expect.objectContaining({ availability: "available" }),
        }),
      ]),
    );
    expect(result.inputs.careSettingResources).toEqual({
      [MAMA_IDS.resources.mammography]: "available",
    });
    expect(result.decisionContext).toBeUndefined();
  });

  it("keeps a qualifying screening mammogram as a used record in an EM DIA report", () => {
    const draft = baseDraft({
      historyKnowledge: "known",
      historySufficientForCurrentStatus: "yes",
      priorMammographyAllowsRoutine: "yes",
      priorMammographyNeedsSpecificAttention: "no",
      mammographies: [
        {
          kind: "mammography",
          id: "mammo-current",
          role: "screening",
          date: "2025-11-10",
          disposition: "routine_return",
          quality: "adequate",
          completeness: "complete",
          resolutionInformation: "sufficient",
        },
      ],
    });
    const result = report(draft);
    expect(result.boundary.code).toBe("ROUTINE_CURRENT");
    expect(result.inputs.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          used: true,
          record: expect.objectContaining({
            id: "mammo-current",
            modality: MAMA_IDS.modalities.mammographyScreening,
          }),
        }),
      ]),
    );
    expect(result.primaryActions).toEqual([]);
  });

  it("uses DecisionContext, not a fabricated track citation, for SUS under-40 closure", () => {
    const draft = baseDraft({ ageYears: 35 });
    const result = report(draft);

    expect(result.boundary).toMatchObject({
      code: "SCREENING_NOT_INDICATED",
      reasonCode: "under40-routine-not-recommended",
      provenanceCarrier: "decision_context",
      triggerTrackIds: [],
    });
    expect(result.decisionContext).toMatchObject({
      routineScopeDisposition: "applied",
      conclusion: "routine_not_recommended",
      policyFamily: "sus_oficial",
      ageYears: 35,
    });
    expect(result.provenance.status).toBe("complete");
    expect(result.provenance.sources.length).toBeGreaterThan(0);
    expect(result.rationale.map((item) => item.trackId)).toEqual(
      expect.arrayContaining([
        MAMA_IDS.tracks.specialRisk,
        MAMA_IDS.tracks.priorFinding,
        MAMA_IDS.tracks.specificCare,
      ]),
    );
    expect(result.inputs.factsUsed.length).toBeGreaterThan(0);
  });

  it("preserves USPSTF under-40 as outside recommendation scope in model and renderer", () => {
    const draft = baseDraft({
      policyId: policyId("internacional"),
      ageYears: 35,
    });
    const result = report(draft);
    expect(result.boundary.reasonCode).toBe(
      "under40-outside-recommendation-scope",
    );
    expect(result.decisionContext?.conclusion).toBe(
      "outside_recommendation_scope",
    );

    const html = renderMamaReportHtml(result);
    expect(html).toContain("Fora do escopo da recomendação");
    expect(html).toContain("Carrier de provenance");
    expect(html).toContain("decision_context");
  });

  it("keeps an under-40 hard exit on track_trace instead of leaking age closure", () => {
    const draft = baseDraft({ ageYears: 35, highRiskGeneticContext: "yes" });
    const result = report(draft);
    expect(result.boundary).toMatchObject({
      code: "SPECIFIC_ATTENTION_REQUIRED",
      provenanceCarrier: "track_trace",
    });
    expect(result.boundary.triggerTrackIds).toContain(MAMA_IDS.tracks.specialRisk);
    expect(result.decisionContext).toBeUndefined();
    expect(result.provenance.sources.length).toBeGreaterThan(0);
  });

  it("rejects report generation when the supplied evaluation no longer matches the current draft", () => {
    const originalDraft = baseDraft({
      careSetting: { mammography: "available" },
    });
    const oldEvaluation = evaluated(originalDraft);
    const changedDraft = baseDraft({
      ageYears: 35,
      careSetting: { mammography: "available" },
    });

    const result = buildMamaReportModel(changedDraft, oldEvaluation);
    expect(result).toMatchObject({
      ok: false,
      code: "evaluation_input_mismatch",
    });
  });

  it("renders governed source titles/locators without inferring bibliography from policy labels", () => {
    const draft = baseDraft({ careSetting: { mammography: "available" } });
    const structured = report(draft);
    const html = renderMamaReportHtml(structured);

    expect(html).toContain("Referências utilizadas nesta conclusão");
    for (const source of structured.provenance.sources) {
      expect(html).toContain(source.documentTitle);
      for (const ref of source.references) expect(html).toContain(ref.locator);
    }
    expect(html).toContain(structured.rulesetVersion);
    expect(html).toContain("track_trace");
  });
});
