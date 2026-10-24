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
  brasilAmpliadoPhase64Policy,
  ccrPhase64Resolvers,
  ccrPhase64Ruleset,
  internationalPhase64Policy,
  susPhase64Policy,
} from "../../src/clinical/ccr";
import {
  CCR_FAMILY_DETAIL_KEYS,
  CCR_FAMILY_VALUES,
  CCR_IDS,
  CCR_STRATEGY_VALUES,
} from "../../src/clinical/ccr/terminology";

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
    id: "no-hereditary-syndrome",
    conceptId: CCR_IDS.concepts.hereditarySyndrome,
    category: "condition" as const,
    presence: "no" as const,
  },
  {
    id: "history-sufficient",
    conceptId: CCR_IDS.concepts.historySufficientForCurrentStatus,
    category: "population_context" as const,
    presence: "yes" as const,
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

function familyNone() {
  return {
    id: "family-none",
    conceptId: CCR_IDS.concepts.familyHistoryRelevant,
    category: "family_history" as const,
    presence: "no" as const,
  };
}

function familyUnknown() {
  return {
    id: "family-unknown",
    conceptId: CCR_IDS.concepts.familyHistoryRelevant,
    category: "family_history" as const,
    presence: "unknown" as const,
  };
}

function familyPositive(input: {
  fdr: number;
  sdr?: number;
  ageBand?: "under-60" | "60-or-older" | "unknown";
  exactAge?: number;
  finding?: "crc" | "advanced-polyp" | "polyp-unknown-type" | "unknown";
}) {
  return {
    id: "family-positive",
    conceptId: CCR_IDS.concepts.familyHistoryRelevant,
    category: "family_history" as const,
    presence: "yes" as const,
    details: {
      [CCR_FAMILY_DETAIL_KEYS.affectedFdrCount]: input.fdr,
      [CCR_FAMILY_DETAIL_KEYS.affectedSdrCount]: input.sdr ?? 0,
      ...(input.ageBand === undefined
        ? {}
        : { [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand]: input.ageBand }),
      ...(input.exactAge === undefined
        ? {}
        : { [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeYears]: input.exactAge }),
      [CCR_FAMILY_DETAIL_KEYS.findingType]: input.finding ?? CCR_FAMILY_VALUES.crc,
    },
  };
}

function fitNegative(id: string, when: string) {
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

function fitPositive(id: string, when: string) {
  return {
    ...fitNegative(id, when),
    result: { status: "final" as const, code: CCR_IDS.results.fitPositive },
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
  family?: ReturnType<typeof familyNone> | ReturnType<typeof familyUnknown> | ReturnType<typeof familyPositive>;
  strategy?: "fit" | "colonoscopy";
  exams?: unknown[];
} = {}) {
  return PatientSchema.parse({
    context: { ageYears: input.age ?? 60 },
    facts: [
      ...baseFacts,
      input.family ?? familyNone(),
      ...(input.strategy === undefined ? [] : [strategyFact(input.strategy)]),
    ],
    examHistory: input.exams ?? [],
    historyKnowledge: { [CCR_IDS.topic]: "known" },
  });
}

function promote(rule: RuleDefinition): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "active",
    reviewStatus: "reviewed_by_1",
    governance: {
      ...rule.governance,
      reviews: [
        {
          reviewer: "phase6.4-family-test-only-not-a-clinical-review",
          reviewedAt: asOf,
        },
      ],
    },
  });
}

function previewRuleset(policyId: string): Ruleset {
  const policy = ccrPhase64Ruleset.policies.find((item) => item.policyId === policyId);
  if (policy === undefined) throw new Error(`Unknown policy ${policyId}`);
  const selected = new Set(policy.ruleIds);
  return RulesetSchema.parse({
    ...ccrPhase64Ruleset,
    rules: ccrPhase64Ruleset.rules.map((rule) =>
      selected.has(rule.ruleId) ? promote(rule) : rule,
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

const highRiskUnder60 = () =>
  familyPositive({ fdr: 1, ageBand: CCR_FAMILY_VALUES.ageUnder60 });
const oneFdr60Plus = () =>
  familyPositive({ fdr: 1, ageBand: CCR_FAMILY_VALUES.age60OrOlder });
const twoFdr = () => familyPositive({ fdr: 2 });
const oneSdr = () => familyPositive({ fdr: 0, sdr: 1 });

describe("CCR Phase 6.4 governance", () => {
  it("keeps production translations draft/source_verified and validates the ruleset", () => {
    expect(validateBundle(ccrPhase64Ruleset)).toEqual([]);
    expect(ccrPhase64Ruleset.rulesetVersion).toBe("crc-0.4.0-phase6.4-draft");
    expect(
      ccrPhase64Ruleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "draft" &&
          rule.reviewStatus === "source_verified" &&
          rule.governance.reviews.length === 0,
      ),
    ).toBe(true);
  });
});

describe("International ACG family-history supplement", () => {
  it("uses colonoscopy q5 for one FDR diagnosed before 60 and suppresses average-risk strategy actions", () => {
    const p = patient({ age: 60, family: highRiskUnder60() });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.familyHighRisk).state.status,
    ).toBe("Due");
    expect(actionIds(internationalPhase64Policy.policyId, p)).toContain(
      "crc-action-colonoscopy-screening",
    );
    expect(actionIds(internationalPhase64Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.population).state.status,
    ).toBe("NotApplicable");
  });

  it("keeps a high-risk family screening colonoscopy current for five years", () => {
    const p = patient({
      age: 60,
      family: highRiskUnder60(),
      exams: [screeningColonoscopy("family-colono", "2024-01-01")],
    });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.familyHighRisk).state.status,
    ).toBe("Current");
  });

  it("uses the same q5 high-risk pathway for two or more FDRs at any age", () => {
    const p = patient({ age: 60, family: twoFdr() });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.familyHighRisk).state.status,
    ).toBe("Due");
  });

  it("abstains below 40 when exact youngest diagnosis age is needed but unavailable", () => {
    const p = patient({ age: 35, family: highRiskUnder60() });
    const result = track(
      internationalPhase64Policy.policyId,
      p,
      CCR_IDS.tracks.familyHighRisk,
    );
    expect(result.state.status).toBe("Indeterminate");
    expect(result.missingData).toContain("youngest-diagnosis-age-years");
  });

  it("applies the 10-years-earlier start rule below 40 when exact youngest age is available", () => {
    const p = patient({
      age: 35,
      family: familyPositive({
        fdr: 1,
        ageBand: CCR_FAMILY_VALUES.ageUnder60,
        exactAge: 42,
      }),
    });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.familyHighRisk).state.status,
    ).toBe("Due");
  });

  it("offers a human strategy choice at ages 40-44 for one FDR diagnosed at 60 or older", () => {
    const p = patient({ age: 42, family: oneFdr60Plus() });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.familyChoice).state.status,
    ).toBe("Due");
    expect(actionIds(internationalPhase64Policy.policyId, p)).toContain(
      "crc-action-offer-screening-strategy",
    );
    expect(actionIds(internationalPhase64Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("allows annual FIT at ages 40-44 when that strategy is explicitly selected for one FDR >=60", () => {
    const p = patient({
      age: 42,
      family: oneFdr60Plus(),
      strategy: CCR_STRATEGY_VALUES.fit,
    });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Due");
    expect(actionIds(internationalPhase64Policy.policyId, p)).toContain(
      "crc-action-fit-screening",
    );
  });

  it("allows q10 colonoscopy at ages 40-44 when that strategy is explicitly selected for one FDR >=60", () => {
    const p = patient({
      age: 42,
      family: oneFdr60Plus(),
      strategy: CCR_STRATEGY_VALUES.colonoscopy,
    });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.colonoscopyStrategy).state.status,
    ).toBe("Due");
    expect(actionIds(internationalPhase64Policy.policyId, p)).toContain(
      "crc-action-colonoscopy-screening",
    );
  });

  it("returns to average-risk strategy intervals after age 45 for one FDR >=60", () => {
    const p = patient({
      age: 60,
      family: oneFdr60Plus(),
      strategy: CCR_STRATEGY_VALUES.fit,
      exams: [fitNegative("fit-2025", "2025-10-01")],
    });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Due");
  });

  it("uses average-risk recommendations for one isolated second-degree relative", () => {
    const p = patient({
      age: 60,
      family: oneSdr(),
      strategy: CCR_STRATEGY_VALUES.fit,
    });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Due");
    expect(actionIds(internationalPhase64Policy.policyId, p)).toContain(
      "crc-action-fit-screening",
    );
  });
});

describe("Unknown and complex family history", () => {
  it("preserves the International age-based screening indication but withholds final strategy when family history is unknown", () => {
    const p = patient({
      age: 62,
      family: familyUnknown(),
      strategy: CCR_STRATEGY_VALUES.fit,
    });
    const population = track(
      internationalPhase64Policy.policyId,
      p,
      CCR_IDS.tracks.population,
    );
    expect(population.state.status).toBe("Due");
    expect(population.actions).toEqual([]);
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Indeterminate");
    expect(actionIds(internationalPhase64Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("does not equate unknown family history with a negative family history", () => {
    const unknown = patient({
      age: 62,
      family: familyUnknown(),
      strategy: CCR_STRATEGY_VALUES.fit,
    });
    const negative = patient({
      age: 62,
      family: familyNone(),
      strategy: CCR_STRATEGY_VALUES.fit,
    });
    expect(
      track(internationalPhase64Policy.policyId, unknown, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Indeterminate");
    expect(
      track(internationalPhase64Policy.policyId, negative, CCR_IDS.tracks.fitStrategy).state.status,
    ).toBe("Due");
  });

  it("withholds automatic SUS FIT when family history is unknown in the routine age band", () => {
    const p = patient({ age: 62, family: familyUnknown() });
    expect(track(susPhase64Policy.policyId, p, CCR_IDS.tracks.routine).state.status).toBe(
      "Indeterminate",
    );
    expect(actionIds(susPhase64Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("routes unknown polyp type to ClinicalReviewRequired rather than assuming advanced or non-advanced disease", () => {
    const p = patient({
      age: 60,
      family: familyPositive({
        fdr: 1,
        ageBand: CCR_FAMILY_VALUES.ageUnder60,
        finding: CCR_FAMILY_VALUES.polypUnknownType,
      }),
      strategy: CCR_STRATEGY_VALUES.fit,
    });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.familyStatus).state.status,
    ).toBe("ClinicalReviewRequired");
    expect(actionIds(internationalPhase64Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });
});

describe("Policy isolation for family history", () => {
  it("automates the ACG q5 pathway only in International and keeps SUS/BA-A under review", () => {
    const p = patient({ age: 60, family: highRiskUnder60() });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.familyHighRisk).state.status,
    ).toBe("Due");
    expect(track(susPhase64Policy.policyId, p, CCR_IDS.tracks.familyStatus).state.status).toBe(
      "ClinicalReviewRequired",
    );
    expect(
      track(brasilAmpliadoPhase64Policy.policyId, p, CCR_IDS.tracks.familyStatus).state.status,
    ).toBe("ClinicalReviewRequired");
    expect(actionIds(susPhase64Policy.policyId, p)).not.toContain(
      "crc-action-colonoscopy-screening",
    );
    expect(actionIds(brasilAmpliadoPhase64Policy.policyId, p)).not.toContain(
      "crc-action-colonoscopy-screening",
    );
  });

  it("keeps even an isolated positive SDR outside simple Brazilian automation", () => {
    const p = patient({ age: 60, family: oneSdr() });
    expect(
      track(brasilAmpliadoPhase64Policy.policyId, p, CCR_IDS.tracks.familyStatus).state.status,
    ).toBe("ClinicalReviewRequired");
    expect(actionIds(brasilAmpliadoPhase64Policy.policyId, p)).not.toContain(
      "crc-action-fit-screening",
    );
  });

  it("does not apply the International post-FIT q10 clock automatically to high-risk family history", () => {
    const p = patient({
      age: 60,
      family: highRiskUnder60(),
      exams: [
        fitPositive("fit-pos", "2024-01-01"),
        diagnosticColonoscopy("colono-normal", "2024-02-01"),
      ],
    });
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.postFitRoutine).state.status,
    ).toBe("ClinicalReviewRequired");
    expect(
      track(internationalPhase64Policy.policyId, p, CCR_IDS.tracks.familyHighRisk).state.status,
    ).toBe("ClinicalReviewRequired");
  });
});
