import { describe, expect, it } from "vitest";
import type { RuleDefinition } from "../../src/model/content";
import {
  CCR_R2_PREP_R1_RECONFIRM_RULE_IDS,
  CCR_R2_SOURCE_IDS,
  ccrPhase6R1Ruleset,
  ccrR2PreparedRuleset,
} from "../../src/clinical/ccr";

function clinicalRuleShape(rule: RuleDefinition) {
  const {
    sourceRefs: _sourceRefs,
    reviewStatus: _reviewStatus,
    governance,
    ...clinical
  } = rule;
  return {
    ...clinical,
    governance: {
      author: governance.author,
      rationale: governance.rationale,
    },
  };
}

const byId = (rules: readonly RuleDefinition[]) =>
  new Map(rules.map((rule) => [rule.ruleId, rule]));

const strategyRuleIds = [
  "crc.intl.strategy.fit.45-49-grade-b",
  "crc.intl.strategy.fit.50-75-grade-a",
  "crc.intl.strategy.colonoscopy.45-49-grade-b",
  "crc.intl.strategy.colonoscopy.50-75-grade-a",
];

const populationRuleIds = [
  "crc.intl.population.45-49-grade-b",
  "crc.intl.population.50-75-grade-a",
  "crc.intl.population.76-85-grade-c",
];

const allowedSources = new Map([
  [
    "crc-policy-sus-oficial",
    new Set([
      CCR_R2_SOURCE_IDS.susOci2025,
      CCR_R2_SOURCE_IDS.susFitPortaria2026,
      CCR_R2_SOURCE_IDS.incaCcrProfessionals,
    ]),
  ],
  [
    "crc-policy-brasil-ampliado-ba-a",
    new Set(["crc-src-B12", "crc-src-S01"]),
  ],
  [
    "crc-policy-internacional-uspstf",
    new Set(["crc-src-I01", "crc-src-I03", "crc-src-I04", "crc-src-I05"]),
  ],
]);

describe("CCR pre-R2 technical corrections", () => {
  it("changes evidence/provenance governance only, not any clinical rule field", () => {
    const before = byId(ccrPhase6R1Ruleset.rules);
    const after = byId(ccrR2PreparedRuleset.rules);
    expect(after.size).toBe(before.size);

    for (const [ruleId, oldRule] of before) {
      const newRule = after.get(ruleId);
      expect(newRule).toBeDefined();
      expect(clinicalRuleShape(newRule!)).toEqual(clinicalRuleShape(oldRule));
    }

    expect(ccrR2PreparedRuleset.policies).toEqual(ccrPhase6R1Ruleset.policies);
    expect(ccrR2PreparedRuleset.terminology).toEqual(
      ccrPhase6R1Ruleset.terminology,
    );
  });

  it("resets exactly 15 affected rules for explicit R1 reconfirmation", () => {
    const affected = new Set<string>(CCR_R2_PREP_R1_RECONFIRM_RULE_IDS);
    expect(affected.size).toBe(15);
    const actual = ccrR2PreparedRuleset.rules
      .filter((rule) => rule.reviewStatus === "source_verified")
      .map((rule) => rule.ruleId)
      .sort();
    expect(actual).toEqual([...affected].sort());
  });

  it("moves USPSTF A/B/C grades to the population recommendation layer only", () => {
    const rules = byId(ccrR2PreparedRuleset.rules);

    for (const ruleId of strategyRuleIds) {
      const rule = rules.get(ruleId);
      expect(rule).toBeDefined();
      const uspstf = rule!.sourceRefs.find((ref) => ref.sourceId === "crc-src-I01");
      expect(uspstf).toBeDefined();
      expect(uspstf!.evidence).toBeUndefined();
    }

    for (const ruleId of populationRuleIds) {
      const rule = rules.get(ruleId);
      expect(rule).toBeDefined();
      const uspstf = rule!.sourceRefs.find((ref) => ref.sourceId === "crc-src-I01");
      expect(uspstf?.evidence?.gradeVerified).toBe(true);
      expect(["A", "B", "C"]).toContain(uspstf?.evidence?.rawGrade);
    }
  });

  it("reconciles B12 as the actual 2025 OCI edition and adds the 2026 normative FIT source", () => {
    const sources = new Map(
      ccrR2PreparedRuleset.sources.map((source) => [source.sourceId, source]),
    );
    const b12 = sources.get(CCR_R2_SOURCE_IDS.susOci2025);
    const b13 = sources.get(CCR_R2_SOURCE_IDS.susFitPortaria2026);
    const b14 = sources.get(CCR_R2_SOURCE_IDS.incaCcrProfessionals);

    expect(b12?.publicationYear).toBe(2025);
    expect(b12?.version).toContain("2ª edição");
    expect(b13?.documentTitle).toContain("5.215");
    expect(b13?.publicationYear).toBe(2026);
    expect(b13?.version).toContain("23/10/2026");
    expect(b14?.institution).toContain("INCA");
  });

  it("uses Portaria 5.215/2026 for the SUS age/FIT interval rules", () => {
    const rules = byId(ccrR2PreparedRuleset.rules);
    for (const ruleId of [
      "crc.sus.routine.under-50",
      "crc.sus.routine.fit.50-75",
      "crc.sus.routine.76-plus",
    ]) {
      expect(rules.get(ruleId)?.sourceRefs).toEqual([
        expect.objectContaining({
          sourceId: CCR_R2_SOURCE_IDS.susFitPortaria2026,
        }),
      ]);
    }
  });

  it("removes the ambiguous OCI source from SUS family/special-risk routing where INCA is the direct source", () => {
    const rules = byId(ccrR2PreparedRuleset.rules);
    for (const ruleId of [
      "crc.sus.family-status",
      "crc.sus.special-risk.prior-crc",
      "crc.sus.special-risk.colonic-ibd",
      "crc.sus.special-risk.hereditary-syndrome",
    ]) {
      const refs = rules.get(ruleId)?.sourceRefs ?? [];
      expect(refs.some((ref) => ref.sourceId === CCR_R2_SOURCE_IDS.incaCcrProfessionals)).toBe(true);
      expect(refs.some((ref) => ref.sourceId === CCR_R2_SOURCE_IDS.susOci2025)).toBe(false);
    }
  });

  it("keeps every policy inside an explicit post-correction source allowlist", () => {
    const rules = byId(ccrR2PreparedRuleset.rules);
    for (const policy of ccrR2PreparedRuleset.policies) {
      const allowlist = allowedSources.get(policy.policyId);
      expect(allowlist).toBeDefined();
      for (const ruleId of policy.ruleIds) {
        const rule = rules.get(ruleId);
        expect(rule).toBeDefined();
        for (const ref of rule!.sourceRefs) {
          expect(
            allowlist!.has(ref.sourceId),
            `${policy.policyId} -> ${ruleId} -> ${ref.sourceId}`,
          ).toBe(true);
        }
      }
    }
  });
});
