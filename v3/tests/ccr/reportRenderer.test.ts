import { describe, expect, it } from "vitest";
import {
  buildCcrReportModel,
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
  renderCcrReportHtml,
} from "../../src/product/ccr";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const option = getCcrProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (option === undefined) throw new Error(`Missing ${family} policy`);
  return option.policyId;
}

function routineDraft() {
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
  };
}

function reportFor(draft: unknown) {
  const evaluated = evaluateCcrProductDraft(draft);
  if (!evaluated.ok)
    throw new Error("issues" in evaluated ? evaluated.issues.join("\n") : evaluated.message);
  const built = buildCcrReportModel(draft, evaluated);
  if (!built.ok) throw new Error(built.message);
  return built.report;
}

describe("CCR printable report renderer R1", () => {
  it("renders result, explicit rationale and governed source title, URL and locator", () => {
    const report = reportFor(routineDraft());
    const html = renderCcrReportHtml(report);

    expect(html).toContain("Relatório de apoio à decisão");
    expect(html).toContain("Rastreamento indicado");
    expect(html).toContain("Por que o Motor chegou a esta conclusão");
    expect(html).toContain(report.rationale[0]!.trackLabel);
    expect(html).toContain(report.rationale[0]!.summary);
    expect(html).toContain("Regra(s) ativada(s)");
    expect(html).toContain("crc-0.5.9-phase6-h1-active");
    expect(html).toContain("Referências utilizadas nesta conclusão");
    expect(html).toContain(report.provenance.sources[0]!.documentTitle);
    expect(html).toContain(report.provenance.sources[0]!.url);
    expect(html).toContain(report.provenance.sources[0]!.references[0]!.locator);
    expect(html).toContain("@page { size: A4");
    expect(html).toContain('id="print-report"');
    expect(html).not.toContain("window.print");
  });

  it("does not promote deep FIT-positive management as the report's primary action", () => {
    const draft = {
      ...routineDraft(),
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
    };
    const report = reportFor(draft);
    const html = renderCcrReportHtml(report);

    expect(report.boundary.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(report.primaryActions).toEqual([]);
    expect(html).toContain("Atenção específica");
    expect(html).toContain("Por que o Motor chegou a esta conclusão");
    expect(html).toContain("Nenhuma ação clínica profunda foi promovida");
    expect(html).not.toContain("Providenciar colonoscopia diagnóstica adequada para avaliação do FIT positivo");
  });

  it("escapes governed text before inserting it into printable HTML", () => {
    const report = reportFor(routineDraft());
    const unsafe = {
      ...report,
      policy: { ...report.policy, label: '<script id="x">bad()</script>' },
    };
    const html = renderCcrReportHtml(unsafe);

    expect(html).not.toContain('<script id="x">');
    expect(html).toContain("&lt;script id=&quot;x&quot;&gt;bad()&lt;/script&gt;");
  });
});
