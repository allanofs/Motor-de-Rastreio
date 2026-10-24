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
  ccrPhase61Ruleset,
  internationalPolicy,
  susPolicy,
} from "../../src/clinical/ccr";
import { CCR_IDS } from "../../src/clinical/ccr/terminology";

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

function patient(ageYears: number, examHistory: unknown[] = []) {
  return PatientSchema.parse({
    context: { ageYears },
    facts: averageRiskFacts,
    examHistory,
    historyKnowledge: { [CCR_IDS.topic]: "never_performed" },
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
          reviewer: "phase6.1-contract-test-only-not-a-clinical-review",
          reviewedAt: day("2026-10-24"),
        },
      ],
    },
  });
}

function previewRuleset(policyId: string): Ruleset {
  const policy = ccrPhase61Ruleset.policies.find((item) => item.policyId === policyId);
  if (policy === undefined) throw new Error(`Unknown test policy ${policyId}`);
  const selected = new Set(policy.ruleIds);
  return RulesetSchema.parse({
    ...ccrPhase61Ruleset,
    rules: ccrPhase61Ruleset.rules.map((rule) =>
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
    extensions: [],
  });
}

function onlyTrack(policyId: string, p: ReturnType<typeof patient>) {
  return run(policyId, p).plan.topics[0]!.tracks[0]!;
}

describe("CCR Phase 6.1 production contract remains draft-governed", () => {
  it("passes full bundle validation without activating clinical translations", () => {
    expect(validateBundle(ccrPhase61Ruleset)).toEqual([]);
    expect(
      ccrPhase61Ruleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "draft" &&
          rule.reviewStatus === "source_verified" &&
          rule.governance.reviews.length === 0,
      ),
    ).toBe(true);
  });

  it("contains exactly the three reviewed policy families", () => {
    expect(
      ccrPhase61Ruleset.policies.map((policy) => [policy.policyId, policy.family]),
    ).toEqual([
      [susPolicy.policyId, "sus_oficial"],
      [brasilAmpliadoPolicy.policyId, "br_ampliado"],
      [internationalPolicy.policyId, "internacional"],
    ]);
  });

  it("keeps every policy rule reference inside the CCR topic", () => {
    const byId = new Map(ccrPhase61Ruleset.rules.map((rule) => [rule.ruleId, rule]));
    for (const policy of ccrPhase61Ruleset.policies) {
      expect(policy.topicIds).toEqual([CCR_IDS.topic]);
      for (const ruleId of policy.ruleIds)
        expect(byId.get(ruleId)?.topicId).toBe(CCR_IDS.topic);
    }
  });

  it("uses final sources with explicit verification dates", () => {
    expect(ccrPhase61Ruleset.sources.every((source) => source.documentStatus === "final")).toBe(true);
    expect(
      ccrPhase61Ruleset.sources.every(
        (source) => JSON.stringify(source.lastVerifiedAt) === JSON.stringify(asOf),
      ),
    ).toBe(true);
  });

  it("preserves verified USPSTF A/B/C grades without inventing a grade after 85", () => {
    const refs = ccrPhase61Ruleset.rules.flatMap((rule) =>
      rule.sourceRefs.map((ref) => ({ ruleId: rule.ruleId, ref })),
    );
    expect(
      refs.find((item) => item.ruleId === "crc.intl.population.45-49-grade-b")?.ref.evidence?.rawGrade,
    ).toBe("B");
    expect(
      refs.find((item) => item.ruleId === "crc.intl.population.50-75-grade-a")?.ref.evidence?.rawGrade,
    ).toBe("A");
    expect(
      refs.find((item) => item.ruleId === "crc.intl.population.76-85-grade-c")?.ref.evidence?.rawGrade,
    ).toBe("C");
    expect(
      refs.find((item) => item.ruleId === "crc.intl.population.86-plus")?.ref.evidence,
    ).toBeUndefined();
  });
});

describe("CCR Phase 6.1 test-only semantic preview", () => {
  it("SUS: never screened at age 60 can become Due for biennial FIT", () => {
    const track = onlyTrack(susPolicy.policyId, patient(60));
    expect(track.state.status).toBe("Due");
    expect(track.actions.map((action) => action.actionId)).toContain("crc-action-fit-screening");
  });

  it("SUS: a valid negative FIT one year ago can be Current", () => {
    const p = PatientSchema.parse({
      ...patient(60),
      examHistory: [
        {
          id: "fit-2025",
          topicId: CCR_IDS.topic,
          modality: CCR_IDS.modalities.fit,
          status: "performed",
          date: date("2025-10-24"),
          result: { status: "final", code: CCR_IDS.results.fitNegative },
          quality: "adequate",
          completeness: "not_applicable",
          resolutionInformation: "sufficient",
        },
      ],
      historyKnowledge: { [CCR_IDS.topic]: "known" },
    });
    expect(onlyTrack(susPolicy.policyId, p).state.status).toBe("Current");
  });

  it("SUS: age 76 is outside new routine rather than automatic shared decision", () =>
    expect(onlyTrack(susPolicy.policyId, patient(76)).state.status).toBe("NotApplicable"));

  it("BA-A: age 47 is SharedDecision, not automatic Due", () =>
    expect(onlyTrack(brasilAmpliadoPolicy.policyId, patient(47)).state.status).toBe("SharedDecision"));

  it("BA-A: age 60 can be Due for the default biennial FIT contract", () =>
    expect(onlyTrack(brasilAmpliadoPolicy.policyId, patient(60)).state.status).toBe("Due"));

  it("BA-A: age 76 requires clinical review rather than automatic extension", () =>
    expect(onlyTrack(brasilAmpliadoPolicy.policyId, patient(76)).state.status).toBe("ClinicalReviewRequired"));

  it("International: age 47 maps to the Grade B population recommendation", () => {
    const track = onlyTrack(internationalPolicy.policyId, patient(47));
    expect(track.state.status).toBe("Due");
    expect(track.activeRuleIds).toEqual(["crc.intl.population.45-49-grade-b"]);
  });

  it("International: age 60 maps to the Grade A population recommendation", () => {
    const track = onlyTrack(internationalPolicy.policyId, patient(60));
    expect(track.state.status).toBe("Due");
    expect(track.activeRuleIds).toEqual(["crc.intl.population.50-75-grade-a"]);
  });

  it("International: age 80 is SharedDecision and not automatic Due", () =>
    expect(onlyTrack(internationalPolicy.policyId, patient(80)).state.status).toBe("SharedDecision"));

  it("International: age 86 stops routine population screening without inventing Grade D", () => {
    const track = onlyTrack(internationalPolicy.policyId, patient(86));
    expect(track.state.status).toBe("NotApplicable");
    expect(track.actions.map((action) => action.actionId)).toContain(
      "crc-action-avoid-routine-after-85",
    );
  });
});
