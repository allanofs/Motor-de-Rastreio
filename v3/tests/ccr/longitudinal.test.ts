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
  brasilAmpliadoPhase63Policy,
  ccrPhase63Resolvers,
  ccrPhase63Ruleset,
  internationalPhase63Policy,
  susPhase63Policy,
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

const handoffFact = {
  id: "handoff-confirmed",
  conceptId: CCR_IDS.concepts.specialistCareAssumed,
  category: "population_context" as const,
  presence: "yes" as const,
};

function fitFinal(
  id: string,
  when: string,
  code: "positive" | "negative",
) {
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

function fitPending(id: string, when: string) {
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.fit,
    status: "performed" as const,
    date: date(when),
    result: { status: "pending" as const },
    quality: "adequate" as const,
    completeness: "not_applicable" as const,
    resolutionInformation: "unknown" as const,
  };
}

function fitInvalid(id: string, when: string) {
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.fit,
    status: "performed" as const,
    date: date(when),
    result: { status: "invalid" as const },
    quality: "unknown" as const,
    completeness: "not_applicable" as const,
    resolutionInformation: "unknown" as const,
  };
}

function diagnosticColonoscopy(
  id: string,
  when: string,
  options: {
    result?: "normal" | "polyp-or-lesion" | "cancer";
    resultStatus?: "final" | "pending";
    quality?: "adequate" | "inadequate" | "unknown";
    completeness?: "complete" | "incomplete" | "unknown";
    resolutionInformation?: "sufficient" | "insufficient" | "unknown";
  } = {},
) {
  const resultStatus = options.resultStatus ?? "final";
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.colonoscopyDiagnostic,
    status: "performed" as const,
    date: date(when),
    result:
      resultStatus === "pending"
        ? ({ status: "pending" as const } as const)
        : ({
            status: "final" as const,
            code: options.result ?? CCR_IDS.results.colonoscopyNormal,
          } as const),
    quality: options.quality ?? ("adequate" as const),
    completeness: options.completeness ?? ("complete" as const),
    resolutionInformation:
      options.resolutionInformation ?? ("sufficient" as const),
  };
}

function patient(input: {
  age?: number;
  strategy?: "fit" | "colonoscopy";
  handoff?: boolean;
  historyKnowledge?: "known" | "never_performed" | "unknown";
  exams?: unknown[];
} = {}) {
  return PatientSchema.parse({
    context: { ageYears: input.age ?? 60 },
    facts: [
      ...averageRiskFacts,
      historySufficientFact,
      ...(input.strategy === undefined ? [] : [strategyFact(input.strategy)]),
      ...(input.handoff ? [handoffFact] : []),
    ],
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
          reviewer: "phase6.3-longitudinal-test-only-not-a-clinical-review",
          reviewedAt: asOf,
        },
      ],
    },
  });
}

function previewRuleset(policyId: string): Ruleset {
  const policy = ccrPhase63Ruleset.policies.find((item) => item.policyId === policyId);
  if (policy === undefined) throw new Error(`Unknown Phase 6.3 policy ${policyId}`);
  const selected = new Set(policy.ruleIds);
  return RulesetSchema.parse({
    ...ccrPhase63Ruleset,
    rules: ccrPhase63Ruleset.rules.map((rule) =>
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
    extensions: ccrPhase63Resolvers,
  });
}

function track(policyId: string, p: ReturnType<typeof patient>, trackId: string) {
  const found = run(policyId, p).plan.topics[0]?.tracks.find(
    (item) => item.trackId === trackId,
  );
  if (found === undefined) throw new Error(`Missing track ${trackId}`);
  return found;
}

function actionIds(policyId: string, p: ReturnType<typeof patient>) {
  return run(policyId, p).plan.topics.flatMap((topic) =>
    topic.tracks.flatMap((item) => item.actions.map((action) => action.actionId)),
  );
}

const fitPositive = (id: string, when: string) => fitFinal(id, when, "positive");
const fitNegative = (id: string, when: string) => fitFinal(id, when, "negative");

const followup = (policyId: string, p: ReturnType<typeof patient>) =>
  track(policyId, p, CCR_IDS.tracks.fitFollowup);
const postFit = (policyId: string, p: ReturnType<typeof patient>) =>
  track(policyId, p, CCR_IDS.tracks.postFitRoutine);

describe("CCR Phase 6.3 content governance", () => {
  it("keeps all executable clinical translations draft/source_verified and validates the bundle", () => {
    expect(validateBundle(ccrPhase63Ruleset)).toEqual([]);
    expect(
      ccrPhase63Ruleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "draft" &&
          rule.reviewStatus === "source_verified" &&
          rule.governance.reviews.length === 0,
      ),
    ).toBe(true);
    expect(ccrPhase63Ruleset.rulesetVersion).toBe("crc-0.3.0-phase6.3-draft");
  });
});

describe("FIT-positive longitudinal pathway", () => {
  it("keeps FIT-positive open and emits only diagnostic colonoscopy, not routine screening", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: [fitPositive("fit-pos", "2026-06-01")],
    });
    expect(followup(susPhase63Policy.policyId, p).state.status).toBe("InFollowUp");
    expect(actionIds(susPhase63Policy.policyId, p)).toContain(
      "crc-action-diagnostic-colonoscopy-after-fit-positive",
    );
    expect(actionIds(susPhase63Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("does not let a later negative FIT resolve an earlier positive FIT", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: [
        fitPositive("fit-pos", "2026-01-01"),
        fitNegative("fit-neg-later", "2026-02-01"),
      ],
    });
    expect(followup(brasilAmpliadoPhase63Policy.policyId, p).state.status).toBe(
      "InFollowUp",
    );
    expect(actionIds(brasilAmpliadoPhase63Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("resolves all earlier compatible positives with a later adequate normal diagnostic colonoscopy", () => {
    const p = patient({
      exams: [
        fitPositive("fit-pos-1", "2025-01-01"),
        fitPositive("fit-pos-2", "2025-06-01"),
        diagnosticColonoscopy("colono-normal", "2026-01-10"),
      ],
    });
    const result = followup(internationalPhase63Policy.policyId, p);
    expect(result.state.status).toBe("NotApplicable");
    expect(result.guardrails).toContain(
      "resolved_fit_trigger:fit-pos-1:by_colonoscopy:colono-normal",
    );
    expect(result.guardrails).toContain(
      "resolved_fit_trigger:fit-pos-2:by_colonoscopy:colono-normal",
    );
  });

  it("does not let a colonoscopy before a later positive FIT resolve that later trigger", () => {
    const p = patient({
      exams: [
        diagnosticColonoscopy("colono-before", "2026-01-01"),
        fitPositive("fit-pos-later", "2026-02-01"),
      ],
    });
    expect(followup(internationalPhase63Policy.policyId, p).state.status).toBe(
      "InFollowUp",
    );
  });

  it("refuses to infer order from same-day FIT-positive and colonoscopy", () => {
    const p = patient({
      exams: [
        fitPositive("fit-pos", "2026-03-10"),
        diagnosticColonoscopy("colono-same-day", "2026-03-10"),
      ],
    });
    const result = followup(susPhase63Policy.policyId, p);
    expect(result.state.status).toBe("Indeterminate");
    expect(result.missingData).toContain("crc_fit_colonoscopy_temporal_order");
  });

  it("keeps the episode open after inadequate preparation", () => {
    const p = patient({
      exams: [
        fitPositive("fit-pos", "2026-01-01"),
        diagnosticColonoscopy("colono-bad-prep", "2026-02-01", {
          quality: "inadequate",
        }),
      ],
    });
    expect(followup(susPhase63Policy.policyId, p).state.status).toBe("InFollowUp");
    expect(actionIds(susPhase63Policy.policyId, p)).toContain(
      "crc-action-diagnostic-colonoscopy-after-fit-positive",
    );
  });

  it("keeps the episode open after incomplete colonoscopy", () => {
    const p = patient({
      exams: [
        fitPositive("fit-pos", "2026-01-01"),
        diagnosticColonoscopy("colono-incomplete", "2026-02-01", {
          completeness: "incomplete",
        }),
      ],
    });
    expect(followup(susPhase63Policy.policyId, p).state.status).toBe("InFollowUp");
  });

  it("uses PendingResult after post-positive diagnostic colonoscopy whose result is pending", () => {
    const p = patient({
      exams: [
        fitPositive("fit-pos", "2026-01-01"),
        diagnosticColonoscopy("colono-pending", "2026-02-01", {
          resultStatus: "pending",
        }),
      ],
    });
    const result = followup(internationalPhase63Policy.policyId, p);
    expect(result.state.status).toBe("PendingResult");
    expect(result.actions).toEqual([]);
  });

  it("routes a non-normal colonoscopy finding to ClinicalReviewRequired", () => {
    const p = patient({
      exams: [
        fitPositive("fit-pos", "2026-01-01"),
        diagnosticColonoscopy("colono-polyp", "2026-02-01", {
          result: "polyp-or-lesion",
        }),
      ],
    });
    expect(followup(internationalPhase63Policy.policyId, p).state.status).toBe(
      "ClinicalReviewRequired",
    );
  });

  it("uses HandedOff only when assumption of care is explicitly confirmed", () => {
    const withoutHandoff = patient({ exams: [fitPositive("fit-pos", "2026-01-01")] });
    const withHandoff = patient({
      handoff: true,
      exams: [fitPositive("fit-pos", "2026-01-01")],
    });
    expect(followup(susPhase63Policy.policyId, withoutHandoff).state.status).toBe(
      "InFollowUp",
    );
    expect(followup(susPhase63Policy.policyId, withHandoff).state.status).toBe(
      "HandedOff",
    );
  });

  it("continues an open FIT-positive pathway beyond the SUS routine age range", () => {
    const p = patient({ age: 80, exams: [fitPositive("fit-pos", "2026-01-01")] });
    expect(followup(susPhase63Policy.policyId, p).state.status).toBe("InFollowUp");
    expect(actionIds(susPhase63Policy.policyId, p)).toContain(
      "crc-action-diagnostic-colonoscopy-after-fit-positive",
    );
  });
});

describe("pending and invalid FIT semantics", () => {
  it("uses PendingResult and never orders a duplicate FIT while result is pending", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: [fitPending("fit-pending", "2026-10-01")],
    });
    expect(followup(brasilAmpliadoPhase63Policy.policyId, p).state.status).toBe(
      "PendingResult",
    );
    expect(actionIds(brasilAmpliadoPhase63Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("routes invalid/inconclusive FIT to review without treating it as negative or restarting a clock", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: [fitInvalid("fit-invalid", "2026-10-01")],
    });
    expect(followup(brasilAmpliadoPhase63Policy.policyId, p).state.status).toBe(
      "ClinicalReviewRequired",
    );
    expect(actionIds(brasilAmpliadoPhase63Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });
});

describe("post-FIT normal colonoscopy policy divergence", () => {
  const resolved = () => [
    fitPositive("fit-pos", "2024-01-01"),
    diagnosticColonoscopy("colono-normal", "2024-02-01"),
  ];

  it("resolves the diagnostic episode but does not invent a SUS next routine clock", () => {
    const p = patient({ exams: resolved() });
    expect(followup(susPhase63Policy.policyId, p).state.status).toBe("NotApplicable");
    expect(postFit(susPhase63Policy.policyId, p).state.status).toBe(
      "ClinicalReviewRequired",
    );
    expect(actionIds(susPhase63Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("resolves the diagnostic episode but keeps BA-A next routine clock under review", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: resolved(),
    });
    expect(postFit(brasilAmpliadoPhase63Policy.policyId, p).state.status).toBe(
      "ClinicalReviewRequired",
    );
    expect(actionIds(brasilAmpliadoPhase63Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("keeps a normal high-quality post-FIT diagnostic colonoscopy Current for 10 years internationally", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: resolved(),
    });
    const result = postFit(internationalPhase63Policy.policyId, p);
    expect(result.state.status).toBe("Current");
    expect(result.state.status === "Current" ? result.state.anchorEventId : undefined).toBe(
      "colono-normal",
    );
    expect(actionIds(internationalPhase63Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("marks the international post-FIT 10-year clock Due on the anniversary without inventing an overdue grace period", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: [
        fitPositive("fit-pos", "2016-09-01"),
        diagnosticColonoscopy("colono-normal", "2016-10-24"),
      ],
    });
    expect(postFit(internationalPhase63Policy.policyId, p).state.status).toBe("Due");
  });

  it("does not let a later FIT-positive be hidden by an earlier normal post-FIT colonoscopy", () => {
    const p = patient({
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: [
        fitPositive("fit-pos-1", "2024-01-01"),
        diagnosticColonoscopy("colono-normal", "2024-02-01"),
        fitPositive("fit-pos-2", "2025-01-01"),
      ],
    });
    expect(followup(internationalPhase63Policy.policyId, p).state.status).toBe(
      "InFollowUp",
    );
    expect(postFit(internationalPhase63Policy.policyId, p).state.status).toBe(
      "NotApplicable",
    );
  });
});
