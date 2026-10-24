import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
  type Ruleset,
} from "../../src/model/content";
import { parseCalendarDate as day, parsePartialDate as date } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  brasilAmpliadoPhase65Policy,
  ccrPhase64Resolvers,
  ccrPhase65Ruleset,
  internationalPhase65Policy,
  susPhase65Policy,
} from "../../src/clinical/ccr";
import { CCR_IDS, CCR_STRATEGY_VALUES } from "../../src/clinical/ccr/terminology";

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

function strategy(value: "fit" | "colonoscopy") {
  return {
    id: `strategy-${value}`,
    conceptId: CCR_IDS.concepts.screeningStrategySelection,
    category: "population_context" as const,
    presence: "yes" as const,
    value,
  };
}

function fit(id: string, when: string, code: "positive" | "negative") {
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.fit,
    status: "performed" as const,
    date: date(when),
    result: { status: "final" as const, code },
    quality: "adequate" as const,
    completeness: "not_applicable" as const,
    resolutionInformation: "sufficient" as const,
  };
}

function patient(input: {
  age?: number;
  facts?: unknown[];
  exams?: unknown[];
  historyKnowledge?: "known" | "never_performed" | "unknown" | "not_asked";
} = {}) {
  return PatientSchema.parse({
    context: { ageYears: input.age ?? 60 },
    facts: input.facts ?? baseFacts,
    examHistory: input.exams ?? [],
    historyKnowledge: {
      [CCR_IDS.topic]: input.historyKnowledge ?? "known",
    },
  });
}

function testPromote(rule: RuleDefinition): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "active",
    reviewStatus: "reviewed_by_1",
    governance: {
      ...rule.governance,
      reviews: [
        {
          reviewer: "phase6.5-regression-test-only-not-a-clinical-review",
          reviewedAt: asOf,
        },
      ],
    },
  });
}

function previewRuleset(policyId: string): Ruleset {
  const policy = ccrPhase65Ruleset.policies.find((item) => item.policyId === policyId);
  if (policy === undefined) throw new Error(`Unknown policy ${policyId}`);
  const selected = new Set(policy.ruleIds);
  return RulesetSchema.parse({
    ...ccrPhase65Ruleset,
    rules: ccrPhase65Ruleset.rules.map((rule) =>
      selected.has(rule.ruleId) ? testPromote(rule) : rule,
    ),
  });
}

function run(policyId: string, p: ReturnType<typeof patient>) {
  return evaluatePatient({
    patient: p,
    ruleset: previewRuleset(policyId),
    policyId,
    asOf,
    extensions: ccrPhase64Resolvers,
  });
}

function findTrack(result: ReturnType<typeof run>, trackId: string) {
  const track = result.plan.topics[0]?.tracks.find((item) => item.trackId === trackId);
  if (track === undefined) throw new Error(`Missing track ${trackId}`);
  return track;
}

function actionIds(result: ReturnType<typeof run>) {
  return result.plan.topics.flatMap((topic) =>
    topic.tracks.flatMap((track) => track.actions.map((action) => action.actionId)),
  );
}

describe("CCR Phase 6.5 latest-ruleset regression smoke", () => {
  it("keeps average-risk SUS 60-year-old never-screened patient Due for FIT", () => {
    const result = run(
      susPhase65Policy.policyId,
      patient({ historyKnowledge: "never_performed" }),
    );
    expect(findTrack(result, CCR_IDS.tracks.routine).state.status).toBe("Due");
    expect(actionIds(result)).toContain("crc-action-fit-screening");
  });

  it("keeps average-risk BA-A 47-year-old in SharedDecision", () => {
    const result = run(
      brasilAmpliadoPhase65Policy.policyId,
      patient({ age: 47, historyKnowledge: "never_performed" }),
    );
    expect(findTrack(result, CCR_IDS.tracks.routine).state.status).toBe("SharedDecision");
  });

  it("keeps International annual FIT strategy executable on the latest ruleset", () => {
    const result = run(
      internationalPhase65Policy.policyId,
      patient({
        facts: [...baseFacts, strategy(CCR_STRATEGY_VALUES.fit)],
        historyKnowledge: "never_performed",
      }),
    );
    expect(findTrack(result, CCR_IDS.tracks.fitStrategy).state.status).toBe("Due");
    expect(actionIds(result)).toContain("crc-action-fit-screening");
  });

  it("keeps open FIT-positive follow-up dominant on the latest ruleset", () => {
    const result = run(
      internationalPhase65Policy.policyId,
      patient({
        facts: [...baseFacts, strategy(CCR_STRATEGY_VALUES.fit)],
        exams: [fit("fit-pos", "2026-01-01", "positive")],
      }),
    );
    expect(findTrack(result, CCR_IDS.tracks.fitFollowup).state.status).toBe("InFollowUp");
    expect(actionIds(result)).toContain("crc-action-diagnostic-colonoscopy-after-fit-positive");
    expect(actionIds(result)).not.toContain("crc-action-fit-screening");
  });

  it("keeps valid negative FIT coverage Current after adding the special-risk track", () => {
    const result = run(
      susPhase65Policy.policyId,
      patient({ exams: [fit("fit-neg", "2026-01-01", "negative")] }),
    );
    expect(findTrack(result, CCR_IDS.tracks.routine).state.status).toBe("Current");
  });
});
