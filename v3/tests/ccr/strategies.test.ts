import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import { validateBundle } from "../../src/engine/validateContent";
import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
  type Ruleset,
} from "../../src/model/content";
import { parseCalendarDate as day, parsePartialDate as date } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  brasilAmpliadoPolicy,
  ccrPhase62Resolvers,
  ccrPhase62Ruleset,
  internationalPolicy,
} from "../../src/clinical/ccr";
import { CCR_IDS, CCR_STRATEGY_VALUES } from "../../src/clinical/ccr/terminology";

const asOf = day("2026-10-24");

const averageRiskFacts = [
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
    id: "no-hereditary-syndrome",
    conceptId: CCR_IDS.concepts.hereditarySyndrome,
    category: "condition" as const,
    presence: "no" as const,
  },
];

function strategyFact(value: "fit" | "colonoscopy") {
  return {
    id: `strategy-${value}`,
    conceptId: CCR_IDS.concepts.screeningStrategySelection,
    category: "population_context" as const,
    presence: "yes" as const,
    value,
  };
}

const historySufficientFact = {
  id: "history-sufficient",
  conceptId: CCR_IDS.concepts.historySufficientForCurrentStatus,
  category: "population_context" as const,
  presence: "yes" as const,
};

function fitExam(id: string, when: string) {
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.fit,
    status: "performed" as const,
    date: date(when),
    result: { status: "final" as const, code: CCR_IDS.results.fitNegative },
    quality: "adequate" as const,
    completeness: "not_applicable" as const,
    resolutionInformation: "sufficient" as const,
  };
}

function screeningColonoscopy(id: string, when: string) {
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.colonoscopyScreening,
    status: "performed" as const,
    date: date(when),
    result: { status: "final" as const, code: CCR_IDS.results.colonoscopyNormal },
    quality: "adequate" as const,
    completeness: "complete" as const,
    resolutionInformation: "sufficient" as const,
  };
}

function diagnosticColonoscopy(id: string, when: string) {
  return {
    ...screeningColonoscopy(id, when),
    modality: CCR_IDS.modalities.colonoscopyDiagnostic,
  };
}

function patient(input: {
  age?: number;
  strategy?: "fit" | "colonoscopy";
  historySufficient?: boolean;
  historyKnowledge?: "known" | "never_performed" | "unknown";
  exams?: unknown[];
} = {}) {
  const facts = [
    ...averageRiskFacts,
    ...(input.strategy === undefined ? [] : [strategyFact(input.strategy)]),
    ...(input.historySufficient ? [historySufficientFact] : []),
  ];
  return PatientSchema.parse({
    context: { ageYears: input.age ?? 60 },
    facts,
    examHistory: input.exams ?? [],
    historyKnowledge: {
      [CCR_IDS.topic]: input.historyKnowledge ?? "never_performed",
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
          reviewer: "phase6.2-strategy-test-only-not-a-clinical-review",
          reviewedAt: asOf,
        },
      ],
    },
  });
}

function previewRuleset(policyId: string): Ruleset {
  const policy = ccrPhase62Ruleset.policies.find((item) => item.policyId === policyId);
  if (policy === undefined) throw new Error(`Unknown test policy ${policyId}`);
  const selected = new Set(policy.ruleIds);
  return RulesetSchema.parse({
    ...ccrPhase62Ruleset,
    rules: ccrPhase62Ruleset.rules.map((rule) =>
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
    extensions: ccrPhase62Resolvers,
  });
}

function track(policyId: string, p: ReturnType<typeof patient>, trackId: string) {
  const result = run(policyId, p).plan.topics[0]?.tracks.find(
    (item) => item.trackId === trackId,
  );
  if (result === undefined) throw new Error(`Missing track ${trackId}`);
  return result;
}

function actionIds(policyId: string, p: ReturnType<typeof patient>) {
  return run(policyId, p).plan.topics.flatMap((topic) =>
    topic.tracks.flatMap((item) => item.actions.map((action) => action.actionId)),
  );
}

describe("CCR Phase 6.2 strategy contract", () => {
  it("keeps production translations draft/source_verified and validates the bundle", () => {
    expect(validateBundle(ccrPhase62Ruleset)).toEqual([]);
    expect(
      ccrPhase62Ruleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "draft" &&
          rule.reviewStatus === "source_verified" &&
          rule.governance.reviews.length === 0,
      ),
    ).toBe(true);
  });

  it("does not use static policy primaryStrategies to impersonate human choice", () => {
    expect(brasilAmpliadoPolicy.primaryStrategies).toEqual([]);
    expect(internationalPolicy.primaryStrategies).toEqual([]);
  });

  it("distinguishes primary screening colonoscopy from diagnostic post-FIT colonoscopy", () => {
    expect(CCR_IDS.modalities.colonoscopyScreening).not.toBe(
      CCR_IDS.modalities.colonoscopyDiagnostic,
    );
  });
});

describe("BA-A strategy selection and cross-modality coverage", () => {
  it("prompts for a human strategy when a never-screened 60-year-old is due", () => {
    const p = patient();
    const choice = track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.routine);
    expect(choice.state.status).toBe("Due");
    expect(choice.actions.map((action) => action.actionId)).toContain(
      "crc-action-offer-screening-strategy",
    );
    expect(actionIds(brasilAmpliadoPolicy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
    expect(actionIds(brasilAmpliadoPolicy.policyId, p)).not.toContain(
      "crc-action-colonoscopy-screening",
    );
  });

  it("explicit FIT selection yields FIT Due and suppresses primary colonoscopy", () => {
    const p = patient({ strategy: CCR_STRATEGY_VALUES.fit });
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Due");
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.colonoscopyStrategy).state.status,
    ).toBe("NotApplicable");
    expect(actionIds(brasilAmpliadoPolicy.policyId, p)).toContain(
      "crc-action-fit-screening",
    );
    expect(actionIds(brasilAmpliadoPolicy.policyId, p)).not.toContain(
      "crc-action-colonoscopy-screening",
    );
  });

  it("explicit colonoscopy selection yields colonoscopy Due and suppresses FIT", () => {
    const p = patient({ strategy: CCR_STRATEGY_VALUES.colonoscopy });
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.colonoscopyStrategy).state.status,
    ).toBe("Due");
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("NotApplicable");
    expect(actionIds(brasilAmpliadoPolicy.policyId, p)).toContain(
      "crc-action-colonoscopy-screening",
    );
    expect(actionIds(brasilAmpliadoPolicy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("current primary colonoscopy coverage survives a future switch to FIT", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      historyKnowledge: "known",
      exams: [screeningColonoscopy("colono-2024", "2024-05-01")],
    });
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.colonoscopyStrategy).state.status,
    ).toBe("Current");
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("NotApplicable");
    expect(actionIds(brasilAmpliadoPolicy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("current FIT coverage survives a future switch to primary colonoscopy", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.colonoscopy,
      historyKnowledge: "known",
      exams: [fitExam("fit-2026", "2026-05-01")],
    });
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Current");
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.colonoscopyStrategy).state.status,
    ).toBe("NotApplicable");
    expect(actionIds(brasilAmpliadoPolicy.policyId, p)).not.toContain(
      "crc-action-colonoscopy-screening",
    );
  });

  it("after expired colonoscopy coverage, explicit FIT selection can become Due only with sufficient reviewed history", () => {
    const base = {
      strategy: CCR_STRATEGY_VALUES.fit,
      historyKnowledge: "known" as const,
      exams: [screeningColonoscopy("colono-2015", "2015-05-01")],
    };
    expect(
      track(
        brasilAmpliadoPolicy.policyId,
        patient(base),
        CCR_IDS.tracks.fitStrategy,
      ).state.status,
    ).toBe("Indeterminate");
    expect(
      track(
        brasilAmpliadoPolicy.policyId,
        patient({ ...base, historySufficient: true }),
        CCR_IDS.tracks.fitStrategy,
      ).state.status,
    ).toBe("Due");
  });

  it("does not treat diagnostic colonoscopy as BA-A primary colonoscopy coverage", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      historyKnowledge: "known",
      historySufficient: true,
      exams: [diagnosticColonoscopy("diagnostic-colono-2024", "2024-05-01")],
    });
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Due");
  });
});

describe("International strategy selection and policy isolation", () => {
  it("requires human strategy selection before emitting a modality-specific action", () => {
    const p = patient({ age: 60 });
    const population = track(
      internationalPolicy.policyId,
      p,
      CCR_IDS.tracks.population,
    );
    expect(population.state.status).toBe("Due");
    expect(population.actions.map((action) => action.actionId)).toContain(
      "crc-action-offer-screening-strategy",
    );
    expect(actionIds(internationalPolicy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
    expect(actionIds(internationalPolicy.policyId, p)).not.toContain(
      "crc-action-colonoscopy-screening",
    );
  });

  it("uses annual FIT in International while BA-A remains biennial for the same history", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      historyKnowledge: "known",
      historySufficient: true,
      exams: [fitExam("fit-2025", "2025-04-24")],
    });
    expect(
      track(brasilAmpliadoPolicy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Current");
    expect(
      track(internationalPolicy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Due");
  });

  it("keeps a normal primary screening colonoscopy current for 10 years", () => {
    const p = patient({
      age: 47,
      strategy: CCR_STRATEGY_VALUES.fit,
      historyKnowledge: "known",
      exams: [screeningColonoscopy("colono-2022", "2022-01-10")],
    });
    expect(
      track(internationalPolicy.policyId, p, CCR_IDS.tracks.colonoscopyStrategy).state.status,
    ).toBe("Current");
    expect(actionIds(internationalPolicy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("preserves USPSTF grade metadata on executable strategy rules", () => {
    const byId = new Map(ccrPhase62Ruleset.rules.map((rule) => [rule.ruleId, rule]));
    expect(
      byId.get("crc.intl.strategy.fit.45-49-grade-b")?.sourceRefs[0]?.evidence?.rawGrade,
    ).toBe("B");
    expect(
      byId.get("crc.intl.strategy.colonoscopy.50-75-grade-a")?.sourceRefs[0]?.evidence?.rawGrade,
    ).toBe("A");
  });
});
