import { describe, expect, it } from "vitest";
import {
  MAMA_M3_R1_REVIEWER,
  MAMA_M3_R1_RULESET_VERSION,
  MAMA_M3_R1_REVIEWED_AT,
  mamaM3DraftRuleset,
  mamaM3R1Ruleset,
} from "../../src/clinical/mama";

function semanticRule(rule: (typeof mamaM3DraftRuleset.rules)[number]) {
  const { reviewStatus: _reviewStatus, governance, ...rest } = rule;
  const { reviews: _reviews, ...governanceWithoutReviews } = governance;
  return { ...rest, governance: governanceWithoutReviews };
}

describe("Mama M3 R1 governance snapshot", () => {
  it("preserves the original source-verified draft snapshot", () => {
    expect(mamaM3DraftRuleset.rulesetVersion).toBe("breast-0.1.0-m3-draft");
    expect(mamaM3DraftRuleset.rules).toHaveLength(15);
    for (const rule of mamaM3DraftRuleset.rules) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("source_verified");
      expect(rule.governance.reviews).toEqual([]);
    }
  });

  it("promotes all 15 rules only to reviewed_by_1 while keeping lifecycle draft", () => {
    expect(mamaM3R1Ruleset.rulesetVersion).toBe(MAMA_M3_R1_RULESET_VERSION);
    expect(mamaM3R1Ruleset.rules).toHaveLength(15);
    for (const rule of mamaM3R1Ruleset.rules) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("reviewed_by_1");
      expect(rule.governance.reviews).toEqual([
        { reviewer: MAMA_M3_R1_REVIEWER, reviewedAt: MAMA_M3_R1_REVIEWED_AT },
      ]);
    }
  });

  it("changes governance only and leaves clinical semantics byte-equivalent by structure", () => {
    expect(mamaM3R1Ruleset.rules.map(semanticRule)).toEqual(
      mamaM3DraftRuleset.rules.map(semanticRule),
    );
    expect(mamaM3R1Ruleset.policies).toEqual(mamaM3DraftRuleset.policies);
    expect(mamaM3R1Ruleset.sources).toEqual(mamaM3DraftRuleset.sources);
    expect(mamaM3R1Ruleset.terminology).toEqual(mamaM3DraftRuleset.terminology);
  });

  it("keeps the approved <40 gap open", () => {
    const routineAgeRules = mamaM3R1Ruleset.rules.filter((rule) =>
      ["breast-routine-screening", "breast-population-status"].includes(rule.trackId),
    );
    expect(
      routineAgeRules.some((rule) => rule.population.maxAge !== undefined && rule.population.maxAge <= 39),
    ).toBe(false);
  });

  it("keeps provisional multi-source provenance on common hard exits", () => {
    const priorCancer = mamaM3R1Ruleset.rules.find(
      (rule) => rule.ruleId === "breast.common.hard-exit.prior-breast-cancer",
    );
    expect(priorCancer).toBeDefined();
    expect(new Set(priorCancer?.sourceRefs.map((ref) => ref.sourceId)).size).toBeGreaterThan(1);
  });
});
