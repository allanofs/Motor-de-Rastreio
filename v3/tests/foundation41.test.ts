import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../src/engine/evaluatePatient";
import { RuleDefinitionSchema, SourceRefSchema } from "../src/model/content";
import type { RuleDefinition, Ruleset, Policy } from "../src/model/content";
import { ClinicalFactSchema, ExamRecordSchema } from "../src/model/patient";
import { TopicEvaluationSchema } from "../src/model/evaluation";
import { isCertainlyAfter } from "../src/engine/resolveHistory";
import type {
  DomainResolver,
  DomainResolverRegistry,
} from "../src/engine/extensions";
import { asOf, bundle, patient, policy, rule } from "./fixtures";
import { parsePartialDate as date } from "../src/model/dates";
const shared = {
  id: "shared-fact",
  conceptId: "shared-risk",
  category: "condition",
  presence: "yes",
};
const sharedRule: RuleDefinition = {
  ...rule,
  requiredKnownFacts: ["shared-risk"],
  population: { facts: [{ conceptId: "shared-risk", presence: "yes" }] },
};
function content(
  rules: RuleDefinition[],
  selections: Policy["primaryStrategies"] = [],
): Ruleset {
  return {
    ...bundle,
    rules,
    policies: [
      {
        ...policy,
        topicIds: [...new Set(rules.map((r) => r.topicId))],
        ruleIds: rules.map((r) => r.ruleId),
        primaryStrategies: selections,
      },
    ],
  };
}
function run(
  p: unknown = patient,
  rules: RuleDefinition[] = [rule],
  extensions: DomainResolverRegistry = [],
  selections: Policy["primaryStrategies"] = [],
) {
  return evaluatePatient({
    patient: p,
    ruleset: content(rules, selections),
    asOf,
    policyId: policy.policyId,
    extensions,
  });
}
const exam = (
  id: string,
  when = "2026-01-01",
  modality = "technical-exam",
  code = "accepted",
) =>
  ExamRecordSchema.parse({
    id,
    topicId: "technical-a",
    modality,
    status: "performed",
    date: date(when),
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

describe("patient-owned facts", () => {
  it("lets one global fact satisfy two independent domains without duplication", () => {
    const p = { ...patient, facts: [shared] },
      snapshot = structuredClone(p);
    const result = run(p, [
      sharedRule,
      { ...sharedRule, ruleId: "r2", topicId: "technical-b" },
    ]);
    expect(result.plan.topics.map((t) => t.tracks[0]!.state.status)).toEqual([
      "Due",
      "Due",
    ]);
    expect(result.traces.map((t) => t.factsUsed)).toEqual([
      ["shared-fact"],
      ["shared-fact"],
    ]);
    expect(p).toEqual(snapshot);
    expect(p.facts).toHaveLength(1);
  });
  it("accepts a global fact in the schema without topicId", () =>
    expect(ClinicalFactSchema.safeParse(shared).success).toBe(true));
  it("keeps optional local fact scope local", () => {
    const result = run(
      { ...patient, facts: [{ ...shared, topicId: "technical-a" }] },
      [sharedRule, { ...sharedRule, ruleId: "r2", topicId: "technical-b" }],
    );
    expect(result.plan.topics.map((t) => t.tracks[0]!.state.status)).toEqual([
      "Due",
      "Indeterminate",
    ]);
  });
  it("isolates malformed global presence by concept dependency", () => {
    const rules = [
      sharedRule,
      { ...sharedRule, ruleId: "r2", topicId: "technical-b" },
      { ...rule, ruleId: "r3", topicId: "technical-c" },
    ];
    expect(
      run(
        { ...patient, facts: [{ ...shared, presence: false }] },
        rules,
      ).plan.topics.map((t) => t.tracks[0]!.state.status),
    ).toEqual(["ComputationError", "ComputationError", "Due"]);
  });
  it("does not consult unrelated global facts", () =>
    expect(
      run({ ...patient, facts: [{ ...shared, presence: false }] }),
    ).toEqual(run()));
  it("fails explicitly when malformed global data cannot be routed safely", () => {
    const result = run(
      { ...patient, facts: [{ id: "unrouteable", presence: false }] },
      [rule, { ...rule, ruleId: "r2", topicId: "technical-b" }],
    );
    expect(
      result.plan.topics.every(
        (t) => t.tracks[0]!.state.status === "ComputationError",
      ),
    ).toBe(true);
    expect(result.plan.actions).toEqual([]);
  });
  it("does not turn a global unknown into no", () =>
    expect(
      run({ ...patient, facts: [{ ...shared, presence: "unknown" }] }, [
        sharedRule,
      ]).plan.topics[0]!.tracks[0]!.state.status,
    ).toBe("Indeterminate"));
  it("rejects contradictions between global and local observations instead of overriding either", () => {
    const result = run(
      {
        ...patient,
        facts: [
          shared,
          {
            ...shared,
            id: "local-fact",
            topicId: "technical-a",
            presence: "no",
          },
        ],
      },
      [sharedRule],
    );
    expect(result.plan.topics[0]!.tracks[0]!.missingData).toContain(
      "contradictory_facts:shared-risk",
    );
  });
  it("isolates semantic temporal errors in a global fact to its consumers", () => {
    const p = {
      ...patient,
      facts: [{ ...shared, effectiveDate: date("2027") }],
    };
    expect(
      run(p, [
        sharedRule,
        { ...rule, ruleId: "r2", topicId: "technical-b" },
      ]).plan.topics.map((t) => t.tracks[0]!.state.status),
    ).toEqual(["Indeterminate", "Due"]);
  });
  it("does not count one global projection as duplicate session records", () =>
    expect(
      run({ ...patient, facts: [shared] }, [
        sharedRule,
        { ...sharedRule, ruleId: "r2", topicId: "technical-b" },
      ]).plan.actions,
    ).toHaveLength(2));
  it("rejects genuinely duplicated global records", () =>
    expect(
      run({ ...patient, facts: [shared, shared] }, [sharedRule]).plan.topics[0]!
        .missingData,
    ).toContain("duplicate_patient_event_id"));
  it("does not let a hidden malformed global fact influence any track", () =>
    expect(
      run({
        ...patient,
        facts: [{ ...shared, presence: false, _ui: { enabled: false } }],
      }),
    ).toEqual(run()));
});

describe("history knowledge participates in scheduling", () => {
  const authorized = {
    ...scheduled,
    noQualifyingEventBehavior: { neverPerformed: "due" as const },
  };
  it.each([
    ["never_performed", "Due"],
    ["unknown", "Indeterminate"],
    ["known", "Indeterminate"],
  ] as const)(
    "%s produces %s only through the declared behavior",
    (knowledge, status) => {
      const t = run(
        { ...patient, historyKnowledge: { "technical-a": knowledge } },
        [authorized],
      ).plan.topics[0]!.tracks[0]!;
      expect(t.state.status).toBe(status);
      expect(t.scheduleInformation).toEqual([]);
    },
  );
  it("leaves absent/not-asked history Indeterminate", () =>
    expect(
      run({ ...patient, historyKnowledge: {} }, [authorized]).plan.topics[0]!
        .tracks[0]!.state.status,
    ).toBe("Indeterminate"));
  it("never_performed without explicit authorization is still Indeterminate", () =>
    expect(
      run(
        { ...patient, historyKnowledge: { "technical-a": "never_performed" } },
        [scheduled],
      ).plan.topics[0]!.tracks[0]!.state.status,
    ).toBe("Indeterminate"));
  it("supports an explicit indeterminate behavior", () =>
    expect(
      run(
        { ...patient, historyKnowledge: { "technical-a": "never_performed" } },
        [
          {
            ...scheduled,
            noQualifyingEventBehavior: { neverPerformed: "indeterminate" },
          },
        ],
      ).plan.topics[0]!.tracks[0]!.state.status,
    ).toBe("Indeterminate"));
  it("does not reinterpret unaccepted performed exams as never performed", () =>
    expect(
      run(
        {
          ...patient,
          examHistory: [
            exam("e", "2026-01-01", "technical-exam", "unaccepted"),
          ],
          historyKnowledge: { "technical-a": "never_performed" },
        },
        [authorized],
      ).plan.topics[0]!.missingData,
    ).toContain("contradictory_history_knowledge"));
  it("known history without a qualifying exam never produces Current or implicit Due", () => {
    const t = run(
      {
        ...patient,
        examHistory: [exam("e", "2026-01-01", "technical-exam", "unaccepted")],
        historyKnowledge: { "technical-a": "known" },
      },
      [authorized],
    ).plan.topics[0]!.tracks[0]!;
    expect(t.state.status).toBe("Indeterminate");
    expect(t.actions).toEqual([]);
  });
});

describe("independent tracks in one topic", () => {
  it("preserves Current A and Due B with automatic action B", () => {
    const rules = [
      { ...scheduled, trackId: "a" },
      { ...rule, ruleId: "r2", trackId: "b" },
    ];
    const t = run({ ...patient, examHistory: [exam("e")] }, rules).plan
      .topics[0]!;
    expect(t.tracks.map((track) => track.state.status)).toEqual([
      "Current",
      "Due",
    ]);
    expect(t.actions).toHaveLength(1);
    expect(t.actions[0]?.trackId).toBe("b");
    expect(TopicEvaluationSchema.safeParse(t).success).toBe(true);
    expect(t).not.toHaveProperty("pathwayState");
    expect(t.trace.stages).toEqual(t.tracks[0]!.trace.stages);
  });
  it("preserves review A and automatic action B", () => {
    const t = run(patient, [
      { ...rule, trackId: "a", computability: "clinician_judgment_required" },
      { ...rule, ruleId: "r2", trackId: "b" },
    ]).plan.topics[0]!;
    expect(t.tracks.map((track) => track.state.status)).toEqual([
      "ClinicalReviewRequired",
      "Due",
    ]);
    expect(t.actions[0]?.trackId).toBe("b");
  });
  it("does not let an incomplete track erase another track action", () => {
    const t = run(patient, [
      { ...sharedRule, trackId: "a" },
      { ...rule, ruleId: "r2", trackId: "b" },
    ]).plan.topics[0]!;
    expect(t.completeness).toBe("incomplete");
    expect(t.tracks[0]?.state.status).toBe("Indeterminate");
    expect(t.actions).toHaveLength(1);
  });
  it("keeps conflicting outputs within the same track in Conflict", () =>
    expect(
      run(patient, [rule, { ...rule, ruleId: "r2", outcome: "InFollowUp" }])
        .plan.topics[0]!.tracks[0]!.state.status,
    ).toBe("Conflict"));
  it("isolates a conflicting track and preserves a compatible track", () => {
    const t = run(patient, [
      { ...rule, trackId: "a" },
      { ...rule, ruleId: "r2", trackId: "a", outcome: "InFollowUp" },
      { ...rule, ruleId: "r3", trackId: "b" },
    ]).plan.topics[0]!;
    expect(t.tracks.map((track) => track.state.status)).toEqual([
      "Conflict",
      "Due",
    ]);
    expect(t.actions[0]?.trackId).toBe("b");
  });
  it("allows the same strategy group name in independent tracks", () => {
    const rules = [
      { ...rule, trackId: "a", strategyGroupId: "g" },
      { ...rule, trackId: "b", ruleId: "r2", strategyGroupId: "g" },
    ];
    expect(
      run(patient, rules).plan.topics[0]!.tracks.map((t) => t.state.status),
    ).toEqual(["Due", "Due"]);
  });
  it("selects strategies by topic, track and group", () => {
    const rules = [
      { ...rule, trackId: "a", strategyGroupId: "g" },
      { ...rule, trackId: "a", ruleId: "r2", strategyGroupId: "g" },
      { ...rule, trackId: "b", ruleId: "r3", strategyGroupId: "g" },
      { ...rule, trackId: "b", ruleId: "r4", strategyGroupId: "g" },
    ];
    const selections = [
      {
        topicId: "technical-a",
        trackId: "a",
        strategyGroupId: "g",
        ruleId: "r2",
      },
      {
        topicId: "technical-a",
        trackId: "b",
        strategyGroupId: "g",
        ruleId: "r3",
      },
    ];
    expect(
      run(patient, rules, [], selections).plan.topics[0]!.tracks.map(
        (t) => t.activeRuleIds,
      ),
    ).toEqual([["r2"], ["r3"]]);
  });
  it("does not fall back to another strategy when the curated one is inapplicable", () => {
    const rules = [
      { ...rule, strategyGroupId: "g" },
      {
        ...rule,
        ruleId: "r2",
        strategyGroupId: "g",
        population: { facts: [], minAge: 100 },
      },
    ];
    const selections = [
      {
        topicId: "technical-a",
        trackId: "primary",
        strategyGroupId: "g",
        ruleId: "r2",
      },
    ];
    expect(
      run(patient, rules, [], selections).plan.topics[0]!.tracks[0]!.state
        .status,
    ).toBe("Conflict");
  });
  it("rejects cross-track supersession instead of erasing an independent pathway", () =>
    expect(
      run(patient, [
        { ...rule, trackId: "a", supersedes: ["r2"] },
        { ...rule, trackId: "b", ruleId: "r2" },
      ]).plan.topics[0]!.tracks[0]!.state.status,
    ).toBe("ComputationError"));
  it("derives requiresAttention without assigning clinical priority", () => {
    const result = run({ ...patient, examHistory: [exam("e")] }, [
      { ...scheduled, trackId: "a" },
      { ...rule, ruleId: "r2", trackId: "b" },
    ]);
    expect(result.plan.requiresAttention).toBe(true);
    expect(result.plan.topics[0]).not.toHaveProperty("summaryState");
  });
  it("detects inconsistent topic action aggregation", () => {
    const t = run().plan.topics[0]!;
    expect(TopicEvaluationSchema.safeParse({ ...t, actions: [] }).success).toBe(
      false,
    );
  });
});

const sequenceResolver: DomainResolver = {
  resolverId: "technical-sequence",
  version: "test-1",
  topicId: "technical-a",
  trackId: "primary",
  requiredConceptIds: [],
  resolve(input) {
    const trigger = input.history.events.find(
      (e) => e.modality === "technical-trigger",
    );
    const resolution = input.history.events.find(
      (e) => e.modality === "technical-resolution",
    );
    return {
      state:
        trigger !== undefined &&
        resolution !== undefined &&
        isCertainlyAfter(resolution, trigger)
          ? { status: "HandedOff" }
          : {
              status: "Indeterminate",
              reason: "Technical sequence not established",
            },
      actionIds: [],
      decisionSupportIds: [],
      missingData: [],
      guardrails: [],
    };
  },
};
describe("pure explicit resolver registry", () => {
  const sequencePatient = {
    ...patient,
    examHistory: [
      exam("start", "2026-01-01", "technical-trigger"),
      exam("finish", "2026-02-01", "technical-resolution"),
    ],
  };
  it("resolves a technical sequence without any domain-specific engine import", () => {
    const t = run(sequencePatient, [rule], [sequenceResolver]).plan.topics[0]!
      .tracks[0]!;
    expect(t.state.status).toBe("HandedOff");
    expect(t.trace.extensions).toEqual([
      {
        resolverId: "technical-sequence",
        version: "test-1",
        trackId: "primary",
      },
    ]);
  });
  it("retains generic behavior when no resolver is registered", () =>
    expect(run(sequencePatient).plan.topics[0]!.tracks[0]!.state.status).toBe(
      "Due",
    ));
  it("is deterministic under history input permutations", () =>
    expect(
      run(
        {
          ...sequencePatient,
          examHistory: [...sequencePatient.examHistory].reverse(),
        },
        [rule],
        [sequenceResolver],
      ),
    ).toEqual(run(sequencePatient, [rule], [sequenceResolver])));
  it.each([
    ["2026-01-01", "2026-01-01"],
    ["2025", "2025-07"],
    ["2026-02-01", "2026-01-01"],
  ])("does not infer sequence for %s -> %s", (a, b) => {
    const t = run(
      {
        ...patient,
        examHistory: [
          exam("start", a, "technical-trigger"),
          exam("finish", b, "technical-resolution"),
        ],
      },
      [rule],
      [sequenceResolver],
    ).plan.topics[0]!.tracks[0]!;
    expect(t.state.status).toBe("Indeterminate");
  });
  it("captures a resolver exception and preserves a separate domain", () => {
    const broken = {
      ...sequenceResolver,
      resolve() {
        throw new Error("private details");
      },
    };
    const result = run(
      patient,
      [rule, { ...rule, topicId: "technical-b", ruleId: "r2" }],
      [broken],
    );
    expect(result.plan.topics.map((t) => t.tracks[0]!.state.status)).toEqual([
      "ComputationError",
      "Due",
    ]);
    expect(JSON.stringify(result)).not.toContain("private details");
  });
  it("also preserves sibling tracks after a resolver failure", () => {
    const result = run(
      patient,
      [rule, { ...rule, trackId: "second", ruleId: "r2" }],
      [
        {
          ...sequenceResolver,
          resolve() {
            throw new Error("technical fault");
          },
        },
      ],
    );
    expect(result.plan.topics[0]!.tracks.map((t) => t.state.status)).toEqual([
      "ComputationError",
      "Due",
    ]);
    expect(result.plan.actions).toHaveLength(1);
  });
  it("freezes cloned typed inputs and cannot mutate the caller", () => {
    const snapshot = structuredClone(sequencePatient);
    const resolver: DomainResolver = {
      ...sequenceResolver,
      resolve(input) {
        expect(Object.isFrozen(input.patient)).toBe(true);
        expect(Object.isFrozen(input.history.events)).toBe(true);
        expect(() =>
          Reflect.set(input.patient.context, "ageYears", 999),
        ).not.toThrow();
        expect(input.patient.context.ageYears).toBe(40);
        return sequenceResolver.resolve(input);
      },
    };
    expect(
      run(sequencePatient, [rule], [resolver]).plan.topics[0]!.tracks[0]!.state
        .status,
    ).toBe("HandedOff");
    expect(sequencePatient).toEqual(snapshot);
  });
  it("routes resolver-declared global concept dependencies", () => {
    const resolver: DomainResolver = {
      ...sequenceResolver,
      requiredConceptIds: ["shared-risk"],
      resolve(input) {
        return {
          ...sequenceResolver.resolve(input),
          state: input.patient.facts.some(
            (f) => f.conceptId === "shared-risk" && f.presence === "yes",
          )
            ? { status: "HandedOff" }
            : { status: "Indeterminate", reason: "missing technical concept" },
        };
      },
    };
    expect(
      run({ ...patient, facts: [shared] }, [rule], [resolver]).plan.topics[0]!
        .tracks[0]!.state.status,
    ).toBe("HandedOff");
    expect(
      run(
        { ...patient, facts: [{ ...shared, presence: false }] },
        [rule],
        [resolver],
      ).plan.topics[0]!.tracks[0]!.state.status,
    ).toBe("ComputationError");
  });
  it("rejects duplicate registrations for a track", () =>
    expect(() =>
      run(
        patient,
        [rule],
        [sequenceResolver, { ...sequenceResolver, resolverId: "other" }],
      ),
    ).toThrow("Multiple resolvers"));
  it("rejects a resolver that fabricates Current without qualifying evidence", () => {
    const resolver: DomainResolver = {
      ...sequenceResolver,
      resolve() {
        return {
          state: { status: "Current", anchorEventId: "invented", ruleId: "r1" },
          actionIds: [],
          decisionSupportIds: [],
          missingData: [],
          guardrails: [],
        };
      },
    };
    expect(
      run(patient, [rule], [resolver]).plan.topics[0]!.tracks[0]!.state.status,
    ).toBe("ComputationError");
  });
  it("rejects undeclared automatic actions from an extension", () => {
    const resolver: DomainResolver = {
      ...sequenceResolver,
      resolve(input) {
        return {
          ...sequenceResolver.resolve(input),
          state: { status: "Due" },
          actionIds: ["invented"],
        };
      },
    };
    expect(
      run(sequencePatient, [rule], [resolver]).plan.topics[0]!.tracks[0]!.state
        .status,
    ).toBe("ComputationError");
  });
  it("does not let a resolver override partial computability abstention", () => {
    let called = false;
    const resolver: DomainResolver = {
      ...sequenceResolver,
      resolve(input) {
        called = true;
        return sequenceResolver.resolve(input);
      },
    };
    expect(
      run(
        patient,
        [{ ...rule, computability: "partially_computable" }],
        [resolver],
      ).plan.topics[0]!.tracks[0]!.state.status,
    ).toBe("ClinicalReviewRequired");
    expect(called).toBe(false);
  });
  it("does not expose local resource availability to longitudinal logic", () => {
    const withResource = {
      ...rule,
      actions: [
        {
          actionId: "a1",
          kind: "recommendation" as const,
          text: "Technical action",
          resourceId: "synthetic-resource",
        },
      ],
    };
    const resolver: DomainResolver = {
      ...sequenceResolver,
      resolve(input) {
        expect(input.genericTrack.actions[0]).not.toHaveProperty("operational");
        return {
          ...sequenceResolver.resolve(input),
          state: { status: "Due" },
          actionIds: ["a1"],
        };
      },
    };
    const request = {
      patient,
      ruleset: content([withResource]),
      asOf,
      policyId: policy.policyId,
      extensions: [resolver],
    };
    const available = evaluatePatient({
      ...request,
      careSetting: { resources: { "synthetic-resource": "available" } },
    });
    const unavailable = evaluatePatient({
      ...request,
      careSetting: { resources: { "synthetic-resource": "unavailable" } },
    });
    expect(available.plan.topics[0]!.tracks[0]!.state.status).toBe("Due");
    expect(available.plan.actions).toHaveLength(1);
    expect(unavailable.plan.actions).toHaveLength(1);
    expect(available.plan.topics[0]!.tracks[0]!.state).toEqual(
      unavailable.plan.topics[0]!.tracks[0]!.state,
    );
    expect(available.plan.actions[0]?.text).toBe(
      unavailable.plan.actions[0]?.text,
    );
  });
});

describe("evidence and interpretation governance", () => {
  it("stores distinct grading systems verbatim without conversion", () => {
    const refs = [
      {
        sourceId: "technical-source",
        locator: "technical 1",
        evidence: {
          gradingSystem: "synthetic-letter-system",
          rawGrade: "B",
          gradeVerified: true,
        },
      },
      {
        sourceId: "technical-source",
        locator: "technical 2",
        evidence: {
          gradingSystem: "synthetic-strength-system",
          recommendationStrength: "strong",
          evidenceCertainty: "moderate",
          rawGrade: "strong / moderate",
          gradeVerified: true,
        },
      },
    ];
    const r = RuleDefinitionSchema.parse({ ...rule, sourceRefs: refs });
    const t = run(patient, [r]).plan.topics[0]!.tracks[0]!;
    expect(t.trace.sourceRefs).toEqual(refs);
    expect(r.stance).toBe("recommend");
  });
  it("does not derive stance from the raw grade", () => {
    const r = RuleDefinitionSchema.parse({
      ...rule,
      stance: "recommend_against",
      actions: [{ actionId: "avoid", kind: "avoid", text: "Technical avoid" }],
      sourceRefs: [
        {
          ...rule.sourceRefs[0],
          evidence: {
            gradingSystem: "synthetic",
            rawGrade: "B",
            gradeVerified: false,
          },
        },
      ],
    });
    expect(run(patient, [r]).plan.actions[0]?.kind).toBe("avoid");
    expect(r.stance).toBe("recommend_against");
  });
  it("keeps unverified grades explicitly unverified by default", () =>
    expect(
      SourceRefSchema.parse({
        sourceId: "technical-source",
        locator: "test",
        evidence: { gradingSystem: "synthetic", rawGrade: "B" },
      }).evidence?.gradeVerified,
    ).toBe(false));
  it.each(["unreviewed", "source_verified"] as const)(
    "rejects active interpretation with %s",
    (reviewStatus) =>
      expect(
        RuleDefinitionSchema.safeParse({ ...rule, reviewStatus }).success,
      ).toBe(false),
  );
  it("allows source-verified content to remain draft without pretending it is clinically reviewed", () =>
    expect(
      RuleDefinitionSchema.safeParse({
        ...rule,
        lifecycleStatus: "draft",
        reviewStatus: "source_verified",
        governance: {
          author: "technical",
          rationale: "synthetic draft",
          reviews: [],
        },
      }).success,
    ).toBe(true));
  it("rejects claimed review status without audit records", () =>
    expect(
      RuleDefinitionSchema.safeParse({
        ...rule,
        governance: { ...rule.governance, reviews: [] },
      }).success,
    ).toBe(false));
  it("requires two distinct reviewers for reviewed_by_2", () => {
    expect(
      RuleDefinitionSchema.safeParse({ ...rule, reviewStatus: "reviewed_by_2" })
        .success,
    ).toBe(false);
    expect(
      RuleDefinitionSchema.safeParse({
        ...rule,
        reviewStatus: "reviewed_by_2",
        governance: {
          ...rule.governance,
          reviews: [
            ...rule.governance.reviews,
            { reviewer: "second fictional reviewer", reviewedAt: asOf },
          ],
        },
      }).success,
    ).toBe(true);
  });
  it("rejects duplicate reviewer records", () =>
    expect(
      RuleDefinitionSchema.safeParse({
        ...rule,
        reviewStatus: "reviewed_by_2",
        governance: {
          ...rule.governance,
          reviews: [rule.governance.reviews[0], rule.governance.reviews[0]],
        },
      }).success,
    ).toBe(false));
  it("does not execute active source-verified content despite well-formed sources", () => {
    const result = evaluatePatient({
      patient,
      asOf,
      policyId: policy.policyId,
      ruleset: content([{ ...rule, reviewStatus: "source_verified" }]),
    });
    expect(result.plan.topics[0]!.tracks[0]!.state.status).toBe(
      "ComputationError",
    );
    expect(result.plan.actions).toEqual([]);
  });
  it.each(["monitoring", "surveillance"] as const)(
    "represents %s without adding a clinical rule",
    (clinicalRole) =>
      expect(
        RuleDefinitionSchema.safeParse({
          ...rule,
          lifecycleStatus: "draft",
          clinicalRole,
        }).success,
      ).toBe(true),
  );
  it("represents partial decision support separately from actions and guardrails", () => {
    const t = run(patient, [
      {
        ...rule,
        computability: "partially_computable",
        decisionSupport: [
          {
            considerationId: "technical-consideration",
            text: "Synthetic consideration for human review",
          },
        ],
      },
    ]).plan.topics[0]!.tracks[0]!;
    expect(t.state.status).toBe("ClinicalReviewRequired");
    expect(t.actions).toEqual([]);
    expect(t.guardrails).toEqual([]);
    expect(t.decisionSupport).toEqual([
      {
        considerationId: "technical-consideration",
        text: "Synthetic consideration for human review",
        ruleIds: ["r1"],
      },
    ]);
  });
  it("preserves partial support and another track automatic action together", () => {
    const t = run(patient, [
      {
        ...rule,
        trackId: "a",
        computability: "partially_computable",
        decisionSupport: [{ considerationId: "c", text: "Technical support" }],
      },
      { ...rule, ruleId: "r2", trackId: "b" },
    ]).plan.topics[0]!;
    expect(t.tracks[0]?.decisionSupport).toHaveLength(1);
    expect(t.actions).toHaveLength(1);
    expect(t.actions[0]?.trackId).toBe("b");
  });
  it.each(["choose_shorter_interval", "choose_higher_acuity"] as const)(
    "keeps %s in abstention",
    (compositionPolicy) =>
      expect(
        run(patient, [{ ...rule, compositionPolicy }], [sequenceResolver]).plan
          .topics[0]!.tracks[0]!.state.status,
      ).toBe("ClinicalReviewRequired"),
  );
});

it("does not route malformed global facts through inactive rule dependencies", () => {
  const result = run({ ...patient, facts: [{ ...shared, presence: false }] }, [
    { ...sharedRule, lifecycleStatus: "draft" },
  ]);
  expect(result.plan.topics[0]!.tracks[0]!.state.status).toBe(
    "ClinicalReviewRequired",
  );
});
it("does not route concept dependencies of an unused resolver track", () => {
  const result = run(
    { ...patient, facts: [{ ...shared, presence: false }] },
    [rule],
    [
      {
        ...sequenceResolver,
        trackId: "not-selected",
        requiredConceptIds: ["shared-risk"],
      },
    ],
  );
  expect(result.plan.topics[0]!.tracks[0]!.state.status).toBe("Due");
});
