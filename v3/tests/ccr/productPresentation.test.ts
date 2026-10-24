import { describe, expect, it } from "vitest";
import {
  CCR_IDS,
  diagnosticColonoscopyAfterPositiveFitAction,
  fitScreeningAction,
} from "../../src/clinical/ccr";
import {
  evaluateCcrProductDraft,
  getCcrProductPolicyOptions,
  presentCcrProduct,
} from "../../src/product/ccr";

function policyId(family: "sus_oficial" | "br_ampliado" | "internacional") {
  const policy = getCcrProductPolicyOptions().find(
    (candidate) => candidate.family === family,
  );
  if (policy === undefined) throw new Error(`Missing ${family} policy`);
  return policy.policyId;
}

function draft(overrides: Record<string, unknown> = {}) {
  return {
    policyId: policyId("sus_oficial"),
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

function success(input: unknown) {
  const result = evaluateCcrProductDraft(input);
  if (!result.ok) {
    throw new Error(
      "issues" in result ? result.issues.join("\n") : result.message,
    );
  }
  return result;
}

function allCards(model: ReturnType<typeof presentCcrProduct>) {
  return model.sections.flatMap((section) => section.cards);
}

describe("CCR presentation contract and progressive input requests", () => {
  it("keeps ruleset, policy and release gate visible in the presentation model", () => {
    const evaluated = success(draft());
    const model = presentCcrProduct(evaluated);
    expect(model.contractVersion).toBe("phase7.4.1");
    expect(model.rulesetVersion).toBe("crc-0.5.5-phase6-active");
    expect(model.releaseGate).toBe(
      "integration-only-not-authorized-for-real-world-use",
    );
    expect(model.policy.policyId).toBe(policyId("sus_oficial"));
  });

  it("preserves governed clinical action wording verbatim for routine FIT", () => {
    const evaluated = success(draft());
    const model = presentCcrProduct(evaluated);
    const action = allCards(model)
      .flatMap((card) => card.actions)
      .find((candidate) => candidate.actionId === fitScreeningAction.actionId);

    expect(action?.text).toBe(fitScreeningAction.text);
    expect(action?.kind).toBe(fitScreeningAction.kind);
    expect(action?.resourceId).toBe(CCR_IDS.resources.fit);
    expect(
      model.sections
        .find((section) => section.id === "do_now")
        ?.cards.some((card) => card.status === "Due"),
    ).toBe(true);
  });

  it("requests FIT availability only after the engine emits a FIT action with unknown availability", () => {
    const model = presentCcrProduct(success(draft()));
    expect(model.requestedInputs).toContain("fit_availability");
    expect(model.requestedInputs).not.toContain("colonoscopy_availability");
  });

  it("requests explicit strategy selection before modality-specific availability in BA-A", () => {
    const model = presentCcrProduct(
      success(
        draft({
          policyId: policyId("br_ampliado"),
          strategySelection: "unselected",
        }),
      ),
    );
    expect(model.requestedInputs).toContain("strategy_selection");
    expect(model.requestedInputs).not.toContain("fit_availability");
    expect(model.requestedInputs).not.toContain("colonoscopy_availability");
  });

  it("requests colonoscopy availability for open FIT-positive follow-up", () => {
    const model = presentCcrProduct(
      success(
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
      ),
    );
    expect(model.requestedInputs).toContain("colonoscopy_availability");
    expect(model.requestedInputs).not.toContain("fit_availability");
  });

  it("shows operational unavailability without changing the clinical action text", () => {
    const evaluated = success(
      draft({ careSetting: { fit: "unavailable" } }),
    );
    const model = presentCcrProduct(evaluated);
    const action = allCards(model)
      .flatMap((card) => card.actions)
      .find((candidate) => candidate.actionId === fitScreeningAction.actionId);

    expect(action?.text).toBe(fitScreeningAction.text);
    expect(action?.operational).toMatchObject({
      availability: "unavailable",
      route: "clinical_review",
      routeLabel: "Revisar alternativa clínica ou operacional",
    });
    expect(model.requestedInputs).not.toContain("fit_availability");
  });

  it("never turns Indeterminate into an action recommendation", () => {
    const evaluated = success(draft({ historyKnowledge: "unknown" }));
    const model = presentCcrProduct(evaluated);
    const cards = model.sections.find(
      (section) => section.id === "missing_information",
    )?.cards;
    expect(cards?.some((card) => card.status === "Indeterminate")).toBe(true);
    for (const card of cards ?? []) {
      if (card.status === "Indeterminate") {
        expect(card.statusLabel).toBe("Falta informação");
        expect(card.actions).toEqual([]);
        expect(card.hasActionOutput).toBe(false);
      }
    }
  });

  it("presents SharedDecision as discussion rather than autonomous modality choice", () => {
    const evaluated = success(
      draft({
        policyId: policyId("br_ampliado"),
        ageYears: 47,
      }),
    );
    const model = presentCcrProduct(evaluated);
    const card = model.sections
      .find((section) => section.id === "shared_decision")
      ?.cards.find((candidate) => candidate.status === "SharedDecision");

    expect(card).toBeDefined();
    expect(card?.statusLabel).toBe("Decisão compartilhada");
    expect(card?.summary).toContain("motor não escolhe");
    expect(
      card?.actions.every(
        (action) => action.kind === "discussion" || action.kind === "information",
      ),
    ).toBe(true);
  });

  it("presents hard exclusion as ClinicalReviewRequired with no automatic recommendation", () => {
    const evaluated = success(draft({ priorCrc: "yes" }));
    const model = presentCcrProduct(evaluated);
    const card = model.sections
      .find((section) => section.id === "clinical_review")
      ?.cards.find((candidate) => candidate.status === "ClinicalReviewRequired");

    expect(card).toBeDefined();
    expect(card?.statusLabel).toBe("Revisão clínica necessária");
    expect(card?.actions).toEqual([]);
    expect(card?.hasActionOutput).toBe(false);
  });

  it("presents open FIT-positive follow-up in Fazer hoje and preserves diagnostic wording", () => {
    const evaluated = success(
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
    const model = presentCcrProduct(evaluated);
    const card = model.sections
      .find((section) => section.id === "do_now")
      ?.cards.find((candidate) => candidate.status === "InFollowUp");
    const action = card?.actions.find(
      (candidate) =>
        candidate.actionId ===
        diagnosticColonoscopyAfterPositiveFitAction.actionId,
    );

    expect(card).toBeDefined();
    expect(action?.text).toBe(diagnosticColonoscopyAfterPositiveFitAction.text);
    expect(action?.kind).toBe("referral");
    expect(
      allCards(model)
        .flatMap((candidate) => candidate.actions)
        .some((candidate) => candidate.actionId === fitScreeningAction.actionId),
    ).toBe(false);
  });

  it("carries source identities from the original trace without inventing presentation sources", () => {
    const evaluated = success(draft());
    const model = presentCcrProduct(evaluated);
    for (const section of model.sections) {
      for (const card of section.cards) {
        const original = evaluated.sections
          .flatMap((sourceSection) => sourceSection.cards)
          .find(
            (sourceCard) =>
              sourceCard.topicId === card.topicId &&
              sourceCard.track.trackId === card.trackId,
          );
        expect(original).toBeDefined();
        expect(card.sourceIds).toEqual(original?.track.trace.sourceIds);
      }
    }
  });

  it("uses stable human labels for the known CCR tracks", () => {
    const evaluated = success(draft());
    const model = presentCcrProduct(evaluated);
    const routine = allCards(model).find(
      (card) => card.trackId === CCR_IDS.tracks.routine,
    );
    expect(routine?.trackLabel).toBe("Rastreamento de rotina");
  });
});
