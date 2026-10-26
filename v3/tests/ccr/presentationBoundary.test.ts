import { describe, expect, it } from "vitest";
import { CCR_IDS } from "../../src/clinical/ccr";
import {
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
  presentCcrProduct,
} from "../../src/product/ccr";

function policyId() {
  const option = getCcrProductPolicyOptions().find(
    (candidate) => candidate.family === "sus_oficial",
  );
  if (option === undefined) throw new Error("Missing SUS policy");
  return option.policyId;
}

function draft(overrides: Record<string, unknown> = {}) {
  return {
    policyId: policyId(),
    asOf: "2026-10-24",
    ageYears: 60,
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
    careSetting: {},
    ...overrides,
  };
}

function present(input: unknown) {
  const evaluated = evaluateCcrProductDraft(input);
  if (!evaluated.ok) {
    throw new Error(
      "issues" in evaluated ? evaluated.issues.join("\n") : evaluated.message,
    );
  }
  return presentCcrProduct(evaluated);
}

describe("CCR Phase B presentation boundary", () => {
  it("exposes the simple boundary without removing technical sections or provenance", () => {
    const model = present(draft());
    expect(model.automationBoundary).toMatchObject({
      contractVersion: "phaseB.1",
      code: "ROUTINE_DUE",
    });
    expect(model.sections.length).toBeGreaterThan(0);
    expect(
      model.sections
        .flatMap((section) => section.cards)
        .some((card) => card.sourceIds.length > 0),
    ).toBe(true);
  });

  it("exposes an open FIT-positive episode as specific attention while retaining the underlying follow-up card", () => {
    const model = present(
      draft({
        historyKnowledge: "known",
        exams: [
          {
            kind: "fit",
            id: "fit-positive",
            status: "performed",
            date: "2026-01-10",
            result: "positive",
          },
        ],
      }),
    );

    expect(model.automationBoundary.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(model.automationBoundary.triggerTrackIds).toContain(
      CCR_IDS.tracks.fitFollowup,
    );
    expect(
      model.sections
        .flatMap((section) => section.cards)
        .some(
          (card) =>
            card.trackId === CCR_IDS.tracks.fitFollowup &&
            card.status === "InFollowUp",
        ),
    ).toBe(true);
  });

  it("puts the boundary-trigger track first in technical presentation without deleting non-trigger trace", () => {
    const model = present(
      draft({
        priorCrc: "yes",
        familyHistory: "not_asked",
        historyKnowledge: "not_asked",
      }),
    );

    expect(model.automationBoundary.code).toBe("SPECIFIC_ATTENTION_REQUIRED");
    expect(model.automationBoundary.triggerTrackIds).toContain(
      CCR_IDS.tracks.specialRisk,
    );

    const cards = model.sections.flatMap((section) => section.cards);
    expect(cards[0]?.trackId).toBe(CCR_IDS.tracks.specialRisk);
    expect(cards.some((card) => card.trackId === CCR_IDS.tracks.familyStatus)).toBe(true);
  });
});