import { describe, expect, it } from "vitest";
import {
  MAMA_M2_MODEL_GAPS,
  MAMA_PROPOSITION_IDS,
  MAMA_SOURCE_IDS,
  mamaEvidencePropositions,
  mamaSources,
} from "../../src/clinical/mama";

describe("Mama M2 governed evidence catalog", () => {
  it("keeps unique governed sources for all three referential families", () => {
    const ids = mamaSources.map((source) => source.sourceId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(
      expect.arrayContaining([
        MAMA_SOURCE_IDS.susNt6262025,
        MAMA_SOURCE_IDS.incaEarlyDetection2025,
        MAMA_SOURCE_IDS.cnmNote2025,
        MAMA_SOURCE_IDS.cbrSbmFebrasgo2023,
        MAMA_SOURCE_IDS.uspstf2024,
      ]),
    );
  });

  it("resolves every proposition SourceRef to a catalog source with a locator", () => {
    const sourceIds = new Set(mamaSources.map((source) => source.sourceId));
    for (const proposition of mamaEvidencePropositions) {
      expect(proposition.sourceRefs.length).toBeGreaterThan(0);
      for (const sourceRef of proposition.sourceRefs) {
        expect(sourceIds.has(sourceRef.sourceId)).toBe(true);
        expect(sourceRef.locator.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("preserves the three referential families instead of averaging them", () => {
    const sus = mamaEvidencePropositions.find(
      (item) => item.propositionId === MAMA_PROPOSITION_IDS.susRoutine5074Biennial,
    );
    const brazil = mamaEvidencePropositions.find(
      (item) => item.propositionId === MAMA_PROPOSITION_IDS.brazilAnnual4074,
    );
    const international = mamaEvidencePropositions.find(
      (item) => item.propositionId === MAMA_PROPOSITION_IDS.uspstfRoutine4074Biennial,
    );

    expect(sus?.policyFamilies).toEqual(["sus_oficial"]);
    expect(brazil?.policyFamilies).toEqual(["br_ampliado"]);
    expect(international?.policyFamilies).toEqual(["internacional"]);
    expect(sus?.statement).toContain("50 aos 74");
    expect(brazil?.statement).toContain("40 aos 74");
    expect(international?.statement).toContain("40 aos 74");
  });

  it("does not collapse ordinary family history into a high-risk hard exit", () => {
    const scope = mamaEvidencePropositions.find(
      (item) => item.propositionId === MAMA_PROPOSITION_IDS.uspstfPopulationScope,
    );
    expect(scope?.statement).toContain("parente de primeiro grau");
    expect(scope?.translationNote).toContain("não pode ser promovida automaticamente");
  });

  it("keeps raw BI-RADS interpretation outside M2", () => {
    const abnormal = mamaEvidencePropositions.find(
      (item) => item.propositionId === MAMA_PROPOSITION_IDS.abnormalScreenNeedsFollowup,
    );
    expect(abnormal?.translationNote).toContain("não interpreta BI-RADS bruto");
  });

  it("makes unresolved model gaps explicit before executable translation", () => {
    expect(MAMA_M2_MODEL_GAPS.map((gap) => gap.gapId)).toEqual(
      expect.arrayContaining([
        "breast-gap-high-risk-familial-context",
        "breast-gap-brazil-expanded-scope-label",
      ]),
    );
  });
});
