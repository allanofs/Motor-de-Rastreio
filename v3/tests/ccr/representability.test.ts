import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import {
  AS_OF,
  OFFER_COLONOSCOPY,
  OFFER_FIT,
  TOPIC,
  colonoscopyCoverageRule,
  exam,
  fact,
  fitFollowupResolver,
  fitFollowupRule,
  fitRoutineRule,
  futureFitResolver,
  futureFitRule,
  handoffResolver,
  makeBundle,
  makePolicy,
  makeRule,
  patient,
  routineFitSuppressor,
  run,
  specialistFollowupRule,
} from "./representability.fixtures";

function topic(result: ReturnType<typeof evaluatePatient>) {
  return result.plan.topics[0]!;
}

function track(result: ReturnType<typeof evaluatePatient>, trackId: string) {
  const found = topic(result).tracks.find((item) => item.trackId === trackId);
  if (found === undefined) throw new Error(`Missing track ${trackId}`);
  return found;
}

describe("CCR Phase 6.0 representability sentinels", () => {
  it("R01 — confirmed never_performed can produce Due only through declared authorization", () => {
    const policy = makePolicy("r01-sus", "sus_oficial", [fitRoutineRule]);
    const result = run({
      rules: [fitRoutineRule],
      policy,
      patient: patient({ historyKnowledge: "never_performed" }),
    });
    expect(track(result, "fit-routine").state.status).toBe("Due");
    expect(result.plan.actions.map((action) => action.actionId)).toEqual([
      OFFER_FIT.actionId,
    ]);
  });

  it("R02 — recent valid negative FIT is Current and emits no routine action", () => {
    const policy = makePolicy("r02-sus", "sus_oficial", [fitRoutineRule]);
    const result = run({
      rules: [fitRoutineRule],
      policy,
      patient: patient({
        examHistory: [exam("fit-negative-recent", "2026-01-10", "fit", "fit-negative")],
      }),
    });
    expect(track(result, "fit-routine").state.status).toBe("Current");
    expect(result.plan.actions).toEqual([]);
  });

  it("R03 — expired negative FIT becomes Due without an invented grace period", () => {
    const policy = makePolicy("r03-sus", "sus_oficial", [fitRoutineRule]);
    const result = run({
      rules: [fitRoutineRule],
      policy,
      patient: patient({
        examHistory: [exam("fit-negative-old", "2023-10-23", "fit", "fit-negative")],
      }),
    });
    expect(track(result, "fit-routine").state.status).toBe("Due");
    expect(result.plan.actions.map((action) => action.actionId)).toEqual([
      OFFER_FIT.actionId,
    ]);
  });

  it("R04 — unresolved positive FIT suppresses routine FIT and leaves colonoscopy follow-up active", () => {
    const rules = [fitRoutineRule, fitFollowupRule];
    const policy = makePolicy("r04-sus", "sus_oficial", rules);
    const result = run({
      rules,
      policy,
      patient: patient({
        examHistory: [exam("fit-positive", "2026-10-01", "fit", "fit-positive")],
      }),
      extensions: [routineFitSuppressor, fitFollowupResolver],
    });
    expect(track(result, "fit-routine").state.status).toBe("NotApplicable");
    expect(track(result, "fit-followup").state.status).toBe("InFollowUp");
    expect(result.plan.actions.map((action) => action.actionId)).toEqual([
      OFFER_COLONOSCOPY.actionId,
    ]);
  });

  it("R05 — a later negative FIT does not resolve an earlier positive FIT", () => {
    const rules = [fitRoutineRule, fitFollowupRule];
    const policy = makePolicy("r05-sus", "sus_oficial", rules);
    const result = run({
      rules,
      policy,
      patient: patient({
        examHistory: [
          exam("fit-positive", "2026-01-10", "fit", "fit-positive"),
          exam("fit-negative-later", "2026-06-10", "fit", "fit-negative"),
        ],
      }),
      extensions: [routineFitSuppressor, fitFollowupResolver],
    });
    expect(track(result, "fit-routine").state.status).toBe("NotApplicable");
    expect(track(result, "fit-followup").state.status).toBe("InFollowUp");
    expect(result.plan.actions.map((action) => action.actionId)).toEqual([
      OFFER_COLONOSCOPY.actionId,
    ]);
  });

  it("R06 — a later high-quality normal colonoscopy can close FIT+ while supplying current coverage", () => {
    const rules = [colonoscopyCoverageRule, fitFollowupRule];
    const policy = makePolicy("r06-international", "internacional", rules);
    const result = run({
      rules,
      policy,
      patient: patient({
        examHistory: [
          exam("fit-positive", "2025-08-01", "fit", "fit-positive"),
          exam("colonoscopy-normal", "2026-02-01", "colonoscopy", "colonoscopy-normal"),
        ],
      }),
      extensions: [fitFollowupResolver],
    });
    expect(track(result, "colonoscopy-coverage").state.status).toBe("Current");
    expect(track(result, "fit-followup").state.status).toBe("NotApplicable");
    expect(result.plan.requiresAttention).toBe(false);
    expect(result.plan.actions).toEqual([]);
  });

  it("R07 — inadequate colonoscopy does not resolve a positive FIT", () => {
    const rules = [fitFollowupRule];
    const policy = makePolicy("r07-international", "internacional", rules);
    const result = run({
      rules,
      policy,
      patient: patient({
        examHistory: [
          exam("fit-positive", "2025-08-01", "fit", "fit-positive"),
          exam(
            "colonoscopy-inadequate",
            "2026-02-01",
            "colonoscopy",
            "colonoscopy-normal",
            { quality: "inadequate" },
          ),
        ],
      }),
      extensions: [fitFollowupResolver],
    });
    expect(track(result, "fit-followup").state.status).toBe("InFollowUp");
    expect(result.plan.actions[0]?.actionId).toBe(OFFER_COLONOSCOPY.actionId);
  });

  it("R08 — same-day FIT+ and colonoscopy never gain invented chronology", () => {
    const rules = [fitFollowupRule];
    const policy = makePolicy("r08-international", "internacional", rules);
    const result = run({
      rules,
      policy,
      patient: patient({
        examHistory: [
          exam("fit-positive", "2026-02-01", "fit", "fit-positive"),
          exam("colonoscopy-same-day", "2026-02-01", "colonoscopy", "colonoscopy-normal"),
        ],
      }),
      extensions: [fitFollowupResolver],
    });
    expect(track(result, "fit-followup").state.status).toBe("InFollowUp");
  });

  it("R09 — unknown screening history never becomes Due by presumption", () => {
    const policy = makePolicy("r09-sus", "sus_oficial", [fitRoutineRule]);
    const result = run({
      rules: [fitRoutineRule],
      policy,
      patient: patient({ historyKnowledge: "unknown" }),
    });
    expect(track(result, "fit-routine").state.status).toBe("Indeterminate");
    expect(result.plan.actions).toEqual([]);
  });

  it("R10 — future FIT preference does not erase current colonoscopy coverage", () => {
    const rules = [colonoscopyCoverageRule, futureFitRule];
    const policy = makePolicy("r10-international", "internacional", rules);
    const result = run({
      rules,
      policy,
      patient: patient({
        facts: [fact("future-fit", "future-strategy-fit", "yes")],
        examHistory: [
          exam("colonoscopy-current", "2024-04-12", "colonoscopy", "colonoscopy-normal"),
        ],
      }),
      extensions: [futureFitResolver],
    });
    expect(track(result, "colonoscopy-coverage").state.status).toBe("Current");
    expect(track(result, "future-fit-strategy").state.status).toBe("NotApplicable");
    expect(result.plan.actions).toEqual([]);
    expect(result.plan.requiresAttention).toBe(false);
  });

  it("R11 — the same 47-year-old can legitimately differ across SUS, BA-A and International policies", () => {
    const susRule = makeRule("sus-age-50-75", "screening", {
      population: { minAge: 50, maxAge: 75, facts: [] },
      actions: [{ actionId: "sus-screen", kind: "recommendation", text: "technical SUS screen" }],
      outcome: "Due",
    });
    const baRule = makeRule("ba-age-45-49", "screening", {
      population: { minAge: 45, maxAge: 49, facts: [] },
      stance: "shared_decision",
      actions: [{ actionId: "ba-discuss", kind: "discussion", text: "technical BA discussion" }],
      outcome: "SharedDecision",
    });
    const internationalRule = makeRule("intl-age-45-49", "screening", {
      population: { minAge: 45, maxAge: 49, facts: [] },
      actions: [{ actionId: "intl-screen", kind: "recommendation", text: "technical international screen" }],
      outcome: "Due",
    });
    const policies = [
      makePolicy("sus-policy", "sus_oficial", [susRule]),
      makePolicy("ba-policy", "br_ampliado", [baRule]),
      makePolicy("international-policy", "internacional", [internationalRule]),
    ];
    const ruleset = makeBundle([susRule, baRule, internationalRule], policies);
    const p = patient({ ageYears: 47 });
    const statuses = policies.map((policy) =>
      evaluatePatient({
        patient: p,
        ruleset,
        asOf: AS_OF,
        policyId: policy.policyId,
      }).plan.topics[0]!.tracks[0]!.state.status,
    );
    expect(statuses).toEqual(["NotApplicable", "SharedDecision", "Due"]);
  });

  it("R12 — international age 80 is SharedDecision, never automatic Due", () => {
    const rule = makeRule("intl-age-76-85", "screening", {
      population: { minAge: 76, maxAge: 85, facts: [] },
      stance: "shared_decision",
      actions: [{ actionId: "older-discussion", kind: "discussion", text: "technical individualized discussion" }],
      outcome: "SharedDecision",
    });
    const policy = makePolicy("r12-international", "internacional", [rule]);
    const result = run({ rules: [rule], policy, patient: patient({ ageYears: 80 }) });
    expect(track(result, "screening").state.status).toBe("SharedDecision");
    expect(result.plan.actions[0]?.kind).toBe("discussion");
  });

  it("R13 — family history can be automated internationally while SUS/BA abstain", () => {
    const familyCriterion = {
      facts: [{ conceptId: "family-fdr-under-60", presence: "yes" as const }],
    };
    const internationalRule = makeRule("intl-family-fdr-young", "family", {
      population: familyCriterion,
      actions: [{ actionId: "family-colonoscopy", kind: "recommendation", text: "technical family colonoscopy pathway" }],
      outcome: "Due",
    });
    const susRule = makeRule("sus-family-review", "family", {
      population: familyCriterion,
      actions: [],
      outcome: "ClinicalReviewRequired",
    });
    const baRule = makeRule("ba-family-review", "family", {
      population: familyCriterion,
      actions: [],
      outcome: "ClinicalReviewRequired",
    });
    const policies = [
      makePolicy("r13-international", "internacional", [internationalRule]),
      makePolicy("r13-sus", "sus_oficial", [susRule]),
      makePolicy("r13-ba", "br_ampliado", [baRule]),
    ];
    const ruleset = makeBundle([internationalRule, susRule, baRule], policies);
    const p = patient({
      facts: [fact("family", "family-fdr-under-60", "yes", "family_history")],
    });
    const statuses = policies.map((policy) =>
      evaluatePatient({
        patient: p,
        ruleset,
        asOf: AS_OF,
        policyId: policy.policyId,
      }).plan.topics[0]!.tracks[0]!.state.status,
    );
    expect(statuses).toEqual(["Due", "ClinicalReviewRequired", "ClinicalReviewRequired"]);
  });

  it("R14 — unknown family history can preserve minimum screening need while blocking strategy finalization", () => {
    const needRule = makeRule("minimum-screening-need", "screening-need", {
      population: { minAge: 50, maxAge: 75, facts: [] },
      actions: [{ actionId: "screening-needed", kind: "recommendation", text: "technical: screening is indicated" }],
      outcome: "Due",
    });
    const strategyRule = makeRule("strategy-needs-family", "strategy", {
      requiredKnownFacts: ["family-history-status"],
      actions: [OFFER_FIT],
      outcome: "Due",
    });
    const rules = [needRule, strategyRule];
    const policy = makePolicy("r14-sus", "sus_oficial", rules);
    const result = run({
      rules,
      policy,
      patient: patient({
        ageYears: 62,
        facts: [fact("family-unknown", "family-history-status", "unknown", "family_history")],
      }),
    });
    expect(track(result, "screening-need").state.status).toBe("Due");
    expect(track(result, "strategy").state.status).toBe("Indeterminate");
    expect(topic(result).completeness).toBe("incomplete");
    expect(result.plan.actions.map((action) => action.actionId)).toEqual([
      "screening-needed",
    ]);
  });

  it("R15 — referral alone remains InFollowUp; confirmed assumption of care becomes HandedOff", () => {
    const policy = makePolicy("r15-policy", "internacional", [specialistFollowupRule]);
    const referred = run({
      rules: [specialistFollowupRule],
      policy,
      patient: patient({ facts: [fact("referral", "referral-sent", "yes")] }),
      extensions: [handoffResolver],
    });
    const handedOff = run({
      rules: [specialistFollowupRule],
      policy,
      patient: patient({ facts: [fact("handoff", "handoff-confirmed", "yes")] }),
      extensions: [handoffResolver],
    });
    expect(track(referred, "specialist-followup").state.status).toBe("InFollowUp");
    expect(referred.plan.actions.map((action) => action.actionId)).toEqual([
      "continue-followup",
    ]);
    expect(track(handedOff, "specialist-followup").state.status).toBe("HandedOff");
    expect(handedOff.plan.actions).toEqual([]);
  });

  it("R16 — unavailable local resource changes operational route, not the clinical Due state", () => {
    const policy = makePolicy("r16-sus", "sus_oficial", [fitRoutineRule]);
    const result = run({
      rules: [fitRoutineRule],
      policy,
      patient: patient({ historyKnowledge: "never_performed" }),
      careSetting: { resources: { "fit-resource": "unavailable" } },
    });
    const evaluated = result.plan.actions.find(
      (action) => action.actionId === OFFER_FIT.actionId,
    );
    expect(track(result, "fit-routine").state.status).toBe("Due");
    expect(evaluated?.operational).toEqual({
      availability: "unavailable",
      route: "referral",
    });
  });

  it("keeps Phase 6.0 scoped to the synthetic CCR topic", () => {
    expect(TOPIC).toBe("ccr-representability");
  });
});
