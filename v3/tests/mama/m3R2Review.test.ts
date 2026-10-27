import { describe, expect, it } from "vitest";
import {
  MAMA_M3_R1_REVIEWER,
  MAMA_M3_R2_REVIEWED_AT,
  MAMA_M3_R2_REVIEWER_PUBLIC_ID,
  MAMA_M3_R2_RULESET_VERSION,
  mamaM3R1Ruleset,
  mamaM3R2Ruleset,
} from "../../src/clinical/mama";

function semanticRule(rule: (typeof mamaM3R1Ruleset.rules)[number]) {
  const { reviewStatus: _reviewStatus, governance, ...rest } = rule;
  const { reviews: _reviews, ...governanceWithoutReviews } = governance;
  return { ...rest, governance: governanceWithoutReviews };
}

describe("Mama M3 independent R2 governance snapshot", () => {
  it("promotes all 15 rules to reviewed_by_2 while lifecycle remains draft", () => {
    expect(mamaM3R2Ruleset.rulesetVersion).toBe(MAMA_M3_R2_RULESET_VERSION);
    expect(mamaM3R2Ruleset.rules).toHaveLength(15);
    for (const rule of mamaM3R2Ruleset.rules) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("reviewed_by_2");
      expect(rule.governance.reviews).toHaveLength(2);
      expect(rule.governance.reviews[1]).toEqual({
        reviewer: MAMA_M3_R2_REVIEWER_PUBLIC_ID,
        reviewedAt: MAMA_M3_R2_REVIEWED_AT,
      });
    }
  });

  it("uses a non-identifying public R2 handle distinct from the R1 reviewer", () => {
    expect(MAMA_M3_R2_REVIEWER_PUBLIC_ID).not.toBe(MAMA_M3_R1_REVIEWER);
    expect(MAMA_M3_R2_REVIEWER_PUBLIC_ID).toMatch(/^external-physician-r2-private-/);
  });

  it("changes governance only and preserves R1 clinical semantics", () => {
    expect(mamaM3R2Ruleset.rules.map(semanticRule)).toEqual(
      mamaM3R1Ruleset.rules.map(semanticRule),
    );
    expect(mamaM3R2Ruleset.policies).toEqual(mamaM3R1Ruleset.policies);
    expect(mamaM3R2Ruleset.sources).toEqual(mamaM3R1Ruleset.sources);
    expect(mamaM3R2Ruleset.terminology).toEqual(mamaM3R1Ruleset.terminology);
  });

  it("keeps the <40 M3.1 gap open despite full R2 approval", () => {
    const routineAgeRules = mamaM3R2Ruleset.rules.filter((rule) =>
      ["breast-routine-screening", "breast-population-status"].includes(rule.trackId),
    );
    expect(
      routineAgeRules.some(
        (rule) =>
          rule.population.maxAge !== undefined && rule.population.maxAge <= 39,
      ),
    ).toBe(false);
  });

  it("keeps provisional multi-source hard-exit provenance for later report review", () => {
    const priorCancer = mamaM3R2Ruleset.rules.find(
      (rule) => rule.ruleId === "breast.common.hard-exit.prior-breast-cancer",
    );
    expect(priorCancer).toBeDefined();
    expect(
      new Set(priorCancer?.sourceRefs.map((ref) => ref.sourceId)).size,
    ).toBeGreaterThan(1);
  });
});
