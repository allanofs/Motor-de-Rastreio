import { describe, expect, it } from "vitest";
import {
  ccrActions,
  ccrPhase65Rules,
  ccrPhase65Ruleset,
  ccrSources,
  ccrTerminology,
  susPhase65Policy,
  brasilAmpliadoPhase65Policy,
  internationalPhase65Policy,
} from "../../src/clinical/ccr";

const SOURCE_ALLOWLISTS = new Map<string, Set<string>>([
  [susPhase65Policy.policyId, new Set(["crc-src-B12"])],
  [
    brasilAmpliadoPhase65Policy.policyId,
    new Set(["crc-src-B12", "crc-src-S01"]),
  ],
  [
    internationalPhase65Policy.policyId,
    new Set([
      "crc-src-I01",
      "crc-src-I03",
      "crc-src-I04",
      "crc-src-I05",
    ]),
  ],
]);

const POLICY_PREFIXES = new Map<string, string>([
  [susPhase65Policy.policyId, "crc.sus."],
  [brasilAmpliadoPhase65Policy.policyId, "crc.ba-a."],
  [internationalPhase65Policy.policyId, "crc.intl."],
]);

function unique<T>(items: T[]) {
  return new Set(items).size === items.length;
}

describe("CCR Phase 6.6 final governance/source gate", () => {
  it("freezes the candidate as crc-0.5.0-phase6.5-draft until explicit human code review", () => {
    expect(ccrPhase65Ruleset.rulesetVersion).toBe("crc-0.5.0-phase6.5-draft");
    expect(
      ccrPhase65Ruleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "draft" &&
          rule.reviewStatus === "source_verified" &&
          rule.governance.reviews.length === 0,
      ),
    ).toBe(true);
  });

  it("has unique rule, source and action identities", () => {
    expect(unique(ccrPhase65Rules.map((rule) => rule.ruleId))).toBe(true);
    expect(unique(ccrSources.map((source) => source.sourceId))).toBe(true);
    expect(unique(ccrActions.map((action) => action.actionId))).toBe(true);
  });

  it("keeps every source reference resolvable, located and HTTPS-backed", () => {
    const sourceIds = new Set(ccrSources.map((source) => source.sourceId));
    for (const source of ccrSources) {
      expect(source.documentStatus).toBe("final");
      expect(source.url.startsWith("https://")).toBe(true);
      expect(source.lastVerifiedAt).toEqual({
        year: 2026,
        month: 10,
        day: 24,
      });
    }
    for (const rule of ccrPhase65Rules) {
      expect(rule.sourceRefs.length).toBeGreaterThan(0);
      for (const ref of rule.sourceRefs) {
        expect(sourceIds.has(ref.sourceId)).toBe(true);
        expect(ref.locator.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps each production rule owned by exactly one Phase 6.5 policy", () => {
    const policies = ccrPhase65Ruleset.policies;
    for (const rule of ccrPhase65Rules) {
      const owners = policies.filter((policy) => policy.ruleIds.includes(rule.ruleId));
      expect(owners, rule.ruleId).toHaveLength(1);
      const expectedPrefix = POLICY_PREFIXES.get(owners[0]!.policyId);
      expect(expectedPrefix).toBeDefined();
      expect(rule.ruleId.startsWith(expectedPrefix!)).toBe(true);
    }
  });

  it("keeps every policy reference resolvable and duplicate-free", () => {
    const ruleIds = new Set(ccrPhase65Rules.map((rule) => rule.ruleId));
    for (const policy of ccrPhase65Ruleset.policies) {
      expect(unique(policy.ruleIds)).toBe(true);
      for (const ruleId of policy.ruleIds) expect(ruleIds.has(ruleId)).toBe(true);
    }
  });

  it("enforces policy-local source allowlists with no silent international leakage", () => {
    const rules = new Map(ccrPhase65Rules.map((rule) => [rule.ruleId, rule]));
    for (const policy of ccrPhase65Ruleset.policies) {
      const allowlist = SOURCE_ALLOWLISTS.get(policy.policyId);
      expect(allowlist).toBeDefined();
      for (const ruleId of policy.ruleIds) {
        const rule = rules.get(ruleId);
        expect(rule).toBeDefined();
        for (const sourceRef of rule!.sourceRefs) {
          expect(
            allowlist!.has(sourceRef.sourceId),
            `${policy.policyId} -> ${ruleId} -> ${sourceRef.sourceId}`,
          ).toBe(true);
        }
      }
    }
  });

  it("does not include documentary-only ACS/new-test sources in the executable bundle", () => {
    const sourceIds = ccrSources.map((source) => source.sourceId);
    expect(sourceIds.some((id) => id.toLowerCase().includes("acs"))).toBe(false);
    const serialized = JSON.stringify(ccrPhase65Ruleset).toLowerCase();
    expect(serialized).not.toContain("blood-based");
    expect(serialized).not.toContain("rna test");
    expect(serialized).not.toContain("ctc");
  });

  it("uses only registered terminology for rule tracks and action resources", () => {
    const terminology = new Set(ccrTerminology);
    for (const rule of ccrPhase65Rules) {
      expect(terminology.has(rule.topicId)).toBe(true);
      expect(terminology.has(rule.trackId)).toBe(true);
      for (const action of rule.actions) {
        if (action.resourceId !== undefined) {
          expect(terminology.has(action.resourceId)).toBe(true);
        }
      }
    }
  });

  it("keeps evidence grades explicit only where encoded and never invents a grade for >85", () => {
    const over85 = ccrPhase65Rules.find(
      (rule) => rule.ruleId === "crc.intl.population.86-plus",
    );
    expect(over85).toBeDefined();
    expect(over85!.sourceRefs.every((ref) => ref.evidence === undefined)).toBe(true);

    for (const rule of ccrPhase65Rules) {
      for (const ref of rule.sourceRefs) {
        if (ref.evidence !== undefined) {
          expect(ref.evidence.gradeVerified).toBe(true);
          expect(ref.evidence.gradingSystem).toBe("USPSTF letter grades");
          expect(["A", "B", "C"]).toContain(ref.evidence.rawGrade);
        }
      }
    }
  });

  it("keeps special-risk review explicit and separate from confirmed handoff", () => {
    const specialRiskRules = ccrPhase65Rules.filter(
      (rule) => rule.trackId === "crc-special-risk-status",
    );
    expect(specialRiskRules).toHaveLength(12);
    expect(specialRiskRules.every((rule) => rule.outcome === "ClinicalReviewRequired")).toBe(true);
    expect(
      specialRiskRules.every((rule) =>
        rule.guardrails.some((guardrail) => guardrail.includes("HandedOff")),
      ),
    ).toBe(true);
  });
});
