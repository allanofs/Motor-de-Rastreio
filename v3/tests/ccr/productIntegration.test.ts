import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCalendarDate as day, parsePartialDate as date } from "../../src/model/dates";
import type { CalendarDate } from "../../src/model/dates";
import {
  CCR_IDS,
  CCR_CANDIDATE_RULESET_VERSION,
} from "../../src/clinical/ccr";
import {
  CCR_PRODUCT_RELEASE_GATE,
  CCR_PRODUCT_SECTIONS,
  evaluateCcrProduct,
  getCcrProductPolicyOptions,
} from "../../src/product/ccr";

const asOf = day("2026-10-24");

const baseFacts = [
  {
    id: "scope",
    conceptId: CCR_IDS.concepts.screeningContextConfirmed,
    category: "population_context" as const,
    presence: "yes" as const,
  },
  {
    id: "no-prior-crc",
    conceptId: CCR_IDS.concepts.priorCrc,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "no-polyp-surveillance",
    conceptId: CCR_IDS.concepts.priorPolypSurveillance,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "no-ibd",
    conceptId: CCR_IDS.concepts.colonicIbd,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "no-hereditary",
    conceptId: CCR_IDS.concepts.hereditarySyndrome,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "family-none",
    conceptId: CCR_IDS.concepts.familyHistoryRelevant,
    category: "family_history" as const,
    presence: "no" as const,
  },
  {
    id: "history-sufficient",
    conceptId: CCR_IDS.concepts.historySufficientForCurrentStatus,
    category: "population_context" as const,
    presence: "yes" as const,
  },
];

function patient(input: {
  age?: number;
  historyKnowledge?: "known" | "never_performed" | "unknown" | "not_asked";
  exams?: unknown[];
} = {}) {
  return {
    context: { ageYears: input.age ?? 60 },
    facts: baseFacts,
    examHistory: input.exams ?? [],
    historyKnowledge: {
      [CCR_IDS.topic]: input.historyKnowledge ?? "never_performed",
    },
  };
}

function susPolicyId() {
  const option = getCcrProductPolicyOptions().find(
    (candidate) => candidate.family === "sus_oficial",
  );
  if (option === undefined) throw new Error("Missing SUS policy option");
  return option.policyId;
}

function fitPositive(id: string, when: string) {
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.fit,
    status: "performed" as const,
    date: date(when),
    result: { status: "final" as const, code: CCR_IDS.results.fitPositive },
    quality: "adequate" as const,
    completeness: "not_applicable" as const,
    resolutionInformation: "sufficient" as const,
  };
}

describe("CCR Phase 7 product integration contract", () => {
  it("exposes exactly the three curated policy choices", () => {
    const options = getCcrProductPolicyOptions();
    expect(options).toHaveLength(3);
    expect(new Set(options.map((option) => option.family))).toEqual(
      new Set(["sus_oficial", "br_ampliado", "internacional"]),
    );
  });

  it("uses only the activated canonical H1 ruleset and remains explicitly release-gated", () => {
    const result = evaluateCcrProduct({
      patient: patient(),
      policyId: susPolicyId(),
      asOf,
    });
    expect(result.ok).toBe(true);
    expect(result.rulesetVersion).toBe("crc-0.5.9-phase6-h1-active");
    expect(result.rulesetVersion).toBe(CCR_CANDIDATE_RULESET_VERSION);
    expect(result.releaseGate).toBe(
      "integration-only-not-authorized-for-real-world-use",
    );
    expect(result.releaseGate).toBe(CCR_PRODUCT_RELEASE_GATE);
  });

  it("keeps explicit negative family history out of clinical review in the product path", () => {
    const result = evaluateCcrProduct({
      patient: patient({ historyKnowledge: "never_performed" }),
      policyId: susPolicyId(),
      asOf,
    });
    if (!result.ok) throw new Error(result.message);

    const familyTrack = result.evaluation.plan.topics[0]?.tracks.find(
      (track) => track.trackId === CCR_IDS.tracks.familyStatus,
    );
    expect(familyTrack?.state.status).toBe("NotApplicable");
    expect(
      result.sections
        .find((section) => section.id === "clinical_review")
        ?.cards.some((card) => card.track.trackId === CCR_IDS.tracks.familyStatus),
    ).toBe(false);
  });

  it("maps an eligible never-screened SUS patient to Fazer hoje without reinterpreting the engine", () => {
    const result = evaluateCcrProduct({
      patient: patient({ historyKnowledge: "never_performed" }),
      policyId: susPolicyId(),
      asOf,
    });
    if (!result.ok) throw new Error(result.message);

    const doNow = result.sections.find((section) => section.id === "do_now");
    expect(doNow).toBeDefined();
    expect(
      doNow!.cards.some((card) => card.track.state.status === "Due"),
    ).toBe(true);
    expect(
      result.evaluation.plan.actions.map((action) => action.actionId),
    ).toContain("crc-action-fit-screening");
  });

  it("maps unknown screening history to Falta informação", () => {
    const result = evaluateCcrProduct({
      patient: patient({ historyKnowledge: "unknown" }),
      policyId: susPolicyId(),
      asOf,
    });
    if (!result.ok) throw new Error(result.message);

    const missing = result.sections.find(
      (section) => section.id === "missing_information",
    );
    expect(
      missing?.cards.some((card) => card.track.state.status === "Indeterminate"),
    ).toBe(true);
  });

  it("keeps FIT-positive follow-up in Fazer hoje and suppresses routine FIT", () => {
    const result = evaluateCcrProduct({
      patient: patient({
        historyKnowledge: "known",
        exams: [fitPositive("fit-positive", "2026-01-10")],
      }),
      policyId: susPolicyId(),
      asOf,
    });
    if (!result.ok) throw new Error(result.message);

    const actionIds = result.evaluation.plan.actions.map(
      (action) => action.actionId,
    );
    expect(actionIds).toContain(
      "crc-action-diagnostic-colonoscopy-after-fit-positive",
    );
    expect(actionIds).not.toContain("crc-action-fit-screening");
    expect(
      result.sections
        .find((section) => section.id === "do_now")
        ?.cards.some((card) => card.track.state.status === "InFollowUp"),
    ).toBe(true);
  });

  it("safe-fails unsupported policy instead of falling back to another reference", () => {
    const result = evaluateCcrProduct({
      patient: patient(),
      policyId: "crc-policy-not-real",
      asOf,
    });
    expect(result).toMatchObject({
      ok: false,
      code: "unsupported_policy",
      rulesetVersion: "crc-0.5.9-phase6-h1-active",
    });
  });

  it("safe-fails a malformed control envelope instead of throwing into the UI", () => {
    const result = evaluateCcrProduct({
      patient: patient(),
      policyId: susPolicyId(),
      asOf: "2026-10-24" as unknown as CalendarDate,
    });
    expect(result).toMatchObject({
      ok: false,
      code: "invalid_control_envelope",
    });
  });

  it("keeps the six approved UI groups stable and ordered", () => {
    expect(CCR_PRODUCT_SECTIONS.map((section) => section.label)).toEqual([
      "Resolver primeiro",
      "Falta informação",
      "Fazer hoje",
      "Decisão compartilhada",
      "Revisão clínica necessária",
      "Em dia / acompanhar",
    ]);
  });

  it("does not introduce DOM, persistence, analytics, network calls or logging in the integration adapter", () => {
    const source = readFileSync(
      new URL("../../src/product/ccr/integration.ts", import.meta.url),
      "utf8",
    );
    for (const forbidden of [
      "localStorage",
      "sessionStorage",
      "window.",
      "document.",
      "fetch(",
      "XMLHttpRequest",
      "navigator.sendBeacon",
      "console.",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
