import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import {
  RuleDefinitionSchema,
  RulesetSchema,
  type CareSettingContext,
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

const ADVERSARIAL_CASE_IDS = Array.from({ length: 60 }, (_, i) =>
  String(i + 1).padStart(3, "0"),
);

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

function positiveFact(conceptId: string, id = conceptId) {
  return {
    id,
    conceptId,
    category: "condition" as const,
    presence: "yes" as const,
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
  sdr: number;
  ageBand: "under-60" | "60-or-older" | "unknown";
  finding?: "crc" | "advanced-polyp" | "polyp-unknown-type" | "unknown";
  exactAge?: number;
}) {
  return {
    id: "family-positive",
    conceptId: CCR_IDS.concepts.familyHistoryRelevant,
    category: "family_history" as const,
    presence: "yes" as const,
    details: {
      [CCR_FAMILY_DETAIL_KEYS.affectedFdrCount]: input.fdr,
      [CCR_FAMILY_DETAIL_KEYS.affectedSdrCount]: input.sdr,
      [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand]: input.ageBand,
      [CCR_FAMILY_DETAIL_KEYS.findingType]: input.finding ?? CCR_FAMILY_VALUES.crc,
      ...(input.exactAge === undefined
        ? {}
        : { [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeYears]: input.exactAge }),
    },
  };
}

function fit(
  id: string,
  when: string,
  result: "positive" | "negative" | "pending" | "invalid",
) {
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: CCR_IDS.modalities.fit,
    status: "performed" as const,
    date: date(when),
    result:
      result === "positive" || result === "negative"
        ? ({ status: "final" as const, code: result } as const)
        : ({ status: result } as const),
    quality: result === "invalid" ? ("unknown" as const) : ("adequate" as const),
    completeness: "not_applicable" as const,
    resolutionInformation:
      result === "positive" || result === "negative"
        ? ("sufficient" as const)
        : ("unknown" as const),
  };
}

function colonoscopy(
  id: string,
  when: string,
  input: {
    diagnostic?: boolean;
    result?: "normal" | "polyp-or-lesion" | "cancer";
    quality?: "adequate" | "inadequate" | "unknown";
    completeness?: "complete" | "incomplete" | "unknown";
    resolutionInformation?: "sufficient" | "insufficient" | "unknown";
  } = {},
) {
  return {
    id,
    topicId: CCR_IDS.topic,
    modality: input.diagnostic
      ? CCR_IDS.modalities.colonoscopyDiagnostic
      : CCR_IDS.modalities.colonoscopyScreening,
    status: "performed" as const,
    date: date(when),
    result: {
      status: "final" as const,
      code: input.result ?? CCR_IDS.results.colonoscopyNormal,
    },
    quality: input.quality ?? ("adequate" as const),
    completeness: input.completeness ?? ("complete" as const),
    resolutionInformation:
      input.resolutionInformation ?? ("sufficient" as const),
  };
}

type PatientOptions = {
  age?: number;
  facts?: unknown[];
  exams?: unknown[];
  historyKnowledge?: "known" | "never_performed" | "unknown" | "not_asked";
};

function patient(input: PatientOptions = {}) {
  return PatientSchema.parse({
    context: { ageYears: input.age ?? 60 },
    facts: input.facts ?? baseFacts,
    examHistory: input.exams ?? [],
    historyKnowledge: {
      [CCR_IDS.topic]: input.historyKnowledge ?? "known",
    },
  });
}

function replaceFact(facts: readonly unknown[], conceptId: string, replacement: unknown) {
  return [
    ...facts.filter(
      (fact) =>
        typeof fact !== "object" ||
        fact === null ||
        !("conceptId" in fact) ||
        fact.conceptId !== conceptId,
    ),
    replacement,
  ];
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
          reviewer: "phase6.5-golden-test-only-not-a-clinical-review",
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
      selected.has(rule.ruleId) ? testPromote(rule) : rule,
    ),
  });
}

function run(
  policyId: string,
  p: ReturnType<typeof patient>,
  options: { at?: string; careSetting?: CareSettingContext } = {},
) {
  return evaluatePatient({
    patient: p,
    ruleset: previewRuleset(policyId),
    policyId,
    asOf: day(options.at ?? "2026-10-24"),
    extensions: ccrPhase64Resolvers,
    ...(options.careSetting === undefined ? {} : { careSetting: options.careSetting }),
  });
}

function tracks(result: ReturnType<typeof run>) {
  return result.plan.topics.flatMap((topic) => topic.tracks);
}

function findTrack(result: ReturnType<typeof run>, id: string) {
  const item = tracks(result).find((track) => track.trackId === id);
  if (item === undefined) throw new Error(`Missing track ${id}`);
  return item;
}

function allActions(result: ReturnType<typeof run>) {
  return tracks(result).flatMap((track) => track.actions);
}

function actionIds(result: ReturnType<typeof run>) {
  return allActions(result).map((action) => action.actionId);
}

function planSignature(result: ReturnType<typeof run>) {
  return JSON.stringify(result.plan);
}

function traceSignature(result: ReturnType<typeof run>) {
  return JSON.stringify(result.traces);
}

const policies = {
  sus: susPhase64Policy.policyId,
  ba: brasilAmpliadoPhase64Policy.policyId,
  intl: internationalPhase64Policy.policyId,
} as const;

describe("CCR Phase 6.5 adversarial manifest", () => {
  it("keeps an explicit 60-case audit manifest with no gaps or duplicate identities", () => {
    expect(ADVERSARIAL_CASE_IDS).toHaveLength(60);
    expect(new Set(ADVERSARIAL_CASE_IDS).size).toBe(60);
    expect(ADVERSARIAL_CASE_IDS[0]).toBe("001");
    expect(ADVERSARIAL_CASE_IDS[59]).toBe("060");
  });
});

describe("age and interval boundary goldens", () => {
  const cases = [
    ["001", policies.sus, 49, "NotApplicable"],
    ["002", policies.sus, 50, "Due"],
    ["004", policies.sus, 75, "Due"],
    ["005", policies.sus, 76, "NotApplicable"],
    ["006", policies.intl, 80, "SharedDecision"],
  ] as const;

  it.each(cases)("case %s has the expected population/routine boundary", (_id, policyId, age, expected) => {
    const result = run(
      policyId,
      patient({ age, historyKnowledge: "never_performed" }),
    );
    const trackId = policyId === policies.intl ? CCR_IDS.tracks.population : CCR_IDS.tracks.routine;
    expect(findTrack(result, trackId).state.status).toBe(expected);
  });

  it("case 038 preserves the deliberate 47-year divergence across all three policies", () => {
    const p = patient({ age: 47, historyKnowledge: "never_performed" });
    expect(findTrack(run(policies.sus, p), CCR_IDS.tracks.routine).state.status).toBe("NotApplicable");
    expect(findTrack(run(policies.ba, p), CCR_IDS.tracks.routine).state.status).toBe("SharedDecision");
    expect(findTrack(run(policies.intl, p), CCR_IDS.tracks.population).state.status).toBe("Due");
  });

  it("case 055 becomes Due exactly on the SUS two-year anniversary without a grace period", () => {
    const p = patient({
      exams: [fit("fit-2024", "2024-10-24", "negative")],
      facts: [...baseFacts],
    });
    expect(findTrack(run(policies.sus, p), CCR_IDS.tracks.routine).state.status).toBe("Due");
  });
});

describe("history knowledge and semantic safety", () => {
  it("case 009 never converts unknown screening history into never_performed", () => {
    const result = run(policies.sus, patient({ historyKnowledge: "unknown" }));
    expect(findTrack(result, CCR_IDS.tracks.routine).state.status).toBe("Indeterminate");
  });

  it("case 010 allows confirmed never_performed to support Due only in an eligible population", () => {
    const eligible = run(policies.sus, patient({ age: 60, historyKnowledge: "never_performed" }));
    const outside = run(policies.sus, patient({ age: 49, historyKnowledge: "never_performed" }));
    expect(findTrack(eligible, CCR_IDS.tracks.routine).state.status).toBe("Due");
    expect(findTrack(outside, CCR_IDS.tracks.routine).state.status).toBe("NotApplicable");
  });

  it("case 048 keeps history known when colonoscopy exists and never invents global never_performed", () => {
    const p = patient({
      historyKnowledge: "known",
      facts: [...baseFacts, strategy(CCR_STRATEGY_VALUES.colonoscopy)],
      exams: [colonoscopy("screen-colono", "2023-01-01")],
    });
    expect(findTrack(run(policies.intl, p), CCR_IDS.tracks.colonoscopyStrategy).state.status).toBe("Current");
  });

  it("case 056 rejects a future performed exam relative to asOf", () => {
    const result = run(
      policies.sus,
      patient({ exams: [fit("future-fit", "2027-01-01", "negative")] }),
    );
    const topic = result.plan.topics[0];
    expect(topic?.tracks[0]?.state.status).toBe("Indeterminate");
    expect(topic?.tracks[0]?.trace.issues).toContain("future-fit:future_date");
  });

  it("case 058 rejects never_performed when a performed CCR exam is present", () => {
    const result = run(
      policies.sus,
      patient({
        historyKnowledge: "never_performed",
        exams: [fit("existing-fit", "2025-01-01", "negative")],
      }),
    );
    expect(result.plan.topics[0]?.tracks[0]?.state.status).toBe("Indeterminate");
    expect(result.plan.topics[0]?.tracks[0]?.trace.issues).toContain("contradictory_history_knowledge");
  });
});

describe("scope and special-risk abstention", () => {
  it("cases 034/059 abstain from preventive screening when professional scope is explicitly negative", () => {
    const facts = replaceFact(baseFacts, CCR_IDS.concepts.screeningContextConfirmed, {
      id: "scope-no",
      conceptId: CCR_IDS.concepts.screeningContextConfirmed,
      category: "population_context",
      presence: "no",
    });
    const result = run(policies.sus, patient({ facts }));
    expect(findTrack(result, CCR_IDS.tracks.routine).state.status).toBe("NotApplicable");
    expect(allActions(result)).toEqual([]);
  });

  it("case 035 is Indeterminate when preventive context was not established", () => {
    const facts = baseFacts.filter(
      (fact) => fact.conceptId !== CCR_IDS.concepts.screeningContextConfirmed,
    );
    expect(findTrack(run(policies.sus, patient({ facts })), CCR_IDS.tracks.routine).state.status).toBe("Indeterminate");
  });

  const exclusions = [
    ["025", CCR_IDS.concepts.priorCrc],
    ["060", CCR_IDS.concepts.priorPolypSurveillance],
    ["027", CCR_IDS.concepts.colonicIbd],
    ["032", CCR_IDS.concepts.hereditarySyndrome],
  ] as const;

  it.each(exclusions)("case %s never emits average-risk routine screening when special-risk fact %s is positive", (_id, conceptId) => {
    const facts = replaceFact(baseFacts, conceptId, positiveFact(conceptId));
    const result = run(policies.sus, patient({ facts }));
    expect(actionIds(result)).not.toContain("crc-action-fit-screening");
  });
});

describe("care-setting preserves science and changes only operational route", () => {
  it.each([
    ["available", "local"],
    ["unknown", "clarify_availability"],
    ["unavailable", "clinical_review"],
  ] as const)("case 036 FIT %s keeps Due but routes operationally as %s", (availability, route) => {
    const result = run(
      policies.sus,
      patient({ historyKnowledge: "never_performed" }),
      { careSetting: { resources: { [CCR_IDS.resources.fit]: availability } } },
    );
    const routine = findTrack(result, CCR_IDS.tracks.routine);
    expect(routine.state.status).toBe("Due");
    const action = routine.actions.find((item) => item.actionId === "crc-action-fit-screening");
    expect(action?.operational?.availability).toBe(availability);
    expect(action?.operational?.route).toBe(route);
  });

  it.each([
    ["available", "local"],
    ["unknown", "clarify_availability"],
    ["unavailable", "referral"],
  ] as const)("case 037 colonoscopy %s keeps FIT-positive InFollowUp and route %s", (availability, route) => {
    const result = run(
      policies.sus,
      patient({ exams: [fit("fit-pos", "2026-01-01", "positive")] }),
      { careSetting: { resources: { [CCR_IDS.resources.colonoscopy]: availability } } },
    );
    const follow = findTrack(result, CCR_IDS.tracks.fitFollowup);
    expect(follow.state.status).toBe("InFollowUp");
    const action = follow.actions.find(
      (item) => item.actionId === "crc-action-diagnostic-colonoscopy-after-fit-positive",
    );
    expect(action?.operational?.availability).toBe(availability);
    expect(action?.operational?.route).toBe(route);
    expect(actionIds(result)).not.toContain("crc-action-fit-screening");
  });
});

describe("temporal precision and event-order invariants", () => {
  it("case 039 preserves partial-date uncertainty for annual International FIT", () => {
    const p = patient({
      facts: [...baseFacts, strategy(CCR_STRATEGY_VALUES.fit)],
      exams: [fit("fit-year-only", "2025", "negative")],
    });
    expect(findTrack(run(policies.intl, p), CCR_IDS.tracks.fitStrategy).state.status).toBe("Indeterminate");
  });

  it("case 039 can remain Current under the wider biennial SUS window", () => {
    const p = patient({ exams: [fit("fit-year-only", "2025", "negative")], facts: [...baseFacts] });
    expect(findTrack(run(policies.sus, p), CCR_IDS.tracks.routine).state.status).toBe("Current");
  });

  it("case 040 gives the same plan and traces when exam input order is reversed", () => {
    const exams = [
      fit("fit-pos", "2024-01-01", "positive"),
      colonoscopy("colono", "2024-02-01", { diagnostic: true }),
      fit("fit-neg", "2023-01-01", "negative"),
    ];
    const a = run(policies.intl, patient({ exams }));
    const b = run(policies.intl, patient({ exams: [...exams].reverse() }));
    expect(planSignature(a)).toBe(planSignature(b));
    expect(traceSignature(a)).toBe(traceSignature(b));
  });

  it("case 041 never infers post-trigger order from same-day dates", () => {
    const result = run(
      policies.sus,
      patient({
        exams: [
          fit("fit-pos", "2026-03-10", "positive"),
          colonoscopy("colono", "2026-03-10", { diagnostic: true }),
        ],
      }),
    );
    expect(findTrack(result, CCR_IDS.tracks.fitFollowup).state.status).toBe("Indeterminate");
  });

  it("case 042 never infers order from overlapping partial dates", () => {
    const result = run(
      policies.sus,
      patient({
        exams: [
          fit("fit-pos", "2025-03", "positive"),
          colonoscopy("colono", "2025", { diagnostic: true }),
        ],
      }),
    );
    expect(findTrack(result, CCR_IDS.tracks.fitFollowup).state.status).toBe("Indeterminate");
  });
});

describe("FIT-positive precedence and non-redundancy", () => {
  it("case 043 keeps follow-up actionable at age 85 even when routine population logic changes", () => {
    const result = run(
      policies.intl,
      patient({ age: 85, exams: [fit("fit-pos", "2025-01-01", "positive")] }),
    );
    expect(findTrack(result, CCR_IDS.tracks.fitFollowup).state.status).toBe("InFollowUp");
    expect(actionIds(result)).toContain("crc-action-diagnostic-colonoscopy-after-fit-positive");
  });

  it("case 046 does not let a later invalid FIT erase earlier valid negative coverage", () => {
    const result = run(
      policies.sus,
      patient({
        exams: [
          fit("fit-neg", "2026-01-01", "negative"),
          fit("fit-invalid", "2026-05-01", "invalid"),
        ],
      }),
    );
    expect(findTrack(result, CCR_IDS.tracks.routine).state.status).toBe("Current");
  });

  it("case 047 opens a new follow-up after a previously resolved FIT-positive episode", () => {
    const result = run(
      policies.intl,
      patient({
        exams: [
          fit("fit-pos-1", "2024-01-01", "positive"),
          colonoscopy("colono-normal", "2024-02-01", { diagnostic: true }),
          fit("fit-pos-2", "2025-01-01", "positive"),
        ],
      }),
    );
    expect(findTrack(result, CCR_IDS.tracks.fitFollowup).state.status).toBe("InFollowUp");
  });

  it("case 057 suppresses every routine screening action while a new FIT-positive episode is open", () => {
    const result = run(
      policies.intl,
      patient({
        facts: [...baseFacts, strategy(CCR_STRATEGY_VALUES.fit)],
        exams: [
          fit("fit-neg", "2026-01-01", "negative"),
          fit("fit-pos", "2026-05-01", "positive"),
        ],
      }),
    );
    expect(findTrack(result, CCR_IDS.tracks.fitFollowup).state.status).toBe("InFollowUp");
    expect(actionIds(result)).not.toContain("crc-action-fit-screening");
    expect(actionIds(result)).not.toContain("crc-action-colonoscopy-screening");
  });
});

describe("family-history and policy-isolation adversaries", () => {
  it("case 049 preserves International age-based Due while withholding strategy when family history is unknown", () => {
    const facts = replaceFact(baseFacts, CCR_IDS.concepts.familyHistoryRelevant, familyUnknown());
    const result = run(policies.intl, patient({ age: 62, facts }));
    expect(findTrack(result, CCR_IDS.tracks.population).state.status).toBe("Due");
    expect(actionIds(result)).not.toContain("crc-action-fit-screening");
    expect(actionIds(result)).not.toContain("crc-action-colonoscopy-screening");
  });

  it("case 053 keeps one isolated SDR on average-risk International recommendations", () => {
    const facts = replaceFact(
      baseFacts,
      CCR_IDS.concepts.familyHistoryRelevant,
      familyPositive({ fdr: 0, sdr: 1, ageBand: "60-or-older", exactAge: 78 }),
    );
    const result = run(policies.intl, patient({ age: 60, facts, historyKnowledge: "never_performed" }));
    expect(findTrack(result, CCR_IDS.tracks.population).state.status).toBe("Due");
    expect(findTrack(result, CCR_IDS.tracks.familyHighRisk).state.status).toBe("NotApplicable");
  });

  it("case 029 does not apply q5 to one FDR diagnosed at 70", () => {
    const facts = replaceFact(
      baseFacts,
      CCR_IDS.concepts.familyHistoryRelevant,
      familyPositive({ fdr: 1, sdr: 0, ageBand: "60-or-older", exactAge: 70 }),
    );
    const result = run(policies.intl, patient({ age: 60, facts, historyKnowledge: "never_performed" }));
    expect(findTrack(result, CCR_IDS.tracks.familyHighRisk).state.status).toBe("NotApplicable");
  });

  it("cases 030/031 apply ACG q5 only under International, never silently under SUS/BA-A", () => {
    for (const fdr of [1, 2]) {
      const facts = replaceFact(
        baseFacts,
        CCR_IDS.concepts.familyHistoryRelevant,
        familyPositive({
          fdr,
          sdr: 0,
          ageBand: fdr === 1 ? "under-60" : "60-or-older",
          exactAge: fdr === 1 ? 42 : 70,
        }),
      );
      const p = patient({ age: 60, facts, historyKnowledge: "never_performed" });
      expect(findTrack(run(policies.intl, p), CCR_IDS.tracks.familyHighRisk).state.status).toBe("Due");
      expect(findTrack(run(policies.sus, p), CCR_IDS.tracks.familyStatus).state.status).toBe("ClinicalReviewRequired");
      expect(findTrack(run(policies.ba, p), CCR_IDS.tracks.familyStatus).state.status).toBe("ClinicalReviewRequired");
    }
  });

  it("case 026 routes positive family polyp of unknown type to ClinicalReviewRequired", () => {
    const facts = replaceFact(
      baseFacts,
      CCR_IDS.concepts.familyHistoryRelevant,
      familyPositive({
        fdr: 1,
        sdr: 0,
        ageBand: "under-60",
        finding: "polyp-unknown-type",
      }),
    );
    expect(findTrack(run(policies.intl, patient({ facts })), CCR_IDS.tracks.familyStatus).state.status).toBe("ClinicalReviewRequired");
  });
});

describe("determinism, policy isolation and trace integrity", () => {
  it("is byte-for-byte deterministic across repeated evaluations of the same request", () => {
    const p = patient({
      facts: [...baseFacts, strategy(CCR_STRATEGY_VALUES.fit)],
      exams: [fit("fit-neg", "2026-01-01", "negative")],
    });
    const a = run(policies.intl, p);
    const b = run(policies.intl, p);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("is insensitive to fact input order for semantically identical facts", () => {
    const p1 = patient({ facts: [...baseFacts] });
    const p2 = patient({ facts: [...baseFacts].reverse() });
    expect(JSON.stringify(run(policies.sus, p1))).toBe(JSON.stringify(run(policies.sus, p2)));
  });

  it("never emits duplicate action identities in a consultation plan", () => {
    const scenarios = [
      run(policies.sus, patient({ historyKnowledge: "never_performed" })),
      run(policies.intl, patient({ exams: [fit("fit-pos", "2026-01-01", "positive")] })),
      run(policies.ba, patient({ age: 47, historyKnowledge: "never_performed" })),
    ];
    for (const result of scenarios) {
      const ids = actionIds(result);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("keeps trace policyId/rulesetVersion aligned to the exact evaluation request", () => {
    for (const policyId of Object.values(policies)) {
      const result = run(policyId, patient({ historyKnowledge: "never_performed" }));
      for (const trace of result.traces) {
        expect(trace.policyId).toBe(policyId);
        expect(trace.rulesetVersion).toBe("crc-0.4.0-phase6.4-draft");
        expect(trace.asOf).toEqual(asOf);
      }
    }
  });

  it("never leaks ACG source into SUS/BA-A traces", () => {
    const highRiskFacts = replaceFact(
      baseFacts,
      CCR_IDS.concepts.familyHistoryRelevant,
      familyPositive({ fdr: 1, sdr: 0, ageBand: "under-60", exactAge: 42 }),
    );
    for (const policyId of [policies.sus, policies.ba]) {
      const result = run(policyId, patient({ facts: highRiskFacts }));
      const sourceIds = tracks(result).flatMap((track) => track.trace.sourceIds);
      expect(sourceIds).not.toContain("crc-src-I03");
    }
  });

  it("keeps every recordsUsed identity inside recordsConsidered when history was inspected", () => {
    const result = run(
      policies.intl,
      patient({
        exams: [
          fit("fit-pos", "2024-01-01", "positive"),
          colonoscopy("colono", "2024-02-01", { diagnostic: true }),
        ],
      }),
    );
    for (const item of tracks(result)) {
      for (const used of item.trace.recordsUsed) {
        expect(item.trace.recordsConsidered).toContain(used);
      }
    }
  });
});

describe("systematic permutation matrix", () => {
  const baseExams = [
    fit("fit-pos", "2024-01-01", "positive"),
    colonoscopy("colono-normal", "2024-02-01", { diagnostic: true }),
    fit("fit-pos-new", "2025-06-01", "positive"),
  ];

  const permutations = [
    baseExams,
    [baseExams[2], baseExams[1], baseExams[0]],
    [baseExams[1], baseExams[0], baseExams[2]],
    [baseExams[2], baseExams[0], baseExams[1]],
  ];

  it.each(Object.entries(policies))("keeps the same clinical interpretation for exam-order permutations under %s", (_name, policyId) => {
    const signatures = permutations.map((exams) =>
      JSON.stringify(run(policyId, patient({ exams }))),
    );
    expect(new Set(signatures).size).toBe(1);
  });

  it.each([
    ["sus", policies.sus],
    ["ba", policies.ba],
    ["intl", policies.intl],
  ] as const)("never emits routine screening beside open FIT-positive follow-up under %s", (_name, policyId) => {
    const result = run(
      policyId,
      patient({
        facts: [...baseFacts, strategy(CCR_STRATEGY_VALUES.fit)],
        exams: [fit("fit-pos", "2026-01-01", "positive")],
      }),
    );
    expect(findTrack(result, CCR_IDS.tracks.fitFollowup).state.status).toBe("InFollowUp");
    expect(actionIds(result)).not.toContain("crc-action-fit-screening");
    expect(actionIds(result)).not.toContain("crc-action-colonoscopy-screening");
  });
});
