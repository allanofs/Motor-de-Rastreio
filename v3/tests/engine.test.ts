import { describe, expect, it, vi } from "vitest";
import { evaluatePatient } from "../src/engine/evaluatePatient";
import { safeEvaluateTopic } from "../src/engine/safeEvaluate";
import { createTrace } from "../src/engine/trace";
import { sanitizeAndPruneInput } from "../src/engine/sanitize";
import { normalizePatient } from "../src/engine/derive";
import { isCertainlyAfter } from "../src/engine/resolveHistory";
import { PatientSchema, ExamRecordSchema } from "../src/model/patient";
import { RulesetSchema } from "../src/model/content";
import type { RuleDefinition, Ruleset } from "../src/model/content";
import {
  TopicEvaluationSchema,
  TrackEvaluationSchema,
} from "../src/model/evaluation";
import {
  parseCalendarDate as day,
  parsePartialDate as partial,
} from "../src/model/dates";
import { asOf, bundle, patient, policy, rule } from "./fixtures";
const run = (
  p: unknown = patient,
  b: Ruleset = bundle,
  date = asOf,
  resources = {},
) =>
  evaluatePatient({
    patient: p,
    ruleset: b,
    policyId: policy.policyId,
    asOf: date,
    careSetting: { resources },
  });
const track = (p: unknown = patient, b: Ruleset = bundle, date = asOf) =>
  run(p, b, date).plan.topics[0]!.tracks[0]!;
const fact = (id: string, presence: "yes" | "no" | "unknown" = "yes") => ({
  id,
  topicId: "technical-a",
  conceptId: id,
  category: "condition" as const,
  presence,
});
const event = (id: string, date = "2026-01-01", code = "accepted") =>
  ExamRecordSchema.parse({
    id,
    topicId: "technical-a",
    modality: "technical-exam",
    status: "performed",
    date: partial(date),
    result: { status: "final", code },
    quality: "adequate",
    completeness: "complete",
    resolutionInformation: "sufficient",
  });
const scheduled: RuleDefinition = {
  ...rule,
  qualifyingEventSpec: {
    modality: "technical-exam",
    resultCodes: ["accepted"],
    requireAdequateQuality: true,
    requireComplete: true,
    requireSufficientResolution: true,
  },
  scheduleSpec: { unit: "years", amount: 1 },
};
const scheduleBundle = { ...bundle, rules: [scheduled] };
function withRules(
  rules: RuleDefinition[],
  extra: Partial<typeof policy> = {},
): Ruleset {
  return RulesetSchema.parse({
    ...bundle,
    rules,
    policies: [
      {
        ...policy,
        ruleIds: rules.map((r) => r.ruleId),
        topicIds: [...new Set(rules.map((r) => r.topicId))],
        ...extra,
      },
    ],
  });
}

describe("input and missingness invariants", () => {
  it("prunes hidden facts before schema validation without mutating input", () => {
    const raw = {
      ...patient,
      facts: [
        { ...fact("hidden"), _ui: { enabled: false }, details: { stale: "x" } },
      ],
    };
    const snapshot = structuredClone(raw);
    expect(run(raw)).toEqual(run(patient));
    expect(raw).toEqual(snapshot);
  });
  it("prunes not asked without turning it into patient-reported unknown", () => {
    const raw = {
      ...patient,
      facts: [{ ...fact("f"), _ui: { answered: false } }],
    };
    expect(PatientSchema.parse(sanitizeAndPruneInput(raw)).facts).toEqual([]);
    expect(
      PatientSchema.parse(
        sanitizeAndPruneInput({ ...patient, facts: [fact("f", "unknown")] }),
      ).facts[0]?.presence,
    ).toBe("unknown");
  });
  it("removes stale conditional values after a parent is changed to no", () =>
    expect(
      PatientSchema.parse(
        sanitizeAndPruneInput({
          ...patient,
          facts: [
            { ...fact("f", "no"), value: "stale", details: { sub: "stale" } },
          ],
        }),
      ).facts[0],
    ).not.toHaveProperty("details"));
  it("prunes stale exam fields after not_performed", () =>
    expect(
      PatientSchema.parse(
        sanitizeAndPruneInput({
          ...patient,
          examHistory: [{ ...event("e"), status: "not_performed" }],
        }),
      ).examHistory[0],
    ).toEqual({
      id: "e",
      topicId: "technical-a",
      modality: "technical-exam",
      status: "not_performed",
    }));
  it("prunes an unanswered optional context field", () =>
    expect(
      PatientSchema.parse(
        sanitizeAndPruneInput({
          ...patient,
          context: { ageYears: { _ui: { answered: false } } },
        }),
      ).context.ageYears,
    ).toBeUndefined());
  it("does not coerce unknown into no", () => {
    const b = withRules([
      {
        ...rule,
        requiredKnownFacts: ["risk"],
        population: { facts: [{ conceptId: "risk", presence: "no" }] },
      },
    ]);
    expect(
      track({ ...patient, facts: [{ ...fact("risk", "unknown") }] }, b).state
        .status,
    ).toBe("Indeterminate");
    expect(
      track({ ...patient, facts: [{ ...fact("risk", "no") }] }, b).state.status,
    ).toBe("Due");
  });
  it("distinguishes missing history knowledge from explicit unknown and never", () => {
    for (const knowledge of ["unknown", "never_performed"] as const)
      expect(
        PatientSchema.parse({
          ...patient,
          historyKnowledge: { "technical-a": knowledge },
        }).historyKnowledge["technical-a"],
      ).toBe(knowledge);
    expect(
      PatientSchema.parse({ ...patient, historyKnowledge: {} })
        .historyKnowledge["technical-a"],
    ).toBeUndefined();
  });
  it("refuses contradictory history", () =>
    expect(
      track({
        ...patient,
        historyKnowledge: { "technical-a": "never_performed" },
        examHistory: [event("e")],
      }).state.status,
    ).toBe("Indeterminate"));
  it.each([-1, 3.2, 151, Infinity, "40"])(
    "invalid age %s never emits recommendations",
    (age) => {
      const t = track({ ...patient, context: { ageYears: age } });
      expect(t.state.status).toBe("ComputationError");
      expect(t.actions).toEqual([]);
    },
  );
  it("detects duplicate stable IDs", () =>
    expect(
      track({ ...patient, facts: [fact("same")], examHistory: [event("same")] })
        .missingData,
    ).toContain("duplicate_patient_event_id"));
  it("rejects contradictory facts without picking the last typed observation", () =>
    expect(
      track({
        ...patient,
        facts: [fact("x"), { ...fact("x", "no"), id: "other", conceptId: "x" }],
      }).state.status,
    ).toBe("Indeterminate"));
  it("derives age only from complete birth dates and checks inconsistency", () => {
    const b = withRules([{ ...rule, population: { facts: [], minAge: 26 } }]);
    expect(
      track({ ...patient, context: { birthDate: partial("2000-10-23") } }, b)
        .state.status,
    ).toBe("Due");
    expect(
      track({ ...patient, context: { birthDate: partial("2000") } }, b).state
        .status,
    ).toBe("Indeterminate");
    expect(
      track(
        {
          ...patient,
          context: { birthDate: partial("2000-10-23"), ageYears: 40 },
        },
        b,
      ).missingData,
    ).toContain("age_birth_date_mismatch");
  });
});

describe("temporal evidence and scheduling", () => {
  it("never emits Current without a qualifying event", () => {
    const t = track(patient, scheduleBundle);
    expect(t.state.status).toBe("Indeterminate");
    expect(t.actions).toEqual([]);
  });
  it("emits Current with a positive anchor and source locator", () => {
    const t = track({ ...patient, examHistory: [event("e")] }, scheduleBundle);
    expect(t.state).toEqual({
      status: "Current",
      anchorEventId: "e",
      ruleId: "r1",
    });
    expect(t.trace.sourceRefs).toEqual(rule.sourceRefs);
    expect(t.actions).toEqual([]);
  });
  it.each(["2026-12-01", "2027", "2026"])(
    "future or partly future %s never qualifies",
    (date) =>
      expect(
        track({ ...patient, examHistory: [event("e", date)] }, scheduleBundle)
          .state.status,
      ).toBe("Indeterminate"),
  );
  it("rejects events before birth", () =>
    expect(
      track(
        {
          ...patient,
          context: { birthDate: partial("2000-01-01") },
          examHistory: [event("e", "1999-12-31")],
        },
        scheduleBundle,
      ).missingData,
    ).toContain("e:before_birth"));
  it.each(["inadequate", "unknown"] as const)("rejects %s quality", (quality) =>
    expect(
      track(
        { ...patient, examHistory: [{ ...event("e"), quality }] },
        scheduleBundle,
      ).state.status,
    ).toBe("Indeterminate"),
  );
  it("rejects incomplete or unknown completeness", () => {
    for (const completeness of ["incomplete", "unknown"])
      expect(
        track(
          { ...patient, examHistory: [{ ...event("e"), completeness }] },
          scheduleBundle,
        ).state.status,
      ).toBe("Indeterminate");
  });
  it("rejects an unaccepted result", () =>
    expect(
      track(
        { ...patient, examHistory: [event("e", "2026-01-01", "unaccepted")] },
        scheduleBundle,
      ).state.status,
    ).toBe("Indeterminate"));
  it("rejects pending results as qualifying evidence", () =>
    expect(
      track(
        {
          ...patient,
          examHistory: [{ ...event("e"), result: { status: "pending" } }],
        },
        scheduleBundle,
      ).state.status,
    ).toBe("Indeterminate"));
  it("holds partial date boundary as indeterminate", () =>
    expect(
      track({ ...patient, examHistory: [event("e", "2025")] }, scheduleBundle)
        .state.status,
    ).toBe("Indeterminate"));
  it("selects latest dated event rather than last input", () =>
    expect(
      track(
        {
          ...patient,
          examHistory: [event("new", "2026-01-01"), event("old", "2024-01-01")],
        },
        scheduleBundle,
      ).state,
    ).toEqual({ status: "Current", anchorEventId: "new", ruleId: "r1" }));
  it("does not infer latest order from overlapping partial dates", () =>
    expect(
      track(
        {
          ...patient,
          examHistory: [event("a", "2025"), event("b", "2025-07")],
        },
        scheduleBundle,
      ).missingData,
    ).toContain("event_order:r1"));
  it("requires date on all potentially qualifying events", () => {
    const e = event("e");
    if (e.status === "performed") delete e.date;
    expect(
      track({ ...patient, examHistory: [e] }, scheduleBundle).missingData,
    ).toContain("event_date:r1");
  });
  it("changes state solely through explicit asOf", () => {
    const p = { ...patient, examHistory: [event("e")] };
    expect(track(p, scheduleBundle, day("2026-12-31")).state.status).toBe(
      "Current",
    );
    expect(track(p, scheduleBundle, day("2027-01-01")).state.status).toBe(
      "Due",
    );
  });
  it("distinguishes later, earlier, same-day and uncertain event order", () => {
    expect(
      isCertainlyAfter(event("b", "2026-01-02"), event("a", "2026-01-01")),
    ).toBe(true);
    expect(isCertainlyAfter(event("a"), event("b", "2026-01-02"))).toBe(false);
    expect(isCertainlyAfter(event("a"), event("b"))).toBe(false);
    expect(isCertainlyAfter(event("b", "2025"), event("a", "2025-07"))).toBe(
      false,
    );
  });
});

describe("selection and action composition", () => {
  it("coexists by default and emits multiple actions", () => {
    const b = withRules([
      rule,
      {
        ...rule,
        ruleId: "r2",
        actions: [
          {
            actionId: "a2",
            kind: "information",
            text: "Second synthetic action",
          },
        ],
      },
    ]);
    expect(track(patient, b).actions).toHaveLength(2);
  });
  it("suppressed rule never emits active action", () => {
    const b = withRules([
      rule,
      {
        ...rule,
        ruleId: "r2",
        supersedes: ["r1"],
        actions: [{ actionId: "a2", kind: "information", text: "Replacement" }],
      },
    ]);
    const t = track(patient, b);
    expect(t.activeRuleIds).toEqual(["r2"]);
    expect(t.actions.map((a) => a.actionId)).toEqual(["a2"]);
    expect(t.suppressedRules).toContainEqual({
      ruleId: "r1",
      reason: "superseded_by:r2",
    });
  });
  it("does not let inapplicable superseder suppress a rule", () =>
    expect(
      track(
        patient,
        withRules([
          rule,
          {
            ...rule,
            ruleId: "r2",
            population: { facts: [], minAge: 100 },
            supersedes: ["r1"],
          },
        ]),
      ).activeRuleIds,
    ).toEqual(["r1"]));
  it("does not silently choose exclusive strategies", () => {
    const t = track(
      patient,
      withRules([
        { ...rule, strategyGroupId: "g" },
        { ...rule, ruleId: "r2", strategyGroupId: "g" },
      ]),
    );
    expect(t.state.status).toBe("Conflict");
    expect(t.actions).toEqual([]);
  });
  it("uses policy-curated strategy and leaves compatible rules active", () => {
    const t = track(
      patient,
      withRules(
        [
          { ...rule, strategyGroupId: "g" },
          { ...rule, ruleId: "r2", strategyGroupId: "g" },
          {
            ...rule,
            ruleId: "r3",
            actions: [
              { actionId: "a3", kind: "information", text: "Independent" },
            ],
          },
        ],
        {
          primaryStrategies: [
            {
              topicId: "technical-a",
              trackId: "primary",
              strategyGroupId: "g",
              ruleId: "r2",
            },
          ],
        },
      ),
    );
    expect(t.activeRuleIds).toEqual(["r2", "r3"]);
    expect(t.primaryStrategyRuleId).toBe("r2");
    expect(t.actions).toHaveLength(2);
  });
  it("reports broken exclusion invariant as a conflict", () =>
    expect(
      track(
        patient,
        withRules([
          { ...rule, excludes: ["r2"] },
          { ...rule, ruleId: "r2" },
        ]),
      ).state.status,
    ).toBe("Conflict"));
  it("does not pick a more intense interval without domain semantics", () =>
    expect(
      track(
        patient,
        withRules([{ ...rule, compositionPolicy: "choose_shorter_interval" }]),
      ).state.status,
    ).toBe("ClinicalReviewRequired"));
  it("does not pick incompatible domain states", () => {
    const t = track(
      patient,
      withRules([rule, { ...rule, ruleId: "r2", outcome: "InFollowUp" }]),
    );
    expect(t.state.status).toBe("Conflict");
    expect(t.actions).toEqual([]);
  });
  it("deduplicates identical actions with all supporting rule IDs", () =>
    expect(
      track(patient, withRules([rule, { ...rule, ruleId: "r2" }])).actions[0]
        ?.ruleIds,
    ).toEqual(["r1", "r2"]));
  it("abstains on contradicting definitions for the same action ID", () =>
    expect(
      track(
        patient,
        withRules([
          rule,
          {
            ...rule,
            ruleId: "r2",
            actions: [
              { actionId: "a1", kind: "information", text: "Different" },
            ],
          },
        ]),
      ).state.status,
    ).toBe("Conflict"));
  it("keeps clinical judgment distinct from missing information and error", () => {
    const t = track(
      patient,
      withRules([{ ...rule, computability: "clinician_judgment_required" }]),
    );
    expect(t.state.status).toBe("ClinicalReviewRequired");
    expect(t.missingData).toEqual([]);
    expect(t.actions).toEqual([]);
  });
  it("preserves scientific action across resource availability changes", () => {
    const b = withRules([
      {
        ...rule,
        actions: [
          {
            actionId: "a1",
            kind: "recommendation",
            text: "Synthetic recommendation",
            resourceId: "technical-resource",
            unavailableRoute: "referral",
          },
        ],
      },
    ]);
    const available = run(patient, b, asOf, {
      "technical-resource": "available",
    }).plan.topics[0]!.actions[0]!;
    const unavailable = run(patient, b, asOf, {
      "technical-resource": "unavailable",
    }).plan.topics[0]!.actions[0]!;
    expect(available.text).toBe(unavailable.text);
    expect(available.kind).toBe(unavailable.kind);
    expect(unavailable.operational?.route).toBe("referral");
    expect(run(patient, b).plan.actions[0]?.operational?.availability).toBe(
      "unknown",
    );
  });
  it("ignores unrelated resource availability", () =>
    expect(run(patient, bundle, asOf, { unrelated: "unavailable" })).toEqual(
      run(patient),
    ));
});

describe("safe failure and determinism", () => {
  it("turns a controlled exception into explicit ComputationError", () => {
    const result = safeEvaluateTopic(
      "technical-a",
      createTrace(asOf, policy.policyId, bundle.rulesetVersion),
      () => {
        throw new Error("sensitive details");
      },
    );
    expect(result.tracks[0]!.state.status).toBe("ComputationError");
    expect(JSON.stringify(result)).not.toContain("sensitive details");
    expect(result.actions).toEqual([]);
  });
  it("isolates one domain arithmetic failure while preserving the rest of the plan", () => {
    const b = withRules([
      { ...scheduled, scheduleSpec: { unit: "years", amount: 9999 } },
      { ...rule, topicId: "technical-b", ruleId: "r2" },
    ]);
    const result = run({ ...patient, examHistory: [event("e")] }, b);
    expect(result.plan.topics.map((t) => t.tracks[0]!.state.status)).toEqual([
      "ComputationError",
      "Due",
    ]);
    expect(result.plan.actions).toHaveLength(1);
  });
  it("isolates temporal invalidity by domain", () => {
    const b = withRules([
      rule,
      { ...rule, topicId: "technical-b", ruleId: "r2" },
    ]);
    expect(
      run(
        { ...patient, examHistory: [event("future", "2027")] },
        b,
      ).plan.topics.map((t) => t.tracks[0]!.state.status),
    ).toEqual(["Indeterminate", "Due"]);
  });
  it("rejects inactive source before any action", () => {
    const t = track(patient, {
      ...bundle,
      sources: bundle.sources.map((s) => ({ ...s, documentStatus: "draft" })),
    });
    expect(t.state.status).toBe("ComputationError");
    expect(t.actions).toEqual([]);
  });
  it("refuses unknown policy without implicit fallback", () =>
    expect(() =>
      evaluatePatient({ patient, asOf, policyId: "absent", ruleset: bundle }),
    ).toThrow("Unknown policy"));
  it("requires a valid asOf rather than consulting the global clock", () =>
    expect(() =>
      evaluatePatient({
        ...{ patient, policyId: policy.policyId, ruleset: bundle },
        asOf: undefined,
      } as unknown as Parameters<typeof evaluatePatient>[0]),
    ).toThrow());
  it("ignores the global clock", () => {
    const result = run();
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2099-01-01T00:00:00Z"));
      expect(run()).toEqual(result);
    } finally {
      vi.useRealTimers();
    }
  });
  it("does not mutate caller inputs", () => {
    const input = structuredClone(patient),
      content = structuredClone(bundle);
    run(input, content);
    expect(input).toEqual(patient);
    expect(content).toEqual(bundle);
  });
  it("normalization is idempotent", () => {
    const p = PatientSchema.parse({
      ...patient,
      facts: [fact("z"), fact("a")],
      examHistory: [event("z"), event("a", "2024")],
    });
    expect(normalizePatient(normalizePatient(p))).toEqual(normalizePatient(p));
  });
  it("is deterministic for all six permutations of events and facts", () => {
    const events = [
        event("a", "2024"),
        event("b", "2025-01-01"),
        event("c", "2026-01-01"),
      ],
      facts = [fact("z"), fact("a"), fact("m")];
    const expected = run(
      { ...patient, examHistory: events, facts },
      scheduleBundle,
    );
    for (const indices of [
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ])
      expect(
        run(
          {
            ...patient,
            examHistory: indices.map((i) => events[i]),
            facts: indices.map((i) => facts[i]),
          },
          scheduleBundle,
        ),
      ).toEqual(expected);
  });
  it("is deterministic under content array permutations", () => {
    const b = withRules([rule, { ...rule, ruleId: "r2" }]);
    expect(
      run(patient, {
        ...b,
        rules: [...b.rules].reverse(),
        policies: b.policies.map((p) => ({
          ...p,
          ruleIds: [...p.ruleIds].reverse(),
        })),
      }),
    ).toEqual(run(patient, b));
  });
  it("validates final topic output and records all pipeline stages", () => {
    const t = track();
    expect(TopicEvaluationSchema.safeParse(run().plan.topics[0]).success).toBe(
      true,
    );
    expect(t.trace.stages).toHaveLength(13);
    expect(t.trace.engineVersion).not.toBe(t.trace.rulesetVersion);
  });
  it("does not label an empty policy as all clear", () => {
    const t = track(patient, {
      ...bundle,
      rules: [],
      policies: [{ ...policy, ruleIds: [] }],
    });
    expect(t.state.status).toBe("ClinicalReviewRequired");
    expect(
      run(patient, {
        ...bundle,
        rules: [],
        policies: [{ ...policy, ruleIds: [] }],
      }).plan.requiresAttention,
    ).toBe(true);
  });
  it("does not log patient data", () => {
    const spy = vi.spyOn(console, "log");
    try {
      run();
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
  it("cannot construct a Current track without scheduling evidence", () =>
    expect(
      TrackEvaluationSchema.safeParse({
        ...track(),
        state: {
          status: "Current",
          anchorEventId: "invented",
          ruleId: "r1",
        },
      }).success,
    ).toBe(false));
});

describe("schema isolation and input boundaries", () => {
  it("isolates a malformed clinical record to its own domain", () => {
    const b = withRules([
      rule,
      { ...rule, topicId: "technical-b", ruleId: "r2" },
    ]);
    const t = run({ ...patient, facts: [{ ...fact("f"), presence: false }] }, b)
      .plan.topics;
    expect(t.map((x) => x.tracks[0]!.state.status)).toEqual([
      "ComputationError",
      "Due",
    ]);
  });
  it("isolates malformed rule content to its own domain", () => {
    const b = withRules([
      rule,
      { ...rule, topicId: "technical-b", ruleId: "r2" },
    ]);
    const result = evaluatePatient({
      patient,
      asOf,
      policyId: policy.policyId,
      ruleset: { ...b, rules: [{ ...rule, stance: "invalid" }, b.rules[1]] },
    });
    expect(result.plan.topics.map((t) => t.tracks[0]!.state.status)).toEqual([
      "ComputationError",
      "Due",
    ]);
  });
  it("refuses ghost-field UI metadata with an ambiguous truthy value", () =>
    expect(
      track({
        ...patient,
        facts: [{ ...fact("f"), _ui: { enabled: "false" } }],
      }).state.status,
    ).toBe("ComputationError"));
  it("keeps missing criterion values indeterminate", () =>
    expect(
      track(
        { ...patient, facts: [fact("f")] },
        withRules([
          {
            ...rule,
            population: {
              facts: [{ conceptId: "f", presence: "yes", value: "needed" }],
            },
          },
        ]),
      ).state.status,
    ).toBe("Indeterminate"));
  it("does not call inactive-only content NotApplicable", () =>
    expect(
      track(patient, withRules([{ ...rule, lifecycleStatus: "draft" }])).state
        .status,
    ).toBe("ClinicalReviewRequired"));
  it.each([
    [39, "NotApplicable"],
    [40, "Due"],
    [41, "Due"],
  ] as const)("synthetic lower age boundary %s -> %s", (age, status) =>
    expect(
      track(
        { ...patient, context: { ageYears: age } },
        withRules([{ ...rule, population: { facts: [], minAge: 40 } }]),
      ).state.status,
    ).toBe(status),
  );
  it("isolates missing source content to the referencing topic", () => {
    const b = withRules([
      rule,
      {
        ...rule,
        topicId: "technical-b",
        ruleId: "r2",
        sourceRefs: [{ sourceId: "missing", locator: "test" }],
      },
    ]);
    expect(
      run(patient, b).plan.topics.map((t) => t.tracks[0]!.state.status),
    ).toEqual(["Due", "ComputationError"]);
  });
});
